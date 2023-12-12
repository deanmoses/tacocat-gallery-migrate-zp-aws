import { upsertItems } from './lib/db.js';
import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';
import { convertAlbum } from './lib/toAwsFromZp.js';

const albumPath: string = '/2001/12-31/';
const zpAlbum = await getAlbumFromZenphoto(albumPath);
const awsItems = convertAlbum(zpAlbum);
await upsertItems(awsItems);
console.log(`Upserted ${awsItems.length} items`);
