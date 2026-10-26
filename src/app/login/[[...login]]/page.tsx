import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  if (auth().userId) redirect("/");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to see full movie details, your watchlist and favorites.">
      <SignIn path="/login" routing="path" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
