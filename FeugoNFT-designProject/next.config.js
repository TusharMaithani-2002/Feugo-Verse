/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images:{
    domains:['fuego-marketplace.infura-ipfs.io', "feugo-marketplace.infura.io","via.placeholder.com"]
  },
}

module.exports = nextConfig
