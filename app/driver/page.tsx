"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import styles from "./page.module.css";

const documentTypes = ["Bill of Lading", "Packing Slip", "Proof of Delivery", "Other outbound document"];
type Page = { name: string; dataUrl: string };

export default function DriverPage() {
  const [shipment, setShipment] = useState("");
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [uploader, setUploader] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("shipping-uploader") ?? "");
  const [pages, setPages] = useState<Page[]>([]);
  const [submitted, setSubmitted] = useState(false);

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
    if (!shipment.trim() || !uploader.trim() || pages.length === 0) return;
    localStorage.setItem("shipping-uploader", uploader.trim());
    const saved = JSON.parse(localStorage.getItem("shipping-documents-temp") ?? "[]");
    localStorage.setItem("shipping-documents-temp", JSON.stringify([{ id: crypto.randomUUID(), shipment: shipment.trim(), documentType, uploader: uploader.trim(), createdAt: new Date().toISOString(), pages }, ...saved]));
    setSubmitted(true);
  }

  return <main className={styles.page}><header className={styles.header}><Link href="/" className={styles.back}>← Home</Link><div><p className={styles.eyebrow}>DRIVER WORKSPACE</p><h1>Capture shipping document</h1></div><span className={styles.phase}>Preview mode</span></header>
    <form className={styles.form} onSubmit={submit}><section className={styles.panel}><p className={styles.step}>1 <span>SHIPMENT DETAILS</span></p><label>Shipment number<input value={shipment} onChange={(event) => setShipment(event.target.value)} placeholder="Type or scan shipment number" /></label><button className={styles.scan} type="button" onClick={() => setShipment("SCAN-READY")}>▣ Use scanner</button><label>Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></label></section>
      <section className={styles.panel}><p className={styles.step}>2 <span>DOCUMENT PAGES</span></p><label className={styles.capture}><input type="file" accept="image/*" capture="environment" multiple onChange={addPages} /><strong>＋ Add photo</strong><small>Use the device camera or choose an image</small></label>{pages.length > 0 && <div className={styles.previews}>{pages.map((page, index) => <div className={styles.preview} key={`${page.name}-${index}`}><img src={page.dataUrl} alt={`Document page ${index + 1}`} /><button type="button" aria-label={`Remove page ${index + 1}`} onClick={() => setPages((current) => current.filter((_, item) => item !== index))}>×</button><span>Page {index + 1}</span></div>)}</div>}</section>
      <section className={styles.panel}><p className={styles.step}>3 <span>SUBMIT</span></p><label>Uploader name<input required value={uploader} onChange={(event) => setUploader(event.target.value)} placeholder="Enter your name before submitting" /></label><p className={styles.note}>Saved temporarily in this browser only—not in Supabase.</p><button className={styles.submit} type="submit">Save temporary document <span>→</span></button>{submitted && <p className={styles.success}>Saved on this device. Supabase is not being used.</p>}</section>
    </form></main>;
}
