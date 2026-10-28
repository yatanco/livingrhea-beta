# Legacy media recovery

The build audit checks generated local links, images, stylesheets, scripts, and same-page anchors. The final audited build has no missing directly referenced local assets.

Twenty unavailable inline image references appeared in the public WordPress export. Fourteen expert image variants were recovered from originals already present. Six references were omitted (two emoji icons, two raw-vegan-yogurt thumbnails, and two other legacy content images). Two additional NextGen editor-preview image references were also removed because they are WordPress editor endpoints rather than deployable images.

See `migration/image-recovery.json` for the original six unresolved paths and fourteen recoveries. Twenty-eight unavailable responsive image-size candidates were removed so browsers can use the available image source. No lost image has been fabricated or replaced with unrelated imagery.
