-- Get Zenphoto image tags
SELECT
  concat('/', zenphoto_albums.folder, '/', zenphoto_images.filename) AS path,
  group_concat(zenphoto_tags.name) AS tags
FROM zenphoto_obj_to_tag
JOIN zenphoto_images
  ON zenphoto_obj_to_tag.objectid = zenphoto_images.id
JOIN zenphoto_tags
  ON zenphoto_obj_to_tag.tagid = zenphoto_tags.id
JOIN zenphoto_albums
  ON zenphoto_albums.id = zenphoto_images.albumid
GROUP BY zenphoto_albums.folder, zenphoto_images.filename
ORDER BY zenphoto_albums.folder ASC, zenphoto_images.filename;