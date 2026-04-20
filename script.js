/* ==========================================================================
   COLÉGIO ALMEIDA SANTOS — SCRIPT PRINCIPAL
   ----------------------------------------------------------------------------
   Dependências (carregadas no index.html via CDN):
     · GSAP 3.12.x
     · ScrollTrigger (GSAP)
     · Lenis (smooth scroll)

   Sumário:
     1.  Boot (aguarda GSAP carregar)
     2.  Lenis — smooth scroll integrado ao ScrollTrigger
     3.  Preloader
     4.  Navegação (scroll state + mobile menu)
     5.  Hero — timeline de entrada
     6.  Reveal on scroll (utilitário)
     7.  Parallax (data-parallax="0.15")
     8.  Counters animados
     9.  Segmentos / bento / galeria / depoimentos / FAQ
    10.  WhatsApp flutuante (aparece após scroll)
    11.  Formulário → WhatsApp
    12.  Extras (ano no footer, acessibilidade)
   ========================================================================== */


/* ==========================================================================
   1. BOOT
   ========================================================================== */
(function boot() {
  // Aguarda todos scripts carregarem (GSAP, ScrollTrigger, Lenis chegam via defer)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // Guarda: se GSAP não carregou, ativa fallback sem quebrar o site
    if (typeof gsap === "undefined") {
      console.warn("[AS] GSAP não carregou — ativando fallback.");
      document.querySelectorAll(".reveal, .reveal-stagger").forEach(el => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      hidePreloader();
      bindBasicUI();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Respeita preferência por movimento reduzido
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    initLenis(prefersReduced);
    initPreloader();
    bindBasicUI();
    initHero();
    initReveals(prefersReduced);
    initParallax(prefersReduced);
    initCounters();
    initWhatsAppFloat();
    initFooterYear();
  }
})();


/* ==========================================================================
   2. LENIS — smooth scroll integrado ao ScrollTrigger
   ========================================================================== */
let lenis = null;

function initLenis(prefersReduced) {
  if (prefersReduced || typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false, // evita bugs de scroll no mobile
    wheelMultiplier: 1,
    touchMultiplier: 1.4
  });

  // Sincroniza Lenis com o RAF do GSAP
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Suporte ao <a href="#id"> navegando via Lenis (smooth bonito)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });
}


/* ==========================================================================
   3. PRELOADER
   ========================================================================== */
function initPreloader() {
  const pre = document.getElementById("preloader");
  if (!pre) return;

  // Tempo mínimo de exibição pra não dar flash
  const minTime = 900;
  const start = performance.now();

  const finish = () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minTime - elapsed);
    setTimeout(() => hidePreloader(), wait);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
}

function hidePreloader() {
  const pre = document.getElementById("preloader");
  if (!pre) return;

  if (typeof gsap !== "undefined") {
    gsap.to(pre, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      onComplete: () => pre.remove()
    });
  } else {
    pre.style.opacity = "0";
    setTimeout(() => pre.remove(), 500);
  }
}


/* ==========================================================================
   4. NAVEGAÇÃO — scroll state + mobile menu
   ========================================================================== */
function bindBasicUI() {
  // Header: muda estilo ao rolar
  const header = document.getElementById("site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  const toggle = document.getElementById("nav-toggle");
  const close = document.getElementById("nav-close");
  const menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    });
  }

  if (close && menu) {
    close.addEventListener("click", closeMobileMenu);
  }

  // Fecha ao clicar em link
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });
}

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("nav-toggle");
  if (!menu) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  if (lenis) lenis.start();
}


/* ==========================================================================
   5. HERO — timeline de entrada
   ========================================================================== */
function initHero() {
  const hero = document.querySelector(".hero-section");
  if (!hero) return;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out", duration: 0.9 },
    delay: 0.3 // dá tempo do preloader sair
  });

  tl.fromTo(".hero-eyebrow",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0 }
  )
  .fromTo(".hero-title",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1.1 },
    "-=0.5"
  )
  .fromTo(".hero-sub",
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0 },
    "-=0.6"
  )
  .fromTo(".hero-ctas",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0 },
    "-=0.5"
  )
  .fromTo(".hero-trust",
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0 },
    "-=0.5"
  )
  .fromTo(".hero-media",
    { opacity: 0, y: 40, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2 },
    "-=1"
  )
  .fromTo(".hero-card",
    { opacity: 0, y: 24, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.6)" },
    "-=0.5"
  );
}


/* ==========================================================================
   6. REVEAL ON SCROLL — utilitário para .reveal e .reveal-stagger
   ========================================================================== */
