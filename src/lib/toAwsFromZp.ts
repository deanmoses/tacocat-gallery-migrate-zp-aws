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
        published: 'published' in zpAlbum ? !!zpAlbum.published : true,
    };
    if (!awsAlbum.published) console.warn(`Album not published: ${albumPath}`);
    if (zpAlbum.customdata) awsAlbum.summary = zpAlbum.customdata;
    if (zpAlbum.desc) awsAlbum.description = convertDescription(zpAlbum.desc);
    items.push(awsAlbum);
    if (!!zpAlbum.images) items = items.concat(convertChildImages(zpAlbum.images));
    return items;
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
    else console.warn(`Image has no title: ${imagePath}`);
    if (zpImage.desc) awsImage.description = convertDescription(zpImage.desc);
    const thumbnail = convertCrop(zpImage.url_thumb);
    if (thumbnail) awsImage.thumbnail = thumbnail;
    if (!zpImage.path.endsWith('.jpg')) console.warn(`Image is not .jpg: ${zpImage.path}`);
    return awsImage;
}

/** Convert from 2001/12-31 to /2001/12-31/ */
function convertAlbumPath(albumPath: string): string {
    return `/${albumPath}/`;
}

/**
 * Convert from
 *  2001/12-31/image.jpg  to /2001/12-31/image.jpg
 */
export function convertImagePath(imagePath: string): string {
    return `/${imagePath}`;
}

/** Convert from 1009785600 to ISO string */
function convertDate(zpDate: number): string {
    if (!zpDate) throw new Error(`Invalid date: ${zpDate}`);
    return new Date(zpDate * 1000).toISOString();
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

/**
 * Extract image path from URLs like:
 *   /zenphoto/cache/1943/01-01/1943-soublins_w200_h200_cw1493_ch1493_cx985_cy407_thumb.jpg?t=1418458445
 *   /zenphoto/cache/1969/07-20/marriage08_200_cw200_ch200_thumb.jpg?t=1418719978
 *   /zenphoto/cache/1977/12-01/1977-Lu_200_w200_h200_cw200_ch200_thumb.jpg?cached=1548530166
 *   /zenphoto/zp-core/i.php?a=1975/12-31&i=1975-relatives-christmas.jpg&s=200&w=200&h=200&cw=200&ch=200&q=85&c=1&t=1&wmk=!&check=7d296a2339b1244fc14ea3790d0e0b801f91e3fa
 */
export function extractAlbumThumbnailImage(zpThumbUrl: string): string {
    if (!zpThumbUrl) throw new Error(`No thumbnail URL`);
    // let regex =
    //     /^\/zenphoto\/cache(?<thumbPath>(?:(?!_\d\d\d|_w\d\d\d|_h\d\d\d|_cw\d\d\d|_ch\d\d\d|_cx\d\d\d|_cy\d\d\d).)+)(_\d\d\d)?(_w\d+)?(_h\d+)?(_cw\d+)?(_ch\d+)?(_cx\d+)?(_cy\d+)?(_thumb)\.(?<ext>[a-z]+)\?/i;

    let regex =
        /^\/zenphoto\/cache(?<thumbPath>[^.]+?)(_\d\d\d)?(_w\d+)?(_h\d+)?(_cw\d+)?(_ch\d+)?(_cx\d+)?(_cy\d+)?(_thumb)\.(?<ext>[a-z]+)\?/i;
    let z = regex.exec(zpThumbUrl);
    if (!!z && !!z.groups) {
        const { thumbPath, ext } = z.groups;
        if (!thumbPath) throw new Error(`No thumbPath: ${zpThumbUrl}`);
        if (!ext) throw new Error(`No extension: ${zpThumbUrl}`);
        const imagePath = `${thumbPath}.${ext}`;
        return imagePath;
    } else {
        regex = /^\/zenphoto\/zp-core\/i\.php\?a=(?<thumbPath>[^&]+)&i=(?<filename>[^&]+)&/i;
        z = regex.exec(zpThumbUrl);
        if (!z || !z.groups) throw new Error(`Did not extract image path from URL: ${zpThumbUrl}`);
        const { thumbPath, filename } = z.groups;
        if (!thumbPath) throw new Error(`No thumbPath: ${zpThumbUrl}`);
        if (!filename) throw new Error(`No filename: ${zpThumbUrl}`);
        const imagePath = `/${thumbPath}/${filename}`;
        return imagePath;
    }
}

/** Strip any HTML from the Zenphoto title */
function convertTitle(zpTitle: string): string {
    return convertHtmlEntities(zpTitle); // I think titles just have HTML entities and not tags
}

/** Convert any HTML entities from the specified string */
function convertHtmlEntities(html: string): string {
    return html
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&apos;', "'");
}

/** Fix up the description in various ways */
export function convertDescription(zpDescription: string): string {
    // TODO: <a href="http://tacocat.com/pix/2002/06/03/html/jasper1.htm"> -- not sure these exist, keep an eye out
    if (zpDescription.includes('tacocat.com/pix/')) console.warn(`Description contains /pix/ URL: ${zpDescription}`);
    return zpDescription
        .replaceAll('&nbsp;</p>', '</p>') // In this situation, the &nbsp; isn't separating words and can be eliminated
        .replaceAll('<br></p>', '</p>')
        .replaceAll('<br></li>', '</li>')
        .replaceAll('&nbsp;', ' ') // needs the ' ' because sometimes the &nbsp; is separatating words
        .replaceAll('&apos;', "'") // apparently &apos; is only for XML not HTML!
        .replaceAll('\r\r', ' ')
        .replaceAll('\r\n', ' ')
        .replaceAll('href="https://pix.tacocat.com/#', 'href="/') // <a href="https://pix.tacocat.com/#2001/10-21/dan_jen_wedding01.jpg">
        .replaceAll('href="#', 'href="/'); // <a href="#2018/06-29">, <a href="#2004/12-05/tub1.jpg">
}
