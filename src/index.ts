//
// Fetch albums from Zenphoto and upseert them into SQLite
// This script is meant to run on my local laptop
//

import { upsertItems } from './lib/db.js';
import { getAlbumFromZenphoto } from './lib/fetchFromZp.js';
import { isValidAlbumPath, isValidDayAlbumPath } from './lib/galleryPathUtils.js';
import { convertAlbum } from './lib/toAwsFromZp.js';
import { ZenphotoAlbum } from './lib/zenphotoTypes.js';

const albumPaths: string[] = [];
//['/1969/', '/1968/', '/1962/', '/1943/'];
//['/1979/', '/1978/', '/1977/', '/1976/', '/1975/', '/1974/', '/1973/'];
// [
//     '/1989/',
//     '/1988/',
//     '/1987/',
//     '/1986/',
//     '/1985/',
//     '/1984/',
//     '/1983/',
//     '/1982/',
//     '/1981/',
//     '/1980/',
// ];
// [
//     '/2000/',
//     '/1999/',
//     '/1998/',
//     '/1997/',
//     '/1996/',
//     '/1995/',
//     '/1994/',
//     '/1993/',
//     '/1992/',
//     '/1991/',
//     '/1990/',
// ];
//['/2002/'];
//['/2003/'];
//['/2004/'];
//['/2005/'];
//['/2006/'];
//['/2007/'];
//['/2008/'];
//['/2009/'];
//['/2010/'];
//['/2011/'];
//['/2012/'];
//['/2013/'];
//['/2014/'];
//['/2015/'];
//['/2016/'];
//['/2017/'];
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
