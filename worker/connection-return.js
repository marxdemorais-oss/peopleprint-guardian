// An external OAuth return must load a same-origin document before the browser
// can send its existing Strict session cookie. This page contains no account
// data and never exchanges a code or consumes state.
export function handleConnectionReturn(request){
 const url=new URL(request.url);
 const customerX=url.pathname==='/api/messaging/x/callback'&&(url.searchParams.get('state')||'').startsWith('cx.');
 if(request.method!=='GET'||!customerX&&!/^\/api\/connections\/(gmail|outlook)\/callback$/.test(url.pathname)||url.searchParams.has('guardian_return'))return null;
 return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Returning to Wolfgang</title><link rel="stylesheet" href="/assets/connection-return.css"></head><body><main><h1>Returning to Wolfgang</h1><p id="return-status" role="status">Finishing your account connection…</p><p><a href="/connections">Return to your connections</a></p><noscript><p>JavaScript is needed to finish this connection. Return to your connections and start again with JavaScript enabled.</p></noscript></main><script src="/assets/connection-return.js" defer></script></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}});
}
