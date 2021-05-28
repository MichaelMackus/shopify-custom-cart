import express from 'express';
import init from './init.js';

// on first-start, store shopify storefront credentials
await init();

// configure static web server
const app = express();
app.use(express.static('./web'));
app.use(express.static('./'));
app.listen(3000, () => {
    console.log("App listening on http://localhost:3000");
});
