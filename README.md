# Catalog Pull

Turns a supplier's Shopify catalog into a Shopify import CSV.

## Deploy
1. Upload this folder to a new GitHub repo (GitHub Desktop: Add > Add existing repository, then Publish).
2. On Vercel: Add New > Project > import the repo > Deploy. No settings or keys needed.

## Use
1. Enter supplier website (e.g. omandropship.com).
2. Optional: collection handle (the part after /collections/ in the supplier's URL).
3. Set markup (1.8 means selling price = cost x 1.8).
4. Pull products, then Download CSV.
5. Shopify admin > Products > Import > upload the CSV.

## Notes
- Works only on supplier sites built on Shopify.
- Products import as draft. Review before publishing.
- Keep SKUs unchanged. Suppliers match orders by SKU.
- Check the currency. Supplier prices are in the supplier's currency.
- Max 5,000 products per pull. Use collections for bigger catalogs.
