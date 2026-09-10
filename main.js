/* =====================================================
   SUNDARI TRAVELS – Main JavaScript
   ===================================================== */

/* ---- Config (easy to update) ---- */
const CONFIG = {
  phone: '+919600924938',
  phoneDisplay: '+91 9600924938',
  waNumber: '919600924938',
  companyName: 'Sundari Travels',
};

/* ---- DOM Ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initScrollSpy();
  initScrollAnimations();
  initTariffTabs();
  initBookingForm();
  initContactForm();
  initSmoothScroll();
  setCopyrightYear();
  setMinDate();
});

/* ---- Navbar Scroll Behavior ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Mobile Nav ---- */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const open = () => {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? close() : open();
  });

  overlay.addEventListener('click', close);

  // Close on mobile nav link click
  document.querySelectorAll('.mobile-nav-link, .mobile-book-btn').forEach(link => {
    link.addEventListener('click', close);
  });
}

/* ---- Scroll Spy (active nav link) ---- */
function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav-link');

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  // Set active based on scroll position
  function onScroll() {
    const scrollY = window.scrollY + 100;
    let current = sections[0].getAttribute('id');
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute('id');
      }
    });
    setActive(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
}

/* ---- Scroll Animations ---- */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('.fade-up, .reveal-left, .reveal-right');
  const nonHeroEls = Array.from(animatedEls).filter(el => !el.closest('.hero-content'));

  // Immediately make elements visible if already in viewport
  nonHeroEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: make everything visible
    nonHeroEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  nonHeroEls.forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });

  // Safety net — after 2s make everything visible
  setTimeout(() => {
    nonHeroEls.forEach(el => el.classList.add('visible'));
  }, 2000);
}

/* ---- Tariff Tabs ---- */
function initTariffTabs() {
  const tabs = document.querySelectorAll('.tariff-tab');
  const contents = document.querySelectorAll('.tariff-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById(`tab-${target}`);
      if (targetContent) {
        targetContent.classList.add('active');
        // Re-trigger animations for visible cards
        targetContent.querySelectorAll('.fade-up').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), 50);
        });
      }
    });
  });
}

/* ---- Smooth Scroll ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---- Set Copyright Year ---- */
function setCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Set Min Date on Journey Date Input ---- */
function setMinDate() {
  const dateInput = document.getElementById('journeyDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
}

/* ---- Booking Form – WhatsApp Submission ---- */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateBookingForm()) return;

    const name     = document.getElementById('custName').value.trim();
    const phone    = document.getElementById('custPhone').value.trim();
    const email    = document.getElementById('custEmail').value.trim();
    const tripType = document.querySelector('input[name="tripType"]:checked').value;
    const pickup   = document.getElementById('pickupLoc').value.trim();
    const drop     = document.getElementById('dropLoc').value.trim();
    const date     = document.getElementById('journeyDate').value;
    const time     = document.getElementById('pickupTime').value;
    const vehicle  = document.getElementById('vehicleType').value;
    const message  = document.getElementById('addMessage').value.trim();

    // Format date nicely
    let dateFormatted = date;
    try {
      const d = new Date(date);
      dateFormatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (_) {}

    // Format time nicely
    let timeFormatted = time;
    try {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      timeFormatted = `${hour12}:${m} ${ampm}`;
    } catch (_) {}

    const waMessage =
`Hello ${CONFIG.companyName},

I would like to book a taxi.

Name: ${name}
Phone: ${phone}${email ? '\nEmail: ' + email : ''}
Trip Type: ${tripType}
Pickup: ${pickup}
Drop: ${drop}
Date: ${dateFormatted}
Time: ${timeFormatted}
Vehicle: ${vehicle}${message ? '\nMessage: ' + message : ''}

Please confirm my booking.`;

    const encoded = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${CONFIG.waNumber}?text=${encoded}`, '_blank', 'noopener');

    showToast('Redirecting to WhatsApp…', 'success');
  });
}

function validateBookingForm() {
  let valid = true;
  const fields = [
    { id: 'custName',    errId: 'custNameErr',    msg: 'Please enter your full name.' },
    { id: 'custPhone',   errId: 'custPhoneErr',   msg: 'Please enter a valid mobile number.', validator: v => /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g,'')) || /^\+91[6-9]\d{9}$/.test(v.replace(/\s/g,'')) },
    { id: 'pickupLoc',   errId: 'pickupLocErr',   msg: 'Please enter pickup location.' },
    { id: 'dropLoc',     errId: 'dropLocErr',     msg: 'Please enter drop location.' },
    { id: 'journeyDate', errId: 'journeyDateErr', msg: 'Please select a journey date.' },
    { id: 'pickupTime',  errId: 'pickupTimeErr',  msg: 'Please select a pickup time.' },
    { id: 'vehicleType', errId: 'vehicleTypeErr', msg: 'Please select a vehicle type.' },
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const errEl = document.getElementById(f.errId);
    const val = el ? el.value.trim() : '';
    let fieldValid = val.length > 0;

    if (fieldValid && f.validator) {
      fieldValid = f.validator(val);
    }

    if (errEl) errEl.textContent = fieldValid ? '' : f.msg;
    if (el) el.classList.toggle('error', !fieldValid);

    if (!fieldValid) valid = false;
  });

  if (!valid) {
    // Scroll to first error
    const firstErr = document.querySelector('.form-group input.error, .form-group select.error');
    if (firstErr) {
      const navH = document.getElementById('navbar').offsetHeight;
      const top = firstErr.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
  return valid;
}

/* ---- Contact Form ---- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('cName').value.trim();
    const phone   = document.getElementById('cPhone').value.trim();
    const email   = document.getElementById('cEmail').value.trim();
    const subject = document.getElementById('cSubject').value.trim();
    const message = document.getElementById('cMessage').value.trim();

    if (!name || !phone || !message) {
      showToast('Please fill in the required fields.', 'error');
      return;
    }

    const waMessage =
`Hello ${CONFIG.companyName},

New contact form message:

Name: ${name}
Phone: ${phone}${email ? '\nEmail: ' + email : ''}${subject ? '\nSubject: ' + subject : ''}
Message: ${message}`;

    const encoded = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${CONFIG.waNumber}?text=${encoded}`, '_blank', 'noopener');
    showToast('Message sent via WhatsApp!', 'success');
    form.reset();
  });
}

