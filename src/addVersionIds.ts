//
// Add AWS S3 version IDs to the image entries in the local SQLite database
// This script is meant to run on my local laptop
//

import { getPaths, setVersionId } from './lib/db.js';
import { isValidImagePath } from './lib/galleryPathUtils.js';
import { logMajor, logMinor } from './lib/printUtils.js';
import { getImageVersionId } from './lib/s3Utils.js';

//const startingPath = '/1943/'; // DONE
//const startingPath = '/1962/'; // DONE
//const startingPath = '/1968/'; // DONE
//const startingPath = '/1969/'; // DONE
//const startingPath = '/1973/'; // DONE
//const startingPath = '/1974/'; // DONE
//const startingPath = '/1975/'; // DONE
//const startingPath = '/1976/'; // DONE
//const startingPath = '/1977/'; // DONE
//const startingPath = '/1978/'; // DONE
//const startingPath = '/1979/'; // DONE
//const startingPath = '/198'; // DONE
//const startingPath = '/199'; // DONE
//const startingPath = '/200'; // DONE had to lower-case /2001/09-21/lucie_preggie.JPG and lucie_preggie2.JPG
//const startingPath = '/201'; // DONE
const startingPath = '/202'; // DONE
//const startingPath = '/2020/';
//const startingPath = '/2021/';
//const startingPath = '/2022/';
//const startingPath = '/2023/';

const paths = await getPaths(startingPath);
for (const path of paths) {
    if (!isValidImagePath(path)) {
        console.log(`Skipping not an image: ${path}`);
        continue;
    }
    const versionId = await getImageVersionId(path);
    logMinor(`[${versionId}] ${path}`);
    await setVersionId(path, versionId);
}
logMajor(`Added version IDs for ${paths.length} items`);
