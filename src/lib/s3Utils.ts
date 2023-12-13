import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isValidImagePath } from './galleryPathUtils.js';

/** Get S3 versionId of specified image */
export async function getImageVersionId(imagePath: string): Promise<string> {
    if (!isValidImagePath(imagePath)) throw new Error(`Invalid image path: [${imagePath}]`);
    const command = new HeadObjectCommand({
        Bucket: 'tacocat-gallery-sam-prod-original-images',
        Key: imagePathToOriginalsKey(imagePath),
    });
    const client = new S3Client({});
    const results = await client.send(command);
    if (!results) throw new Error(`No S3 results for ${imagePath}`);
    if (!results.VersionId) throw new Error(`No version ID for ${imagePath}`);
    return results.VersionId;
}

function imagePathToOriginalsKey(imagePath: string): string {
    return imagePath.substring(1); // remove the starting '/' from path
}
