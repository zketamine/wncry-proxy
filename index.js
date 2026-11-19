module.exports = async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>wncry</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0a0a;color:#e0e0e0;min-height:100vh;display:flex;align-items:center;justify-content:center}h1{font-size:3rem;font-weight:700;margin-bottom:.5rem;background:linear-gradient(135deg,#ff6b6b,#c44dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.sub{color:#666;margin-bottom:2rem;font-size:.9rem}.box{display:flex;gap:.5rem;max-width:600px;width:90vw}input{flex:1;padding:.9rem 1.2rem;border:1px solid #333;border-radius:12px;background:#151515;color:#fff;font-size:1rem;outline:none}input:focus{border-color:#c44dff}input::placeholder{color:#555}button{padding:.9rem 1.5rem;background:linear-gradient(135deg,#ff6b6b,#c44dff);border:none;border-radius:12px;color:#fff;font-size:1rem;font-weight:600;cursor:pointer}button:hover{opacity:.85}</style></head><body><div style="text-align:center;padding:2rem"><h1>wncry</h1><p class="sub">enter a URL to browse</p><div class="box"><input type="text" id="u" placeholder="https://discord.com" autofocus onkeydown="if(event.key===\'Enter\')go()"><button onclick="go()">Go</button></div></div><script>function go(){var u=document.getElementById("u").value.trim();if(!u)return;if(u.indexOf("http")!==0)u="https://"+u;window.location.href="/?url="+encodeURIComponent(u)}</script></body></html>');
  }

  try {
    var targetUrl = new URL(url);
    var response = await fetch(targetUrl.href, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers.accept || '*/*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Referer': targetUrl.origin,
      },
    });

    var contentType = response.headers.get('content-type') || '';
    var body = await response.arrayBuffer();

    if (contentType.includes('text/html')) {
      var html = new TextDecoder().decode(body);
      html = html.replace(/<head([^>]*)>/i, '<head$1><base href="' + targetUrl.origin + '/">');
      html = html.replace(/(href|src|action)="(https?:\/\/[^"]+)"/gi, function(m, a, l) {
        return a + '="/?url=' + encodeURIComponent(l) + '"';
      });
      html = html.replace(/(href|src|action)='(https?:\/\/[^']+)'/gi, function(m, a, l) {
        return a + "='/?url=" + encodeURIComponent(l) + "'";
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(response.status).send(html);
    }

    if (contentType.includes('text/css')) {
      var css = new TextDecoder().decode(body);
      css = css.replace(/url\(["']?(https?:\/\/[^"')]+)["']?\)/gi, function(m, l) {
        return 'url("/?url=' + encodeURIComponent(l) + '")';
      });
      res.setHeader('Content-Type', 'text/css');
      return res.status(response.status).send(css);
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(response.status).send(Buffer.from(body));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch: ' + err.message });
  }
};
