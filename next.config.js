const { env } = require("./src/server/env");
const languages = require("./data/languages.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: languages,
    defaultLocale: 'en',
  }
};

console.log(nextConfig)

module.exports = nextConfig;
