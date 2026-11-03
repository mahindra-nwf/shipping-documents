"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import styles from "./page.module.css";

type Document = { id: string; document_type: string; uploader_name: string; created_at: string; document_pages: { storage_path: string }[] };

export default function SupervisorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  useEffect(() => { let active = true; createSupabaseBrowserClient().from("shipping_documents").select("id, document_type, uploader_name, created_at, document_pages(storage_path)").order("created_at", { ascending: false }).then(({ data }) => { if (active) setDocuments(data ?? []); }); return () => { active = false; }; }, []);
  const supabase = createSupabaseBrowserClient();
  const imageUrl = (path: string) => supabase.storage.from("shipping-documents").getPublicUrl(path).data.publicUrl;
  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.back}>← Home</Link><div><p className={styles.eyebrow}>SUPERVISOR WORKSPACE</p><h1>Review documents</h1></div><span className={styles.count}>{documents.length} {documents.length === 1 ? "document" : "documents"}</span></header><section className={styles.content}><div className={styles.heading}><div><p className={styles.eyebrow}>RECENT UPLOADS</p><h2>Shipping paperwork</h2></div><p className={styles.helper}>Tap an image to inspect it</p></div>{documents.length === 0 ? <div className={styles.empty}><h2>No documents yet</h2><p>Uploaded documents will appear here.</p><Link href="/driver">Upload a document</Link></div> : <div className={styles.grid}>{documents.map((document) => <article className={styles.card} key={document.id}><div className={styles.cardHeader}><div><h3>{document.document_type}</h3><p>Uploaded by {document.uploader_name}</p></div><time dateTime={document.created_at}>{new Date(document.created_at).toLocaleDateString()}</time></div><div className={styles.thumbnails}>{document.document_pages.map((page, index) => <button type="button" className={styles.thumbnail} key={page.storage_path} onClick={() => setSelectedImage(imageUrl(page.storage_path))}><img src={imageUrl(page.storage_path)} alt={`${document.document_type}, page ${index + 1}`} /><span>Page {index + 1}</span></button>)}</div></article>)}</div>}{selectedImage && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Document image preview" onClick={() => setSelectedImage(null)}><div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setSelectedImage(null)}>Close</button><img src={selectedImage} alt="Full document preview" /></div></div>}</section></main>;
}
