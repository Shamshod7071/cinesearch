import Link from "next/link";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-intro">
        <Link href="/" className="logo">CINE<span>SEARCH</span></Link>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}
