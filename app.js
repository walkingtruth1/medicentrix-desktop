'use strict';
const KEY='medicentrix:medications:v1';
const $=id=>document.getElementById(id);
let meds=[];let editingId=null;let deferredInstall=null;
try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(raw))meds=raw.filter(x=>x&&typeof x.name==='string').slice(0,500)}catch(_){meds=[]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(meds));return true}catch(_){alert('Unable to save locally. Check that browser storage is available.');return false}}
function cell(tag,cls,content){const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el}
function render(){const list=$('med-list');list.replaceChildren();$('count').textContent=`(${meds.length})`;$('empty').hidden=meds.length>0;
 for(const m of meds){const card=cell('article','med-card');const info=cell('div','');info.append(cell('h3','',m.name));for(const [prefix,value] of [['Dose',m.dose],['Schedule',m.schedule],['Notes',m.notes]])if(value)info.append(cell('div','med-meta',`${prefix}: ${value}`));const actions=cell('div','card-actions');const edit=cell('button','small-button','Edit');edit.type='button';edit.addEventListener('click',()=>showForm(m.id));const del=cell('button','small-button danger','Delete');del.type='button';del.addEventListener('click',()=>{if(confirm(`Delete ${m.name} from this device?`)){meds=meds.filter(x=>x.id!==m.id);if(persist())render()}});actions.append(edit,del);card.append(info,actions);list.append(card)}}
function showForm(id=null){editingId=id;const m=meds.find(x=>x.id===id);$('dialog-title').textContent=m?'Edit medication':'Add medication';$('med-form').reset();for(const field of ['name','dose','schedule','notes'])$(field).value=m?.[field]||'';$('med-dialog').showModal();$('name').focus()}
$('med-form').addEventListener('submit',e=>{e.preventDefault();const vals={name:$('name').value.trim(),dose:$('dose').value.trim(),schedule:$('schedule').value.trim(),notes:$('notes').value.trim()};if(!vals.name)return;if(editingId){meds=meds.map(m=>m.id===editingId?{...m,...vals}:m)}else{meds.push({id:crypto.randomUUID(),...vals})}if(persist()){$('med-dialog').close();render()}});
$('add-top').addEventListener('click',()=>showForm());$('close-dialog').addEventListener('click',()=>$('med-dialog').close());$('cancel').addEventListener('click',()=>$('med-dialog').close());
$('export').addEventListener('click',()=>{const rows=[['Medication','Dose','Schedule','Notes'],...meds.map(m=>[m.name,m.dose,m.schedule,m.notes])];const csv=rows.map(r=>r.map(s=>'"'+String(s||'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='medicentrix-medication-list.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000)});
$('install-main').addEventListener('click',()=>$('install-dialog').showModal());$('close-install').addEventListener('click',()=>$('install-dialog').close());$('install-ok').addEventListener('click',()=>$('install-dialog').close());
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('install').hidden=false});
$('install').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('install').hidden=true}else $('install-dialog').showModal()});
window.addEventListener('appinstalled',()=>{$('install').hidden=true;deferredInstall=null});
if(location.protocol==='medicentrix:') { $('install-main').hidden = true; }
$('year').textContent=new Date().getFullYear();render();
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
