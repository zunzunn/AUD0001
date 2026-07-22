/* ==========================================
   Nexfra ERP & Website Core Logic
   ========================================== */

// ------------------------------------------
// 1. DATA STATE (SIMULATED DATABASE)
// ------------------------------------------

const STATE = {
  activeRole: 'Admin',
  customers: [
    { id: 'CUST-001', name: 'Tata Logistics Pvt Ltd', company: 'Tata Logistics', gst: '33AAACT8281M1Z5', phone: '+91 98400 12345', email: 'operations@tatalogistics.com', address: 'Plot 12, Port Road, Tuticorin, TN', vehicles: ['TN-69-AA-1234', 'TN-69-AA-5678'], outstanding: 1200000 },
    { id: 'CUST-002', name: 'Gati Mining & Minerals', company: 'Gati Minerals', gst: '27AAACG1928A2Z0', phone: '+91 99100 98765', email: 'mehta@gatimining.com', address: 'Mine Block C, Korba, Chhattisgarh', vehicles: ['CG-12-BB-9922'], outstanding: 650000 },
    { id: 'CUST-003', name: 'V-Trans Cargo India', company: 'V-Trans', gst: '24AAACV1029P3Z1', phone: '+91 98220 54321', email: 'sandeep@vtrans.com', address: 'Sarkhej Highway, Ahmedabad, Gujarat', vehicles: [], outstanding: 0 },
    { id: 'CUST-004', name: 'Golden Roadlines', company: 'Golden Roadlines', gst: '09AAACG8811K1Z2', phone: '+91 97110 22334', email: 'rajesh@goldenroadlines.com', address: 'Sanjay Gandhi Transport Nagar, Delhi', vehicles: ['DL-1G-1020', 'DL-1G-3344'], outstanding: 0 }
  ],
  products: {
    flatbed: {
      name: 'Flat Bed Trailer',
      basePrice: 850000,
      templates: ['32 Feet Flatbed', '40 Feet Flatbed'],
      specs: [
        { id: 'length', name: 'Length', default: '40 Feet', options: [
          { name: '32 Feet', priceDiff: -50000 },
          { name: '40 Feet', priceDiff: 0 }
        ]},
        { id: 'floor', name: 'Floor Thickness / Type', default: '4mm Chequered MS', options: [
          { name: '4mm Chequered MS', priceDiff: 0 },
          { name: '6mm Chequered MS', priceDiff: 15000 },
          { name: '8mm Chequered MS', priceDiff: 32000 }
        ]},
        { id: 'axles', name: 'Axles Configuration', default: '3 x 13T York Axles', options: [
          { name: '2 x 13T York Axles', priceDiff: -100000 },
          { name: '3 x 13T York Axles', priceDiff: 0 },
          { name: '3 x 16T Fuwa Heavy Axles', priceDiff: 45000 }
        ]},
        { id: 'suspension', name: 'Suspension System', default: 'Heavy Duty Mechanical', options: [
          { name: 'Heavy Duty Mechanical', priceDiff: 0 },
          { name: 'Air Suspension (Front Lift Axle)', priceDiff: 120000 }
        ]}
      ]
    },
    tiptrailer: {
      name: 'Tip Trailer',
      basePrice: 1420000,
      templates: ['32 CBM Tip Trailer', '36 CBM Tip Trailer', '40 CBM Tip Trailer'],
      specs: [
        { id: 'capacity', name: 'Volumetric Capacity', default: '32 CBM', options: [
          { name: '32 CBM', priceDiff: 0 },
          { name: '36 CBM', priceDiff: 60000 },
          { name: '40 CBM', priceDiff: 110000 }
        ]},
        { id: 'cylinder', name: 'Hydraulic Cylinder', default: 'Hyva 191 Cylinder', options: [
          { name: 'Hyva 191 Cylinder', priceDiff: 0 },
          { name: 'Hyva 202 Heavy Duty', priceDiff: 85000 }
        ]},
        { id: 'steel', name: 'Structure / Plate Grade', default: 'ST52 Steel', options: [
          { name: 'ST52 High Tensile Steel', priceDiff: 0 },
          { name: 'Hardox 450 Wear Plates', priceDiff: 180000 }
        ]},
        { id: 'suspension', name: 'Suspension System', default: 'Mechanical Leaf Spring', options: [
          { name: 'Mechanical Leaf Spring', priceDiff: 0 },
          { name: 'Air Suspension with Lift Axle', priceDiff: 120000 }
        ]}
      ]
    },
    boxbody: {
      name: 'Box Body Tipper',
      basePrice: 780000,
      templates: ['16 CBM Box Body', '23 CBM Box Body', '25 CBM Box Body'],
      specs: [
        { id: 'capacity', name: 'Volumetric Capacity', default: '16 CBM', options: [
          { name: '14 CBM', priceDiff: -25000 },
          { name: '16 CBM', priceDiff: 0 },
          { name: '23 CBM', priceDiff: 80000 },
          { name: '25 CBM', priceDiff: 115000 }
        ]},
        { id: 'floor', name: 'Floor Plate Thickness', default: '8 mm MS', options: [
          { name: '6 mm MS', priceDiff: -15000 },
          { name: '8 mm MS', priceDiff: 0 },
          { name: '10 mm MS', priceDiff: 30000 }
        ]},
        { id: 'side', name: 'Side Wall Plate Thickness', default: '6 mm MS', options: [
          { name: '4 mm MS', priceDiff: -10000 },
          { name: '6 mm MS', priceDiff: 0 },
          { name: '8 mm MS', priceDiff: 22000 }
        ]},
        { id: 'pump', name: 'Tipping Pump/PTO Type', default: 'Standard Air Controlled', options: [
          { name: 'Standard Air Controlled', priceDiff: 0 },
          { name: 'Heavy Duty Gear Pump', priceDiff: 25000 }
        ]}
      ]
    },
    rockbody: {
      name: 'Rock Body Tipper',
      basePrice: 1150000,
      templates: ['14 CBM Rock Body', '16 CBM Rock Body', '18 CBM Rock Body'],
      specs: [
        { id: 'capacity', name: 'Volumetric Capacity', default: '14 CBM', options: [
          { name: '14 CBM', priceDiff: 0 },
          { name: '16 CBM', priceDiff: 45000 },
          { name: '18 CBM', priceDiff: 90000 }
        ]},
        { id: 'steel', name: 'Hardox Grade Structure', default: 'Hardox 450', options: [
          { name: 'Hardox 450 Plate', priceDiff: 0 },
          { name: 'Hardox 500 Extreme Grade', priceDiff: 120000 }
        ]},
        { id: 'floor', name: 'Floor Plate Thickness', default: '10 mm', options: [
          { name: '10 mm Heavy Plate', priceDiff: 0 },
          { name: '12 mm Heavy Plate', priceDiff: 40000 },
          { name: '14 mm Severe Duty', priceDiff: 75000 }
        ]},
        { id: 'breakers', name: 'Integrated Rock Breakers', default: 'Standard Grated', options: [
          { name: 'Standard Grated', priceDiff: 0 },
          { name: 'Heavy-Duty Ribbed Breakers', priceDiff: 35000 }
        ]}
      ]
    }
  },
  quotations: [
    { id: 'QT-2026-001', customerId: 'CUST-001', productName: 'Flat Bed Trailer', date: '2026-07-15', total: 882000, status: 'Approved', specs: { length: '40 Feet', floor: '6mm Chequered MS', axles: '3 x 13T York Axles', suspension: 'Heavy Duty Mechanical' }, customItems: [{ name: 'GPS Tracker', price: 15000 }] },
    { id: 'QT-2026-002', customerId: 'CUST-002', productName: 'Rock Body Tipper', date: '2026-07-20', total: 1270000, status: 'Approved', specs: { capacity: '14 CBM', steel: 'Hardox 450 Plate', floor: '12 mm Heavy Plate', breakers: 'Standard Grated' }, customItems: [{ name: 'Rear Bumper Guard', price: 20000 }, { name: 'Automatic Tail Lock', price: 60000 }] },
    { id: 'QT-2026-003', customerId: 'CUST-003', productName: 'Tip Trailer', date: '2026-07-22', total: 1625000, status: 'Draft', specs: { capacity: '36 CBM', cylinder: 'Hyva 191 Cylinder', steel: 'ST52 High Tensile Steel', suspension: 'Air Suspension with Lift Axle' }, customItems: [] }
  ],
  workOrders: [
    { id: 'WO-2026-001', quoteId: 'QT-2026-001', customerName: 'Tata Logistics Pvt Ltd', product: 'Flat Bed Trailer', date: '2026-07-15', stage: 'Welding', progress: 50, specs: ['York Axles', '6mm Floor', '40 Ft Length'], notes: 'Expedite suspension alignment tests.' },
    { id: 'WO-2026-002', quoteId: 'QT-2026-002', customerName: 'Gati Mining & Minerals', product: 'Rock Body Tipper', date: '2026-07-20', stage: 'Material Ordered', progress: 15, specs: ['Hardox 450', '12mm Floor', 'Automatic Lock'], notes: 'Double check side wall plates ultrasonic scan.' }
  ],
  sales: [
    { invoiceId: 'INV-2026-881', customerName: 'Tata Logistics Pvt Ltd', product: 'Flat Bed Trailer (40 Ft)', date: '2026-07-15', amount: 882000, status: 'Partial' },
    { invoiceId: 'INV-2026-882', customerName: 'Gati Mining & Minerals', product: 'Rock Body Tipper (14 CBM)', date: '2026-07-20', amount: 1270000, status: 'Partial' },
    { invoiceId: 'INV-2026-879', customerName: 'V-Trans Cargo India', product: 'Side Wall Trailer (32 Ft)', date: '2026-06-18', amount: 980000, status: 'Paid' },
    { invoiceId: 'INV-2026-880', customerName: 'Golden Roadlines', product: 'Tip Trailer (40 CBM)', date: '2026-07-02', amount: 1530000, status: 'Paid' }
  ],
  payments: [
    { id: 'TXN-902102', invoiceId: 'INV-2026-881', date: '2026-07-16', amount: 300000, mode: 'RTGS', ref: 'UTIBR52829281' },
    { id: 'TXN-902103', invoiceId: 'INV-2026-882', date: '2026-07-20', amount: 620000, mode: 'RTGS', ref: 'HDFCR52899120' }
  ],
  logs: [
    { time: '02:15 AM', message: 'System DB synced 4 operational modules successfully.' },
    { time: 'Yesterday', message: 'Work Order WO-2026-002 dispatched to Material Order pipeline.' },
    { time: '2 days ago', message: 'Sales recorded draft quotation QT-2026-003 for V-Trans Cargo.' }
  ],
  // Baseline pricing constants editable by Admin
  adminPricing: {
    floor6: -15000,
    floor10: 30000,
    steelHardox: 150000,
    axle2: -100000,
    axle3_16: 80000
  }
};

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

