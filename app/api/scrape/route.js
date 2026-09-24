import { NextResponse } from "next/server";

export const maxDuration = 60;

const MAX_PAGES = 20; // 20 x 250 = 5000 products max

function cleanSite(input) {
  let s = String(input || "").trim();
  if (!s) throw new Error("Enter a supplier website.");
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  const u = new URL(s);
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    !host.includes(".")
  ) {
    throw new Error("Use a public website address, like omandropship.com");
  }
  return `https://${host}`;
}

function cleanHandle(h) {
  const v = String(h || "").trim().toLowerCase();
  if (!v) return "";
  if (!/^[a-z0-9-]+$/.test(v)) throw new Error("Collection should look like: home-and-kitchen");
  return v;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const site = cleanSite(body.site);
    const collection = cleanHandle(body.collection);
    const path = collection ? `/collections/${collection}/products.json` : "/products.json";

    const products = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `${site}${path}?limit=250&page=${page}`;
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (catalog export)", Accept: "application/json" },
        cache: "no-store",
      });
      if (r.status === 404) {
        throw new Error(
          collection
            ? `Collection "${collection}" was not found on ${site}.`
            : `${site} does not share its product list. It may not be a Shopify store.`
        );
      }
      if (r.status === 429) throw new Error("The supplier site is limiting requests. Wait a minute and try again.");
      if (!r.ok) throw new Error(`The supplier site answered with error ${r.status}.`);

      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("json")) throw new Error(`${site} does not share its product list. It may not be a Shopify store.`);

      const data = await r.json();
      const batch = data.products || [];
      if (!batch.length) break;
      products.push(...batch);
      if (batch.length < 250) break;
    }

    const slim = products.map((p) => ({
      handle: p.handle,
      title: p.title,
      body_html: p.body_html || "",
      vendor: p.vendor || "",
      product_type: p.product_type || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      options: (p.options || []).map((o) => o.name),
      images: (p.images || []).map((i) => i.src),
      variants: (p.variants || []).map((v) => ({
        option1: v.option1 || "",
        option2: v.option2 || "",
        option3: v.option3 || "",
        sku: v.sku || "",
        grams: v.grams || 0,
        price: v.price,
        compare_at_price: v.compare_at_price || "",
        available: v.available,
      })),
    }));

    return NextResponse.json({ site, collection, count: slim.length, products: slim });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 400 });
  }
}
