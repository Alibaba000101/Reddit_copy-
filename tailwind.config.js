/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /*
       * WORLDPOST RUGGED COLOR PALETTE
       * Forest green / military aesthetic
       * Earthy, muted tones for vintage forum vibe
       */
      colors: {
        // Background colors - dark forest tones
        'wp-dark': '#1a1f1a',         // Main background - deep forest
        'wp-card': '#252b25',          // Card surfaces - aged paper feel
        'wp-hover': '#2d352d',         // Hover state - subtle lift
        'wp-secondary': '#232823',     // Secondary backgrounds

        // Border colors - visible but not harsh
        'wp-border': '#3a4a3a',        // Main borders
        'wp-border-light': '#2f3f2f',  // Subtle dividers
        'wp-border-rough': '#4a5a4a',  // Emphasized borders

        // Brand colors - earthy greens
        'wp-green': '#4a7c4a',         // Primary accent - forest green
        'wp-green-hover': '#5a8c5a',   // Hover state
        'wp-green-dark': '#2d4a2d',    // Dark accent
        'wp-green-muted': '#3d5a3d',   // Muted green

        // Text colors - warm, aged tones
        'wp-text': '#d4d8c8',          // Primary text - warm off-white
        'wp-text-secondary': '#a8b098', // Secondary text
        'wp-text-muted': '#7a8a70',    // Muted - faded ink
        'wp-text-accent': '#8fbc8f',   // Accent - sage green

        // Functional colors - earthy variants
        'wp-upvote': '#6b8e23',        // Olive green upvote
        'wp-downvote': '#8b4513',      // Saddle brown downvote
      },
      // Max width for centered content
      maxWidth: {
        'content': '1200px',
      },
      /*
       * RUGGED BORDER RADIUS
       * Less rounded, more angular for rough aesthetic
       */
      borderRadius: {
        'rugged': '3px',
        'rugged-sm': '2px',
      },
      /*
       * RUGGED SHADOWS
       * Deeper, more pronounced for tactile feel
       */
      boxShadow: {
        'rugged': '0 3px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
        'rugged-hover': '0 6px 16px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)',
        'rugged-inset': 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
