import test from 'node:test';
import assert from 'node:assert/strict';
import { activeStyles } from '../integrations/critical-css.mjs';
test('critical extraction preserves cascade, responsive rules, fonts and interactive states', () => {
  const css='@font-face{font-family:Local;src:url(/local.woff2)}.present{color:red}.absent{color:blue}@media(max-width:600px){.present:hover{color:green}.absent{color:pink}}#header-outer.open .new-menu{display:block}.present{color:black}';
  const result=activeStyles(css,'<div class="present"></div><header id="header-outer"></header>');
  assert.match(result, /@font-face/);
  assert.match(result, /@media\(max-width:600px\)/);
  assert.match(result, /\.present:hover/);
  assert.match(result, /#header-outer.open \.new-menu/);
  assert.doesNotMatch(result,/\.absent/);
  assert.ok(result.indexOf('color:red') < result.indexOf('color:black'));
});
