//
// Fetch albums from Zenphoto and upseert them into SQLite
//

import { upsertItems } from './lib/db.js';
import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';
import { convertAlbum } from './lib/toAwsFromZp.js';

const albumPaths: string[] = [
    '/2001/12-31/',
    '/2001/12-23/',
    '/2001/12-16/',
    '/2001/12-14/',
    '/2001/12-13/',
    '/2001/12-09/',
];
let itemCount = 0;
for (const albumPath of albumPaths) {
    console.log(`Fetching ${albumPath}`);
    const zpAlbum = await getAlbumFromZenphoto(albumPath);
    const awsItems = convertAlbum(zpAlbum);
    await upsertItems(awsItems);
    console.log(`Upserted ${albumPath} - ${awsItems.length} items`);
    itemCount += awsItems.length;
}
console.log(`Upserted ${albumPaths.length} albums, ${itemCount} items`);
