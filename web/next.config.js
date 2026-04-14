module.exports = {
  //... existing config
  experimental: {
    //... existing experimental config
    swcPlugins: [
      //... existing swc plugins
      [
        'next-swc-plugin-service-worker',
        {
          //... existing service worker config
        },
      ],
    ],
  },
};

Note: The above code sets up a basic PWA manifest, service worker registration, and offline support using Next.js built-in features. The `next.config.js` file is updated to include the service worker plugin. The `serviceWorkerRegistration.ts` file registers the service worker, and the `pages/_app.tsx` file calls the registration function. The `public/manifest.json` file defines the PWA manifest. 

Please ensure to update the `icon.png` and `favicon.ico` files in the `public` directory to match your application's branding. 

Also, note that this is a basic setup, and you may need to customize the service worker to fit your specific use case. Additionally, you will need to add an install prompt to your application to allow users to install it as a PWA.