/* ---- Fill Route into Booking Form ---- */
function fillRoute(from, to) {
  const pickupEl = document.getElementById('pickupLoc');
  const dropEl   = document.getElementById('dropLoc');

  if (pickupEl && dropEl) {
    pickupEl.value = from;
    dropEl.value   = to;
    // Clear any error states
    pickupEl.classList.remove('error');
    dropEl.classList.remove('error');
    const pe = document.getElementById('pickupLocErr');
    const de = document.getElementById('dropLocErr');
    if (pe) pe.textContent = '';
    if (de) de.textContent = '';
  }

  // Scroll to booking section
  const booking = document.getElementById('booking');
  if (booking) {
    const navH = document.getElementById('navbar').offsetHeight;
    const top = booking.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  showToast(`Route set: ${from} → ${to}`, 'success');
}

/* ---- Toast Notification ---- */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ---- Real-time form field clearing on input ---- */
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('error')) {
    e.target.classList.remove('error');
    const errId = e.target.id + 'Err';
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  }
});

/* ---- Lazy load images with fade ---- */
if ('IntersectionObserver' in window) {
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.transition = 'opacity 0.5s ease';
        img.addEventListener('load', () => { img.style.opacity = '1'; });
        img.style.opacity = '0';
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  lazyImgs.forEach(img => imgObserver.observe(img));
}

