import { AwsAlbum, AwsGalleryItem, AwsImageItem, Rectangle } from './awsTypes.js';
import { getParentAndNameFromPath, isValidAlbumPath, isValidImagePath } from './galleryPathUtils.js';
import { ZenphotoAlbum, ZenphotoImageItem } from './zenphotoTypes.js';

/** Convert from Zenphoto to DynamoDB album */
export function convertAlbum(zpAlbum: ZenphotoAlbum): AwsGalleryItem[] {
    if (!zpAlbum.path) throw new Error(`Album has no path: ${zpAlbum}`);
    if (!zpAlbum.date) throw new Error(`Album has no date: ${zpAlbum}`);
    const albumPath = convertAlbumPath(zpAlbum.path);
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: ${albumPath}`);
    const pathParts = getParentAndNameFromPath(albumPath);
    if (!pathParts.name) throw new Error(`Album has no name: ${zpAlbum}`);
    let items: AwsGalleryItem[] = [];
    const awsAlbum: AwsAlbum = {
        itemType: 'album',
        parentPath: pathParts.parent,
        itemName: pathParts.name,
        createdOn: convertDate(zpAlbum.date),
        updatedOn: zpAlbum.date_updated ? convertDate(zpAlbum.date_updated) : convertDate(zpAlbum.date),
        published: !!zpAlbum.published,
    };
    if (zpAlbum.customdata) awsAlbum.summary = zpAlbum.customdata;
    if (zpAlbum.desc) awsAlbum.description = zpAlbum.desc;
    items.push(awsAlbum);
    if (!!zpAlbum.images) items = items.concat(convertChildImages(zpAlbum.images));
    return items;
}

/** Convert from 2001/12-31 to /2001/12-31/ */
function convertAlbumPath(albumPath: string): string {
    return `/${albumPath}/`;
}

/** Convert from 2001/12-31/image.jpg to /2001/12-31/image.jpg */
function convertImagePath(imagePath: string): string {
    return `/${imagePath}`;
}

/** Convert from 1009785600 to ISO string */
function convertDate(zpDate: number): string {
    if (!zpDate) throw new Error(`Invalid date: ${zpDate}`);
    return new Date(zpDate * 1000).toISOString();
}

/** Convert album's images */
function convertChildImages(zpImages: ZenphotoImageItem[]): AwsImageItem[] {
    return zpImages?.map((zpImage) => convertImage(zpImage)) || [];
}

/** Convert an image */
export function convertImage(zpImage: ZenphotoImageItem): AwsImageItem {
    if (!zpImage.path) throw new Error(`Image has no path: ${zpImage}`);
    if (!zpImage.date) throw new Error(`Image has no date: ${zpImage}`);
    const imagePath = convertImagePath(zpImage.path);
    if (!isValidImagePath(imagePath)) throw new Error(`Invalid image path: ${imagePath}`);
    const pathParts = getParentAndNameFromPath(imagePath);
    if (!pathParts.parent) throw new Error(`Image has no parent: ${zpImage}`);
    if (!pathParts.name) throw new Error(`Image has no name: ${zpImage}`);
    if (!zpImage.width) throw new Error(`Image has no width: ${zpImage}`);
    if (!zpImage.height) throw new Error(`Image has no height: ${zpImage}`);
    const awsImage: AwsImageItem = {
        itemType: 'image',
        parentPath: pathParts.parent,
        itemName: pathParts.name,
        createdOn: convertDate(zpImage.date),
        updatedOn: zpImage.date_updated ? convertDate(zpImage.date_updated) : convertDate(zpImage.date),
        dimensions: {
            width: zpImage.width,
            height: zpImage.height,
        },
    };
    if (zpImage.title) awsImage.title = convertTitle(zpImage.title);
    if (zpImage.desc) awsImage.description = zpImage.desc;
    const thumbnail = convertCrop(zpImage.url_thumb);
    if (thumbnail) awsImage.thumbnail = thumbnail;
    return awsImage;
}

/**
 * Convert to crop info from path like:
 * /zenphoto/cache/2001/12-31/image_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752
 * /zenphoto/cache/2001/12-31/all_dressed_up_w200_h200_cw960_ch960_cx61_cy0_thumb.jpg?cached=1419239961
 */
export function convertCrop(zpThumbUrl: string | undefined): Rectangle | undefined {
    if (!zpThumbUrl) return undefined;
    const z = /^\/zenphoto\/cache\/.*_cw(?<width>\d+)_ch(?<height>\d+)(_cx(?<x>\d+))?(_cy(?<y>\d+))?_thumb\./i.exec(
        zpThumbUrl,
    );
    if (!z || !z.groups) return undefined;
    const { width, height, x, y } = z.groups;
    if (!width || !height || '200' === width || '200' === height) return undefined;
    const crop: Rectangle = {
        width: parseInt(width),
        height: parseInt(height),
    };
    if (x) crop.x = parseInt(x);
    if (y) crop.y = parseInt(y);
    return crop;
}

/** Strip any HTML from the Zenphoto title */
function convertTitle(zpTitle: string): string {
    return convertHtmlEntities(zpTitle); // I think titles just have HTML entities and not tags
}

/** Convert any HTML entities from the specified string */
function convertHtmlEntities(html: string): string {
    return html
        .replace('&amp;', '&')
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&quot;', '"')
        .replace('&apos;', "'");
}
