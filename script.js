// Safe Volts — interactions
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");

  // Sticky header shadow on scroll
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
  });

  // Close mobile menu after clicking a link
  document.querySelectorAll(".nav-list a, .header-cta a").forEach((a) => {
    a.addEventListener("click", () => {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal-on-scroll
  const revealTargets = document.querySelectorAll(
    ".section-head, .service, .why-copy, .stats, .step, .contact-info, .contact-form, .cta-inner"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  // Animated counters
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("el-GR");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && !reduced) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.count));
  }

  // Contact form (client-side validation + demo submit)
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.className = "form-note";
      note.textContent = "";

      const required = ["name", "phone"];
      let firstInvalid = null;
      let valid = true;

      required.forEach((id) => {
        const field = form.elements[id];
        const ok = field.value.trim().length > 1;
        field.classList.toggle("invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
        if (!ok) valid = false;
      });

      const email = form.elements["email"];
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("invalid");
        if (!firstInvalid) firstInvalid = email;
        valid = false;
      } else {
        email.classList.remove("invalid");
      }

      if (!valid) {
        note.className = "form-note error";
        note.textContent = "Συμπληρώστε σωστά το όνομα και το τηλέφωνό σας.";
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Static site (no backend): open the visitor's email app pre-addressed to us.
      const recipient = "safevolts.gr@gmail.com";
      const data = {
        name: form.elements["name"].value.trim(),
        phone: form.elements["phone"].value.trim(),
        email: email.value.trim(),
        service: form.elements["service"].value.trim(),
        message: form.elements["message"].value.trim(),
      };

      const subject = "Νέο αίτημα από την ιστοσελίδα" + (data.service ? " – " + data.service : "");
      const body =
        "Ονοματεπώνυμο: " + data.name + "\n" +
        "Τηλέφωνο: " + data.phone + "\n" +
        "Email: " + (data.email || "—") + "\n" +
        "Υπηρεσία: " + (data.service || "—") + "\n\n" +
        "Μήνυμα:\n" + (data.message || "—");

      const mailto =
        "mailto:" + recipient +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      note.className = "form-note success";
      note.textContent = "Ανοίγει η εφαρμογή email σας για να ολοκληρώσετε την αποστολή. Αν δεν ανοίξει, καλέστε μας στο 210 444 1581.";
      window.location.href = mailto;
    });

    // Clear invalid state while typing
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => el.classList.remove("invalid"));
    });
  }
})();
