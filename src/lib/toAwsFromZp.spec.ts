import { AwsAlbum, AwsGalleryItem, AwsImageItem, Rectangle } from './awsTypes.js';
import {
    convertAlbum,
    convertCrop,
    convertDescription,
    convertImage,
    convertImagePath,
    extractAlbumThumbnailImage,
} from './toAwsFromZp.js';
import { ZenphotoAlbum, ZenphotoImageItem } from './zenphotoTypes.js';

describe('convert image path', () => {
    const imagePaths: { zp: string; aws: string }[] = [
        { zp: '2001/12-31/image.jpg', aws: '/2001/12-31/image.jpg' },
        { zp: '2001/12-31/image.JPG', aws: '/2001/12-31/image.JPG' },
        { zp: '2001/12-31/image.jpeg', aws: '/2001/12-31/image.jpeg' },
        { zp: '2001/12-31/image.gif', aws: '/2001/12-31/image.gif' },
        { zp: '2001/12-31/image.png', aws: '/2001/12-31/image.png' },
    ];
    imagePaths.forEach((imagePaths) => {
        it(`Convert ${imagePaths.zp} → ${imagePaths.aws}`, () => {
            expect(convertImagePath(imagePaths.zp)).toEqual(imagePaths.aws);
        });
    });
});

describe('convert description', () => {
    const descriptions: { zp: string; aws: string }[] = [
        {
            zp: '<p>Oh - getting the permits. &nbsp;Lining up DJs. &nbsp;Collecting couches.</p>',
            aws: '<p>Oh - getting the permits.  Lining up DJs.  Collecting couches.</p>',
        },
        {
            zp: '<p>Description.&nbsp;</p>',
            aws: '<p>Description.</p>',
        },
        {
            zp: '<p>Description.<br></p>',
            aws: '<p>Description.</p>',
        },
        {
            zp: '<p>Confab in the kitchen. No doubt discussing one of two things:<br></p><ol><li>DJ lineup<br></li><li>Logistics around cooking and serving grilled cheese to the unwashed masses&nbsp;nearly nonstop for 7 days.</li></ol>',
            aws: '<p>Confab in the kitchen. No doubt discussing one of two things:</p><ol><li>DJ lineup</li><li>Logistics around cooking and serving grilled cheese to the unwashed masses nearly nonstop for 7 days.</li></ol>',
        },
        {
            zp: 'Lucie&apos;s really shaking things up on New Year&apos;s Eve.',
            aws: "Lucie's really shaking things up on New Year's Eve.",
        },
        {
            zp: "Property inspection.\r\rYup, it's property all right.",
            aws: "Property inspection. Yup, it's property all right.",
        },
        {
            zp: "<p>The ceremony.</p>\r\n<p>I forgot... was Rita Zach's best man?</p>",
            aws: "<p>The ceremony.</p> <p>I forgot... was Rita Zach's best man?</p>",
        },
        {
            zp: '<a href="https://pix.tacocat.com/#2001/10-21/dan_jen_wedding01.jpg">',
            aws: '<a href="/2001/10-21/dan_jen_wedding01.jpg">',
        },
        {
            zp: '<a href="https://pix.tacocat.com/#2018/03-03/q_homestack2.jpg">',
            aws: '<a href="/2018/03-03/q_homestack2.jpg">',
        },
        {
            zp: '<a href="#2004/12-05/tub1.jpg">',
            aws: '<a href="/2004/12-05/tub1.jpg">',
        },
        {
            zp: '<a href="#2018/06-29">',
            aws: '<a href="/2018/06-29">',
        },
        {
            zp: '<a href="#2018/06-09">',
            aws: '<a href="/2018/06-09">',
        },
    ];
    descriptions.forEach((description) => {
        it(`Convert ${description.zp} → ${description.aws}`, () => {
            expect(convertDescription(description.zp)).toEqual(description.aws);
        });
    });
});

