//
// Types coming from the Zenphoto API
//

export type ZenphotoAlbum = ZenphotoAlbumItem &
    Navigable & {
        images?: ZenphotoImageItem[];
        albums?: ZenphotoAlbumItem[];
        parent_album?: ZenphotoBaseGalleryRecord;
    };

export type Navigable = {
    prev?: ZenphotoBaseGalleryRecord;
    next?: ZenphotoBaseGalleryRecord;
};

export type ZenphotoGalleryItem = ZenphotoAlbumItem | ZenphotoImageItem;

/** Album without children */
export type ZenphotoAlbumItem = ZenphotoBaseGalleryRecord & {
    published: boolean;
};

export type ZenphotoImageItem = ZenphotoBaseGalleryRecord & {
    /** like  /zenphoto/albums/2001/12-31/alicia_gives_feeding_lessons.jpg */
    url_full: string;
    /** like /zenphoto/cache/2001/12-31/alicia_gives_feeding_lessons_1024.jpg?cached=1491244699 */
    url_sized: string;
    /**  1280 */
    width: number;
    /** like 960 */
    height: number;
    /** like 0 or 1 or 2 */
    index: number;
};

/** Base that albums and images extend */
export type ZenphotoBaseGalleryRecord = {
    /**  2001/12-31 */
    path?: string;
    /** like 12-31 */
    title?: string;
    /** like Christmas */
    customdata?: string;
    desc?: string;
    /** like 1009785600*/
    date?: number;
    /** like 1417735026 */
    date_updated?: number;
    /** like 1024 */
    image_size?: number;
    /** like 200 */
    thumb_size?: number;
    /** like /zenphoto/cache/2001/12-31/all_dressed_up_w200_h200_cw960_ch960_cx61_cy0_thumb.jpg?cached=1419239961 */
    url_thumb?: string;
    tags?: string[];
};
