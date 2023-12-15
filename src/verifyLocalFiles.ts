//
// Verify the local filesystem based on the local SQLite DB entries:
//   - Every album in the DB has a folder on the file system
//   - Every image in the DB exists on the file system
//
// This script is meant to run on my local laptop
//

import { getPaths } from './lib/db.js';
import { verifyItemOnFilesystem } from './lib/fsUtils.js';
import { logMajor, logMinor } from './lib/printUtils.js';

const paths: string[] = await getPaths('/');
for (const path of paths) {
    await verifyItemOnFilesystem(path);
    logMinor(`Verified ${path}`);
}
logMajor(`Verified ${paths.length} items`);
