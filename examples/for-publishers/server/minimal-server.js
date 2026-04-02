// TODO: Needs better sample code for this server sample.

//Publishers must host a server like this...

const express = require("express");
const app = express();

// ---- CONFIG (EDIT THIS) ----
const AIACTA_CONFIG = {
  publisher: "Example Inc.",
  base_url: "https://exampleinc.com",
  contact: "email@exampleinc.com",
  content_id: "unique-article-id"
};

//content_id: "unique-article-id" >> This should be dynamic per page/article



// ---- AIACTA WELL-KNOWN ENDPOINT ----
// GET /.well-known/aiacta.json
app.get("/.well-known/aiacta.json", (req, res) => {
  res.json({
    schema_version: "1.0",
    publisher: AIACTA_CONFIG.publisher,
    base_url: AIACTA_CONFIG.base_url,
    contact: AIACTA_CONFIG.contact
  });
});

// ---- AIACTA HEADERS MIDDLEWARE ----
app.use((req, res, next) => {
  //example: res.setHeader("X-AIACTA-Content-ID", req.path);
  //or pulled from DB / CMS.
  res.setHeader("X-AIACTA-Content-ID", AIACTA_CONFIG.content_id);
  res.setHeader("X-AIACTA-Owner", AIACTA_CONFIG.publisher);
  next();
});

// ---- SAMPLE ROUTE ----
app.get("/", (req, res) => {
  res.send("AIACTA is running");
});

// ---- START SERVER ----
const PORT = 3100;
app.listen(PORT, () => {
  console.log(`AIACTA MVS server running on port ${PORT}`);
});

//local test block:
//$ curl -i http://localhost:3100/.well-known/aiacta.json
