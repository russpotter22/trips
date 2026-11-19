// Russ Trips service worker: network-first for the page, cache fallback offline.
// Contains no trip data; it only caches the (encrypted) index.html and static icons.
const C='trips-v1';
const STATIC=['manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./',...STATIC])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const page=r.mode==='navigate'||/\/(index\.html)?$/.test(new URL(r.url).pathname);
  if(page){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put('./',cp))}return res})
    .catch(()=>caches.match('./',{ignoreSearch:true}).then(m=>m||new Response('<meta name=viewport content="width=device-width"><body style="background:#000;color:#ccc;font:16px system-ui;padding:40px">Offline and not cached yet. Open once while online.',{headers:{'Content-Type':'text/html'}}))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