// Role clearance levels definition
const ROLE_PERMISSIONS = {
  Admin: ['dashboard', 'sales', 'quotations', 'workorders', 'status', 'accounts', 'customers', 'admin'],
  Sales: ['dashboard', 'quotations', 'customers'],
  Production: ['dashboard', 'workorders', 'status'],
  Accounts: ['dashboard', 'sales', 'accounts', 'customers']
};

// Default sign-in details per role
const ROLE_DEFAULT_LOGINS = {
  Admin: { email: 'admin@nexframfg.com', password: '••••••••' },
  Sales: { email: 'sales@nexframfg.com', password: '••••••••' },
  Production: { email: 'shopfloor@nexframfg.com', password: '••••••••' },
  Accounts: { email: 'finance@nexframfg.com', password: '••••••••' }
};

// ------------------------------------------
// 2. WEBSITE INTERACTIVE LANDING LOGIC
// ------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initWebsiteLayout();
  initCounters();
  initEnquiryForm();
  initPortalTriggers();
  initPortalCore();
  runIntroAnimations();
});

// Intro Entrance Animations with GSAP
function runIntroAnimations() {
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-badge', { opacity: 0, y: -20, duration: 0.8, ease: 'power2.out' });
    gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 1, delay: 0.4, ease: 'power2.out' });
    gsap.from('.hero-actions', { opacity: 0, y: 15, duration: 0.8, delay: 0.6, ease: 'power2.out' });
    gsap.from('.hero-feat-card', { 
      opacity: 0, 
      x: 50, 
      stagger: 0.15, 
      duration: 0.8, 
      delay: 0.5, 
      ease: 'power2.out' 
    });
    
    // Scroll Reveals
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.from('.about-text-wrap', {
      scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
      opacity: 0, x: -50, duration: 1, ease: 'power2.out'
    });
    gsap.from('.about-visual-wrap', {
      scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
      opacity: 0, x: 50, duration: 1, ease: 'power2.out'
    });
    
    gsap.from('.product-card', {
      scrollTrigger: { trigger: '.products-section', start: 'top 75%' },
      opacity: 0, y: 50, stagger: 0.15, duration: 1, ease: 'power2.out'
    });
    
    gsap.from('.process-step', {
      scrollTrigger: { trigger: '.process-section', start: 'top 75%' },
      opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: 'power2.out'
    });
    
    gsap.from('.industry-card', {
      scrollTrigger: { trigger: '.industries-section', start: 'top 80%' },
      opacity: 0, y: 40, stagger: 0.1, duration: 0.8, ease: 'power2.out'
    });
  }
}

