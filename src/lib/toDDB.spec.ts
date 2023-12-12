import { AwsAlbumItem, AwsImageItem } from './awsTypes.js';
import { convertToDDBitem } from './toDDB.js';

it('Should convert album', () => {
    const awsAlbum: AwsAlbumItem = {
        itemType: 'album',
        parentPath: '/2001/',
        itemName: '12-31',
        createdOn: '2014-12-04T08:00:00.000Z',
        updatedOn: '2014-12-04T08:00:00.000Z',
        description: 'Description',
        summary: 'Summary',
        published: true,
    };
    const ddbItem = {
        itemType: { S: 'album' },
        parentPath: { S: '/2001/' },
        itemName: { S: '12-31' },
        createdOn: { S: '2014-12-04T08:00:00.000Z' },
        updatedOn: { S: '2014-12-04T08:00:00.000Z' },
        description: { S: 'Description' },
        summary: { S: 'Summary' },
        published: { BOOL: true },
    };
    expect(convertToDDBitem(awsAlbum)).toEqual(ddbItem);
});

it('Should convert image', () => {
    const awsImage: AwsImageItem = {
        itemType: 'image',
        parentPath: '/2001/12-31/',
        itemName: 'image.jpg',
        createdOn: '2014-12-04T08:00:00.000Z',
        updatedOn: '2014-12-04T08:00:00.000Z',
        title: 'Title',
        description: 'Description',
        dimensions: {
            width: 1280,
            height: 960,
        },
    };
    const ddbItem = {
        itemType: { S: 'image' },
        parentPath: { S: '/2001/12-31/' },
        itemName: { S: 'image.jpg' },
        createdOn: { S: '2014-12-04T08:00:00.000Z' },
        updatedOn: { S: '2014-12-04T08:00:00.000Z' },
        title: { S: 'Title' },
        description: { S: 'Description' },
        dimensions: { M: { width: { N: '1280' }, height: { N: '960' } } },
    };
    expect(convertToDDBitem(awsImage)).toEqual(ddbItem);
});
