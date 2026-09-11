/*
  💌 DESIGN TEMPLATES 💌
  ----------------------
  These are reusable "themes" you can assign to any letter in
  letters-data.js by writing e.g.  theme: "skyBlue"

  Each theme controls:
  - the 3D envelope + flap color
  - the stamp icon + stamp accent color
  - which CSS design (cssClass) the final letter card uses — see the
    matching ".theme-..." rules near the bottom of style.css

  To add a new template: copy a whole block, give it a new key, change
  the colors/icon/cssClass, then add a matching CSS block in style.css.
  If a letter's `theme` key doesn't match anything here, it quietly
  falls back to "classicPink".
*/

const THEMES = {
  classicPink: {
    label: 'Classic Pink',
    envelopeColor: 0xffd7ea,
    flapColor: 0xff9cc7,
    stampIcon: '💗',
    stampColor: '#ff9cc7',
    cssClass: 'theme-classic-pink'
  },

  skyBlue: {
    label: 'Sky Blue',
    envelopeColor: 0xdaeeff,
    flapColor: 0x8fc4ff,
    stampIcon: '⭐',
    stampColor: '#6fa8e0',
    cssClass: 'theme-sky-blue'
  },

  lavenderDream: {
    label: 'Lavender Dream',
    envelopeColor: 0xece0ff,
    flapColor: 0xb98cff,
    stampIcon: '🌸',
    stampColor: '#a874e8',
    cssClass: 'theme-lavender-dream'
  },

  mintyCyan: {
    label: 'Minty Cyan',
    envelopeColor: 0xd8faf3,
    flapColor: 0x7fe0d1,
    stampIcon: '🍃',
    stampColor: '#4bbfa9',
    cssClass: 'theme-minty-cyan'
  },

  galaxyNight: {
    label: 'Galaxy Night',
    envelopeColor: 0xd6c6f7,
    flapColor: 0x7c5cc7,
    stampIcon: '✨',
    stampColor: '#6a4fa3',
    cssClass: 'theme-galaxy-night'
  }
};

export default THEMES;
