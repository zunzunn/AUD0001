/* ==========================================
   Nexfra ERP Control Panel Core Script
   ========================================== */

// 1. AUTH CHECK & STATE INITIALIZATION
(function checkAuth() {
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    alert("Access Denied: Please log in as Administrator first.");
    window.location.href = 'index.html';
  }
})();

const STAGES = [
  'Pending',
  'Material Ordered',
  'Cutting',
  'Fabrication',
  'Welding',
  'Painting',
  'Assembly',
  'QC',
  'Ready',
  'Delivered'
];

let STATE = {};
let currentCustomItems = [];
let currentPreviewQuoteId = '';

function loadState() {
  const saved = localStorage.getItem('NEXFRA_ERP_STATE');
  if (saved) {
    try {
      STATE = JSON.parse(saved);
      return;
    } catch(e) {
      console.error("State loading error, resetting to defaults", e);
    }
  }
  alert("Database state not found, loading defaults.");
  window.location.href = 'index.html';
}

function saveState() {
  localStorage.setItem('NEXFRA_ERP_STATE', JSON.stringify(STATE));
}

function logSystemActivity(message) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  STATE.logs.unshift({ time, message });
  if (STATE.logs.length > 8) STATE.logs.pop();
  saveState();
}

// ------------------------------------------
// 2. LIFECYCLE & ROUTING EVENT HANDLERS
// ------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initSidebarNav();
  initDashboardShortcuts();
  initQuotationBuilder();
  initAccountsModule();
  initAdminModule();
  initLogout();
  initPdfPreviewControls();

  // Read URL query parameter routing
  handleUrlRouting();
});

function handleUrlRouting() {
  const params = new URLSearchParams(window.location.search);
  const targetModule = params.get('module') || 'dashboard';
  const targetProduct = params.get('product');

  switchModule(targetModule);

  if (targetModule === 'quotations' && targetProduct) {
    const prodSelect = document.getElementById('quote-product-select');
    if (prodSelect) {
      prodSelect.value = targetProduct;
      generateTemplateDropdown(targetProduct);
      generateDynamicSpecs(targetProduct);
      calculateQuotePricing();
    }
  }
}

function initSidebarNav() {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const mod = e.currentTarget.getAttribute('data-module');
      switchModule(mod);
    });
  });
}

function switchModule(moduleName) {
  const links = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.module-view');

  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-module') === moduleName) {
      link.classList.add('active');
    }
  });

  views.forEach(v => v.classList.remove('active'));

  const activeView = document.getElementById(`view-${moduleName}`);
  if (activeView) {
    activeView.classList.add('active');
    
    // Smooth fade in
    gsap.fromTo(activeView.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 });

    // Refresh module details
    if (moduleName === 'dashboard') renderDashboardOverview();
    if (moduleName === 'sales') renderSalesHistoryTable();
    if (moduleName === 'workorders') renderWorkOrders();
    if (moduleName === 'status') renderProductionBoard();
    if (moduleName === 'accounts') renderAccountsLedger();
    if (moduleName === 'customers') renderCustomersDirectory();
    if (moduleName === 'admin') renderAdminSettings();
  }
}

function initDashboardShortcuts() {
  document.getElementById('quick-jump-production').addEventListener('click', (e) => {
    e.preventDefault();
    switchModule('status');
  });
  document.getElementById('dash-btn-new-quote').addEventListener('click', () => switchModule('quotations'));
  document.getElementById('dash-btn-payments').addEventListener('click', () => switchModule('accounts'));
  document.getElementById('dash-btn-templates').addEventListener('click', () => switchModule('admin'));
}

function initLogout() {
  document.getElementById('portal-logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    alert("Signed out from Control Panel.");
    window.location.href = 'index.html';
  });
}

// ------------------------------------------
// 3. MODULE RENDERERS
// ------------------------------------------

