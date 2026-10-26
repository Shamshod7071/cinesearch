"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/** Login talab qiladigan amalni o'rab oladi: login qilinmagan bo'lsa /login ga yuboradi. */
export function useAuthGuard() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  return useCallback(
    <A extends unknown[]>(fn: (...args: A) => unknown) =>
      (...args: A) => {
        if (!isSignedIn) {
          router.push("/login");
          return;
        }
        fn(...args);
      },
    [isSignedIn, router]
  );
}
