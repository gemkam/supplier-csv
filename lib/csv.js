export const COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
  "Option3 Name", "Option3 Value", "Variant SKU", "Variant Grams",
  "Variant Inventory Tracker", "Variant Inventory Policy",
  "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
  "Variant Requires Shipping", "Variant Taxable", "Image Src",
  "Image Position", "Image Alt Text", "Status",
];

const REF_COLUMNS = ["Supplier Cost", "Supplier In Stock"];

function esc(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function markupPrice(price, markup) {
  const n = parseFloat(price);
  return Number.isFinite(n) ? (n * markup).toFixed(2) : price ?? "";
}

export function buildRows(products, { markup = 1, status = "draft", reference = false }) {
  const cols = reference ? [...COLUMNS, ...REF_COLUMNS] : COLUMNS;
  const rows = [];
  for (const p of products) {
    const names = [...p.options, "", "", ""];
    p.variants.forEach((v, i) => {
      const first = i === 0;
      const img = first ? p.images[0] || "" : "";
      const r = {
        Handle: p.handle,
        Title: first ? p.title : "",
        "Body (HTML)": first ? p.body_html : "",
        Vendor: first ? p.vendor : "",
        Type: first ? p.product_type : "",
        Tags: first ? p.tags : "",
        Published: first ? "TRUE" : "",
        "Option1 Name": first ? names[0] : "",
        "Option1 Value": v.option1,
        "Option2 Name": first ? names[1] : "",
        "Option2 Value": v.option2,
        "Option3 Name": first ? names[2] : "",
        "Option3 Value": v.option3,
        "Variant SKU": v.sku,
        "Variant Grams": v.grams,
        "Variant Inventory Tracker": "",
        "Variant Inventory Policy": "continue",
        "Variant Fulfillment Service": "manual",
        "Variant Price": markupPrice(v.price, markup),
        "Variant Compare At Price": v.compare_at_price,
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "FALSE",
        "Image Src": img,
        "Image Position": img ? 1 : "",
        "Image Alt Text": img ? p.title : "",
        Status: first ? status : "",
        "Supplier Cost": v.price,
        "Supplier In Stock": v.available ? "yes" : "no",
      };
      rows.push(r);
    });
    p.images.slice(1).forEach((src, k) => {
      rows.push({ Handle: p.handle, "Image Src": src, "Image Position": k + 2, "Image Alt Text": p.title });
    });
  }
  return { cols, rows };
}

export function toCsv(products, opts) {
  const { cols, rows } = buildRows(products, opts);
  const lines = [cols.map(esc).join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  return "\uFEFF" + lines.join("\r\n");
}
