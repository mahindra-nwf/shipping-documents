"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import styles from "./page.module.css";

const documentTypes = ["Bill of Lading", "Packing Slip", "Proof of Delivery", "Other outbound document"];
type Page = { name: string; dataUrl: string };

export default function DriverPage() {
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [uploader, setUploader] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("shipping-uploader") ?? "");
  const [pages, setPages] = useState<Page[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);

  function addPages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    Promise.all(files.map((file) => new Promise<Page>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((newPages) => setPages((current) => [...current, ...newPages]));
    event.target.value = "";
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!uploader.trim() || pages.length === 0) return;
    localStorage.setItem("shipping-uploader", uploader.trim());
    const saved = JSON.parse(localStorage.getItem("shipping-documents-temp") ?? "[]");
    localStorage.setItem("shipping-documents-temp", JSON.stringify([{ id: crypto.randomUUID(), documentType, uploader: uploader.trim(), createdAt: new Date().toISOString(), pages }, ...saved]));
    setSubmitted(true);
  }

  function replacePage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPages((current) => current.map((page, item) => item === index ? { name: file.name, dataUrl: String(reader.result) } : page));
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.back}>← Home</Link><div><p className={styles.eyebrow}>DRIVER WORKSPACE</p><h1>Capture shipping document</h1></div><span className={styles.phase}>Preview mode</span></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.panel}><p className={styles.step}>1 <span>DOCUMENT TYPE</span></p><label>Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></label></section>
      <section className={styles.panel}><p className={styles.step}>2 <span>DOCUMENT PAGES</span></p><div className={styles.captureOptions}><label className={styles.captureOption}><input type="file" accept="image/*" multiple onChange={addPages} /><strong>↑ Upload from device</strong></label><label className={styles.captureOption}><input type="file" accept="image/*" capture="environment" multiple onChange={addPages} /><strong>▣ Open camera</strong></label></div>{pages.length > 0 && <div className={styles.previews}>{pages.map((page, index) => <div className={styles.preview} key={`${page.name}-${index}`}><div className={styles.imageWrap}><img src={page.dataUrl} alt={`Document page ${index + 1}`} onClick={() => setPreviewPage(page)} /><button type="button" className={styles.expandButton} aria-label={`Expand page ${index + 1}`} onClick={() => setPreviewPage(page)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M20 15v5h-5" /></svg></button></div><div className={styles.pageActions}><button type="button" onClick={() => setPreviewPage(page)}>Preview</button><label>Replace<input type="file" accept="image/*" capture="environment" onChange={(event) => replacePage(index, event)} /></label><button type="button" aria-label={`Remove page ${index + 1}`} onClick={() => setPages((current) => current.filter((_, item) => item !== index))}>×</button></div><span>Page {index + 1}</span></div>)}</div>}{previewPage && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Document preview" onClick={() => setPreviewPage(null)}><div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.closePreview} onClick={() => setPreviewPage(null)}>Close</button><img src={previewPage.dataUrl} alt="Large document preview" /></div></div>}</section>
      <section className={styles.panel}><p className={styles.step}>3 <span>SUBMIT</span></p><label>Uploader name<input required value={uploader} onChange={(event) => setUploader(event.target.value)} placeholder="Enter your name before submitting" /></label><p className={styles.note}>Saved temporarily in this browser only—not in Supabase.</p><button className={styles.submit} type="submit">Upload <span>→</span></button>{submitted && <p className={styles.success}>Saved on this device. Supabase is not being used.</p>}</section>
    </form></main>;
}
