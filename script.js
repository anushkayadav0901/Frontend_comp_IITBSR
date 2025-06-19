// Loader (Lusion-style breaking animation)
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const barFill = document.getElementById('loaderBarFill');
  const percent = document.getElementById('loaderPercentage');
  const lShape = document.getElementById('loaderLShape');
  const body = document.body;

  if (loader && barFill && percent && lShape) {
    body.classList.add('loading');
    let progress = 0;
    const duration = 2000; // ms
    const interval = 18;
    const step = 100 / (duration / interval);
    function animateLoader() {
      const loaderInterval = setInterval(() => {
        progress += step;
        if (progress > 100) progress = 100;
        percent.textContent = Math.floor(progress) + '%';
        barFill.style.width = progress + '%';
        if (progress >= 100) {
          clearInterval(loaderInterval);
          percent.textContent = '100%';
          barFill.style.width = '100%';
          setTimeout(() => {
            // Hide bar, show L shape
            barFill.style.opacity = 0;
            percent.style.opacity = 0;
            lShape.classList.add('show');
          }, 350);
          setTimeout(() => {
            // Animate L shape toward screen (zoom in big)
            lShape.style.transform = 'translate(-50%, -50%) scale(10)';
          }, 950);
          setTimeout(() => {
            loader.classList.add('hide');
            setTimeout(() => {
              body.classList.remove('loading');
            }, 700);
          }, 1700);
        }
      }, interval);
    }
    animateLoader();
  }

  // GSAP Animations for sections
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-content', { opacity: 0, y: 60, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.stats-section', { opacity: 0, y: 60, duration: 1, delay: 0.5, ease: 'power3.out', scrollTrigger: { trigger: '.stats-section', start: 'top 80%' } });
    gsap.from('.parallax-content', { opacity: 0, y: 60, duration: 1, delay: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.parallax-section', start: 'top 80%' } });
    gsap.from('.about-us-section', { opacity: 0, y: 60, duration: 1, delay: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about-us-section', start: 'top 80%' } });
    gsap.utils.toArray('.hostel-content-block').forEach((block, i) => {
      gsap.to(block, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2 + i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 85%',
        }
      });
    });
  }
});

// Light/Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');

function setTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '🌞';
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }
}

// Load theme from local storage
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'light' ? 'light' : 'dark');

// Toggle button listener
themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('light-mode')) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
});

// Floating shapes effect in hero section
const hero = document.querySelector('.hero');
const shapesContainer = document.querySelector('.floating-shapes');

