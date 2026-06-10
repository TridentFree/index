# Ecuador Strategic Partnership — WordPress Embed Package

This package contains the full interactive proposal as a self-contained static site (HTML/CSS/JS + logo assets). Upload it to your WordPress host and embed it via iframe.

## Files
- `index.html` — entry page
- `styles.css` — Trident brand styles
- `app.js` — interactive logic (configurator, milestones, deliverables)
- `seal.jpg`, `seal.png` — Trident seal/logo assets

---

## Option A — Upload via FTP / cPanel / File Manager (recommended)

WordPress blocks `.html`/`.js` uploads through the Media Library by default, so use file manager or FTP.

1. Log into your host (cPanel, SFTP, Plesk, or your managed-host file manager).
2. Inside your WordPress root (where `wp-content/` lives), create a folder, e.g.:
   ```
   /public_html/ecuador-proposal/
   ```
3. Upload all 5 files from this package into that folder.
4. Verify it loads directly in a browser:
   ```
   https://yourdomain.com/ecuador-proposal/index.html
   ```
5. On the WordPress page where you want it embedded, add a **Custom HTML** block (Gutenberg) or use the Classic Editor "Text" tab and paste:

   ```html
   <iframe
     src="https://yourdomain.com/ecuador-proposal/index.html"
     width="100%"
     height="2400"
     style="border:0; max-width:1400px; display:block; margin:0 auto;"
     loading="lazy"
     title="Ecuador Strategic Partnership Proposal"
     allow="fullscreen"
   ></iframe>
   ```

6. Adjust `height` to taste. The proposal is a long single-page document — 2400–3200 px works well, or use the responsive script below.

---

## Option B — Use the WP File Manager plugin

If you don't have FTP/cPanel access:

1. Install the free **WP File Manager** plugin (by mndpsingh287).
2. Open it from the WP admin sidebar.
3. Navigate to your site root, create `ecuador-proposal/`, and upload all 5 files there.
4. Embed using the iframe snippet from Option A.

---

## Option C — Enable HTML uploads via plugin

1. Install **WP Add Mime Types** or **WP Extra File Types**.
2. Allow `.html` and `.js` mime types.
3. Upload all files via Media Library (note: they may end up in `/wp-content/uploads/YYYY/MM/`, which breaks relative paths between `index.html` and `styles.css`/`app.js`). Option A or B is more reliable.

---

## Responsive auto-height iframe (optional, removes scrollbars)

Because the iframe is on the same domain as WordPress, you can auto-resize it. Paste this **once** into a Custom HTML block on the page, replacing the static-height iframe above:

```html
<iframe
  id="ecuador-proposal-frame"
  src="https://yourdomain.com/ecuador-proposal/index.html"
  width="100%"
  style="border:0; display:block; margin:0 auto; max-width:1400px;"
  loading="lazy"
  title="Ecuador Strategic Partnership Proposal"
></iframe>

<script>
(function(){
  var f = document.getElementById('ecuador-proposal-frame');
  function resize(){
    try {
      var h = f.contentWindow.document.documentElement.scrollHeight;
      f.style.height = (h + 40) + 'px';
    } catch(e){}
  }
  f.addEventListener('load', function(){
    resize();
    // re-measure after fonts/images settle & when content expands (tabs, etc.)
    setTimeout(resize, 500);
    setTimeout(resize, 1500);
    f.contentWindow.addEventListener('resize', resize);
    new MutationObserver(resize).observe(f.contentDocument.body, {childList:true, subtree:true, attributes:true});
  });
})();
</script>
```

This only works when the iframe source is on the **same domain** as the WordPress page (same-origin). If you put the proposal on a different domain/subdomain, set a fixed height instead.

---

## Mobile note

The proposal is designed for desktop viewing. On mobile, the iframe will scroll horizontally if the content exceeds the viewport. To force mobile-friendly width:

```html
<div style="width:100%; overflow-x:auto;">
  <iframe src="..." width="1400" height="2800" style="border:0;"></iframe>
</div>
```

---

## Updating the proposal later

Just re-upload the changed file(s) to the same `/ecuador-proposal/` folder, overwriting the old version. The iframe will pick up the new content on the next page load. Force-refresh the WordPress page (Ctrl/Cmd+Shift+R) if your browser caches it.
