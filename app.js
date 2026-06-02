(function () {
  const VERSION = 'v2026-06-02-latest-dashboard-workorders-routing-bom-machines';
  const storeKey = 'gearbox-costing-prototype-latest-v6';
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(Number.isFinite(+n) ? +n : 0);
  const num = (v) => Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0;
  const today = () => new Date().toISOString().slice(0,10);

  const defaults = {
    screen: 'dashboard',
    selectedWorkOrder: 'WO-1001',
    selectedPart: 'NG-883',
    selectedModel: '548-H-CAST-SXXSXPXS-N-705',
    selectedTemplate: 'Gear - Basic',
    search: '',
    statusOptions: ['Manufactured', 'Purchased', 'Outsourced', 'Supplied', 'Virtual Component', 'Stock', 'Not Required', 'Unknown'],
    bomProject: { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N' },
    machines: [
      { id: 'SAW', name: 'Saw', category: 'Cutting', hourlyRate: 90, setupRate: 90, multiplier: 1.3, active: true },
      { id: 'NHX6300', name: 'DMG NHX6300', category: 'CNC Mill', hourlyRate: 160, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'GLEASON_400HCD', name: 'Gleason 400HCD', category: 'Gear Cutting', hourlyRate: 150, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'GP300ES', name: 'Gleason GP300ES', category: 'Gear Shaping', hourlyRate: 150, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'QC', name: 'Quality Control', category: 'Inspection', hourlyRate: 150, setupRate: 150, multiplier: 1.3, active: true },
      { id: 'WELD', name: 'Welding', category: 'Fabrication', hourlyRate: 120, setupRate: 120, multiplier: 1.3, active: true }
    ],
    boms: {
      '548-H-CAST-SXXSXPXS-N-705|N': [
        { item: 1, partNo: 'NC-582', description: 'Gearcase', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 582.7, importStatus: 'Ready', status: 'Missing Routing' },
        { item: 2, partNo: 'NG-883', description: 'Input Gear', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 67.77, importStatus: 'Ready', status: 'Priced' },
        { item: 3, partNo: 'NG-884', description: 'Output Gear', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 72.4, importStatus: 'Ready', status: 'Priced' },
        { item: 4, partNo: 'NS-757', description: 'Input Shaft', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 96.25, importStatus: 'Ready', status: 'Needs Review' },
        { item: 40, partNo: 'NB-J002', description: 'Bearing', qty: 3, componentStatus: 'Purchased', pricePc: 34, materialCost: 0, importStatus: 'Ready', status: 'Priced' },
        { item: 41, partNo: 'SEAL-548', description: 'Oil Seal', qty: 2, componentStatus: 'Purchased', pricePc: 18.5, materialCost: 0, importStatus: 'Ready', status: 'Priced' },
        { item: 69, partNo: 'HB-GR5', description: 'Bolt Set', qty: 16, componentStatus: 'Purchased', pricePc: 0, materialCost: 0, importStatus: 'Ready', status: 'Missing Purchase Cost' },
        { item: 70, partNo: 'PAINT', description: 'Paint / Finish', qty: 1, componentStatus: 'Outsourced', pricePc: 125, materialCost: 0, importStatus: 'Ready', status: 'Priced' },
        { item: 90, partNo: 'ASSY-548', description: 'Gearbox Assembly Reference', qty: 1, componentStatus: 'Virtual Component', pricePc: 0, materialCost: 0, importStatus: 'Reference', status: 'Reference Only' }
      ],
      '174-C-SBSCPS-Y-11-CAST|A': [
        { item: 1, partNo: '174-GEARCASE', description: 'Gearcase Assembly', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 650, importStatus: 'Ready', status: 'Missing Routing' },
        { item: 2, partNo: '174-GEAR-IN', description: 'Input Gear', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 84, importStatus: 'Ready', status: 'Needs Review' },
        { item: 3, partNo: '174-GEAR-OUT', description: 'Output Gear', qty: 1, componentStatus: 'Manufactured', pricePc: 0, materialCost: 94, importStatus: 'Ready', status: 'Needs Review' },
        { item: 10, partNo: 'BRG-174', description: 'Bearing Set', qty: 4, componentStatus: 'Purchased', pricePc: 44, materialCost: 0, importStatus: 'Ready', status: 'Priced' }
      ]
    },
    workOrders: [
      { id: 'WO-1001', status: 'Released', model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', qtyRequired: 4, deliveryDate: '2026-08-15', purchaseCost: 0, bomAvailable: true },
      { id: 'WO-1001', status: 'Released', model: '174-C-SBSCPS-Y-11-CAST', revision: 'A', qtyRequired: 2, deliveryDate: '2026-08-20', purchaseCost: 0, bomAvailable: true },
      { id: 'WO-1002', status: 'Planning', model: 'A67-R-SLSXPS-N12-432', revision: 'Draft', qtyRequired: 1, deliveryDate: '2026-06-20', purchaseCost: 0, bomAvailable: false }
    ],
    ops: [
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-883', opNo: 10, operation: 'Saw Blank', machineId: 'SAW', setupMin: 15, runMin: 5, batchQty: 10, notes: 'Cut gear blank' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-883', opNo: 20, operation: 'Hobbing', machineId: 'GLEASON_400HCD', setupMin: 120, runMin: 28, batchQty: 10, notes: 'Cut gear teeth' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-883', opNo: 30, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 10, batchQty: 10, notes: 'Final gear inspection' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-884', opNo: 10, operation: 'Saw Blank', machineId: 'SAW', setupMin: 15, runMin: 6, batchQty: 10, notes: 'Cut gear blank' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-884', opNo: 20, operation: 'Gear Shaping', machineId: 'GP300ES', setupMin: 90, runMin: 24, batchQty: 10, notes: 'Internal gear operation' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NG-884', opNo: 30, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 12, batchQty: 10, notes: 'Final inspection' },
      { model: '548-H-CAST-SXXSXPXS-N-705', revision: 'N', partNo: 'NS-757', opNo: 10, operation: 'Turn Shaft', machineId: 'NHX6300', setupMin: 60, runMin: 35, batchQty: 5, notes: 'Rough/finish turn' }
    ],
    templates: {
      'Gear - Basic': [
        { opNo: 10, operation: 'Saw Blank', machineId: 'SAW', setupMin: 15, runMin: 5, batchQty: 10, notes: 'Template cut blank' },
        { opNo: 20, operation: 'Gear Cutting', machineId: 'GLEASON_400HCD', setupMin: 120, runMin: 25, batchQty: 10, notes: 'Template gear teeth' },
        { opNo: 30, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 10, batchQty: 10, notes: 'Template inspection' }
      ],
      'Shaft - Basic': [
        { opNo: 10, operation: 'Turn Shaft', machineId: 'NHX6300', setupMin: 60, runMin: 35, batchQty: 5, notes: 'Template turning' },
        { opNo: 20, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 10, batchQty: 5, notes: 'Template inspection' }
      ]
    }
  };

  let state = load();
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function load(){ try { return merge(defaults, JSON.parse(localStorage.getItem(storeKey)) || {}); } catch { return clone(defaults); } }
  function merge(a,b){ const out = clone(a); Object.keys(b||{}).forEach(k => { out[k] = b[k]; }); return out; }
  function save(){ localStorage.setItem(storeKey, JSON.stringify(state)); }
  function set(patch){ state = { ...state, ...patch }; save(); render(); }
  function key(model=state.bomProject.model, rev=state.bomProject.revision){ return `${model}|${rev}`; }
  function currentBom(){ const k = key(); if(!state.boms[k]) state.boms[k] = []; return state.boms[k]; }
  function getBom(model, rev){ return state.boms[`${model}|${rev}`] || []; }
  function allModelRevisions(){ return Object.keys(state.boms).map(k => { const [model, revision] = k.split('|'); return { key:k, model, revision }; }); }
  function isMfg(r){ return r.componentStatus === 'Manufactured'; }
  function isBuyLike(r){ return ['Purchased','Outsourced','Stock'].includes(r.componentStatus); }
  function isExcluded(r){ return ['Supplied','Virtual Component','Not Required'].includes(r.componentStatus); }
  function eff(m){ return num(m.hourlyRate)*num(m.multiplier || 1); }
  function setupRate(m){ return num(m.setupRate)*num(m.multiplier || 1); }
  function opCost(o){ const m = state.machines.find(x => x.id === o.machineId); if(!m) return {setup:0,run:0,total:0,perPiece:0,rate:0}; const setup = num(o.setupMin)/60*setupRate(m); const run = num(o.runMin)/60*eff(m)*num(o.batchQty); const total=setup+run; return {setup,run,total,perPiece:num(o.batchQty)?total/num(o.batchQty):0,rate:eff(m)}; }
  function partUnitCost(model, rev, part){ const ops = state.ops.filter(o => o.model===model && o.revision===rev && o.partNo===part.partNo); const routing = ops.reduce((s,o)=>s+opCost(o).perPiece,0); if(isMfg(part)) return num(part.materialCost)+routing; if(isBuyLike(part)) return num(part.pricePc); return 0; }
  function pricingStatus(row, model=state.bomProject.model, rev=state.bomProject.revision){ if(isMfg(row)) return state.ops.some(o => o.model===model && o.revision===rev && o.partNo===row.partNo) ? 'Needs Review' : 'Missing Routing'; if(isBuyLike(row)) return num(row.pricePc)>0 ? 'Priced' : 'Missing Purchase Cost'; if(isExcluded(row)) return 'Reference Only'; return 'Not Reviewed'; }
  function workOrderStatusDate(wo){ if(String(wo.status).toLowerCase()==='completed') return 'Completed'; if(!wo.bomAvailable) return 'BOM Missing'; const d = new Date(wo.deliveryDate+'T00:00:00'); const now = new Date(today()+'T00:00:00'); const days = Math.ceil((d-now)/(1000*60*60*24)); if(days < 0) return 'Late'; if(days <= 14) return 'At Risk'; return 'On Time'; }
  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function badge(text, tone){ const cls = tone || badgeTone(text); return `<span class="badge ${cls}">${escapeHtml(text)}</span>`; }
  function badgeTone(t){ if(['Priced','Ready','Complete','Completed','On Time','Reference Only'].includes(t)) return 'green'; if(['Needs Review','Planning','Released','At Risk'].includes(t)) return 'yellow'; if(String(t).includes('Missing')||['Unknown','Not Reviewed','Late'].includes(t)) return 'red'; if(['Manufactured'].includes(t)) return 'purple'; if(['Outsourced'].includes(t)) return 'blue'; return 'gray'; }
  function componentTone(s){ if(s==='Manufactured') return 'purple'; if(s==='Purchased') return 'green'; if(s==='Outsourced') return 'blue'; if(['Supplied','Virtual Component','Not Required','Stock'].includes(s)) return 'gray'; return 'red'; }
  function input(value,path,type='text',extra=''){ return `<input class="input" type="${type}" value="${escapeHtml(value)}" data-path="${path}" ${extra}>`; }
  function select(value,path,options,extra=''){ return `<select class="select" data-path="${path}" ${extra}>${options.map(o => `<option value="${escapeHtml(o)}" ${String(o)===String(value)?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`; }
  function field(label, html){ return `<div class="field"><span>${label}</span>${html}</div>`; }
  function table(headers, rows){ return `<div class="tablebox"><div class="tablewrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`; }
  function screenHead(icon,title,sub,actions=''){ return `<div class="screen-head"><div class="title-wrap"><div class="title-icon">${icon}</div><div><h2>${title}</h2><p>${sub}</p></div></div><div class="actions">${actions}</div></div>`; }
  function stat(icon,label,value,sub=''){ return `<div class="stat"><div class="row"><div><span>${label}</span><strong>${value}</strong>${sub?`<em>${sub}</em>`:''}</div><div>${icon}</div></div></div>`; }
  function toast(msg){ const d=document.createElement('div'); d.className='toast'; d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2400); }
  function download(name, text, type='text/csv'){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
  function csvEscape(v){ const s=String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
  function toCsv(headers, rows){ return [headers.join(','), ...rows.map(r=>headers.map(h=>csvEscape(r[h])).join(','))].join('\n'); }
  function parseCsv(text){ const rows=[]; let row=[], cell='', q=false; for(let i=0;i<text.length;i++){ const c=text[i], n=text[i+1]; if(q && c==='"' && n==='"'){ cell+='"'; i++; } else if(c==='"'){ q=!q; } else if(!q && c===','){ row.push(cell); cell=''; } else if(!q && (c==='\n'||c==='\r')){ if(c==='\r'&&n==='\n') i++; row.push(cell); if(row.some(x=>x.trim()!=='')) rows.push(row); row=[]; cell=''; } else cell+=c; } row.push(cell); if(row.some(x=>x.trim()!=='')) rows.push(row); if(!rows.length) return []; const headers=rows.shift().map(h=>h.trim()); return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]??'').trim()]))); }
  function readFile(cb){ const inp=document.createElement('input'); inp.type='file'; inp.accept='.csv,.json,application/json,text/csv'; inp.onchange=()=>{ const f=inp.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>cb(String(r.result), f.name); r.readAsText(f); }; inp.click(); }
  function compareBom(oldRows,newRows){ const oldMap=Object.fromEntries(oldRows.map(r=>[r.partNo,r])); const newMap=Object.fromEntries(newRows.map(r=>[r.partNo,r])); const changes=[]; newRows.forEach(n=>{ const o=oldMap[n.partNo]; if(!o) changes.push(`ADDED: ${n.partNo} - ${n.description}`); else ['item','description','qty','componentStatus','pricePc'].forEach(k=>{ if(String(o[k]??'')!==String(n[k]??'')) changes.push(`CHANGED ${n.partNo}: ${k} from "${o[k]??''}" to "${n[k]??''}"`); }); }); oldRows.forEach(o=>{ if(!newMap[o.partNo]) changes.push(`REMOVED: ${o.partNo} - ${o.description}`); }); return changes; }

  function totals(){
    let openWos = new Set(state.workOrders.map(w=>w.id)).size;
    let lateRisk = state.workOrders.filter(w=>['Late','At Risk'].includes(workOrderStatusDate(w))).length;
    let missingBoms = state.workOrders.filter(w=>!w.bomAvailable).length;
    let componentsToMake = 0, gearsToMake = 0;
    state.workOrders.forEach(w => getBom(w.model,w.revision).filter(isMfg).forEach(b => { const q=num(b.qty)*num(w.qtyRequired); componentsToMake += q; if(/gear/i.test(`${b.partNo} ${b.description}`)) gearsToMake += q; }));
    return {openWos, lateRisk, missingBoms, componentsToMake, gearsToMake};
  }

  function renderShell(content){
    const nav=[['dashboard','📊','Dashboard'],['machine-rates','⚙️','Machine Rates'],['bom-upload','⬆️','BOM Upload'],['work-orders','📋','Work Orders'],['routing','🧭','Routing Builder'],['summary','🧮','Cost Summary']];
    $('app').innerHTML = `<div class="app"><aside class="sidebar"><div class="brand"><div class="logo">🏭</div><div><h1>Gearbox Costing</h1><p>GitHub test prototype</p></div></div><nav class="nav">${nav.map(n=>`<button class="${state.screen===n[0]?'active':''}" data-screen="${n[0]}">${n[1]} ${n[2]}</button>`).join('')}</nav><div class="version"><b>Version</b><br>${VERSION}<br><br><button class="btn small secondary" data-action="reset-demo">Reset demo data</button></div></aside><main class="main">${content}</main></div>`;
  }

  function renderDashboard(){
    const t=totals();
    const woRows=state.workOrders.map((w,i)=>`<tr><td><b>${escapeHtml(w.id)}</b></td><td>${badge(w.status)}</td><td>${escapeHtml(w.model)}</td><td>${escapeHtml(w.revision)}</td><td><b>${w.qtyRequired}</b></td><td>${w.deliveryDate}</td><td>${badge(workOrderStatusDate(w))}</td><td>${w.bomAvailable?badge('BOM Available','green'):badge('BOM Missing','red')}</td></tr>`);
    const makeMap={};
    state.workOrders.forEach(w=>getBom(w.model,w.revision).filter(isMfg).forEach(b=>{ const k=b.partNo; makeMap[k]=makeMap[k]||{partNo:b.partNo,desc:b.description,qty:0,models:new Set(),due:w.deliveryDate}; makeMap[k].qty+=num(b.qty)*num(w.qtyRequired); makeMap[k].models.add(w.model); if(w.deliveryDate < makeMap[k].due) makeMap[k].due=w.deliveryDate; }));
    const makeRows=Object.values(makeMap).map(x=>`<tr><td><b>${escapeHtml(x.partNo)}</b></td><td>${escapeHtml(x.desc)}</td><td><b>${x.qty}</b></td><td>${Array.from(x.models).map(escapeHtml).join('<br>')}</td><td>${x.due}</td><td>${badge(/gear/i.test(x.partNo+' '+x.desc)?'Gear':'Component',/gear/i.test(x.partNo+' '+x.desc)?'yellow':'purple')}</td></tr>`);
    const statusCounts={}; Object.keys(state.boms).forEach(k=>state.boms[k].forEach(b=>statusCounts[b.componentStatus]=(statusCounts[b.componentStatus]||0)+1));
    const statusCards=state.statusOptions.map(s=>`<div class="summary-box"><div>${badge(s,componentTone(s))}</div><h2>${statusCounts[s]||0}</h2><p>BOM line(s)</p></div>`).join('');
    const attention=state.workOrders.filter(w=>workOrderStatusDate(w)!=='On Time').map(w=>`<div class="warn"><b>${escapeHtml(w.id)}</b> — ${escapeHtml(w.model)} ${badge(workOrderStatusDate(w))}<br><span class="mini">Qty ${w.qtyRequired}, due ${w.deliveryDate}</span></div>`).join('') || `<div class="summary-box">✅ No late, at-risk, or missing-BOM work orders.</div>`;
    renderShell(`${screenHead('📊','Dashboard','Overview of work orders, components to make, component status, and delivery risk.',`<button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-5 mb">${stat('📋','Open Work Orders',t.openWos,'Distinct work orders')}${stat('⚠️','Late / At Risk',t.lateRisk,'Needs attention')}${stat('🏭','Components To Make',t.componentsToMake,'Total required pcs')}${stat('⚙️','Gears To Make',t.gearsToMake,'Gear parts only')}${stat('❌','Missing BOMs',t.missingBoms,'Create BOM first')}</div><div class="grid wide-side"><div class="grid"><div class="card"><h3>Work Order Delivery Overview</h3>${table(['Work Order','Status','Gearbox Model','Revision','Qty','Delivery Date','Schedule','BOM'],woRows)}</div><div class="card"><h3>Components To Make</h3>${table(['Part No.','Description','Required Qty','Used On','Earliest Due','Type'],makeRows)}</div><div class="card"><h3>Component Status Summary</h3><div class="grid cols-4">${statusCards}</div></div></div><div class="card"><h3>Attention Needed</h3><p>Late, at risk, or missing BOM work orders.</p><div class="mt">${attention}</div></div></div>`);
  }

  function renderMachineRates(){
    const avg=state.machines.reduce((s,m)=>s+eff(m),0)/Math.max(1,state.machines.length);
    const rows=state.machines.map((m,i)=>`<tr><td>${input(m.id,`machines.${i}.id`)}</td><td>${input(m.name,`machines.${i}.name`)}</td><td>${input(m.category,`machines.${i}.category`)}</td><td>${input(m.hourlyRate,`machines.${i}.hourlyRate`,'number')}</td><td>${input(m.setupRate,`machines.${i}.setupRate`,'number')}</td><td>${input(m.multiplier,`machines.${i}.multiplier`,'number','step="0.05"')}</td><td><b>${fmt(eff(m))}/hr</b></td><td>${select(m.active?'Yes':'No',`machines.${i}.active`,['Yes','No'])}</td><td><button class="btn small danger" data-action="remove-machine" data-index="${i}">Remove</button></td></tr>`);
    renderShell(`${screenHead('⚙️','Machine Rates','Simple machine master list. Machine ID is the main database reference.',`<button class="btn" data-action="add-machine">➕ Add Machine</button><button class="btn secondary" data-action="export-machines">⬇️ Export Machines</button><button class="btn secondary" data-action="import-machines">⬆️ Import Machines</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-4 mb">${stat('🏭','Machines',state.machines.length,'Total rows')}${stat('✅','Active',state.machines.filter(m=>m.active).length,'Available for routing')}${stat('💵','Average Rate',fmt(avg),'Effective hourly rate')}${stat('⚠️','Missing Rates',state.machines.filter(m=>!num(m.hourlyRate)).length,'Must be corrected')}</div>${table(['Machine ID','Machine Name','Category','Hourly Rate','Setup Rate','Multiplier','Effective Rate','Active','Remove'],rows)}`);
  }

  function renderBomUpload(){
    const bom=currentBom();
    const rows=bom.map((b,i)=>`<tr><td>${input(b.item,`bom.${i}.item`,'number')}</td><td>${input(b.partNo,`bom.${i}.partNo`)}</td><td>${input(b.description,`bom.${i}.description`)}</td><td>${input(b.qty,`bom.${i}.qty`,'number')}</td><td>${select(b.componentStatus,`bom.${i}.componentStatus`,state.statusOptions)}</td><td>${input(b.pricePc,`bom.${i}.pricePc`,'number')}</td><td>${badge(b.importStatus||'Ready',b.importStatus==='Changed'?'yellow':'green')}</td></tr>`);
    const optionChips=state.statusOptions.map((s,i)=>`<span class="badge gray">${escapeHtml(s)} <button class="btn small secondary" data-action="remove-status" data-index="${i}" ${bom.some(b=>b.componentStatus===s)?'disabled':''}>×</button></span>`).join(' ');
    renderShell(`${screenHead('⬆️','BOM Upload','Manage the master BOM for each gearbox model and revision. Import changes are compared before approval.',`<button class="btn" data-action="add-bom">➕ Add BOM Line</button><button class="btn secondary" data-action="export-bom">⬇️ Export BOM</button><button class="btn secondary" data-action="import-bom">⬆️ Import BOM</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid side-main"><div class="grid"><div class="card"><h3>Project Information</h3><p>BOM is linked to gearbox model/project name and revision.</p><div class="grid mt"><div>${field('Gearbox Model / Project Name',input(state.bomProject.model,'bomProject.model'))}</div><div class="grid cols-2"><div>${field('Revision',input(state.bomProject.revision,'bomProject.revision'))}</div><div>${field('Open Existing BOM',select(key(),'openBom',allModelRevisions().map(x=>x.key)))}</div></div><button class="btn secondary" data-action="save-new-revision">Save as New Revision</button></div></div><div class="card"><h3>Component Status Options</h3><p>Edit dropdown options used to classify BOM lines.</p><div class="toolbar mt">${input('', 'newStatus', 'text', 'placeholder="Add status option"')}<button class="btn" data-action="add-status">Add</button></div><div class="mt">${optionChips}</div></div></div><div class="card"><div class="dropzone"><h3>Import BOM or add manually</h3><p>Import CSV/JSON, compare changes, then approve or cancel.</p><div class="toolbar mt" style="justify-content:center"><button class="btn" data-action="import-bom">Choose BOM File</button><button class="btn secondary" data-action="add-bom">Add Manual Line</button></div></div><h3 class="mt">Imported BOM Preview</h3>${table(['Item','Part No.','Description','Qty/Gearbox','Component Status','Price/pc','Import Status'],rows)}</div></div>`);
  }

  function renderWorkOrders(){
    const selectedId=state.selectedWorkOrder || state.workOrders[0]?.id || '';
    const rows=state.workOrders.map((w,i)=>`<tr><td><button class="btn small secondary" data-action="select-wo" data-id="${escapeHtml(w.id)}">Open</button> ${input(w.id,`workOrders.${i}.id`)}</td><td>${select(w.status,`workOrders.${i}.status`,['Planning','Released','In Production','On Hold','Completed'])}</td><td>${input(w.model,`workOrders.${i}.model`)}</td><td>${input(w.revision,`workOrders.${i}.revision`)}</td><td>${input(w.qtyRequired,`workOrders.${i}.qtyRequired`,'number')}</td><td>${input(w.deliveryDate,`workOrders.${i}.deliveryDate`,'date')}</td><td>${input(w.purchaseCost,`workOrders.${i}.purchaseCost`,'number')}</td><td>${w.bomAvailable?badge('BOM Available','green'):badge('BOM Missing','red')}</td><td>${w.bomAvailable?'<span class="mini">Ready</span>':`<button class="btn small" data-action="create-bom" data-index="${i}">Create BOM</button>`}</td></tr>`);
    const selectedLines=state.workOrders.filter(w=>w.id===selectedId);
    const req=[];
    selectedLines.forEach(w=>getBom(w.model,w.revision).filter(isMfg).forEach(b=>req.push({wo:w.id,model:w.model,partNo:b.partNo,desc:b.description,qty:num(b.qty)*num(w.qtyRequired),due:w.deliveryDate,status:b.status})));
    const reqRows=req.map(r=>`<tr><td>${escapeHtml(r.wo)}</td><td>${escapeHtml(r.model)}</td><td><b>${escapeHtml(r.partNo)}</b></td><td>${escapeHtml(r.desc)}</td><td><b>${r.qty}</b></td><td>${r.due}</td><td>${badge(r.status)}</td></tr>`);
    renderShell(`${screenHead('📋','Work Orders','Create work orders with one or more gearbox products. This tells the software what needs to be made, how many, and when.',`<button class="btn" data-action="add-wo">➕ Add Work Order Product</button><button class="btn secondary" data-action="export-wo">⬇️ Export Work Orders</button><button class="btn secondary" data-action="import-wo">⬆️ Import Work Orders</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-4 mb">${stat('📋','Work Order Lines',state.workOrders.length,'Products scheduled')}${stat('🏭','Products To Make',state.workOrders.reduce((s,w)=>s+num(w.qtyRequired),0),'Total gearbox qty')}${stat('❌','Missing BOMs',state.workOrders.filter(w=>!w.bomAvailable).length,'Need BOM upload')}${stat('⚠️','Late / At Risk',state.workOrders.filter(w=>['Late','At Risk'].includes(workOrderStatusDate(w))).length,'Schedule warning')}</div><div class="card"><h3>Work Orders</h3>${table(['Work Order','Status','Gearbox Model','Revision','Req Qty','Required Delivery Date','Purchase Cost','BOM','Action'],rows)}</div><div class="card mt"><h3>Items Required To Make — ${escapeHtml(selectedId)}</h3><p>Select a work order above to see manufactured parts required by all gearbox products inside that work order.</p>${table(['Work Order','Gearbox Model','Part No.','Description','Required Qty','Delivery Date','Pricing Status'],reqRows)}</div>`);
  }

  function renderRouting(){
    const modelKeyOptions=allModelRevisions().map(x=>x.key);
    const [model,revision]=state.selectedModel.includes('|') ? state.selectedModel.split('|') : [state.selectedModel, state.bomProject.revision];
    const bom=getBom(model,revision).filter(isMfg);
    if(!bom.some(b=>b.partNo===state.selectedPart) && bom[0]) state.selectedPart=bom[0].partNo;
    const part=bom.find(b=>b.partNo===state.selectedPart) || bom[0];
    const partOptions=bom.map(b=>b.partNo);
    const selectedOps=part ? state.ops.filter(o=>o.model===model&&o.revision===revision&&o.partNo===part.partNo) : [];
    const opsRows=selectedOps.map((o)=>{ const idx=state.ops.indexOf(o); const c=opCost(o); return `<tr><td>${input(o.opNo,`ops.${idx}.opNo`,'number')}</td><td>${input(o.operation,`ops.${idx}.operation`)}</td><td>${select(o.machineId,`ops.${idx}.machineId`,state.machines.filter(m=>m.active).map(m=>m.id))}</td><td>${input(o.setupMin,`ops.${idx}.setupMin`,'number')}</td><td>${input(o.runMin,`ops.${idx}.runMin`,'number')}</td><td>${input(o.batchQty,`ops.${idx}.batchQty`,'number')}</td><td><b>${fmt(c.rate)}/hr</b></td><td><b>${fmt(c.perPiece)}</b></td><td>${input(o.notes,`ops.${idx}.notes`)}</td><td><button class="btn small danger" data-action="remove-op" data-index="${idx}">Remove</button></td></tr>`; });
    const routingCost=selectedOps.reduce((s,o)=>s+opCost(o).perPiece,0);
    const templateOpts=Object.keys(state.templates);
    renderShell(`${screenHead('🧭','Routing Builder','Select a gearbox model/revision and manufactured component, then create material and routing operations.',`<button class="btn" data-action="add-op">➕ Add Operation</button><button class="btn secondary" data-action="export-ops">⬇️ Export Operations</button><button class="btn secondary" data-action="import-ops">⬆️ Import Operations</button><button class="btn secondary" data-action="save-template">💾 Save Template</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="card mb"><div class="grid cols-4"><div>${field('Gearbox Model / Revision',select(state.selectedModel,'selectedModel',modelKeyOptions))}</div><div>${field('Manufactured Part No.',select(state.selectedPart,'selectedPart',partOptions))}</div><div>${field('Apply Template',select(state.selectedTemplate,'selectedTemplate',templateOpts))}</div><div style="align-self:end"><button class="btn secondary" data-action="apply-template">Apply Template</button></div></div></div>${part?`<div class="grid cols-4 mb">${stat('📦','Selected Part',part.partNo,part.description)}${stat('💵','Material / Pc',fmt(num(part.materialCost)),'Editable below')}${stat('🔧','Routing / Pc',fmt(routingCost),'From operations')}${stat('🧮','Total / Pc',fmt(num(part.materialCost)+routingCost),'Material + routing')}</div><div class="card"><div class="grid cols-3 mb"><div>${field('Material Cost / Pc',input(part.materialCost,`partMaterial.${model}|${revision}|${part.partNo}`,'number'))}</div><div>${field('Component Status',badge(part.componentStatus,componentTone(part.componentStatus)))}</div><div>${field('Pricing Status',badge(part.status))}</div></div>${table(['Op #','Operation','Machine','Setup Min','Run Min/Pc','Batch','Rate','Cost/Pc','Notes','Remove'],opsRows)}</div>`:`<div class="card"><h3>No manufactured parts</h3><p>This model/revision has no BOM lines marked as Manufactured.</p></div>`}`);
  }

  function renderSummary(){
    const rows=[]; let total=0;
    state.workOrders.forEach(w=>getBom(w.model,w.revision).forEach(b=>{ const unit=partUnitCost(w.model,w.revision,b); const ext=unit*num(b.qty)*num(w.qtyRequired); total+=ext; rows.push(`<tr><td>${escapeHtml(w.id)}</td><td>${escapeHtml(w.model)}</td><td><b>${escapeHtml(b.partNo)}</b></td><td>${escapeHtml(b.description)}</td><td>${badge(b.componentStatus,componentTone(b.componentStatus))}</td><td>${b.qty}</td><td>${num(b.qty)*num(w.qtyRequired)}</td><td><b>${fmt(unit)}</b></td><td><b>${fmt(ext)}</b></td><td>${w.deliveryDate}</td><td>${badge(b.status)}</td></tr>`); }));
    const missing=[]; state.workOrders.forEach(w=>{ if(!w.bomAvailable) missing.push(`<div class="warn"><b>${w.id}</b> ${w.model}: BOM Missing</div>`); getBom(w.model,w.revision).forEach(b=>{ if(String(b.status).includes('Missing')||b.status==='Not Reviewed') missing.push(`<div class="warn"><b>${b.partNo}</b> — ${b.description}: ${badge(b.status)}</div>`); }); });
    renderShell(`${screenHead('🧮','Cost Summary','High-level cost rollup based on all work orders and available BOM/routing data.',`<button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-4 mb">${stat('💵','Total Estimated Cost',fmt(total),'All open work order lines')}${stat('📋','Work Order Lines',state.workOrders.length,'Products')}${stat('⚠️','Missing Items',missing.length,'Need review')}${stat('🏭','Components To Make',totals().componentsToMake,'Manufactured qty')}</div><div class="grid wide-side"><div class="card"><h3>Work Order Cost Summary</h3>${table(['Work Order','Model','Part No.','Description','Status','Qty/Box','Required Qty','Unit Cost','Extended','Due','Pricing'],rows)}</div><div class="card"><h3>Attention Needed</h3><div class="mt">${missing.join('') || '<div class="summary-box">✅ No missing pricing or BOM issues.</div>'}</div></div></div>`);
  }

  function render(){
    if(state.screen==='dashboard') return renderDashboard();
    if(state.screen==='machine-rates') return renderMachineRates();
    if(state.screen==='bom-upload') return renderBomUpload();
    if(state.screen==='work-orders') return renderWorkOrders();
    if(state.screen==='routing') return renderRouting();
    if(state.screen==='summary') return renderSummary();
  }

  function currentBomIndexPath(path){ const i=+path.split('.')[1]; const k=path.split('.')[2]; return {i,k}; }
  function handleInput(e){ const el=e.target; const path=el.dataset.path; if(!path) return; let value=el.type==='number'?num(el.value):el.value; if(path==='newStatus') return; if(path==='openBom'){ const [m,r]=value.split('|'); state.bomProject={model:m,revision:r}; state.selectedModel=value; save(); render(); return; } if(path==='selectedModel'){ state.selectedModel=value; const [m,r]=value.split('|'); const b=getBom(m,r).find(isMfg); if(b) state.selectedPart=b.partNo; save(); render(); return; } if(path==='selectedPart'||path==='selectedTemplate'){ state[path]=value; save(); render(); return; }
    const parts=path.split('.');
    if(parts[0]==='machines'){ const i=+parts[1], k=parts[2]; const old=state.machines[i].id; if(k==='active') value=value==='Yes'; state.machines[i][k]=value; if(k==='id') state.ops.forEach(o=>{ if(o.machineId===old) o.machineId=value; }); }
    if(parts[0]==='bom'){ const bom=currentBom(); const i=+parts[1], k=parts[2]; bom[i][k]=value; if(['componentStatus','pricePc'].includes(k)) bom[i].status=pricingStatus(bom[i]); }
    if(parts[0]==='bomProject'){ state.bomProject[parts[1]]=value; if(!state.boms[key()]) state.boms[key()]=[]; state.selectedModel=key(); }
    if(parts[0]==='workOrders'){ const i=+parts[1], k=parts[2]; if(k==='bomAvailable') value=value==='Yes'; state.workOrders[i][k]=value; state.workOrders[i].bomAvailable = getBom(state.workOrders[i].model,state.workOrders[i].revision).length>0; }
    if(parts[0]==='ops') state.ops[+parts[1]][parts[2]]=value;
    if(parts[0]==='partMaterial'){ const [,m,r,p]=path.split('|'); const part=getBom(m,r).find(b=>b.partNo===p); if(part) { part.materialCost=value; part.status=pricingStatus(part,m,r); } }
    save(); if(e.type==='change' || path.includes('componentStatus') || path.includes('selected')) render();
  }

  function exportMachines(){ const headers=['Machine ID','Machine Name','Category','Hourly Rate','Setup Rate','Multiplier','Effective Rate','Active']; const rows=state.machines.map(m=>({'Machine ID':m.id,'Machine Name':m.name,Category:m.category,'Hourly Rate':m.hourlyRate,'Setup Rate':m.setupRate,Multiplier:m.multiplier,'Effective Rate':eff(m),Active:m.active?'Yes':'No'})); download('machine-rates.csv',toCsv(headers,rows)); }
  function importMachines(){ readFile((text,name)=>{ let rows=name.endsWith('.json')?JSON.parse(text):parseCsv(text); state.machines=rows.map(r=>({id:r['Machine ID']||r.id||'',name:r['Machine Name']||r.name||'',category:r.Category||r.category||'',hourlyRate:num(r['Hourly Rate']??r.hourlyRate),setupRate:num(r['Setup Rate']??r.setupRate),multiplier:num(r.Multiplier??r.multiplier)||1,active:String(r.Active??r.active).toLowerCase()!=='no'&&String(r.Active??r.active).toLowerCase()!=='false'})); save(); render(); toast('Machine list imported'); }); }
  function exportBom(){ const bom=currentBom(); const headers=['Item','Part No.','Description','Qty/Gearbox','Component Status','Price/pc','Import Status']; const rows=bom.map(b=>({'Item':b.item,'Part No.':b.partNo,Description:b.description,'Qty/Gearbox':b.qty,'Component Status':b.componentStatus,'Price/pc':b.pricePc,'Import Status':b.importStatus||'Ready'})); download(`${state.bomProject.model}_${state.bomProject.revision}_BOM.csv`,toCsv(headers,rows)); }
  function importBom(){ readFile((text,name)=>{ let parsed=name.endsWith('.json')?JSON.parse(text):parseCsv(text); const newRows=parsed.map((r,i)=>({item:num(r.Item??r.item)||i+1,partNo:r['Part No.']||r.partNo||'',description:r.Description||r.description||'',qty:num(r['Qty/Gearbox']??r.qty)||1,componentStatus:r['Component Status']||r.componentStatus||'Unknown',pricePc:num(r['Price/pc']??r.pricePc),materialCost:num(r.materialCost),importStatus:'Ready',status:'Not Reviewed'})).filter(r=>r.partNo); newRows.forEach(r=>r.status=pricingStatus(r)); const old=currentBom(); const changes=compareBom(old,newRows); showModal('Approve BOM Import Changes',`<p>Review changes for ${escapeHtml(state.bomProject.model)} revision ${escapeHtml(state.bomProject.revision)}.</p><div class="change-list">${escapeHtml(changes.join('\n') || 'No changes detected.')}</div><div class="actions mt"><button class="btn" data-action="approve-bom-import">Approve Changes</button><button class="btn secondary" data-action="close-modal">Cancel</button></div>`); window.pendingBomImport=newRows; }); }
  function exportWorkOrders(){ const headers=['Work Order','Status','Gearbox Model','Revision','Qty Required','Required Delivery Date','Purchase Cost','BOM Available']; const rows=state.workOrders.map(w=>({'Work Order':w.id,Status:w.status,'Gearbox Model':w.model,Revision:w.revision,'Qty Required':w.qtyRequired,'Required Delivery Date':w.deliveryDate,'Purchase Cost':w.purchaseCost,'BOM Available':w.bomAvailable?'Yes':'No'})); download('work-orders.csv',toCsv(headers,rows)); }
  function importWorkOrders(){ readFile((text,name)=>{ const rows=name.endsWith('.json')?JSON.parse(text):parseCsv(text); state.workOrders=rows.map(r=>({id:r['Work Order']||r.id||'',status:r.Status||r.status||'Planning',model:r['Gearbox Model']||r.model||'',revision:r.Revision||r.revision||'',qtyRequired:num(r['Qty Required']??r.qtyRequired)||1,deliveryDate:r['Required Delivery Date']||r.deliveryDate||today(),purchaseCost:num(r['Purchase Cost']??r.purchaseCost),bomAvailable:String(r['BOM Available']??r.bomAvailable).toLowerCase().startsWith('y')})); state.workOrders.forEach(w=>w.bomAvailable=getBom(w.model,w.revision).length>0); save(); render(); toast('Work orders imported'); }); }
  function exportOps(){ const headers=['Gearbox Model','Revision','Part No.','Op No.','Operation','Machine ID','Setup Min','Run Min/Pc','Batch Qty','Notes']; const rows=state.ops.map(o=>({'Gearbox Model':o.model,Revision:o.revision,'Part No.':o.partNo,'Op No.':o.opNo,Operation:o.operation,'Machine ID':o.machineId,'Setup Min':o.setupMin,'Run Min/Pc':o.runMin,'Batch Qty':o.batchQty,Notes:o.notes})); download('routing-operations.csv',toCsv(headers,rows)); }
  function importOps(){ readFile((text,name)=>{ const rows=name.endsWith('.json')?JSON.parse(text):parseCsv(text); state.ops=rows.map(r=>({model:r['Gearbox Model']||r.model||state.bomProject.model,revision:r.Revision||r.revision||state.bomProject.revision,partNo:r['Part No.']||r.partNo||'',opNo:num(r['Op No.']??r.opNo),operation:r.Operation||r.operation||'',machineId:r['Machine ID']||r.machineId||'',setupMin:num(r['Setup Min']??r.setupMin),runMin:num(r['Run Min/Pc']??r.runMin),batchQty:num(r['Batch Qty']??r.batchQty)||1,notes:r.Notes||r.notes||''})); Object.keys(state.boms).forEach(k=>{ const [m,r]=k.split('|'); state.boms[k].forEach(b=>b.status=pricingStatus(b,m,r)); }); save(); render(); toast('Routing operations imported'); }); }
  function showModal(title,body){ const d=document.createElement('div'); d.className='modal-backdrop'; d.innerHTML=`<div class="modal"><h3>${title}</h3>${body}</div>`; document.body.appendChild(d); }

  document.addEventListener('click',(e)=>{ const btn=e.target.closest('button'); if(!btn) return; if(btn.dataset.screen){ set({screen:btn.dataset.screen}); return; } const a=btn.dataset.action; if(!a) return; if(a==='print') window.print(); if(a==='reset-demo'){ localStorage.removeItem(storeKey); state=clone(defaults); render(); toast('Demo data reset'); }
    if(a==='add-machine'){ state.machines.push({id:`MACHINE_${state.machines.length+1}`,name:'New Machine',category:'CNC',hourlyRate:100,setupRate:100,multiplier:1.3,active:true}); save(); render(); }
    if(a==='remove-machine'){ const i=+btn.dataset.index; const id=state.machines[i].id; state.machines.splice(i,1); const fallback=state.machines[0]?.id||''; state.ops.forEach(o=>{ if(o.machineId===id) o.machineId=fallback; }); save(); render(); }
    if(a==='export-machines') exportMachines(); if(a==='import-machines') importMachines();
    if(a==='add-bom'){ const bom=currentBom(); const next=Math.max(0,...bom.map(b=>num(b.item)))+1; bom.push({item:next,partNo:`NEW-${next}`,description:'New BOM Item',qty:1,componentStatus:'Unknown',pricePc:0,materialCost:0,importStatus:'Manual',status:'Not Reviewed'}); save(); render(); }
    if(a==='export-bom') exportBom(); if(a==='import-bom') importBom();
    if(a==='add-status'){ const v=document.querySelector('[data-path="newStatus"]')?.value.trim(); if(v && !state.statusOptions.includes(v)) state.statusOptions.push(v); save(); render(); }
    if(a==='remove-status'){ const s=state.statusOptions[+btn.dataset.index]; if(!currentBom().some(b=>b.componentStatus===s)){ state.statusOptions=state.statusOptions.filter(x=>x!==s); save(); render(); } }
    if(a==='save-new-revision'){ const newRev=prompt('New revision name:', state.bomProject.revision + '-NEW'); if(newRev){ state.boms[`${state.bomProject.model}|${newRev}`]=clone(currentBom()); state.bomProject.revision=newRev; state.selectedModel=key(); save(); render(); } }
    if(a==='approve-bom-import'){ state.boms[key()]=window.pendingBomImport||currentBom(); window.pendingBomImport=null; document.querySelector('.modal-backdrop')?.remove(); save(); render(); toast('BOM changes approved'); }
    if(a==='close-modal') document.querySelector('.modal-backdrop')?.remove();
    if(a==='add-wo'){ state.workOrders.push({id:`WO-${1000+new Set(state.workOrders.map(w=>w.id)).size+1}`,status:'Planning',model:state.bomProject.model,revision:state.bomProject.revision,qtyRequired:1,deliveryDate:today(),purchaseCost:0,bomAvailable:true}); save(); render(); }
    if(a==='select-wo'){ state.selectedWorkOrder=btn.dataset.id; save(); render(); }
    if(a==='create-bom'){ const w=state.workOrders[+btn.dataset.index]; state.bomProject={model:w.model,revision:w.revision}; state.boms[key()] = state.boms[key()] || []; w.bomAvailable=true; state.screen='bom-upload'; save(); render(); }
    if(a==='export-wo') exportWorkOrders(); if(a==='import-wo') importWorkOrders();
    if(a==='add-op'){ const [m,r]=state.selectedModel.split('|'); const part=state.selectedPart; const existing=state.ops.filter(o=>o.model===m&&o.revision===r&&o.partNo===part); const max=Math.max(0,...existing.map(o=>num(o.opNo))); state.ops.push({model:m,revision:r,partNo:part,opNo:max+10,operation:'New Operation',machineId:state.machines[0]?.id||'',setupMin:0,runMin:0,batchQty:1,notes:''}); const b=getBom(m,r).find(x=>x.partNo===part); if(b) b.status=pricingStatus(b,m,r); save(); render(); }
    if(a==='remove-op'){ state.ops.splice(+btn.dataset.index,1); save(); render(); }
    if(a==='export-ops') exportOps(); if(a==='import-ops') importOps();
    if(a==='save-template'){ const [m,r]=state.selectedModel.split('|'); const ops=state.ops.filter(o=>o.model===m&&o.revision===r&&o.partNo===state.selectedPart).map(({opNo,operation,machineId,setupMin,runMin,batchQty,notes})=>({opNo,operation,machineId,setupMin,runMin,batchQty,notes})); const name=prompt('Template name:', `${state.selectedPart} Template`); if(name){ state.templates[name]=ops; state.selectedTemplate=name; save(); render(); } }
    if(a==='apply-template'){ const [m,r]=state.selectedModel.split('|'); const tpl=state.templates[state.selectedTemplate]||[]; state.ops=state.ops.filter(o=>!(o.model===m&&o.revision===r&&o.partNo===state.selectedPart)); tpl.forEach(o=>state.ops.push({...clone(o),model:m,revision:r,partNo:state.selectedPart})); const b=getBom(m,r).find(x=>x.partNo===state.selectedPart); if(b) b.status=pricingStatus(b,m,r); save(); render(); toast('Template applied'); }
  });
  document.addEventListener('input', handleInput); document.addEventListener('change', handleInput);
  render();
})();
