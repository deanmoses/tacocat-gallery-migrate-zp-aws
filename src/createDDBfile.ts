//
// Output the local SQLite database as a DynamoDB JSON Lines (JSONL) file
//

import { createWriteStream } from 'fs';
import { getAllItems } from './lib/db.js';
import { convertToDDBitem } from './lib/toDDB.js';
import jsonlines from 'jsonlines';

const writableStream = createWriteStream('ddb/ddb.jsonl');
const stringifier = jsonlines.stringify();
stringifier.pipe(writableStream);
const items = await getAllItems();
for (const item of items) {
    const ddbItem = convertToDDBitem(item);
    stringifier.write({ Item: ddbItem });
}
stringifier.end();