/* ---- Location Autocomplete ---- */
const LOCATIONS = [
  // ── CHENNAI Areas ──
  {a:'Anna Nagar',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'T Nagar',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Adyar',             c:'Chennai',     s:'Tamil Nadu'},
  {a:'Velachery',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'Tambaram',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Perambur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Royapettah',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Egmore',            c:'Chennai',     s:'Tamil Nadu'},
  {a:'Nungambakkam',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Kilpauk',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chetpet',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Kodambakkam',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Ashok Nagar',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Vadapalani',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Virugambakkam',     c:'Chennai',     s:'Tamil Nadu'},
  {a:'KK Nagar',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Arumbakkam',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Koyambedu',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'Aminjikarai',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Saidapet',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Guindy',            c:'Chennai',     s:'Tamil Nadu'},
  {a:'Alandur',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'St Thomas Mount',   c:'Chennai',     s:'Tamil Nadu'},
  {a:'Pallavaram',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chromepet',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'Mudichur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Vandalur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Urapakkam',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'Guduvanchery',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Porur',             c:'Chennai',     s:'Tamil Nadu'},
  {a:'Valasaravakkam',    c:'Chennai',     s:'Tamil Nadu'},
  {a:'Mogappair',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'Ambattur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Avadi',             c:'Chennai',     s:'Tamil Nadu'},
  {a:'Poonamallee',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Thiruverkadu',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Maduravoyal',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Thiruvottiyur',     c:'Chennai',     s:'Tamil Nadu'},
  {a:'Tondiarpet',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Manali',            c:'Chennai',     s:'Tamil Nadu'},
  {a:'Sholinganallur',    c:'Chennai',     s:'Tamil Nadu'},
  {a:'Perungudi',         c:'Chennai',     s:'Tamil Nadu'},
  {a:'OMR',               c:'Chennai',     s:'Tamil Nadu'},
  {a:'ECR',               c:'Chennai',     s:'Tamil Nadu'},
  {a:'Siruseri',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Kelambakkam',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Navalur',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Padur',             c:'Chennai',     s:'Tamil Nadu'},
  {a:'Medavakkam',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Pallikaranai',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Selaiyur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Madipakkam',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Nanganallur',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Meenambakkam',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chennai Airport',   c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chennai Central',   c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chennai Egmore',    c:'Chennai',     s:'Tamil Nadu'},
  {a:'Kattupakkam',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Pattabiram',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Alwarpet',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Mylapore',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Triplicane',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Chepauk',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Purasawalkam',      c:'Chennai',     s:'Tamil Nadu'},
  {a:'Kolathur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Villivakkam',       c:'Chennai',     s:'Tamil Nadu'},
  {a:'Korattur',          c:'Chennai',     s:'Tamil Nadu'},
  {a:'Madhavaram',        c:'Chennai',     s:'Tamil Nadu'},
  {a:'Periyar Nagar',     c:'Chennai',     s:'Tamil Nadu'},
  {a:'Nerkundram',        c:'Chennai',     s:'Tamil Nadu'},

  // ── COIMBATORE Areas ──
  {a:'RS Puram',          c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Gandhipuram',       c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Peelamedu',         c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Saibaba Colony',    c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Singanallur',       c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Ukkadam',           c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Ganapathy',         c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Vadavalli',         c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Kuniyamuthur',      c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Podanur',           c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Sulur',             c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Coimbatore Airport',c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Coimbatore Junction',c:'Coimbatore', s:'Tamil Nadu'},
  {a:'Race Course',       c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Avinashi Road',     c:'Coimbatore',  s:'Tamil Nadu'},

  // ── MADURAI Areas ──
  {a:'Anna Nagar',        c:'Madurai',     s:'Tamil Nadu'},
  {a:'KK Nagar',          c:'Madurai',     s:'Tamil Nadu'},
  {a:'Tallakulam',        c:'Madurai',     s:'Tamil Nadu'},
  {a:'Iyer Bungalow',     c:'Madurai',     s:'Tamil Nadu'},
  {a:'Mattuthavani',      c:'Madurai',     s:'Tamil Nadu'},
  {a:'Thirunagar',        c:'Madurai',     s:'Tamil Nadu'},
  {a:'Palanganatham',     c:'Madurai',     s:'Tamil Nadu'},
  {a:'Madurai Airport',   c:'Madurai',     s:'Tamil Nadu'},
  {a:'Madurai Junction',  c:'Madurai',     s:'Tamil Nadu'},
  {a:'Narimedu',          c:'Madurai',     s:'Tamil Nadu'},
  {a:'Kochadai',          c:'Madurai',     s:'Tamil Nadu'},

  // ── TRICHY Areas ──
  {a:'Srirangam',         c:'Trichy',      s:'Tamil Nadu'},
  {a:'Woraiyur',          c:'Trichy',      s:'Tamil Nadu'},
  {a:'Thillai Nagar',     c:'Trichy',      s:'Tamil Nadu'},
  {a:'Ariyamangalam',     c:'Trichy',      s:'Tamil Nadu'},
  {a:'Trichy Airport',    c:'Trichy',      s:'Tamil Nadu'},
  {a:'Trichy Junction',   c:'Trichy',      s:'Tamil Nadu'},
  {a:'Golden Rock',       c:'Trichy',      s:'Tamil Nadu'},

  // ── SALEM Areas ──
  {a:'Fairlands',         c:'Salem',       s:'Tamil Nadu'},
  {a:'Swarnapuri',        c:'Salem',       s:'Tamil Nadu'},
  {a:'Gugai',             c:'Salem',       s:'Tamil Nadu'},
  {a:'Salem Junction',    c:'Salem',       s:'Tamil Nadu'},
  {a:'Suramangalam',      c:'Salem',       s:'Tamil Nadu'},
  {a:'Ammapet',           c:'Salem',       s:'Tamil Nadu'},

  // ── VELLORE Areas ──
  {a:'Katpadi',           c:'Vellore',     s:'Tamil Nadu'},
  {a:'CMC Hospital',      c:'Vellore',     s:'Tamil Nadu'},
  {a:'Bagayam',           c:'Vellore',     s:'Tamil Nadu'},
  {a:'Sathuvachari',      c:'Vellore',     s:'Tamil Nadu'},
  {a:'VIT Vellore',       c:'Vellore',     s:'Tamil Nadu'},

  // ── TN CITIES (city-level) ──
  {a:'Chennai',           c:'Chennai',     s:'Tamil Nadu'},
  {a:'Coimbatore',        c:'Coimbatore',  s:'Tamil Nadu'},
  {a:'Madurai',           c:'Madurai',     s:'Tamil Nadu'},
  {a:'Trichy',            c:'Trichy',      s:'Tamil Nadu'},
  {a:'Salem',             c:'Salem',       s:'Tamil Nadu'},
  {a:'Erode',             c:'Erode',       s:'Tamil Nadu'},
  {a:'Tirunelveli',       c:'Tirunelveli', s:'Tamil Nadu'},
  {a:'Vellore',           c:'Vellore',     s:'Tamil Nadu'},
  {a:'Tiruppur',          c:'Tiruppur',    s:'Tamil Nadu'},
  {a:'Dindigul',          c:'Dindigul',    s:'Tamil Nadu'},
  {a:'Thanjavur',         c:'Thanjavur',   s:'Tamil Nadu'},
  {a:'Kumbakonam',        c:'Kumbakonam',  s:'Tamil Nadu'},
  {a:'Kanchipuram',       c:'Kanchipuram', s:'Tamil Nadu'},
  {a:'Hosur',             c:'Hosur',       s:'Tamil Nadu'},
  {a:'Ooty',              c:'Ooty',        s:'Tamil Nadu'},
  {a:'Kodaikanal',        c:'Kodaikanal',  s:'Tamil Nadu'},
  {a:'Yercaud',           c:'Yercaud',     s:'Tamil Nadu'},
  {a:'Rameswaram',        c:'Rameswaram',  s:'Tamil Nadu'},
  {a:'Kanyakumari',       c:'Kanyakumari', s:'Tamil Nadu'},
  {a:'Mahabalipuram',     c:'Mahabalipuram',s:'Tamil Nadu'},
  {a:'Pondicherry',       c:'Pondicherry', s:'Puducherry'},
  {a:'Puducherry',        c:'Puducherry',  s:'Puducherry'},
  {a:'Auroville',         c:'Pondicherry', s:'Puducherry'},
  {a:'White Town',        c:'Pondicherry', s:'Puducherry'},
  {a:'Karaikudi',         c:'Karaikudi',   s:'Tamil Nadu'},
  {a:'Tiruvannamalai',    c:'Tiruvannamalai',s:'Tamil Nadu'},
  {a:'Valparai',          c:'Valparai',    s:'Tamil Nadu'},
  {a:'Pollachi',          c:'Pollachi',    s:'Tamil Nadu'},
  {a:'Hogenakkal',        c:'Dharmapuri',  s:'Tamil Nadu'},
  {a:'Courtallam',        c:'Tenkasi',     s:'Tamil Nadu'},
  {a:'Chengalpattu',      c:'Chengalpattu',s:'Tamil Nadu'},

  // ── BANGALORE Areas ──
  {a:'MG Road',           c:'Bangalore',   s:'Karnataka'},
  {a:'Brigade Road',      c:'Bangalore',   s:'Karnataka'},
  {a:'Koramangala',       c:'Bangalore',   s:'Karnataka'},
  {a:'Indiranagar',       c:'Bangalore',   s:'Karnataka'},
  {a:'Whitefield',        c:'Bangalore',   s:'Karnataka'},
  {a:'Electronic City',   c:'Bangalore',   s:'Karnataka'},
  {a:'Sarjapur Road',     c:'Bangalore',   s:'Karnataka'},
  {a:'Marathahalli',      c:'Bangalore',   s:'Karnataka'},
  {a:'Bellandur',         c:'Bangalore',   s:'Karnataka'},
  {a:'HSR Layout',        c:'Bangalore',   s:'Karnataka'},
  {a:'BTM Layout',        c:'Bangalore',   s:'Karnataka'},
  {a:'JP Nagar',          c:'Bangalore',   s:'Karnataka'},
  {a:'Bannerghatta Road', c:'Bangalore',   s:'Karnataka'},
  {a:'Jayanagar',         c:'Bangalore',   s:'Karnataka'},
  {a:'Basavanagudi',      c:'Bangalore',   s:'Karnataka'},
  {a:'Rajajinagar',       c:'Bangalore',   s:'Karnataka'},
  {a:'Malleswaram',       c:'Bangalore',   s:'Karnataka'},
  {a:'Yeshwanthpur',      c:'Bangalore',   s:'Karnataka'},
  {a:'Peenya',            c:'Bangalore',   s:'Karnataka'},
  {a:'Hebbal',            c:'Bangalore',   s:'Karnataka'},
  {a:'Yelahanka',         c:'Bangalore',   s:'Karnataka'},
  {a:'Devanahalli',       c:'Bangalore',   s:'Karnataka'},
  {a:'Bangalore Airport', c:'Bangalore',   s:'Karnataka'},
  {a:'Bangalore City Junction',c:'Bangalore',s:'Karnataka'},
  {a:'KR Puram',          c:'Bangalore',   s:'Karnataka'},
  {a:'Majestic',          c:'Bangalore',   s:'Karnataka'},
  {a:'Shivajinagar',      c:'Bangalore',   s:'Karnataka'},
  {a:'Ulsoor',            c:'Bangalore',   s:'Karnataka'},
  {a:'Richmond Town',     c:'Bangalore',   s:'Karnataka'},
  {a:'Frazer Town',       c:'Bangalore',   s:'Karnataka'},
  {a:'Banaswadi',         c:'Bangalore',   s:'Karnataka'},
  {a:'Hoodi',             c:'Bangalore',   s:'Karnataka'},
  {a:'Varthur',           c:'Bangalore',   s:'Karnataka'},
  {a:'Domlur',            c:'Bangalore',   s:'Karnataka'},
  {a:'Old Airport Road',  c:'Bangalore',   s:'Karnataka'},
  {a:'Bommanahalli',      c:'Bangalore',   s:'Karnataka'},
  {a:'Banashankari',      c:'Bangalore',   s:'Karnataka'},
  {a:'Kanakapura Road',   c:'Bangalore',   s:'Karnataka'},
  {a:'Vijayanagar',       c:'Bangalore',   s:'Karnataka'},
  {a:'Dasarahalli',       c:'Bangalore',   s:'Karnataka'},

  // ── MYSORE Areas ──
  {a:'Mysore Palace',     c:'Mysore',      s:'Karnataka'},
  {a:'Chamundi Hill',     c:'Mysore',      s:'Karnataka'},
  {a:'Gokulam',           c:'Mysore',      s:'Karnataka'},
  {a:'Kuvempunagar',      c:'Mysore',      s:'Karnataka'},
  {a:'Nazarbad',          c:'Mysore',      s:'Karnataka'},
  {a:'Mysore Junction',   c:'Mysore',      s:'Karnataka'},
  {a:'Mysore Airport',    c:'Mysore',      s:'Karnataka'},

  // ── KARNATAKA Cities ──
  {a:'Bangalore',         c:'Bangalore',   s:'Karnataka'},
  {a:'Mysore',            c:'Mysore',      s:'Karnataka'},
  {a:'Mangalore',         c:'Mangalore',   s:'Karnataka'},
  {a:'Hubli',             c:'Hubli',       s:'Karnataka'},
  {a:'Tumkur',            c:'Tumkur',      s:'Karnataka'},
  {a:'Udupi',             c:'Udupi',       s:'Karnataka'},
  {a:'Chikmagalur',       c:'Chikmagalur', s:'Karnataka'},
  {a:'Coorg',             c:'Coorg',       s:'Karnataka'},
  {a:'Madikeri',          c:'Madikeri',    s:'Karnataka'},
  {a:'Sakleshpur',        c:'Hassan',      s:'Karnataka'},
  {a:'Hampi',             c:'Bellary',     s:'Karnataka'},
  {a:'Hosur',             c:'Hosur',       s:'Tamil Nadu'},

  // ── KOCHI Areas ──
  {a:'Fort Kochi',        c:'Kochi',       s:'Kerala'},
  {a:'Mattancherry',      c:'Kochi',       s:'Kerala'},
  {a:'Kakkanad',          c:'Kochi',       s:'Kerala'},
  {a:'Edapally',          c:'Kochi',       s:'Kerala'},
  {a:'Aluva',             c:'Kochi',       s:'Kerala'},
  {a:'Vytilla',           c:'Kochi',       s:'Kerala'},
  {a:'Tripunithura',      c:'Kochi',       s:'Kerala'},
  {a:'Maradu',            c:'Kochi',       s:'Kerala'},
  {a:'Kalamassery',       c:'Kochi',       s:'Kerala'},
  {a:'Kochi Airport',     c:'Kochi',       s:'Kerala'},
  {a:'MG Road',           c:'Kochi',       s:'Kerala'},
  {a:'Marine Drive',      c:'Kochi',       s:'Kerala'},
  {a:'Ernakulam',         c:'Kochi',       s:'Kerala'},

  // ── THIRUVANANTHAPURAM Areas ──
  {a:'Technopark',        c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Pattom',            c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Kowdiar',           c:'Thiruvananthapuram',s:'Kerala'},
  {a:'East Fort',         c:'Thiruvananthapuram',s:'Kerala'},
  {a:'West Fort',         c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Trivandrum Airport',c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Trivandrum Central',c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Kazhakkoottam',     c:'Thiruvananthapuram',s:'Kerala'},

  // ── KERALA Cities ──
  {a:'Kochi',             c:'Kochi',       s:'Kerala'},
  {a:'Thiruvananthapuram',c:'Thiruvananthapuram',s:'Kerala'},
  {a:'Kozhikode',         c:'Kozhikode',   s:'Kerala'},
  {a:'Thrissur',          c:'Thrissur',    s:'Kerala'},
  {a:'Kollam',            c:'Kollam',      s:'Kerala'},
  {a:'Kannur',            c:'Kannur',      s:'Kerala'},
  {a:'Palakkad',          c:'Palakkad',    s:'Kerala'},
  {a:'Alappuzha',         c:'Alappuzha',   s:'Kerala'},
  {a:'Kottayam',          c:'Kottayam',    s:'Kerala'},
  {a:'Munnar',            c:'Munnar',      s:'Kerala'},
  {a:'Wayanad',           c:'Wayanad',     s:'Kerala'},
  {a:'Thekkady',          c:'Thekkady',    s:'Kerala'},
  {a:'Varkala',           c:'Varkala',     s:'Kerala'},
  {a:'Kovalam',           c:'Kovalam',     s:'Kerala'},
  {a:'Guruvayur',         c:'Thrissur',    s:'Kerala'},

  // ── HYDERABAD Areas ──
  {a:'Hitech City',       c:'Hyderabad',   s:'Telangana'},
  {a:'Gachibowli',        c:'Hyderabad',   s:'Telangana'},
  {a:'Banjara Hills',     c:'Hyderabad',   s:'Telangana'},
  {a:'Jubilee Hills',     c:'Hyderabad',   s:'Telangana'},
  {a:'Madhapur',          c:'Hyderabad',   s:'Telangana'},
  {a:'Kondapur',          c:'Hyderabad',   s:'Telangana'},
  {a:'Kukatpally',        c:'Hyderabad',   s:'Telangana'},
  {a:'Begumpet',          c:'Hyderabad',   s:'Telangana'},
  {a:'Ameerpet',          c:'Hyderabad',   s:'Telangana'},
  {a:'Dilsukhnagar',      c:'Hyderabad',   s:'Telangana'},
  {a:'LB Nagar',          c:'Hyderabad',   s:'Telangana'},
  {a:'Secunderabad Junction',c:'Hyderabad',s:'Telangana'},
  {a:'Hyderabad Airport', c:'Hyderabad',   s:'Telangana'},
  {a:'Shamshabad',        c:'Hyderabad',   s:'Telangana'},
  {a:'Mehdipatnam',       c:'Hyderabad',   s:'Telangana'},
  {a:'Manikonda',         c:'Hyderabad',   s:'Telangana'},
  {a:'Miyapur',           c:'Hyderabad',   s:'Telangana'},
  {a:'Uppal',             c:'Hyderabad',   s:'Telangana'},

  // ── AP & TELANGANA Cities ──
  {a:'Hyderabad',         c:'Hyderabad',   s:'Telangana'},
  {a:'Vijayawada',        c:'Vijayawada',  s:'Andhra Pradesh'},
  {a:'Visakhapatnam',     c:'Visakhapatnam',s:'Andhra Pradesh'},
  {a:'Tirupati',          c:'Tirupati',    s:'Andhra Pradesh'},
  {a:'Guntur',            c:'Guntur',      s:'Andhra Pradesh'},
  {a:'Nellore',           c:'Nellore',     s:'Andhra Pradesh'},
  {a:'Kurnool',           c:'Kurnool',     s:'Andhra Pradesh'},
  {a:'Rajahmundry',       c:'Rajahmundry', s:'Andhra Pradesh'},

  // ── OTHER MAJOR CITIES ──
  {a:'Mumbai',            c:'Mumbai',      s:'Maharashtra'},
  {a:'Pune',              c:'Pune',        s:'Maharashtra'},
  {a:'Delhi',             c:'Delhi',       s:'Delhi'},
  {a:'Kolkata',           c:'Kolkata',     s:'West Bengal'},
  {a:'Ahmedabad',         c:'Ahmedabad',   s:'Gujarat'},
  {a:'Jaipur',            c:'Jaipur',      s:'Rajasthan'},
  {a:'Chandigarh',        c:'Chandigarh',  s:'Punjab'},
  {a:'Varanasi',          c:'Varanasi',    s:'Uttar Pradesh'},
  {a:'Agra',              c:'Agra',        s:'Uttar Pradesh'},
  {a:'Guwahati',          c:'Guwahati',    s:'Assam'},
];

function initLocationAutocomplete() {
  setupAutocomplete('pickupLoc', 'pickupList');
  setupAutocomplete('dropLoc', 'dropList');
}

function setupAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list  = document.getElementById(listId);
  if (!input || !list) return;

  let activeIdx = -1;

  input.addEventListener('input', () => {
    const val = input.value.trim();
    activeIdx = -1;
    if (val.length < 2) { closeList(list); return; }

    const lower = val.toLowerCase();
    const score = (loc) => {
      const full = `${loc.a} ${loc.c} ${loc.s}`.toLowerCase();
      if (loc.a.toLowerCase().startsWith(lower)) return 0;
      if (loc.c.toLowerCase().startsWith(lower)) return 1;
      if (full.includes(lower)) return 2;
      return 99;
    };

    const matches = LOCATIONS
      .filter(loc => `${loc.a} ${loc.c} ${loc.s}`.toLowerCase().includes(lower))
      .sort((a, b) => score(a) - score(b))
      .slice(0, 10);

    if (!matches.length) { closeList(list); return; }

    list.innerHTML = matches.map((loc, i) => {
      const displayArea  = loc.a.replace(new RegExp(`(${escReg(val)})`, 'gi'), '<strong style="color:var(--primary)">$1</strong>');
      const displayCity  = loc.c.replace(new RegExp(`(${escReg(val)})`, 'gi'), '<strong style="color:var(--primary)">$1</strong>');
      return `<li data-idx="${i}" data-val="${loc.a}, ${loc.c}, ${loc.s}">
        <i class="fas fa-map-marker-alt"></i>
        <span class="ac-area">${displayArea}</span>
        <span class="ac-city">${displayCity}, ${loc.s}</span>
      </li>`;
    }).join('');
    list.classList.add('show');

    list.querySelectorAll('li').forEach(li => {
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = li.dataset.val;
        input.classList.remove('error');
        const errEl = document.getElementById(inputId + 'Err');
        if (errEl) errEl.textContent = '';
        closeList(list);
      });
    });
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      updateActive(items, activeIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      updateActive(items, activeIdx);
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && items[activeIdx]) {
        e.preventDefault();
        input.value = items[activeIdx].dataset.val;
        closeList(list);
      }
    } else if (e.key === 'Escape') {
      closeList(list);
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) closeList(list);
  });
}

function escReg(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function updateActive(items, idx) {
  items.forEach(li => li.classList.remove('active'));
  if (items[idx]) { items[idx].classList.add('active'); items[idx].scrollIntoView({ block: 'nearest' }); }
}
function closeList(list) { list.classList.remove('show'); list.innerHTML = ''; }

document.addEventListener('DOMContentLoaded', initLocationAutocomplete);



/* =====================================================
   BOOKING FORM — Inline Fare Calculator
   ===================================================== */
(function(){
  if(typeof L==='undefined')return;
  const RATES={sedan:15,suv:20,innova:21},BATA=250;
  let bfMap=null,bfRoute=null,bfPinA=null,bfPinB=null;
  function initBFMap(){if(bfMap)return;bfMap=L.map('bfMap',{zoomControl:true,scrollWheelZoom:false}).setView([11,78.5],6);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(bfMap);}
  function inr(n){return '\u20B9'+Math.round(n).toLocaleString('en-IN');}
  function fmtDur(m){const h=Math.floor(m/60),r=m%60;return h?`${h}h ${r?r+'m':''}`.trim():`${r}m`;}
  function mkDot(color){return L.divIcon({className:'',iconSize:[13,13],iconAnchor:[6,6],html:`<div style="width:13px;height:13px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.5)"></div>`});}
  async function bfGeocode(q){const res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q+', India')}&limit=1`);const d=await res.json();if(!d.length)throw new Error('Not found: '+q);return{lat:parseFloat(d[0].lat),lon:parseFloat(d[0].lon)};}
  async function bfGetRoute(a,b){const url=`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`;try{const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),8000);const res=await fetch(url,{signal:ctrl.signal});clearTimeout(t);const d=await res.json();if(d.routes&&d.routes.length){const r=d.routes[0];return{km:(r.distance/1000).toFixed(1),min:Math.round(r.duration/60),geo:r.geometry};}}catch(_){}const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lon-a.lon)*Math.PI/180;const h=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;const km=(R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.3).toFixed(1);return{km,min:Math.round(parseFloat(km)/55*60),geo:null};}
  async function calcBFFare(){
    const pickup=document.getElementById('pickupLoc').value.trim(),drop=document.getElementById('dropLoc').value.trim();
    const vehicle=document.getElementById('vehicleType').value.toLowerCase();
    const tripRaw=document.querySelector('input[name="tripType"]:checked');
    const isRT=tripRaw&&tripRaw.value==='Round Trip';
    if(!pickup||!drop){alert('Please enter Pickup and Drop locations first.');return;}
    if(!vehicle||vehicle===''){alert('Please select a vehicle type first.');return;}
    const btn=document.getElementById('bfCalcBtn');btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Calculating...';
    try{
      const[from,to]=await Promise.all([bfGeocode(pickup),bfGeocode(drop)]);
      const route=await bfGetRoute(from,to);
      let vRate=15;if(vehicle.includes('suv'))vRate=20;else if(vehicle.includes('innova'))vRate=21;
      const dist=parseFloat(route.km),actualDist=isRT?dist*2:dist;
      const baseFare=Math.round(actualDist*vRate),total=baseFare+BATA;
      document.getElementById('bfDistance').textContent=actualDist.toFixed(1)+' km';
      document.getElementById('bfRate').textContent=inr(vRate)+'/km';
      document.getElementById('bfBase').textContent=inr(baseFare);
      document.getElementById('bfBata').textContent=inr(BATA);
      document.getElementById('bfTotal').textContent=inr(total);
      document.getElementById('bfFareCard').style.display='block';
      initBFMap();
      if(bfRoute){bfMap.removeLayer(bfRoute);bfRoute=null;}
      if(bfPinA){bfMap.removeLayer(bfPinA);bfPinA=null;}
      if(bfPinB){bfMap.removeLayer(bfPinB);bfPinB=null;}
      bfPinA=L.marker([from.lat,from.lon],{icon:mkDot('#22c55e')}).bindPopup(`<b>Pickup:</b> ${pickup}`).addTo(bfMap);
      bfPinB=L.marker([to.lat,to.lon],{icon:mkDot('#ef4444')}).bindPopup(`<b>Drop:</b> ${drop}`).addTo(bfMap);
      if(route.geo){bfRoute=L.geoJSON(route.geo,{style:{color:'#F5B800',weight:5,opacity:0.85}}).addTo(bfMap);bfMap.fitBounds(bfRoute.getBounds(),{padding:[20,20]});}
      else{bfRoute=L.polyline([[from.lat,from.lon],[to.lat,to.lon]],{color:'#F5B800',weight:4,dashArray:'8 6',opacity:0.7}).addTo(bfMap);bfMap.fitBounds([[from.lat,from.lon],[to.lat,to.lon]],{padding:[30,30]});}
      setTimeout(()=>bfMap.invalidateSize(),150);
    }catch(err){alert('Could not calculate: '+err.message);}
    finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-route"></i> Calculate Distance &amp; Fare';}
  }
  document.addEventListener('DOMContentLoaded',function(){
    const btn=document.getElementById('bfCalcBtn');if(btn)btn.addEventListener('click',calcBFFare);
    const vSel=document.getElementById('vehicleType');if(vSel)vSel.addEventListener('change',function(){const card=document.getElementById('bfFareCard');if(card&&card.style.display!=='none')calcBFFare();});
    document.querySelectorAll('input[name="tripType"]').forEach(r=>{r.addEventListener('change',function(){const card=document.getElementById('bfFareCard');if(card&&card.style.display!=='none')calcBFFare();});});
  });
})();
