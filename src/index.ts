//
// Fetch albums from Zenphoto and upseert them into SQLite
//

import { upsertItems } from './lib/db.js';
import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';
import { isValidAlbumPath, isValidYearAlbumPath } from './lib/galleryPathUtils.js';
import { convertAlbum } from './lib/toAwsFromZp.js';
import { ZenphotoAlbum } from './lib/zenphotoTypes.js';

const albumPaths: string[] = ['/2001/'];

await processAlbums(albumPaths);

async function processAlbums(albumPaths: string[] | undefined) {
    if (!albumPaths) return;
    for (const albumPath of albumPaths) {
        console.log(`Fetching ${albumPath}`);
        if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: ${albumPath}`);
        const zpAlbum = await getAlbumFromZenphoto(albumPath);
        const awsItems = convertAlbum(zpAlbum);
        await upsertItems(awsItems);
        if (isValidYearAlbumPath(albumPath)) {
            const dayAlbumPaths = getDayAlbumPaths(zpAlbum);
            if (!dayAlbumPaths) throw new Error(`Year album ${albumPath} has no day albums`);
            processAlbums(dayAlbumPaths);
        }
        console.log(`Upserted ${albumPath} - ${awsItems.length} items`);
    }
}

function getDayAlbumPaths(zpAlbum: ZenphotoAlbum): string[] | undefined {
    if (!zpAlbum.albums) return;
    return zpAlbum.albums.map((album) => {
        if (!album.path) throw new Error(`Album ${album.title} has no path`);
        return `/${album.path}/`;
    });
}
