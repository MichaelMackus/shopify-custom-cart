import fs from 'fs';
import readline from 'readline';

export default function() {
    if (!isConfigured('./config.json')) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        var config = {};

        return new Promise((resolve, reject) => {
            rl.question("Please enter your store's URL without http(s) (e.g. mystore.myshopify.com): ", domain => {
                config.domain = domain;
                rl.question("Please enter your storefront access token (see https://shopify.dev/docs/storefront-api/getting-started#private-app): ", storefrontAccessToken => {
                    config.storefrontAccessToken = storefrontAccessToken;
                    rl.close();
                    fs.writeFileSync('./config.json', JSON.stringify(config));
                    resolve();
                });
            });
        });
    }

    return new Promise((resolve, reject) => {
        resolve();
    });
}

function isConfigured(fname) {
    if (!fs.existsSync(fname))
        return false;

    try {
        const config = JSON.parse(fs.readFileSync(fname));

        return config.domain && config.storefrontAccessToken;
    } catch (err) {
        return false;
    }
}
