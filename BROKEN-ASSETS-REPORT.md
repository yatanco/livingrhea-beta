# Legacy media recovery

The migration checks every local asset link in the generated site. No referenced local image is missing.

Twenty unavailable inline image references appeared in the public WordPress export. Fourteen were recovered from original files already in the archive. Six references were omitted: two decorative emoji icons, two raw-vegan-yogurt thumbnails, and two other legacy content images.

See `migration/image-recovery.json` for the exact source paths and replacements. WordPress export snapshots are preserved in `migration/` for comparison. Missing originals may be recovered from a WordPress backup; admin access is not required for the static site's ongoing operation.
