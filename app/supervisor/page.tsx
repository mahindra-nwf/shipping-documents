"use client";

import Link from "next/link";
import { useState } from "react";

type Document = { id: string; shipment: string; documentType: string; uploader: string; createdAt: string; pages: { dataUrl: string }[] };

export default function SupervisorPage() {
  const [documents] = useState<Document[]>(() => typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("shipping-documents-temp") ?? "[]"));
  return <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}><Link href="/">← Home</Link><h1>Supervisor workspace</h1><p>Temporary documents saved in this browser.</p>{documents.length === 0 ? <p>No temporary documents yet.</p> : documents.map((document) => <article key={document.id}><h2>{document.shipment}</h2><p>{document.documentType} · Uploaded by {document.uploader}</p>{document.pages.map((page, index) => <img key={index} src={page.dataUrl} alt={`Page ${index + 1}`} width={160} />)}</article>)}</main>;
}
