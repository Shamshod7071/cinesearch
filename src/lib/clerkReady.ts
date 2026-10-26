// Clerk kalitlari .env.local da bormi? (yo'q bo'lsa ilova qulamaydi, sozlash sahifasi chiqadi)
export const clerkReady =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && !!process.env.CLERK_SECRET_KEY?.trim();
