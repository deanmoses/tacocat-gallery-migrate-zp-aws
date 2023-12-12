//
// Output the local SQLite database as a DynamoDB file
//

import { writeFile } from 'fs/promises';
import { getAllItems } from './lib/db.js';
import { convertToDDBitem } from './lib/toDDB.js';

const ddbItems = [];
const items = await getAllItems();
console.log('items');
console.dir(items, { depth: null });
for (const item of items) {
    const ddbItem = convertToDDBitem(item);
    ddbItems.push({ Item: ddbItem });
}
writeFile('ddb/ddb.json', JSON.stringify(ddbItems, null, 2));
