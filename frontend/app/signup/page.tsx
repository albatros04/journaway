import { GoogleSignIn } from "@/components/google-sign-in";
import { EmailAuthForm } from "@/components/email-auth-form";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to } = await searchParams;
  const returnTo = return_to?.startsWith("/") && !return_to.startsWith("//") ? return_to : "/account";
  return <main className="auth-page"><div className="auth-card auth-google-card"><a href="/" className="brand brand-logo auth-logo"><img src="/journaway-logo-transparent.png" alt="JournAway" width="1260" height="790" /></a><p className="eyebrow">JournAway account</p><h1>Create your account.</h1><p>Use your name, email, and password—or continue with Google.</p><EmailAuthForm mode="signup" returnTo={returnTo} /><p>Or continue with Google:</p><GoogleSignIn returnTo={returnTo} /><p className="auth-switch">Already have an account? <a href={`/login?return_to=${encodeURIComponent(returnTo)}`}>Sign in</a></p></div></main>;
}
