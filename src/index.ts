import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';

const albumPath: string = '/2001/12-31/';
const album = await getAlbumFromZenphoto(albumPath);
console.dir(album, { depth: null });
//console.dir(toAwsFromZpAlbum(album)); //, { depth: null });
