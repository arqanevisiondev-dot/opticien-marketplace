// Minimal middleware - authentication is handled in individual routes and APIs
// This prevents Edge Function bundle size issues on Vercel

export const config = {
  matcher: [],
};
