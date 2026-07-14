/* ============================================================
   TALHA RASHID — "THE TRAINING RUN"
   Scroll = training. Loss goes down, heat goes up.
   Stack: GSAP + ScrollTrigger + Lenis + hand-rolled WebGL.
   ============================================================ */

(() => {
    'use strict';

    const docEl = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    /* If the CDN failed, unhide everything and bail gracefully. */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        docEl.classList.add('no-anim');
        const pre = document.getElementById('preloader');
        if (pre) pre.remove();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ============ LENIS SMOOTH SCROLL ============ */
    let lenis = null;
    if (typeof Lenis !== 'undefined' && !reduceMotion) {
        lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    const scrollTo = (target) => {
        if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            const target = id === '#top' ? document.body : document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            scrollTo(id === '#top' ? 0 : target);
        });
    });

    /* ============ HELPERS ============ */
    const CH_POOL = '!<>-_\\/[]{}—=+*^?#01';

    function splitChars(el) {
        const text = el.textContent;
        el.textContent = '';
        const frag = document.createDocumentFragment();
        [...text].forEach((c) => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c;
            frag.appendChild(s);
        });
        el.appendChild(frag);
        return el.querySelectorAll('.ch');
    }

    function splitWords(el) {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        const frag = document.createDocumentFragment();
        words.forEach((w, i) => {
            const s = document.createElement('span');
            s.className = 'w';
            s.textContent = w;
            frag.appendChild(s);
            if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        el.appendChild(frag);
        return el.querySelectorAll('.w');
    }

    /* Scramble-decode a string into an element over `dur` ms. */
    function decode(el, target, dur = 1100) {
        const start = performance.now();
        function frame() {
            /* clamp to [0,1] — the first rAF tick can land before `start` */
            const p = gsap.utils.clamp(0, 1, (performance.now() - start) / dur);
            const settled = Math.floor(target.length * p);
            let out = target.slice(0, settled);
            for (let i = settled; i < target.length; i++) {
                out += target[i] === ' ' ? ' ' : CH_POOL[(Math.random() * CH_POOL.length) | 0];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ============ WEBGL THERMAL SHADER (hero) ============ */
    const canvas = document.getElementById('heroCanvas');
    const heroEl = document.getElementById('hero');
    let renderShader = null;

    (function initShader() {
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
        if (!gl) { canvas.style.background = 'radial-gradient(ellipse at 50% 80%, #2a0f45, #0b0510 70%)'; return; }

        const vsSrc = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        const fsSrc = `
            precision highp float;
            uniform vec2 u_res;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_heat;

            vec3 inferno(float t){
                const vec3 c0=vec3(0.00021894036911922,0.0016510046310010,-0.019480898437091);
                const vec3 c1=vec3(0.10651341948561,0.56395643678841,3.9327123888893);
                const vec3 c2=vec3(11.602493082472,-3.9728539656657,-15.942394106291);
                const vec3 c3=vec3(-41.703996131395,17.436398882053,44.354145198728);
                const vec3 c4=vec3(77.162935699427,-33.402358942101,-81.807309257390);
                const vec3 c5=vec3(-71.319428244992,32.626064263977,73.209519858032);
                const vec3 c6=vec3(25.131126224773,-12.242668952386,-23.070325002872);
                return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));
            }
            float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
            float noise(vec2 p){
                vec2 i=floor(p),f=fract(p);
                f=f*f*(3.-2.*f);
                return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                           mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
            }
            float fbm(vec2 p){
                float v=0.,a=.5;
                mat2 r=mat2(1.6,1.2,-1.2,1.6);
                for(int i=0;i<5;i++){v+=a*noise(p);p=r*p;a*=.5;}
                return v;
            }
            void main(){
                vec2 uv=gl_FragCoord.xy/u_res;
                vec2 p=uv; p.x*=u_res.x/u_res.y;
                float t=u_time*.055;
                vec2 q=vec2(fbm(p*2.1+t),fbm(p*2.1-t*.7));
                float f=fbm(p*2.3+q*1.7+vec2(t*.5,-t*.3));
                vec2 mp=u_mouse; mp.x*=u_res.x/u_res.y;
                float m=exp(-length(p-mp)*3.1)*u_heat;
                float v=f*.6+m*.55;
                float vig=smoothstep(1.2,.3,length(uv-vec2(.5,.42))*1.55);
                v*=mix(.7,1.,vig);
                vec3 col=inferno(clamp(v,0.,.96));
                col=pow(col,vec3(1.3))*.92;
                gl_FragColor=vec4(col,1.);
            }`;

        function compile(type, src) {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            return sh;
        }
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const locA = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(locA);
        gl.vertexAttribPointer(locA, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, 'u_res');
        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');
        const uHeat = gl.getUniformLocation(prog, 'u_heat');

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        function resize() {
            const w = heroEl.clientWidth, h = heroEl.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener('resize', resize);

        let mx = 0.5, my = 0.42, tx = 0.5, ty = 0.42, heat = 0, heatTarget = 0;
        window.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            tx = (e.clientX - r.left) / r.width;
            ty = 1 - (e.clientY - r.top) / r.height;
            heatTarget = 1;
        });

        let heroVisible = true;
        new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(heroEl);

        const t0 = performance.now();
        renderShader = function render() {
            if (heroVisible && !document.hidden) {
                mx += (tx - mx) * 0.06;
                my += (ty - my) * 0.06;
                heat += (heatTarget - heat) * 0.04;
                heatTarget *= 0.97;
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform1f(uTime, (performance.now() - t0) / 1000);
                gl.uniform2f(uMouse, mx, my);
                gl.uniform1f(uHeat, heat);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }
            if (!reduceMotion) requestAnimationFrame(render);
        };
        renderShader();
    })();

    /* ============ CUSTOM CURSOR ============ */
    if (finePointer && !reduceMotion) {
        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        const label = document.getElementById('cursorLabel');
        const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
        const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
        const ringX = gsap.quickTo(ring, 'x', { duration: 0.32, ease: 'power2.out' });
        const ringY = gsap.quickTo(ring, 'y', { duration: 0.32, ease: 'power2.out' });
        let shown = false;
        window.addEventListener('pointermove', (e) => {
            if (!shown) { gsap.to([dot, ring], { opacity: 1, duration: 0.3 }); shown = true; }
            dotX(e.clientX); dotY(e.clientY);
            ringX(e.clientX); ringY(e.clientY);
        });
        document.addEventListener('mouseleave', () => { gsap.to([dot, ring], { opacity: 0, duration: 0.3 }); shown = false; });

        document.querySelectorAll('[data-cursor]').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                const txt = el.getAttribute('data-cursor');
                if (txt) { label.textContent = txt; ring.classList.add('is-label'); }
                else ring.classList.add('is-hover');
            });
            el.addEventListener('mouseleave', () => ring.classList.remove('is-hover', 'is-label'));
        });
    }

    /* ============ MAGNETIC ELEMENTS ============ */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.magnetic').forEach((el) => {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.35);
                yTo((e.clientY - r.top - r.height / 2) * 0.35);
            });
            el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
        });
    }

    /* ============ NAV SCRAMBLE HOVER ============ */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-scramble]').forEach((el) => {
            const original = el.textContent;
            let busy = false;
            el.addEventListener('mouseenter', () => {
                if (busy) return;
                busy = true;
                decode(el, original, 420);
                setTimeout(() => { busy = false; }, 460);
            });
        });
    }

    /* ============ PRELOADER → HERO INTRO ============ */
    const heroChars1 = splitChars(document.getElementById('heroLine1'));
    const heroChars2 = splitChars(document.getElementById('heroLine2'));
    const heroSub = document.getElementById('heroSub');
    const subText = heroSub.getAttribute('data-decode');

    function heroIntro() {
        heroSub.textContent = '';
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from([...heroChars1, ...heroChars2], {
            yPercent: 150,
            duration: 1.1,
            stagger: 0.045
        })
        .to('#heroChip', { opacity: 1, duration: 0.6 }, '-=0.6')
        .to('#heroSub', { opacity: 1, duration: 0.1, onComplete: () => decode(heroSub, subText, 1300) }, '-=0.4')
        .to('#heroMeta', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
        .to('#scrollHint', { opacity: 1, duration: 0.7 }, '-=0.4')
        .to(['#hudMetrics', '#hudEpochs'], { opacity: 1, duration: 0.7 }, '<');
    }

    const preloader = document.getElementById('preloader');
    if (reduceMotion) {
        if (preloader) preloader.remove();
        heroSub.textContent = subText;
        gsap.set([...heroChars1, ...heroChars2], { clearProps: 'all' });
    } else {
        const logLines = document.querySelectorAll('#bootLog p');
        const pctEl = document.getElementById('bootPct');
        const boot = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.9,
                    ease: 'power4.inOut',
                    onComplete: () => { preloader.remove(); ScrollTrigger.refresh(); }
                });
                heroIntro();
            }
        });
        boot.to(logLines, { opacity: 1, duration: 0.06, stagger: 0.16, ease: 'none' })
            .to('#bootBarFill', {
                scaleX: 1, duration: 1.05, ease: 'power2.inOut',
                onUpdate: function () { pctEl.textContent = Math.round(this.progress() * 100) + '%'; }
            }, 0.15);
    }

    /* ============ HERO SCROLL PARALLAX / KINETIC SPLIT ============ */
    if (!reduceMotion) {
        gsap.to('#heroLine1', {
            xPercent: -14, ease: 'none',
            scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('#heroLine2', {
            xPercent: 14, ease: 'none',
            scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero-inner', {
            yPercent: 22, opacity: 0.25, ease: 'none',
            scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('#scrollHint', {
            opacity: 0, ease: 'none',
            scrollTrigger: { trigger: heroEl, start: 'top top', end: '20% top', scrub: true }
        });
    }

    /* ============ MARQUEE (velocity-reactive) ============ */
    if (!reduceMotion) {
        const marqueeTween = gsap.to('#marqueeInner', {
            xPercent: -50, repeat: -1, ease: 'none', duration: 24
        });
        if (lenis) {
            const skewTo = gsap.quickTo('#marqueeInner', 'skewX', { duration: 0.4, ease: 'power2.out' });
            lenis.on('scroll', ({ velocity }) => {
                const v = Math.abs(velocity);
                marqueeTween.timeScale(1 + Math.min(v / 6, 3.5));
                skewTo(gsap.utils.clamp(-8, 8, velocity * 0.4));
            });
        }
    }

    /* ============ WORK : HORIZONTAL GALLERY (desktop) ============ */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = document.getElementById('workTrack');
        const getAmount = () => Math.max(track.scrollWidth - window.innerWidth, 0);
        const horiz = gsap.to(track, {
            x: () => -getAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: '#work',
                start: 'top top',
                end: () => '+=' + getAmount(),
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
        /* Ghost numerals drift against the scroll for depth */
        gsap.utils.toArray('.run-card .ghost-num').forEach((el) => {
            gsap.fromTo(el, { xPercent: 26 }, {
                xPercent: -12, ease: 'none',
                scrollTrigger: {
                    trigger: el.parentElement,
                    containerAnimation: horiz,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                }
            });
        });
        return () => horiz.scrollTrigger && horiz.scrollTrigger.kill();
    });

    /* Mobile: simple rise-in reveals for cards */
    mm.add('(max-width: 899px)', () => {
        if (reduceMotion) return;
        gsap.utils.toArray('.run-card').forEach((card) => {
            gsap.from(card, {
                y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: card, start: 'top 88%' }
            });
        });
    });

    /* ============ STACK : STICKY PILE ============ */
    if (!reduceMotion) {
        const cards = gsap.utils.toArray('.stack-card');
        cards.forEach((card, i) => {
            const next = cards[i + 1];
            if (!next) return;
            gsap.to(card.querySelector('.stack-card-inner'), {
                scale: 0.93,
                filter: 'brightness(0.55)',
                ease: 'none',
                scrollTrigger: {
                    trigger: next,
                    start: 'top bottom',
                    end: 'top center',
                    scrub: true
                }
            });
        });
    }

    /* ============ LINE REVEALS (eyebrows + titles) ============ */
    if (!reduceMotion) {
        document.querySelectorAll('[data-reveal]').forEach((block) => {
            gsap.to(block.querySelectorAll('.rl'), {
                y: 0,
                duration: 1.1,
                ease: 'power4.out',
                stagger: 0.09,
                scrollTrigger: { trigger: block, start: 'top 85%' }
            });
        });
    } else {
        gsap.set('.rl', { clearProps: 'all' });
    }

    /* ============ ABOUT : WORD SCRUB + COUNTERS ============ */
    const manifesto = document.getElementById('manifesto');
    if (manifesto) {
        const words = splitWords(manifesto);
        if (!reduceMotion) {
            gsap.fromTo(words, { opacity: 0.13 }, {
                opacity: 1,
                ease: 'none',
                stagger: 0.06,
                scrollTrigger: {
                    trigger: manifesto,
                    start: 'top 78%',
                    end: 'bottom 45%',
                    scrub: true
                }
            });
        }
    }
    document.querySelectorAll('.stat-num').forEach((el) => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (reduceMotion) { el.textContent = target; return; }
        const obj = { v: 0 };
        gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: () => { el.textContent = String(obj.v).padStart(2, '0'); },
            scrollTrigger: { trigger: el, start: 'top 88%' }
        });
    });

    /* ============ SCROLL PROGRESS + LIVE METRICS ============ */
    const progressBar = document.getElementById('thermalProgress');
    const lossEl = document.getElementById('metricLoss');
    const accEl = document.getElementById('metricAcc');
    function updateMetrics() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        progressBar.style.transform = 'scaleX(' + p + ')';
        if (lossEl) lossEl.textContent = (2.4832 * Math.pow(1 - p, 2.2) + 0.0042).toFixed(4);
        if (accEl) accEl.textContent = (0.312 + 0.686 * Math.pow(p, 0.7)).toFixed(3);
    }
    window.addEventListener('scroll', updateMetrics, { passive: true });
    updateMetrics();

    /* ============ EPOCH TRACKER (active section) ============ */
    const epochs = document.querySelectorAll('.epoch');
    function setEpoch(name) {
        epochs.forEach((e) => e.classList.toggle('is-active', e.dataset.section === name));
    }
    [['#hero', 'top'], ['#work', 'work'], ['#stack', 'stack'], ['#about', 'about'], ['#contact', 'contact']]
        .forEach(([sel, name]) => {
            ScrollTrigger.create({
                trigger: sel,
                start: 'top center',
                end: 'bottom center',
                onToggle: (self) => { if (self.isActive) setEpoch(name); }
            });
        });

    /* ============ NAV HIDE ON SCROLL DOWN ============ */
    const nav = document.getElementById('nav');
    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('is-hidden', y > lastY && y > 300);
        lastY = y;
    }, { passive: true });

    /* ============ EMAIL COPY ============ */
    const emailChip = document.getElementById('emailChip');
    const emailText = document.getElementById('emailChipText');
    if (emailChip) {
        emailChip.addEventListener('click', () => {
            navigator.clipboard.writeText('talha.rashid344@gmail.com').then(() => {
                emailChip.classList.add('is-copied');
                emailText.textContent = 'copied to clipboard ✓';
                setTimeout(() => {
                    emailChip.classList.remove('is-copied');
                    emailText.textContent = 'talha.rashid344@gmail.com';
                }, 1400);
            }).catch(() => { window.location.href = 'mailto:talha.rashid344@gmail.com'; });
        });
    }

    /* ============ ISLAMABAD CLOCK ============ */
    const clockEl = document.getElementById('clock');
    function tickClock() {
        clockEl.textContent = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false, timeZone: 'Asia/Karachi'
        }).format(new Date());
    }
    tickClock();
    setInterval(tickClock, 1000);

    /* Recalculate pinned distances once webfonts settle */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
})();
