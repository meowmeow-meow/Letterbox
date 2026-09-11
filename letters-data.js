/*
  💌 LETTERS DATA 💌
  ------------------
  This is the only file you need to touch to add, remove, or edit letters.

  HOW MATCHING WORKS
  - The key ("Alice") is the first name someone types into the keypad.
  - Matching is CASE-SENSITIVE — "Alice" will not match "alice" or "ALICE".
    Type the key exactly the way you want the person to type their name.
  - After a name matches, the person must also enter the "password" you
    set for them before the letter will reveal its contents. Think of it
    as a second layer just for that person.

  THEMES (design templates)
  - `theme` picks one of the named looks defined in themes.js — it colors
    the 3D envelope + stamp AND the final letter card design, so each
    person can have a completely different vibe.
  - Current options: "classicPink", "skyBlue", "lavenderDream",
    "mintyCyan", "galaxyNight". Leave it out and it defaults to classicPink.
  - Want a new template entirely (different colors/icon/card pattern)?
    Add one to themes.js — see the comment at the top of that file.

  HOW TO ADD SOMEONE NEW
  1. Copy one whole block below, from the opening `"Name": {` to the
     closing `},`
  2. Paste it right before the final closing `};`
  3. Change the key to their name, set a password + theme, and write
     your letter.

  WRITING THE LETTER TEXT
  - Use "\n" for a line break, and "\n\n" for a blank line between
    paragraphs.
  - Keep quotes escaped if you use them inside the text, e.g. \"like this\".
*/

const LOVE_LETTERS = {
  "Alice": {
    password: "sunflower",
    theme: "classicPink",
    signature: "— Yours always",
    letter:
      "Dear Alice,\n\n" +
      "I don't say this enough, so I'm saying it here, in a mailbox, " +
      "of all places: I'm so glad you exist.\n\n" +
      "Thank you for every ordinary Tuesday you made feel like a good day.\n\n" +
      "With love,\n" +
      "Me"
  },

  "Sam": {
    password: "starlight",
    theme: "skyBlue",
    signature: "— Always in your corner",
    letter:
      "Dear Sam,\n\n" +
      "You have this way of making hard days lighter without even " +
      "trying. I noticed. I always notice.\n\n" +
      "Here's to more of the good stuff.\n\n" +
      "Love,\n" +
      "Me"
  },

  "Mina": {
    password: "moonflower",
    theme: "lavenderDream",
    signature: "— With all my quiet admiration",
    letter:
      "Dear Mina,\n\n" +
      "You think in a way nobody else does, and I hope you never let " +
      "anyone talk you out of that.\n\n" +
      "So glad this life put you in mine.\n\n" +
      "Love,\n" +
      "Me"
  },

  "Theo": {
    password: "seaglass",
    theme: "mintyCyan",
    signature: "— Your biggest fan",
    letter:
      "Dear Theo,\n\n" +
      "Every plan is better with you in it. Every joke lands better " +
      "when you're the one laughing at it with me.\n\n" +
      "Here's to whatever's next.\n\n" +
      "Love,\n" +
      "Me"
  },

  // Copy the block above to add more people. Example template:
  //
  // "NameHere": {
  //   password: "secretword",
  //   theme: "galaxyNight",
  //   signature: "— Your line here",
  //   letter:
  //     "Dear NameHere,\n\n" +
  //     "Write your message here.\n\n" +
  //     "Love,\n" +
  //     "Me"
  // },
};

// Used by main.js — don't need to touch this line.
export default LOVE_LETTERS;
