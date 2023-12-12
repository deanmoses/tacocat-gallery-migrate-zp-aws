import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { AwsGalleryItem } from './awsTypes.js';

const TABLE_NAME = 'GalleryItems';

/** Retrieve entire database */
export async function getAllItems(): Promise<AwsGalleryItem[]> {
    const db = await openDb();
    const results = await db.all(`SELECT json FROM ${TABLE_NAME}`);
    console.log('getAllItems', results);
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

function getPath(item: AwsGalleryItem) {
    return item.itemType === 'image' ? item.parentPath + item.itemName : item.parentPath + item.itemName + '/';
}

async function openDb() {
    return open({
        filename: 'db/gallery.db',
        driver: sqlite3.Database,
    });
}
