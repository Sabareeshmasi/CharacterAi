This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

You’re seeing a “Page not found” (404) error on Netlify. This is a common issue with React/Next.js/SPA deployments on Netlify when you try to access a route directly (like `/chat`, `/gallery`, etc.).

---

## Why This Happens

- Netlify serves `index.html` for the root, but direct navigation to subpages (e.g., `/chat`) returns 404 unless you configure a redirect.

---

## How to Fix

### 1. **Add a `_redirects` File**

1. In your `frontend/public` directory, create a file named `_redirects` (no extension).
2. Add this line to the file:
   ```
   /*    /index.html   200
   ```
3. Commit and push this file to GitHub.

### 2. **Redeploy on Netlify**

- Netlify will now serve your app’s main page for all routes, letting your Next.js/React router handle navigation.

---

## For Next.js (App Router)

- If you’re using Next.js with the app directory, Netlify should handle most routes, but the `_redirects` file is still the best fix for SPA-like navigation.

---

## Summary

- Add a `public/_redirects` file with the line above.
- Push to GitHub and redeploy on Netlify.
- Your routes like `/chat`, `/gallery`, etc. should now work when accessed directly.

---

Let me know if you need help creating the file or if you see any other issues after redeploying!
