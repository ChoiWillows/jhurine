const DEFAULT_PASSWORD     = '082510';
const DEFAULT_ADMIN_PASSWORD = 'admin2024';

const DEFAULT_LETTER = {
    title: 'To JM💙',
    body:
`Happy Happy Birthday brooooo! 🎉

Noon talaga akala ko 'di kita magiging close hwhahhahaha pero noon lang pala talaga 'yon. It's kinda weird but yeah sobrang pinahanga mo 'ko sa galing mong makisama sa Wave to Earth.

Sa totoo lang sobrang thankful ako na nakilala kita at naging close tayo. You are one of the most amazing people I've ever met, and I feel so lucky to have you in my life. Your kindness, humor, and positivity always reminds me to pursue what i wanted.

The moment we have that conversation that last for 7 hours, doon kita mas nakilala. Sobrang na-amaze ako sa'yo n'on kasi ang daldal mo din pala, akala ko nonchalant ka forever ehh.

Gumawa ako ng website yes, it took me days to make it but I hope you like it. I just want to make your birthday special and memorable.

Actually, kaya mo talaga 'tong ma-access sa lifetime mo unless i-delete ko. Hawak ko 'yung website kaya safe naman ito hwhahahaa.

As long as alam mo 'yung password, kaya mo 'tong balik-balikan kasi open 'to 24/7 HAHAHHAHAAHAHHA.

Ayun langgg, sana happy ka sa birthday mo broo kasi ako sobrang happy for you na nagagawa mo mga gusto mo. At sana mahanap mo din 'yung tamang tao para sa'yo.

Joke lang, pero ang pinaka-wish ko sa'yo ay sana maabot mo na 'yung ninanais mo na with high honors at makapasa sa upcat next year!

HAPPY BIRTHDAY JM!!!!!!!! MORE BIRTHDAYS TO COMEEEEE!!!! <3

(blue talaga 'yung theme kasi alam kong blue 'yung favorite color mo)`,
    signature: 'Marth Hale 💙'
};

const WORMHOLE_DURATION_MS  = 5200;
const LINE_REVEAL_DELAY_MS  = 1100;
const EMPHASIS_LINE_DELAY_MS = 1600;

const MUSIC_URL = 'Rob%20Deniel%20-%20Star%20Song%20(Official%20Lyric%20Video).mp3';
const MUSIC_VOLUME = 1.00;

