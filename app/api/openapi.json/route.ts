import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    openapi: "3.0.3",
    info: { title: "Shipping Documents API", version: "1.0.0", description: "Read-only access to active Northwest Frozen shipping documents." },
    paths: {
      "/api/documents": {
        get: {
          summary: "List uploaded shipping documents",
          parameters: [
            { name: "type", in: "query", schema: { type: "string" }, description: "Document type, for example BOL." },
            { name: "date", in: "query", schema: { type: "string", format: "date" }, description: "Exact upload date in YYYY-MM-DD format." },
            { name: "from", in: "query", schema: { type: "string", format: "date" }, description: "Start date, inclusive." },
            { name: "to", in: "query", schema: { type: "string", format: "date" }, description: "End date, inclusive." },
            { name: "search", in: "query", schema: { type: "string" }, description: "Search document type or uploader name." },
          ],
          responses: { "200": { description: "Matching active documents returned as JSON." } },
        },
      },
    },
  });
}
