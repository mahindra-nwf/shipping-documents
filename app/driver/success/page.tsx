import Link from "next/link";
import styles from "./page.module.css";

export default function UploadSuccessPage() {
  return <main className={styles.page}><section className={styles.card}><div className={styles.check}>✓</div><p className={styles.eyebrow}>UPLOAD COMPLETE</p><h1>Upload successful</h1><p>Your shipping document and images were uploaded successfully.</p><div className={styles.actions}><Link href="/driver">Upload another document</Link><Link href="/supervisor">Review documents</Link></div></section></main>;
}
