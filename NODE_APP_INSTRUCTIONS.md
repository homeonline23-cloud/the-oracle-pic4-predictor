# 🔮 THE ORACLE PIC 4 - NODE.JS DEPLOYMENT GUIDE

Since you want to use **Node.js and app.js** for your live application, follow these exact steps to ensure all your keys (Supabase, PayPal, Gemini) are active and working perfectly on Namecheap.

### STEP 1: Generate the Deployment Package
I have prepared the `zip_node_app.js` script to bundle your app.
1. Download the file **`NODE_DEPLOY_DISC.zip`** from your `public` folder after I run the build for you.
2. This ZIP contains your code, the built brain (`.next`), and the server (`app.js`).

### 🔴 FIXING "INDEX OF /" (IMPORTANT)
If you see "Index of /" it means the server is looking at the wrong folder.

**The Fix:**
1. Go back to **Setup Node.js App** in cPanel.
2. Look at **Application URL**: It must be your domain (e.g., `theoraclepic4.com`).
3. Look at **Application root**: 
   * If you uploaded to `public_html/the-oracle`, change the root to `public_html/the-oracle`.
   * **BETTER:** Download your files, delete the `the-oracle` folder, and upload/extract them directly into the **`public_html`** folder. Then set the **Application root** to `public_html`.
4. Click **SAVE** or **RESTART**.

---

### 🟢 RE-RUNNING THE BUILD
I have updated your settings (removed 'static export'). You must now:
1. Re-download the **`NODE_DEPLOY_DISC.zip`** from the `public` folder after I finish.
2. This new version is for a **Live Node.js Server**.
3. Upload it to your **`public_html`** folder on Namecheap.
4. Extract it there.
5. In **Setup Node.js App**:
   * **Application root:** `public_html`
   * **Application startup file:** `app.js`
6. Run **NPM Install** and **Restart**.

### STEP 3: "FILL IN ALL KEYS" (Critical Step)
While still in the **Setup Node.js App** screen, scroll down to **"Environment variables"**. You MUST add these keys one by one for your features to work:

| Key Name | Where to find it |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Settings -> API |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Developer Dashboard -> My Apps |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google AI Studio -> API Keys |
| `SMTP_USER` | `homeonline23@gmail.com` |
| `SMTP_PASS` | Your Gmail App Password (not your regular password) |
| `NEXT_PUBLIC_APP_URL` | `https://theoraclepic4.com` |

*Click **ADD VARIABLE** for each one, then click **SAVE** at the bottom.*

### STEP 4: Upload and Install
1. Go to **cPanel File Manager** -> `public_html` folder.
2. **Delete** any default files inside it.
3. **Upload** your `NODE_DEPLOY_DISC.zip`.
4. **Extract** it directly into the `public_html` folder.
5. Go back to **Setup Node.js App** -> Click **Edit** (Pencil).
6. Click the button **"Run NPM Install"**. Wait for the "Success" notification.

### STEP 5: Ignite the Oracle
1. Click **START APP**.
2. Visit `theoraclepic4.com`!

---

💡 **Pro Tip:** If you ever make changes in AI Studio, you only need to download a new `NODE_DEPLOY_DISC.zip`, upload it, extract it, and **Restart** the app in cPanel. You don't need to re-enter the keys!