describe('convert album thumbnail', () => {
    const tests: { url: string; imagePath: string }[] = [
        {
            url: '/zenphoto/cache/1943/01-01/1943-soublins_w200_h200_cw1493_ch1493_cx985_cy407_thumb.jpg?t=1418458445',
            imagePath: '/1943/01-01/1943-soublins.jpg',
        },
        {
            url: '/zenphoto/cache/1969/07-20/marriage08_200_cw200_ch200_thumb.jpg?t=1418719978',
            imagePath: '/1969/07-20/marriage08.jpg',
        },
        {
            url: '/zenphoto/cache/1977/12-01/1977-Lu_200_w200_h200_cw200_ch200_thumb.jpg?cached=1548530166',
            imagePath: '/1977/12-01/1977-Lu.jpg',
        },
        {
            url: '/zenphoto/zp-core/i.php?a=1975/12-31&i=1975-relatives-christmas.jpg&s=200&w=200&h=200&cw=200&ch=200&q=85&c=1&t=1&wmk=!&check=7d296a2339b1244fc14ea3790d0e0b801f91e3fa',
            imagePath: '/1975/12-31/1975-relatives-christmas.jpg',
        },
        {
            url: '/zenphoto/cache/2007/08-19/1174879510_3624889886_o_200_cw200_ch200_thumb.jpg?t=1419197199',
            imagePath: '/2007/08-19/1174879510_3624889886_o.jpg',
        },
    ];
    tests.forEach(({ url, imagePath }) => {
        it(`Convert ${url} → ${imagePath}`, () => {
            expect(extractAlbumThumbnailImage(url)).toEqual(imagePath);
        });
    });
});

describe('convert crop', () => {
    const tests: { url: string; expected: Rectangle | undefined }[] = [
        {
            url: '/zenphoto/cache/2001/12-31/image_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            expected: undefined,
        },
        {
            url: '/zenphoto/cache/2001/12-31/all_dressed_up_w200_h200_cw960_ch960_cx61_cy0_thumb.jpg?cached=1419239961',
            expected: {
                x: 61,
                y: 0,
                width: 960,
                height: 960,
            },
        },
        {
            url: '/zenphoto/cache/2001/12-31/image_200_w200_h200_thumb.jpg?cached=1552859752',
            expected: undefined,
        },
    ];
    tests.forEach((test) => {
        it(`Convert ${test.url} → ${JSON.stringify(test.expected)}`, () => {
            expect(convertCrop(test.url)).toEqual(test.expected);
        });
    });
});

it('Should convert image', () => {
    const zpImage: ZenphotoImageItem = {
        path: '2001/12-31/image.jpg',
        title: 'Title',
        desc: 'Description',
        date: 1417680000,
        url_full: '/zenphoto/albums/2001/12-31/image.jpg',
        url_sized: '/zenphoto/cache/2001/12-31/image_1024.jpg?cached=1491244699',
        url_thumb: '/zenphoto/cache/2001/12-31/image_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
        width: 1280,
        height: 960,
        index: 0,
    };
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
    expect(convertImage(zpImage)).toEqual(awsImage);
});

it('Should convert HTML entities in image title', () => {
    const zpImage: ZenphotoImageItem = {
        path: '2001/12-31/image.jpg',
        title: 'HTML &amp; Entity',
        desc: '<p>HTML &amp; Entity</p>',
        date: 1417680000,
        url_full: '/zenphoto/albums/2001/12-31/image.jpg',
        url_sized: '/zenphoto/cache/2001/12-31/image_1024.jpg?cached=1491244699',
        url_thumb: '/zenphoto/cache/2001/12-31/image_200_w200_h200_thumb.jpg?cached=1552859752',
        width: 1280,
        height: 960,
        index: 0,
    };
    const awsImage: AwsImageItem = {
        itemType: 'image',
        parentPath: '/2001/12-31/',
        itemName: 'image.jpg',
        createdOn: '2014-12-04T08:00:00.000Z',
        updatedOn: '2014-12-04T08:00:00.000Z',
        title: 'HTML & Entity',
        description: '<p>HTML &amp; Entity</p>',
        dimensions: {
            width: 1280,
            height: 960,
        },
    };
    expect(convertImage(zpImage)).toEqual(awsImage);
});

it('Should remove <br></p> from image description', () => {
    const zpImage: ZenphotoImageItem = {
        path: '2001/12-31/image.jpg',
        title: 'Title',
        desc: '<p>Description.<br></p>',
        date: 1417680000,
        url_full: '/zenphoto/albums/2001/12-31/image.jpg',
        url_sized: '/zenphoto/cache/2001/12-31/image_1024.jpg?cached=1491244699',
        url_thumb: '/zenphoto/cache/2001/12-31/image_200_w200_h200_thumb.jpg?cached=1552859752',
        width: 1280,
        height: 960,
        index: 0,
    };
    const awsImage: AwsImageItem = {
        itemType: 'image',
        parentPath: '/2001/12-31/',
        itemName: 'image.jpg',
        createdOn: '2014-12-04T08:00:00.000Z',
        updatedOn: '2014-12-04T08:00:00.000Z',
        title: 'Title',
        description: '<p>Description.</p>',
        dimensions: {
            width: 1280,
            height: 960,
        },
    };
    expect(convertImage(zpImage)).toEqual(awsImage);
});

