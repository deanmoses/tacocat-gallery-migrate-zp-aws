import { ZenphotoImageItem } from './zenphotoTypes.js';

/** Format the log output appropriate to major info */
export function logMajor(o: unknown) {
    console.log('\x1b[32m\x1b[1m%s\x1b[0m', o);
}

/** Format the log output appropriate to minor info */
export function logMinor(o: unknown) {
    console.log('\x1b[36m%s\x1b[0m', o);
}

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