function initReveals(prefersReduced) {
  if (prefersReduced) {
    document.querySelectorAll(".reveal, .reveal-stagger").forEach(el => {
      gsap.set(el, { opacity: 1, y: 0 });
    });
    return;
  }

  // Reveals simples (elemento a elemento)
  gsap.utils.toArray(".reveal").forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Reveals stagger: agrupa elementos próximos do mesmo pai
  const staggerGroups = new Map();
  document.querySelectorAll(".reveal-stagger").forEach(el => {
    const parent = el.parentElement;
    if (!staggerGroups.has(parent)) staggerGroups.set(parent, []);
    staggerGroups.get(parent).push(el);
  });

  staggerGroups.forEach(elements => {
    if (elements.length === 0) return;
    gsap.fromTo(elements,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: elements[0],
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Título de seção: letra por letra (efeito editorial sutil)
  gsap.utils.toArray(".section-title").forEach(title => {
    // Já coberto por .reveal, mas adiciona um toque extra nas ênfases <em>
    const ems = title.querySelectorAll("em");
    if (ems.length === 0) return;
    gsap.fromTo(ems,
      { backgroundSize: "0% 100%" },
      {
        backgroundSize: "100% 100%",
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: title, start: "top 80%" }
      }
    );
  });
}


/* ==========================================================================
   7. PARALLAX — elementos com data-parallax="0.15"
   ========================================================================== */
function initParallax(prefersReduced) {
  if (prefersReduced) return;

  gsap.utils.toArray("[data-parallax]").forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    const section = el.closest("section") || el.parentElement;

    gsap.to(el, {
      y: () => window.innerHeight * speed * -1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    });
  });
}


/* ==========================================================================
   8. COUNTERS — animação de números
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || "";
    if (isNaN(target)) return;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.innerHTML = Math.round(obj.val) + (suffix ? `<span>${suffix}</span>` : "");
          }
        });
      }
    });
  });
}


/* ==========================================================================
   9. WHATSAPP FLUTUANTE
   ========================================================================== */
function initWhatsAppFloat() {
  const fab = document.getElementById("wa-float");
  if (!fab) return;

  const toggleVisibility = () => {
    fab.classList.toggle("visible", window.scrollY > 400);
  };
  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  // Pequeno "pulo" a cada 20s pra chamar atenção sem ser invasivo
  if (typeof gsap !== "undefined") {
    setInterval(() => {
      if (!fab.classList.contains("visible")) return;
      gsap.fromTo(fab,
        { y: 0 },
        {
          y: -8,
          duration: 0.25,
          yoyo: true,
          repeat: 3,
          ease: "power2.inOut"
        }
      );
    }, 20000);
  }
}


/* ==========================================================================
   10. FORMULÁRIO → WHATSAPP
   ----------------------------------------------------------------------------
   Em vez de e-mail, o form monta uma mensagem WhatsApp pré-preenchida.
   Quando você tiver back-end, troca por fetch/POST.
   ========================================================================== */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const nome = form.nome.value.trim();
  const telefone = form.telefone.value.trim();
  const segmento = form.segmento.value;
  const horario = form.horario.value;

  const segMap = {
    f1: "Fundamental I (1º ao 5º ano)",
    f2: "Fundamental II (6º ao 9º ano)",
    em: "Ensino Médio",
    duvida: "apenas uma dúvida"
  };

  const horarioMap = {
    manha: "pela manhã",
    tarde: "à tarde",
    qualquer: "em qualquer horário"
  };

  const msg = `Olá! Tenho interesse em conhecer o Colégio Almeida Santos.%0A%0A` +
              `*Nome:* ${nome}%0A` +
              `*WhatsApp:* ${telefone}%0A` +
              `*Interesse:* ${segMap[segmento] || segmento}%0A` +
              `*Melhor horário para retorno:* ${horarioMap[horario] || horario}`;

  const url = `https://wa.me/5522988090739?text=${msg}`;
  window.open(url, "_blank", "noopener,noreferrer");

  return false;
}

// Expõe pro onsubmit inline do HTML
window.handleFormSubmit = handleFormSubmit;


/* ==========================================================================
   11. FOOTER — ano dinâmico
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}


/* ==========================================================================
   12. ACESSIBILIDADE — fecha menu no Esc
   ========================================================================== */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const menu = document.getElementById("mobile-menu");
    if (menu && menu.classList.contains("open")) closeMobileMenu();
  }
});


/* ==========================================================================
   FIM DO SCRIPT
   ========================================================================== */
