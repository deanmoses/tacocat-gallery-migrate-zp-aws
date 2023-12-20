//
// Output the local SQLite database as a DynamoDB JSON Lines (JSONL) file
// This script is meant to run on my local laptop
//

import { createWriteStream } from 'fs';
import { getAllItems } from './lib/db.js';
import { convertToDDBitem } from './lib/toDDB.js';
import jsonlines from 'jsonlines';
import { AwsAlbumItem, AwsImageItem } from './lib/awsTypes.js';
import { logMajor } from './lib/printUtils.js';

const writableStream = createWriteStream('ddb/ddb.jsonl');
const stringifier = jsonlines.stringify();
stringifier.pipe(writableStream);
try {
    const items = await getAllItems();
    for (const item of items) {
        if (!item.parentPath) throw new Error(`Missing parentPath for ${item}`);
        if (!item.itemName) throw new Error(`Missing itemName for ${item}`);
        const path = item.parentPath + item.itemName;
        if (!item.itemType) throw new Error(`Missing itemType for ${path}`);
        if ('image' === item.itemType && !(item as AwsImageItem).versionId)
            throw new Error(`Missing versionId for ${path}`);
        if ('album' === item.itemType) {
            const album = item as AwsAlbumItem;
            if (!album.thumbnail) throw new Error(`Missing thumbnail for ${path}`);
            album.thumbnail = JSON.parse(album.thumbnail as unknown as string); // I messed up and stored the thumbnail stringified
            if (!(item as AwsAlbumItem).thumbnail?.path) {
                console.log(`Missing thumbnail for ${path}`, item);
                throw new Error(`Missing thumbnail for ${path}`);
            }
        }
        const ddbItem = convertToDDBitem(item);
        stringifier.write({ Item: ddbItem });
    }
    logMajor(`Output ${items.length} items to ddb/ddb.jsonl`);
} finally {
    stringifier.end();
}
