import Link from "next/link";
import styles from "./page.module.css";

const quickActions = [
  { href: "/driver", label: "Capture a document", detail: "Start a new shipping record", icon: "＋" },
  { href: "/supervisor", label: "Review documents", detail: "Browse recent submissions", icon: "↗" },
];

export default function Home() {
  return <main className={styles.page}>
    <section className={styles.hero}><div><p className={styles.eyebrow}>NORTHWEST FROZEN LLC</p><h1>Shipping Documents</h1></div></section>
    <section className={styles.workspace} aria-labelledby="workspace-heading"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>WORKSPACE</p><h2 id="workspace-heading">What do you need to do?</h2></div><p className={styles.helper}>Choose a starting point</p></div>
      <div className={styles.actionGrid}>{quickActions.map((action) => <Link className={styles.actionCard} href={action.href} key={action.href}><span><strong>{action.label}</strong><small>{action.detail}</small></span></Link>)}</div>
    </section><footer className={styles.footer}>Northwest Frozen LLC <span>•</span> Shipping Documents <span>•</span> <a href="https://github.com/mahindra-nwf/shipping-documents" target="_blank" rel="noreferrer">GitHub repository</a></footer>
  </main>;
}
