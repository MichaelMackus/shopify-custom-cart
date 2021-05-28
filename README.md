# Simplistic Custom Shopify Cart

This repository demonstrates the simplicity of using the Shopify Storefront JS
SDK to replicate the "buy button" functionality. The functionality replicates a
shopping cart with minimal custom code. This seems more flexible & customizable
than Shopify's buy button JS.

The code is separated into two applications - a minimalistic web server (only
necessary to get around browser CORS issues), and the web application (in the
[web](web) folder).

By default, the application displays the product with the handle/slug of
"test-product". This handle can be configured by editing the [frontend HTML
file](web/index.html) and changing "data-products" to the product(s) you
wish to display (comma separated).
