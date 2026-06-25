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

  const WEB3FORMS_KEY = "0e4d9313-0023-40dc-b379-2c563d29b112";

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
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

      const recipient = "safevolts.gr@gmail.com";
      const data = {
        name: form.elements["name"].value.trim(),
        phone: form.elements["phone"].value.trim(),
        email: email.value.trim(),
        service: form.elements["service"].value.trim(),
        message: form.elements["message"].value.trim(),
      };

      // Honeypot: if a bot filled the hidden field, silently "succeed" and stop.
      if (form.elements["botcheck"] && form.elements["botcheck"].checked) {
        note.className = "form-note success";
        note.textContent = "Ευχαριστούμε!";
        form.reset();
        return;
      }

      const subject = "Νέο αίτημα από την ιστοσελίδα" + (data.service ? " – " + data.service : "");

      // Fallback: open the visitor's email app pre-addressed to us.
      const openMailto = () => {
        const body =
          "Ονοματεπώνυμο: " + data.name + "\n" +
          "Τηλέφωνο: " + data.phone + "\n" +
          "Email: " + (data.email || "—") + "\n" +
          "Υπηρεσία: " + (data.service || "—") + "\n\n" +
          "Μήνυμα:\n" + (data.message || "—");
        window.location.href =
          "mailto:" + recipient +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
      };

      // Primary: send straight to the inbox via Web3Forms (no email app needed).
      setBusy(true);
      note.className = "form-note";
      note.textContent = "Αποστολή…";

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: subject,
            from_name: "Safe Volts — Ιστοσελίδα",
            name: data.name,
            "Ονοματεπώνυμο": data.name,
            "Τηλέφωνο": data.phone,
            email: data.email || recipient,
            replyto: data.email || "",
            "Υπηρεσία": data.service || "—",
            message: data.message || "—",
          }),
        });
        const out = await res.json().catch(() => ({}));

        if (res.ok && out.success) {
          note.className = "form-note success";
          note.textContent = "Ευχαριστούμε! Λάβαμε το αίτημά σας και θα επικοινωνήσουμε σύντομα.";
          form.reset();
        } else {
          throw new Error(out.message || "send failed");
        }
      } catch (err) {
        note.className = "form-note error";
        note.textContent = "Παρουσιάστηκε πρόβλημα. Ανοίγουμε την εφαρμογή email σας…";
        openMailto();
      } finally {
        setBusy(false);
      }
    });

    function setBusy(busy) {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.dataset.label = submitBtn.dataset.label || submitBtn.textContent;
      submitBtn.textContent = busy ? "Αποστολή…" : submitBtn.dataset.label;
    }

    // Clear invalid state while typing
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => el.classList.remove("invalid"));
    });
  }
})();
