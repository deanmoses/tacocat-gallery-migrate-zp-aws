import { ZenphotoImageItem } from './zenphotoTypes.js';

export function printImages(images: ZenphotoImageItem[]): void {
    console.table(
        images.map((image: ZenphotoImageItem) => ({
            index: image.index,
            path: image.path,
            title: image.title,
            width: image.width,
            height: image.height,
        })),
    );
}
