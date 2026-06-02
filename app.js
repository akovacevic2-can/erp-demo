(function () {
  const fmt = (n) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(Number.isFinite(+n) ? +n : 0);
  const num = (v) => Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0;
  const storeKey = 'gearbox-costing-prototype-v1';

  const defaults = {
    screen: 'machine-rates',
    statusOptions: ['Manufactured', 'Purchased', 'Outsourced', 'Supplied', 'Virtual Component', 'Stock', 'Not Required', 'Unknown'],
    project: { number: '548-H-CAST-SXXSXPXS-N-705', customer: 'Internal Quote', revision: 'N', status: 'In Pricing', markup: 10, gearboxQty: 4, deliveryDate: '2026-08-15' },
    machines: [
      { id: 'SAW', name: 'Saw', category: 'Cutting', hourlyRate: 90, setupRate: 90, multiplier: 1.3, active: true },
      { id: 'NHX6300', name: 'DMG NHX6300', category: 'CNC Mill', hourlyRate: 160, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'GLEASON_400HCD', name: 'Gleason 400HCD', category: 'Gear Cutting', hourlyRate: 150, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'GP300ES', name: 'Gleason GP300ES', category: 'Gear Shaping', hourlyRate: 150, setupRate: 130, multiplier: 1.3, active: true },
      { id: 'QC', name: 'Quality Control', category: 'Inspection', hourlyRate: 150, setupRate: 150, multiplier: 1.3, active: true },
      { id: 'WELD', name: 'Welding', category: 'Fabrication', hourlyRate: 120, setupRate: 120, multiplier: 1.3, active: true }
    ],
    bom: [
      { item: 1, partNo: 'NC-582', description: 'Gearcase', qty: 1, componentStatus: 'Manufactured', purchaseCost: 0, materialCost: 582.7, status: 'Missing Routing' },
      { item: 2, partNo: 'NG-883', description: 'Input Gear', qty: 1, componentStatus: 'Manufactured', purchaseCost: 0, materialCost: 67.77, status: 'Priced' },
      { item: 3, partNo: 'NG-884', description: 'Output Gear', qty: 1, componentStatus: 'Manufactured', purchaseCost: 0, materialCost: 72.4, status: 'Priced' },
      { item: 4, partNo: 'NS-757', description: 'Input Shaft', qty: 1, componentStatus: 'Manufactured', purchaseCost: 0, materialCost: 96.25, status: 'Needs Review' },
      { item: 40, partNo: 'NB-J002', description: 'Bearing', qty: 3, componentStatus: 'Purchased', purchaseCost: 34, materialCost: 0, status: 'Priced' },
      { item: 41, partNo: 'SEAL-548', description: 'Oil Seal', qty: 2, componentStatus: 'Purchased', purchaseCost: 18.5, materialCost: 0, status: 'Priced' },
      { item: 69, partNo: 'HB-GR5', description: 'Bolt Set', qty: 16, componentStatus: 'Purchased', purchaseCost: 0, materialCost: 0, status: 'Missing Purchase Cost' },
      { item: 70, partNo: 'PAINT', description: 'Paint / Finish', qty: 1, componentStatus: 'Outsourced', purchaseCost: 125, materialCost: 0, status: 'Priced' },
      { item: 90, partNo: 'ASSY-548', description: 'Gearbox Assembly Reference', qty: 1, componentStatus: 'Virtual Component', purchaseCost: 0, materialCost: 0, status: 'Reference Only' }
    ],
    ops: [
      { partNo: 'NG-883', opNo: 10, operation: 'Saw Blank', machineId: 'SAW', setupMin: 15, runMin: 5, batchQty: 10, notes: 'Cut gear blank' },
      { partNo: 'NG-883', opNo: 20, operation: 'Hobbing', machineId: 'GLEASON_400HCD', setupMin: 120, runMin: 28, batchQty: 10, notes: 'Cut gear teeth' },
      { partNo: 'NG-883', opNo: 30, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 10, batchQty: 10, notes: 'Final gear inspection' },
      { partNo: 'NG-884', opNo: 10, operation: 'Saw Blank', machineId: 'SAW', setupMin: 15, runMin: 6, batchQty: 10, notes: 'Cut gear blank' },
      { partNo: 'NG-884', opNo: 20, operation: 'Gear Shaping', machineId: 'GP300ES', setupMin: 90, runMin: 24, batchQty: 10, notes: 'Internal gear operation' },
      { partNo: 'NG-884', opNo: 30, operation: 'Inspection', machineId: 'QC', setupMin: 15, runMin: 12, batchQty: 10, notes: 'Final inspection' },
      { partNo: 'NS-757', opNo: 10, operation: 'Turn Shaft', machineId: 'NHX6300', setupMin: 60, runMin: 35, batchQty: 5, notes: 'Rough/finish turn' }
    ],
    selectedPart: 'NG-883',
    search: ''
  };

  let state = load();
  function load() {
    try { return { ...defaults, ...(JSON.parse(localStorage.getItem(storeKey)) || {}) }; } catch { return JSON.parse(JSON.stringify(defaults)); }
  }
  function save() { localStorage.setItem(storeKey, JSON.stringify(state)); }
  function set(patch) { state = { ...state, ...patch }; save(); render(); }
  function isManufactured(r) { return r.componentStatus === 'Manufactured'; }
  function isPurchasedLike(r) { return ['Purchased', 'Outsourced', 'Stock'].includes(r.componentStatus); }
  function isExcluded(r) { return ['Supplied', 'Virtual Component', 'Not Required'].includes(r.componentStatus); }
  function eff(m) { return num(m.hourlyRate) * num(m.multiplier || 1); }
  function setupRate(m) { return num(m.setupRate) * num(m.multiplier || 1); }
  function opCost(op) {
    const m = state.machines.find(x => x.id === op.machineId);
    if (!m) return { setup: 0, run: 0, total: 0, perPiece: 0, rate: 0 };
    const setup = num(op.setupMin) / 60 * setupRate(m);
    const run = num(op.runMin) / 60 * eff(m) * num(op.batchQty);
    const total = setup + run;
    return { setup, run, total, perPiece: num(op.batchQty) ? total / num(op.batchQty) : 0, rate: eff(m) };
  }
  function partCosts() {
    const map = {};
    state.bom.forEach(b => {
      const routingCost = state.ops.filter(o => o.partNo === b.partNo).reduce((s, o) => s + opCost(o).perPiece, 0);
      let unit = 0;
      if (isManufactured(b)) unit = num(b.materialCost) + routingCost;
      if (isPurchasedLike(b)) unit = num(b.purchaseCost);
      map[b.partNo] = { routingCost, unitCost: unit, extended: unit * num(b.qty) * num(state.project.gearboxQty) };
    });
    return map;
  }
  function totals() {
    const pc = partCosts();
    const purchased = state.bom.filter(isPurchasedLike).reduce((s, b) => s + num(b.qty) * num(state.project.gearboxQty) * num(b.purchaseCost), 0);
    const manufactured = state.bom.filter(isManufactured).reduce((s, b) => s + (pc[b.partNo]?.extended || 0), 0);
    const total = purchased + manufactured;
    const hours = state.ops.reduce((s, o) => s + (num(o.setupMin) + num(o.runMin) * num(o.batchQty)) / 60, 0);
    const missing = state.bom.filter(b => String(b.status).includes('Missing') || b.componentStatus === 'Unknown' || b.status === 'Not Reviewed').length;
    const manufacturedRequiredQty = state.bom.filter(isManufactured).reduce((s, b) => s + num(b.qty) * num(state.project.gearboxQty), 0);
    const gearsRequiredQty = state.bom.filter(b => isManufactured(b) && /gear/i.test(`${b.partNo} ${b.description}`)).reduce((s, b) => s + num(b.qty) * num(state.project.gearboxQty), 0);
    return { purchased, manufactured, total, hours, missing, sell: total * (1 + num(state.project.markup) / 100), manufacturedRequiredQty, gearsRequiredQty };
  }
  function tone(status) {
    if (['Priced', 'Complete', 'Approved', 'Ready', 'Reference Only'].includes(status)) return 'green';
    if (['Needs Review', 'Stock Item', 'Draft'].includes(status)) return 'yellow';
    if (String(status).includes('Missing') || status === 'Unknown' || status === 'Not Reviewed') return 'red';
    if (status === 'Outsourced') return 'purple';
    return 'gray';
  }
  function componentTone(s) {
    if (s === 'Manufactured') return 'purple';
    if (s === 'Purchased') return 'green';
    if (s === 'Outsourced') return 'blue';
    if (['Supplied', 'Virtual Component', 'Not Required'].includes(s)) return 'gray';
    return 'red';
  }
  function pricingStatus(row, newStatus) {
    const s = newStatus || row.componentStatus;
    if (s === 'Manufactured') return state.ops.some(o => o.partNo === row.partNo) ? 'Needs Review' : 'Missing Routing';
    if (['Purchased', 'Outsourced', 'Stock'].includes(s)) return num(row.purchaseCost) > 0 ? 'Priced' : 'Missing Purchase Cost';
    if (['Supplied', 'Virtual Component', 'Not Required'].includes(s)) return 'Reference Only';
    return 'Not Reviewed';
  }
  function badge(text, cls) { return `<span class="badge ${cls || tone(text)}">${escapeHtml(text)}</span>`; }
  function escapeHtml(v) { return String(v ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function input(value, path, type='text', attrs='') { return `<input class="input" type="${type}" value="${escapeHtml(value)}" data-path="${path}" ${attrs}>`; }
  function select(value, path, options) { return `<select class="select" data-path="${path}">${options.map(o => `<option ${o===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`; }
  function screenHead(icon, title, sub, actions='') { return `<div class="screen-head"><div class="title-wrap"><div class="title-icon">${icon}</div><div><h2>${title}</h2><p>${sub}</p></div></div><div class="actions">${actions}</div></div>`; }
  function stat(icon, label, value, sub) { return `<div class="stat"><div class="row"><div><span>${label}</span><strong>${value}</strong>${sub ? `<em>${sub}</em>` : ''}</div><div>${icon}</div></div></div>`; }
  function table(headers, rows) { return `<div class="tablebox"><div class="tablewrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`; }

  function renderShell(content) {
    const t = totals();
    const nav = [ ['machine-rates','⚙️','Machine Rates'], ['bom-upload','⬆️','BOM Upload'], ['make-buy','📋','Make/Buy Review'], ['routing','🧭','Routing Builder'], ['summary','🧮','Cost Summary'] ];
    document.getElementById('app').innerHTML = `<div class="app">
      <aside class="sidebar"><div class="brand"><div class="logo">🏭</div><div><h1>Gearbox Costing</h1><p>GitHub test prototype</p></div></div><nav class="nav">${nav.map(n=>`<button class="${state.screen===n[0]?'active':''}" data-screen="${n[0]}">${n[1]} ${n[2]}</button>`).join('')}</nav><div class="side-card"><div class="small">Current Project</div><h2>${escapeHtml(state.project.number)}</h2><div>${badge(state.project.status,'blue')} ${badge(`${t.missing} missing`,t.missing?'red':'green')}</div><div class="money">${fmt(t.total)}</div><p class="mini">Estimated cost for ${state.project.gearboxQty} gearbox(es)</p></div></aside>
      <main class="main"><div class="mobile-menu">${select(state.screen,'screen',nav.map(n=>n[0]))}</div><div class="topbar"><div><div class="mini">Active Gearbox Project</div><h2>${escapeHtml(state.project.number)}</h2><div>${badge(`Rev ${state.project.revision}`,'blue')} ${badge(state.project.status, t.missing ? 'yellow':'green')} ${badge(`Qty ${state.project.gearboxQty}`,'purple')} ${badge(`Due ${state.project.deliveryDate}`,'gray')}</div></div><div class="stats"><div class="topstat"><span>Cost</span><strong>${fmt(t.total)}</strong></div><div class="topstat"><span>Sell Price</span><strong>${fmt(t.sell)}</strong></div><div class="topstat"><span>Gearbox Qty</span><strong>${state.project.gearboxQty}</strong></div><div class="topstat"><span>Gear Parts</span><strong>${t.gearsRequiredQty}</strong></div><div class="topstat"><span>Missing</span><strong>${t.missing}</strong></div></div></div>${content}</main></div>`;
  }

  function renderMachineRates() {
    const avg = state.machines.reduce((s,m)=>s+eff(m),0) / Math.max(state.machines.length, 1);
    const rows = state.machines.map((m,i)=>`<tr><td>${input(m.id,`machines.${i}.id`)}</td><td>${input(m.name,`machines.${i}.name`)}</td><td>${input(m.category,`machines.${i}.category`)}</td><td>${input(m.hourlyRate,`machines.${i}.hourlyRate`,'number')}</td><td>${input(m.setupRate,`machines.${i}.setupRate`,'number')}</td><td>${input(m.multiplier,`machines.${i}.multiplier`,'number','step="0.05"')}</td><td class="nowrap"><b>${fmt(eff(m))}/hr</b></td><td>${select(m.active?'Yes':'No',`machines.${i}.active`,['Yes','No'])}</td><td><button class="btn danger" data-action="remove-machine" data-index="${i}">🗑 Remove</button></td></tr>`);
    renderShell(`${screenHead('⚙️','Machine Rates','Add, edit, rename, or remove machines. Machine ID is editable and updates routing operations automatically.',`<button class="btn" data-action="add-machine">➕ Add Machine</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-4 mb">${stat('🏭','Active Machines',state.machines.filter(m=>m.active).length,'Available for routing')}${stat('💵','Average Rate',fmt(avg),'Effective hourly rate')}${stat('⚠️','Missing Rates',state.machines.filter(m=>!num(m.hourlyRate)).length,'Must be corrected')}${stat('🔧','Categories',new Set(state.machines.map(m=>m.category)).size,'Machine groups')}</div>${table(['Machine ID','Machine Name','Category','Hourly Rate','Setup Rate','Multiplier','Effective Rate','Active','Remove'], rows)}`);
  }

  function renderBomUpload() {
    const rows = state.bom.map((b,i)=>`<tr><td>${b.item}</td><td><b>${escapeHtml(b.partNo)}</b></td><td>${escapeHtml(b.description)}</td><td>${input(b.qty,`bom.${i}.qty`,'number')}</td><td><b>${num(b.qty)*num(state.project.gearboxQty)}</b></td><td>${select(b.componentStatus,`bom.${i}.componentStatus`,state.statusOptions)}</td><td>${badge(b.status)}</td></tr>`);
    const chips = state.statusOptions.map((o,i)=>`<span class="chip">${escapeHtml(o)}<button data-action="remove-status" data-index="${i}">×</button></span>`).join('');
    renderShell(`${screenHead('⬆️','BOM Upload','Create a gearbox project, set order quantity and delivery date, upload or paste a BOM, then classify imported components.',`<button class="btn">⬆️ Upload Excel</button><button class="btn secondary" data-action="add-bom">➕ Add BOM Line</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid two-col"><div class="grid"><div class="card"><h3>Project Information</h3><p>Quantity and delivery date drive the required component quantities.</p><div class="mt">${field('Project Number',input(state.project.number,'project.number'))}<div class="form-grid mt">${field('Customer',input(state.project.customer,'project.customer'))}${field('Revision',input(state.project.revision,'project.revision'))}</div><div class="form-grid mt">${field('Gearbox Quantity',input(state.project.gearboxQty,'project.gearboxQty','number'))}${field('Delivery Date',input(state.project.deliveryDate,'project.deliveryDate','date'))}</div><div class="form-grid mt">${field('Status',select(state.project.status,'project.status',['Draft','In Pricing','Needs Review','Quoted','Approved']))}${field('Markup %',input(state.project.markup,'project.markup','number'))}</div></div></div><div class="card"><h3>Component Status Options</h3><p>Edit the dropdown list used to classify imported BOM lines.</p><div class="mt" style="display:flex;gap:8px">${input('', 'newStatus', 'text', 'placeholder="Add status option"')}<button class="btn" data-action="add-status">➕ Add</button></div><div class="chips">${chips}</div></div></div><div class="card"><div class="upload-zone"><div style="font-size:42px">⬆️</div><h3>Drag Excel BOM here</h3><p>Prototype placeholder. Real app will parse Excel, map columns, and classify each line.</p><div class="actions" style="justify-content:center;margin-top:16px"><button class="btn">Choose File</button><button class="btn secondary">Paste From Excel</button></div></div><h3 class="mb">Imported BOM Preview</h3>${table(['Item','Part No.','Description','Qty/Gearbox','Required Qty','Component Status','Import Status'],rows)}</div></div>`);
  }
  function field(label, html) { return `<label class="field"><span>${label}</span>${html}</label>`; }

  function renderMakeBuy() {
    const pc = partCosts(); const t = totals();
    const filtered = state.bom.filter(b => `${b.partNo} ${b.description}`.toLowerCase().includes((state.search||'').toLowerCase()));
    const rows = filtered.map((b,i0)=>{ const i=state.bom.indexOf(b); return `<tr><td>${b.item}</td><td><b>${escapeHtml(b.partNo)}</b></td><td>${escapeHtml(b.description)}</td><td>${input(b.qty,`bom.${i}.qty`,'number')}</td><td><b>${num(b.qty)*num(state.project.gearboxQty)}</b></td><td>${select(b.componentStatus,`bom.${i}.componentStatus`,state.statusOptions)}</td><td>${input(b.purchaseCost,`bom.${i}.purchaseCost`,'number')}</td><td>${input(b.materialCost,`bom.${i}.materialCost`,'number')}</td><td><b>${fmt(pc[b.partNo]?.unitCost||0)}</b></td><td>${badge(b.status)}</td></tr>`;});
    const makeCards = state.bom.filter(isManufactured).map(b=>`<div class="summary-box"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>${escapeHtml(b.partNo)}</b><p>${escapeHtml(b.description)}</p></div>${badge(b.componentStatus,componentTone(b.componentStatus))}</div><div class="grid cols-3 mt" style="grid-template-columns:repeat(3,1fr)"><div><span class="mini">Per Box</span><br><b>${b.qty}</b></div><div><span class="mini">Order</span><br><b>${state.project.gearboxQty}</b></div><div><span class="mini">Make</span><br><b>${num(b.qty)*num(state.project.gearboxQty)}</b></div></div><p class="mini mt">Needed by ${state.project.deliveryDate}</p></div>`).join('');
    const statusSummary = state.statusOptions.map(o=>`<div class="summary-box">${badge(o,componentTone(o))}<h2>${state.bom.filter(b=>b.componentStatus===o).length}</h2><p>BOM line(s)</p></div>`).join('');
    renderShell(`${screenHead('📋','Make/Buy Review','Classify BOM items, review required quantities, delivery date, purchase costs, and manufactured components to make.',`<input class="input" style="width:260px" placeholder="Search BOM..." data-path="search" value="${escapeHtml(state.search||'')}"><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-6 mb">${stat('📦','Gearboxes',state.project.gearboxQty,`Due ${state.project.deliveryDate}`)}${stat('🏭','Manufactured Lines',state.bom.filter(isManufactured).length,`${t.manufacturedRequiredQty} pcs required`)}${stat('🔧','Gear Qty Needed',t.gearsRequiredQty,'Gear parts only')}${stat('💵','Purchased Lines',state.bom.filter(b=>b.componentStatus==='Purchased').length,'Need supplier cost')}${stat('⚠️','Missing',t.missing,'Needs attention')}${stat('✅','Priced',state.bom.filter(b=>b.status==='Priced').length,'Ready lines')}</div><div class="grid wide-side mb"><div class="card"><h3>BOM Classification</h3>${table(['Item','Part Number','Description','Qty/Gearbox','Required Qty','Component Status','Purchase Cost','Material Cost','Unit Cost','Status'],rows)}</div><div class="card"><h3>Components To Make</h3><p>Required quantity is BOM qty × gearbox order quantity.</p>${makeCards}</div></div><div class="card"><h3>Component Status Summary</h3><div class="grid cols-4">${statusSummary}</div></div>`);
  }

  function renderRouting() {
    const pc = partCosts();
    const manufactured = state.bom.filter(isManufactured);
    if (!manufactured.some(b=>b.partNo===state.selectedPart) && manufactured[0]) state.selectedPart = manufactured[0].partNo;
    const part = state.bom.find(b=>b.partNo===state.selectedPart) || manufactured[0] || state.bom[0];
    const left = manufactured.map(b=>`<button class="part-btn ${b.partNo===part.partNo?'active':''}" data-action="select-part" data-part="${escapeHtml(b.partNo)}"><div class="line"><div><b>${escapeHtml(b.partNo)}</b><p>${escapeHtml(b.description)}</p></div>${badge(b.status)}</div><div class="line mini mt"><span>Make ${num(b.qty)*num(state.project.gearboxQty)} pcs</span><span>${fmt(pc[b.partNo]?.unitCost||0)}/pc</span></div></button>`).join('');
    const rows = state.ops.map((o,i)=> { if(o.partNo !== part.partNo) return ''; const c=opCost(o); return `<tr><td>${input(o.opNo,`ops.${i}.opNo`,'number')}</td><td>${input(o.operation,`ops.${i}.operation`)}</td><td>${select(o.machineId,`ops.${i}.machineId`,state.machines.filter(m=>m.active).map(m=>m.id))}</td><td>${input(o.setupMin,`ops.${i}.setupMin`,'number')}</td><td>${input(o.runMin,`ops.${i}.runMin`,'number')}</td><td>${input(o.batchQty,`ops.${i}.batchQty`,'number')}</td><td><b>${fmt(c.rate)}/hr</b></td><td><b>${fmt(c.perPiece)}</b></td><td>${input(o.notes,`ops.${i}.notes`)}</td></tr>`; }).join('');
    renderShell(`${screenHead('🧭','Routing Builder','Select a manufactured part, add material, choose machines, and calculate operation cost automatically.',`<button class="btn" data-action="add-op">➕ Add Operation</button><button class="btn secondary">📄 Traveler Preview</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid routing-layout"><div class="card" style="padding:0"><div style="padding:16px;border-bottom:1px solid var(--line)"><h3>Manufactured Parts</h3><p>Parts marked as Manufactured.</p></div><div class="part-list">${left}</div></div><div class="grid"><div class="card"><div class="grid cols-5"><div style="grid-column:span 2"><span class="mini">Selected Part</span><h3>${escapeHtml(part.partNo)} — ${escapeHtml(part.description)}</h3><p>Required: ${num(part.qty)*num(state.project.gearboxQty)} pcs by ${state.project.deliveryDate}</p></div>${stat('📦','Required Qty',num(part.qty)*num(state.project.gearboxQty),'')}${stat('💵','Material / Pc',fmt(num(part.materialCost)),'')}${stat('🔧','Routing / Pc',fmt(pc[part.partNo]?.routingCost||0),'')}</div></div><div class="card"><div style="display:flex;justify-content:space-between;gap:16px;align-items:end"><div><h3>Material & Routing</h3><p>This replaces the individual component pricing sheets from Excel.</p></div><div style="width:190px">${field('Material Cost / Pc',input(part.materialCost,`partMaterial.${part.partNo}`,'number'))}</div></div><div class="mt">${table(['Op #','Operation','Machine','Setup Min','Run Min/Pc','Batch','Rate','Cost/Pc','Notes'],rows)}</div></div></div></div>`);
  }

  function renderSummary() {
    const pc = partCosts(); const t = totals();
    const rows = state.bom.map(b=>`<tr><td>${b.item}</td><td><b>${escapeHtml(b.partNo)}</b></td><td>${escapeHtml(b.description)}</td><td>${badge(b.componentStatus,componentTone(b.componentStatus))}</td><td>${b.qty}</td><td><b>${num(b.qty)*num(state.project.gearboxQty)}</b></td><td><b>${fmt(pc[b.partNo]?.unitCost||0)}</b></td><td><b>${fmt(pc[b.partNo]?.extended||0)}</b></td><td>${state.project.deliveryDate}</td><td>${badge(b.status)}</td></tr>`);
    const missing = state.bom.filter(b => String(b.status).includes('Missing') || b.componentStatus === 'Unknown' || b.status === 'Not Reviewed').map(b=>`<div class="warn"><div style="display:flex;justify-content:space-between"><div><strong>${escapeHtml(b.partNo)}</strong><p>${escapeHtml(b.description)}</p></div>${badge(b.status,'red')}</div></div>`).join('') || `<div class="summary-box">✅ All required lines are priced. Ready for approval.</div>`;
    const breakdown = [ ['Purchased / Outsourced Parts',t.purchased,'Purchased, outsourced, and stock items'], ['Manufactured Parts',t.manufactured,'Material + routing operations'], ['Markup',t.sell-t.total,`${state.project.markup}% markup`], ['Suggested Selling Price',t.sell,'Cost plus markup'] ].map(r=>`<tr><td><b>${r[0]}</b></td><td><b>${fmt(r[1])}</b></td><td>${t.sell?((r[1]/t.sell)*100).toFixed(1):0}%</td><td>${r[2]}</td></tr>`);
    renderShell(`${screenHead('🧮','Cost Summary','Review the full gearbox cost, required component quantities, missing items, and quote readiness.',`<button class="btn">💾 Save Cost Snapshot</button><button class="btn secondary">⬇️ Export Report</button><button class="btn secondary" data-action="print">🖨 Print</button>`)}<div class="grid cols-5 mb">${stat('🧮','Total Estimated Cost',fmt(t.total),`For ${state.project.gearboxQty} gearbox(es)`)}${stat('💵','Suggested Sell Price',fmt(t.sell),`${state.project.markup}% markup`)}${stat('🏭','Manufactured Total',fmt(t.manufactured),`${t.manufacturedRequiredQty} pcs to make`)}${stat('📅','Delivery Date',state.project.deliveryDate,'Target delivery')}${stat('⚠️','Missing Items',t.missing,'Must review')}</div><div class="grid wide-side"><div class="grid"><div class="card"><h3>Cost Breakdown</h3>${table(['Category','Cost','Percent','Notes'],breakdown)}</div><div class="card"><h3>BOM Cost & Delivery Summary</h3>${table(['Item','Part No.','Description','Component Status','Qty/Gearbox','Required Qty','Unit Cost','Extended','Due Date','Status'],rows)}</div></div><div class="card"><h3>Quote Readiness</h3><p>Before approval</p><div class="mt">${missing}</div><div class="summary-box"><span class="mini">Production Need</span><h2>${t.manufacturedRequiredQty} manufactured pcs</h2><p>Includes ${t.gearsRequiredQty} gear parts due by ${state.project.deliveryDate}</p></div><div class="grid mt"><button class="btn">📊 Recalculate Cost</button><button class="btn secondary">📄 Export Internal Report</button><button class="btn ${t.missing?'secondary':''}" ${t.missing?'disabled':''}>✅ Mark Quote Approved</button></div></div></div>`);
  }

  function render() {
    if (state.screen === 'machine-rates') renderMachineRates();
    if (state.screen === 'bom-upload') renderBomUpload();
    if (state.screen === 'make-buy') renderMakeBuy();
    if (state.screen === 'routing') renderRouting();
    if (state.screen === 'summary') renderSummary();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    if (btn.dataset.screen) set({ screen: btn.dataset.screen });
    const a = btn.dataset.action;
    if (a === 'print') window.print();
    if (a === 'add-machine') { state.machines.push({ id:`MACHINE_${state.machines.length+1}`, name:'New Machine', category:'CNC', hourlyRate:100, setupRate:100, multiplier:1.3, active:true }); save(); render(); }
    if (a === 'remove-machine') { const i=+btn.dataset.index; const id=state.machines[i].id; state.machines.splice(i,1); const fallback=state.machines[0]?.id||''; state.ops.forEach(o=>{ if(o.machineId===id) o.machineId=fallback; }); save(); render(); }
    if (a === 'add-bom') { const next = Math.max(...state.bom.map(b=>num(b.item)),0)+1; state.bom.push({ item:next, partNo:`NEW-${next}`, description:'New BOM Item', qty:1, componentStatus:'Unknown', purchaseCost:0, materialCost:0, status:'Not Reviewed' }); save(); render(); }
    if (a === 'add-status') { const inp=document.querySelector('[data-path="newStatus"]'); const v=(inp?.value||'').trim(); if(v && !state.statusOptions.includes(v)) state.statusOptions.push(v); save(); render(); }
    if (a === 'remove-status') { const i=+btn.dataset.index; const val=state.statusOptions[i]; if(!state.bom.some(b=>b.componentStatus===val)) state.statusOptions.splice(i,1); save(); render(); }
    if (a === 'select-part') set({ selectedPart: btn.dataset.part });
    if (a === 'add-op') { const part=state.bom.find(b=>b.partNo===state.selectedPart) || state.bom.find(isManufactured); const max=Math.max(0,...state.ops.filter(o=>o.partNo===part.partNo).map(o=>num(o.opNo))); state.ops.push({ partNo:part.partNo, opNo:max+10, operation:'New Operation', machineId:state.machines[0]?.id||'', setupMin:0, runMin:0, batchQty:num(part.qty)*num(state.project.gearboxQty)||1, notes:'' }); save(); render(); }
  });

  document.addEventListener('input', handleChange);
  document.addEventListener('change', handleChange);
  function handleChange(e) {
    const el = e.target; const path = el.dataset.path; if (!path) return;
    if (path === 'newStatus') return;
    let value = el.type === 'number' ? num(el.value) : el.value;
    if (path === 'screen') { set({ screen: value }); return; }
    if (path === 'search') { state.search = value; save(); if(e.type==='change') render(); return; }
    const parts = path.split('.');
    if (parts[0] === 'project') state.project[parts[1]] = value;
    if (parts[0] === 'machines') {
      const i = +parts[1]; const key = parts[2]; const oldId = state.machines[i].id;
      if (key === 'active') value = value === 'Yes';
      state.machines[i][key] = value;
      if (key === 'id') state.ops.forEach(o => { if (o.machineId === oldId) o.machineId = value; });
    }
    if (parts[0] === 'bom') {
      const i = +parts[1]; const key = parts[2]; state.bom[i][key] = value;
      if (['componentStatus','purchaseCost'].includes(key)) state.bom[i].status = pricingStatus(state.bom[i]);
    }
    if (parts[0] === 'ops') { state.ops[+parts[1]][parts[2]] = value; }
    if (parts[0] === 'partMaterial') { const p = parts.slice(1).join('.'); const b = state.bom.find(x=>x.partNo===p); if(b) b.materialCost = value; }
    save();
    if (e.type === 'change' || ['project.gearboxQty','project.markup','project.deliveryDate'].includes(path) || path.includes('componentStatus')) render();
  }

  render();
})();
