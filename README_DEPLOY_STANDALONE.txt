The Oracle Pic 4 — Next.js standalone bundle
==============================================

WHAT IS IN THE ZIP
-------------------
This is a Node.js server build (Next.js "standalone"), NOT a plain HTML site.
Namecheap "File Manager" alone only uploads files; you must run Node on the host
(Namecheap Node.js selector, VPS, cPanel "Setup Node.js App", OR use Vercel/Netlify instead).

FOLDER LAYOUT (after unzip on the server)
-----------------------------------------
  server.js          ← entry (run with: node server.js)
  package.json
  node_modules/      (minimal subset)
  .next/
  public/            (static assets)
  .next/static/      (must exist — copied at pack time)

ENVIRONMENT (create .env on the server, or set in panel)
--------------------------------------------------------
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  GEMINI_API_KEY=
  STRIPE_SECRET_KEY=              (and other STRIPE_* / PayPal vars you use)
  NEXT_PUBLIC_APP_URL=https://your-domain.com

Never commit real .env to public zips.

START (Linux / macOS / Windows server)
--------------------------------------
  set NODE_ENV=production
  set PORT=3000
  node server.js

Use a process manager (PM2) or your host's "Node app" UI to keep it running and
map your domain (reverse proxy) to this port.

BUILD THIS ZIP YOURSELF (from project root)
--------------------------------------------
  npm ci
  npm run build
  xcopy /E /I /Y public .next\standalone\public
  xcopy /E /I /Y .next\static .next\standalone\.next\static
  Then zip the CONTENTS of .next\standalone\ (or the whole standalone folder).

If you only need a SOURCE backup (not runnable on shared PHP hosting), zip the
repo excluding node_modules and .next instead.
