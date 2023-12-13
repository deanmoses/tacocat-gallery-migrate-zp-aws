//
// Add AWS S3 version IDs to the image entries in the local SQLite database
//

import { getPaths, setVersionId } from './lib/db.js';
import { isValidImagePath } from './lib/galleryPathUtils.js';
import { getImageVersionId } from './lib/s3Utils.js';

const startingPath = '/2001/12-31/';
const paths = await getPaths(startingPath);
for (const path of paths) {
    if (!isValidImagePath(path)) {
        console.log(`Skipping not an image [${path}]`);
        continue;
    }
    const versionId = await getImageVersionId(path);
    console.log(`Image [${path}] version ID [${versionId}]`);
    await setVersionId(path, versionId);
}
