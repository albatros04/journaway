import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to } = await searchParams;
  const returnTo = return_to?.startsWith("/admin") && !return_to.startsWith("//") ? return_to : "/admin";
  return <main className="auth-page"><section className="auth-card"><a href="/" className="brand brand-logo auth-logo"><img src="/journaway-logo-transparent.png" alt="JournAway" width="1260" height="790" /></a><p className="eyebrow">Private operations</p><h1>Admin sign in</h1><p>Use your JournAway administrator credentials.</p><AdminLoginForm returnTo={returnTo} /></section></main>;
}