it('Should remove <br></p> from album description', () => {
    const items: AwsGalleryItem[] = convertAlbum({
        path: '2001/12-31',
        date: 1009785600,
        desc: '<p>Description.<br></p>',
        url_thumb: '/zenphoto/cache/2001/12-31/image_w200_h200_thumb.jpg?cached=1419239961',
    });
    expect(items[0]).toEqual({
        itemType: 'album',
        parentPath: '/2001/',
        itemName: '12-31',
        createdOn: '2001-12-31T08:00:00.000Z',
        updatedOn: '2001-12-31T08:00:00.000Z',
        published: true,
        description: '<p>Description.</p>',
    });
});

it('Should remove &nbsp;</p> from image description', () => {
    const zpImage: ZenphotoImageItem = {
        path: '2001/12-31/image.jpg',
        title: 'Title',
        desc: '<p>Description.&nbsp;</p>',
        date: 1417680000,
        url_full: '/zenphoto/albums/2001/12-31/image.jpg',
        url_sized: '/zenphoto/cache/2001/12-31/image_1024.jpg?cached=1491244699',
        url_thumb: '/zenphoto/cache/2001/12-31/image_200_w200_h200_thumb.jpg?cached=1552859752',
        width: 1280,
        height: 960,
        index: 0,
    };
    const awsImage: AwsImageItem = {
        itemType: 'image',
        parentPath: '/2001/12-31/',
        itemName: 'image.jpg',
        createdOn: '2014-12-04T08:00:00.000Z',
        updatedOn: '2014-12-04T08:00:00.000Z',
        title: 'Title',
        description: '<p>Description.</p>',
        dimensions: {
            width: 1280,
            height: 960,
        },
    };
    expect(convertImage(zpImage)).toEqual(awsImage);
});

it('Should remove &nbsp;</p> from album description', () => {
    const items: AwsGalleryItem[] = convertAlbum({
        path: '2001/12-31',
        date: 1009785600,
        desc: '<p>Description.&nbsp;</p>',
        url_thumb: '/zenphoto/cache/2001/12-31/image_w200_h200_thumb.jpg?cached=1419239961',
    });
    expect(items[0]).toEqual({
        itemType: 'album',
        parentPath: '/2001/',
        itemName: '12-31',
        createdOn: '2001-12-31T08:00:00.000Z',
        updatedOn: '2001-12-31T08:00:00.000Z',
        published: true,
        description: '<p>Description.</p>',
    });
});

it('Should convert album without publish status as published', () => {
    const items: AwsGalleryItem[] = convertAlbum({
        path: '2001/12-31',
        date: 1009785600,
        url_thumb: '/zenphoto/cache/2001/12-31/image_w200_h200_thumb.jpg?cached=1419239961',
    });
    expect(items[0]).toEqual({
        itemType: 'album',
        parentPath: '/2001/',
        itemName: '12-31',
        createdOn: '2001-12-31T08:00:00.000Z',
        updatedOn: '2001-12-31T08:00:00.000Z',
        published: true,
    });
});

it('Should convert unpublished album as unpublished', () => {
    const items: AwsGalleryItem[] = convertAlbum({
        path: '2001/12-31',
        date: 1009785600,
        url_thumb: '/zenphoto/cache/2001/12-31/image_w200_h200_thumb.jpg?cached=1419239961',
        published: false,
    });
    expect(items[0]).toEqual({
        itemType: 'album',
        parentPath: '/2001/',
        itemName: '12-31',
        createdOn: '2001-12-31T08:00:00.000Z',
        updatedOn: '2001-12-31T08:00:00.000Z',
        published: false,
    });
});

it('Should convert album', () => {
    const items: AwsGalleryItem[] = convertAlbum(zpAlbum);
    if (!items) throw new Error('Did not receive items');
    expect(items.length).toBe(28);
    expect(items[0]).toEqual(awsAlbum);
});

