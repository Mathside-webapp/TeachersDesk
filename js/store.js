const config = globalThis.TEACHER_DESK_CONFIG || {};
import {id} from './utils.js';
export const tables = ['categories','websites','favorites','recent','shortcuts','notes','tasks','resources','profiles','preferences'];
export const state = Object.fromEntries(tables.map(t=>[t,[]]));
export const cloud = Boolean(config.supabaseUrl && config.supabasePublishableKey);
export let client, user;
const key = 'teacherdesk-preview-v1';
const cats = [['Class Websites','#2176ce'],['Teaching Tools','#e97136'],['Journals and Publications','#c73556'],['Personal Projects','#9164c7'],['Resources','#25865d'],['Others','#786D72']];
export function defaults() { return cats.map(([name,color])=>({id:id(),name,color})); }
export function seed() {
 const categories=defaults(), names=[['Mathside','Mathematics Class Website','math','#ff793c',0],['EduCore','General Subject Management','book','#1596f5',0],['GradeDock','OMR Answer Sheet Scanner','check','#156eff',1],['ClassCheck','Attendance Management','people','#c60035',1],['Beryl 9','Classroom Website','leaf','#18a95d',0],['Cobalt 9','Classroom Website','gem','#18b5ec',0],['East-Washington Times','School Publication','notes','#f83b63',2],['Teacher Desk','Personal Workspace','desk','#aa7843',3],['Relationship Board','Memories','heart','#ff6082',3],['Research','Study Files','notes','#9a70e6',3]];
 const websites=names.map(([name,description,icon,color,cat])=>({id:id(),name,description,icon,color,category:categories[cat].id,url:'',repo:'',example:true,created_at:new Date().toISOString()}));
 return {...Object.fromEntries(tables.map(t=>[t,[]])),categories,websites,favorites:[1,3,7].map(i=>({id:websites[i].id,position:i})),shortcuts:[['Google Classroom','https://classroom.google.com','book','#409c42'],['DepEd Commons','https://commons.deped.gov.ph','notes','#d12336'],['Canva','https://www.canva.com','C','#20adbc'],['ChatGPT','https://chatgpt.com','gem','#00a77c'],['Google Drive','https://drive.google.com','gem','#f6ba26']].map(([name,url,icon,color],position)=>({id:id(),name,url,icon,color,position})),tasks:['Check submissions (Mathside)','Encode attendance (ClassCheck)','Prepare activity for Grade 10','Update East-Washington Times'].map(title=>({id:id(),title,done:false,due:''})),profiles:[{id:'preview',name:'Simon Gruba Jr.'}],preferences:[{id:'preview',showTasks:true,showShortcuts:true}]};
}
function unpack(rows) {return rows.map(r=>({...r.data,id:r.id}));}
export async function init() {
 if(!cloud){Object.assign(state,JSON.parse(localStorage.getItem(key)||'null')||seed()); return;}
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('js/vendor/supabase.js',document.baseURI);script.onload=resolve;script.onerror=()=>reject(Error('Could not load the Supabase SDK.'));document.head.append(script);});
 client=globalThis.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey);
 const {data,error}=await client.auth.getSession(); if(error)throw error; user=data.session?.user;
 if(user)await load();
}
export async function load() {
 if(!cloud)return;
 if(!user){tables.forEach(t=>state[t]=[]);return;}
 const results=await Promise.all(tables.map(t=>client.from(t).select('id,data')));
 const failed=results.find(r=>r.error);if(failed)throw failed.error;
 results.forEach((r,i)=>state[tables[i]]=unpack(r.data));
 if(!state.categories.length){const {error}=await client.rpc('initialize_workspace');if(error)throw error;const r=await client.from('categories').select('id,data');if(r.error)throw r.error;state.categories=unpack(r.data);}
}
export function setUser(u){user=u;}
function online(){if(cloud && !navigator.onLine)throw Error('You are offline. Changes have not been saved. Reconnect and try again.');if(cloud&&!user)throw Error('Sign in to save your workspace.');}
function persist(next){if(!cloud)localStorage.setItem(key,JSON.stringify(next));Object.assign(state,next);}
export async function save(table,item) {
 online(); const row={...item,id:item.id||id()};
 if(cloud){const {id:rowId,...data}=row;const r=await client.from(table).upsert({id:rowId,user_id:user.id,data}).select('id,data').single();if(r.error)throw r.error;}
 const next={...state,[table]:[...state[table].filter(x=>x.id!==row.id),row]};persist(next);return row;
}
export async function saveWebsite(item,favorite){
 online();const row={...item,id:item.id||id()};
 if(cloud){const {id:rowId,...payload}=row;const {error}=await client.rpc('save_website',{website_id:rowId,payload,starred:favorite});if(error)throw error;}
 const favorites=state.favorites.filter(f=>f.id!==row.id);if(favorite)favorites.push(state.favorites.find(f=>f.id===row.id)||{id:row.id,position:Date.now()});
 persist({...state,websites:[...state.websites.filter(w=>w.id!==row.id),row],favorites});return row;
}
export async function reorderRows(table,rows){
 online();if(cloud){const result=await client.from(table).upsert(rows.map(({id,...data})=>({id,user_id:user.id,data}))).select('id');if(result.error)throw result.error;}
 const ids=new Set(rows.map(r=>r.id));persist({...state,[table]:[...state[table].filter(r=>!ids.has(r.id)),...rows]});
}
export async function remove(table,rowId) {
 online();if(cloud){const r=await client.from(table).delete().eq('id',rowId).select('id');if(r.error)throw r.error;if(!r.data.length)throw Error('This item was already removed. Refresh your workspace.');}
 const next={...state,[table]:state[table].filter(x=>x.id!==rowId)};
 if(table==='websites'){next.favorites=state.favorites.filter(x=>x.id!==rowId);next.recent=state.recent.filter(x=>x.id!==rowId);}persist(next);
}
export async function moveCategory(from,to){
 online();if(!to||from===to)throw Error('Choose another category.');
 if(cloud){const {error}=await client.rpc('move_and_delete_category',{source_id:from,target_id:to});if(error)throw error;await load();return;}
 persist({...state,categories:state.categories.filter(c=>c.id!==from),websites:state.websites.map(w=>w.category===from?{...w,category:to}:w),resources:state.resources.map(w=>w.category===from?{...w,category:to}:w)});
}
export async function upload(file){
 online();if(file.size>2*1024*1024)throw Error('Choose an image smaller than 2 MB.');
 if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type))throw Error('Use PNG, JPG, SVG or WebP.');
 // Rasterize every input, including SVG, so active SVG markup never reaches storage or the DOM.
 const source=URL.createObjectURL(file);let blob;
 try{const image=new Image();image.src=source;await image.decode();const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');const scale=Math.min(256/image.width,256/image.height);ctx.drawImage(image,(256-image.width*scale)/2,(256-image.height*scale)/2,image.width*scale,image.height*scale);blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('Could not read this image.');}finally{URL.revokeObjectURL(source);}
 if(!cloud)return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
 const path=`${user.id}/${id()}.png`;const {error}=await client.storage.from('logos').upload(path,blob,{contentType:'image/png'});if(error)throw error;return path;
}
const signed=new Map();
export async function imageUrl(path){if(!path)return '';if(!cloud)return /^data:image\/png;base64,/.test(path)?path:'';if(!path.startsWith(user?.id+'/'))return '';const old=signed.get(path);if(old&&old.until>Date.now())return old.url;const {data,error}=await client.storage.from('logos').createSignedUrl(path,3600);if(error)return '';signed.set(path,{url:data.signedUrl,until:Date.now()+3000000});return data.signedUrl;}
