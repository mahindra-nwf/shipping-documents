import Link from "next/link";
import styles from "./page.module.css";

const palettes = [
  { name: "Warm industrial", className: "warm", colors: ["#19324a", "#e87532", "#f7f0e5"], label: "Navy · Orange · Cream" },
  { name: "Cool professional", className: "cool", colors: ["#334155", "#3b82f6", "#f8fafc"], label: "Slate · Blue · White" },
  { name: "Fresh food / warehouse", className: "fresh", colors: ["#245c45", "#a3c94a", "#f5f0df"], label: "Forest · Lime · Cream" },
  { name: "Dark modern", className: "dark", colors: ["#22252a", "#e5a83b", "#f5f1e8"], label: "Charcoal · Amber · White" },
];

export default function PalettePreview() {
  return <main className={styles.page}><Link href="/" className={styles.back}>← Back to app</Link><p className={styles.kicker}>NORTHWEST FROZEN · PALETTE PREVIEW</p><h1 className={styles.title}>Which direction feels right?</h1><p className={styles.subtitle}>Compare the four options before choosing the new app colours.</p><section className={styles.grid}>{palettes.map((palette) => <article className={`${styles.card} ${styles[palette.className]}`} key={palette.name}><div className={styles.top}><span className={styles.dot} /> Shipping Documents <span className={styles.menu}>•••</span></div><div className={styles.body}><p className={styles.small}>WORKSPACE</p><h2 className={styles.cardTitle}>{palette.name}</h2><p>Capture and manage outbound shipping paperwork.</p><button className={styles.button}>Start a task <span>→</span></button></div><div className={styles.swatches}>{palette.colors.map((color) => <span style={{ background: color }} key={color} title={color} />)}</div><footer className={styles.cardFooter}>{palette.label}</footer></article>)}</section></main>;
}
