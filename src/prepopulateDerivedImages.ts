//
// Request all detail page images so that they get pre-populated
//

import { getItems } from './lib/db.js';
import { hitItemThumb } from './lib/derivedImages.js';
import { logMajor } from './lib/printUtils.js';

const startingPath = '/199';
const items = await getItems(startingPath);
const alreadyProcessed = 0;
const batchSize = 450;
for (let i = alreadyProcessed; i < items.length; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, items.length);
    //console.log(`Processing ${i} to ${batchEnd}`);
    const batch = items.slice(i, batchEnd);
    await Promise.allSettled(batch.map((item) => hitItemThumb(item)));
    logMajor(`Processed ${i} to ${batchEnd}`);
}
logMajor(`Processed ${items.length} items`);