// Navbar scrolled state & Mobile navigation overlay
function initWebsiteLayout() {
  const header = document.querySelector('.main-header');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightNavOnScroll();
  });

  // Mobile menu toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
    // Lock scroll when mobile menu is open
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Highlight active navigation section on scroll
function highlightNavOnScroll() {
  const sections = document.querySelectorAll('section, main');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let currentSec = 'home';
  sections.forEach(sec => {
    const secTop = sec.offsetTop - 100;
    if (window.scrollY >= secTop) {
      currentSec = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSec}`) {
      link.classList.add('active');
    }
  });
}

// Animate numbers inside stats cards
function initCounters() {
  const statsSection = document.querySelector('.about-section');
  const counters = document.querySelectorAll('.stat-number');
  let animated = false;

  const countUp = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const updateCount = () => {
        const count = parseInt(counter.innerText, 10) || 0;
        const speed = target / 60; // duration limit
        
        if (count < target) {
          counter.innerText = Math.ceil(count + speed);
          setTimeout(updateCount, 15);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        countUp();
        animated = true;
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) observer.observe(statsSection);
}

// Public Form Submission
function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  const successAlert = document.getElementById('enquiry-success');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const phone = document.getElementById('contact-phone').value;
      const company = document.getElementById('contact-company').value;
      const productVal = document.getElementById('contact-product').value;
      const message = document.getElementById('contact-message').value;

      // Add to simulated database as a new customer lead
      const newCustId = `CUST-00${STATE.customers.length + 1}`;
      STATE.customers.push({
        id: newCustId,
        name: name,
        company: company,
        gst: 'Pending Registration',
        phone: phone,
        email: email,
        address: 'Lead via Web Form',
        vehicles: [],
        outstanding: 0
      });

      // Log activity
      logSystemActivity(`Lead created: ${company} (${name}) submitted website enquiry.`);

      form.reset();
      successAlert.style.display = 'block';
      gsap.fromTo(successAlert, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      
      setTimeout(() => {
        gsap.to(successAlert, { opacity: 0, y: -10, duration: 0.4, onComplete: () => {
          successAlert.style.display = 'none';
        }});
      }, 6000);
    });
  }
}

// ------------------------------------------
// 3. ERP PORTAL ENTRY & TRIGGERS
// ------------------------------------------

function initPortalTriggers() {
  const portal = document.getElementById('erp-portal');
  const openButtons = [
    document.getElementById('open-portal-btn'),
    document.getElementById('open-portal-mobile-btn'),
    document.getElementById('open-portal-footer-btn')
  ];
  const closeButton = document.getElementById('close-portal-btn');
  const configureButtons = document.querySelectorAll('.configure-product-btn');

  const openPortal = () => {
    portal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    gsap.fromTo(portal, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  };

  const closePortal = () => {
    gsap.to(portal, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
      portal.style.display = 'none';
      document.body.style.overflow = '';
    }});
  };

  openButtons.forEach(btn => btn && btn.addEventListener('click', openPortal));
  closeButton && closeButton.addEventListener('click', closePortal);

  // Clicking "Configure" on a landing page product card:
  // Dynamically signs in as "Sales" and loads the specific product template!
  configureButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodCode = e.currentTarget.getAttribute('data-product');
      openPortal();
      
      // Auto-simulate logging in as Sales
      simulateAutoLogin('Sales', prodCode);
    });
  });
}

// Simulated auto login when configuring directly
function simulateAutoLogin(role, initProductCode = null) {
  const loginScreen = document.getElementById('portal-login-screen');
  const dashboardLayout = document.getElementById('erp-dashboard-layout');
  const profileHeader = document.getElementById('user-profile-header');
  
  // Set Role
  STATE.activeRole = role;
  
  // Pre-fill forms & trigger submissions
  document.getElementById('login-role-val').value = role;
  document.getElementById('login-email').value = ROLE_DEFAULT_LOGINS[role].email;
  document.getElementById('login-password').value = ROLE_DEFAULT_LOGINS[role].password;

  // Visual simulation transition
  gsap.to(loginScreen, { opacity: 0, duration: 0.3, onComplete: () => {
    loginScreen.style.display = 'none';
    dashboardLayout.style.display = 'flex';
    profileHeader.style.display = 'flex';
    gsap.fromTo(dashboardLayout, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    
    // Set Profile Header details
    document.getElementById('profile-name').innerText = `${role} Officer`;
    document.getElementById('profile-role').innerText = role === 'Admin' ? 'System Administrator' : `${role} Department`;
    document.getElementById('profile-avatar').innerText = role.substring(0,1);

    // Apply Permissions UI Filter
    applyRolePermissions();
    
    // Render dashboard widgets
    renderDashboardOverview();
    
    // If a product was configured, immediately open Quotation Builder with that product
    if (initProductCode) {
      switchModule('quotations');
      const prodSelect = document.getElementById('quote-product-select');
      prodSelect.value = initProductCode;
      // Trigger specs generation
      generateDynamicSpecs(initProductCode);
    } else {
      switchModule('dashboard');
    }
  }});
}

// ------------------------------------------
// 4. ERP CORE OPERATIONS (DASHBOARD)
// ------------------------------------------

function initPortalCore() {
  const deptCards = document.querySelectorAll('.dept-select-card');
  const roleHiddenInput = document.getElementById('login-role-val');
  const loginForm = document.getElementById('portal-login-form');
  const logoutBtn = document.getElementById('portal-logout-btn');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  // Role selector click handlers
  deptCards.forEach(card => {
    card.addEventListener('click', (e) => {
      deptCards.forEach(c => c.classList.remove('active'));
      const cardEl = e.currentTarget;
      cardEl.classList.add('active');
      
      const role = cardEl.getAttribute('data-role');
      roleHiddenInput.value = role;
      
      // Update form values with credentials
      document.getElementById('login-email').value = ROLE_DEFAULT_LOGINS[role].email;
      document.getElementById('login-password').value = ROLE_DEFAULT_LOGINS[role].password;
    });
  });

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = roleHiddenInput.value;
      simulateAutoLogin(role);
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      const loginScreen = document.getElementById('portal-login-screen');
      const dashboardLayout = document.getElementById('erp-dashboard-layout');
      const profileHeader = document.getElementById('user-profile-header');
      
      gsap.to(dashboardLayout, { opacity: 0, duration: 0.3, onComplete: () => {
        dashboardLayout.style.display = 'none';
        profileHeader.style.display = 'none';
        loginScreen.style.display = 'flex';
        loginScreen.style.opacity = 1;
        gsap.from(loginScreen, { scale: 0.98, duration: 0.4 });
      }});
    });
  }

  // Sidebar module switching
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetModule = e.currentTarget.getAttribute('data-module');
      
      // Check permission
      if (!ROLE_PERMISSIONS[STATE.activeRole].includes(targetModule)) {
        alert(`Access Denied: Your profile role (${STATE.activeRole}) does not have clearance for the "${targetModule.toUpperCase()}" module.`);
        return;
      }
      
      switchModule(targetModule);
    });
  });

  // Module shortcuts within Overview
  document.getElementById('quick-jump-production').addEventListener('click', (e) => {
    e.preventDefault();
    if (checkModulePermission('status')) switchModule('status');
  });
  document.getElementById('dash-btn-new-quote').addEventListener('click', () => {
    if (checkModulePermission('quotations')) switchModule('quotations');
  });
  document.getElementById('dash-btn-payments').addEventListener('click', () => {
    if (checkModulePermission('accounts')) switchModule('accounts');
  });
  document.getElementById('dash-btn-templates').addEventListener('click', () => {
    if (checkModulePermission('admin')) switchModule('admin');
  });

  // Module functional initializations
  initQuotationBuilderModule();
  initWorkOrdersModule();
  initStatusBoardModule();
  initAccountsModule();
  initAdminConfigModule();
}

function checkModulePermission(moduleName) {
  if (!ROLE_PERMISSIONS[STATE.activeRole].includes(moduleName)) {
    alert(`Access Denied: Your profile role (${STATE.activeRole}) does not have clearance for this module.`);
    return false;
  }
  return true;
}

// Module display switcher
function switchModule(moduleName) {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.module-view');
  
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-module') === moduleName) {
      link.classList.add('active');
    }
  });

  views.forEach(view => {
    view.classList.remove('active');
  });

  const activeView = document.getElementById(`view-${moduleName}`);
  if (activeView) {
    activeView.classList.add('active');
    // Trigger entrance animation for content
    gsap.fromTo(activeView.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 });
    
    // Module specific refresh loads
    if (moduleName === 'dashboard') renderDashboardOverview();
    if (moduleName === 'sales') renderSalesHistoryTable();
    if (moduleName === 'workorders') renderWorkOrders();
    if (moduleName === 'status') renderProductionBoard();
    if (moduleName === 'accounts') renderAccountsLedger();
    if (moduleName === 'customers') renderCustomersDirectory();
  }
}

// Apply role restrictions to the sidebar links
function applyRolePermissions() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  sidebarLinks.forEach(link => {
    const mod = link.getAttribute('data-module');
    const hasAccess = ROLE_PERMISSIONS[STATE.activeRole].includes(mod);
    
    if (hasAccess) {
      link.style.opacity = '1';
      link.style.cursor = 'pointer';
      link.classList.remove('link-restricted');
      // Remove any lock icons added previously
      const lock = link.querySelector('.lock-icon-svg');
      if (lock) lock.remove();
    } else {
      link.style.opacity = '0.4';
      link.classList.add('link-restricted');
      // Append visual padlock to indicate restriction
      if (!link.querySelector('.lock-icon-svg')) {
        link.insertAdjacentHTML('beforeend', '<svg class="lock-icon-svg" style="width:12px;height:12px;margin-left:auto;fill:none;stroke:#EF4444;stroke-width:2.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>');
      }
    }
  });
}

// System event logger helper
function logSystemActivity(message) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  STATE.logs.unshift({ time, message });
  if (STATE.logs.length > 8) STATE.logs.pop();
}

// Render Dashboard KPI Cards & recent logs
function renderDashboardOverview() {
  // KPIs calculation
  const activeWOCount = STATE.workOrders.filter(w => w.stage !== 'Delivered' && w.stage !== 'Ready').length;
  const pendingQuotesCount = STATE.quotations.filter(q => q.status === 'Draft').length;
  
  let outstandingBalance = 0;
  STATE.customers.forEach(c => outstandingBalance += c.outstanding);

  document.getElementById('kpi-active-wo').innerText = activeWOCount;
  document.getElementById('kpi-pending-quotes').innerText = pendingQuotesCount;
  document.getElementById('kpi-receivable').innerText = `₹${(outstandingBalance/100000).toFixed(1)}L`;

  // Render Log List
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
      // Calculate progress percentage based on stage
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

// Render sales transactions database
function renderSalesHistoryTable() {
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

    tbody.innerHTML = filteredSales.map(sale => `
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
          <button class="btn btn-outline btn-xs" onclick="alert('PDF invoice format printing matches registered format.')">Invoice PDF</button>
        </td>
      </tr>
    `).join('');
  };

  searchInput.addEventListener('input', render);
  filterProduct.addEventListener('change', render);
  render();
}

// ------------------------------------------
// 5. INTERACTIVE QUOTATION ESTIMATION MODULE
// ------------------------------------------

let currentCustomItems = [];

function initQuotationBuilderModule() {
  const prodSelect = document.getElementById('quote-product-select');
  const tempSelect = document.getElementById('quote-template-select');
  const addCustomBtn = document.getElementById('btn-add-custom-item');
  const approveBtn = document.getElementById('btn-approve-quote');
  const saveDraftBtn = document.getElementById('btn-save-draft');

  // Trigger loading dropdowns
  loadCustomerDropdowns();

  prodSelect.addEventListener('change', (e) => {
    generateTemplateDropdown(e.target.value);
    generateDynamicSpecs(e.target.value);
    calculateQuotePricing();
  });

  tempSelect.addEventListener('change', () => {
    calculateQuotePricing();
  });

  addCustomBtn.addEventListener('click', () => {
    addCustomItemRow();
  });

  approveBtn.addEventListener('click', () => {
    submitApprovedQuotation();
  });

  saveDraftBtn.addEventListener('click', () => {
    saveQuotationDraft();
  });

  // Default generation on init
  generateTemplateDropdown('flatbed');
  generateDynamicSpecs('flatbed');
  calculateQuotePricing();
}

function loadCustomerDropdowns() {
  const select = document.getElementById('quote-cust-select');
  select.innerHTML = STATE.customers.map(c => `
    <option value="${c.id}">${c.company} (${c.name})</option>
  `).join('') + `<option value="NEW">-- Create New Client profile --</option>`;

  // Change input fields dynamically
  select.addEventListener('change', (e) => {
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
  });

  // Preload first customer details
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

// Generate checkboxes & selectors matching technical specs variables
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

  // Rebind price calculations on configuration changes
  const inputs = document.querySelectorAll('.spec-parameter-input');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      calculateQuotePricing();
    });
  });
}

function addCustomItemRow() {
  const container = document.getElementById('quote-custom-items-list');
  const id = `item-${Date.now()}`;
  
  const rowHtml = `
    <div class="custom-item-row" id="${id}">
      <div class="form-group mb-none">
        <label>Item Description</label>
        <input type="text" class="form-control form-control-sm item-desc-input" placeholder="GPS Tracker, Extra Toolbox..." required>
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
        <svg class="icon-sm" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', rowHtml);

  // Bind change triggers to recalculate live totals
  const row = document.getElementById(id);
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      calculateQuotePricing();
    });
  });
}

