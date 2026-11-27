/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'trilhadosucesso.com.br',
      'images.unsplash.com',
      'i.postimg.cc',
      'img.youtube.com'
    ],
  },
};

module.exports = nextConfig;
