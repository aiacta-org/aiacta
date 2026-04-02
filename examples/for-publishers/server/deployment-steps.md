<!-- TODO: Needs work -->

# Step-by-Step Deployment (Publisher Guide)


Option A — Fastest (Node.js / Express)
1. Create project
mkdir aiacta-mvs
cd aiacta-mvs
npm init -y
npm install express

2. Create server file
touch server.js

Paste your final code.

3. Run locally
node server.js

Test:

curl http://localhost:3000/.well-known/aiacta.json

4. Deploy (Render — simplest)

Steps:
Go to render.com
“New Web Service”
Connect GitHub repo

Settings:
Build Command: npm install
Start Command: node server.js

Deploy

You’ll get:

https://your-app.onrender.com/.well-known/aiacta.json

5. Attach to real domain

Point:

yourdomain.com → Render service

Now:

https://yourdomain.com/.well-known/aiacta.json ✅

---

Option B — REAL MVS (No server required) ⚡️

This is what will drive mass adoption.

1. Create file:
/.well-known/aiacta.json

2. Paste:
{
  "schema_version": "1.0",
  "publisher": "Your Company Name",
  "base_url": "https://yourdomain.com",
  "contact": "email@yourdomain.com"
}

3. Upload to:
S3
Cloudflare Pages
Vercel
Any static host

4. Add headers (CDN level)
Cloudflare example:
Go to Rules → Transform Rules

Add headers:
X-AIACTA-Content-ID: {dynamic or static}
X-AIACTA-Owner: Your Company Name


