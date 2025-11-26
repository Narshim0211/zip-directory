const routes = require('./routes/chatRoutes');

console.log('Chat routes loaded:', typeof routes);
console.log('Is Router?:', routes.constructor.name);

if (routes.stack) {
  console.log('\nRegistered routes:');
  routes.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`  ${methods} ${layer.route.path}`);
    }
  });
} else {
  console.log('No routes found in stack');
}
