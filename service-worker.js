const VERSION='teacherdesk-v19-modern-toasts';
const SHELL=["./","./index.html","./offline.html","./css/styles.css","./css/responsive.css","./css/desk.css","./css/landing.css","./css/toasts.css","./js/app.bundle.js","./js/toasts.js","./js/startup.js","./js/app.js","./js/config.js","./js/utils.js","./js/store.js","./js/ui.js","./js/websites.js","./js/editors.js","./js/auth.js","./js/vendor/supabase.js","./assets/logo.png","./assets/hero.png","./assets/desk-hero-stage.jpg","./assets/fonts/inter.ttf","./assets/fonts/poppins.ttf","./manifest.webmanifest","./assets/icons/icon-192.png","./assets/icons/icon-512.png","./assets/icons/apple-touch-icon.png","./assets/icons/maskable-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('teacherdesk-')&&k!==VERSION).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,u=new URL(request.url);
 // Never cache Supabase responses, account records, uploads, signed URLs, or external links.
 if(request.method!=='GET'||u.origin!==self.location.origin)return;
 const known=SHELL.some(p=>new URL(p,self.registration.scope).href===u.href);
 if(!known&&request.mode!=='navigate')return;
 event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok&&known){const cache=await caches.open(VERSION);await cache.put(request,response.clone());}return response;}catch{const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate')return caches.match(new URL('./offline.html',self.registration.scope));return Response.error();}})());
});
