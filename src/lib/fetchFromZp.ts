import { isValidAlbumPath, isValidYearAlbumPath } from './galleryPathUtils.js';
import { ZenphotoAlbum } from './zenphotoTypes.js';

export async function getAlbumFromZenphoto(albumPath: string): Promise<ZenphotoAlbum> {
    const albumResponse = await fetch(albumUrl(albumPath));
    const json = await albumResponse.json();
    return json.album;
}

/** URL of the Zenphoto JSON REST API from which to retrieve the album */
function albumUrl(albumPath: string): string {
    if (!isValidAlbumPath(albumPath)) throw new Error(`Invalid album path: ${albumPath}`);
    if ('/' === albumPath) return 'https://tacocat.com/p_json/root.json';
    if (isValidYearAlbumPath(albumPath)) return `https://tacocat.com/p_json${albumPath.slice(0, -1)}.json`;
    return `https://tacocat.com/zenphoto${albumPath}?json`;
}
