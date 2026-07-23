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
let currentPreviewQuoteId = '';

// Product Configurator Wizard State
let wizardState = {
  currentStep: 1,
  customer: {},
  category: '',
  subtype: '',
  capacity: '',
  specs: {},
  customMods: [],
  status: 'Draft',
  total: 0
};

// Master Vehicle Configurator Templates
const WIZARD_PRODUCT_TEMPLATES = {
  flatbed: {
    name: "Flat Bed Trailer",
    basePrice: 520000,
    dimensions: { length: "40 Feet", height: "NA", width: "98 Inches" },
    specs: [
      { id: "beam", name: "Main Beam Steel Grade", section: "material", type: "dropdown", options: ["ST52", "Hardox 450", "BSK46", "E450", "Custom"], defaultValue: "ST52", priceDiffs: { "ST52": 0, "Hardox 450": 150000, "BSK46": 40000, "E450": 60000, "Custom": 80000 } },
      { id: "floor", name: "Floor Sheet Type", section: "material", type: "dropdown", options: ["3mm Chequered", "4mm Plain", "6mm ST52", "Custom"], defaultValue: "3mm Chequered", priceDiffs: { "3mm Chequered": 0, "4mm Plain": 15000, "6mm ST52": 45000, "Custom": 60000 } },
      { id: "axles", name: "Axle Brand & Loading", section: "chassis", type: "radio", options: ["York 3x13T", "Fuwa 3x13T", "York 3x16T", "York 2x13T", "Custom"], defaultValue: "York 3x13T", priceDiffs: { "York 3x13T": 0, "Fuwa 3x13T": -10000, "York 3x16T": 80000, "York 2x13T": -100000, "Custom": 50000 } },
      { id: "suspension", name: "Suspension System", section: "chassis", type: "dropdown", options: ["Mechanical Leaf Spring", "Air Suspension", "Bogie Suspension", "Custom"], defaultValue: "Mechanical Leaf Spring", priceDiffs: { "Mechanical Leaf Spring": 0, "Air Suspension": 120000, "Bogie Suspension": 90000, "Custom": 80000 } },
      { id: "brake", name: "Brake System Pneumatic", section: "chassis", type: "dropdown", options: ["WABCO ABS", "BCS EBS", "Brake Master", "Custom"], defaultValue: "WABCO ABS", priceDiffs: { "WABCO ABS": 0, "BCS EBS": 60000, "Brake Master": 20000, "Custom": 40000 } },
      { id: "disc", name: "Wheel Disc Style", section: "chassis", type: "dropdown", options: ["Steel 10-hole", "Alloy York", "Custom"], defaultValue: "Steel 10-hole", priceDiffs: { "Steel 10-hole": 0, "Alloy York": 45000, "Custom": 25000 } },
      { id: "hook", name: "King Pin/Hook Size", section: "chassis", type: "dropdown", options: ["Standard 2-inch JOST", "Heavy Duty 3.5-inch JOST", "Custom"], defaultValue: "Standard 2-inch JOST", priceDiffs: { "Standard 2-inch JOST": 0, "Heavy Duty 3.5-inch JOST": 15000, "Custom": 10000 } },
      { id: "tyre", name: "Tyres Fitted", section: "chassis", type: "dropdown", options: ["Apollo 10.00R20", "MRF Musclerok", "JK Jetsteel", "Bridgestone", "Custom"], defaultValue: "Apollo 10.00R20", priceDiffs: { "Apollo 10.00R20": 0, "MRF Musclerok": 12000, "JK Jetsteel": -8000, "Bridgestone": 24000, "Custom": 15000 } },
      { id: "painting", name: "Surface Treatment", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Customer Choice", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -15000, "Customer Choice": 0, "Custom": 20000 } },
      { id: "colour", name: "Finish Colour", section: "painting", type: "text", defaultValue: "Golden Green" },
      { id: "toolbox", name: "Fitted Tool Box", section: "accessories", type: "checkbox", defaultValue: "Yes", priceDiffs: { "Yes": 0, "No": -5000 } },
      { id: "spare_wheel", name: "Spare Wheel Carrier", section: "accessories", type: "checkbox", defaultValue: "Yes", priceDiffs: { "Yes": 0, "No": -8000 } }
    ]
  },
  sidewall: {
    name: "Side Wall Trailer",
    basePrice: 580000,
    dimensions: { length: "40 Feet", height: "4.5 Feet", width: "98 Inches" },
    specs: [
      { id: "beam", name: "Main Beam Steel Grade", section: "material", type: "dropdown", options: ["ST52", "Hardox 450", "BSK46", "E450", "Custom"], defaultValue: "ST52", priceDiffs: { "ST52": 0, "Hardox 450": 150000, "BSK46": 40000, "E450": 60000, "Custom": 80000 } },
      { id: "floor", name: "Floor Sheet Type", section: "material", type: "dropdown", options: ["3mm Chequered", "4mm Plain", "6mm ST52", "Custom"], defaultValue: "3mm Chequered", priceDiffs: { "3mm Chequered": 0, "4mm Plain": 15000, "6mm ST52": 45000, "Custom": 60000 } },
      { id: "side_panel", name: "Side Panel Height/Style", section: "material", type: "radio", options: ["1.5mm Corrugated", "2mm Corrugated", "Custom"], defaultValue: "1.5mm Corrugated", priceDiffs: { "1.5mm Corrugated": 0, "2mm Corrugated": 25000, "Custom": 40000 } },
      { id: "axles", name: "Axle Brand & Loading", section: "chassis", type: "radio", options: ["York 3x13T", "Fuwa 3x13T", "York 3x16T", "York 2x13T", "Custom"], defaultValue: "York 3x13T", priceDiffs: { "York 3x13T": 0, "Fuwa 3x13T": -10000, "York 3x16T": 80000, "York 2x13T": -100000, "Custom": 50000 } },
      { id: "suspension", name: "Suspension System", section: "chassis", type: "dropdown", options: ["Mechanical Leaf Spring", "Air Suspension", "Bogie Suspension", "Custom"], defaultValue: "Mechanical Leaf Spring", priceDiffs: { "Mechanical Leaf Spring": 0, "Air Suspension": 120000, "Bogie Suspension": 90000, "Custom": 80000 } },
      { id: "brake", name: "Brake System Pneumatic", section: "chassis", type: "dropdown", options: ["WABCO ABS", "BCS EBS", "Brake Master", "Custom"], defaultValue: "WABCO ABS", priceDiffs: { "WABCO ABS": 0, "BCS EBS": 60000, "Brake Master": 20000, "Custom": 40000 } },
      { id: "tyre", name: "Tyres Fitted", section: "chassis", type: "dropdown", options: ["Apollo 10.00R20", "MRF Musclerok", "JK Jetsteel", "Bridgestone", "Custom"], defaultValue: "Apollo 10.00R20", priceDiffs: { "Apollo 10.00R20": 0, "MRF Musclerok": 12000, "JK Jetsteel": -8000, "Bridgestone": 24000, "Custom": 15000 } },
      { id: "painting", name: "Surface Treatment", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Customer Choice", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -15000, "Customer Choice": 0, "Custom": 20000 } },
      { id: "colour", name: "Finish Colour", section: "painting", type: "text", defaultValue: "Golden Green" }
    ]
  },
  tiptrailer: {
    name: "Tip Trailer",
    basePrice: 720000,
    dimensions: { length: "32 Feet", height: "4.5 Feet", width: "98 Inches" },
    specs: [
      { id: "beam", name: "Main Beam Steel Grade", section: "material", type: "dropdown", options: ["ST52", "Hardox 450", "BSK46", "E450", "Custom"], defaultValue: "ST52", priceDiffs: { "ST52": 0, "Hardox 450": 150000, "BSK46": 40000, "E450": 60000, "Custom": 80000 } },
      { id: "floor", name: "Floor Sheet thickness", section: "material", type: "dropdown", options: ["6mm MS", "8mm ST-52", "10mm ST-52", "Custom"], defaultValue: "8mm ST-52", priceDiffs: { "6mm MS": -15000, "8mm ST-52": 0, "10mm ST-52": 30000, "Custom": 45000 } },
      { id: "side_sheet", name: "Side Sheet thickness", section: "material", type: "dropdown", options: ["4mm MS", "6mm ST-52", "8mm ST-52", "Custom"], defaultValue: "6mm ST-52", priceDiffs: { "4mm MS": -10000, "6mm ST-52": 0, "8mm ST-52": 25000, "Custom": 40000 } },
      { id: "cylinder", name: "Tipping Cylinder Model", section: "hydraulic", type: "dropdown", options: ["Hyva 179-5stage", "Hyva 150-4stage", "Wipro Heavy Duty", "Custom"], defaultValue: "Hyva 179-5stage", priceDiffs: { "Hyva 179-5stage": 0, "Hyva 150-4stage": -25000, "Wipro Heavy Duty": -10000, "Custom": 20000 } },
      { id: "axles", name: "Axles Fitted", section: "chassis", type: "radio", options: ["York 3x13T", "York 3x16T", "York 2x13T", "Custom"], defaultValue: "York 3x13T", priceDiffs: { "York 3x13T": 0, "York 3x16T": 80000, "York 2x13T": -100000, "Custom": 40000 } },
      { id: "painting", name: "Surface Treatment", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -15000, "Custom": 20000 } },
      { id: "colour", name: "Finish Colour", section: "painting", type: "text", defaultValue: "Royal Blue" }
    ]
  },
  boxbody: {
    name: "Box Body Tipper",
    basePrice: 480000,
    dimensions: { length: "20 Feet", height: "4.5 Feet", width: "98 Inches" },
    specs: [
      { id: "floor", name: "Floor Sheet thickness", section: "material", type: "dropdown", options: ["6mm MS", "8mm ST-52", "10mm ST-52", "Custom"], defaultValue: "8mm ST-52", priceDiffs: { "6mm MS": -15000, "8mm ST-52": 0, "10mm ST-52": 30000, "Custom": 45000 } },
      { id: "side_sheet", name: "Side Sheet thickness", section: "material", type: "dropdown", options: ["4mm MS", "6mm ST-52", "8mm ST-52", "Custom"], defaultValue: "6mm ST-52", priceDiffs: { "4mm MS": -10000, "6mm ST-52": 0, "8mm ST-52": 25000, "Custom": 40000 } },
      { id: "headboard", name: "Headboard Sheet thickness", section: "material", type: "dropdown", options: ["6mm ST-52", "8mm ST-52", "Custom"], defaultValue: "6mm ST-52", priceDiffs: { "6mm ST-52": 0, "8mm ST-52": 15000, "Custom": 25000 } },
      { id: "taildoor", name: "Tail Door thickness", section: "material", type: "dropdown", options: ["6mm ST-52", "8mm ST-52", "Custom"], defaultValue: "6mm ST-52", priceDiffs: { "6mm ST-52": 0, "8mm ST-52": 15000, "Custom": 25000 } },
      { id: "cylinder", name: "Tipping Cylinder Model", section: "hydraulic", type: "dropdown", options: ["Hyva 150-4stage-4520", "Hyva 179-5stage", "Wipro Heavy Duty", "Custom"], defaultValue: "Hyva 150-4stage-4520", priceDiffs: { "Hyva 150-4stage-4520": 0, "Hyva 179-5stage": 35000, "Wipro Heavy Duty": 10000, "Custom": 20000 } },
      { id: "pto", name: "Power Take-Off (PTO)", section: "hydraulic", type: "checkbox", defaultValue: "Yes", priceDiffs: { "Yes": 0, "No": -12000 } },
      { id: "pump", name: "Hydraulic Pump Type", section: "hydraulic", type: "dropdown", options: ["Included Gear Pump", "Included Piston Pump", "Custom"], defaultValue: "Included Gear Pump", priceDiffs: { "Included Gear Pump": 0, "Included Piston Pump": 28000, "Custom": 15000 } },
      { id: "lock_system", name: "Tail Door Lock System", section: "chassis", type: "radio", options: ["Horizontal Lock System", "Manual Lock", "Custom"], defaultValue: "Horizontal Lock System", priceDiffs: { "Horizontal Lock System": 0, "Manual Lock": -10000, "Custom": 15000 } },
      { id: "painting", name: "Surface Treatment", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -15000, "Custom": 20000 } },
      { id: "reflective_tape", name: "Reflective Safety Tape", section: "accessories", type: "radio", options: ["RTO std & guidelines", "Standard 3M", "Custom"], defaultValue: "RTO std & guidelines", priceDiffs: { "RTO std & guidelines": 0, "Standard 3M": 8000, "Custom": 12000 } },
      { id: "marker_lamps", name: "Safety Marker Lamps", section: "accessories", type: "dropdown", options: ["Side Marker Lamp 6 no's and top marker lamp 2 no's", "Standard 4 marker lamps", "Custom"], defaultValue: "Side Marker Lamp 6 no's and top marker lamp 2 no's", priceDiffs: { "Side Marker Lamp 6 no's and top marker lamp 2 no's": 0, "Standard 4 marker lamps": -5000, "Custom": 10000 } },
      { id: "tipping_angle", name: "Maximum Tipping Angle", section: "accessories", type: "text", defaultValue: "42 to 45 degrees" },
      { id: "colour", name: "Finish Colour", section: "painting", type: "text", defaultValue: "Golden Green" }
    ]
  },
  rockbody: {
    name: "Rock Body Tipper",
    basePrice: 650000,
    dimensions: { length: "18 Feet", height: "4.0 Feet", width: "98 Inches" },
    specs: [
      { id: "floor", name: "Floor Sheet thickness", section: "material", type: "dropdown", options: ["10mm ST-52", "12mm Hardox 450", "Custom"], defaultValue: "10mm ST-52", priceDiffs: { "10mm ST-52": 0, "12mm Hardox 450": 180000, "Custom": 80000 } },
      { id: "side_sheet", name: "Side Sheet thickness", section: "material", type: "dropdown", options: ["8mm ST-52", "10mm Hardox 450", "Custom"], defaultValue: "8mm ST-52", priceDiffs: { "8mm ST-52": 0, "10mm Hardox 450": 120000, "Custom": 60000 } },
      { id: "cylinder", name: "Tipping Cylinder Model", section: "hydraulic", type: "dropdown", options: ["Hyva 179-5stage", "Hyva 150-4stage", "Custom"], defaultValue: "Hyva 179-5stage", priceDiffs: { "Hyva 179-5stage": 0, "Hyva 150-4stage": -25000, "Custom": 20000 } },
      { id: "painting", name: "Surface Treatment", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -15000, "Custom": 20000 } },
      { id: "colour", name: "Finish Colour", section: "painting", type: "text", defaultValue: "Crimson Red" }
    ]
  },
  rigid28: {
    name: "28 Feet Load Body",
    basePrice: 380000,
    dimensions: { length: "28 Feet", height: "4.0 Feet", width: "98 Inches" },
    specs: [
      { id: "floor", name: "Floor Plate Type", section: "material", type: "dropdown", options: ["3mm MS Chequered", "4mm MS Plain", "Custom"], defaultValue: "3mm MS Chequered", priceDiffs: { "3mm MS Chequered": 0, "4mm MS Plain": 18000, "Custom": 30000 } },
      { id: "side_panel", name: "Side Panel Height", section: "material", type: "dropdown", options: ["4 Feet MS", "5 Feet MS", "Custom"], defaultValue: "4 Feet MS", priceDiffs: { "4 Feet MS": 0, "5 Feet MS": 20000, "Custom": 35000 } },
      { id: "painting", name: "Painting Finish", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -10000, "Custom": 15000 } },
      { id: "colour", name: "Body Finish Colour", section: "painting", type: "text", defaultValue: "Royal Blue" }
    ]
  },
  rigid30: {
    name: "30 Feet Load Body",
    basePrice: 420000,
    dimensions: { length: "30 Feet", height: "4.0 Feet", width: "98 Inches" },
    specs: [
      { id: "floor", name: "Floor Plate Type", section: "material", type: "dropdown", options: ["3mm MS Chequered", "4mm MS Plain", "Custom"], defaultValue: "3mm MS Chequered", priceDiffs: { "3mm MS Chequered": 0, "4mm MS Plain": 18000, "Custom": 30000 } },
      { id: "side_panel", name: "Side Panel Height", section: "material", type: "dropdown", options: ["4 Feet MS", "5 Feet MS", "Custom"], defaultValue: "4 Feet MS", priceDiffs: { "4 Feet MS": 0, "5 Feet MS": 20000, "Custom": 35000 } },
      { id: "painting", name: "Painting Finish", section: "painting", type: "dropdown", options: ["Epoxy Primer + PU Paint", "Epoxy Primer + Epoxy Paint", "Custom"], defaultValue: "Epoxy Primer + PU Paint", priceDiffs: { "Epoxy Primer + PU Paint": 0, "Epoxy Primer + Epoxy Paint": -10000, "Custom": 15000 } },
      { id: "colour", name: "Body Finish Colour", section: "painting", type: "text", defaultValue: "Crimson Red" }
    ]
  }
};

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

  if (targetModule === 'quotations') {
    startNewQuotationWizard();
    if (targetProduct) {
      // Map product keys
      let mappedCat = 'trailer';
      let mappedSub = 'flatbed';
      if (targetProduct.includes('tiptrailer')) { mappedCat = 'trailer'; mappedSub = 'tiptrailer'; }
      else if (targetProduct.includes('boxbody')) { mappedCat = 'tipper'; mappedSub = 'boxbody'; }
      else if (targetProduct.includes('rockbody')) { mappedCat = 'tipper'; mappedSub = 'rockbody'; }
      
      selectProductCategory(mappedCat);
      selectProductSubtype(mappedSub);
      if (mappedCat === 'tipper') {
        selectChassisCapacity('25 CBM');
      }
      advanceWizardStep(4);
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
    
    // Smooth GSAP staggered viewport load
    gsap.fromTo(activeView.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 });

    // Refresh modules
    if (moduleName === 'dashboard') renderDashboardOverview();
    if (moduleName === 'sales') renderSalesHistoryTable();
    if (moduleName === 'workorders') renderWorkOrders();
    if (moduleName === 'status') renderProductionBoard();
    if (moduleName === 'accounts') renderAccountsLedger();
    if (moduleName === 'customers') renderCustomersDirectory();
    if (moduleName === 'admin') renderAdminSettings();
    if (moduleName === 'quotations') startNewQuotationWizard();
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

function renderDashboardOverview() {
  loadState();
  
  const activeWOCount = STATE.workOrders.filter(w => w.stage !== 'Delivered' && w.stage !== 'Ready').length;
  const pendingQuotesCount = STATE.quotations.filter(q => q.status === 'Draft').length;
  
  let outstandingBalance = 0;
  STATE.customers.forEach(c => outstandingBalance += c.outstanding);

  document.getElementById('kpi-active-wo').innerText = activeWOCount;
  document.getElementById('kpi-pending-quotes').innerText = pendingQuotesCount;
  document.getElementById('kpi-receivable').innerText = `₹${(outstandingBalance/100000).toFixed(1)}L`;

  const logListContainer = document.getElementById('system-log-list');
  logListContainer.innerHTML = STATE.logs.map(log => `
    <li><span class="log-time">${log.time}</span> ${log.message}</li>
  `).join('');

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
// 4. DYNAMIC CONFIGURATOR WIZARD ENGINE
// ------------------------------------------

function initQuotationBuilder() {
  // Bind inputs auto-save visual feedback
  const autoSaveInputs = [
    'w-cust-name', 'w-cust-company', 'w-cust-gst', 'w-cust-phone',
    'w-cust-email', 'w-cust-salesperson', 'w-cust-model', 'w-cust-chassis',
    'w-cust-qty', 'w-cust-address', 'w-cust-date'
  ];
  
  autoSaveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        simulateDraftAutoSave();
      });
    }
  });
}

