/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config

// Note: Tailwind CSS v4 requires @tailwindcss/postcss in devDependencies
// and is used as the primary PostCSS plugin
