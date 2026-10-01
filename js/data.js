/**
 * ============================================================
 *  BIRTHDAY WEBSITE — CONFIGURATION
 * ============================================================
 *
 *  ★  This is the ONLY file you need to edit.  ★
 *
 *  Change the values below to personalize every part of the
 *  website: names, memories, photos, letter, music, and colors.
 *
 * ============================================================
 */

const birthdayData = {

  // ── NAMES ──────────────────────────────────────────────────
  herName: "Jikudi Baby",          // ← Replace with her name
  yourName: "Me",        // ← Replace with your name

  // ── SECTION 1 : OPENING SCREEN ─────────────────────────────
  openingText: "A little universe made for the girl who makes my world feel brighter.",
  openButtonText: "Open your surprise ✦",

  // ── SECTION 2 : BIRTHDAY REVEAL ────────────────────────────
  revealPreText: "Happy Birthday,",
  revealSubText: "For the one who makes my ordinary days feel like a memory worth keeping.",

  // ── SECTION 3 : INTERACTIVE CAKE ───────────────────────────
  cakeText: "Make a wish for all the beautiful moments still to come.",
  cakeMessage: "May this year bring you warmth, laughter, and endless reasons to smile ✨",
  candleCount: 5,  // number of candles on the cake

  // ── SECTION 4 : MEMORIES / OUR STORY ───────────────────────
  memoriesTitle: "The moments I never want to lose.",
  memories: [
    {
      number: "01",
      title: "The Beginning",
      date: "January 2024",
      description:
        "The first moment I realized my days felt brighter just because you were in them.",
      image: "assets/images/placeholder.svg",
    },
    {
      number: "02",
      title: "That One Unforgettable Day",
      date: "March 2024",
      description:
        "The kind of day that changes your whole rhythm and makes your heart say, 'this is it.'",
      image: "assets/images/placeholder.svg",
    },
    {
      number: "03",
      title: "The Little Things",
      date: "June 2024",
      description:
        "The quiet smiles, the warm conversations, the tiny moments I keep replaying in my head.",
      image: "assets/images/placeholder.svg",
    },
    {
      number: "04",
      title: "The Feeling of Us",
      date: "September 2024",
      description:
        "Not the biggest moments, but the ones that made me feel calm, happy, and completely at home.",
      image: "assets/images/placeholder.svg",
    },
  ],

  // ── SECTION 5 : PHOTO GALLERY ─────────────────────────────
  galleryTitle: "Us, in all our favorite colors.",
  gallery: [
    { image: "assets/images/placeholder.svg", caption: "One of my favorite moments with you" },
    { image: "assets/images/placeholder.svg", caption: "That smile that changes everything" },
    { image: "assets/images/placeholder.svg", caption: "This is the kind of memory I want to keep forever" },
    { image: "assets/images/placeholder.svg", caption: "I could get lost in this feeling for hours" },
    { image: "assets/images/placeholder.svg", caption: "Us being exactly who we are" },
    { image: "assets/images/placeholder.svg", caption: "My favorite picture of you, always" },
  ],

  // ── SECTION 6 : THINGS I LOVE ABOUT YOU ────────────────────
  reasonsTitle: "A few of the many reasons I love you…",
  reasons: [
    "The way your smile makes everything feel lighter.",
    "The little habits that make you so uniquely you.",
    "The way you turn ordinary days into something beautiful.",
    "How you make me feel calm, seen, and deeply happy.",
    "The gentleness in your heart and the warmth in your laugh.",
    "The way loving you feels like home.",
  ],

  // ── SECTION 7 : INTERACTIVE SURPRISE ───────────────────────
  surpriseText: "There’s still one last little piece of my heart for you…",
  surpriseButtonText: "Open it ✦",

  // ── SECTION 8 : FINAL LETTER ───────────────────────────────
  letterTitle: "For you, always.",
  finalLetter:
    `Dear Baby,

On your birthday, I just want you to know how much you mean to me.

You are not just someone special in my life — you are the reason my days feel softer, brighter, and more beautiful. The way you laugh, the way you care, the way you make ordinary moments feel full of meaning… all of it stays with me.

I hope you know how deeply I cherish you, how grateful I am for the love we share, and how excited I am for all the beautiful things still ahead of us. I want your life to be filled with peace, laughter, comfort, and love that feels like home.

Happy Birthday, my love. May this year be full of joy, softness, and unforgettable memories made together.

Yours always,
hehe`,

  // ── SECTION 9 : FINAL SCREEN ──────────────────────────────
  closingLine: "May this year bring you endless happiness, deep peace, and all the love you deserve.",

  // ── MUSIC ──────────────────────────────────────────────────
  // Add your own local music files here when they are ready.
  musicTracks: {
    opening: "assets/audio/opening-quiet-morning-promise.mp3",
    reveal: "assets/audio/opening-quiet-morning-promise.mp3",
    cake: "assets/audio/wish-afternoon-of-wishes.mp3",
    memories: "assets/audio/memories-year-well-kept.mp3",
    gallery: "",
    surprise: "assets/audio/open-envelope-note-left-behind.mp3",
    letter: "",
    final: "",
  },
  partySound: "assets/audio/gift-confetti-party.mp3",

  // ── THEME COLORS (optional overrides) ──────────────────────
  // Edit these to change the entire color palette.
  theme: {
    primaryBg:   "#120b1a",
    secondaryBg: "#2d1230",
    accent:      "#f7a8ad",
    accentPink:  "#f9d5e5",
    textPrimary: "#fffaf8",
    textSecondary: "#ead8ee",
    gold:        "#ffd77b",
  },
};

window.birthdayData = birthdayData;
