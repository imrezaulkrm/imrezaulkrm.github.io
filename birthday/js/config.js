/* =========================================================================
   CONFIG.js
   -------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU SHOULD NEED TO EDIT.

   Everything the website shows — names, dates, unlock time, photos, music,
   voice-over, and every line of text — comes from the single CONFIG object
   below. Nothing personal is hardcoded anywhere else in the project.

   See README.md for a full walkthrough with examples.
   ========================================================================= */

const CONFIG = {

  /* ---------------------------------------------------------------------
     1. UNLOCK TIME
     The website compares the real current time against this timestamp,
     every time it loads. It does NOT use localStorage to remember state.

     date / time are in 24-hour format, in the timezone below.
     timezone must be a valid IANA timezone name (e.g. "Asia/Dhaka",
     "America/New_York", "Europe/London").
  --------------------------------------------------------------------- */
  unlock: {
    date: "2026-09-28",       // YYYY-MM-DD
    time: "00:00:00",         // HH:MM:SS, 24-hour
    timezone: "Asia/Dhaka"
  },

  /* ---------------------------------------------------------------------
     2. THE PERSON
  --------------------------------------------------------------------- */
  person: {
    nickname: "Sinthiii",
    fullName: "Sandia Ahmed Sinthiya"
  },

  /* ---------------------------------------------------------------------
     3. THE BIRTHDAY
     Do not include age anywhere — the site is written to never mention it.
  --------------------------------------------------------------------- */
  birthday: {
    day: "28",
    month: "September",
    displayDate: "28 September",
    customLine: "A beautiful day became a little more special."
  },

  /* ---------------------------------------------------------------------
     4. MEDIA
     Paths are relative to index.html. If a file is missing, the site
     keeps working — it just quietly skips that piece of media.
  --------------------------------------------------------------------- */
  media: {
    waitingMusic: "assets/waiting.mp3",
    birthdayMusic: "assets/birthday.mp3",
    voiceOver: "assets/voice.mp3",

    // Add as many or as few as you like — the gallery renders whatever is here.
    photos: [
      { image: "assets/photo1.jpg", title: "One",   caption: "A morning that felt like a small secret." },
      { image: "assets/photo2.jpg", title: "Two",   caption: "The laugh that gives everything away." },
      { image: "assets/photo3.jpg", title: "Three", caption: "Somewhere, mid-sentence, mid-smile." },
      { image: "assets/photo4.jpg", title: "Four",  caption: "A quiet one. Those are the best kind." },
      { image: "assets/photo5.jpg", title: "Five",  caption: "Still my favourite way to see the day end." }
    ]
  },

  /* ---------------------------------------------------------------------
     5. WAITING SCREEN TEXT
  --------------------------------------------------------------------- */
  texts: {
    waitingEyebrow: "not yet",
    waitingTitle: "Something is waiting for you,\nsomewhere in the whole internet.",
    waitingSubtitle: "Come back when the clock reaches zero.",
    tapToEnter: "Tap to enter",
    tapToBegin: "Tap to begin",

    revealGreeting: "Hey. Happy birthday.",

    heroEyebrow: "midnight",
    heroLine: "HAPPY BIRTHDAY",

    herDayEyebrow: "her day",
    herDayLine: "Today is yours.",

    littleThingsEyebrow: "the little things",
    littleThingsTitle: "Things you probably don't notice about yourself.",

    galleryEyebrow: "a few moments",
    galleryTitle: "The photo journey.",

    choiceEyebrow: "just for fun",
    choiceTitle: "Pick a world.",
    choiceFooter: "Good choice.",

    wishEyebrow: "close your eyes",
    wishTitle: "Make a wish.",
    wishInstruction: "Tap the flame when you're ready.",
    wishAfter: "Keep that wish close.",

    surpriseEyebrow: "one more thing",
    surpriseButton: "There's one more thing...",

    finalEyebrow: "before you go",
    finalMessage: "May this year give you more reasons to smile,\nmore places to go,\nand more moments worth remembering.",
    finalSignoff: "Made especially for you.",

    endingLine: "See you next year."
  },

  /* ---------------------------------------------------------------------
     6. "LITTLE THINGS" CARDS (Scene 04)
     Add or remove as many as you like.
  --------------------------------------------------------------------- */
  chapters: [
    { icon: "☀", title: "When you smile", text: "It shows up before the rest of you catches on. Everyone in the room notices, even the people who won't admit it." },
    { icon: "☾", title: "That laugh", text: "The real one, not the polite one. It's loud, it's sudden, and it makes the whole day sound better." },
    { icon: "✦", title: "The way you focus", text: "When something matters to you, the rest of the world quietly disappears for a while. It's kind of remarkable to watch." },
    { icon: "❖", title: "The small kindnesses", text: "The ones you don't think are a big deal. They usually are — ask anyone who's been on the receiving end." },
    { icon: "◈", title: "How you show up", text: "Rain or shine, tired or not, you show up. That is a quieter kind of impressive that doesn't get said enough." }
  ],

  /* ---------------------------------------------------------------------
     7. "CHOOSE YOUR WORLD" (Scene 06)
  --------------------------------------------------------------------- */
  choices: [
    { key: "night",  icon: "🌙", title: "Night",   message: "Quiet, a little mysterious, and never in a rush. Makes sense." },
    { key: "ocean",  icon: "🌊", title: "Ocean",   message: "Calm on the surface, a lot going on underneath. Also makes sense." },
    { key: "nature", icon: "🌿", title: "Nature",  message: "Grounded, patient, and quietly growing. That tracks." }
  ],

  /* ---------------------------------------------------------------------
     8. "ONE MORE THING" (Scene 08) — the hidden surprise
  --------------------------------------------------------------------- */
  surprise: {
    title: "Found it.",
    text: "This part of the site only exists because you clicked. That's kind of how most good things start — a little curiosity, a small tap, and suddenly there's more than you expected. Happy birthday, for real."
  }

};
