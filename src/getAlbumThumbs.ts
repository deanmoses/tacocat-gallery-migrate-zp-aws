//
// Read the Zenphoto album thumbnails from the year JSON files I transferred
// to my laptop via Transmit and stick them in the local SQLite database.
//
// This script wouldn't exist except I didn't get the album thumbnails during the main migration
//

import { setAlbumThumb } from './lib/db.js';
import { getYearJsonFile } from './lib/fsUtils.js';
import { isValidAlbumPath, isValidYearAlbumPath } from './lib/galleryPathUtils.js';
import { logMajor, logMinor } from './lib/printUtils.js';
import { extractAlbumThumbnailImage } from './lib/toAwsFromZp.js';
import { ZenphotoAlbum } from './lib/zenphotoTypes.js';

//const years = ['1943'];
//const years = ['1969', '1968', '1962'];
//const years = ['1979', '1978', '1977', '1976', '1975', '1974', '1973'];
//const years = ['1989', '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980'];
//const years = ['2000', '1999', '1998', '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990'];
//const years = ['2001'];
//const years = ['2002'];
//const years = ['2003'];
//const years = ['2004'];
//const years = ['2005'];
//const years = ['2006'];
//const years = ['2007'];
//const years = ['2008'];
//const years = ['2009'];
//const years = ['2010'];
//const years = ['2011'];
//const years = ['2012'];
//const years = ['2013'];
//const years = ['2014'];
//const years = ['2015'];
//const years = ['2016'];
//const years = ['2017'];
//const years = ['2018'];
//const years = ['2019'];
const years = ['2023', '2022', '2021', '2020'];

for (const year of years) {
    const yearAlbum = getYearJsonFile(year);
    await processAlbum(yearAlbum);
    logMajor(`Processed ${year}`);
}

/** Grab thumbnail from album and child albums, stick in local SQLite database */
async function processAlbum(zpAlbum: ZenphotoAlbum): Promise<void> {
    //console.log(`${zpAlbum.path}: ${JSON.stringify(zpAlbum, null, 2)}`);
    if (!zpAlbum.path) throw new Error(`No path for album ${zpAlbum.path}`);
    if (!zpAlbum.url_thumb) throw new Error(`No thumb for album ${zpAlbum.path}`);
    const albumPath = toAwsAlbumPath(zpAlbum.path);
    const thumbPath = extractAlbumThumbnailImage(zpAlbum.url_thumb);
    logMinor(`${albumPath} → ${thumbPath}`);
    await setAlbumThumb(albumPath, thumbPath);
    if (!!zpAlbum.albums) {
        for (const childAlbum of zpAlbum.albums) {
            processAlbum(childAlbum);
        }
    } else if (isValidYearAlbumPath(albumPath)) {
        throw new Error(`Year album without children: ${albumPath}`);
    }
}

/** Convert from Zenphoto like 2001 to AWS album path like /2001/ */
function toAwsAlbumPath(zpAlbumPath: string): string {
    const albumPath = `/${zpAlbumPath}/`;
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: [${albumPath}]`);
    return albumPath;
}
