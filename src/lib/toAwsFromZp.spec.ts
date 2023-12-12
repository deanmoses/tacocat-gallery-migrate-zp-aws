import { AwsAlbum, AwsGalleryItem, AwsImageItem, Rectangle } from './awsTypes.js';
import { convertAlbum, convertCrop, convertImage } from './toAwsFromZp.js';
import { ZenphotoAlbum, ZenphotoImageItem } from './zenphotoTypes.js';

describe('parseCrop', () => {
    const tests: { url: string; expected: Rectangle | undefined }[] = [
        {
            url: '/zenphoto/cache/2001/12-31/image_200_w200_h200_cw200_ch200_thumb.jpg?cached=1552859752',
            expected: {
                width: 200,
                height: 200,
            },
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
        it(`Parse ${test.url} → ${JSON.stringify(test.expected)}`, () => {
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
        thumbnail: {
            height: 200,
            width: 200,
        },
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
