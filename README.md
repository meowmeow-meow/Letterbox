# my love letters 💌

A little pastel 3D mailbox site. Someone types their first name on the keypad,
and if you've written them a letter, they can pull the stamp off the envelope,
swipe up to open it, and unlock it with a password only they know.

## What's in here

```
index.html        the page (loads everything else)
style.css         pastel theme + fonts + one CSS "design template" per theme
main.js           the three.js scene: mailbox, keypad, envelope, all the logic
themes.js         named design templates (colors, stamp icon, card pattern)
letters-data.js   <-- the file you'll touch most often, day to day
```

## Note to self: On adding or editing letters

Open `letters-data.js`. Everything lives in one object:

```js
const LOVE_LETTERS = {
  "Alice": {
    password: "sunflower",
    signature: "— Yours always",
    letter:
      "Dear Alice,\n\n" +
      "...\n\n" +
      "With love,\nMe"
  },
};
```

- **The key is the exact name they must type.** Matching is **case-sensitive**
  — `"Alice"` will not match `alice` or `ALICE`. Type the key exactly the way
  you want them to type it.
- **`password`** is the secret word you give that person separately (text
  them, tell them in person, whatever you like). It's also case-sensitive.
- **`signature`** is optional flavor text shown under the letter.
- **`letter`** is the message. Use `\n` for a line break and `\n\n` for a
  blank line between paragraphs.

To add someone new, copy one whole `"Name": { ... },` block, paste it above
the closing `};`, and fill it in. No other file needs to change.

## Giving each person their own design

Add a `theme` field to any letter and it changes the envelope color, the
stamp icon, and the whole look of the final letter card:

```js
"Mina": {
  password: "moonflower",
  theme: "lavenderDream",
  letter: "..."
}
```

Built-in templates (defined in `themes.js`):

| key             | vibe                                   |
|-----------------|-----------------------------------------|
| `classicPink`   | pink envelope, heart stamp (default)    |
| `skyBlue`       | blue envelope, star stamp               |
| `lavenderDream` | purple envelope, cherry blossom stamp   |
| `mintyCyan`     | cyan envelope, leaf stamp               |
| `galaxyNight`   | deep purple envelope, sparkle stamp     |

Leave `theme` out entirely and it quietly falls back to `classicPink`.

**Want a brand new template** (different colors, a different stamp icon,
a different card pattern)? Open `themes.js`, copy one block, and give it a
new key — then add a matching `.theme-your-key` CSS block near the bottom
of `style.css` (copy one of the existing ones as a starting point; it
controls the accent color, border, and the little background pattern on
the finished letter card).

## Running it locally

Because the site uses ES modules (`import`/`export`), you can't just double-click
`index.html` — browsers block module imports over the `file://` protocol.
Serve it with any tiny local server, for example:

```bash
cd love-letters
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a new GitHub repo and push these files to the root (or to a `/docs`
   folder — just remember which you pick).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch,"
   pick your branch (e.g. `main`) and the folder you used (`/` or `/docs`).
4. Save. GitHub gives you a URL like `https://yourname.github.io/repo-name/`
   within a minute or two.
5. Every time you edit `letters-data.js` and push, the live site updates
   automatically.

## How the flow works

1. Person walks up (well, opens the site) and types their first name on the
   3D keypad — it shows up on the little screen in a code font, live.
2. Press **Enter** (or click the pink **ENTER** button on the keypad).
3. If the name matches, the mailbox door swings open, the flag flips up, and
   a 💌 envelope floats out toward the camera.
4. Click/tap the heart stamp to peel it off.
5. Swipe up (drag upward with your mouse or finger) to open the envelope.
6. A password prompt appears — enter the word you assigned that person.
7. If it matches, the letter reveals itself on a soft paper card.

Closing the letter resets the mailbox so someone else can use it.

## Notes

- Everything is plain HTML/CSS/JS + three.js loaded from a CDN via an import
  map — no build step, no `npm install`, which is exactly what GitHub Pages
  wants.
- If you'd rather have people type on a real keyboard-looking input instead of
  just typing anywhere on the page, you can wire an `<input>` element up to
  the same `drawScreen()` function in `main.js` — the 3D screen just needs a
  string to draw.

## About the rendering

A few things make the scene look softer and more believable without needing
any external images or 3D models:

- **Environment lighting** — a procedurally generated "room" environment
  (via three.js's `RoomEnvironment`) gives the glossy plastic mailbox and
  keypad soft, realistic reflections, no HDRI file needed.
- **Clearcoat materials** — the mailbox, keypad, and envelope use
  `MeshPhysicalMaterial` with a light clearcoat layer, which is what gives
  them that glossy, candy-coated "toy" look instead of flat plastic.
- **Bloom** — a subtle post-processing glow (`UnrealBloomPass`) softens
  bright highlights for a dreamier feel. It's turned down low on purpose;
  bump the first number in the `UnrealBloomPass(...)` call in `main.js` if
  you want it dreamier or more subdued.
- **Procedural grain** — paper and plastic surfaces get a tiny generated
  bump texture instead of being perfectly smooth, which reads as more
  tactile up close.
- **The stamp** is drawn on a small canvas at runtime — the scalloped
  perforated edge is "punched" out of a rounded square using canvas
  compositing, then the theme's icon and accent color are drawn on top.
  That's also why changing a stamp icon is just a one-line change in
  `themes.js`.
- **Floating sparkles** drift gently near the mailbox for a bit of ambient
  whimsy — they're small additive-blended glow sprites, not particles from
  an image file.
