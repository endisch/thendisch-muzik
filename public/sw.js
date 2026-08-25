self.addEventListener('install', (event) => {
  console.log('Thendisch Studio Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // Pass-through to allow installation prompt
});
