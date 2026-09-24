"use client";
import { useState } from "react";
import { toCsv } from "@/lib/csv";

const SUGGESTED = ["omandropship.com", "coddropshipping.com"];

export default function Home() {
  const [site, setSite] = useState("");
  const [collection, setCollection] = useState("");
  const [markup, setMarkup] = useState("1.8");
  const [reference, setReference] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const m = parseFloat(markup) > 0 ? parseFloat(markup) : 1;

  async function pull(e) {
    e.preventDefault();
    setLoading(true); setError(""); setData(null);
    try {
      const r = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, collection }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      if (!j.count) throw new Error("No products found. Check the website or collection name.");
      setData(j);
    } catch (err) {
      setError(err.message || "Could not pull products.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const csv = toCsv(data.products, { markup: m, reference });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const name = data.site.replace("https://", "").replace(/^www\./, "").split(".")[0];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}${data.collection ? "_" + data.collection : ""}_products.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const preview = data ? data.products.slice(0, 25) : [];

  return (
    <main>
      <h1>Catalog Pull</h1>
      <p className="lede">
        Paste a supplier's Shopify website. Get every product as a CSV ready to import into your own Shopify store.
      </p>

      <form className="panel" onSubmit={pull}>
        <div className="field">
          <label htmlFor="site">Supplier website</label>
          <input id="site" type="text" inputMode="url" placeholder="omandropship.com"
            value={site} onChange={(e) => setSite(e.target.value)} required />
          <div className="chips">
            {SUGGESTED.map((s) => (
              <button type="button" key={s} className="chip" onClick={() => setSite(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="col">Collection <span className="hint">(optional)</span></label>
            <input id="col" type="text" placeholder="home-and-kitchen"
              value={collection} onChange={(e) => setCollection(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="mk">Markup <span className="hint">(1.8 = cost × 1.8)</span></label>
            <input id="mk" type="number" step="0.05" min="1"
              value={markup} onChange={(e) => setMarkup(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="check">
            <input type="checkbox" checked={reference} onChange={(e) => setReference(e.target.checked)} />
            <span>Add supplier cost and stock columns <span className="hint">(for your records, remove before importing)</span></span>
          </label>
        </div>

        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Pulling products…" : "Pull products"}
          </button>
          {data && (
            <button className="btn secondary" type="button" onClick={download}>Download CSV</button>
          )}
        </div>

        {error && <div className="error" role="alert">{error}</div>}
      </form>

      {data && (
        <section className="result" aria-live="polite">
          <div className="count">
            <strong>{data.count}</strong>
            <span>products from {data.site.replace("https://", "")}{data.collection ? ` / ${data.collection}` : ""}</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th><th>Product</th><th>SKU</th>
                  <th className="num">Cost</th><th className="num">Your price</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p) => {
                  const v = p.variants[0] || {};
                  const cost = parseFloat(v.price);
                  return (
                    <tr key={p.handle}>
                      <td>{p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" /> : null}</td>
                      <td>
                        {p.title}
                        {p.variants.length > 1 && <span className="hint"> · {p.variants.length} variants</span>}
                        {v.available === false && <div className="out">Out of stock at supplier</div>}
                      </td>
                      <td>{v.sku || <span className="out">No SKU</span>}</td>
                      <td className="num">{v.price}</td>
                      <td className="num">{Number.isFinite(cost) ? (cost * m).toFixed(2) : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="foot">
            Showing {preview.length} of {data.count}. Products import as draft. Keep SKUs unchanged, suppliers use them to match your orders.
          </p>
        </section>
      )}
    </main>
  );
}
