# Editing the site without touching code

The site now has a content editor at **`/admin/`** (e.g.
`https://livingrhea.com/admin/`). You sign in with your GitHub account —
no separate password to remember, no WordPress-style login.

## What you can do today

- **Blog posts**: write a new post, edit an existing one, upload/replace its
  photo, set the publish date, mark it a draft (keeps it off the live site
  until you're ready), and set categories.
- **The 8 main pages** (Home, About, Coaching, Himalayan Breathwork, Music,
  Press, Smoothie Movement, Contact): edit the page title, the short
  description search engines show, and the page's written text.

## What's deliberately not editable here yet

The 8 main pages were originally built in WordPress's drag-and-drop page
builder, with buttons, testimonial sliders, and image layouts hand-placed
in specific spots. That visual layout isn't exposed in the editor yet — only
the title, meta description, and body text are. If you want to rearrange
buttons, add a new testimonial, or change a layout, that's still a
request to your developer for now, not a self-serve edit. Rebuilding the
main pages as fully editable sections (so you *can* do that yourself) is
tracked as follow-up work, not done in this first pass.

## One important rule when editing a page's text

Each main page's text is broken into labeled sections (you'll see headings
like "Page text" with sub-headings in the editor). **Don't delete or rename
a heading line** — the words under it fill one specific, already-styled
spot on the live page. Editing the words under a heading is exactly what
to do; moving or removing the heading itself leaves that spot blank on the
live page.

## How publishing works

Every change you save becomes a **draft**, not an instant live edit. The
editor shows you a status (draft → ready for review → published). Before
you publish, you can preview what changed. This is the same safety net
your developer uses — your edits go through the same review step as any
code change, so nothing reaches the live site by accident. When you're
happy with a draft, publish it from the editor and it goes live within a
minute or two (the time it takes the site to rebuild).

## Signing in for the first time

1. Go to `/admin/` on the site.
2. Click **Sign in with GitHub**.
3. The first time, GitHub will ask you to authorize the connection — approve
   it. (If you don't have a GitHub account yet, your developer needs to
   invite you as a collaborator on the repository first — ask them.)

If sign-in doesn't work, tell your developer — it usually means the
one-time setup (see `docs/cms-architecture.md`) hasn't been finished yet,
not something wrong on your end.
