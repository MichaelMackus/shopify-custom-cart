import Client from './node_modules/shopify-buy/index.es.js';

(async function() {
    // Initializing the client using configured credentials
    const config = await fetch('./config.json').then(response => response.json());
    const client = Client.buildClient({
        domain: config.domain,
        storefrontAccessToken: config.storefrontAccessToken
    });

    // Render product to add
    document.querySelector('#products').getAttribute('data-products').split(',').forEach(handle => {
        client.product.fetchByHandle(handle).then(renderProduct);
    });

    const checkoutId = await initCart().then((checkout) => {
        renderCart(checkout);

        return checkout.id;
    });

    function renderProduct(product) {
        const productTemplate = document.querySelector('#product');
        var productEl = productTemplate.content.cloneNode(true);
        productEl.querySelector('.title').textContent = product.title;
        productEl.querySelector('.add-to-cart').setAttribute('data-id', product.id);

        // display images
        product.images.forEach((image) => {
            var imageEl = document.createElement('img');
            imageEl.setAttribute('src', image.src);
            imageEl.setAttribute('alt', image.altText);
            productEl.querySelector('.images').appendChild(imageEl);
        });

        // build options
        product.options.forEach((option) => {
            var optionContainer = document.querySelector('#product-option').content.cloneNode(true);
            var selectOptionEl = optionContainer.querySelector('.select-option');
            selectOptionEl.setAttribute('data-name', option.name);
            option.values.forEach((optionValue) => {
                var optionEl = document.createElement('option');
                optionEl.setAttribute('value', optionValue.value);
                optionEl.textContent = optionValue.value;
                selectOptionEl.appendChild(optionEl);
            });
            optionContainer.querySelector('.option-name').textContent = option.name;
            productEl.querySelector('.options').appendChild(optionContainer);
        });

        // add product on click
        productEl.querySelectorAll('.add-to-cart').forEach((button) => {
            button.addEventListener('click', (e) => {
                var options = {};
                e.target.closest('.product').querySelectorAll('.options select').forEach((selectEl) => {
                    options[selectEl.getAttribute('data-name')] = selectEl.value;
                });

                addProduct(button.getAttribute('data-id'), options);
            }, false);
        });

        document.querySelector('#products').appendChild(productEl);
    }

    function renderCart(cart) {
        var cartEl = document.querySelector('#cart').content.cloneNode(true);

        cartEl.querySelectorAll('.checkout').forEach((checkoutButton) => {
            checkoutButton.setAttribute('href', cart.webUrl);
        });
        cartEl.querySelector('.cart-items').innerHTML = '';
        cartEl.querySelectorAll('.checkout-buttons').forEach((buttons) => {
            buttons.setAttribute('style', '');
        });

        if (cart.lineItems.length == 0) {
            cartEl = document.querySelector('#cart-empty').content.cloneNode(true);
        } else {
            const lineItemTemplate = document.querySelector('#cart-line-item');
            cart.lineItems.forEach((lineItem) => {
                var lineItemEl = lineItemTemplate.content.cloneNode(true);
                lineItemEl.querySelector('.title').textContent = lineItem.title;
                lineItemEl.querySelector('.quantity').textContent = lineItem.quantity;
                lineItemEl.querySelector('.options').textContent = lineItem.variant.title;
                lineItemEl.querySelector('.price').textContent = lineItem.variant.price;
                var imageEl = lineItemEl.querySelector('.image');
                imageEl.setAttribute('src', lineItem.variant.image.src);
                imageEl.setAttribute('alt', lineItem.variant.image.altText);
                cartEl.querySelector('.cart-items').appendChild(lineItemEl);
            });

            // clear cart on click
            cartEl.querySelectorAll('.clear-cart').forEach((clearCartButton) => {
                clearCartButton.addEventListener('click', (e) => {
                    var lineItems = cart.lineItems.map((lineItem) => {
                        return lineItem.id;
                    });
                    client.checkout.removeLineItems(checkoutId, lineItems).then(renderCart);
                }, false);
                clearCartButton.setAttribute('data-bound', true);
            });
        }

        document.querySelector('#cart-container').innerHTML = '';
        document.querySelector('#cart-container').appendChild(cartEl);
    }

    function addProduct(productId, options) {
        client.product.fetch(productId).then((product) => {
            var variantId = null;
            if (options) {
                // get variant ID matching options
                product.variants.forEach((variant) => {
                    var variantOptions = {};
                    variant.selectedOptions.forEach((selectedOption) => {
                        variantOptions[selectedOption.name] = selectedOption.value;
                    });

                    if (objEquals(options, variantOptions)) {
                        variantId = variant.id;
                    }
                });
            } else {
                product.variants[0].id;
            }

            if (!variantId) {
                throw 'Error finding variant ID!';
            }

            // add to cart
            client.checkout.addLineItems(checkoutId, [{
                variantId: variantId,
                quantity: 1,
                customAttributes: [{key: "TestKey", value: "TestValue"}]
            }]).then(renderCart);
        });
    }

    async function initCart() {
        const checkoutId = getCookie('checkoutId');
        if (!checkoutId) {
            // Create an empty checkout
            return await client.checkout.create().then((checkout) => {
                // Do something with the checkout
                console.log('Checkout created with ID: ', checkout.id);
                console.log(checkout);
                document.cookie = "checkoutId=" + checkout.id;
                return checkout;
            });
        } else {
            return await client.checkout.fetch(checkoutId).then((checkout) => {
                return checkout;
            });
        }
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function objEquals(a, b) {
        return Object.keys(a).sort().toString() === Object.keys(b).sort().toString() &&
               Object.values(a).sort().toString() === Object.values(b).sort().toString();
    }
})();