/* =====================================================================
   🛑 STOP — DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW JAVASCRIPT 🛑
   ===================================================================== */

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);

    const wormhole       = $('wormhole');
    const starsContainer = $('stars');
    const stage          = $('stage');
    const envelopeSec    = $('envelope-section');
    const envelope       = $('envelope');
    const passwordInput  = $('password-input');
    const openBtn        = $('open-btn');
    const togglePwBtn    = $('toggle-password');
    const errorMsg       = $('error-msg');
    const letterStage    = $('letter-stage');
    const letterTitle    = $('letter-title');
    const letterBodyWrap = $('letter-body-wrap');
    const letterFooter   = $('letter-footer');
    const letterSign     = $('letter-signature');
    const celebration    = $('celebration');
    const revealBar      = $('reveal-bar');
    const replayBtn      = $('replay-btn');
    const musicToggle    = $('music-toggle');
    const musicAudio     = $('bg-music');

    letterTitle.textContent = DEFAULT_LETTER.title;
    letterSign.textContent  = DEFAULT_LETTER.signature;
    if (musicAudio) {
        try { musicAudio.volume = MUSIC_VOLUME; } catch (_) {}
        if (MUSIC_URL) {
            if (musicAudio.getAttribute('src') !== MUSIC_URL) {
                musicAudio.setAttribute('src', MUSIC_URL);
                musicAudio.setAttribute('crossorigin', 'anonymous');
            }
        }
    }

    let musicEnabled = false;
    function setMusicUi(on) {
        musicEnabled = on;
        if (on) { musicToggle.textContent = '🎶'; musicToggle.classList.add('playing'); }
        else    { musicToggle.textContent = '🎵'; musicToggle.classList.remove('playing'); }
    }
    function startMusic(userInitiated) {
        if (!musicAudio || !MUSIC_URL) return;
        const play = function () {
            try {
                const p = musicAudio.play();
                if (p && typeof p.then === 'function') {
                    p.then(() => setMusicUi(true)).catch(() => setMusicUi(false));
                } else {
                    setMusicUi(true);
                }
            } catch (_) { setMusicUi(false); }
        };
        if (userInitiated) { play(); return; }
        // Non-user-initiated: browsers block autoplay. Start only after first interaction.
        const tryOnce = function () {
            play();
            window.removeEventListener('pointerdown', tryOnce);
            window.removeEventListener('keydown',     tryOnce);
        };
        window.addEventListener('pointerdown', tryOnce, { once: true });
        window.addEventListener('keydown',     tryOnce, { once: true });
    }
    function toggleMusic() {
        if (!musicAudio) return;
        if (!musicEnabled) { startMusic(true); return; }
        try { musicAudio.pause(); } catch (_) {}
        setMusicUi(false);
    }
    if (musicToggle) {
        musicToggle.addEventListener('click', function (e) {
            e.stopPropagation(); toggleMusic();
        });
    }

    /* --- Build wormhole stars --- */
    function spawnStars() {
        if (!starsContainer) return;
        const N = 60;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < N; i++) {
            const s = document.createElement('div');
            s.className = 'wormhole-star';
            const ang = Math.random() * Math.PI * 2;
            const dist = 500 + Math.random() * 600;
            const dx = Math.cos(ang) * dist;
            const dy = Math.sin(ang) * dist;
            s.style.setProperty('--dx', dx + 'px');
            s.style.setProperty('--dy', dy + 'px');
            s.style.left = '50%';
            s.style.top = '50%';
            s.style.animationDelay = (Math.random() * 2.4) + 's';
            s.style.animationDuration = (1.8 + Math.random() * 2.2) + 's';
            frag.appendChild(s);
        }
        starsContainer.appendChild(frag);
    }
    spawnStars();

    /* --- State machine: WORMHOLE -> ENVELOPE -> LETTER (timed reveal) --- */
    let revealTimers = [];
    function clearRevealTimers() { revealTimers.forEach(clearTimeout); revealTimers = []; }

    function prepareLetterLines() {
        const body = String(DEFAULT_LETTER.body || '');
        const lines = body.split(/\r?\n/);
        letterBodyWrap.innerHTML = '';
        const nodes = lines.map(function (text) {
            const d = document.createElement('div');
            d.className = 'letter-line';
            d.textContent = text;
            letterBodyWrap.appendChild(d);
            return { el: d, empty: !text || text.trim().length === 0 };
        });
        return nodes;
    }

    function showEnvelopeStage() {
        wormhole.classList.add('fade-out');
        stage.setAttribute('aria-hidden', 'false');
        stage.classList.add('visible');
        const t1 = setTimeout(function () { wormhole.classList.add('hidden'); }, 1400);
        const t2 = setTimeout(function () { envelopeSec.classList.add('visible'); }, 900);
        revealTimers.push(t1, t2);
    }

    function celebrateBurst() {
        const emojis = ['🎉','🎊','💙','⭐','🎈','🎁','🦋','✨','💫','🌟','🥳','🌌'];
        for (let i = 0; i < 80; i++) {
            (function (i) {
                const t = setTimeout(function () {
                    const c = document.createElement('div');
                    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    const size = 18 + Math.random() * 22;
                    c.style.cssText =
                        'position:fixed;top:-60px;left:' + (Math.random() * 100) + 'vw;' +
                        'font-size:' + size + 'px;z-index:99999;pointer-events:none;' +
                        'animation:confettiDropAnim ' + (3.2 + Math.random() * 2.8) + 's linear forwards;';
                    document.body.appendChild(c);
                    setTimeout(function () { c.remove(); }, 6200);
                }, i * 38);
                revealTimers.push(t);
            })(i);
        }
    }

    function openLetterTimed() {
        envelope.classList.add('opened');
        envelopeSec.classList.add('gone');
        celebrateBurst();
        const tShow = setTimeout(function () {
            stage.classList.add('no-pointer-events');
            letterStage.setAttribute('aria-hidden', 'false');
            letterStage.classList.add('active');
            const lineInfo = prepareLetterLines();
            let idx = 0;
            revealBar.style.width = '0%';
            const total = lineInfo.length;
            const showNext = function () {
                if (idx >= total) {
                    const tFoo = setTimeout(function () { letterFooter.classList.add('visible'); }, 400);
                    const tCel = setTimeout(function () { celebration.classList.add('visible'); celebrateBurst(); }, 1100);
                    revealTimers.push(tFoo, tCel);
                    return;
                }
                const cur = lineInfo[idx++];
                cur.el.classList.add('visible');
                revealBar.style.width = Math.round((idx / Math.max(total, 1)) * 100) + '%';
                const delay = cur.empty ? EMPHASIS_LINE_DELAY_MS : LINE_REVEAL_DELAY_MS;
                const tN = setTimeout(showNext, delay);
                revealTimers.push(tN);
            };
            showNext();
        }, 650);
        revealTimers.push(tShow);
    }

    function tryOpen() {
        const pw = (passwordInput.value || '').trim();
        if (pw === DEFAULT_PASSWORD) {
            errorMsg.classList.add('hidden');
            openLetterTimed();
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    openBtn.addEventListener('click', tryOpen);
    passwordInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') tryOpen(); });
    passwordInput.addEventListener('input', function () {
        if (!errorMsg.classList.contains('hidden')) errorMsg.classList.add('hidden');
    });
    togglePwBtn.addEventListener('click', function () {
        const is = passwordInput.type === 'password';
        passwordInput.type = is ? 'text' : 'password';
        togglePwBtn.textContent = is ? '🙈' : '👁️';
    });

    function resetAll() {
        clearRevealTimers();
        if (revealBar) revealBar.style.width = '0%';
        if (letterStage) {
            letterStage.classList.remove('active');
            letterStage.setAttribute('aria-hidden', 'true');
        }
        if (letterFooter) letterFooter.classList.remove('visible');
        if (celebration)  celebration.classList.remove('visible');
        if (letterBodyWrap) letterBodyWrap.innerHTML = '';
        if (stage) {
            stage.classList.remove('no-pointer-events');
            stage.classList.remove('visible');
            stage.setAttribute('aria-hidden', 'true');
        }
        if (envelopeSec) {
            envelopeSec.classList.remove('visible', 'gone');
        }
        if (envelope) envelope.classList.remove('opened');
        if (wormhole) {
            wormhole.classList.remove('hidden', 'fade-out');
        }
        if (passwordInput) { passwordInput.value = ''; }
        if (errorMsg) errorMsg.classList.add('hidden');
        // Re-run the whole sequence
        setTimeout(function () {
            if (wormhole) wormhole.setAttribute('aria-hidden', 'false');
            const t = setTimeout(showEnvelopeStage, WORMHOLE_DURATION_MS);
            revealTimers.push(t);
        }, 50);
    }
    if (replayBtn) replayBtn.addEventListener('click', resetAll);

    /* Inject one keyframe used both by confetti bursts, so CSS is self-contained. */
    try {
        const s = document.createElement('style');
        s.textContent = '@keyframes confettiDropAnim{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(115vh) rotate(720deg);opacity:0}}';
        document.head.appendChild(s);
    } catch (_) {}

    /* Start attempt for soft music (requires first user interaction due to browser autoplay policies) */
    startMusic(false);

    /* Start the show! */
    const boot = setTimeout(showEnvelopeStage, WORMHOLE_DURATION_MS);
    revealTimers.push(boot);

    /* Admin access: #editor / #admin in URL */
    function openEditor() {
        const pw = prompt('🔐 Enter admin password to open the editor:');
        if (pw === null) { if (window.history) history.replaceState(null, '', window.location.pathname); return; }
        if (pw === DEFAULT_ADMIN_PASSWORD) { window.location.href = 'editor.html'; }
        else { alert('❌ Wrong admin password!'); if (window.history) history.replaceState(null, '', window.location.pathname); }
    }
    const hash = (window.location.hash || '').toLowerCase();
    if (hash === '#editor' || hash === '#admin') { setTimeout(openEditor, 50); }

    let konami = [];
    const pattern = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    document.addEventListener('keydown', function (e) {
        konami.push(e.key);
        if (konami.length > pattern.length) konami.shift();
        if (konami.join(',') === pattern.join(',')) { konami = []; openEditor(); }
        if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) { e.preventDefault(); openEditor(); }
    });
})();
