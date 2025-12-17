import { createClient } from '@base44/sdk';

// List of 5 datapacks you want to keep
const SELECTED_DATAPACKS = ["RoofCondition", "Measurements", "PropertyAttributes", "Structure", "Imagery"];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;

    if (!body || !body.products || !Array.isArray(body.products)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { requestId, products } = body;

    // Filter only the 5 selected datapacks
    const filteredProducts = products.filter(p => SELECTED_DATAPACKS.includes(p.type));

    if (filteredProducts.length === 0) {
      return res.status(200).json({ success: true, message: "No relevant datapacks in payload" });
    }

    // Initialize Base44 client
    const base44 = createClient({ apiKey: process.env.BASE44_API_KEY });

    // Update Base44 entities for each product
    for (const product of filteredProducts) {
      const propertyId = product.propertyId; // adjust to match your EagleView payload structure
      if (!propertyId) continue;

      try {
        await base44.entities.Property.update(propertyId, {
          eagleview_report_id: requestId,
          eagleview_report: product,
          enrichment_status: "complete",
          last_enrichment_date: new Date().toISOString()
        });
        console.log(`[Base44] Updated property ${propertyId} successfully`);
      } catch (err) {
        console.error(`[Base44] Failed to update property ${propertyId}:`, err.message);
      }
    }

    res.status(200).json({ success: true, processed: filteredProducts.length });

  } catch (err) {
    console.error("[Webhook Error]", err);
    res.status(500).json({ error: err.message });
  }
}
