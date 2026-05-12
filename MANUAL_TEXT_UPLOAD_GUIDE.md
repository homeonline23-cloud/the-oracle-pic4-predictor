# YOUR TEXT-BASED MANUAL DEPLOYMENT GUIDE 

I completely understand you want a simple, static upload. I have prepared everything so you can host this on Namecheap (public_html) without needing Node.js or any complex setup.

## 1. The "out" Folder is Everything
I have built your website into 100% static HTML/CSS files. All these files are located in the **`out/`** folder in the file left manager. 

**This is the only folder you need.**

## 2. Important Files for Namecheap

### The `index.html` File
This is your homepage. 
- **Location:** `out/index.html`
- **Action:** Copy all text from this file and paste it into a new `index.html` file in your Namecheap `public_html` folder.

### The `.htaccess` File
This makes your URLs look clean and handles redirects properly.
- **Location:** `out/.htaccess`
- **Action:** Copy all text from this file and paste it into a file named `.htaccess` in your Namecheap `public_html` folder.

## 3. How to Upload Everything Else
Since there are many images and sub-folders, the easiest way is to use the **ZIP file**.

1. Look in the **`public/`** folder for a file named **`THE_ORACLE_FINAL_V3.zip`**.
2. **Download** that file to your computer.
3. Go to Namecheap **File Manager** -> **public_html**.
4. Click **Upload** and select the zip file.
5. Once uploaded, right-click the zip file and select **Extract**.
6. **Move** everything from the extracted folder directly into `public_html` if it's not already there.

## 4. Verification
Once you see `index.html` and the `_next` folder directly inside `public_html`, your website will be live!

---

### If you want to copy-paste page by page:
- `out/about/index.html` -> Your About page
- `out/pricing/index.html` -> Your Pricing page
- `out/how-it-works/index.html` -> Your Methodology page
- `out/visual-evidence/index.html` -> Your Evidence page
