import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const TABLE_NAME = 'tags';

async function openDb() {
    return open({
        filename: 'db/tags.db',
        driver: sqlite3.Database,
    });
}

export type TaggedItem = {
    path: string;
    tags: string[];
};

/** Get the tags under the specified path */
export async function getByPath(rootPath: string): Promise<TaggedItem[]> {
    const db = await openDb();
    const results = await db.all(`SELECT path, tags FROM ${TABLE_NAME} WHERE path LIKE ?`, rootPath + '%');
    return results.map((result) => {
        return {
            path: result.path,
            tags: result.tags.split(','),
        } satisfies TaggedItem;
    });
}