window.removeCustomItemRow = function(id) {
  const row = document.getElementById(id);
  if (row) {
    row.remove();
    calculateQuotePricing();
  }
};

// Pricing Core dynamic calculation engine
function calculateQuotePricing() {
  const productKey = document.getElementById('quote-product-select').value;
  const product = STATE.products[productKey];
  const template = document.getElementById('quote-template-select').value;
  
  const sheet = document.getElementById('quote-summary-sheet');
  if (!sheet) return;

  let basePrice = product.basePrice;
  let specUpgradesHtml = '';
  let specsTotalDiff = 0;

  // 1. Calculate Spec Differentials
  const specInputs = document.querySelectorAll('.spec-parameter-input');
  specInputs.forEach(input => {
    const selectedOpt = input.options[input.selectedIndex];
    if (selectedOpt) {
      // Modify prices using Admin Matrix coefficients if relevant
      let priceDiff = parseFloat(selectedOpt.getAttribute('data-pricediff')) || 0;
      
      // Override price differentials dynamically if Admin modified config parameters
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

  // 2. Calculate Custom Add-ons
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

  // 3. Totals Compilation
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

  // Cache total in form data attribute for extraction on submit
  document.getElementById('quote-builder-form').setAttribute('data-current-total', grandTotal);
}

function saveQuotationDraft() {
  const form = document.getElementById('quote-builder-form');
  const productKey = document.getElementById('quote-product-select').value;
  const productName = STATE.products[productKey].name;
  const total = parseFloat(form.getAttribute('data-current-total')) || 0;
  
  // Extract customer
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
      phone: '+91-Sales Draft',
      email: 'sales@draft.com',
      address: 'Created during quote configuration',
      vehicles: [],
      outstanding: 0
    });
  }

  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  
  // Pack specs
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
  alert(`Quotation ${quoteId} saved successfully as draft.`);
  switchModule('dashboard');
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
    alert('Please enter a valid Customer or Company Name.');
    return;
  }

  if (customerId === 'NEW') {
    customerId = `CUST-00${STATE.customers.length + 1}`;
    STATE.customers.push({
      id: customerId,
      name: customerName,
      company: customerName,
      gst: gstNum || 'Pending',
      phone: '+91-Sales Approved',
      email: 'sales@approved.com',
      address: 'Registered via Estimation Builder',
      vehicles: [],
      outstanding: total // outstanding matches quote basic before payment
    });
  } else {
    // Increase outstanding balance
    const c = STATE.customers.find(x => x.id === customerId);
    if (c) c.outstanding += total;
  }

  const quoteId = `QT-2026-00${STATE.quotations.length + 1}`;
  
  // Pack specs
  const specsList = [];
  const specs = {};
  document.querySelectorAll('.spec-parameter-input').forEach(input => {
    const label = input.previousElementSibling.innerText;
    specsList.push(input.value);
    const specId = input.getAttribute('id').replace('spec-', '');
    specs[specId] = input.value;
  });

  // 1. Save quotation
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

  // 2. Generate Sales history entry
  const invoiceId = `INV-2026-${Math.floor(883 + Math.random()*100)}`;
  STATE.sales.push({
    invoiceId,
    customerName,
    product: `${productName} (${document.getElementById('quote-template-select').value})`,
    date: new Date().toISOString().split('T')[0],
    amount: total,
    status: 'Unpaid'
  });

  // 3. Generate Work Order
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
    notes: 'Drafted and approved via automated ERP workflow estimation builder.'
  });

  logSystemActivity(`Quote ${quoteId} approved. Generated Invoice ${invoiceId} & Work Order ${woId}.`);
  alert(`Operations Successful!\n\n1. Quotation ${quoteId} Approved\n2. Work Order ${woId} created and dispatched to factory Floor.\n3. Sales Invoice ${invoiceId} generated.`);
  
  // Clear custom rows
  document.getElementById('quote-custom-items-list').innerHTML = '';
  
  // Switch to Production Board to see the WO card appear!
  switchModule('status');
}

