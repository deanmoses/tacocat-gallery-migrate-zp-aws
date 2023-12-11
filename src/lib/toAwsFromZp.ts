import { AwsAlbum, AwsImageItem } from './awsTypes.js';
import { getParentAndNameFromPath, isValidAlbumPath, isValidImagePath } from './galleryPathUtils.js';
import { ZenphotoAlbum, ZenphotoImageItem } from './zenphotoTypes.js';

/** Convert from Zenphoto to DynamoDB album */
export function convertAlbum(zpAlbum: ZenphotoAlbum): AwsAlbum {
    if (!zpAlbum.path) throw new Error(`Album has no path: ${zpAlbum}`);
    if (!zpAlbum.date) throw new Error(`Album has no date: ${zpAlbum}`);
    if (!zpAlbum.date_updated) throw new Error(`Album has no date_updated: ${zpAlbum}`);
    const albumPath = convertAlbumPath(zpAlbum.path);
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: ${albumPath}`);
    const pathParts = getParentAndNameFromPath(albumPath);
    if (!pathParts.name) throw new Error(`Album has no name: ${zpAlbum}`);

    const awsAlbum: AwsAlbum = {
        itemType: 'album',
        parentPath: pathParts.parent,
        itemName: pathParts.name,
        createdOn: convertDate(zpAlbum.date),
        updatedOn: convertDate(zpAlbum.date_updated),
    };
    if (zpAlbum.customdata) awsAlbum.summary = zpAlbum.customdata;
    if (zpAlbum.desc) awsAlbum.description = zpAlbum.desc;
    if (zpAlbum.images) awsAlbum.children = convertChildImages(zpAlbum);
    if (zpAlbum.albums) awsAlbum.children = convertChildAlbums(zpAlbum);
    return awsAlbum;
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
function convertChildImages(zpAlbum: ZenphotoAlbum): AwsImageItem[] {
    return zpAlbum.images?.map((zpImage) => convertImage(zpImage)) || [];
}

/** Convert album's child albums */
function convertChildAlbums(zpAlbum: ZenphotoAlbum): AwsAlbum[] {
    console.log('toAwsFromZpChildAlbums', zpAlbum);
    return []; // todo implement
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
        versionId: 'TODO', // TODO: figure out versionId
        itemType: 'image',
        parentPath: pathParts.parent,
        itemName: pathParts.name,
        createdOn: convertDate(zpImage.date),
        dimensions: {
            width: zpImage.width,
            height: zpImage.height,
        },
    };
    if (zpImage.title) awsImage.title = convertTitle(zpImage.title);
    if (zpImage.desc) awsImage.description = zpImage.desc;
    if (zpImage.date_updated) awsImage.updatedOn = convertDate(zpImage.date_updated);

    // todo thumbnail crop info from url_thumb: '/zenphoto/cache/2001/12-31/alicia_gives_feeding_lessons_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752'
    return awsImage;
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
