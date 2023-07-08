/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'https',
        hostname: 'x.darkrally.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'https://raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
  swcMinify: true,
  env: {
    MORALIS_API_KEY:
      'HSEjJQ1nogzfHbgtAf8T1Ty16bqgz4umobJQyKoGwMtZWMrE4396kwBgDzFxcyPj',
    NEXT_APP_SERVER_URL: 'http://localhost:4000',
    NEXT_CONTRACT_ABI:
      '[{"inputs":[{"internalType":"address","name":"_billetera","type":"address"}],"name":"usuarioConectado","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_billetera","type":"address"}],"name":"usuarioDesConectado","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_billetera","type":"address"}],"name":"usuariosConectado","outputs":[{"internalType":"bool","name":"conectado","type":"bool"}],"stateMutability":"view","type":"function"}]',
  },

  // Uncoment to add domain whitelist
  // images: {
  //   domains: [
  //     'res.cloudinary.com',
  //   ],
  // },

  // SVGR
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
