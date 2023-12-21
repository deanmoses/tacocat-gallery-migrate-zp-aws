import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { AwsGalleryItem } from './awsTypes.js';
import { isValidAlbumPath, isValidImagePath } from './galleryPathUtils.js';

const TABLE_NAME = 'GalleryItems';

/** Get the paths under the specified path */
export async function getPaths(rootPath: string): Promise<string[]> {
    const db = await openDb();
    const results = await db.all(`SELECT path FROM ${TABLE_NAME} WHERE path LIKE ?`, rootPath + '%');
    return results.map((result) => result.path);
}

/** Retrieve entire database */
export async function getAllItems(): Promise<AwsGalleryItem[]> {
    const db = await openDb();
    const results = await db.all(`SELECT json FROM ${TABLE_NAME}`);
    const items: AwsGalleryItem[] = [];
    for (const result of results) {
        items.push(JSON.parse(result.json));
    }
    return items;
}

/** Retrieve all items under the specified path */
export async function getItems(pathPrefix: string): Promise<AwsGalleryItem[]> {
    const db = await openDb();
    const results = await db.all(`SELECT json FROM ${TABLE_NAME} WHERE path LIKE ?`, pathPrefix + '%');
    const items: AwsGalleryItem[] = [];
    for (const result of results) {
        items.push(JSON.parse(result.json));
    }
    return items;
}

/** Retrieve item */
export async function getItem(path: string): Promise<AwsGalleryItem> {
    const db = await openDb();
    const results = await db.get(`SELECT json FROM ${TABLE_NAME} WHERE path = ?`, path);
    return !results?.json ? undefined : JSON.parse(results.json);
}

/** Set the S3 versionId of an existing image entry */
export async function setVersionId(imagePath: string, versionId: string): Promise<void> {
    if (!isValidImagePath(imagePath)) throw new Error(`Invalid image path: [${imagePath}]`);
    const db = await openDb();
    const results = await db.run(
        `UPDATE ${TABLE_NAME} SET json = json_set(json, '$.versionId', ?) WHERE path = ?`,
        versionId,
        imagePath,
    );
    if (results?.changes !== 1) throw new Error(`No rows updated for [${imagePath}]`);
}

/** Set the thumbnail of an existing album entry */
export async function setAlbumThumb(albumPath: string, imagePath: string): Promise<void> {
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: [${albumPath}]`);
    if (!isValidImagePath(imagePath)) throw new Error(`Invalid image path: [${imagePath}]`);
    const albumThumb = { path: imagePath };
    const db = await openDb();
    const results = await db.run(
        `UPDATE ${TABLE_NAME} SET json = json_set(json, '$.thumbnail', ?) WHERE path = ?`,
        albumThumb,
        albumPath,
    );
    if (results?.changes !== 1) throw new Error(`No rows updated for [${albumPath}]`);
}

/** Create or update mutiple items */
export async function upsertItems(items: AwsGalleryItem[]): Promise<void> {
    const db = await openDb();
    for (const item of items) {
        await db.run(`REPLACE INTO ${TABLE_NAME} (path, json) VALUES(?,?)`, getPath(item), JSON.stringify(item));
    }
}

/** Create or update single item */
export async function upsertItem(item: AwsGalleryItem): Promise<void> {
    const db = await openDb();
    await db.run(`REPLACE INTO ${TABLE_NAME} (path, json) VALUES(?,?)`, getPath(item), JSON.stringify(item));
}

/** Get the path of the specified item */
function getPath(item: AwsGalleryItem): string {
    return item.itemType === 'image' ? item.parentPath + item.itemName : item.parentPath + item.itemName + '/';
}

async function openDb() {
    return open({
        filename: 'db/gallery.db',
        driver: sqlite3.Database,
    });
}
