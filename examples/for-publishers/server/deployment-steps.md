# Publisher Server Deployment Guide

This guide walks you through deploying an AIACTA-compliant publisher server —
the minimal infrastructure needed to participate in the AIACTA framework.
The reference implementation is in `minimal-server.js` alongside this file.

---

## What this server does

It implements three AIACTA proposals:

| Proposal | What it does |
|----------|-------------|
| **Proposal 4** — ai-attribution.txt | Serves `/.well-known/ai-attribution.txt` declaring your preferences to AI crawlers |
| **Proposal 3** — Referrer Headers | Sets `Referrer-Policy: origin` so AI-referred traffic is visible in your analytics |
| **Proposal 2** — Citation Webhooks | Receives signed citation events each time an AI cites your content |

---

## Option A — Full server (Node.js / Express)

Best if you want real-time citation notifications and full control.

### 1. Create the project

```bash
mkdir my-aiacta-server
cd my-aiacta-server
npm init -y
npm install express
```

### 2. Copy the server file

Copy `minimal-server.js` into your project and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  preferredAttribution: 'Your Publication Name (yourdomain.com)',
  contact: 'ai-licensing@yourdomain.com',
  webhookSecret: process.env.WEBHOOK_SECRET || 'set-via-env-var',
};
```

### 3. Run locally and test

```bash
node minimal-server.js
```

Test the ai-attribution.txt endpoint:
```bash
curl http://localhost:3000/.well-known/ai-attribution.txt
```

Validate it with the AIACTA linter:
```bash
npx @aiacta-org/ai-attribution-lint http://localhost:3000
```

### 4. Deploy to Render (simplest free hosting)

1. Push your code to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node minimal-server.js`
5. Add an environment variable:
   - `WEBHOOK_SECRET` → your secret from the AI provider's Publisher Portal
6. Click **Deploy**

Your server will be live at:
```
https://your-app.onrender.com/.well-known/ai-attribution.txt
```

### 5. Attach to your real domain

Point your domain's DNS to your Render service, or configure a custom domain
in the Render dashboard. Once pointed:

```
https://yourdomain.com/.well-known/ai-attribution.txt  ✅
```

### 6. Register with AI providers

Once live, visit each AI provider's Publisher Portal:
- Verify your domain ownership (DNS TXT record)
- Register your `Citation-Webhook` URL to receive citation events
- The portal gives you a unique HMAC secret per provider — store it securely

---

## Option B — Static file only (no server required)

If you only need the `ai-attribution.txt` file and don't need citation webhooks,
you can serve it as a static file from any CDN or static host.

### 1. Create the file

Create `ai-attribution.txt` with the plain-text key: value format:

```
Schema-Version: 1.0
Contact: ai-licensing@yourdomain.com
Preferred-Attribution: Your Publication Name (yourdomain.com)
Allow-Purpose: rag
Allow-Purpose: index
Disallow-Purpose: training
Require-Citation: true
Require-Source-Link: true
Citation-Format: title-and-url
Recrawl-After: 24h
Reward-Tier: standard
Content-License: All-Rights-Reserved
```

### 2. Upload to your static host


The file ai-attribution.txt you created goes into a .well-known/ folder in your website's source files. 


Upload the file so it is served at:
```
https://yourdomain.com/.well-known/ai-attribution.txt
```

Supported hosts: AWS S3, Cloudflare Pages, Vercel, Netlify, GitHub Pages, Lovable, Replit, Bubble, Glide, Base44, etc.

For S3 or similar: create a `.well-known/` directory and upload `ai-attribution.txt` inside it.

Make sure the file is served with Content-Type: `text/plain`.


If you have a React.js website like Versel, Lovable, etc. you probably need to place your ai-attribution.txt at the  public/ directory. Move it there:
```
public/.well-known/ai-attribution.txt
```

Then add the correct **Content-Type** header:
Content-Type: text/plain; charset=utf-8


**Vercel:** In `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/.well-known/ai-attribution.txt",
      "headers": [{ "key": "Content-Type", "value": "text/plain; charset=utf-8" }]
    }
  ]
}
```

**Netlify:** In `netlify.toml`:
```
toml[[headers]]
  for = "/.well-known/ai-attribution.txt"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
```


**Cloudflare:** In `_headers`.

ex) Lovable (and most React.Js) at `public/` directory, Create a file called `_headers` with content: 
``` 
/.well-known/ai-attribution.txt
  Content-Type: text/plain; charset=utf-8
  Access-Control-Allow-Origin: *
```

If your site is a static site (plain HTML):
Upload the file to your web root at exactly the path 

.well-known/ai-attribution.txt. 

Your web server must serve .well-known/ directories — most do by default. 

If Apache blocks dotfiles, add to .htaccess:

<Files "ai-attribution.txt">
  Allow from all
</Files>

### 3. Set the Referrer-Policy header

Even without a server, you can set `Referrer-Policy: origin` at the CDN level:

**Cloudflare:** Rules → Transform Rules → Response Headers → Add:
```
Referrer-Policy: origin
```

or the full file in `_headers` will be: 
``` 
/*
  Referrer-Policy: origin

/.well-known/ai-attribution.txt
  Content-Type: text/plain; charset=utf-8
  Access-Control-Allow-Origin: *

```


**Vercel:** In `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "Referrer-Policy", "value": "origin" }]
    }
  ]
}
```




### 4. Validate your deployment

```bash
npx @aiacta-org/ai-attribution-lint https://yourdomain.com
```

---

## Registering with the AAC

To receive payments from the AI Attribution Collective:

1. Go to [aac.aiacta.org/register](https://aac.aiacta.org/register)
2. Verify domain ownership
3. Set `Reward-Tier: standard` in your `ai-attribution.txt`
4. Provide payment details in the AAC portal

See `docs/for-publishers/CREATOR-GUIDE.md` for the full registration walkthrough.
