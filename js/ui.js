import {esc,icon,color,safeUrl} from './utils.js';
import {state,imageUrl} from './store.js';
export const $=s=>document.querySelector(s);
export async function withProgress(message,action){
 const popup=document.createElement('div');popup.className='operation-progress';popup.setAttribute('role','status');popup.setAttribute('aria-live','polite');
 popup.innerHTML='<img src="assets/logo.png" alt=""><div><strong></strong><span>Please wait a moment</span><progress aria-label="Operation in progress"></progress></div>';
 popup.querySelector('strong').textContent=message;
 const host=$('#modal')?.open?$('#modal-body'):document.body;host.append(popup);
 const started=performance.now();try{return await action();}finally{await new Promise(resolve=>setTimeout(resolve,Math.max(0,380-(performance.now()-started))));popup.remove();}
}
function operationLabel(title,label){if(/sign out/i.test(title))return 'Signing out…';if(/delete/i.test(title))return 'Deleting…';if(/sign in/i.test(label))return 'Signing in…';if(/create account/i.test(label))return 'Creating your account…';if(/reset/i.test(title))return 'Sending reset email…';if(/password/i.test(title))return 'Updating password…';if(/website/i.test(title))return 'Saving website…';return 'Saving changes…';}
export function toast(message, options){if(typeof window.TeacherDeskNotify==='function')window.TeacherDeskNotify(message,options);else console.info(message);}
export const empty=(title,description)=>`<div class="empty"><img src="assets/logo.png" alt=""><h3>${esc(title)}</h3><p>${esc(description)}</p></div>`;
// Try app/PWA icons from the website's own folder before falling back to a favicon service.
// GitHub Pages project websites need the project path, not just github.io/favicon.ico.
function websiteIcons(live){
 const u=new URL(live);
 const last=u.pathname.split('/').pop();
 const directory=u.pathname.endsWith('/')?u.href:/\.[a-z0-9]+$/i.test(last)?new URL('.',u).href:u.href+'/';
 const paths=['assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/apple-touch-icon.png','favicon.ico','assets/logo.png','logo.png'];
 return [...new Set([...paths.map(path=>new URL(path,directory).href),new URL('/favicon.ico',u.origin).href,`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(u.origin)}&sz=128`])];
}
function fallbackIcon(w){
 if(w.icon==='desk')return '<img src="assets/logo.png" alt="">';
 if(w.icon==='math')return '<span class="math-mark">e<sup>x</sup></span>';
 if(w.icon==='letter'||w.icon?.length===1)return esc(w.icon?.length===1?w.icon:w.name?.[0]||'W');
 return icon(w.icon||'websites');
}
export function appIcon(w){
 const live=safeUrl(w.url);
 let contents;
 if(w.logo)contents=`<img data-logo="${esc(w.logo)}" alt="">`;
 else if(live && (w.category||w.icon==='favicon')){
  const options=websiteIcons(live);
  contents=`<img class="website-logo" src="${esc(options[0])}" data-favicon-list="${esc(JSON.stringify(options.slice(1)))}" data-fallback="${esc(w.name?.[0]||'W')}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
 } else contents=fallbackIcon(w);
 return `<span class="app-icon ${w.icon==='desk'&&!live?'desk':''}" style="--app-color:${color(w.color)}">${contents}</span>`;
}
export async function hydrate(root=document){
 for(const img of root.querySelectorAll('img[data-logo]')){
  const src=await imageUrl(img.dataset.logo);
  if(src)img.src=src;else img.replaceWith(document.createTextNode('W'));
 }
 for(const img of root.querySelectorAll('img[data-favicon-list]')){
  let options=[];
  try{options=JSON.parse(img.dataset.faviconList||'[]');}catch{}
  const fallback=img.dataset.fallback||'W';
  const next=()=>{if(options.length)img.src=options.shift();else img.replaceWith(document.createTextNode(fallback));};
  img.addEventListener('error',next);
  if(img.complete&&!img.naturalWidth)next();
 }
 for(const img of root.querySelectorAll('img[data-fallback]:not([data-favicon-list])'))img.onerror=()=>img.replaceWith(document.createTextNode(img.dataset.fallback));
}
export function categoryOptions(selected){return state.categories.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}</option>`).join('');}
export function field(name,label,value='',type='text',extra=''){return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;}
export function textarea(name,label,value=''){return `<div class="field"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" maxlength="20000">${esc(value)}</textarea></div>`;}
export function select(name,label,options){return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${options}</select></div>`;}
export function check(name,label,checked){return `<label class="check-label"><input name="${name}" type="checkbox" ${checked?'checked':''}>${label}</label>`;}
let closeGuard=null;
export function close(){ $('#modal').close(); closeGuard=null; }
export async function requestClose(){if($('#editor')?.dataset.busy)return;if(closeGuard && !(await closeGuard()))return;close();}
export function modal(title,html,{submit,label='Save',setup,guard}={}){
 closeGuard=guard||null;
 $('#modal-body').innerHTML=`<div class="dialog-head"><h2 id="modal-title">${esc(title)}</h2><button type="button" class="icon-button" data-close aria-label="Close dialog">${icon('close')}</button></div>${submit?'<form id="editor" method="post">':''}${html}${submit?`<p class="error" role="alert"></p><div class="dialog-actions"><button type="button" class="secondary" data-close>Cancel</button><button type="submit" class="primary">${label}</button></div></form>`:''}`;
 $('#modal-body').querySelectorAll('[data-close]').forEach(b=>b.onclick=requestClose);
 if(submit)$('#editor').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;if(form.dataset.busy)return;form.dataset.busy='1';const btn=form.querySelector('[type=submit]'),old=btn.textContent;btn.disabled=true;btn.textContent=operationLabel(title,label);form.querySelector('.error').textContent='';try{await withProgress(operationLabel(title,label),()=>submit(new FormData(form),form));close();}catch(error){form.querySelector('.error').textContent=error.message||'Unable to save. Please try again.';}finally{delete form.dataset.busy;btn.disabled=false;btn.textContent=old;}};
 if(!$('#modal').open)$('#modal').showModal();setup?.($('#modal-body'));hydrate($('#modal-body'));
}
export function confirm(title,message,action){modal(title,`<p>${esc(message)}</p>`,{label:'Confirm',submit:async()=>{await action();}});}
$('#modal').addEventListener('cancel',e=>{e.preventDefault();requestClose();});