// ------------------------------------------
// 6. WORK ORDERS MODULE
// ------------------------------------------

function initWorkOrdersModule() {
  // Bind actions
}

function renderWorkOrders() {
  const container = document.getElementById('workorders-container');
  if (!container) return;

  if (STATE.workOrders.length === 0) {
    container.innerHTML = '<p class="section-hint text-center py-lg col-span-2">No active work orders in shop queue.</p>';
    return;
  }

  container.innerHTML = STATE.workOrders.map(wo => {
    // Locate corresponding quote to check custom items
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
          <button class="btn btn-outline btn-sm" onclick="alert('Printing operations sent to server.')">
            <svg class="icon-sm" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print WO Card
          </button>
          <button class="btn btn-primary btn-sm" onclick="switchModule('status')">Track Board</button>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------
// 7. PRODUCTION STATUS BOARD (KANBAN FLOW)
// ------------------------------------------

function initStatusBoardModule() {
  // Bind Kanban triggers
}

function renderProductionBoard() {
  const container = document.getElementById('production-board-container');
  if (!container) return;

  // We can render columns for selected key manufacturing processes:
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

// Advance Work Order Stage smoothly along the pipeline
window.advanceWorkOrderStage = function(woId) {
  const wo = STATE.workOrders.find(w => w.id === woId);
  if (!wo) return;

  const currentIdx = STAGES.indexOf(wo.stage);
  if (currentIdx < STAGES.length - 1) {
    const nextStage = STAGES[currentIdx + 1];
    wo.stage = nextStage;
    
    // Calculate progress
    wo.progress = Math.round(((currentIdx + 1) / (STAGES.length - 1)) * 100);
    
    logSystemActivity(`Work Order ${woId} advanced to phase: ${nextStage} (${wo.progress}%).`);
    
    // If it reaches Delivered or Ready, update invoice status in finance
    if (nextStage === 'Ready') {
      const sale = STATE.sales.find(s => s.customerName === wo.customerName && s.product.includes(wo.product));
      if (sale && sale.status === 'Unpaid') {
        logSystemActivity(`Invoice ${sale.invoiceId} outstanding flagged to intermediate status.`);
      }
    }

    // Dynamic visual card transition animation using GSAP before refreshing board
    const card = document.getElementById(`board-card-${woId}`);
    if (card && typeof gsap !== 'undefined') {
      gsap.to(card, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => {
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
// 8. ACCOUNTS & PAYMENT LEDGER MODULE
// ------------------------------------------

function initAccountsModule() {
  const payForm = document.getElementById('payment-log-form');
  
  if (payForm) {
    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const invoiceId = document.getElementById('pay-order-select').value;
      const amount = parseFloat(document.getElementById('pay-amount').value);
      const mode = document.getElementById('pay-mode').value;
      const ref = document.getElementById('pay-reference').value;

      // Log invoice
      const sale = STATE.sales.find(s => s.invoiceId === invoiceId);
      if (!sale) return;

      // Add payment
      const pId = `TXN-${Math.floor(902104 + Math.random()*1000)}`;
      STATE.payments.push({
        id: pId,
        invoiceId,
        date: new Date().toISOString().split('T')[0],
        amount,
        mode,
        ref
      });

      // Recalculate customer outstanding balances
      const customer = STATE.customers.find(c => c.company === sale.customerName);
      if (customer) {
        customer.outstanding = Math.max(0, customer.outstanding - amount);
      }

      // Update Sales invoice state
      const totalPaidOnInvoice = STATE.payments
        .filter(p => p.invoiceId === invoiceId)
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaidOnInvoice >= sale.amount) {
        sale.status = 'Paid';
      } else if (totalPaidOnInvoice > 0) {
        sale.status = 'Partial';
      }

      logSystemActivity(`Logged payment ₹${amount.toLocaleString('en-IN')} for invoice ${invoiceId} via ${mode}.`);
      alert(`Payment logged successfully. Txn Ref: ${pId}. Balance recalculated.`);
      
      payForm.reset();
      renderAccountsLedger();
    });
  }
}

function renderAccountsLedger() {
  const tbody = document.querySelector('#accounts-ledger-table tbody');
  const paySelect = document.getElementById('pay-order-select');
  const txnHistoryList = document.getElementById('payment-history-list');
  
  if (!tbody) return;

  // Render Ledger table row records
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

  // Update order choices dropdown list
  paySelect.innerHTML = STATE.sales.filter(s => s.status !== 'Paid').map(s => `
    <option value="${s.invoiceId}">${s.invoiceId} - ${s.customerName} (Due: ₹${(s.amount - (STATE.payments.filter(p => p.invoiceId === s.invoiceId).reduce((sum, p) => sum + p.amount, 0))).toLocaleString('en-IN')})</option>
  `).join('');

  // Render recent payment transactions history logs
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
  // Focus to payments logger input
  document.getElementById('pay-amount').focus();
};

// ------------------------------------------
// 9. CLIENT ACCOUNTS DIRECTORY
// ------------------------------------------

function renderCustomersDirectory() {
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
// 10. SYSTEM CONFIGURATION & MATRICES
// ------------------------------------------

function initAdminConfigModule() {
  const form = document.getElementById('admin-pricing-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      STATE.adminPricing.floor6 = parseFloat(document.getElementById('admin-p-floor-6').value);
      STATE.adminPricing.floor10 = parseFloat(document.getElementById('admin-p-floor-10').value);
      STATE.adminPricing.steelHardox = parseFloat(document.getElementById('admin-p-steel-hardox').value);
      STATE.adminPricing.axle2 = parseFloat(document.getElementById('admin-p-axle-2').value);
      STATE.adminPricing.axle3_16 = parseFloat(document.getElementById('admin-p-axle-3-16').value);

      // Log configuration change
      logSystemActivity(`Admin updated raw material pricing coefficients.`);
      
      // Update pricing audit logs
      const auditContainer = document.getElementById('admin-audit-logs');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      auditContainer.insertAdjacentHTML('afterbegin', `
        <li><span class="audit-time">${time}</span> Administrator modified pricing matrix parameters.</li>
      `);

      alert('Baseline pricing matrix updated successfully. Live estimation quotes will reflect these modifications immediately.');
      
      // Trigger price calculation update on current quotation sheet
      calculateQuotePricing();
    });
  }
}
