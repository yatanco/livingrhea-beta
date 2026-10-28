# Editing the site without touching code

The site now has a content editor at **`/admin/`** (e.g.
`https://livingrhea.com/admin/`). You sign in with your GitHub account —
no separate password to remember, no WordPress-style login.

## What you can do today

- **Blog posts**: write a new post, edit an existing one, upload/replace its
  photo (the image field shows the repository images and accepts uploads;
  Astro optimizes the selected source when the site builds), set the
  publish date, mark it a draft (keeps it off the live site until you're
  ready), and set categories.
- **The 8 main pages** (Home, About, Coaching, Himalayan Breathwork, Music,
  Press, Smoothie Movement, Contact): edit the page title and the short
  description search engines show.

## What's deliberately not editable here yet

The 8 main pages were originally built in WordPress's drag-and-drop page
builder, with text, buttons, testimonial sliders, and image layouts
hand-placed in specific spots. That content and layout isn't exposed in the
editor yet — only the title and meta description are, for now. An earlier
version of this editor did expose the page text directly, but it turned out
to show confusing raw markers (like "section-as-seen-on") mixed in with the
real words, with real risk of a non-technical editor accidentally deleting
one and leaving a blank spot on the live page. Rather than ship that, it was
pulled back until it can be rebuilt as clearly labeled fields (one per
actual section) — tracked in `docs/native-content-target.md`. Until then,
a page-text change is a request to your developer, not a self-serve edit.

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
