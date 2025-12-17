import { createClient } from "@base44/sdk";

// datapacks you want
const SELECTED_DATAPACKS = [
  "RoofCondition",
  "Measurements",
  "PropertyAttributes",
  "Structure",
  "Imagery",
  "Risk",
  "Parcel",
  "RoofGeometry",
  "Obstructions"
];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ status: "ok" }); // health check
    }

    const body = req.body;

    if (!body || !Array.isArray(body.products)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { requestId, products } = body;

    const filtered = products.filter(p =>
      SELECTED_DATAPACKS.includes(p.type)
    );

    const base44 = createClient({
      apiKey: process.env.BASE44_API_KEY
    });

    for (const product of filtered) {
      if (!product.propertyId) continue;

      await base44.entities.Property.update(product.propertyId, {
        eagleview_report_id: requestId,
        eagleview_report: product,
        enrichment_status: "complete",
        last_enrichment_date: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      processed: filtered.length
    });

  } catch (err) {
    console.error("[Webhook Error]", err);
    return res.status(500).json({ error: err.message });
  }
}
