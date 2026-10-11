import {state,init,cloud,client,user,setUser,load,save,remove,reorderRows} from './store.js';
import {esc,icon,color,safeUrl,relative} from './utils.js';
import {$,toast,empty,appIcon,hydrate,modal,confirm,withProgress} from './ui.js';
import {card,websiteEditor,manageWebsite,toggleFavorite} from './websites.js';
import {categoryEditor,deleteCategory,taskEditor,linkEditor,deleteItem,noteEditor} from './editors.js';
import {authDialog,passwordDialog,profileForm,bindProfile} from './auth.js';
const nav=[['home','Home'],['websites','My Websites'],['categories','Categories'],['notes','Notes'],['settings','Settings']];
let page=nav.some(([p])=>p===location.hash.slice(1))?location.hash.slice(1):'home',query='',category='all',taskFilter='pending',ready=false;
let mode='full';try{mode=localStorage.getItem('teacherdesk-mode-v1')==='shortcuts'?'shortcuts':'full';}catch{}
const byPosition=(a,b)=>(a.position||0)-(b.position||0);
$('#menu-toggle').innerHTML=icon('menu');
function menu(open){document.body.classList.toggle('menu-open',open);$('#menu-toggle').setAttribute('aria-expanded',open);}
$('#menu-toggle').onclick=()=>menu(!document.body.classList.contains('menu-open'));$('#scrim').onclick=()=>menu(false);
function connection(){const el=$('#connection');el.classList.toggle('offline',!navigator.onLine);el.textContent=!navigator.onLine?(cloud?'Offline — cloud changes are unavailable. Reconnect to sync.':'Offline — preview changes stay in this browser.'):cloud?(user?'': 'Sign in to open your private workspace.'):'Local preview · Saved on this browser only · Connect Supabase in Settings';}
function currentName(){return state.profiles[0]?.name||user?.user_metadata?.display_name||'Teacher';}
function filters(){return `<div class="filters" aria-label="Filter by category"><button class="pill ${category==='all'?'active':''}" data-category="all" aria-pressed="${category==='all'}">All</button>${state.categories.map(c=>`<button class="pill ${category===c.id?'active':''}" data-category="${c.id}" aria-pressed="${category===c.id}">${esc(c.name.replace(' Websites','').replace('Teaching ','').replace('Journals and Publications','Journals').replace(' Projects',''))}</button>`).join('')}</div>`;}
function searchBar(hero=false){return `<label class="${hero?'hero-search':'page-search'}">${icon('search')}<span class="visually-hidden">Search ${page==='notes'?'notes':'websites, tools, or categories'}</span><input type="search" id="search" value="${esc(query)}" placeholder="${page==='notes'?'Search your notes…':'Search websites, tools, or categories…'}" autocomplete="off"></label>`;}
function hero(){const h=new Date().getHours(),g=h<12?'morning':h<18?'afternoon':'evening';return `<section class="hero" aria-label="Welcome"><div class="greeting">Good ${g},</div><h1>${esc(currentName().split(' ')[0])}!</h1><p>Your teacher workspace for a more<br>organized and productive day.</p><div class="hero-meta"><div class="date-box">${new Date().toLocaleDateString(undefined,{weekday:'long'})}<br>${new Date().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} &nbsp;☀️</div><div class="quote">“Same purpose,<br>more possibilities.”</div></div>${searchBar(true)}</section>`;}
function filteredSites(){const starred=new Map(state.favorites.map(f=>[f.id,f.position||0]));let rows=state.websites.filter(w=>(mode==='shortcuts'||category==='all'||w.category===category)&&[w.name,w.description,state.categories.find(c=>c.id===w.category)?.name].join(' ').toLowerCase().includes(mode==='shortcuts'?'':query.toLowerCase()));if(page==='home'||mode==='shortcuts')rows.sort((a,b)=>Number(starred.has(b.id))-Number(starred.has(a.id))||(starred.has(a.id)&&starred.has(b.id)?starred.get(a.id)-starred.get(b.id):0));return rows;}
function siteGrid(){const rows=filteredSites();return (rows.length?rows.map(w=>card(w)).join(''):mode==='shortcuts'?'':empty('Make room for your next great tool',query?'No matching websites. Try another search.':'Add a website to start organizing your desk.'))+(mode==='shortcuts'?'<button class="add-tile" data-action="add-site" aria-label="Add Website"><span class="add-tile-icon">'+icon('plus')+'</span><strong>Add Website</strong></button>':'');}
function quick(){return `<section><div class="section-heading"><h2>Quick Access</h2><button class="primary" data-action="add-shortcut" aria-label="Add Quick Access">${icon('plus')}Add Quick Access</button></div><div class="quick-grid" tabindex="0" role="region" aria-label="Quick Access, scroll left or right">${[...state.shortcuts].sort(byPosition).map(s=>`<div class="quick"><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${appIcon(s)}<span>${esc(s.name)}</span></a><button class="icon-button" data-action="manage-shortcut" data-id="${s.id}" aria-label="Manage ${esc(s.name)}">${icon('more')}</button></div>`).join('')||'<p class="help">Add your everyday links.</p>'}</div></section>`;}
function tasks(){const rows=state.tasks.filter(t=>taskFilter==='all'||(taskFilter==='completed'?t.done:!t.done));return `<section class="task-panel"><div class="section-heading"><h2>To Do Today</h2><button class="pill" data-action="add-task">+ Add</button></div><div class="task-filters">${['pending','completed','all'].map(v=>`<button class="${taskFilter===v?'active':''}" data-task-filter="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div>${rows.map(t=>`<div class="task-row ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} data-task="${t.id}" aria-label="Complete ${esc(t.title)}"><button class="task-title" data-action="edit-task" data-id="${t.id}">${esc(t.title)}${t.due?`<small>Due ${esc(t.due)}</small>`:''}</button><button class="icon-button" data-action="delete-task" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">${icon('trash')}</button></div>`).join('')||'<p class="help">All clear. A little breathing room.</p>'}</section>`;}
function header(title,description,action,label){return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div>${action?`<button class="primary" data-action="${action}">${icon('plus')}${label}</button>`:''}</div>`;}
function categories(){return header('Categories','A place for every part of your teaching day.','add-category','Add Category')+`<div class="workspace"><div class="list">${state.categories.map(c=>`<div class="list-row">${appIcon({icon:'categories',color:c.color})}<button class="grow" style="text-align:left" data-open-category="${c.id}"><strong>${esc(c.name)}</strong><p>${state.websites.filter(w=>w.category===c.id).length} websites</p></button><button class="icon-button" data-action="edit-category" data-id="${c.id}" aria-label="Edit ${esc(c.name)}">${icon('edit')}</button><button class="icon-button danger" data-action="delete-category" data-id="${c.id}" aria-label="Delete ${esc(c.name)}">${icon('trash')}</button></div>`).join('')}</div></div>`;}

function noteGrid(){return [...state.notes].filter(n=>(n.title+' '+n.content).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||(b.updated_at||'').localeCompare(a.updated_at||'')).map(n=>`<article class="note" style="--note-color:${color(n.color)}"><div class="section-heading"><h3>${esc(n.title)}</h3><button class="icon-button" data-action="pin-note" data-id="${n.id}" aria-label="${n.pinned?'Unpin':'Pin'} ${esc(n.title)}" aria-pressed="${Boolean(n.pinned)}">${icon('pin')}</button></div><div class="note-content">${esc(n.content)}</div><footer><span>Updated ${relative(n.updated_at||n.created_at)}<br>Created ${new Date(n.created_at).toLocaleDateString()}</span><span><button class="icon-button" data-action="edit-note" data-id="${n.id}" aria-label="Edit ${esc(n.title)}">${icon('edit')}</button><button class="icon-button" data-action="delete-note" data-id="${n.id}" aria-label="Delete ${esc(n.title)}">${icon('trash')}</button></span></footer></article>`).join('')||empty('A little space for your ideas','Keep lesson ideas, reminders, and moments worth remembering.');}

function settings(){return header('Settings','Make yourself at home.')+`<div class="workspace"><div class="settings">${profileForm()}<h2>Account</h2><p class="help">${cloud?esc(user?.email||'Sign in to your teacher account.'):'Local preview mode. To sync across devices, follow README.md and configure Supabase in js/config.js.'}</p><div class="settings-actions"><button class="secondary" data-action="account">${cloud&&user?'Sign Out':'Sign In / Create Account'}</button>${cloud&&user?'<button class="secondary" data-action="password">Change Password</button>':''}<button class="secondary" data-action="install">Install Teacher Desk</button></div><h2>Pinned website order</h2><p class="help">Starred websites come first on Home and in shortcut mode. Use the arrows to arrange them.</p>${[...state.favorites].sort(byPosition).map((f,i)=>{const w=state.websites.find(w=>w.id===f.id);return w?`<div class="order-row"><span>${esc(w.name)}</span><button class="icon-button" data-action="favorite-up" data-id="${f.id}" ${i===0?'disabled':''} aria-label="Move ${esc(w.name)} up">${icon('up')}</button><button class="icon-button" data-action="favorite-down" data-id="${f.id}" ${i===state.favorites.length-1?'disabled':''} aria-label="Move ${esc(w.name)} down">${icon('down')}</button></div>`:'';}).join('')||'<p class="help">Star websites to arrange them here.</p>'}<h2>Category colors</h2><p class="help">Choose a category to change its name or color.</p><div class="filters">${state.categories.map(c=>`<button class="pill" data-action="edit-category" data-id="${c.id}">${esc(c.name)}</button>`).join('')}</div></div></div>`;}
function modeDock(){return '<div class="mode-dock"><span class="mode-caption">'+(mode==='shortcuts'?'Shortcut mode':'Full desk')+'</span><button type="button" role="switch" aria-label="Switch between Full desk and Shortcut mode" aria-checked="'+(mode==='shortcuts')+'" class="mode-switch" data-action="switch-mode"><span></span></button><span class="mode-hint">'+(mode==='shortcuts'?'Switch to full desk':'Switch to shortcuts')+'</span></div>';}
function bindSearch(){const search=$('#search');if(search)search.oninput=()=>{query=search.value;refreshSites();refreshNotes();};}
function refreshSites(){const el=$('#site-grid');if(el){el.innerHTML=siteGrid();hydrate(el);}}
function refreshTasks(){const el=$('.task-panel');if(!el)return;const height=el.getBoundingClientRect().height;const temp=document.createElement('div');temp.innerHTML=tasks();el.style.minHeight=height+'px';el.innerHTML=temp.firstElementChild.innerHTML;}
function refreshNotes(){const el=$('#note-grid');if(el)el.innerHTML=noteGrid();}
function refreshCategories(){if(page!=='categories')return;const temp=document.createElement('div');temp.innerHTML=categories();$('#content .list').innerHTML=temp.querySelector('.list').innerHTML;}
function refreshShortcuts(){const el=$('.quick-grid');if(!el)return;const temp=document.createElement('div');temp.innerHTML=quick();el.innerHTML=temp.querySelector('.quick-grid').innerHTML;hydrate(el);}
export function render(){
 const guest=cloud&&!user;
 document.body.classList.toggle('td-guest',guest);
 document.body.classList.remove('td-loading');
 const welcome=$('#landing');if(welcome)welcome.hidden=!guest;
 if(guest){document.body.classList.remove('shortcut-mode');$('#mode-dock').hidden=true;$('#content').replaceChildren();menu(false);return;}
 connection();document.body.classList.toggle('shortcut-mode',mode==='shortcuts'&&(!cloud||Boolean(user)));$('#mode-dock').innerHTML=modeDock();$('#mode-dock').hidden=cloud&&!user;$('#nav').innerHTML=nav.map(([p,n])=>'<button class="nav-button '+(page===p?'active':'')+'" data-nav="'+p+'" '+(page===p?'aria-current="page"':'')+'>'+icon(p)+n+'</button>').join('');$('#bottom-nav').innerHTML=nav.filter(([p])=>['home','websites','notes','settings'].includes(p)).map(([p,n])=>'<button class="'+(page===p?'active':'')+'" data-nav="'+p+'" '+(page===p?'aria-current="page"':'')+'>'+icon(p)+n.replace('My ','')+'</button>').join('');$('#profile-name').textContent=currentName();$('#avatar').textContent=currentName().charAt(0).toUpperCase()||'T';$('#account').innerHTML=icon('logout')+(cloud&&user?'Sign Out':'Sign In');

 if(mode==='shortcuts'){$('#content').innerHTML='<section class="launcher"><header class="launcher-header"><img src="assets/logo.png" alt="" width="76" height="76"><div><h1>My Websites</h1><p>Your teaching tools, one click away.</p></div></header><div class="grid launcher-grid" id="site-grid">'+siteGrid()+'</div></section>';hydrate();return;}
 if(page==='home'||page==='websites'){
  const home=page==='home',prefs=state.preferences[0]||{};
  if(home){
   $('#content').innerHTML=hero()+`<div class="workspace home-workspace"><div class="home-board"><div class="home-main"><section class="home-card-container home-strip-section"><div class="section-heading"><h2>My Websites</h2><button class="primary" data-action="add-site">${icon('plus')}Add Website</button></div><div class="scroll-row websites-scroll" id="site-grid" tabindex="0" role="region" aria-label="My Websites, scroll left or right">${siteGrid()}</div></section>${prefs.showShortcuts!==false?`<div class="home-card-container home-shortcuts-container">${quick()}</div>`:''}</div><aside class="home-side"><section class="home-category-container"><div class="section-heading"><h2>Categories</h2></div>${filters()}</section>${prefs.showTasks!==false?tasks():''}</aside></div></div>`;
  } else {
   $('#content').innerHTML=header('My Websites','Every classroom, tool, and project in one place.')+'<div class="workspace">'+searchBar()+'<div class="section-heading"><div class="right">'+filters()+'<button class="primary" data-action="add-site">'+icon('plus')+'Add Website</button></div></div><div class="grid" id="site-grid">'+siteGrid()+'</div></div>';
  }
 }
 else if(page==='categories')$('#content').innerHTML=categories();else if(page==='notes')$('#content').innerHTML=header('Notes','Small thoughts. Big ideas. All kept here.','add-note','New Note')+'<div class="workspace">'+searchBar()+'<div class="note-grid" id="note-grid">'+noteGrid()+'</div></div>';else if(page==='settings'){$('#content').innerHTML=settings();bindProfile(render);}
 bindSearch();hydrate();}
function navigate(p){page=p;query='';category='all';menu(false);if(location.hash!=='#'+p)history.pushState(null,'','#'+p);render();window.scrollTo({top:0});}
window.addEventListener('popstate',()=>{page=nav.some(([p])=>p===location.hash.slice(1))?location.hash.slice(1):'home';query='';category='all';render();});
async function reorder(table,rowId,direction){const rows=[...state[table]].sort(byPosition),i=rows.findIndex(x=>x.id===rowId),other=rows[i+direction];if(!other)return;[rows[i],rows[i+direction]]=[rows[i+direction],rows[i]];await reorderRows(table,rows.map((r,position)=>({...r,position})));if(table==='shortcuts')refreshShortcuts();else render();}
function manageShortcut(s){modal(s.name,`<div class="menu-actions"><button data-short="edit">Edit shortcut</button><button data-short="up">Move earlier</button><button data-short="down">Move later</button><button data-short="delete" class="danger">Remove shortcut</button></div>`,{setup:root=>root.querySelectorAll('[data-short]').forEach(b=>b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{if(b.dataset.short==='edit')linkEditor('shortcuts',s,refreshShortcuts);if(b.dataset.short==='delete')deleteItem('shortcuts',s,refreshShortcuts);if(['up','down'].includes(b.dataset.short)){await reorder('shortcuts',s.id,b.dataset.short==='up'?-1:1);toast('Shortcut order updated.');}}catch(e){toast(e.message, "error");}finally{b.disabled=false;}})});}
async function account(){if(cloud&&user)confirm('Sign Out?','Your cloud workspace will be available when you sign back in.',async()=>{const {error}=await client.auth.signOut();if(error)throw error;setUser(null);await load();render();toast('Signed out.');});else authDialog(render);}
$('#account').onclick=account;
// Welcome-page actions open the existing, secure Supabase authentication dialog.
document.querySelectorAll('[data-welcome-auth]').forEach(button=>{
 button.addEventListener('click',()=>authDialog(render,button.dataset.welcomeAuth));
});

// Smoothly switch between Full Desk and Shortcut Mode without changing the
// layout, saved preference, or the fixed welcome banner. View Transitions
// animate viewport snapshots; the opacity-only fallback leaves fixed elements fixed.
let teacherDeskModeIsAnimating = false;
function animateDeskModeSwitch() {
  if (teacherDeskModeIsAnimating) return;
  teacherDeskModeIsAnimating = true;
  const nextMode = mode === 'full' ? 'shortcuts' : 'full';
  const html = document.documentElement;
  const directionClass = nextMode === 'shortcuts' ? 'td-to-shortcuts' : 'td-to-full';
  html.classList.add(directionClass);
  const finish = () => {
    html.classList.remove('td-to-shortcuts', 'td-to-full', 'td-mode-exit', 'td-mode-enter');
    teacherDeskModeIsAnimating = false;
  };
  const changeView = () => {
    mode = nextMode;
    try {
      localStorage.setItem('teacherdesk-mode-v1', mode);
    } catch {
      toast('Mode changed for this visit. Browser storage is unavailable.');
    }
    query = '';
    category = 'all';
    render();
    window.scrollTo(0, 0);
  };
  // Prefer no animation when the user has requested reduced motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    changeView();
    finish();
    return;
  }
  if (typeof document.startViewTransition === 'function') {
    try {
      const transition = document.startViewTransition(changeView);
      transition.finished.then(finish, finish);
      return;
    } catch { /* The opacity fallback below also works on older browsers. */ }
  }
  html.classList.add('td-mode-exit');
  window.setTimeout(() => {
    changeView();
    html.classList.remove('td-mode-exit');
    html.classList.add('td-mode-enter');
    window.setTimeout(finish, 340);
  }, 135);
}

document.addEventListener('click',async e=>{
 const navButton=e.target.closest('[data-nav]');if(navButton){navigate(navButton.dataset.nav);return;}
 const filter=e.target.closest('[data-category]');if(filter){category=filter.dataset.category;render();return;}
 const openCat=e.target.closest('[data-open-category]');if(openCat){navigate('websites');category=openCat.dataset.openCategory;render();return;}
 const tf=e.target.closest('[data-task-filter]');if(tf){taskFilter=tf.dataset.taskFilter;refreshTasks();return;}
 const launch=e.target.closest('[data-launch]');if(launch)return;
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action,rid=b.dataset.id;const w=state.websites.find(x=>x.id===rid),c=state.categories.find(x=>x.id===rid),t=state.tasks.find(x=>x.id===rid),n=state.notes.find(x=>x.id===rid),r=state.resources.find(x=>x.id===rid);b.disabled=true;
 try{if(a==='switch-mode'){animateDeskModeSwitch();}else if(a==='add-site'||a==='edit-site')websiteEditor(w,refreshSites);else if(a==='manage-site')manageWebsite(w,refreshSites);else if(a==='favorite'){await toggleFavorite(rid);refreshSites();}else if(a==='add-category'||a==='edit-category')categoryEditor(c,refreshCategories);else if(a==='delete-category')deleteCategory(c,refreshCategories);else if(a==='add-task'||a==='edit-task')taskEditor(t,refreshTasks);else if(a==='delete-task')deleteItem('tasks',t,refreshTasks);else if(a==='add-note'||a==='edit-note')noteEditor(n,refreshNotes);else if(a==='pin-note'){await save('notes',{...n,pinned:!n.pinned});refreshNotes();}else if(a==='delete-note')deleteItem('notes',n,refreshNotes);else if(a==='add-shortcut')linkEditor('shortcuts',null,refreshShortcuts);else if(a==='manage-shortcut')manageShortcut(state.shortcuts.find(s=>s.id===rid));else if(a==='favorite-up'||a==='favorite-down')await reorder('favorites',rid,a.endsWith('up')?-1:1);else if(a==='account')await account();else if(a==='password')passwordDialog();else if(a==='install')install();}catch(error){toast(error.message||'Something went wrong. Try again.', 'error');}finally{b.disabled=false;}
});
document.addEventListener('change',async e=>{if(e.target.matches('[data-task]')){const b=e.target,t=state.tasks.find(t=>t.id===b.dataset.task);b.disabled=true;try{await save('tasks',{...t,done:b.checked});refreshTasks();}catch(err){b.checked=t.done;toast(err.message, "error");}finally{b.disabled=false;}}});
let deferredInstall;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
function install(){if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>deferredInstall=null);}else modal('Install Teacher Desk','<p>On iPhone or iPad, open this site in Safari, tap Share, then Add to Home Screen.</p><p class="help">On Android or desktop, use your browser’s Install app / Add to Home screen menu when available. Installation requires HTTPS (or localhost). If already installed, open Teacher Desk from your apps.</p>');}
$('#install').onclick=install;
window.addEventListener('online',async()=>{connection();if(cloud&&user)try{await load();render();}catch(e){toast(e.message, "error");}});window.addEventListener('offline',connection);
let refreshing=false;
async function sync(){if(!ready||!cloud||!user||!navigator.onLine||document.hidden||$('#modal').open||refreshing)return;refreshing=true;try{const before=JSON.stringify(state);await load();if(before!==JSON.stringify(state)){refreshSites();refreshTasks();refreshNotes();refreshCategories();refreshShortcuts();}}catch(e){toast('Could not refresh your desk: '+e.message, 'error');}finally{refreshing=false;}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});setInterval(sync,30000);
async function boot(){try{await withProgress('Opening your desk…',()=>init());ready=true;render();if(cloud){client.auth.onAuthStateChange((event,session)=>{const changed=user?.id!==session?.user?.id;setUser(session?.user);if(changed)setTimeout(async()=>{try{await load();render();}catch(e){toast(e.message, "error");}},0);if(event==='PASSWORD_RECOVERY')setTimeout(passwordDialog,0);});}}catch(e){document.body.classList.remove('td-loading','td-guest');$('#landing').hidden=true;$('#content').innerHTML=header('Your desk couldn’t open','Check your connection and Supabase configuration.')+`<div class="workspace"><p class="error">${esc(e.message)}</p><button class="primary" id="retry">Try Again</button></div>`;$('#retry').onclick=()=>location.reload();}
 if('serviceWorker' in navigator && location.protocol !== 'file:'){try{const hadController=Boolean(navigator.serviceWorker.controller);const reg=await navigator.serviceWorker.register('./service-worker.js');const update=()=>{if(reg.waiting&&!document.querySelector("dialog").open)modal('A fresh desk is ready','<p>A new version of Teacher Desk is available. Reload to update the app.</p>',{label:'Update Now',submit:async()=>{reg.waiting.postMessage({type:'SKIP_WAITING'});}});};reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',()=>{if(reg.waiting&&navigator.serviceWorker.controller)update();});});if(reg.waiting)update();let reload=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reload){reload=true;location.reload();}});}catch(e){console.warn('Offline shell unavailable:',e.message);}}
}
boot();


