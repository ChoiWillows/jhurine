const DEFAULT_PASSWORD = '082910';
const DEFAULT_ADMIN_PASSWORD = 'admin2024';

const DEFAULT_LETTER = {
    title: 'To My Dearest Bestie 💙',
    body: `Happy Happy Birthday to the most amazing person in my life! 🎉

From the moment we met, I knew our friendship was going to be something special. You've been there through thick and thin, laughter and tears, crazy adventures and quiet nights in. 🌟

Thank you for always being you - the kind, funny, incredibly wonderful human being who makes every day brighter just by being in it. You deserve all the love, happiness, and success in the world. 🥰

Here's to another year of creating unforgettable memories together! May all your dreams come true and may this year bring you everything you've been wishing for and more! 💙

Never forget how special you are and how much you mean to me. I'll always be here for you, no matter what. 🫂

Have the most magical birthday ever! You deserve it all! 🎂✨`,
    signature: 'Forever & Always, Your Bestie 💙'
};

function getStoredData() {
    try {
        const stored = localStorage.getItem('birthdayEnvelopeData');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.log('No stored data found, using defaults.');
    }
    return {
        password: DEFAULT_PASSWORD,
        adminPassword: DEFAULT_ADMIN_PASSWORD,
        letter: DEFAULT_LETTER
    };
}

function saveStoredData(data) {
    localStorage.setItem('birthdayEnvelopeData', JSON.stringify(data));
}

const data = getStoredData();

const envelope = document.getElementById('envelope');
const passwordInput = document.getElementById('password-input');
const openBtn = document.getElementById('open-btn');
const togglePasswordBtn = document.getElementById('toggle-password');
const errorMsg = document.getElementById('error-msg');
const envelopeSection = document.getElementById('envelope-section');
const afterOpenSection = document.getElementById('after-open');
const replayBtn = document.getElementById('replay-btn');
const letterTitle = document.getElementById('letter-title');
const letterBody = document.getElementById('letter-body');
const letterSignature = document.getElementById('letter-signature');

letterTitle.textContent = data.letter.title || DEFAULT_LETTER.title;
letterBody.textContent = data.letter.body || DEFAULT_LETTER.body;
letterSignature.textContent = data.letter.signature || DEFAULT_LETTER.signature;

let isOpen = false;

togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

function openEnvelope() {
    if (isOpen) return;
    
    envelope.classList.add('opened');
    isOpen = true;
    
    setTimeout(() => {
        afterOpenSection.classList.remove('hidden');
        triggerConfetti();
    }, 1500);
}

openBtn.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === data.password) {
        errorMsg.classList.add('hidden');
        openEnvelope();
    } else {
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        openBtn.click();
    }
});

passwordInput.addEventListener('input', () => {
    if (!errorMsg.classList.contains('hidden')) {
        errorMsg.classList.add('hidden');
    }
});

replayBtn.addEventListener('click', () => {
    isOpen = false;
    envelope.classList.remove('opened');
    afterOpenSection.classList.add('hidden');
    passwordInput.value = '';
    errorMsg.classList.add('hidden');
    envelopeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function triggerConfetti() {
    const emojis = ['🎉', '🎊', '💙', '⭐', '🎈', '🎁', '🦋', '✨', '💫', '🌟'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}vw;
                font-size: ${20 + Math.random() * 20}px;
                z-index: 9999;
                pointer-events: none;
                animation: confettiDrop ${3 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 50);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes confettiDrop {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const hash = window.location.hash;
if (hash === '#editor' || hash === '#admin') {
    showAdminPrompt();
}

function showAdminPrompt() {
    const adminPw = prompt('🔐 Enter admin password to access the editor:');
    if (adminPw === data.adminPassword) {
        window.location.href = 'editor.html';
    } else if (adminPw !== null) {
        alert('❌ Wrong admin password!');
        window.location.hash = '';
    } else {
        window.location.hash = '';
    }
}

let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if (konamiCode.length > konamiPattern.length) {
        konamiCode.shift();
    }
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        showAdminPrompt();
        konamiCode = [];
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        showAdminPrompt();
    }
});
