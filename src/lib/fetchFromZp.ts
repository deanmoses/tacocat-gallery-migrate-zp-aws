import { isValidAlbumPath } from './galleryPathUtils.js';
import { ZenphotoAlbum } from './zenphotoTypes.js';

export async function getAlbumFromZenphoto(albumPath: string): Promise<ZenphotoAlbum> {
    const albumResponse = await fetch(albumPathToZenphotoJsonUrl(albumPath));
    const json = await albumResponse.json();
    return json.album;
}

export function albumPathToZenphotoJsonUrl(albumPath: string): string {
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: ${albumPath}`);
    return `https://tacocat.com/zenphoto${albumPath}?json&pagination=off&depth=1`;
}
