module.exports = {
  //... existing configurations ...
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' https://cdn.jsdelivr.net https://cdn.skypack.dev;
              style-src 'self' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              frame-src 'self' https://www.youtube.com;
              object-src 'none';
              upgrade-insecure-requests;
            `,
          },
        ],
      },
    ];
  },
};