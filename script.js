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
   Variável compartilhada (declarada ANTES da IIFE boot pra evitar TDZ)
   ========================================================================== */
let lenis = null;


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
    window.__gsapReady = true; // sinaliza pra rede de segurança inline no HTML

    // Respeita preferência por movimento reduzido
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    initLenis(prefersReduced);
    initPreloader();
    bindBasicUI();
    initHero();
    initReveals(prefersReduced);
    initParallax(prefersReduced);
    initHeroTextParallax(prefersReduced);
    initMagneticButtons();
    initCounters();
    initWhatsAppFloat();
    initFooterYear();

    // Força o ticker do GSAP a acordar (caso tenha entrado em sleep mode
    // após o setup do Lenis — sintoma: nenhuma animação avança).
    gsap.ticker.wake();
  }
})();


/* ==========================================================================
   2. LENIS — smooth scroll integrado ao ScrollTrigger
   (variável 'lenis' declarada no topo do arquivo pra evitar TDZ na IIFE boot)
   ========================================================================== */
function initLenis(prefersReduced) {
  if (prefersReduced || typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.4
  });

  // Sincroniza scroll do Lenis com update do ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // RAF NATIVO pro Lenis (desacoplado do ticker do GSAP).
  // Antes eu fazia gsap.ticker.add(t => lenis.raf(t*1000)) + lagSmoothing(0),
  // mas essa combinação pode deixar o ticker do GSAP em sleep mode e nenhuma
  // animação avança. Com RAF nativo o Lenis roda suavemente sem mexer no GSAP.
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

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

  // Esconde após 900ms — NÃO dependemos do evento 'load' porque
  // imagens externas (Unsplash, etc.) podem travar e o preloader nunca sumir.
  setTimeout(() => hidePreloader(), 900);
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
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: {
          trigger: elements[0],
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Efeito de destaque em <em> (linha dourada translúcida cresce atrás do texto)
  // O <em> ganha a classe 'revealed' que dispara a transition CSS de background-size.
  const highlightEms = document.querySelectorAll(".section-title em, .hero-title em, .visit-title em, .contact-title em");
  highlightEms.forEach(em => {
    ScrollTrigger.create({
      trigger: em,
      start: "top 85%",
      once: true,
      onEnter: () => em.classList.add("revealed")
    });
  });
}


/* ==========================================================================
   7.b. MAGNETIC BUTTONS — CTAs primários "puxam" sutilmente o cursor
   ========================================================================== */
function initMagneticButtons() {
  // Não aplica em mobile/touch (pointer:coarse)
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const targets = document.querySelectorAll(".btn-primary.btn-lg, .btn-whatsapp.btn-lg");
  targets.forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, {
        x: mx * 0.18,
        y: my * 0.25,
        duration: 0.4,
        ease: "power3.out"
      });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    });
  });
}


/* ==========================================================================
   7.c. HERO TEXT PARALLAX — texto sobe mais devagar que o scroll
   ========================================================================== */
function initHeroTextParallax(prefersReduced) {
  if (prefersReduced) return;
  const textCol = document.querySelector(".hero-section .lg\\:col-span-7");
  if (!textCol) return;
  gsap.to(textCol, {
    y: -60,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: 1.2
    }
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
          duration: 2.1,
          ease: "expo.out",
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
   11.a. READING PROGRESS BAR — só em páginas de post
   ========================================================================== */
(function initReadingProgress() {
  if (typeof document === "undefined") return;
  function boot() {
    const article = document.querySelector(".post-article");
    if (!article) return;

    // Cria a barra no topo se ainda não existir
    let bar = document.getElementById("read-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "read-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
    }

    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const read = Math.min(total, Math.max(0, -rect.top));
      const pct = total > 0 ? (read / total) * 100 : 0;
      bar.style.transform = `scaleX(${pct / 100})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ==========================================================================
   11.c. SCROLL-TO-TOP FLUTUANTE — aparece após rolar >800px
   ========================================================================== */
(function initScrollToTop() {
  if (typeof document === "undefined") return;
  function boot() {
    let btn = document.getElementById("scroll-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "scroll-top";
      btn.setAttribute("aria-label", "Voltar ao topo");
      btn.type = "button";
      btn.innerHTML = '<span class="material-symbols-rounded">arrow_upward</span>';
      document.body.appendChild(btn);
    }
    const onScroll = () => {
      btn.classList.toggle("visible", window.scrollY > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ==========================================================================
   11.d. SHARE BUTTONS em posts — WhatsApp e copiar link
   ========================================================================== */
(function initShareButtons() {
  if (typeof document === "undefined") return;
  function boot() {
    const slots = document.querySelectorAll(".post-share");
    if (slots.length === 0) return;
    slots.forEach(slot => {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.querySelector("h1")?.textContent?.trim().replace(/\s+/g, " ") || "Colégio Almeida Santos");
      slot.innerHTML = `
        <span class="post-share-label">Compartilhar:</span>
        <a class="post-share-btn post-share-wa" href="https://wa.me/?text=${title}%20—%20${url}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
          <span class="material-symbols-rounded">chat</span>
          WhatsApp
        </a>
        <button class="post-share-btn post-share-copy" type="button" aria-label="Copiar link">
          <span class="material-symbols-rounded">link</span>
          <span class="copy-label">Copiar link</span>
        </button>`;
      const copyBtn = slot.querySelector(".post-share-copy");
      const copyLabel = slot.querySelector(".copy-label");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            copyLabel.textContent = "Copiado!";
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyLabel.textContent = "Copiar link";
              copyBtn.classList.remove("copied");
            }, 2000);
          } catch (e) { /* ignora */ }
        });
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ==========================================================================
   11.e. BLOG CATEGORY FILTER — filtra cards da listagem por tag
   ========================================================================== */
(function initBlogFilter() {
  if (typeof document === "undefined") return;
  function boot() {
    const container = document.querySelector(".blog-filter");
    const cards = document.querySelectorAll(".blog-grid .blog-card");
    if (!container || cards.length === 0) return;

    const buttons = container.querySelectorAll(".blog-filter-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        buttons.forEach(b => b.classList.toggle("active", b === btn));
        cards.forEach(card => {
          const tag = card.querySelector(".blog-card-tag")?.textContent?.trim();
          const show = filter === "all" || tag === filter;
          card.style.display = show ? "" : "none";
          card.style.opacity = show ? "1" : "0";
        });
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ==========================================================================
   11.b. COOKIE / LGPD BANNER
   ========================================================================== */
(function initCookieBanner() {
  if (typeof document === "undefined") return;

  function boot() {
    const banner = document.getElementById("cookie-banner");
    const accept = document.getElementById("cookie-accept");
    if (!banner || !accept) return;

    // Se já aceitou, não mostra
    try {
      if (localStorage.getItem("as-cookie-consent") === "1") return;
    } catch (e) { /* privacy mode: segue sem storage */ }

    banner.hidden = false;
    setTimeout(() => banner.classList.add("visible"), 800);

    accept.addEventListener("click", () => {
      banner.classList.remove("visible");
      try { localStorage.setItem("as-cookie-consent", "1"); } catch (e) {}
      setTimeout(() => banner.remove(), 500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();


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
   13. VISIBILITY — quando a aba volta ao foreground, acorda o GSAP e refaz
        os cálculos do ScrollTrigger. Browsers pausam RAF em abas ocultas.
   ========================================================================== */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && typeof gsap !== "undefined") {
    gsap.ticker.wake();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }
});


/* ==========================================================================
   FIM DO SCRIPT
   ========================================================================== */