function startNewQuotationWizard() {
  wizardState = {
    currentStep: 1,
    customer: {},
    category: '',
    subtype: '',
    capacity: '',
    specs: {},
    customMods: [],
    status: 'Draft',
    total: 0
  };

  // Reset inputs
  document.getElementById('w-cust-name').value = '';
  document.getElementById('w-cust-company').value = '';
  document.getElementById('w-cust-gst').value = '';
  document.getElementById('w-cust-phone').value = '';
  document.getElementById('w-cust-email').value = '';
  document.getElementById('w-cust-salesperson').value = 'Prashanth kumar M P';
  document.getElementById('w-cust-model').value = '';
  document.getElementById('w-cust-chassis').value = '';
  document.getElementById('w-cust-qty').value = '1';
  document.getElementById('w-cust-address').value = '';
  document.getElementById('w-cust-date').value = new Date().toISOString().split('T')[0];

  // Reset categories
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btn-cat-next').disabled = true;

  // Reset subtypes
  document.querySelectorAll('.subtype-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btn-sub-next').disabled = true;
  document.getElementById('capacity-selector-container').style.display = 'none';
  document.querySelectorAll('.capacity-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('capacity-custom-input-wrap').style.display = 'none';
  document.getElementById('w-custom-capacity-val').value = '';

  // Clean Custom modifications list
  document.getElementById('w-custom-mods-list').innerHTML = '';

  jumpToWizardStep(1);
}

function simulateDraftAutoSave() {
  const ind = document.getElementById('quote-autosave-ind');
  if (ind) {
    ind.style.opacity = '1';
    gsap.fromTo(ind, { scale: 0.95 }, { scale: 1, duration: 0.2 });
    setTimeout(() => {
      gsap.to(ind, { opacity: 0.6, duration: 0.4 });
    }, 1000);
  }
}

window.jumpToWizardStep = function(stepNum) {
  // Simple validation for jumps
  if (stepNum > 1 && !validateStepInputs(1)) {
    return;
  }
  if (stepNum > 2 && !wizardState.category) {
    alert("Please select a Product Category first.");
    return;
  }
  if (stepNum > 3 && !wizardState.subtype) {
    alert("Please select a Sub-product model first.");
    return;
  }

  // Hide all panels
  document.querySelectorAll('.wizard-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Show active panel
  const activePanel = document.getElementById(`wizard-step-${stepNum}-panel`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Update progress tracker nodes
  document.querySelectorAll('.wizard-step-node').forEach(node => {
    const s = parseInt(node.getAttribute('data-step'), 10);
    node.classList.remove('active', 'completed');
    if (s === stepNum) {
      node.classList.add('active');
    } else if (s < stepNum) {
      node.classList.add('completed');
    }
  });

  // Fill progress line width
  const progressFill = document.getElementById('wizard-progress-fill');
  if (progressFill) {
    const widthPercentage = ((stepNum - 1) / 4) * 100;
    progressFill.style.width = `${widthPercentage}%`;
  }

  wizardState.currentStep = stepNum;

  // Compile final sheet if step 5
  if (stepNum === 5) {
    generateQuotationFinalReview();
  }
};

function validateStepInputs(stepNum) {
  if (stepNum === 1) {
    const name = document.getElementById('w-cust-name').value;
    const company = document.getElementById('w-cust-company').value;
    const gst = document.getElementById('w-cust-gst').value;
    const phone = document.getElementById('w-cust-phone').value;
    const email = document.getElementById('w-cust-email').value;
    const model = document.getElementById('w-cust-model').value;
    const address = document.getElementById('w-cust-address').value;

    if (!name || !company || !gst || !phone || !email || !model || !address) {
      alert("Please fill in all customer details fields to continue.");
      return false;
    }

    // Save step 1 to state
    wizardState.customer = {
      name,
      company,
      gst,
      phone,
      email,
      address,
      salesperson: document.getElementById('w-cust-salesperson').value,
      model,
      chassis: document.getElementById('w-cust-chassis').value || 'NA-CHASSIS',
      qty: parseInt(document.getElementById('w-cust-qty').value, 10) || 1,
      date: document.getElementById('w-cust-date').value
    };
  }
  return true;
}

window.advanceWizardStep = function(targetStep) {
  if (targetStep > wizardState.currentStep) {
    if (!validateStepInputs(wizardState.currentStep)) return;
  }
  jumpToWizardStep(targetStep);
};

// Step 2 Category select
window.selectProductCategory = function(catKey) {
  wizardState.category = catKey;
  
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.getElementById(`cat-card-${catKey}`).classList.add('selected');
  document.getElementById('btn-cat-next').disabled = false;

  // Toggle dynamic sub-panels
  document.querySelectorAll('.subtype-grid-group').forEach(grid => {
    grid.style.display = 'none';
  });
  document.getElementById(`subtypes-${catKey}-container`).style.display = 'grid';

  simulateDraftAutoSave();
};

// Step 3 Subtype select
window.selectProductSubtype = function(subtypeKey) {
  wizardState.subtype = subtypeKey;
  
  document.querySelectorAll('.subtype-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.getElementById(`sub-card-${subtypeKey}`).classList.add('selected');

  const capacitySelector = document.getElementById('capacity-selector-container');
  if (subtypeKey === 'boxbody' || subtypeKey === 'rockbody') {
    capacitySelector.style.display = 'block';
    // Clear capacity until clicked
    wizardState.capacity = '';
    document.querySelectorAll('.capacity-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btn-sub-next').disabled = true;
  } else {
    capacitySelector.style.display = 'none';
    wizardState.capacity = 'NA';
    document.getElementById('btn-sub-next').disabled = false;
    loadDefaultSpecsForSubtype(subtypeKey);
  }

  simulateDraftAutoSave();
};

// Step 3.5 capacity select
window.selectChassisCapacity = function(capValue) {
  wizardState.capacity = capValue;
  
  document.querySelectorAll('.capacity-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  if (capValue === 'Custom') {
    document.getElementById('cap-btn-custom').classList.add('selected');
    document.getElementById('capacity-custom-input-wrap').style.display = 'block';
    document.getElementById('btn-sub-next').disabled = true; // Wait for custom input value
  } else {
    document.getElementById(`cap-btn-${capValue.split(' ')[0]}`).classList.add('selected');
    document.getElementById('capacity-custom-input-wrap').style.display = 'none';
    document.getElementById('btn-sub-next').disabled = false;
    loadDefaultSpecsForSubtype(wizardState.subtype);
  }

  simulateDraftAutoSave();
};

window.updateCustomCapacityValue = function() {
  const customVal = document.getElementById('w-custom-capacity-val').value;
  if (customVal.trim().length > 0) {
    wizardState.capacity = `${customVal} CBM (Custom)`;
    document.getElementById('btn-sub-next').disabled = false;
    loadDefaultSpecsForSubtype(wizardState.subtype);
  } else {
    document.getElementById('btn-sub-next').disabled = true;
  }
};

// Step 4 Load Default specs
function loadDefaultSpecsForSubtype(subtypeKey) {
  const template = WIZARD_PRODUCT_TEMPLATES[subtypeKey];
  if (!template) return;

  // Initialize specs with defaults
  wizardState.specs = {};
  template.specs.forEach(spec => {
    wizardState.specs[spec.id] = spec.defaultValue;
  });

  // Inject Form Controls into sections
  renderConfiguratorFormInputs(template);
  calculateWizardPricing();
}

function renderConfiguratorFormInputs(template) {
  const sections = ['material', 'chassis', 'hydraulic', 'painting', 'accessories', 'dimensions'];
  
  sections.forEach(secId => {
    const container = document.getElementById(`specs-${secId}-controls-inject`);
    if (!container) return;

    // Filter specs for this section
    const secSpecs = template.specs.filter(s => s.section === secId);
    
    if (secSpecs.length === 0) {
      container.innerHTML = '<span class="section-hint col-span-2">No specifications modifications needed for this module.</span>';
      return;
    }

    container.innerHTML = secSpecs.map(spec => {
      let controlHtml = '';

      if (spec.type === 'dropdown') {
        controlHtml = `
          <select id="w-spec-${spec.id}" class="form-control" onchange="updateSpecValueState('${spec.id}', this.value)">
            ${spec.options.map(opt => {
              const diff = spec.priceDiffs && spec.priceDiffs[opt] ? spec.priceDiffs[opt] : 0;
              return `<option value="${opt}" ${opt === spec.defaultValue ? 'selected' : ''}>
                ${opt} ${diff !== 0 ? `(${diff > 0 ? '+' : ''}₹${diff.toLocaleString('en-IN')})` : '(Included)'}
              </option>`;
            }).join('')}
          </select>
        `;
      } else if (spec.type === 'radio') {
        controlHtml = `
          <div class="radio-group">
            ${spec.options.map((opt, i) => {
              const diff = spec.priceDiffs && spec.priceDiffs[opt] ? spec.priceDiffs[opt] : 0;
              return `
                <label class="radio-label">
                  <input type="radio" name="w-spec-radio-${spec.id}" value="${opt}" ${opt === spec.defaultValue ? 'checked' : ''} onchange="updateSpecValueState('${spec.id}', this.value)">
                  ${opt} ${diff !== 0 ? `<span style="font-size:0.75rem;color:var(--color-text-muted);">(${diff > 0 ? '+' : ''}₹${diff.toLocaleString('en-IN')})</span>` : ''}
                </label>
              `;
            }).join('')}
          </div>
        `;
      } else if (spec.type === 'checkbox') {
        controlHtml = `
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" id="w-spec-${spec.id}" ${spec.defaultValue === 'Yes' ? 'checked' : ''} onchange="updateSpecValueState('${spec.id}', this.checked ? 'Yes' : 'No')">
              Fitted in Standard Assembly
            </label>
          </div>
        `;
      } else if (spec.type === 'text') {
        controlHtml = `
          <input type="text" id="w-spec-${spec.id}" class="form-control" value="${spec.defaultValue}" oninput="updateSpecValueState('${spec.id}', this.value)">
        `;
      }

      return `
        <div class="spec-control-group">
          <label style="font-size:0.775rem;font-weight:600;color:var(--color-text-dark);">${spec.name}</label>
          ${controlHtml}
        </div>
      `;
    }).join('');
  });

  // Render Dimensions section (Length, Height, Width)
  const dimsContainer = document.getElementById('specs-dimensions-controls-inject');
  if (dimsContainer && template.dimensions) {
    dimsContainer.innerHTML = `
      <div class="spec-control-group">
        <label style="font-size:0.775rem;font-weight:600;">Overall Frame Length</label>
        <input type="text" id="w-dim-length" class="form-control" value="${template.dimensions.length}" oninput="simulateDraftAutoSave()">
      </div>
      <div class="spec-control-group">
        <label style="font-size:0.775rem;font-weight:600;">Side Wall Height</label>
        <input type="text" id="w-dim-height" class="form-control" value="${template.dimensions.height}" oninput="simulateDraftAutoSave()">
      </div>
      <div class="spec-control-group">
        <label style="font-size:0.775rem;font-weight:600;">Overall Width</label>
        <input type="text" id="w-dim-width" class="form-control" value="${template.dimensions.width}" oninput="simulateDraftAutoSave()">
      </div>
    `;
  }
}

window.toggleCollapseSection = function(secId) {
  const el = document.getElementById(secId);
  if (el) {
    el.classList.toggle('collapsed');
  }
};

window.updateSpecValueState = function(specId, val) {
  wizardState.specs[specId] = val;
  calculateWizardPricing();
  simulateDraftAutoSave();
};

// Custom Mods row builders
window.addWizardCustomModRow = function() {
  const container = document.getElementById('w-custom-mods-list');
  const id = `mod-${Date.now()}`;

  const html = `
    <div class="custom-item-row" id="${id}" style="margin-top:10px;">
      <div class="form-group mb-none">
        <label>Modification Name</label>
        <input type="text" class="form-control form-control-sm mod-name-input" placeholder="e.g. Extra Heavy Toolbox" required>
      </div>
      <div class="form-group mb-none">
        <label>Qty</label>
        <input type="number" class="form-control form-control-sm mod-qty-input" value="1" min="1" required>
      </div>
      <div class="form-group mb-none">
        <label>Price (₹)</label>
        <input type="number" class="form-control form-control-sm mod-price-input" placeholder="12000" min="0" required>
      </div>
      <button type="button" class="btn-remove-row" onclick="removeWizardCustomModRow('${id}')" style="margin-top:20px;">
        <svg class="icon-sm" viewBox="0 0 24 24" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);

  const row = document.getElementById(id);
  row.querySelectorAll('input').forEach(input => {
    input.oninput = () => {
      calculateWizardPricing();
      simulateDraftAutoSave();
    };
  });
};

window.removeWizardCustomModRow = function(id) {
  const row = document.getElementById(id);
  if (row) {
    row.remove();
    calculateWizardPricing();
    simulateDraftAutoSave();
  }
};

// Step 4 pricing calculator
function calculateWizardPricing() {
  const template = WIZARD_PRODUCT_TEMPLATES[wizardState.subtype];
  if (!template) return;

  let basePrice = template.basePrice;
  let upgradesHtml = '';
  let upgradesTotal = 0;

  // Calculate Spec Upgrades
  template.specs.forEach(spec => {
    const selectedVal = wizardState.specs[spec.id];
    if (selectedVal && spec.priceDiffs && spec.priceDiffs[selectedVal]) {
      let diff = spec.priceDiffs[selectedVal];
      
      // Override floor/steel axle price differentials using global configurations if applicable
      if (spec.id === 'floor' && selectedVal.includes('6mm')) diff = STATE.adminPricing.floor6;
      if (spec.id === 'floor' && selectedVal.includes('10mm')) diff = STATE.adminPricing.floor10;
      if (spec.id === 'beam' && selectedVal.includes('Hardox')) diff = STATE.adminPricing.steelHardox;
      if (spec.id === 'axles' && selectedVal.includes('2x13T')) diff = STATE.adminPricing.axle2;
      if (spec.id === 'axles' && selectedVal.includes('3x16T')) diff = STATE.adminPricing.axle3_16;

      upgradesTotal += diff;
      if (diff !== 0) {
        upgradesHtml += `
          <div class="preview-row indent">
            <span>+ Upgrade: ${spec.name} (${selectedVal})</span>
            <span>₹${diff.toLocaleString('en-IN')}</span>
          </div>
        `;
      }
    }
  });

  // Calculate Custom Mods
  let modsTotal = 0;
  let modsHtml = '';
  wizardState.customMods = [];

  const rows = document.querySelectorAll('#w-custom-mods-list .custom-item-row');
  rows.forEach(row => {
    const name = row.querySelector('.mod-name-input').value || 'Custom Modification';
    const qty = parseInt(row.querySelector('.mod-qty-input').value, 10) || 1;
    const price = parseFloat(row.querySelector('.mod-price-input').value) || 0;
    const lineTotal = qty * price;

    modsTotal += lineTotal;
    wizardState.customMods.push({ name, qty, price });
    
    if (lineTotal > 0) {
      modsHtml += `
        <div class="preview-row indent">
          <span>+ Modification: ${name} (x${qty})</span>
          <span>₹${lineTotal.toLocaleString('en-IN')}</span>
        </div>
      `;
    }
  });

  const basicAmount = basePrice + upgradesTotal + modsTotal;
  const gstVal = Math.round(basicAmount * 0.18);
  const grandTotal = basicAmount + gstVal;
  
  wizardState.total = grandTotal;

  // Render summary panel
  const summarySheet = document.getElementById('w-live-summary-sheet');
  if (summarySheet) {
    summarySheet.innerHTML = `
      <div class="preview-row" style="font-weight:700">
        <span>Base ${template.name}</span>
        <span>₹${basePrice.toLocaleString('en-IN')}</span>
      </div>
      
      ${upgradesHtml ? `
        <div class="mb-xs mt-xs"><span style="font-size:0.7rem;color:var(--color-text-muted);text-transform:uppercase;">Technical Parameters Upgrades:</span></div>
        ${upgradesHtml}
      ` : ''}

      ${modsHtml ? `
        <div class="mb-xs mt-xs"><span style="font-size:0.7rem;color:var(--color-text-muted);text-transform:uppercase;">Custom Modifications:</span></div>
        ${modsHtml}
      ` : ''}

      <div class="preview-row mt-md" style="border-top: 1px dashed rgba(0,0,0,0.15); padding-top:10px;">
        <span>Chassis Basic Total</span>
        <span>₹${basicAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="preview-row">
        <span>GST (18%)</span>
        <span>₹${gstVal.toLocaleString('en-IN')}</span>
      </div>
      <div class="preview-row total" style="color:var(--color-primary)">
        <span>Grand Total</span>
        <span>₹${grandTotal.toLocaleString('en-IN')}</span>
      </div>
    `;
  }
}

// Step 5: Final Quotation Mock Preview Populate
function generateQuotationFinalReview() {
  const template = WIZARD_PRODUCT_TEMPLATES[wizardState.subtype];
  if (!template) return;

  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  const c = wizardState.customer;

  // Pre-calculations
  const grandTotal = wizardState.total;
  const basicAmount = Math.round(grandTotal / 1.18);
  const gstAmount = grandTotal - basicAmount;

  // Set standard PDF preview tags
  document.getElementById('w-pdf-ref-no').innerText = `REF:- NEXFRA-QTN/2026/${STATE.quotations.length + 1}`;
  document.getElementById('w-pdf-date-val').innerText = `DATE: ${new Date(c.date).toLocaleDateString('en-GB').replace(/\//g,'.')}`;
  
  document.getElementById('w-pdf-to-company').innerText = `M/s ${c.company.toUpperCase()}`;
  document.getElementById('w-pdf-to-address-1').innerText = c.address.substring(0, 45);
  document.getElementById('w-pdf-to-address-2').innerText = c.address.substring(45) || 'Registered Office';
  document.getElementById('w-pdf-to-gst').innerText = `GST NO: ${c.gst}`;

  const capacityLabel = wizardState.capacity && wizardState.capacity !== 'NA' ? `${wizardState.capacity} ` : '';
  document.getElementById('w-pdf-subj-text').innerText = `Subject: Quotation for -${c.model.toUpperCase()} , ${capacityLabel}${template.name.toUpperCase()} with sub frame and Hydraulic Kit`;
  document.getElementById('w-pdf-table-desc').innerHTML = `${capacityLabel}${template.name.toUpperCase()} WITH SUBFRAME and CYLINDER KIT<br>Regular TAIL DOOR ${c.model}`;

  // Price columns
  document.getElementById('w-pdf-table-basic').innerText = formatPdfPrice(basicAmount);
  document.getElementById('w-pdf-table-gst').innerText = formatPdfPrice(gstAmount);
  document.getElementById('w-pdf-table-total').innerText = formatPdfPrice(basicAmount);
  document.getElementById('w-pdf-table-gst-total').innerText = formatPdfPrice(gstAmount);

  document.getElementById('w-pdf-grand-total-label').innerText = formatPdfPrice(grandTotal);
  document.getElementById('w-pdf-grand-total-val').innerText = formatPdfPrice(grandTotal);

  document.getElementById('w-pdf-words-val').innerText = priceToIndianWords(grandTotal);

  // Specifications
  const specsTable = document.getElementById('w-pdf-specs-list-table');
  let specsListHtml = '';
  let count = 1;

  // Add category dimensions
  const lenVal = document.getElementById('w-dim-length') ? document.getElementById('w-dim-length').value : template.dimensions.length;
  const heightVal = document.getElementById('w-dim-height') ? document.getElementById('w-dim-height').value : template.dimensions.height;
  const widthVal = document.getElementById('w-dim-width') ? document.getElementById('w-dim-width').value : template.dimensions.width;

  // Populate spec list elements dynamically
  Object.keys(wizardState.specs).forEach(key => {
    const specInfo = template.specs.find(s => s.id === key);
    if (specInfo) {
      specsListHtml += `
        <tr>
          <td>${count++}.</td>
          <td>${specInfo.name}: <strong>${wizardState.specs[key]}</strong></td>
        </tr>
      `;
    }
  });

  // Add dimensions to specs checklist
  specsListHtml += `
    <tr><td>${count++}.</td><td>Overall Length Dimension: <strong>${lenVal}</strong></td></tr>
    <tr><td>${count++}.</td><td>Side Gate Height Dimension: <strong>${heightVal}</strong></td></tr>
    <tr><td>${count++}.</td><td>Overall Frame Width Dimension: <strong>${widthVal}</strong></td></tr>
  `;

  // Attach Custom accessories if added
  wizardState.customMods.forEach(mod => {
    specsListHtml += `
      <tr>
        <td>${count++}.</td>
        <td>Fitted Accessory: <strong>${mod.name} (Qty: ${mod.qty})</strong></td>
      </tr>
    `;
  });

  specsTable.innerHTML = specsListHtml;

  // Toggle Work Order conversion block
  updateQuotationStatusState();
}

window.updateQuotationStatusState = function() {
  const status = document.getElementById('w-quote-status').value;
  wizardState.status = status;

  const woBox = document.getElementById('w-convert-wo-box');
  if (status === 'Approved') {
    woBox.style.display = 'block';
  } else {
    woBox.style.display = 'none';
  }
};

window.saveWizardQuotation = function() {
  loadState();
  const c = wizardState.customer;
  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;

  // 1. Create/Update Client Profile
  let client = STATE.customers.find(x => x.company.toLowerCase() === c.company.toLowerCase());
  if (!client) {
    client = {
      id: `CUST-00${STATE.customers.length + 1}`,
      name: c.name,
      company: c.company,
      gst: c.gst,
      phone: c.phone,
      email: c.email,
      address: c.address,
      vehicles: [],
      outstanding: wizardState.status === 'Approved' ? wizardState.total : 0
    };
    STATE.customers.push(client);
  } else {
    if (wizardState.status === 'Approved') {
      client.outstanding += wizardState.total;
    }
  }

  // Add chassis model to client vehicles if approved
  if (wizardState.status === 'Approved' && !client.vehicles.includes(c.model)) {
    client.vehicles.push(c.model);
  }

  // 2. Save quote record
  STATE.quotations.push({
    id: quoteId,
    customerId: client.id,
    productName: WIZARD_PRODUCT_TEMPLATES[wizardState.subtype].name,
    date: c.date,
    total: wizardState.total,
    status: wizardState.status,
    specs: wizardState.specs,
    customItems: wizardState.customMods
  });

  // 3. Save invoice if approved
  if (wizardState.status === 'Approved') {
    const invoiceId = `INV-2026-${Math.floor(883 + Math.random()*100)}`;
    STATE.sales.push({
      invoiceId,
      customerName: c.company,
      product: `${WIZARD_PRODUCT_TEMPLATES[wizardState.subtype].name} (${wizardState.capacity})`,
      date: c.date,
      amount: wizardState.total,
      status: 'Unpaid'
    });
    logSystemActivity(`Quotation ${quoteId} approved & Invoice ${invoiceId} logged.`);
  } else {
    logSystemActivity(`Quotation registry ${quoteId} saved as: ${wizardState.status}.`);
  }

  saveState();
  alert(`Quotation ${quoteId} successfully saved to Nexfra Database with status: ${wizardState.status}.`);
  switchModule('dashboard');
};

window.convertWizardToWorkOrder = function() {
  loadState();
  const c = wizardState.customer;
  const template = WIZARD_PRODUCT_TEMPLATES[wizardState.subtype];
  const quoteId = `QT-2026-00${STATE.quotations.length}`;
  const woId = `WO-2026-00${STATE.workOrders.length + 1}`;

  // Compile spec dump details so production team never re-enters data
  const specDetails = [];
  Object.keys(wizardState.specs).forEach(key => {
    const specInfo = template.specs.find(s => s.id === key);
    if (specInfo) {
      specDetails.push(`${specInfo.name}: ${wizardState.specs[key]}`);
    }
  });

  wizardState.customMods.forEach(mod => {
    specDetails.push(`Fitted Accessory: ${mod.name} (Qty: ${mod.qty})`);
  });

  STATE.workOrders.push({
    id: woId,
    quoteId,
    customerName: c.company,
    product: template.name,
    date: c.date,
    stage: 'Pending',
    progress: 0,
    specs: specDetails,
    notes: `Configured dynamically via ERP Wizard. Sales rep: ${c.salesperson}`
  });

  logSystemActivity(`Work Order ${woId} successfully dispatched for quote: ${quoteId}.`);
  saveState();
  
  alert(`Work Order ${woId} generated successfully! Dispatched to the shop floor factory production pipeline.`);
  switchModule('status');
};

window.downloadWizardPdf = function() {
  const element = document.getElementById('w-pdf-sheet-render');
  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  const opt = {
    margin:       [0, 0, 0, 0],
    filename:     `NEXFRA_Quotation_${quoteId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: false, scrollY: 0 },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'] }
  };
  
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    alert("PDF library loading error. Try printing vector.");
  }
};

window.printWizardPdf = function() {
  window.print();
};

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
    html2canvas:  { scale: 2, useCORS: true, letterRendering: false, scrollY: 0 },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css', 'legacy'] }
  };
  
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    alert("PDF generation library is loading, please try printing directly.");
  }
}

// Format numbers like 3,80,000/-
function formatPdfPrice(num) {
  return num.toLocaleString('en-IN') + '/-';
}

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

// Global modal preview populator
window.openPdfPreview = function(quoteId) {
  loadState();
  const quote = STATE.quotations.find(q => q.id === quoteId);
  if (!quote) return;

  currentPreviewQuoteId = quoteId;

  const client = STATE.customers.find(c => c.id === quote.customerId);
  const clientCompany = client ? client.company : 'Company Name';
  const clientAddress = client ? client.address : 'Registered Address';
  const clientGst = client ? client.gst : 'Pending';

  // Math variables
  const grandTotalVal = quote.total;
  const basicVal = Math.round(grandTotalVal / 1.18);
  const gstVal = grandTotalVal - basicVal;

  // Ref details
  document.getElementById('pdf-ref-no').innerText = `REF:- NEXFRA-QTN/007.26/${quoteId.replace('QT-2026-','')}`;
  document.getElementById('pdf-date-val').innerText = `DATE: ${new Date(quote.date).toLocaleDateString('en-GB').replace(/\//g,'.')}`;
  
  document.getElementById('pdf-to-company').innerText = `M/s ${clientCompany.toUpperCase()}`;
  document.getElementById('pdf-to-address-1').innerText = clientAddress.substring(0, 45);
  document.getElementById('pdf-to-address-2').innerText = clientAddress.substring(45) || 'GST Registered Address';
  document.getElementById('pdf-to-gst').innerText = `GST NO: ${clientGst}`;

  let chassisName = 'EICHER-6035XPT';
  let capacityName = '25 CBM';
  let productFamilyText = 'TIPPER BOX BODY';

  if (quote.productName.includes('Flat Bed')) {
    chassisName = 'HEAVY HAULER';
    capacityName = '40 Ft';
    productFamilyText = 'FLAT BED TRAILER';
  } else if (quote.productName.includes('Tip')) {
    chassisName = 'TATA PRIMA';
    capacityName = '36 CBM';
    productFamilyText = 'TIP TRAILER';
  } else if (quote.productName.includes('Rock')) {
    chassisName = 'CAT-777G';
    capacityName = '16 CBM';
    productFamilyText = 'ROCK BODY TIPPER';
  }

  document.getElementById('pdf-subj-text').innerText = `Subject: Quotation for -${chassisName} , ${capacityName} ${productFamilyText} with sub frame and Hydraulic Kit`;
  document.getElementById('pdf-table-desc').innerHTML = `${capacityName} ${productFamilyText} WITH SUBFRAME and CYLINDER KIT<br>Regular TAIL DOOR ${chassisName}`;

  document.getElementById('pdf-table-basic').innerText = formatPdfPrice(basicVal);
  document.getElementById('pdf-table-gst').innerText = formatPdfPrice(gstVal);
  document.getElementById('pdf-table-total').innerText = formatPdfPrice(basicVal);
  document.getElementById('pdf-table-gst-total').innerText = formatPdfPrice(gstVal);
  
  document.getElementById('pdf-grand-total-label').innerText = formatPdfPrice(grandTotalVal);
  document.getElementById('pdf-grand-total-val').innerText = formatPdfPrice(grandTotalVal);

  document.getElementById('pdf-words-val').innerText = priceToIndianWords(grandTotalVal);

  // Specs lists formatting
  const specsTable = document.getElementById('pdf-specs-list-table');
  let specsHtml = '';
  let count = 1;

  Object.keys(quote.specs).forEach(key => {
    specsHtml += `
      <tr>
        <td>${count++}.</td>
        <td>${key.toUpperCase()}: <strong>${quote.specs[key]}</strong></td>
      </tr>
    `;
  });

  if (quote.customItems && quote.customItems.length > 0) {
    quote.customItems.forEach(item => {
      specsHtml += `
        <tr>
          <td>${count++}.</td>
          <td>Accessory: <strong>${item.name} (Qty: ${item.qty})</strong></td>
        </tr>
      `;
    });
  }

  specsTable.innerHTML = specsHtml;
  document.getElementById('pdf-preview-modal').classList.add('active');
};
