//
// The shape of items in DynamoDB
//

export type AwsAlbum = AwsAlbumItem &
    Navigable & {
        children?: AwsGalleryItem[];
    };

export type Navigable = {
    prev?: NavInfo;
    next?: NavInfo;
};

/** Just enough information to navigate to a next/prev album or image */
export type NavInfo = {
    path: string;
    title?: string;
};

export type AwsGalleryItem = AwsAlbumItem | AwsImageItem;

/** Album without children */
export type AwsAlbumItem = AwsBaseGalleryRecord & {
    thumbnail?: AlbumThumbnailEntry;
    summary?: string;
    published?: boolean;
};

export type AwsImageItem = AwsBaseGalleryRecord & {
    versionId: string;
    dimensions: Size;
    thumbnail?: ImageThumbnailCrop;
    title?: string;
    tags?: string[];
};

/** Base that albums and images extend */
export type AwsBaseGalleryRecord = {
    parentPath: string;
    itemName: string;
    itemType: GalleryItemType;
    createdOn: string;
    updatedOn?: string;
    description?: string;
};

export type GalleryItemType = 'album' | 'image';

export type AlbumThumbnailEntry = {
    path: string;
    versionId: string;
    crop?: Rectangle;
};

export type ImageThumbnailCrop = Rectangle;

export type Rectangle = Point & Size;

export type Point = {
    x: number;
    y: number;
};

export type Size = {
    width: number;
    height: number;
};
