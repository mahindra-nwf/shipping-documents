"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import styles from "./page.module.css";

type Document = { id: string; document_type: string; uploader_name: string; created_at: string; deleted_at: string | null; document_pages: { storage_path: string }[] };

export default function SupervisorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [view, setView] = useState<"recent" | "bin">("recent");
  const [layout, setLayout] = useState<"rows" | "cards">("rows");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();
  const loadDocuments = useCallback(async () => { const { data } = await supabase.from("shipping_documents").select("id, document_type, uploader_name, created_at, deleted_at, document_pages(storage_path)").order("created_at", { ascending: false }); setDocuments(data ?? []); }, [supabase]);
  // The initial fetch hydrates the client-only review screen from Supabase.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDocuments(); }, [loadDocuments]);
  const imageUrl = (path: string) => supabase.storage.from("shipping-documents").getPublicUrl(path).data.publicUrl;
  const recent = documents.filter((document) => !document.deleted_at);
  const bin = documents.filter((document) => document.deleted_at);
  async function moveToBin(document: Document) { if (!window.confirm("Delete this document? It will move to the recycle bin.")) return; await supabase.from("shipping_documents").update({ deleted_at: new Date().toISOString() }).eq("id", document.id); await loadDocuments(); }
  async function restore(document: Document) { await supabase.from("shipping_documents").update({ deleted_at: null }).eq("id", document.id); await loadDocuments(); }
  async function permanentlyDelete(document: Document) { if (!window.confirm("Delete this document permanently? This cannot be undone.")) return; await supabase.storage.from("shipping-documents").remove(document.document_pages.map((page) => page.storage_path)); await supabase.from("shipping_documents").delete().eq("id", document.id); await loadDocuments(); }
  const visibleDocuments = view === "recent" ? recent : bin;
  const cardClass = layout === "cards" ? `${styles.grid} ${styles.cardLayout}` : styles.grid;

  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className={styles.back}>Home</Link><div><p className={styles.eyebrow}>SUPERVISOR WORKSPACE</p><h1>Review documents</h1></div><span className={styles.count}>{view === "recent" ? recent.length : bin.length} {view === "recent" ? "recent" : "in bin"}</span></header>
    <section className={styles.content}>
      <div className={styles.tabs}><button className={view === "recent" ? styles.activeTab : ""} onClick={() => setView("recent")}>Recent uploads</button><button className={view === "bin" ? styles.activeTab : ""} onClick={() => setView("bin")}>Recycle bin {bin.length > 0 && <span>{bin.length}</span>}</button><div className={styles.layoutToggle} aria-label="Document layout"><span>Layout</span><button className={layout === "rows" ? styles.selectedLayout : ""} onClick={() => setLayout("rows")}>Rows</button><button className={layout === "cards" ? styles.selectedLayout : ""} onClick={() => setLayout("cards")}>Cards</button></div></div>
      <div className={styles.heading}><div><p className={styles.eyebrow}>{view === "recent" ? "RECENT UPLOADS" : "RECYCLE BIN"}</p><h2>{view === "recent" ? "Shipping paperwork" : "Deleted documents"}</h2></div><p className={styles.helper}>{view === "recent" ? "Tap an image to inspect it" : "Restore or delete permanently"}</p></div>
      {visibleDocuments.length === 0 ? <div className={styles.empty}><h2>{view === "recent" ? "No documents yet" : "Recycle bin is empty"}</h2><p>{view === "recent" ? "Uploaded documents will appear here." : "Deleted documents will appear here."}</p>{view === "recent" && <Link href="/driver">Upload a document</Link>}</div> : <div className={cardClass}>{visibleDocuments.map((document) => <article className={styles.card} key={document.id}><div className={styles.cardHeader}><div><h3>{document.document_type}</h3><p>Uploaded by {document.uploader_name}</p></div><time dateTime={document.created_at}>{new Date(document.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></div><div className={styles.thumbnails}>{document.document_pages.map((page, index) => <button type="button" className={styles.thumbnail} key={page.storage_path} onClick={() => setSelectedImage(imageUrl(page.storage_path))}><img src={imageUrl(page.storage_path)} alt={`${document.document_type}, page ${index + 1}`} /><span>Page {index + 1}</span></button>)}</div><div className={styles.cardActions}>{view === "recent" ? <button type="button" onClick={() => moveToBin(document)}>Delete</button> : <><button type="button" onClick={() => restore(document)}>Restore</button><button type="button" className={styles.danger} onClick={() => permanentlyDelete(document)}>Delete permanently</button></>}</div></article>)}</div>}
      {selectedImage && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Document image preview" onClick={() => setSelectedImage(null)}><div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setSelectedImage(null)}>Close</button><img src={selectedImage} alt="Full document preview" /></div></div>}
    </section>
  </main>;
}
