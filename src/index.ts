//
// Fetch albums from Zenphoto and upseert them into SQLite
//

import { upsertItems } from './lib/db.js';
import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';
import { isValidAlbumPath, isValidDayAlbumPath } from './lib/galleryPathUtils.js';
import { convertAlbum } from './lib/toAwsFromZp.js';
import { ZenphotoAlbum } from './lib/zenphotoTypes.js';

const albumPaths: string[] = ['/2017/']; //, '/2016/', '/2015/', '/2014/'];
//['/2019/'];
//['/2023/', '/2022/', '/2021/', '/2020/'];
//['/2001/', '/2018/'];

await processAlbums(albumPaths);

async function processAlbums(albumPaths: string[] | undefined) {
    if (!albumPaths) return;
    for (const albumPath of albumPaths) {
        console.log(`Fetching ${albumPath}`);
        if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: [${albumPath}]`);
        const zpAlbum = await getAlbumFromZenphoto(albumPath);
        // Don't upsert the root album, it doesn't go in the database
        if ('/' !== albumPath) {
            const awsItems = convertAlbum(zpAlbum);
            await upsertItems(awsItems);
            console.log(`Upserted ${albumPath} - ${awsItems.length} items`);
        }
        // For root and year albums, get child albums
        if (!isValidDayAlbumPath(albumPath)) {
            const childAlbumPaths = getDayAlbumPaths(zpAlbum);
            if (!childAlbumPaths) throw new Error(`Album ${albumPath} has no child albums`);
            processAlbums(childAlbumPaths);
        }
    }
}

function getDayAlbumPaths(zpAlbum: ZenphotoAlbum): string[] | undefined {
    if (!zpAlbum.albums) return;
    return zpAlbum.albums.map((album) => {
        if (!album.path) throw new Error(`Album ${album.title} has no path`);
        return `/${album.path}/`;
    });
}
