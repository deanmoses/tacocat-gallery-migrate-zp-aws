//
// Output the local SQLite database as a DynamoDB JSON Lines (JSONL) file
// This script is meant to run on my local laptop
//

import { createWriteStream } from 'fs';
import { getAllItems } from './lib/db.js';
import { convertToDDBitem } from './lib/toDDB.js';
import jsonlines from 'jsonlines';
import { AwsImageItem } from './lib/awsTypes.js';
import { logMajor } from './lib/printUtils.js';

const writableStream = createWriteStream('ddb/ddb.jsonl');
const stringifier = jsonlines.stringify();
stringifier.pipe(writableStream);
const items = await getAllItems();
for (const item of items) {
    if ('image' === item.itemType && !(item as AwsImageItem).versionId) {
        throw new Error(`Missing versionId for ${item.parentPath}${item.itemName}`);
    }
    const ddbItem = convertToDDBitem(item);
    stringifier.write({ Item: ddbItem });
}
stringifier.end();
logMajor(`Output ${items.length} items to ddb/ddb.jsonl`);
