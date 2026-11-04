import { NextRequest, NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseBrowserClient();
  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim() ?? "";
  const type = params.get("type")?.trim() ?? "";
  const date = params.get("date")?.trim() ?? "";
  const from = params.get("from")?.trim() ?? "";
  const to = params.get("to")?.trim() ?? "";

  let query = supabase
    .from("shipping_documents")
    .select("id, document_type, uploader_name, status, created_at, submitted_at, document_pages(storage_path, page_number, file_name, mime_type)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("document_type", type);
  if (search) query = query.or(`document_type.ilike.%${search}%,uploader_name.ilike.%${search}%`);
  if (date) {
    query = query.gte("created_at", `${date}T00:00:00.000Z`).lte("created_at", `${date}T23:59:59.999Z`);
  } else {
    if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
    if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Unable to load documents." }, { status: 500 });

  const documents = (data ?? []).map((document) => ({
    ...document,
    pages: document.document_pages.map((page) => ({
      ...page,
      url: supabase.storage.from("shipping-documents").getPublicUrl(page.storage_path).data.publicUrl,
    })),
    document_pages: undefined,
  }));

  return NextResponse.json({ data: documents, count: documents.length });
}
