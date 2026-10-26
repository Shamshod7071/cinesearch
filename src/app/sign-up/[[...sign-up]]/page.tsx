import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";

export default function SignUpPage() {
  if (auth().userId) redirect("/");
  return (
    <AuthShell title="Create your account" subtitle="Join CineSearch to unlock every movie and TV show page.">
      <SignUp path="/sign-up" routing="path" signInUrl="/login" />
    </AuthShell>
  );
}