// Example hostel-related shapes (can be replaced with SVGs)
const SHAPES = ['🛏️', '🔑', '📚', '🪑', '🧑‍🎓', '🏓', '🍽️', '💡'];

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function createFloatingShape(x, y) {
  const el = document.createElement('div');
  el.className = 'floating-shape';
  el.textContent = randomShape();
  // Randomize size and rotation
  const size = 1.2 + Math.random() * 1.2;
  const rot = Math.random() * 360;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.transform = `scale(${size}) rotate(${rot}deg)`;
  shapesContainer.appendChild(el);

  // Animate: move and fade out
  setTimeout(() => {
    const dx = (Math.random() - 0.5) * 120;
    const dy = -60 - Math.random() * 60;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${size * 1.2}) rotate(${rot + 40}deg)`;
    el.style.opacity = '0';
  }, 20);
  setTimeout(() => {
    el.remove();
  }, 900);
}

let lastShapeTime = 0;
hero.addEventListener('mousemove', e => {
  // Limit shape creation rate
  const now = Date.now();
  if (now - lastShapeTime > 40) {
    const rect = hero.getBoundingClientRect();
    createFloatingShape(e.clientX - rect.left, e.clientY - rect.top);
    lastShapeTime = now;
  }
});

// Hostel Stats Chart.js with filters and download
window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('hostelStatsChart');
  if (!ctx) return;

  // Sample data
  const allData = [
    { name: 'Hostel A', type: 'boys', status: 'occupied', students: 320 },
    { name: 'Hostel B', type: 'girls', status: 'occupied', students: 280 },
    { name: 'Hostel C', type: 'boys', status: 'available', students: 350 },
    { name: 'Hostel D', type: 'girls', status: 'available', students: 210 },
    { name: 'Sports Complex', type: 'facility', status: 'occupied', count: 3 },
    { name: 'Library', type: 'facility', status: 'available', count: 1 },
  ];

  // Color theme
  const colorBoys = '#a05c5c';
  const colorGirls = '#e6b3b3';
  const colorFacility = '#bdbdbd';

  // Filtering logic
  let filterType = 'all';
  let filterStatus = 'all';

  function getFilteredData() {
    return allData.filter(item => {
      const typeMatch = filterType === 'all' || item.type === filterType;
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }

  function getChartData() {
    const filtered = getFilteredData();
    const labels = filtered.map(item => item.name);
    const boys = filtered.map(item => item.type === 'boys' ? item.students : 0);
    const girls = filtered.map(item => item.type === 'girls' ? item.students : 0);
    const facility = filtered.map(item => item.type === 'facility' ? (item.count || 0) : 0);
    return { labels, boys, girls, facility };
  }

  // Chart.js config
  let chart;
  function renderChart() {
    const { labels, boys, girls, facility } = getChartData();
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Boys Hostel',
            data: boys,
            backgroundColor: colorBoys,
            borderRadius: 10,
            barPercentage: 0.7,
            categoryPercentage: 0.6,
          },
          {
            label: 'Girls Hostel',
            data: girls,
            backgroundColor: colorGirls,
            borderRadius: 10,
            barPercentage: 0.7,
            categoryPercentage: 0.6,
          },
          {
            label: 'Facility',
            data: facility,
            backgroundColor: colorFacility,
            borderRadius: 10,
            barPercentage: 0.7,
            categoryPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#7a4444',
            bodyColor: '#2d2323',
            borderColor: '#eee',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#2d2323', font: { size: 15, family: 'Share Tech Mono, monospace' } }
          },
          y: {
            grid: { color: '#e0e0e0' },
            ticks: { color: '#2d2323', font: { size: 15, family: 'Share Tech Mono, monospace' } },
            beginAtZero: true
          }
        }
      }
    });
  }
  renderChart();

  // Filter button logic
  document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterType = btn.getAttribute('data-type');
      renderChart();
    });
  });
  document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterStatus = btn.getAttribute('data-status');
      renderChart();
    });
  });

  // Download chart as image
  document.getElementById('downloadChart').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = chart.toBase64Image();
    link.download = 'hostel-stats.png';
    link.click();
  });
});

// 3D background for hero section using three.js
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero3d-bg');
  if (!canvas) return;
  const hero = document.querySelector('.hero');

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe52d27); // fallback red

  // Camera
  const camera = new THREE.PerspectiveCamera(60, hero.offsetWidth / hero.offsetHeight, 0.1, 1000);
  camera.position.z = 16;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0xe52d27, 1);
  renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Create a group for all shapes
  const group = new THREE.Group();
  scene.add(group);

  // Create floating shapes
  const shapes = [];
  const shapeColors = [0x1fc8a7, 0x2d6cdf, 0xffffff, 0x181818, 0x3a3a3a];
  for (let i = 0; i < 10; i++) {
    let geometry;
    if (i % 3 === 0) geometry = new THREE.SphereGeometry(1.1 + Math.random(), 32, 32);
    else if (i % 3 === 1) geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    else geometry = new THREE.TorusGeometry(0.7, 0.28, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: shapeColors[i % shapeColors.length], roughness: 0.4, metalness: 0.2 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 12;
    mesh.position.y = (Math.random() - 0.5) * 7;
    mesh.position.z = (Math.random() - 0.5) * 6;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    group.add(mesh);
    shapes.push({ mesh, speed: 0.003 + Math.random() * 0.004, rot: Math.random() * 0.01 });
  }

  // Mouse interaction
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Map to [-0.5, 0.5]
    targetRotY = (x - 0.5) * 0.7; // left/right
    targetRotX = (y - 0.5) * 0.7; // up/down
  });

  // Animation loop
  function animate() {
    // Smoothly interpolate rotation
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;
    group.rotation.x = currentRotX;
    group.rotation.y = currentRotY;
    shapes.forEach((obj, i) => {
      obj.mesh.rotation.x += obj.speed;
      obj.mesh.rotation.y += obj.rot;
      obj.mesh.position.y += Math.sin(Date.now() * 0.0003 + i) * 0.003;
      obj.mesh.position.x += Math.cos(Date.now() * 0.0002 + i) * 0.002;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Responsive resize
  function resize3D() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize3D);
  resize3D();
});

// Parallax effect for parallax-section
window.addEventListener('scroll', () => {
  const section = document.querySelector('.parallax-section');
  if (!section) return;
  const layers = section.querySelectorAll('.parallax-layer');
  const sectionTop = section.offsetTop;
  const scrollY = window.scrollY || window.pageYOffset;
  // Animate based on scroll position relative to section
  const relScroll = scrollY - sectionTop;
  layers.forEach((layer, i) => {
    const speed = (i + 1) * 35; // more dramatic parallax
    layer.style.transform = `translateY(${relScroll * speed * 0.01}px)`;
  });
});

// Ripple cursor effect
const ripple = document.getElementById('ripple-cursor');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let rippleX = mouseX, rippleY = mouseY;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  ripple.style.opacity = 0.7;
});
window.addEventListener('mousedown', () => {
  ripple.style.transform = 'translate(-50%, -50%) scale(1.4)';
  ripple.style.opacity = 1;
});
window.addEventListener('mouseup', () => {
  ripple.style.transform = 'translate(-50%, -50%) scale(1)';
  ripple.style.opacity = 0.7;
});

function animateRipple() {
  rippleX += (mouseX - rippleX) * 0.18;
  rippleY += (mouseY - rippleY) * 0.18;
  ripple.style.left = rippleX + 'px';
  ripple.style.top = rippleY + 'px';
  requestAnimationFrame(animateRipple);
}
animateRipple();

// Battery fill navbar with auto navigation
const navTabs = document.querySelectorAll('.nav-tab');
let activeIndex = 0;
let navInterval = null;
let fillTimeout = null;

// Detect current page and set active tab
function getCurrentPageIndex() {
  const path = window.location.pathname.split('/').pop();
  for (let i = 0; i < navTabs.length; i++) {
    if (navTabs[i].getAttribute('data-href') === path) return i;
  }
  return 0;
}

function setActiveTab(index, auto = true) {
  navTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.querySelector('.nav-fill').style.width = i === index ? '100%' : '0%';
  });
  activeIndex = index;
  if (fillTimeout) clearTimeout(fillTimeout);
  if (auto) {
    fillTimeout = setTimeout(() => {
      let next = (activeIndex + 1) % navTabs.length;
      window.location.href = navTabs[next].getAttribute('data-href');
    }, 2500); // 2.5s fill duration
  }
}

navTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    setActiveTab(i, false);
    window.location.href = tab.getAttribute('data-href');
  });
});

window.addEventListener('DOMContentLoaded', () => {
  setActiveTab(getCurrentPageIndex());
});

// Carousel Switch Effect
window.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let current = 0;

  function updateCarousel() {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    track.style.transform = `translateX(-${current * slides[0].offsetWidth}px)`;
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    updateCarousel();
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    updateCarousel();
  });

  // Optional: swipe support for mobile
  let startX = null;
  track && track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });
  track && track.addEventListener('touchend', e => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    if (endX - startX > 50) prevBtn.click();
    else if (startX - endX > 50) nextBtn.click();
    startX = null;
  });

  updateCarousel();
});