const zpAlbum: ZenphotoAlbum = {
    path: '2001/12-31',
    title: '12-31',
    date: 1009785600,
    date_updated: 1417735026,
    customdata: 'Christmas and New Year',
    published: true,
    image_size: 1024,
    thumb_size: 200,
    url_thumb: '/zenphoto/cache/2001/12-31/all_dressed_up_w200_h200_cw960_ch960_cx61_cy0_thumb.jpg?cached=1419239961',
    images: [
        {
            path: '2001/12-31/alicia_gives_feeding_lessons.jpg',
            title: 'Alicia Gives Feeding Lessons',
            desc: 'Alicia gives Lucie, Moses, and Felix a lesson in how to feed from a pinky.',
            date: 1417680000,
            url_full: '/zenphoto/albums/2001/12-31/alicia_gives_feeding_lessons.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/alicia_gives_feeding_lessons_1024.jpg?cached=1491244699',
            url_thumb:
                '/zenphoto/cache/2001/12-31/alicia_gives_feeding_lessons_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 0,
        },
        {
            path: '2001/12-31/alicia_lessons2.jpg',
            title: 'Alicia Lessons 2',
            desc: 'More pinky feeding.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/alicia_lessons2.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/alicia_lessons2_1024.jpg?cached=1418095550',
            url_thumb:
                '/zenphoto/cache/2001/12-31/alicia_lessons2_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 1280,
            height: 960,
            index: 1,
        },
        {
            path: '2001/12-31/all_dressed_up.jpg',
            title: 'All Dressed Up',
            desc: 'Everybody&apos;s dressed up for Christmas dinner.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/all_dressed_up.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/all_dressed_up_1024.jpg?cached=1491244712',
            url_thumb:
                '/zenphoto/cache/2001/12-31/all_dressed_up_w200_h200_cw960_ch960_cx61_cy0_thumb.jpg?cached=1419239961',
            width: 1280,
            height: 960,
            index: 2,
        },
        {
            path: '2001/12-31/christmas_dinner.jpg',
            title: 'Christmas Dinner',
            desc: 'Christmas dinner took all the tables in the house.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/christmas_dinner.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/christmas_dinner_1024.jpg?cached=1491244721',
            url_thumb:
                '/zenphoto/cache/2001/12-31/christmas_dinner_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 960,
            height: 1280,
            index: 3,
        },
        {
            path: '2001/12-31/felix_yet_again.jpg',
            title: 'Felix Yet Again',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felix_yet_again.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felix_yet_again_1024.jpg?cached=1491244755',
            url_thumb:
                '/zenphoto/cache/2001/12-31/felix_yet_again_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859755',
            width: 1280,
            height: 960,
            index: 4,
        },
        {
            path: '2001/12-31/felix1.jpg',
            title: 'Felix &amp Milo',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felix1.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felix1_1024.jpg?cached=1418095604',
            url_thumb: '/zenphoto/cache/2001/12-31/felix1_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 1280,
            height: 960,
            index: 5,
        },
        {
            path: '2001/12-31/felix2.jpg',
            title: 'Felix&apos;s First Christmas',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felix2.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felix2_1024.jpg?cached=1418095607',
            url_thumb: '/zenphoto/cache/2001/12-31/felix2_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 960,
            height: 1280,
            index: 6,
        },
        {
            path: '2001/12-31/felix3.jpg',
            title: 'Felix 3',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felix3.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felix3_1024.jpg?cached=1418095609',
            url_thumb: '/zenphoto/cache/2001/12-31/felix3_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 7,
        },
        {
            path: '2001/12-31/felix4.jpg',
            title: 'Felix 4',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felix4.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felix4_1024.jpg?cached=1418095612',
            url_thumb: '/zenphoto/cache/2001/12-31/felix4_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 8,
        },
        {
            path: '2001/12-31/felixs_christmas_supper.jpg',
            title: 'Felix&apos;s Christmas Supper',
            desc: 'Felix has Christmas supper.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felixs_christmas_supper.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felixs_christmas_supper_1024.jpg?cached=1418095617',
            url_thumb:
                '/zenphoto/cache/2001/12-31/felixs_christmas_supper_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 9,
        },
        {
            path: '2001/12-31/felixs_christmas_supper2.jpg',
            title: "Felix's Christmas Supper 2",
            desc: 'Felix has Christmas supper.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felixs_christmas_supper2.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felixs_christmas_supper2_1024.jpg?cached=1418095655',
            url_thumb:
                '/zenphoto/cache/2001/12-31/felixs_christmas_supper2_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859754',
            width: 960,
            height: 1280,
            index: 10,
        },
        {
            path: '2001/12-31/felixs_christmas_supper3.jpg',
            title: "Felix's Christmas Supper 3",
            desc: 'Felix has Christmas supper.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felixs_christmas_supper3.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felixs_christmas_supper3_1024.jpg?cached=1491244748',
            url_thumb:
                '/zenphoto/cache/2001/12-31/felixs_christmas_supper3_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 1280,
            height: 960,
            index: 11,
        },
        {
            path: '2001/12-31/felixs_christmas_supper4.jpg',
            title: 'Felix&apos;s Christmas Supper 4',
            desc: 'Felix has Christmas supper.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/felixs_christmas_supper4.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/felixs_christmas_supper4_1024.jpg?cached=1491244752',
            url_thumb:
                '/zenphoto/cache/2001/12-31/felixs_christmas_supper4_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859750',
            width: 1280,
            height: 960,
            index: 12,
        },
        {
            path: '2001/12-31/first_toy_grab_ever.jpg',
            title: 'First Toy Grab Ever',
            desc: 'The first object Felix ever picked up was a wooden toy from Germany, a gift from Connie.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/first_toy_grab_ever.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/first_toy_grab_ever_1024.jpg?cached=1491244758',
            url_thumb:
                '/zenphoto/cache/2001/12-31/first_toy_grab_ever_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859756',
            width: 1280,
            height: 960,
            index: 13,
        },
        {
            path: '2001/12-31/francoisix1.jpg',
            title: 'Francoisix 1',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/francoisix1.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/francoisix1_1024.jpg?cached=1491244764',
            url_thumb: '/zenphoto/cache/2001/12-31/francoisix1_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859755',
            width: 1280,
            height: 960,
            index: 14,
        },
        {
            path: '2001/12-31/francoisix2.jpg',
            title: 'Francoisix 2',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/francoisix2.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/francoisix2_1024.jpg?cached=1491244771',
            url_thumb: '/zenphoto/cache/2001/12-31/francoisix2_200_w200_h200_cw200_ch200_thumb.jpg?cached=1554514606',
            width: 1280,
            height: 960,
            index: 15,
        },
        {
            path: '2001/12-31/francoisix3.jpg',
            title: 'Francoisix 3',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/francoisix3.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/francoisix3_1024.jpg?cached=1491244773',
            url_thumb: '/zenphoto/cache/2001/12-31/francoisix3_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 16,
        },
        {
            path: '2001/12-31/francoisix4.jpg',
            title: 'Francoisix 4',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/francoisix4.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/francoisix4_1024.jpg?cached=1491244775',
            url_thumb: '/zenphoto/cache/2001/12-31/francoisix4_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 17,
        },
        {
            path: '2001/12-31/grandma_francois.jpg',
            title: 'Grandma Francois',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/grandma_francois.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/grandma_francois_1024.jpg?cached=1510810356',
            url_thumb:
                '/zenphoto/cache/2001/12-31/grandma_francois_200_w200_h200_cw200_ch200_thumb.jpg?cached=1554514606',
            width: 1280,
            height: 960,
            index: 18,
        },
        {
            path: '2001/12-31/king_of_the_swingers.jpg',
            title: 'King Of The Swingers',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/king_of_the_swingers.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/king_of_the_swingers_1024.jpg?cached=1510810360',
            url_thumb:
                '/zenphoto/cache/2001/12-31/king_of_the_swingers_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859754',
            width: 960,
            height: 1280,
            index: 19,
        },
        {
            path: '2001/12-31/mikek.jpg',
            title: 'Mikek',
            desc: 'Mikek had Christmas dinner with us, too.  He was dressed fashionably all in white.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/mikek.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/mikek_1024.jpg?cached=1510810363',
            url_thumb: '/zenphoto/cache/2001/12-31/mikek_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859756',
            width: 960,
            height: 1280,
            index: 20,
        },
        {
            path: '2001/12-31/milk_drunk.jpg',
            title: 'Milk Drunk',
            desc: 'In a milk stupor.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/milk_drunk.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/milk_drunk_1024.jpg?cached=1510810366',
            url_thumb: '/zenphoto/cache/2001/12-31/milk_drunk_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859755',
            width: 1280,
            height: 960,
            index: 21,
        },
        {
            path: '2001/12-31/peeing_in_the_first_bath_ever.jpg',
            title: 'Peeing In First Bath Ever',
            desc: "Felix's first bath ever.  He immediately gave the bathtub a fountain.",
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/peeing_in_the_first_bath_ever.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/peeing_in_the_first_bath_ever_1024.jpg?cached=1510810369',
            url_thumb:
                '/zenphoto/cache/2001/12-31/peeing_in_the_first_bath_ever_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859755',
            width: 1280,
            height: 960,
            index: 22,
        },
        {
            path: '2001/12-31/the_thinker.jpg',
            title: 'The Thinker',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/the_thinker.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/the_thinker_1024.jpg?cached=1510810374',
            url_thumb: '/zenphoto/cache/2001/12-31/the_thinker_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859754',
            width: 1280,
            height: 960,
            index: 23,
        },
        {
            path: '2001/12-31/wild_new_years_eve.jpg',
            title: 'Wild New Years Eve',
            desc: 'Lucie&apos;s really shaking things up on New Year&apos;s Eve.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/wild_new_years_eve.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/wild_new_years_eve_1024.jpg?cached=1510810377',
            url_thumb:
                '/zenphoto/cache/2001/12-31/wild_new_years_eve_200_w200_h200_cw200_ch200_thumb.jpg?cached=1554514606',
            width: 1280,
            height: 960,
            index: 24,
        },
        {
            path: '2001/12-31/wild_new_years_eve2.jpg',
            title: 'Wild New Years Eve 2',
            desc: 'The house was one big rocking party on New Year&apos;s Eve.',
            date: 1382511600,
            url_full: '/zenphoto/albums/2001/12-31/wild_new_years_eve2.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/wild_new_years_eve2_1024.jpg?cached=1510810380',
            url_thumb:
                '/zenphoto/cache/2001/12-31/wild_new_years_eve2_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            width: 1280,
            height: 960,
            index: 25,
        },
        {
            path: '2001/12-31/zonked.jpg',
            title: 'Zonked',
            date: 1417680000,
            url_full: '/zenphoto/albums/2001/12-31/zonked.jpg',
            url_sized: '/zenphoto/cache/2001/12-31/zonked_1024.jpg?cached=1510810384',
            url_thumb: '/zenphoto/cache/2001/12-31/zonked_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859755',
            width: 1280,
            height: 960,
            index: 26,
        },
    ],
    parent_album: {
        path: '2001',
        title: '2001',
        desc:
            '<p><strong>Felix Zed Moses</strong><br />Born December 11, 2001 at 2:17pm</p>\r\n' +
            '<p>Weight<br />4.550 kg <br />10 pounds, 1 ounce</p>\r\n' +
            '<p>Length<br />53 cm<br />20 6/8 inches</p>\r\n' +
            '<p>Head circumference<br />35 cm<br />13 6/8 inches</p>\r\n' +
            '<hr />\r\n' +
            '<p><strong>Pregnancy</strong></p>\r\n' +
            '<p>What did I swallow? <br />A kitten chasing a fly <br />Pass me the Rolaids</p>\r\n' +
            '<p><img src="/pix/img/kitten.gif" alt="" width="92" height="105" /></p>',
        date: 978391026,
        date_updated: 1615765304,
        image_size: 1024,
        thumb_size: 200,
        url_thumb: '/zenphoto/cache/2001/12-16/molix3_200_w200_h200_cw200_ch200_thumb.jpg?cached=1548530110',
    },
    next: {
        path: '2001/12-25',
        title: '12-25',
        desc: "<p>Christmas pictures from Nana's camera.</p>",
        date: 1009310400,
        date_updated: 1615765304,
        customdata: 'Christmas',
        image_size: 1024,
        thumb_size: 200,
        url_thumb:
            '/zenphoto/cache/2001/12-25/christmas_pix_from_mom40_200_w200_h200_cw200_ch200_thumb.jpg?cached=1615765313',
    },
};

const awsAlbum: AwsAlbum = {
    itemType: 'album',
    parentPath: '/2001/',
    itemName: '12-31',
    createdOn: '2001-12-31T08:00:00.000Z',
    updatedOn: '2014-12-04T23:17:06.000Z',
    summary: 'Christmas and New Year',
    published: true,
    children: undefined,
};
