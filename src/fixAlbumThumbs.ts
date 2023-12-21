//
// For every album in the local SQLite database, check if the thumbnail matches
// an actual image entry.  If it doesn't, try alternate extensions: jpeg JPG png gif
//
// I need this because I imported the album thumbnails via URL, and the URL is
// *always* jpg because that's what the Zenphoto image resizer created
//

import { AwsAlbumItem, AwsGalleryItem } from './lib/awsTypes.js';
import { getItem, getItems } from './lib/db.js';
import { isValidAlbumPath, isValidImagePath } from './lib/galleryPathUtils.js';
import { logMajor, logMinor } from './lib/printUtils.js';

//const pathPrefixes: string[] = ['/194', '/196', '/197', '/198', '/199', '/200']; // these are all fine
const pathPrefixes: string[] = ['/2010/', '/2011/', '/2012/', '/2013/', '/2014/'];
// /2014/10-16/IMG_2523.jpg
// const pathPrefixes: string[] = ['/2015/']; // one /2015/02-15/reunion22.JPG - FIXED MANUALLY IN DYNAMODB
// 2016 okay
// 2017 one /2017/06-04/bethesda_chorus2.jpg - FIXED MANUALLY IN DYNAMODB
// 2018 okay
//const pathPrefixes: string[] = ['/2019/']; // one /2019/07-19/julie.jpg - FIXED MANUALLY IN DYNAMODB
//const pathPrefixes: string[] = ['/2020/']; // fine
//const pathPrefixes: string[] = ['/2021/']; // fine
//const pathPrefixes: string[] = ['/2022/']; //two: /2022/07-28/fields.jpg, /2022/11-01/h_nimes.jpg - FIXED MANUALLY IN DYNAMODB
//const pathPrefixes: string[] = ['/2023/']; // one /2023/05-22/surf1.jpg - FIXED MANUALLY IN DYNAMODB

for (const pathPrefix of pathPrefixes) {
    const items = await getItems(pathPrefix);
    await processItems(items);
    logMajor(`Processed ${pathPrefix}: ${items.length} items`);
}
logMajor(`Finished ${pathPrefixes.join(', ')}`);

async function processItems(items: AwsGalleryItem[]): Promise<void> {
    if (!items) throw new Error(`Missing items`);
    for (const item of items) {
        if (!item.parentPath) throw new Error(`Missing parentPath for ${item}`);
        if (!item.itemName) throw new Error(`Missing itemName for ${item}`);
        const path = toAwsPath(item.parentPath, item.itemName);
        if (!item.itemType) throw new Error(`Missing itemType for ${path}`);
        if ('image' === item.itemType) continue;
        const album = item as AwsAlbumItem;
        if (!album.thumbnail) throw new Error(`Missing thumbnail for ${path}`);
        const thumbnail = JSON.parse(album.thumbnail as unknown as string); // I messed up and stored the thumbnail stringified
        if (!thumbnail.path) throw new Error(`Missing thumbnail path for ${path}`);
        const child = await findImage(thumbnail.path);
        if (!child) throw new Error(`${path}: did not find thumbnail entry for ${path}`);
        logMinor(`${path}: found image ${child.itemName}`);
    }
}

/** Look for image in alternative extensions as well */
async function findImage(imagePath: string): Promise<AwsGalleryItem | undefined> {
    let child = await getItem(imagePath);
    if (child) return child;
    console.log(`${imagePath}: not found`);
    const itemNameWithoutExt = imagePath.replace(/\.[^/.]+$/, '');
    for (const ext of ['jpeg', 'png', 'gif', 'JPG']) {
        const alternateImagePath = itemNameWithoutExt + '.' + ext;
        child = await getItem(alternateImagePath);
        if (child) {
            //console.log(`${imagePath}: found ${child.itemName}`);
            return child;
        } else {
            //console.log(`${imagePath}: not found ${alternateImagePath}`);
        }
    }
}

function toAwsPath(parentPath: string, itemName: string): string {
    let path = parentPath + itemName;
    if (isValidImagePath(path)) return path;
    path = path + '/';
    if (!isValidAlbumPath(path)) throw new Error(`Invalid path: ${path}`);
    return path;
}
