export default function SetupNotice() {
  return (
    <main className="auth">
      <div className="auth-intro">
        <span className="logo">CINE<span>SEARCH</span></span>
        <h1>Clerk kalitlari kerak</h1>
        <p className="muted">Login ishlashi uchun <code>.env.local</code> fayliga ikkita kalit yozilishi kerak.</p>
      </div>
      <ol className="setup">
        <li><a href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank" rel="noreferrer">dashboard.clerk.com → API Keys</a> sahifasidan kalitlarni oling.</li>
        <li>Loyiha papkasida (<code>package.json</code> yonida) <code>.env.local</code> faylini oching va yozing:
          <pre>{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}</pre>
        </li>
        <li>Serverni to&apos;xtatib (<code>Ctrl+C</code>) qayta ishga tushiring: <code>npm run dev</code></li>
      </ol>
    </main>
  );
}
