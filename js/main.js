/**
 * ============================================================================
 * SHASHWAT PORTFOLIO - CORE JAVASCRIPT ENGINE
 * Pure Vanilla ES6+ • Zero External Dependencies • 60 FPS Performance
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Utility & Motion Preference
  // --------------------------------------------------------------------------
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const isFinePointer = () => {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  // --------------------------------------------------------------------------
  // 1. Dark / Light Theme System
  // --------------------------------------------------------------------------
  const initThemeSystem = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // Read stored preference or detect OS preference
    const savedTheme = localStorage.getItem('shashwat-theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

    const applyTheme = (theme, animate = false) => {
      if (animate) {
        htmlEl.classList.add('theme-transition');
      }

      htmlEl.setAttribute('data-theme', theme);
      localStorage.setItem('shashwat-theme', theme);

      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0b10' : '#f8fafc');
      }

      if (animate) {
        window.setTimeout(() => {
          htmlEl.classList.remove('theme-transition');
        }, 400);
      }
    };

    applyTheme(initialTheme, false);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
        showToast(`Switched to ${nextTheme} theme`, 'info');
      });
    }

    // Expose switch function for terminal
    window.togglePortfolioTheme = () => {
      const current = htmlEl.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      return next;
    };
  };

  // --------------------------------------------------------------------------
  // 2. Smooth Typing and Deleting Subtitle Animation
  // --------------------------------------------------------------------------
  const initTypewriter = () => {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const words = ['B.Tech Undergrad', 'Problem Solver', 'Python & Web Builder', 'Curious Developer'];

    if (prefersReducedMotion()) {
      el.textContent = '2nd Year B.Tech Undergrad';
      return;
    }

    let wordIdx = 0;
    let charIdx = words[0].length;
    let isDeleting = true;
    let typingSpeed = 1800;

    const tick = () => {
      const currentWord = words[wordIdx];

      if (isDeleting) {
        charIdx--;
        el.textContent = currentWord.substring(0, charIdx);
        typingSpeed = 45;
      } else {
        charIdx++;
        el.textContent = currentWord.substring(0, charIdx);
        // Add subtle organic rhythm variation
        typingSpeed = 75 + Math.floor(Math.random() * 25);
      }

      // Check state transitions
      if (!isDeleting && charIdx === currentWord.length) {
        // Finished typing word; pause before deleting
        isDeleting = true;
        typingSpeed = 1900;
      } else if (isDeleting && charIdx === 0) {
        // Finished deleting word; pause before typing next
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        typingSpeed = 450;
      }

      window.setTimeout(tick, typingSpeed);
    };

    // Hold the pre-rendered initial word for 1.8 seconds before smoothly deleting
    window.setTimeout(tick, typingSpeed);
  };

  // --------------------------------------------------------------------------
  // 3. Lightweight Interactive Particle Network Canvas
  // --------------------------------------------------------------------------
  const initHeroParticles = () => {
    const canvas = document.getElementById('hero-particles');
    const heroSection = document.getElementById('hero');
    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = null;
    let isVisible = true;

    // Mouse coordinates relative to hero canvas
    const mouse = {
      x: null,
      y: null,
      radius: 140
    };

    const particles = [];

    // Particle class
    class Particle {
      constructor(w, h) {
        this.reset(w, h);
      }

      reset(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Subtle floating velocity
        const speed = 0.45;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = Math.random() * 1.5 + 1.0;
        this.baseAlpha = Math.random() * 0.4 + 0.3;
      }

      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries gently
        if (this.x < 0) this.x = w;
        else if (this.x > w) this.x = 0;

        if (this.y < 0) this.y = h;
        else if (this.y > h) this.y = 0;

        // Interactive mouse interaction (gentle attraction / repulsion)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 0.8;
            this.x -= (dx / dist) * force;
            this.y -= (dy / dist) * force;
          }
        }
      }

      draw(c, isDark) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = isDark
          ? `rgba(167, 139, 250, ${this.baseAlpha})`
          : `rgba(124, 58, 237, ${this.baseAlpha * 0.75})`;
        c.fill();
      }
    }

    const resizeCanvas = () => {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Determine optimal particle density
      const targetCount = width < 768 ? 26 : Math.min(Math.floor((width * height) / 16000), 55);

      particles.length = 0;
      for (let i = 0; i < targetCount; i++) {
        particles.push(new Particle(width, height));
      }
    };

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    }, { passive: true });

    // Track mouse on hero container
    heroSection.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    heroSection.addEventListener('pointerleave', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    // Animation Loop
    const maxDistance = 115;

    const render = () => {
      if (!isVisible) return;

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, width, height);

      // Update & draw particles
      const count = particles.length;
      for (let i = 0; i < count; i++) {
        particles[i].update(width, height);
        particles[i].draw(ctx, isDark);
      }

      // Draw proximity connecting network lines
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.22 : 0.12);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(139, 92, 246, ${alpha})`
              : `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw connections to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouse.radius * mouse.radius) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / mouse.radius) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isDark
              ? `rgba(6, 182, 212, ${alpha})`
              : `rgba(8, 145, 178, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // If user prefers reduced motion, draw once and don't loop
    if (prefersReducedMotion()) {
      resizeCanvas();
      render();
      return;
    }

    // Pause canvas rendering when hero is not visible in viewport
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animationFrameId) {
            render();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    heroObserver.observe(heroSection);
    resizeCanvas();
    render();
  };

  // --------------------------------------------------------------------------
  // 4. Subtle 3D Tilt and Dynamic Pointer Glow on Project Cards
  // --------------------------------------------------------------------------
  const initProjectCardTilt = () => {
    if (prefersReducedMotion() || !isFinePointer()) return;

    const cards = document.querySelectorAll('.project-card[data-tilt]');

    cards.forEach(card => {
      let bounds = null;

      const handlePointerEnter = () => {
        bounds = card.getBoundingClientRect();
      };

      const handlePointerMove = (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();

        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        // Relative coordinates for radial glow
        const xPercent = (x / bounds.width) * 100;
        const yPercent = (y / bounds.height) * 100;
        card.style.setProperty('--mouse-x', `${xPercent}%`);
        card.style.setProperty('--mouse-y', `${yPercent}%`);

        // Calculate subtle 3D tilt angles (max ~6.5 degrees)
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const tiltX = -((y - centerY) / centerY) * 6.5;
        const tiltY = ((x - centerX) / centerX) * 6.5;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      };

      const handlePointerLeave = () => {
        bounds = null;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      };

      card.addEventListener('pointerenter', handlePointerEnter);
      card.addEventListener('pointermove', handlePointerMove);
      card.addEventListener('pointerleave', handlePointerLeave);
    });
  };

  // --------------------------------------------------------------------------
  // 5. Scroll-Triggered Section Reveals & Staggered Entrances
  // --------------------------------------------------------------------------
  const initScrollReveals = () => {
    const revealElements = document.querySelectorAll('.reveal');

    // Index staggered items inside stagger groups
    document.querySelectorAll('.stagger-group').forEach(group => {
      const items = group.querySelectorAll('.stagger-item');
      items.forEach((item, index) => {
        item.style.setProperty('--stagger-index', index);
      });
    });

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  };

  // --------------------------------------------------------------------------
  // 6. Animated Achievement & Metric Counters
  // --------------------------------------------------------------------------
  const initStatCounters = () => {
    const statElements = document.querySelectorAll('.stat-number');
    if (!statElements.length) return;

    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

      if (prefersReducedMotion()) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      const duration = 1600;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic curve: 1 - (1 - progress)^3
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeProgress * target;

        el.textContent = currentVal.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if (!('IntersectionObserver' in window)) {
      statElements.forEach(el => animateCounter(el));
      return;
    }

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    statElements.forEach(el => statsObserver.observe(el));
  };

  // --------------------------------------------------------------------------
  // 7. Interactive Terminal Widget
  // --------------------------------------------------------------------------
  const initTerminal = () => {
    const terminalWindow = document.getElementById('terminal-window');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const runBtn = document.getElementById('terminal-run-btn');
    const quickChips = document.querySelectorAll('.quick-chip');

    if (!terminalWindow || !terminalOutput || !terminalInput) return;

    // Command History
    const commandHistory = [];
    let historyIdx = -1;

    // Focus input on terminal click
    terminalWindow.addEventListener('click', (e) => {
      // Avoid stealing selection if user highlights text
      if (window.getSelection().toString().length === 0) {
        terminalInput.focus();
      }
    });

    const scrollToBottom = () => {
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const appendLine = (htmlContent, extraClass = '') => {
      const line = document.createElement('div');
      line.className = `term-line ${extraClass}`.trim();
      line.innerHTML = htmlContent;
      terminalOutput.appendChild(line);
      scrollToBottom();
    };

    const commands = {
      help: () => {
        return `
          <div class="term-tag">Available Terminal Commands:</div>
          <div class="term-table-row"><span class="term-table-key">about</span><span class="term-table-val">Overview of engineering philosophy & profile</span></div>
          <div class="term-table-row"><span class="term-table-key">skills</span><span class="term-table-val">List technical capabilities across all stacks</span></div>
          <div class="term-table-row"><span class="term-table-key">projects</span><span class="term-table-val">Inspect featured engineering projects</span></div>
          <div class="term-table-row"><span class="term-table-key">contact</span><span class="term-table-val">Get direct channels, email & socials</span></div>
          <div class="term-table-row"><span class="term-table-key">theme</span><span class="term-table-val">Toggle between light and dark themes</span></div>
          <div class="term-table-row"><span class="term-table-key">whoami</span><span class="term-table-val">Display current visitor session details</span></div>
          <div class="term-table-row"><span class="term-table-key">date</span><span class="term-table-val">Show system timestamp and status</span></div>
          <div class="term-table-row"><span class="term-table-key">clear</span><span class="term-table-val">Wipe the terminal screen buffer</span></div>
        `;
      },

      about: () => {
        return `
          <div class="term-tag">// Shashwat Misra — 2nd Year B.Tech Undergrad • Cisco Certified</div>
          <p>Undergraduate engineering student with Cisco Certified credentials in computer networks. Passionate about practical software development, IoT systems, and problem solving. Actively building projects with Python, C++, HTML/CSS, JavaScript, and MongoDB. Open to 2027 internships.</p>
          <p class="term-dim">Contact: shashwatmisra11@gmail.com • Phone: +91 9794119772</p>
        `;
      },

      skills: () => {
        return `
          <div class="term-tag">// Current Skills & Technologies:</div>
          <div><span class="term-cmd-highlight">Languages:</span> Python, C++, C, JavaScript (ES6+), HTML5, CSS3</div>
          <div><span class="term-cmd-highlight">Database:</span> MongoDB (NoSQL collections & CRUD)</div>
          <div><span class="term-cmd-highlight">Certifications:</span> Cisco Certified (Networking, Routing & Protocols)</div>
          <div><span class="term-cmd-highlight">Tools & Ops:</span> Git, GitHub, Deployment (Vercel, Netlify, Render), Linux</div>
        `;
      },

      projects: () => {
        return `
          <div class="term-tag">// My Projects:</div>
          <div>[1] <span class="term-cmd-highlight">Smart Gas Leakage Detector</span> — 2nd-year IoT mini project using MQ-2 gas sensors.</div>
          <div>[2] <span class="term-cmd-highlight">ScamShield India</span> — Hackathon cybersecurity & scam awareness platform.</div>
          <div>[3] <span class="term-cmd-highlight">Campus Lost and Found</span> — Hackathon item recovery & community matching web app.</div>
          <div>[4] <span class="term-cmd-highlight">Personal Finance Tracker</span> — Python application for income & expense management.</div>
          <div class="term-dim">Tip: Click "Interactive Preview" on any card above to try live simulators!</div>
        `;
      },

      contact: () => {
        return `
          <div class="term-tag">// Connect with Shashwat Misra:</div>
          <div>Email: <a href="mailto:shashwatmisra11@gmail.com" class="term-cmd-highlight">shashwatmisra11@gmail.com</a></div>
          <div>Phone: <span class="term-cmd-highlight">+91 9794119772</span></div>
          <div>GitHub: <a href="https://github.com/shashwatmisra21" target="_blank" class="term-cmd-highlight">github.com/shashwatmisra21</a></div>
          <div>LinkedIn: <a href="https://www.linkedin.com/in/shashwat-misra-89a4a5380/" target="_blank" class="term-cmd-highlight">linkedin.com/in/shashwat-misra</a></div>
          <div>Status: <span class="term-success">● Open to 2027 Engineering Internships</span></div>
        `;
      },

      theme: () => {
        const next = window.togglePortfolioTheme ? window.togglePortfolioTheme() : 'dark';
        return `<span class="term-success">✓ Portfolio theme switched to ${next} mode.</span>`;
      },

      whoami: () => {
        const userAgent = navigator.userAgent;
        return `
          <div>User: <span class="term-cmd-highlight">guest@shashwat-portfolio</span></div>
          <div>Permissions: <span class="term-success">read-only, interactive-eval</span></div>
          <div class="term-dim">Client: ${userAgent.substring(0, 50)}...</div>
        `;
      },

      date: () => {
        return `<span class="term-dim">${new Date().toString()}</span>`;
      },

      sudo: () => {
        return `<span class="term-error">Permission denied: with great power comes great responsibility.</span>`;
      },

      clear: () => {
        terminalOutput.innerHTML = '';
        return null;
      }
    };

    const executeCommand = (rawCmd) => {
      const cleanCmd = rawCmd.trim();
      if (!cleanCmd) return;

      // Echo input prompt
      appendLine(`<span class="term-prompt"><span class="term-prompt-arrow">➜</span> <span class="term-prompt-tilde">~</span></span> <span class="term-echo-cmd">${escapeHtml(cleanCmd)}</span>`);

      commandHistory.push(cleanCmd);
      historyIdx = commandHistory.length;

      const cmdKey = cleanCmd.toLowerCase().split(' ')[0];

      if (commands[cmdKey]) {
        const output = commands[cmdKey]();
        if (output !== null) {
          appendLine(output);
        }
      } else {
        appendLine(`<span class="term-error">zsh: command not found: ${escapeHtml(cleanCmd)}</span>. Type <span class="term-cmd-highlight">help</span> for valid commands.`);
      }

      terminalInput.value = '';
      scrollToBottom();
    };

    const escapeHtml = (str) => {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    };

    // Keyboard navigation in terminal
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(terminalInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          terminalInput.value = commandHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < commandHistory.length - 1) {
          historyIdx++;
          terminalInput.value = commandHistory[historyIdx] || '';
        } else {
          historyIdx = commandHistory.length;
          terminalInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = terminalInput.value.trim().toLowerCase();
        if (!current) return;
        const matches = Object.keys(commands).filter(c => c.startsWith(current));
        if (matches.length === 1) {
          terminalInput.value = matches[0];
        } else if (matches.length > 1) {
          appendLine(`<span class="term-dim">Completions: ${matches.join('  ')}</span>`);
        }
      }
    });

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        executeCommand(terminalInput.value);
        terminalInput.focus();
      });
    }

    // Quick chip buttons
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          executeCommand(cmd);
          terminalInput.focus();
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // 8. Navigation, Section Spy & Mobile Menu
  // --------------------------------------------------------------------------
  const initNavigation = () => {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Navbar scroll background change
    const onScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    const toggleMobileMenu = () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    };

    const closeMobileMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    };

    if (mobileToggle) {
      mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('is-open') &&
          !mobileMenu.contains(e.target) &&
          !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    // Active Section Spy via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const targetHref = `#${id}`;

            navLinks.forEach(link => {
              if (link.getAttribute('href') === targetHref) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });

            mobileLinks.forEach(link => {
              if (link.getAttribute('href') === targetHref) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, {
        rootMargin: '-30% 0px -60% 0px'
      });

      sections.forEach(sec => sectionObserver.observe(sec));
    }
  };

  // --------------------------------------------------------------------------
  // 9. Desktop-Only Smooth Custom Cursor
  // --------------------------------------------------------------------------
  const initCustomCursor = () => {
    if (!isFinePointer() || prefersReducedMotion()) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        ringX = mouseX;
        ringY = mouseY;
      }

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    // Ring trailing lerp loop
    const updateRing = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      requestAnimationFrame(updateRing);
    };
    requestAnimationFrame(updateRing);

    // Interactive element hover detection
    const interactiveSelectors = 'a, button, input, textarea, .project-card, .quick-chip, .filter-tab, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.add('cursor--hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.remove('cursor--hover');
      }
    });

    document.addEventListener('mousedown', () => {
      ring.classList.add('cursor--active');
    });

    document.addEventListener('mouseup', () => {
      ring.classList.remove('cursor--active');
    });
  };

  // --------------------------------------------------------------------------
  // 10. Back to Top Button & Scroll Progress Ring
  // --------------------------------------------------------------------------
  const initBackToTop = () => {
    const btn = document.getElementById('back-to-top');
    const progressIndicator = document.getElementById('scroll-progress-indicator');
    if (!btn || !progressIndicator) return;

    // Circumference for r=18: 2 * Math.PI * 18 ≈ 113.1
    const circumference = 113.1;
    progressIndicator.style.strokeDasharray = `${circumference}`;
    progressIndicator.style.strokeDashoffset = `${circumference}`;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollY > 350) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }

      if (docHeight > 0) {
        const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
        const offset = circumference - (progress * circumference);
        progressIndicator.style.strokeDashoffset = `${offset}`;
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  };

  // --------------------------------------------------------------------------
  // 11. Skills Filtering Tab Logic
  // --------------------------------------------------------------------------
  const initSkillsFilter = () => {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.skill-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  };

  // --------------------------------------------------------------------------
  // 12. Interactive Project Preview Modal with Live Sandboxes
  // --------------------------------------------------------------------------
  const initProjectModals = () => {
    const modal = document.getElementById('project-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close-btn');
    const closeAction = document.getElementById('modal-close-action');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const tagsEl = document.getElementById('modal-tags');
    const sandboxEl = document.getElementById('modal-sandbox');
    const triggers = document.querySelectorAll('.project-modal-trigger');

    if (!modal) return;

    let activeAnimationId = null;

    const projectData = {
      gasleakage: {
        title: 'Smart Gas Leakage Detector',
        desc: 'Interactive sensor threshold & hazard simulator. Move the slider below to simulate gas concentration (PPM) and watch how the MQ-2 sensor triggers audio-visual alarms in real time.',
        tags: ['Embedded C / C++', 'MQ-2 Sensor', 'IoT Mini Project', 'Hardware Safety'],
        renderSandbox: (container) => {
          container.innerHTML = `
            <div style="background:#08090f; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1.25rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <span style="font-weight:600; font-size:0.9rem;">Sensor: MQ-2 Gas & Smoke Probe</span>
                <span id="gas-status-badge" style="background:rgba(16,185,129,0.2); color:#10b981; padding:0.25rem 0.65rem; border-radius:6px; font-size:0.75rem; font-family:var(--font-mono); font-weight:700;">🟢 STATUS: NORMAL</span>
              </div>
              <div style="margin-bottom:1rem;">
                <label style="font-size:0.8rem; color:#94a3b8; display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                  <span>Simulate Gas Leak (PPM):</span>
                  <span id="ppm-val" style="color:#06b6d4; font-family:var(--font-mono); font-weight:700;">120 PPM</span>
                </label>
                <input type="range" id="gas-ppm-slider" min="50" max="900" value="120" style="width:100%; cursor:pointer;" />
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#64748b; margin-top:0.2rem;">
                  <span>Clean Air (50 PPM)</span>
                  <span>Safety Threshold (400 PPM)</span>
                  <span>Critical (900 PPM)</span>
                </div>
              </div>
              <div id="gas-feedback" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1); border-radius:8px; padding:0.85rem; font-family:var(--font-mono); font-size:0.8rem; color:#cbd5e1;">
                <div>[IoT System Log] Sensor reading steady. No hazard detected.</div>
                <div style="color:#64748b; margin-top:0.25rem;">Buzzer: OFF | LED: GREEN | Alert SMS: STANDBY</div>
              </div>
            </div>
          `;

          const slider = container.querySelector('#gas-ppm-slider');
          const ppmVal = container.querySelector('#ppm-val');
          const badge = container.querySelector('#gas-status-badge');
          const feedback = container.querySelector('#gas-feedback');

          slider.addEventListener('input', () => {
            const val = parseInt(slider.value, 10);
            ppmVal.textContent = `${val} PPM`;

            if (val >= 400) {
              badge.style.background = 'rgba(239, 68, 68, 0.25)';
              badge.style.color = '#ef4444';
              badge.textContent = '🚨 LEAK DETECTED: ALARM ON';

              feedback.innerHTML = `
                <div style="color:#ef4444; font-weight:700;">[CRITICAL WARNING] Gas concentration (${val} PPM) crossed 400 PPM threshold!</div>
                <div style="color:#f87171; margin-top:0.25rem;">Buzzer: 🔊 ACTIVE (HIGH PITCH) | LED: BLINKING RED | Status: Immediate ventilation advised.</div>
              `;
            } else {
              badge.style.background = 'rgba(16, 185, 129, 0.2)';
              badge.style.color = '#10b981';
              badge.textContent = '🟢 STATUS: NORMAL';

              feedback.innerHTML = `
                <div style="color:#10b981;">[IoT System Log] Gas concentration (${val} PPM) is safe.</div>
                <div style="color:#64748b; margin-top:0.25rem;">Buzzer: OFF | LED: GREEN | Alert SMS: STANDBY</div>
              `;
            }
          });
        }
      },

      scamshield: {
        title: 'ScamShield India Fraud Inspector',
        desc: 'Interactive scam heuristic analyzer built to demonstrate how ScamShield India inspects suspicious SMS messages and calls to protect citizens from financial fraud.',
        tags: ['Cyber Safety', 'JavaScript', 'HTML5 / CSS3', 'Hackathon Project'],
        renderSandbox: (container) => {
          container.innerHTML = `
            <div style="background:#08090f; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1.25rem;">
              <div style="font-size:0.85rem; font-weight:600; margin-bottom:0.6rem;">Select a Sample Message or Enter Text:</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.75rem;">
                <button type="button" class="btn-sample" data-msg="Dear customer, your bank KYC has expired. Click http://bit.ly/fake-kyc to update immediately or account blocked." style="font-size:0.75rem; padding:0.3rem 0.6rem; border-radius:6px; background:#1e293b; color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">Fake KYC Alert</button>
                <button type="button" class="btn-sample" data-msg="Congratulations! You have won Rs 50,000 lottery from KBC. Send your UPI ID to claim prize." style="font-size:0.75rem; padding:0.3rem 0.6rem; border-radius:6px; background:#1e293b; color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">Lottery Scam</button>
                <button type="button" class="btn-sample" data-msg="Your college exam schedule for 3rd semester is uploaded to the student ERP portal." style="font-size:0.75rem; padding:0.3rem 0.6rem; border-radius:6px; background:#1e293b; color:#94a3b8; border:1px solid rgba(255,255,255,0.1);">Legit Campus Notice</button>
              </div>
              <textarea id="scam-text-input" rows="3" style="width:100%; padding:0.6rem; background:#12141e; border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-size:0.85rem; margin-bottom:0.6rem;">Dear customer, your bank KYC has expired. Click http://bit.ly/fake-kyc to update immediately.</textarea>
              <button type="button" id="scan-scam-btn" style="width:100%; padding:0.6rem; background:#8b5cf6; color:#fff; border-radius:6px; font-weight:600; font-size:0.85rem; cursor:pointer;">Analyze Threat Pattern</button>
              <div id="scam-result" style="margin-top:0.85rem; font-family:var(--font-mono); font-size:0.8rem; padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
                <div style="color:#ef4444; font-weight:700;">⚠️ HIGH SCAM RISK DETECTED (Threat Score: 92/100)</div>
                <div style="color:#fca5a5; margin-top:0.25rem;">Triggers: Unofficial short URL, Urgent KYC threat, Impersonation.</div>
                <div style="color:#94a3b8; margin-top:0.25rem;">Advice: Never click unverified links. Report directly to cybercrime.gov.in (National Helpline: 1930).</div>
              </div>
            </div>
          `;

          const input = container.querySelector('#scam-text-input');
          const btn = container.querySelector('#scan-scam-btn');
          const result = container.querySelector('#scam-result');
          const sampleBtns = container.querySelectorAll('.btn-sample');

          sampleBtns.forEach(sb => {
            sb.addEventListener('click', () => {
              input.value = sb.getAttribute('data-msg');
              analyze();
            });
          });

          const analyze = () => {
            const text = (input.value || '').toLowerCase();
            const triggers = [];
            if (text.includes('kyc') || text.includes('expire') || text.includes('block')) triggers.push('Urgency/KYC extortion');
            if (text.includes('http') || text.includes('bit.ly') || text.includes('click')) triggers.push('Suspicious web link');
            if (text.includes('won') || text.includes('lottery') || text.includes('upi') || text.includes('prize')) triggers.push('Lottery/UPI reward lure');

            if (triggers.length > 0) {
              result.innerHTML = `
                <div style="color:#ef4444; font-weight:700;">⚠️ HIGH SCAM RISK DETECTED</div>
                <div style="color:#fca5a5; margin-top:0.25rem;">Identified Triggers: ${triggers.join(', ')}</div>
                <div style="color:#94a3b8; margin-top:0.25rem;">Advice: Do NOT reply or click links. Report to 1930 (National Cyber Fraud Portal).</div>
              `;
            } else {
              result.innerHTML = `
                <div style="color:#10b981; font-weight:700;">✓ LOW RISK DETECTED (Clean pattern)</div>
                <div style="color:#cbd5e1; margin-top:0.25rem;">No typical phishing or extortion markers found. Always stay vigilant.</div>
              `;
            }
          };

          btn.addEventListener('click', analyze);
        }
      },

      campuslostfound: {
        title: 'Campus Lost and Found Simulator',
        desc: 'Interactive simulation of the campus lost and found platform. Test the live keyword search and category filtering for student items.',
        tags: ['HTML5 / CSS3', 'JavaScript', 'MongoDB Concept', 'Hackathon Project'],
        renderSandbox: (container) => {
          const sampleItems = [
            { type: 'lost', title: 'Casio Scientific Calculator fx-991EX', loc: 'Physics Lab 2', date: 'Yesterday' },
            { type: 'found', title: 'College ID Card (CS Branch)', loc: 'Central Cafeteria', date: 'Today' },
            { type: 'lost', title: 'Black Boat Earbuds Case', loc: 'Library 1st Floor', date: '2 days ago' },
            { type: 'found', title: 'Engineering Mathematics Notebook', loc: 'Room 204', date: 'Today' }
          ];

          container.innerHTML = `
            <div style="background:#08090f; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1.25rem;">
              <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
                <input type="text" id="clf-search" placeholder="Search item: e.g. 'calculator', 'id', 'lab'..." style="flex:1; padding:0.5rem 0.75rem; background:#12141e; border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-size:0.85rem;" />
              </div>
              <div id="clf-list" style="display:flex; flex-direction:column; gap:0.5rem; max-height:160px; overflow-y:auto;">
              </div>
            </div>
          `;

          const searchInput = container.querySelector('#clf-search');
          const list = container.querySelector('#clf-list');

          const renderList = (filterText = '') => {
            const filtered = sampleItems.filter(i => 
              i.title.toLowerCase().includes(filterText.toLowerCase()) || 
              i.loc.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filtered.length === 0) {
              list.innerHTML = `<div style="color:#64748b; font-size:0.8rem; padding:0.5rem;">No matching campus items found.</div>`;
              return;
            }

            list.innerHTML = filtered.map(item => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.55rem 0.75rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:6px; font-size:0.8rem;">
                <div>
                  <span style="font-weight:700; color:${item.type === 'lost' ? '#f59e0b' : '#06b6d4'}; text-transform:uppercase; font-size:0.7rem; margin-right:0.4rem;">[${item.type}]</span>
                  <span style="color:#f8fafc; font-weight:600;">${item.title}</span>
                  <div style="color:#64748b; font-size:0.725rem; margin-top:0.15rem;">📍 ${item.loc} • ${item.date}</div>
                </div>
                <button type="button" class="btn-claim" style="padding:0.3rem 0.6rem; background:#8b5cf6; color:#fff; border-radius:4px; font-size:0.7rem; cursor:pointer;">Contact</button>
              </div>
            `).join('');

            list.querySelectorAll('.btn-claim').forEach(b => {
              b.addEventListener('click', () => {
                showToast('Connecting with student finder securely...', 'info');
              });
            });
          };

          renderList();
          searchInput.addEventListener('input', () => renderList(searchInput.value));
        }
      },

      financetracker: {
        title: 'Personal Finance Tracker (Python Logic Simulator)',
        desc: 'Interactive simulator demonstrating the income, expense calculation, and monthly savings logic of my Python finance tracking application.',
        tags: ['Python Logic', 'Budget Calculation', 'Data Handling', 'Personal Utility'],
        renderSandbox: (container) => {
          let balance = 4500;
          let spent = 1200;

          container.innerHTML = `
            <div style="background:#08090f; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:1.25rem;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem; text-align:center;">
                <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:0.65rem; border-radius:8px;">
                  <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Net Balance</div>
                  <div id="ft-bal" style="font-size:1.25rem; font-weight:800; color:#10b981; font-family:var(--font-mono);">₹${balance}</div>
                </div>
                <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:0.65rem; border-radius:8px;">
                  <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Total Spent</div>
                  <div id="ft-spent" style="font-size:1.25rem; font-weight:800; color:#ef4444; font-family:var(--font-mono);">₹${spent}</div>
                </div>
              </div>

              <div style="display:flex; gap:0.5rem; margin-bottom:0.6rem;">
                <input type="number" id="ft-amt" placeholder="Amount (₹)" style="width:110px; padding:0.5rem; background:#12141e; border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-size:0.85rem;" value="250" />
                <select id="ft-cat" style="flex:1; padding:0.5rem; background:#12141e; border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-size:0.85rem;">
                  <option value="Food & Canteen">Food & Canteen</option>
                  <option value="Books & Stationery">Books & Stationery</option>
                  <option value="Travel / Metro">Travel / Metro</option>
                  <option value="Tech & Hardware">Tech & Hardware</option>
                </select>
              </div>

              <div style="display:flex; gap:0.5rem;">
                <button type="button" id="ft-add-expense" style="flex:1; padding:0.55rem; background:#ef4444; color:#fff; border-radius:6px; font-weight:600; font-size:0.8rem; cursor:pointer;">- Add Expense</button>
                <button type="button" id="ft-add-income" style="flex:1; padding:0.55rem; background:#10b981; color:#fff; border-radius:6px; font-weight:600; font-size:0.8rem; cursor:pointer;">+ Add Allowance</button>
              </div>
            </div>
          `;

          const balEl = container.querySelector('#ft-bal');
          const spentEl = container.querySelector('#ft-spent');
          const amtInput = container.querySelector('#ft-amt');
          const expBtn = container.querySelector('#ft-add-expense');
          const incBtn = container.querySelector('#ft-add-income');

          expBtn.addEventListener('click', () => {
            const amt = Math.max(parseFloat(amtInput.value) || 0, 0);
            if (amt === 0) return;
            balance -= amt;
            spent += amt;
            balEl.textContent = `₹${balance}`;
            spentEl.textContent = `₹${spent}`;
            showToast(`Recorded ₹${amt} expense`, 'info');
          });

          incBtn.addEventListener('click', () => {
            const amt = Math.max(parseFloat(amtInput.value) || 0, 0);
            if (amt === 0) return;
            balance += amt;
            balEl.textContent = `₹${balance}`;
            showToast(`Added ₹${amt} allowance`, 'success');
          });
        }
      }
    };

    let lastFocusedElement = null;

    const openModal = (projectId) => {
      const data = projectData[projectId];
      if (!data) return;

      lastFocusedElement = document.activeElement;

      titleEl.textContent = data.title;
      descEl.textContent = data.desc;

      tagsEl.innerHTML = data.tags.map(tag => `<span class="tech-pill">${tag}</span>`).join('');

      data.renderSandbox(sandboxEl);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      if (activeAnimationId) {
        cancelAnimationFrame(activeAnimationId);
        activeAnimationId = null;
      }
      sandboxEl.innerHTML = '';
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    };

    triggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project');
        if (id) openModal(id);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeAction) closeAction.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  };

  // --------------------------------------------------------------------------
  // 13. Contact Form Validation & Toast Feedback
  // --------------------------------------------------------------------------
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger enter transition
    requestAnimationFrame(() => {
      toast.classList.add('is-show');
    });

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.remove('is-show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4000);
  };

  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('submit-btn');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        nameInput.classList.add('is-invalid');
        nameError.textContent = 'Please provide your name (min 2 characters).';
        isValid = false;
      } else {
        nameInput.classList.remove('is-invalid');
        nameError.textContent = '';
      }

      // Validate Email
      if (!validateEmail(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      } else {
        emailInput.classList.remove('is-invalid');
        emailError.textContent = '';
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageInput.classList.add('is-invalid');
        messageError.textContent = 'Please write a message with at least 10 characters.';
        isValid = false;
      } else {
        messageInput.classList.remove('is-invalid');
        messageError.textContent = '';
      }

      if (!isValid) return;

      // Simulate network request
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        form.reset();
        showToast('Message transmitted successfully! Shashwat will respond soon.', 'success');
      }, 900);
    });
  };

  // --------------------------------------------------------------------------
  // Global Initializer
  // --------------------------------------------------------------------------
  const init = () => {
    initThemeSystem();
    initTypewriter();
    initHeroParticles();
    initProjectCardTilt();
    initScrollReveals();
    initStatCounters();
    initTerminal();
    initNavigation();
    initCustomCursor();
    initBackToTop();
    initSkillsFilter();
    initProjectModals();
    initContactForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
