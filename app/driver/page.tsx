"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import styles from "./page.module.css";

const documentTypes = ["Bill of Lading", "Packing Slip", "Proof of Delivery", "Other outbound document"];
type Page = { name: string; dataUrl: string; file?: File };

export default function DriverPage() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [uploader, setUploader] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("shipping-uploader") ?? "");
  const [pages, setPages] = useState<Page[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewPage, setPreviewPage] = useState<Page | null>(null);

  function addPages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    Promise.all(files.map((file) => new Promise<Page>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result), file });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((newPages) => setPages((current) => [...current, ...newPages]));
    event.target.value = "";
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (isUploading || !uploader.trim() || pages.length === 0) return;
    setIsUploading(true);
    setUploadProgress(5);
    setErrorMessage("");
    localStorage.setItem("shipping-uploader", uploader.trim());
    try {
      const supabase = createSupabaseBrowserClient();
      const shipmentNumber = `TEMP-${crypto.randomUUID()}`;
      const { data: shipmentRow, error: shipmentError } = await supabase.from("shipments").insert({ shipment_number: shipmentNumber, direction: "outbound" }).select("id").single();
      if (shipmentError) throw shipmentError;
      setUploadProgress(20);
      const { data: documentRow, error: documentError } = await supabase.from("shipping_documents").insert({ shipment_id: shipmentRow.id, document_type: documentType, uploader_name: uploader.trim(), status: "submitted", submitted_at: new Date().toISOString() }).select("id").single();
      if (documentError) throw documentError;
      for (const [index, page] of pages.entries()) {
        if (!page.file) throw new Error("Please retake or reselect this page before uploading.");
        const storagePath = `${shipmentRow.id}/${documentRow.id}/${index + 1}-${page.name}`;
        const { error: uploadError } = await supabase.storage.from("shipping-documents").upload(storagePath, page.file, { contentType: page.file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { error: pageError } = await supabase.from("document_pages").insert({ document_id: documentRow.id, page_number: index + 1, storage_path: storagePath, file_name: page.name, mime_type: page.file.type, file_size_bytes: page.file.size });
        if (pageError) throw pageError;
        setUploadProgress(20 + Math.round(((index + 1) / pages.length) * 75));
      }
      router.push("/driver/success");
    } catch (error) {
      console.error(error);
      setSubmitted(false);
      setErrorMessage("Upload could not be completed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  function clearForm() {
    if (isUploading) return;
    setDocumentType(documentTypes[0]);
    setPages([]);
    setSubmitted(false);
    setErrorMessage("");
    setUploadProgress(0);
  }

  function replacePage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPages((current) => current.map((page, item) => item === index ? { name: file.name, dataUrl: String(reader.result), file } : page));
    reader.readAsDataURL(file);
    event.target.value = "";
  }


  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.back}>Home</Link><div><p className={styles.eyebrow}>DRIVER WORKSPACE</p><h1>Capture shipping document</h1></div><span className={styles.phase}>Preview mode</span></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.panel}><p className={styles.step}>1 <span>DOCUMENT TYPE</span></p><label>Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></label></section>
      <section className={styles.panel}><p className={styles.step}>2 <span>DOCUMENT PAGES</span></p><div className={styles.captureOptions}><label className={styles.captureOption}><input type="file" accept="image/*" multiple onChange={addPages} /><strong>Upload from device</strong></label><label className={styles.captureOption}><input type="file" accept="image/*" capture="environment" multiple onChange={addPages} /><strong>Open camera</strong></label></div>{pages.length > 0 && <div className={styles.previews}>{pages.map((page, index) => <div className={styles.preview} key={`${page.name}-${index}`}><div className={styles.imageWrap}><img src={page.dataUrl} alt={`Document page ${index + 1}`} onClick={() => setPreviewPage(page)} /><button type="button" className={styles.expandButton} aria-label={`Expand page ${index + 1}`} onClick={() => setPreviewPage(page)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M20 15v5h-5" /></svg></button></div><div className={styles.pageActions}><button type="button" onClick={() => setPreviewPage(page)}>Preview</button><label>Replace<input type="file" accept="image/*" capture="environment" onChange={(event) => replacePage(index, event)} /></label><button type="button" aria-label={`Remove page ${index + 1}`} onClick={() => setPages((current) => current.filter((_, item) => item !== index))}>×</button></div><span>Page {index + 1}</span></div>)}</div>}{previewPage && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Document preview" onClick={() => setPreviewPage(null)}><div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.closePreview} onClick={() => setPreviewPage(null)}>Close</button><img src={previewPage.dataUrl} alt="Large document preview" /></div></div>}</section>
      <section className={styles.panel}><p className={styles.step}>3 <span>SUBMIT</span></p><label>Uploader name<input required value={uploader} onChange={(event) => setUploader(event.target.value)} placeholder="Enter your name before submitting" /></label><p className={styles.note}>Uploaded to the public review database.</p>{isUploading && <div className={styles.progress} aria-live="polite"><div className={styles.progressLabel}><span>Uploading document…</span><strong>{uploadProgress}%</strong></div><div className={styles.progressTrack}><div style={{ width: `${uploadProgress}%` }} /></div></div>}<div className={styles.submitActions}><button className={styles.submit} disabled={isUploading} type="submit">{isUploading ? "Uploading…" : "Upload"} {!isUploading && <span>→</span>}</button><button className={styles.clearButton} disabled={isUploading} type="button" onClick={clearForm}>Clear form</button></div>{submitted && <p className={styles.success}>Uploaded successfully to Supabase.</p>}{errorMessage && <p className={styles.error}>{errorMessage}</p>}</section>
    </form></main>;
}
