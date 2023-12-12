import { marshall } from '@aws-sdk/util-dynamodb';
import { AwsGalleryItem } from './awsTypes.js';

export function convertToDDBitem(item: AwsGalleryItem) {
    return marshall(item);
}
