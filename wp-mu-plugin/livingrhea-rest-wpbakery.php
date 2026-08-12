<?php
/**
 * Plugin Name: LivingRhea — Render WPBakery shortcodes in REST API
 * Description: Makes wp-json/wp/v2/pages and /posts return fully rendered
 *              HTML in content.rendered instead of raw [vc_row]/[vc_column]
 *              WPBakery shortcode text, so the headless Astro frontend gets
 *              real markup. Affects REST responses ONLY — the live theme
 *              frontend is never in this code path and is unchanged.
 * Author: LivingRhea migration
 * Version: 1.0.0
 *
 * WHY THIS IS NEEDED
 * ------------------
 * Core already applies apply_filters('the_content', ...) when it builds the
 * REST `content.rendered` field, but WPBakery (js_composer) does NOT register
 * its shortcode callbacks during a REST_REQUEST. That breaks the_content in
 * two ways:
 *   1. wptexturize (the_content priority 10) only skips REGISTERED shortcodes,
 *      so it smart-quotes the attributes: type="x" becomes type=&#8221;x&#8221;.
 *   2. do_shortcode (the_content priority 11) then can't match them (unknown
 *      tag + curly quotes), so [vc_row] etc. pass through as literal text.
 *
 * Fix: force WPBakery to register all its mapped shortcodes, then re-render
 * from the RAW post_content (the stock content.rendered is already corrupted
 * by step 1, so we must start over from post_content).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ensure WPBakery's shortcode callbacks are registered for the current request.
 * No-op if WPBakery isn't active, so this file is safe to leave in place.
 */
function livingrhea_wpbakery_register_shortcodes() {
	if ( class_exists( 'WPBMap' ) && method_exists( 'WPBMap', 'addAllMappedShortcodes' ) ) {
		// This is the same call WPBakery uses to make shortcodes resolvable
		// outside a normal frontend render (e.g. its own AJAX endpoints).
		WPBMap::addAllMappedShortcodes();
	}
}

/**
 * Re-render content.rendered from raw post_content with WPBakery shortcodes
 * registered first. Wired to rest_prepare_page / rest_prepare_post, which only
 * fire during REST responses — the theme frontend never hits this.
 *
 * @param WP_REST_Response $response
 * @param WP_Post          $post
 * @param WP_REST_Request  $request
 * @return WP_REST_Response
 */
function livingrhea_rest_render_content( $response, $post, $request ) {
	// Respect password-protected / empty content: leave core's output alone.
	if ( empty( $post->post_content ) || ! empty( $post->post_password ) ) {
		return $response;
	}

	livingrhea_wpbakery_register_shortcodes();

	// Start from RAW post_content — the existing rendered field is already
	// mangled by wptexturize before shortcodes were available.
	$rendered = apply_filters( 'the_content', $post->post_content );
	$rendered = str_replace( ']]>', ']]&gt;', $rendered );

	$response->data['content']['rendered'] = $rendered;

	return $response;
}

add_filter( 'rest_prepare_page', 'livingrhea_rest_render_content', 10, 3 );
add_filter( 'rest_prepare_post', 'livingrhea_rest_render_content', 10, 3 );
