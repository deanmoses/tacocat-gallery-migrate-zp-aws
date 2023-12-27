//
// Add tags to the image entries in DynamoDB
// This script is meant to run on my local laptop
//

import { getByPath } from './lib/db_tags.js';
import { updateAwsTags } from './lib/updateAwsTags.js';

//const startingPath = '/1986/12-30/';
const startingPath = '/';
const taggedImages = await getByPath(startingPath);
await updateAwsTags(taggedImages);

// FOR TESTING ON DEV DB
// const mock: TaggedItem[] = [
//     {
//         path: '/2023/12-08/3.jpg',
//         tags: ['tag1', 'tag2', 'tag3', 'tag4'],
//     },
//     {
//         path: '/2023/12-08/4.jpg',
//         tags: ['tag1', 'tag2', 'tag3', 'tag4'],
//     },
//     {
//         path: '/2023/12-08/5.jpg',
//         tags: ['tag1', 'tag2', 'tag3', 'tag4'],
//     },
//     {
//         path: '/2023/12-08/6.jpg',
//         tags: ['tag1', 'tag2', 'tag3', 'tag4'],
//     },
// ];
// await updateAwsTags(mock);