// Overview module
function renderDashboardOverview() {
  loadState();
  
  const activeWOCount = STATE.workOrders.filter(w => w.stage !== 'Delivered' && w.stage !== 'Ready').length;
  const pendingQuotesCount = STATE.quotations.filter(q => q.status === 'Draft').length;
  
  let outstandingBalance = 0;
  STATE.customers.forEach(c => outstandingBalance += c.outstanding);

  document.getElementById('kpi-active-wo').innerText = activeWOCount;
  document.getElementById('kpi-pending-quotes').innerText = pendingQuotesCount;
  document.getElementById('kpi-receivable').innerText = `₹${(outstandingBalance/100000).toFixed(1)}L`;

  // Render logs list
  const logListContainer = document.getElementById('system-log-list');
  logListContainer.innerHTML = STATE.logs.map(log => `
    <li><span class="log-time">${log.time}</span> ${log.message}</li>
  `).join('');

  // Render chassis work order flow summaries
  const dashWOSummary = document.getElementById('dash-wo-summary');
  const activeWOs = STATE.workOrders.filter(w => w.stage !== 'Delivered');
  
  if (activeWOs.length === 0) {
    dashWOSummary.innerHTML = '<p class="section-hint text-center py-lg">No active chassis in production pipeline.</p>';
  } else {
    dashWOSummary.innerHTML = activeWOs.map(wo => {
      const stageIdx = STAGES.indexOf(wo.stage);
      const progressPercent = Math.round((stageIdx / (STAGES.length - 1)) * 100);
      
      return `
        <div class="dash-wo-item">
          <div class="dash-wo-info">
            <span class="dash-wo-id">${wo.id} - ${wo.product}</span>
            <span class="dash-wo-customer">${wo.customerName}</span>
          </div>
          <div class="dash-wo-progress-wrap">
            <div class="dash-wo-pb">
              <div class="dash-wo-pb-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="dash-wo-stage">
              <span class="dash-wo-stage-name">${wo.stage}</span>
              <span class="dash-wo-percent">${progressPercent}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Sales overview ledger
function renderSalesHistoryTable() {
  loadState();
  const tbody = document.querySelector('#sales-table tbody');
  const searchInput = document.getElementById('sales-search-input');
  const filterProduct = document.getElementById('sales-filter-product');

  const render = () => {
    const query = searchInput.value.toLowerCase();
    const prodFilter = filterProduct.value;

    const filteredSales = STATE.sales.filter(sale => {
      const matchQuery = sale.invoiceId.toLowerCase().includes(query) || 
                         sale.customerName.toLowerCase().includes(query) ||
                         sale.product.toLowerCase().includes(query);
      const matchProd = prodFilter === 'all' || sale.product.includes(prodFilter);
      return matchQuery && matchProd;
    });

    tbody.innerHTML = filteredSales.map(sale => {
      // Find corresponding quote to display exact preview PDF
      const matchingQuote = STATE.quotations.find(q => {
        const cust = STATE.customers.find(c => c.id === q.customerId);
        return cust && cust.company === sale.customerName && sale.product.includes(q.productName);
      });
      const quoteIdParam = matchingQuote ? matchingQuote.id : 'QT-2026-001';

      return `
        <tr>
          <td style="font-family:var(--font-headings);font-weight:700">${sale.invoiceId}</td>
          <td>${sale.customerName}</td>
          <td>${sale.product}</td>
          <td>${sale.date}</td>
          <td style="font-family:var(--font-headings);font-weight:600">₹${sale.amount.toLocaleString('en-IN')}</td>
          <td>
            <span class="tbl-status-badge status-${sale.status.toLowerCase()}">${sale.status}</span>
          </td>
          <td>
            <button class="btn btn-outline btn-xs" onclick="openPdfPreview('${quoteIdParam}')">Invoice PDF</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  searchInput.oninput = render;
  filterProduct.onchange = render;
  render();
}

// ------------------------------------------
// 4. INTERACTIVE ESTIMATION ENGINE (QUOTES)
// ------------------------------------------

function initQuotationBuilder() {
  const prodSelect = document.getElementById('quote-product-select');
  const tempSelect = document.getElementById('quote-template-select');
  const addCustomBtn = document.getElementById('btn-add-custom-item');
  const approveBtn = document.getElementById('btn-approve-quote');
  const saveDraftBtn = document.getElementById('btn-save-draft');

  loadCustomerDropdowns();

  prodSelect.onchange = (e) => {
    generateTemplateDropdown(e.target.value);
    generateDynamicSpecs(e.target.value);
    calculateQuotePricing();
  };

  tempSelect.onchange = () => {
    calculateQuotePricing();
  };

  addCustomBtn.onclick = () => {
    addCustomItemRow();
  };

  approveBtn.onclick = () => {
    submitApprovedQuotation();
  };

  saveDraftBtn.onclick = () => {
    saveQuotationDraft();
  };

  generateTemplateDropdown('flatbed');
  generateDynamicSpecs('flatbed');
  calculateQuotePricing();
}

function loadCustomerDropdowns() {
  loadState();
  const select = document.getElementById('quote-cust-select');
  select.innerHTML = STATE.customers.map(c => `
    <option value="${c.id}">${c.company} (${c.name})</option>
  `).join('') + `<option value="NEW">-- Create New Client profile --</option>`;

  select.onchange = (e) => {
    if (e.target.value === 'NEW') {
      document.getElementById('quote-cust-name').value = '';
      document.getElementById('quote-cust-name').placeholder = 'Enter Company Name';
      document.getElementById('quote-cust-gst').value = '';
      document.getElementById('quote-cust-gst').placeholder = '33AAAAA1111A1Z1';
    } else {
      const cust = STATE.customers.find(c => c.id === e.target.value);
      document.getElementById('quote-cust-name').value = cust.company;
      document.getElementById('quote-cust-gst').value = cust.gst;
    }
  };

  if (STATE.customers.length > 0) {
    document.getElementById('quote-cust-name').value = STATE.customers[0].company;
    document.getElementById('quote-cust-gst').value = STATE.customers[0].gst;
  }
}

function generateTemplateDropdown(productKey) {
  const tempSelect = document.getElementById('quote-template-select');
  const templates = STATE.products[productKey].templates;
  tempSelect.innerHTML = templates.map(t => `<option value="${t}">${t}</option>`).join('');
}

function generateDynamicSpecs(productKey) {
  const container = document.getElementById('quote-specs-container');
  const specs = STATE.products[productKey].specs;

  container.innerHTML = specs.map(spec => `
    <div class="form-group">
      <label for="spec-${spec.id}">${spec.name}</label>
      <select id="spec-${spec.id}" class="form-control spec-parameter-input">
        ${spec.options.map(opt => `
          <option value="${opt.name}" data-pricediff="${opt.priceDiff}">
            ${opt.name} ${opt.priceDiff !== 0 ? `(${opt.priceDiff > 0 ? '+' : ''}₹${opt.priceDiff.toLocaleString('en-IN')})` : '(Included)'}
          </option>
        `).join('')}
      </select>
    </div>
  `).join('');

  const inputs = document.querySelectorAll('.spec-parameter-input');
  inputs.forEach(input => {
    input.onchange = () => {
      calculateQuotePricing();
    };
  });
}

function addCustomItemRow() {
  const container = document.getElementById('quote-custom-items-list');
  const id = `item-${Date.now()}`;
  
  const rowHtml = `
    <div class="custom-item-row" id="${id}">
      <div class="form-group mb-none">
        <label>Item Description</label>
        <input type="text" class="form-control form-control-sm item-desc-input" placeholder="GPS Tracker, winches..." required>
      </div>
      <div class="form-group mb-none">
        <label>Qty</label>
        <input type="number" class="form-control form-control-sm item-qty-input" value="1" min="1" required>
      </div>
      <div class="form-group mb-none">
        <label>Price per unit (₹)</label>
        <input type="number" class="form-control form-control-sm item-price-input" placeholder="15000" min="0" required>
      </div>
      <button type="button" class="btn-remove-row" onclick="removeCustomItemRow('${id}')">
        <svg class="icon-sm" viewBox="0 0 24 24" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', rowHtml);

  const row = document.getElementById(id);
  row.querySelectorAll('input').forEach(input => {
    input.oninput = () => calculateQuotePricing();
  });
}

window.removeCustomItemRow = function(id) {
  const row = document.getElementById(id);
  if (row) {
    row.remove();
    calculateQuotePricing();
  }
};

function calculateQuotePricing() {
  const productKey = document.getElementById('quote-product-select').value;
  const product = STATE.products[productKey];
  const template = document.getElementById('quote-template-select').value;
  
  const sheet = document.getElementById('quote-summary-sheet');
  if (!sheet) return;

  let basePrice = product.basePrice;
  let specUpgradesHtml = '';
  let specsTotalDiff = 0;

  const specInputs = document.querySelectorAll('.spec-parameter-input');
  specInputs.forEach(input => {
    const selectedOpt = input.options[input.selectedIndex];
    if (selectedOpt) {
      let priceDiff = parseFloat(selectedOpt.getAttribute('data-pricediff')) || 0;
      
      const specId = input.getAttribute('id').replace('spec-', '');
      const optVal = input.value;

      if (specId === 'floor') {
        if (optVal.includes('6mm')) priceDiff = STATE.adminPricing.floor6;
        if (optVal.includes('10mm')) priceDiff = STATE.adminPricing.floor10;
      } else if (specId === 'steel') {
        if (optVal.includes('Hardox')) priceDiff = STATE.adminPricing.steelHardox;
      } else if (specId === 'axles') {
        if (optVal.includes('2 x 13T')) priceDiff = STATE.adminPricing.axle2;
        if (optVal.includes('3 x 16T')) priceDiff = STATE.adminPricing.axle3_16;
      }

      specsTotalDiff += priceDiff;

      if (priceDiff !== 0) {
        specUpgradesHtml += `
          <div class="preview-row indent">
            <span>+ ${selectedOpt.value}</span>
            <span>₹${priceDiff.toLocaleString('en-IN')}</span>
          </div>
        `;
      }
    }
  });

  let customItemsTotal = 0;
  let customItemsHtml = '';
  const customRows = document.querySelectorAll('.custom-item-row');
  
  currentCustomItems = [];
  customRows.forEach(row => {
    const desc = row.querySelector('.item-desc-input').value || 'Custom Item';
    const qty = parseInt(row.querySelector('.item-qty-input').value, 10) || 1;
    const price = parseFloat(row.querySelector('.item-price-input').value) || 0;
    const lineTotal = qty * price;
    
    customItemsTotal += lineTotal;
    currentCustomItems.push({ name: desc, price: price, qty: qty });

    customItemsHtml += `
      <div class="preview-row indent">
        <span>+ ${desc} (x${qty})</span>
        <span>₹${lineTotal.toLocaleString('en-IN')}</span>
      </div>
    `;
  });

  const basicAmount = basePrice + specsTotalDiff + customItemsTotal;
  const gstAmount = Math.round(basicAmount * 0.18);
  const grandTotal = basicAmount + gstAmount;

  sheet.innerHTML = `
    <div class="preview-row" style="font-weight:600">
      <span>Base Chassis Template (${template})</span>
      <span>₹${basePrice.toLocaleString('en-IN')}</span>
    </div>
    
    ${specUpgradesHtml ? `
      <div class="mb-xs"><span style="font-size:0.75rem;color:#9CA3AF;text-transform:uppercase">Specs upgrades:</span></div>
      ${specUpgradesHtml}
    ` : ''}

    ${customItemsHtml ? `
      <div class="mb-xs mt-xs"><span style="font-size:0.75rem;color:#9CA3AF;text-transform:uppercase">Accessories:</span></div>
      ${customItemsHtml}
    ` : ''}

    <div class="preview-row mt-md" style="border-top:1px dashed rgba(255,255,255,0.1);padding-top:10px">
      <span>Basic Amount</span>
      <span>₹${basicAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="preview-row">
      <span>GST (18%)</span>
      <span>₹${gstAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="preview-row total">
      <span>Grand Total</span>
      <span>₹${grandTotal.toLocaleString('en-IN')}</span>
    </div>
  `;

  document.getElementById('quote-builder-form').setAttribute('data-current-total', grandTotal);
}

function saveQuotationDraft() {
  const form = document.getElementById('quote-builder-form');
  const productKey = document.getElementById('quote-product-select').value;
  const productName = STATE.products[productKey].name;
  const total = parseFloat(form.getAttribute('data-current-total')) || 0;
  
  const custSelect = document.getElementById('quote-cust-select');
  let customerId = custSelect.value;
  let customerName = document.getElementById('quote-cust-name').value;

  if (customerId === 'NEW') {
    customerId = `CUST-00${STATE.customers.length + 1}`;
    STATE.customers.push({
      id: customerId,
      name: customerName,
      company: customerName,
      gst: document.getElementById('quote-cust-gst').value || 'Pending',
      phone: '+91-Admin Draft',
      email: 'admin@draft.com',
      address: 'Created during quote configuration',
      vehicles: [],
      outstanding: 0
    });
  }

  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  const specs = {};
  document.querySelectorAll('.spec-parameter-input').forEach(input => {
    const specId = input.getAttribute('id').replace('spec-', '');
    specs[specId] = input.value;
  });

  STATE.quotations.push({
    id: quoteId,
    customerId,
    productName,
    date: new Date().toISOString().split('T')[0],
    total,
    status: 'Draft',
    specs,
    customItems: currentCustomItems
  });

  logSystemActivity(`Quotation draft ${quoteId} created for client: ${customerName}.`);
  saveState();
  
  // Show PDF Preview immediately
  openPdfPreview(quoteId);
}

function submitApprovedQuotation() {
  const form = document.getElementById('quote-builder-form');
  const productKey = document.getElementById('quote-product-select').value;
  const productName = STATE.products[productKey].name;
  const total = parseFloat(form.getAttribute('data-current-total')) || 0;
  
  const custSelect = document.getElementById('quote-cust-select');
  let customerId = custSelect.value;
  let customerName = document.getElementById('quote-cust-name').value;
  let gstNum = document.getElementById('quote-cust-gst').value;

  if (!customerName) {
    alert('Please enter a valid Customer Name.');
    return;
  }

  if (customerId === 'NEW') {
    customerId = `CUST-00${STATE.customers.length + 1}`;
    STATE.customers.push({
      id: customerId,
      name: customerName,
      company: customerName,
      gst: gstNum || 'Pending',
      phone: '+91-Admin Approved',
      email: 'admin@approved.com',
      address: 'Registered via Estimation Builder',
      vehicles: [],
      outstanding: total
    });
  } else {
    const c = STATE.customers.find(x => x.id === customerId);
    if (c) c.outstanding += total;
  }

  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  const specsList = [];
  const specs = {};
  document.querySelectorAll('.spec-parameter-input').forEach(input => {
    specsList.push(input.value);
    const specId = input.getAttribute('id').replace('spec-', '');
    specs[specId] = input.value;
  });

  STATE.quotations.push({
    id: quoteId,
    customerId,
    productName,
    date: new Date().toISOString().split('T')[0],
    total,
    status: 'Approved',
    specs,
    customItems: currentCustomItems
  });

  const invoiceId = `INV-2026-${Math.floor(883 + Math.random()*100)}`;
  STATE.sales.push({
    invoiceId,
    customerName,
    product: `${productName} (${document.getElementById('quote-template-select').value})`,
    date: new Date().toISOString().split('T')[0],
    amount: total,
    status: 'Unpaid'
  });

  const woId = `WO-2026-00${STATE.workOrders.length + 1}`;
  STATE.workOrders.push({
    id: woId,
    quoteId,
    customerName,
    product: productName,
    date: new Date().toISOString().split('T')[0],
    stage: 'Pending',
    progress: 0,
    specs: specsList,
    notes: 'Drafted and approved via ERP dashboard.'
  });

  logSystemActivity(`Quote ${quoteId} approved. Generated Invoice ${invoiceId} & Work Order ${woId}.`);
  saveState();
  
  document.getElementById('quote-custom-items-list').innerHTML = '';
  
  // Show PDF Preview immediately
  openPdfPreview(quoteId);
}

// ------------------------------------------
// 5. WORK ORDERS RENDERER
// ------------------------------------------

function renderWorkOrders() {
  loadState();
  const container = document.getElementById('workorders-container');
  if (!container) return;

  if (STATE.workOrders.length === 0) {
    container.innerHTML = '<p class="section-hint text-center py-lg col-span-2">No active work orders in shop queue.</p>';
    return;
  }

  container.innerHTML = STATE.workOrders.map(wo => {
    const q = STATE.quotations.find(x => x.id === wo.quoteId);
    const badgesHtml = q && q.customItems.length > 0
      ? q.customItems.map(item => `<span class="wo-custom-badge">${item.name}</span>`).join('')
      : '<span class="section-hint" style="font-size:0.75rem">None</span>';

    return `
      <div class="wo-card">
        <div class="wo-header">
          <span class="wo-id">${wo.id}</span>
          <span class="wo-date">Allocated: ${wo.date}</span>
        </div>
        <div class="wo-body">
          <div class="wo-meta">
            <div class="wo-meta-item">
              <strong>Client Account</strong>
              ${wo.customerName}
            </div>
            <div class="wo-meta-item">
              <strong>Vehicle Target</strong>
              ${wo.product}
            </div>
            <div class="wo-meta-item">
              <strong>Production Phase</strong>
              <span style="color:var(--color-primary);font-weight:700">${wo.stage}</span>
            </div>
            <div class="wo-meta-item">
              <strong>Assembly Progress</strong>
              ${wo.progress}%
            </div>
          </div>
          
          <div class="wo-specs-box">
            <h4>TECHNICAL SPECIFICATIONS PRINT</h4>
            <ul>
              ${wo.specs.map(spec => `<li><span>${spec}</span></li>`).join('')}
            </ul>
          </div>
          
          <div class="wo-custom-items">
            <h4>AUTHORIZED ACCESSORIES</h4>
            <div class="wo-custom-list">
              ${badgesHtml}
            </div>
          </div>
          
          <div class="wo-notes">
            <strong>Factory Notes:</strong> ${wo.notes}
          </div>
        </div>
        <div class="wo-footer">
          <button class="btn btn-outline btn-sm" onclick="alert('Print triggers sent to local printer successfully.')">
            <svg class="icon-sm" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print WO Card
          </button>
          <button class="btn class-primary btn-sm" onclick="switchModule('status')" style="background-color: var(--color-primary); color: #fff; padding: 8px 16px; border: none; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; border-radius: 2px;">Track Board</button>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------
// 6. PRODUCTION BOARD (KANBAN BOARD)
// ------------------------------------------

function renderProductionBoard() {
  loadState();
  const container = document.getElementById('production-board-container');
  if (!container) return;

  const boardStages = ['Pending', 'Material Ordered', 'Cutting', 'Fabrication', 'Welding', 'Painting', 'QC', 'Ready'];
  let boardHtml = '';

  boardStages.forEach(stage => {
    const stageWOs = STATE.workOrders.filter(wo => wo.stage === stage);
    const cardsHtml = stageWOs.map(wo => `
      <div class="board-card" id="board-card-${wo.id}">
        <div class="board-card-id">${wo.id}</div>
        <div class="board-card-cust">${wo.customerName}</div>
        <div class="board-card-product">${wo.product}</div>
        <div class="board-card-action">
          <button class="btn btn-primary btn-xs" onclick="advanceWorkOrderStage('${wo.id}')">
            Advance &rarr;
          </button>
        </div>
      </div>
    `).join('');

    boardHtml += `
      <div class="board-col">
        <div class="board-col-header">
          <h3>${stage}</h3>
          <span class="board-col-count">${stageWOs.length}</span>
        </div>
        <div class="board-col-cards">
          ${cardsHtml || '<div class="section-hint text-center py-sm" style="font-size:0.75rem">No vehicles</div>'}
        </div>
      </div>
    `;
  });

  container.innerHTML = boardHtml;
}

window.advanceWorkOrderStage = function(woId) {
  const wo = STATE.workOrders.find(w => w.id === woId);
  if (!wo) return;

  const currentIdx = STAGES.indexOf(wo.stage);
  if (currentIdx < STAGES.length - 1) {
    const nextStage = STAGES[currentIdx + 1];
    wo.stage = nextStage;
    wo.progress = Math.round(((currentIdx + 1) / (STAGES.length - 1)) * 100);
    
    logSystemActivity(`Work Order ${woId} advanced to phase: ${nextStage} (${wo.progress}%).`);

    if (nextStage === 'Ready') {
      const sale = STATE.sales.find(s => s.customerName === wo.customerName && s.product.includes(wo.product));
      if (sale && sale.status === 'Unpaid') {
        logSystemActivity(`Invoice ${sale.invoiceId} outstanding flagged to intermediate status.`);
      }
    }

    const card = document.getElementById(`board-card-${woId}`);
    if (card && typeof gsap !== 'undefined') {
      gsap.to(card, { scale: 0.8, opacity: 0, duration: 0.25, onComplete: () => {
        renderProductionBoard();
      }});
    } else {
      renderProductionBoard();
    }
  } else {
    alert(`Work Order ${woId} has already completed delivery workflows.`);
  }
};

// ------------------------------------------
// 7. ACCOUNTS & CLIENT DIRECTORY
// ------------------------------------------

function initAccountsModule() {
  const payForm = document.getElementById('payment-log-form');
  if (payForm) {
    payForm.onsubmit = (e) => {
      e.preventDefault();
      
      const invoiceId = document.getElementById('pay-order-select').value;
      const amount = parseFloat(document.getElementById('pay-amount').value);
      const mode = document.getElementById('pay-mode').value;
      const ref = document.getElementById('pay-reference').value;

      const sale = STATE.sales.find(s => s.invoiceId === invoiceId);
      if (!sale) return;

      const pId = `TXN-${Math.floor(902104 + Math.random()*1000)}`;
      STATE.payments.push({
        id: pId,
        invoiceId,
        date: new Date().toISOString().split('T')[0],
        amount,
        mode,
        ref
      });

      const customer = STATE.customers.find(c => c.company === sale.customerName);
      if (customer) {
        customer.outstanding = Math.max(0, customer.outstanding - amount);
      }

      const totalPaidOnInvoice = STATE.payments
        .filter(p => p.invoiceId === invoiceId)
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaidOnInvoice >= sale.amount) {
        sale.status = 'Paid';
      } else if (totalPaidOnInvoice > 0) {
        sale.status = 'Partial';
      }

      logSystemActivity(`Logged payment ₹${amount.toLocaleString('en-IN')} for invoice ${invoiceId} via ${mode}.`);
      alert(`Payment logged successfully. Txn Ref: ${pId}.`);
      
      payForm.reset();
      renderAccountsLedger();
    };
  }
}

function renderAccountsLedger() {
  loadState();
  const tbody = document.querySelector('#accounts-ledger-table tbody');
  const paySelect = document.getElementById('pay-order-select');
  const txnHistoryList = document.getElementById('payment-history-list');
  
  if (!tbody) return;

  tbody.innerHTML = STATE.sales.map(sale => {
    const customer = STATE.customers.find(c => c.company === sale.customerName);
    const balance = customer ? customer.outstanding : 0;
    const totalPaid = sale.amount - balance;
    
    return `
      <tr>
        <td style="font-family:var(--font-headings);font-weight:700">${sale.invoiceId}</td>
        <td>${sale.customerName}</td>
        <td style="font-weight:600">₹${sale.amount.toLocaleString('en-IN')}</td>
        <td style="color:var(--color-success);font-weight:600">₹${totalPaid.toLocaleString('en-IN')}</td>
        <td style="color:var(--color-danger);font-weight:600">₹${balance.toLocaleString('en-IN')}</td>
        <td>
          <span class="tbl-status-badge status-${sale.status.toLowerCase()}">${sale.status}</span>
        </td>
        <td>
          <button class="btn btn-outline btn-xs" onclick="populatePaymentDetails('${sale.invoiceId}')">Log Pay</button>
        </td>
      </tr>
    `;
  }).join('');

  paySelect.innerHTML = STATE.sales.filter(s => s.status !== 'Paid').map(s => `
    <option value="${s.invoiceId}">${s.invoiceId} - ${s.customerName} (Due: ₹${(s.amount - (STATE.payments.filter(p => p.invoiceId === s.invoiceId).reduce((sum, p) => sum + p.amount, 0))).toLocaleString('en-IN')})</option>
  `).join('');

  txnHistoryList.innerHTML = STATE.payments.slice(0, 5).map(txn => {
    const sale = STATE.sales.find(s => s.invoiceId === txn.invoiceId);
    return `
      <li>
        <div class="tx-details">
          <strong>${sale ? sale.customerName : 'Client Account'}</strong>
          <span class="tx-ref">Ref: ${txn.ref} | Mode: ${txn.mode}</span>
        </div>
        <span class="tx-amount">+ ₹${txn.amount.toLocaleString('en-IN')}</span>
      </li>
    `;
  }).join('');
}

window.populatePaymentDetails = function(invoiceId) {
  const select = document.getElementById('pay-order-select');
  select.value = invoiceId;
  document.getElementById('pay-amount').focus();
};

function renderCustomersDirectory() {
  loadState();
  const tbody = document.querySelector('#customers-table tbody');
  if (!tbody) return;

  tbody.innerHTML = STATE.customers.map(c => `
    <tr>
      <td style="font-weight:600">${c.company}</td>
      <td style="font-family:var(--font-headings)">${c.gst}</td>
      <td>
        <div>${c.name}</div>
        <div style="font-size:0.75rem;color:var(--color-text-muted)">${c.phone} | ${c.email}</div>
      </td>
      <td style="font-size:0.8rem;color:var(--color-text-muted)">${c.address}</td>
      <td>
        ${c.vehicles.map(v => `<span class="tbl-status-badge status-paid" style="font-size:0.65rem;margin-right:4px">${v}</span>`).join('') || '<span class="section-hint" style="font-size:0.75rem">None</span>'}
      </td>
      <td style="font-family:var(--font-headings);font-weight:700;color:${c.outstanding > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
        ₹${c.outstanding.toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');
}

// ------------------------------------------
// 8. PRICING PARAMETERS CONFIG (ADMIN)
// ------------------------------------------

function initAdminModule() {
  const form = document.getElementById('admin-pricing-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      
      STATE.adminPricing.floor6 = parseFloat(document.getElementById('admin-p-floor-6').value);
      STATE.adminPricing.floor10 = parseFloat(document.getElementById('admin-p-floor-10').value);
      STATE.adminPricing.steelHardox = parseFloat(document.getElementById('admin-p-steel-hardox').value);
      STATE.adminPricing.axle2 = parseFloat(document.getElementById('admin-p-axle-2').value);
      STATE.adminPricing.axle3_16 = parseFloat(document.getElementById('admin-p-axle-3-16').value);

      logSystemActivity(`Admin updated raw material pricing coefficients.`);
      alert('Pricing parameters updated successfully in database.');
      
      renderAdminSettings();
      calculateQuotePricing();
    };
  }
}

function renderAdminSettings() {
  loadState();
  document.getElementById('admin-p-floor-6').value = STATE.adminPricing.floor6;
  document.getElementById('admin-p-floor-10').value = STATE.adminPricing.floor10;
  document.getElementById('admin-p-steel-hardox').value = STATE.adminPricing.steelHardox;
  document.getElementById('admin-p-axle-2').value = STATE.adminPricing.axle2;
  document.getElementById('admin-p-axle-3-16').value = STATE.adminPricing.axle3_16;

  const auditContainer = document.getElementById('admin-audit-logs');
  if (auditContainer) {
    auditContainer.innerHTML = `
      <li><span class="audit-time">10:42 AM</span> Admin updated baseline pricing matrix coefficients.</li>
      <li><span class="audit-time">09:15 AM</span> Sales approved Quote #2026-002 for Tata Logistics.</li>
      <li><span class="audit-time">08:00 AM</span> System synchronized database instances (4 active modules).</li>
    `;
  }
}

// ------------------------------------------
// 9. HIGH-FIDELITY PDF PREVIEW GENERATOR
// ------------------------------------------

function initPdfPreviewControls() {
  const closeBtn = document.getElementById('btn-close-pdf');
  const printBtn = document.getElementById('btn-print-pdf');
  const downloadBtn = document.getElementById('btn-download-pdf');

  if (closeBtn) closeBtn.onclick = closePdfPreview;
  if (printBtn) printBtn.onclick = printPdf;
  
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      downloadPdf(currentPreviewQuoteId);
    };
  }
}

function closePdfPreview() {
  const modal = document.getElementById('pdf-preview-modal');
  if (modal) {
    modal.classList.remove('active');
    // Switch to status board / dashboard view after closing newly created quote
    switchModule('status');
  }
}

function printPdf() {
  window.print();
}

function downloadPdf(quoteId) {
  const element = document.getElementById('pdf-content-to-print');
  const opt = {
    margin:       [0, 0, 0, 0],
    filename:     `NEXFRA_Quotation_${quoteId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };
  
  // Download using html2pdf library
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    alert("PDF generation library is loading, please try printing directly.");
  }
}

// Format numbers like 6,48,306=00
function formatPdfPrice(num) {
  return num.toLocaleString('en-IN') + '=00';
}

// Indian Numbering System Converter
function priceToIndianWords(num) {
  if (num === 0) return 'zero';
  const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertThreeDigit = (n) => {
    let word = '';
    if (n >= 100) {
      word += a[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        word += a[n];
      } else {
        word += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      }
    }
    return word.trim();
  };

  let wordStr = '';
  if (num >= 10000000) {
    wordStr += convertThreeDigit(Math.floor(num / 10000000)) + ' crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    wordStr += convertThreeDigit(Math.floor(num / 100000)) + ' lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    wordStr += convertThreeDigit(Math.floor(num / 1000)) + ' thousand ';
    num %= 1000;
  }
  if (num > 0) {
    wordStr += convertThreeDigit(num);
  }

  let finalResult = wordStr.trim();
  finalResult = finalResult.charAt(0).toUpperCase() + finalResult.slice(1) + ' only';
  return finalResult.replace(/\s+/g, ' ');
}

// Populate preview variables matching the provided reference document
window.openPdfPreview = function(quoteId) {
  loadState();
  const quote = STATE.quotations.find(q => q.id === quoteId);
  if (!quote) return;

  currentPreviewQuoteId = quoteId;

  const client = STATE.customers.find(c => c.id === quote.customerId);
  const clientName = client ? client.name : 'Client Account';
  const clientCompany = client ? client.company : 'Company Name';
  const clientAddress = client ? client.address : 'Registered Address';
  const clientGst = client ? client.gst : 'Pending';

  // Math variables
  const grandTotalVal = quote.total;
  const basicVal = Math.round(grandTotalVal / 1.18);
  const gstVal = grandTotalVal - basicVal;

  // 1. Meta values
  document.getElementById('pdf-ref-no').innerText = `REF:- NEXFRA-QTN/007.26/${quoteId.replace('QT-2026-','')}`;
  document.getElementById('pdf-date-val').innerText = `DATE: ${new Date(quote.date).toLocaleDateString('en-GB').replace(/\//g,'.')}`;
  
  // 2. To Address values
  document.getElementById('pdf-to-company').innerText = `M/s ${clientCompany.toUpperCase()}`;
  document.getElementById('pdf-to-address-1').innerText = clientAddress.substring(0, 45);
  document.getElementById('pdf-to-address-2').innerText = clientAddress.substring(45) || 'GST Registered Address';
  document.getElementById('pdf-to-gst').innerText = `GST NO: ${clientGst}`;

  // 3. Subject and Description lines
  let chassisName = 'EICHER-6035XPT';
  let capacityName = '25 CBM';
  let productFamilyText = 'TIPPER BOX BODY';

  if (quote.productName === 'Flat Bed Trailer') {
    chassisName = 'HEAVY HAULER';
    capacityName = '40 Ft';
    productFamilyText = 'FLAT BED TRAILER';
  } else if (quote.productName === 'Tip Trailer') {
    chassisName = 'TATA PRIMA';
    capacityName = '36 CBM';
    productFamilyText = 'TIP TRAILER';
  } else if (quote.productName === 'Rock Body Tipper') {
    chassisName = 'CAT-777G';
    capacityName = '16 CBM';
    productFamilyText = 'ROCK BODY TIPPER';
  }

  document.getElementById('pdf-subj-text').innerText = `Subject: Quotation for -${chassisName} , ${capacityName} ${productFamilyText} with sub frame and Hydraulic Kit`;
  document.getElementById('pdf-table-desc').innerHTML = `${capacityName} ${productFamilyText} WITH SUBFRAME and CYLINDER KIT<br>Regular TAIL DOOR ${chassisName}`;

  // 4. Calculations table format
  document.getElementById('pdf-table-basic').innerText = formatPdfPrice(basicVal);
  document.getElementById('pdf-table-gst').innerText = formatPdfPrice(gstVal);
  document.getElementById('pdf-table-total').innerText = formatPdfPrice(basicVal);
  document.getElementById('pdf-table-gst-total').innerText = formatPdfPrice(gstVal);
  
  document.getElementById('pdf-grand-total-label').innerText = formatPdfPrice(grandTotalVal);
  document.getElementById('pdf-grand-total-val').innerText = formatPdfPrice(grandTotalVal);

  // 5. Amount in Words
  document.getElementById('pdf-words-val').innerText = priceToIndianWords(grandTotalVal);

  // 6. Specifications of Work Staging (exactly 16 points mapping details)
  const specsTable = document.getElementById('pdf-specs-list-table');
  
  let specsHtml = '';
  // Default values loaded from parameters
  const floorVal = quote.specs.floor || '8mm-Thk';
  const sideVal = quote.specs.side || '6mm-Thk';
  const cylinderVal = quote.specs.cylinder || 'Hyva 150-4stage-4520';
  const steelVal = quote.specs.steel || 'ST-52';

  const specsList = [
    { num: 1, label: `Floor sheet = ${floorVal} (${steelVal})` },
    { num: 2, label: `Side board sheet = ${sideVal} (${steelVal})` },
    { num: 3, label: `Head board sheet = 6mm Thk (${steelVal})` },
    { num: 4, label: `Tail door sheet = 6mm-Thk (${steelVal})` },
    { num: 5, label: `Subframe=6mm Formed Section as per Nexfra Standard` },
    { num: 6, label: `Cylinder kit = ${cylinderVal}` },
    { num: 7, label: `Pto = NA, Pump = Included` },
    { num: 8, label: `Horizontal Lock System = Yes` },
    { num: 9, label: `Painting = Epoxy Primer with PU Paint two coats each,` },
    { num: 10, label: `Reflective tape= RTO std & guidelines` },
    { num: 11, label: `Side Marker Lamp 6 no's and top marker lamp 2 no's` },
    { num: 12, label: `Manual lock = Yes` },
    { num: 13, label: `Stabilizer Body = Yes` },
    { num: 14, label: `Tipping angle -42 to 45 degrees` },
    { num: 15, label: `Body colour as - Option` },
    { num: 16, label: `With all STD Fitments` }
  ];

  specsTable.innerHTML = specsList.map(s => `
    <tr>
      <td>${s.num}.</td>
      <td>${s.label}</td>
    </tr>
  `).join('');

  // Reveal Modal
  document.getElementById('pdf-preview-modal').classList.add('active');
};
