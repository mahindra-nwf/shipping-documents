"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type Document = { id: string; document_type: string; uploader_name: string; document_pages: { storage_path: string }[] };

export default function SupervisorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  useEffect(() => { let active = true; createSupabaseBrowserClient().from("shipping_documents").select("id, document_type, uploader_name, document_pages(storage_path)").order("created_at", { ascending: false }).then(({ data }) => { if (active) setDocuments(data ?? []); }); return () => { active = false; }; }, []);
  const supabase = createSupabaseBrowserClient();
  return <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}><Link href="/">← Home</Link><h1>Supervisor workspace</h1><p>Documents uploaded to Supabase.</p>{documents.length === 0 ? <p>No uploaded documents yet.</p> : documents.map((document) => <article key={document.id}><h2>{document.document_type}</h2><p>Uploaded by {document.uploader_name}</p>{document.document_pages.map((page, index) => <img key={index} src={supabase.storage.from("shipping-documents").getPublicUrl(page.storage_path).data.publicUrl} alt={`Page ${index + 1}`} width={160} />)}</article>)}</main>;
}
