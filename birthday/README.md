# Happy Birthday — a small interactive website

A cinematic, mobile-first birthday site with a live countdown, a scripted
unlock moment, and ten scroll-through scenes. No backend, no build step —
just static files.

## The only file you need to edit

**`js/config.js`** — everything personal lives there: name, dates, unlock
time, timezone, photos, music, voice-over, and every line of text. You
should never need to touch `index.html`, `css/style.css`, or `js/app.js`
for normal personalization.

## Quick recipe: "unlock at 28 September 2026, 12:05 AM Bangladesh time"

Open `js/config.js` and set:

```js
unlock: {
  date: "2026-09-28",
  time: "00:05:00",
  timezone: "Asia/Dhaka"
}
```

That's it. The site works out the countdown for every visitor, in their own
local time, from that one timestamp.

## How the timezone logic works

`unlock.timezone` is the timezone **the date and time are written in** —
not the visitor's timezone. The site converts that wall-clock moment into
a single real point in time (an instant on the universal timeline), then
compares every visitor's own clock against that same instant. So:

- Someone in Dhaka, someone in New York, and someone in London will all see
  the countdown hit zero **at the same real moment** — just displayed
  differently if you were showing local clock times (this site only shows
  a relative countdown, so there's nothing to convert on display).
- Use any valid [IANA timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones),
  e.g. `"Asia/Dhaka"`, `"America/New_York"`, `"Europe/London"`.

The unlock check runs fresh every time the page loads — it never reads
`localStorage` to remember whether it's "already been unlocked." If you
open the link a week later, you get the full unlocked site immediately,
no countdown.

## Editing checklist

| To change...            | Edit in `config.js`               |
|--------------------------|-----------------------------------|
| Nickname / full name     | `person.nickname`, `person.fullName` |
| Birthday date shown       | `birthday.day`, `birthday.month`, `birthday.displayDate` |
| Unlock date/time/timezone | `unlock.date`, `unlock.time`, `unlock.timezone` |
| Photos                   | `media.photos` (array of `{ image, title, caption }`) |
| Music / voice-over        | `media.waitingMusic`, `media.birthdayMusic`, `media.voiceOver` |
| "Little things" cards     | `chapters` (array of `{ icon, title, text }`) |
| "Choose your world" options | `choices` (array of `{ key, icon, title, message }`) |
| The hidden surprise        | `surprise.title`, `surprise.text` |
| Every other line of text  | `texts.*` |

## Adding your own media

Drop your files into `assets/`:

```
assets/
├── waiting.mp3     ← plays softly during the countdown
├── birthday.mp3    ← plays once the site unlocks
├── voice.mp3       ← a short "Hey... Happy birthday" clip (a few seconds is plenty)
├── photo1.jpg
├── photo2.jpg
└── ...
```

Then point `media.photos[].image` and the three `media.*Music`/`voiceOver`
fields at the right filenames. If a file is missing, the site keeps
working — a missing photo shows a quiet placeholder, and missing audio is
skipped silently (check the browser console for a note).

You can add or remove as many photos, cards, and choices as you want —
the page renders whatever is in the arrays.

## Why there's a "tap to begin" moment

Phones and browsers block audio from starting on its own — a website is
not allowed to just start playing sound the instant it loads. So instead
of pretending that isn't true, the site is honest about it with a small,
elegant tap prompt. One tap is all it takes, and everything (voice-over,
music, animations) is cinematically sequenced from that point.

If the visitor arrives **after** the unlock time, they still see the full
page and content immediately — the tap prompt there is only there to
start the audio, not to gate the content.

## Testing the unlock logic yourself

Temporarily set `unlock.date`/`unlock.time` to a minute or two in the
future, reload, and watch it transition on its own. Then set it to
yesterday and reload — you should land straight in the unlocked
experience with no countdown at all. Set it back when you're done.

## Deploying

This is a fully static site — three files plus an `assets/` folder. Any
static host works:

- **GitHub Pages** — push this folder to a repo, enable Pages on the
  `main` branch (root).
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or
  connect the repo. No build command needed.

## File structure

```
birthday-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js     ← edit this
│   └── app.js
├── assets/
│   └── (your photos, music, and voice-over go here)
└── README.md
```
