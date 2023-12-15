//
// Verify the local SQLite database based on the filesystem:
//   - Every folder on the filesystem has a DB entry
//   - Every image on the filesystem has a DB entry
//
// This script is meant to run on my local laptop
//

import { getItem } from './lib/db.js';
import { getFilesAndFolders } from './lib/fsUtils.js';
import { logMajor, logMinor } from './lib/printUtils.js';

const paths: string[] = getFilesAndFolders('/');
for (const path of paths) {
    await getItem(path); // Throws if not found
    logMinor(`Verified ${path}`);
}
logMajor(`Verified ${paths.length} items`);
