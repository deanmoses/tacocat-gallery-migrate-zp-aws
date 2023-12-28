import { AwsGalleryItem, AwsImageItem, Rectangle } from './awsTypes.js';
import { isValidImagePath, toPathFromItem } from './galleryPathUtils.js';
import { logMinor } from './printUtils.js';

/** Hit URL of thumbnail image */
export async function hitItemThumb(item: AwsGalleryItem): Promise<void> {
    const path = toPathFromItem(item);
    if (!isValidImagePath(path)) {
        //console.log(`Skipping not an image: ${path}`);
        return;
    } else if (!path.endsWith('.jpg')) {
        //console.log(`Skipping not .jpg: ${path}`);
        return;
    }
    const image = item as AwsImageItem;
    const url = thumbUrl(path, image);
    await hitUrl(url);
}

function thumbUrl(path: string, image: AwsImageItem): string {
    if (!image.versionId) throw new Error(`No versionId for ${path}`);
    return thumbnailUrl(path, image.versionId, image.thumbnail);
}

/**
 * URL to CDN'ed derived images
 * @param imagePath Path to an image like /2001/12-31/image.jpg
 * @param versionId Version of the image
 * @param crop Optional crop rectangle
 */
export function thumbnailUrl(imagePath: string, versionId: string, crop?: Rectangle | undefined): string {
    const cdnDomain = 'img.pix.tacocat.com';
    return (
        `https://${cdnDomain}/i${imagePath}?version=${versionId}&size=200x200` +
        (crop ? `&crop=${crop.x},${crop.y},${crop.width},${crop.height}` : '')
    );
}

/** Hit URL of detail page image */
export async function hitItemDetail(item: AwsGalleryItem): Promise<void> {
    const path = toPathFromItem(item);
    if (!isValidImagePath(path)) {
        //console.log(`Skipping not an image: ${path}`);
        return;
    } else if (!path.endsWith('.jpg')) {
        //console.log(`Skipping not .jpg: ${path}`);
        return;
    }
    const image = item as AwsImageItem;
    const url = detailUrl(path, image);
    await hitUrl(url);
}

/** Create URL to detail page image */
function detailUrl(path: string, image: AwsImageItem): string {
    if (!image.dimensions) throw new Error(`No dimensions for ${path}`);
    if (!image.dimensions.width) throw new Error(`No width for ${path}`);
    if (!image.dimensions.height) throw new Error(`No height for ${path}`);
    if (!image.versionId) throw new Error(`No versionId for ${path}`);
    const width = detailWidth(image);
    const height = detailHeight(image);
    const sizing = width > height ? width.toString() : 'x' + height.toString();
    return detailImageUrl(path, image.versionId, sizing);
}

/** Width of detail image */
function detailWidth(image: AwsImageItem): number {
    const width = image.dimensions.width;
    const height = image.dimensions.height;
    if (!width) {
        return 1024;
    } else if (!height || width > height) {
        // Don't enlarge images smaller than 1024
        return width < 1024 ? width : 1024;
    } else {
        return Math.round(1024 * (width / height));
    }
}

/** Height of detail image */
function detailHeight(image: AwsImageItem): number {
    const width = image.dimensions.width;
    const height = image.dimensions.height;
    // TODO: not sure setting a height of 1024 is correct
    if (!height) {
        return 1024;
    } else if (!width || height > width) {
        // Don't enlarge images smaller than 1024
        return height < 1024 ? height : 1024;
    } else {
        return Math.round(1024 * (height / width));
    }
}

/**
 * URL to optimized image for display on the image detail page
 * @param imagePath Path to an image like /2001/12-31/image.jpg
 * @param versionId Version of the image
 * @param size size like '1024' (landscape) or 'x1024' (portrait)
 */
function detailImageUrl(imagePath: string, versionId: string, size: string): string {
    const cdnDomain = 'img.pix.tacocat.com';
    return `https://${cdnDomain}/i${imagePath}?version=${versionId}&size=${size}`;
}

async function hitUrl(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error hitting ${url}: ${response.status} ${response.statusText}`);
    } else {
        logMinor(`Processed ${url}`);
    }
    //logMinor(`Processed ${url}`);
}
