//
// Utilities for working with gallery items on the local filesystem
//

import { existsSync, lstatSync, readFileSync, readdirSync } from 'fs';
import { isValidAlbumPath, isValidImagePath } from './galleryPathUtils.js';
import { join } from 'path';
import { ZenphotoAlbum } from './zenphotoTypes.js';

// /Users/moses/Desktop/zenphoto/albums/2001/12-31
const galleryDir = '/Users/moses/Desktop/zenphoto/albums';
const yearAlbumJsonDir = '/Users/moses/Desktop/p_json';

/** Get *.json files */
export function getYearJsonFile(year: string): ZenphotoAlbum {
    const yearAlbumFilename = `${yearAlbumJsonDir}/${year}.json`;
    if (!existsSync(yearAlbumFilename)) {
        throw new Error(`[${yearAlbumFilename}] no such file`);
    }
    const fileContent = readFileSync(yearAlbumFilename, 'utf-8');
    return JSON.parse(fileContent).album as ZenphotoAlbum;
}

/** Get all files and folders under path */
export function getFilesAndFolders(albumPath: string): string[] {
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: [${albumPath}]`);
    const dirPath = toFilePath(albumPath);
    let list: string[] = [];
    const files = readdirSync(dirPath);
    for (const file of files) {
        const fullPath = join(dirPath, file);
        const galleryPath = toGalleryPath(fullPath);
        const stat = lstatSync(fullPath);
        if (stat.isDirectory()) {
            list = list.concat(getFilesAndFolders(galleryPath));
        } else {
            list.push(galleryPath);
        }
    }
    return list;
}

/** Verify the specified album or image path exists on the filesystem */
export async function verifyItemOnFilesystem(path: string): Promise<void> {
    if ('/' === path) return; // root is always valid
    const isAlbum = isValidAlbumPath(path);
    if (isAlbum) await verifyAlbumOnFilesystem(path);
    else await verifyImageOnFilesystem(path);
}

/** Verify that the filesystem has a folder corresponding to the albumPath */
async function verifyAlbumOnFilesystem(albumPath: string): Promise<void> {
    if (!existsSync(toFilePath(albumPath))) {
        throw new Error(`[${albumPath}] does not exist on filesystem at [${toFilePath(albumPath)}]}]`);
    }
    if (!lstatSync(toFilePath(albumPath)).isDirectory()) {
        throw new Error(`[${albumPath}] is not a directory`);
    }
}

/** Verify that the filesystem has a file corresponding to the imagePath */
async function verifyImageOnFilesystem(imagePath: string): Promise<void> {
    if (!existsSync(toFilePath(imagePath))) {
        throw new Error(`[${imagePath}] does not exist on filesystem`);
    }
    if (!lstatSync(toFilePath(imagePath)).isFile()) {
        throw new Error(`[${imagePath}] is not a file`);
    }
}

/** Convert from a gallery path to a filesystem path */
function toFilePath(path: string): string {
    return `${galleryDir}${path.replace(/\/$/, '')}`;
}

/** Convert from a filesystem path to a gallery path */
function toGalleryPath(filePath: string): string {
    const galleryPath = filePath.replace(galleryDir, '');
    return isValidImagePath(galleryPath) ? galleryPath : galleryPath + '/';
}
