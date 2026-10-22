const $ = s => document.querySelector(s);
const SCREEN = $('#screen'), APP = $('#appL'), HOME = $('#homeL'), LOCK = $('#lockL'), OV = $('#ov'), PLAYER = $('#player');
const base = Date.now(); let timeOffset = 0;
const elapsed = () => (Date.now() - base) / 1000 + timeOffset;

/* ---------- 상태 ---------- */
let view = 'lock', curDark = true, SC = 1, lastRect = null, animTok = 0, firstOpen = true, pendingOpen = null;
let pincode = '', noteId = 0, selectedDay = 21, calMonth = 10, chatId = 'Hanni', videoIndex = 0, mailId = 0, missOnly = false, safSearch = false;
let unread = { Danielle: 1, Hyein: 2, 'Jejak team': 3 };
let hanniUnread = 0, todayChat = TODAY_CHAT.map(m => m.slice());
let alarmStates = Array(7).fill(true), readMail = new Set(), flashOn = false;
let callState = '', phoneDone = false, declined = 0, callStart = 0, callPrev = '', nextCallAt = 0, ringIv = null, ringTo = null, capIdx = -1, extraCalls = [];
let askedCall = false, callName = 'Hanni', callTimers = [], busySent = false, declineSent = false, rbIv = null;
let lockNotes = [{ title: 'Hanni', body: TODAY_CHAT.at(-1)[0], app: 'kakao', time: TODAY_CHAT.at(-1)[2] }, { title: t('bdayTitle'), body: fmtMD(10, 6) + ' · ' + (LANG === 'id' ? '15 hari lalu' : '15 days ago'), app: 'rem', time: '' }];

/* ---------- 유틸 ---------- */
const pad = n => String(n).padStart(2, '0');
const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
let storyMinute = 7 * 60 + 17, storyClockStart = storyMinute, storyClockBase = elapsed();
const clock12 = () => { const m = nowMin(); return ((Math.floor(m / 60) % 12) || 12) + ':' + pad(m % 60) };
function ampm(min) { return fmtTime(min) }
const nowMin = () => { storyMinute = Math.min(1439, Math.max(storyMinute, storyClockStart + Math.floor((elapsed() - storyClockBase) / 60))); return storyMinute };
const nowAmpm = () => ampm(nowMin());
function relRect(el) { const s = SCREEN.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: (r.left - s.left) / SC, y: (r.top - s.top) / SC, w: r.width / SC, h: r.height / SC } }
const vib = p => { try { navigator.vibrate && navigator.vibrate(p) } catch (e) { } };
const t_ = t; const T = { duration: 460, easing: 'cubic-bezier(.32,.72,0,1)' };
function devRadius() { return document.getElementById('phone').classList.contains('mob') ? 0 : 56 }

/* ---------- 아이콘 (자체 제작, 실제 앱 로고 아님) ---------- */
const g = (p, o = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${o}>${p}</svg>`;
const G = {
    chevL: `<svg viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10l8 8"/></svg>`,
    chevR: `<svg class="chev" viewBox="0 0 8 13"><path d="m1.5 1.5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevRb: g('<path d="m9 5 7 7-7 7"/>'), chevLb: g('<path d="m15 5-7 7 7 7"/>'),
    search: g('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    plus: g('<path d="M12 5v14M5 12h14"/>'),
    dots: g('<circle cx="12" cy="12" r="9.2"/><circle cx="8" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="16" cy="12" r=".8" fill="currentColor"/>'),
    dotsH: g('<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>'),
    menu: g('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    gear: g('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/><circle cx="12" cy="12" r="6.4"/>'),
    person: g('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    chat: g('<path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/>'),
    chatPlus: g('<path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/><path d="M12 8.5v5M9.5 11h5"/>'),
    openchat: g('<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4"/>'),
    bag: g('<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    clock: g('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    star: g('<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>'),
    contacts: g('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9.5" r="3"/><path d="M6.8 18c.9-2.4 2.9-3.6 5.2-3.6s4.3 1.2 5.2 3.6"/>'),
    keypad: g('<g fill="currentColor" stroke="none"><circle cx="6" cy="5" r="1.7"/><circle cx="12" cy="5" r="1.7"/><circle cx="18" cy="5" r="1.7"/><circle cx="6" cy="11" r="1.7"/><circle cx="12" cy="11" r="1.7"/><circle cx="18" cy="11" r="1.7"/><circle cx="6" cy="17" r="1.7"/><circle cx="12" cy="17" r="1.7"/><circle cx="18" cy="17" r="1.7"/><circle cx="12" cy="22" r="1.5"/></g>'),
    voicemail: g('<circle cx="6.5" cy="12" r="3.5"/><circle cx="17.5" cy="12" r="3.5"/><path d="M6.5 15.5h11"/>'),
    info: g('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".7" fill="currentColor"/>'),
    compose: g('<path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>'),
    filter: g('<circle cx="12" cy="12" r="9"/><path d="M8 10h8M9.5 13h5M11 16h2"/>'),
    share: g('<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/>'),
    heart: g('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>'),
    trash: g('<path d="M5 7h14M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
    book: g('<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5Z"/><path d="M12 6v13.5"/>'),
    tabs: g('<rect x="4" y="4" width="11" height="11" rx="2"/><path d="M9 20h9a2 2 0 0 0 2-2V9"/>'),
    mic: g('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
    globe: g('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.5 5.8 3.5 9s-1 6.2-3.5 9c-2.5-2.8-3.5-5.8-3.5-9s1-6.2 3.5-9Z"/>'),
    smile: g('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/>'),
    plusSq: g('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>'),
    arrowUp: g('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    home: g('<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4Z"/>'),
    reels: g('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M3.5 8.5h17M9 3.5l2.5 5M14.5 3.5 17 8.5"/><path d="m10 12 5 2.8-5 2.8Z"/>'),
    bell: g('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    send: g('<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5Z"/>'),
    comment: g('<path d="M12 3.5a8.5 8.5 0 1 0 4.3 15.8l4.2 1.2-1.2-4.2A8.5 8.5 0 0 0 12 3.5Z"/>'),
    grid: g('<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>'),
    tag: g('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18c.9-2 2.5-3 4.5-3s3.6 1 4.5 3"/>'),
    bookmark: g('<path d="M6 3.5h12v17l-6-4-6 4Z"/>'),
    camera: g('<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4Z"/><circle cx="12" cy="13" r="3.5"/>'),
    flash: g('<path d="M8.5 3h7l-1 5h-5Z"/><path d="M9.5 8h5v11a2.5 2.5 0 0 1-5 0Z"/><path d="M12 11.5v2.5"/>'),
    photo: g('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>'),
    video: g('<rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="m16 10.5 5-3v9l-5-3"/>'),
    list: g('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9" fill="currentColor"/><circle cx="4.5" cy="12" r=".9" fill="currentColor"/><circle cx="4.5" cy="18" r=".9" fill="currentColor"/>'),
    inbox: g('<path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17Z"/><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"/>'),
    check: g('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.7L16 9.5"/>'),
    pen: g('<path d="m14.5 5.5 4 4L8 20H4v-4Z"/>'),
    alarm: g('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4.5 5 7 3M19.5 5 17 3"/>'),
    stopwatch: g('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5V6"/>'),
    timer: g('<circle cx="12" cy="12" r="8.5"/><path d="M12 12 8 8"/>'),
    musicNote: '<svg viewBox="0 0 24 24"><path d="M17 3v11.5a3 3 0 1 1-2-2.8V7.3l-6 1.4v8a3 3 0 1 1-2-2.8V5.5Z"/></svg>',
    playF: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5Z"/></svg>',
    pauseF: '<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
    fwdF: '<svg viewBox="0 0 32 24"><path d="M2 4.5v15l12-7.5Z"/><path d="M15 4.5v15l12-7.5Z"/></svg>',
    bwdF: '<svg viewBox="0 0 32 24"><path d="M30 4.5v15l-12-7.5Z"/><path d="M17 4.5v15L5 12Z"/></svg>',
    handset: '<svg viewBox="0 0 24 24"><path d="M6.6 3.2c.6-.3 1.4-.1 1.8.5l1.9 3c.4.6.3 1.4-.2 1.9l-1.4 1.3a12.4 12.4 0 0 0 5.4 5.4l1.3-1.4c.5-.5 1.3-.6 1.9-.2l3 1.9c.6.4.8 1.2.5 1.8l-.9 1.9c-.5 1-1.6 1.6-2.7 1.4C10 19.6 4.4 14 3.3 6.8c-.2-1.1.4-2.2 1.4-2.7Z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24"><path d="M3.5 9h4l5-4.5v15l-5-4.5h-4Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    muteF: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    videoF: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="m16.5 10.5 5-3v9l-5-3Z"/></svg>',
    plusF: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7Z"/></svg>',
    keypadF: '<svg viewBox="0 0 24 24"><g><circle cx="6" cy="5" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="18" cy="5" r="1.8"/><circle cx="6" cy="11" r="1.8"/><circle cx="12" cy="11" r="1.8"/><circle cx="18" cy="11" r="1.8"/><circle cx="6" cy="17" r="1.8"/><circle cx="12" cy="17" r="1.8"/><circle cx="18" cy="17" r="1.8"/></g></svg>',
    bellF: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><circle cx="12" cy="20.5" r="2"/></svg>',
    msgF: '<svg viewBox="0 0 24 24"><path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.5 4.5 3.9 5.8L6 20.5l4-2.4c.6.1 1.3.1 2 .1 5 0 9-3.1 9-7.1S17 4 12 4Z"/></svg>',
    shift: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="#000" stroke-width="1.7" stroke-linejoin="round"><path d="M12 4 4 12.5h4.5V20h7v-7.5H20Z"/></svg>',
    bksp: '<svg viewBox="0 0 26 20" width="26" fill="none" stroke="#000" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M8 3h15v14H8l-6-7Z"/><path d="m12 7 6 6M18 7l-6 6"/></svg>',
    sil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.3" fill="#fff"/><path d="M3.8 22c.6-4.4 4-7 8.2-7s7.6 2.6 8.2 7Z" fill="#fff"/></svg>',
    calSm: g('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    sun: '<svg viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="5" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></svg>',
    moon: '<svg viewBox="0 0 24 24" width="24"><path d="M15.5 3.5A8.5 8.5 0 1 0 20.5 15 7 7 0 0 1 15.5 3.5Z" fill="#fff"/></svg>',
    pcloud: '<svg viewBox="0 0 24 24" width="24"><circle cx="9" cy="9" r="4.2" fill="#ffd60a"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 8.4 11 4.3 4.3 0 0 0 8 19.5Z" fill="#fff"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" width="24"><path d="M7 19h10.5a4 4 0 0 0 .4-8A5.6 5.6 0 0 0 7.2 9.2 5 5 0 0 0 7 19Z" fill="#fff"/></svg>',
};
const APPS = { maps: '지도', instagram: 'Instagram', photos: '사진', mail: 'Mail', calendar: '캘린더', clock: '시계', notes: '메모', weather: '날씨', settings: '설정', phone: '전화', safari: 'Safari', kakao: '카카오톡', music: '음악' };
function appIcon(id) {
    const L = (a, b, c, d) => `<linearGradient id="${a}" x1="0" y1="${d ? 1 : 0}" x2="${d ? 1 : 0}" y2="${d ? 0 : 1}"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
    const W = (defs, body) => `<svg viewBox="0 0 60 60"><defs>${defs}</defs>${body}</svg>`;
    switch (id) {
        case 'instagram': return W(`<linearGradient id="gi" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffc35c"/><stop offset=".5" stop-color="#ff3d6e"/><stop offset="1" stop-color="#7c3bf0"/></linearGradient>`, `<rect width="60" height="60" fill="url(#gi)"/><rect x="17" y="12.5" width="26" height="34" rx="4.5" fill="none" stroke="#fff" stroke-width="3.2"/><rect x="21.6" y="17" width="16.8" height="17" rx="2" fill="#fff"/>`);
        case 'photos': { let p = ''; for (let i = 0; i < 10; i++)p += `<ellipse cx="30" cy="18.2" rx="4.4" ry="10.5" fill="#fff" transform="rotate(${i * 36} 30 30)"/>`; return W(L('gp', '#9bdcff', '#d8f1ff'), `<rect width="60" height="60" fill="url(#gp)"/>${p}<circle cx="30" cy="30" r="7.2" fill="#ffc83d"/><circle cx="30" cy="30" r="7.2" fill="none" stroke="#f0a500" stroke-width="1"/>`) }
        case 'mail': return W(L('gm', '#3fb0ff', '#0a6cf5'), `<rect width="60" height="60" fill="url(#gm)"/><rect x="11.5" y="18" width="37" height="25" rx="3.5" fill="#fff"/><path d="M12.5 20 30 32.5 47.5 20" fill="none" stroke="#1676f3" stroke-width="2.4" stroke-linejoin="round"/>`);
        case 'calendar': return W('', `<rect width="60" height="60" fill="#fff"/><text x="30" y="17.5" text-anchor="middle" font-size="${wdLong(2026, 10, 21).length > 5 ? 8 : 9.5}" font-weight="600" fill="#ff3b30" font-family="-apple-system,Pretendard,sans-serif">${wdLong(2026, 10, 21)}</text><text x="30" y="47" text-anchor="middle" font-size="31" font-weight="300" fill="#111" font-family="-apple-system,Pretendard,sans-serif">21</text>`);
        case 'clock': {
            const minute = nowMin(), h = Math.floor(minute / 60) % 12, m = minute % 60; let t = ''; for (let i = 0; i < 12; i++)t += `<path d="M30 8.5v${i % 3 ? 2.6 : 3.8}" stroke="#111" stroke-width="${i % 3 ? 1 : 1.6}" transform="rotate(${i * 30} 30 30)"/>`;
            return W('', `<rect width="60" height="60" fill="#000"/><circle cx="30" cy="30" r="24" fill="#fff"/>${t}<path d="M30 30V17" stroke="#111" stroke-width="2.6" stroke-linecap="round" transform="rotate(${h * 30 + m / 2} 30 30)"/><path d="M30 30V11.5" stroke="#111" stroke-width="1.8" stroke-linecap="round" transform="rotate(${m * 6} 30 30)"/><path d="M30 34V11" stroke="#ff9500" stroke-width="1" transform="rotate(${(m * 6 + 90) % 360} 30 30)"/><circle cx="30" cy="30" r="1.8" fill="#ff9500"/>`)
        }
        case 'x': return W('', `<rect width="60" height="60" fill="#050505"/><path d="M13 12h10l24 36H37L13 12Z" fill="none" stroke="white" stroke-width="2.7"/><path d="m44 12-30 36" stroke="white" stroke-width="3"/>`);
        case 'journal': return W('', `<rect width="60" height="60" fill="#294f47"/><path d="M14 13h28v36H14z" fill="#f4edcb"/><path d="M20 23h16M20 30h16M20 37h11" stroke="#709077" stroke-width="2"/>`);
        case 'notes': return W(L('gn', '#ffe27a', '#ffc933'), `<rect width="60" height="60" fill="#fff"/><rect width="60" height="17" fill="url(#gn)"/><g stroke="#d9d9de" stroke-width="1.2"><path d="M8 27h44M8 35h44M8 43h44M8 51h44"/></g><g fill="#cfcfd4"><circle cx="10" cy="17" r=".9"/><circle cx="14" cy="17" r=".9"/><circle cx="18" cy="17" r=".9"/><circle cx="22" cy="17" r=".9"/><circle cx="26" cy="17" r=".9"/><circle cx="30" cy="17" r=".9"/><circle cx="34" cy="17" r=".9"/><circle cx="38" cy="17" r=".9"/><circle cx="42" cy="17" r=".9"/><circle cx="46" cy="17" r=".9"/><circle cx="50" cy="17" r=".9"/></g>`);
        case 'weather': return W(L('gw', '#53b5ff', '#1f6fe0'), `<rect width="60" height="60" fill="url(#gw)"/><circle cx="23" cy="23" r="9.5" fill="#ffd84a"/><path d="M19 45h21.5a7.5 7.5 0 0 0 .6-15 10 10 0 0 0-19.2 3.2A6 6 0 0 0 19 45Z" fill="#fff"/>`);
        case 'settings': return W(L('gs', '#a7adb6', '#6d727b'), `<rect width="60" height="60" fill="url(#gs)"/><circle cx="30" cy="30" r="17" fill="none" stroke="#e9eaee" stroke-width="7" stroke-dasharray="4.4 4.5"/><circle cx="30" cy="30" r="14" fill="#878c95" stroke="#e9eaee" stroke-width="3.2"/><circle cx="30" cy="30" r="5.5" fill="none" stroke="#e9eaee" stroke-width="3"/><g stroke="#e9eaee" stroke-width="2.4"><path d="M30 17.5v7M30 35.5v7M17.5 30h7M35.5 30h7"/></g>`);
        case 'phone': return W(L('gph', '#65f38f', '#28c253'), `<rect width="60" height="60" fill="url(#gph)"/><g transform="translate(12 12) scale(1.5)" fill="#fff">${G.handset.replace(/<\/?svg[^>]*>/g, '')}</g>`);
        case 'safari': return W(L('gsa', '#3aa8ff', '#0f5fe0'), `<rect width="60" height="60" fill="#fff"/><circle cx="30" cy="30" r="21" fill="url(#gsa)"/><g fill="none" stroke="#fff" stroke-width="1.6" opacity=".95"><ellipse cx="30" cy="30" rx="8.5" ry="21"/><path d="M9 30h42M12 19.5h36M12 40.5h36M30 9v42"/></g>`);
        case 'kakao': return W('', `<rect width="60" height="60" fill="#fee500"/><path d="M30 14.5c-11.9 0-21.5 7.4-21.5 16.5 0 5.9 4 11.1 10 14l-2.2 7.8c-.2.7.6 1.3 1.2.8l9.2-6.1c1.1.1 2.2.2 3.3.2 11.9 0 21.5-7.4 21.5-16.6S41.9 14.5 30 14.5Z" fill="#3a1d1d"/><g fill="#fee500"><circle cx="21.5" cy="31" r="2.7"/><circle cx="30" cy="31" r="2.7"/><circle cx="38.5" cy="31" r="2.7"/></g>`);
        case 'music': return W(L('gmu', '#ff6f86', '#fa2b47'), `<rect width="60" height="60" fill="url(#gmu)"/><g transform="translate(11 10) scale(1.55)" fill="#fff">${G.musicNote.replace(/<\/?svg[^>]*>/g, '')}</g>`);
        case 'maps': return W('', `<rect width="60" height="60" fill="#e9f2df"/><path d="M0 38 60 22v12L0 50Z" fill="#fff"/><path d="M24 0h9L27 60h-9Z" fill="#ffd966"/><path d="M0 12c14 6 30-4 60 6V0H0Z" fill="#bfe3a5"/><path d="M42 60c0-8 10-10 18-12v12Z" fill="#9fd0f5"/><path d="M40 14a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8Z" fill="#ff3b30"/><circle cx="40" cy="22" r="3" fill="#fff"/>`);
        case 'rem': return W('', `<rect width="60" height="60" fill="#fff"/><circle cx="16" cy="19" r="4.5" fill="#007aff"/><circle cx="16" cy="31" r="4.5" fill="#ff3b30"/><circle cx="16" cy="43" r="4.5" fill="#ff9500"/><g stroke="#d6d6db" stroke-width="2"><path d="M25 19h24M25 31h24M25 43h24"/></g>`);
    }return ''
}

/* ---------- 사운드 (WebAudio로 직접 합성) ---------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC }
function tone(f, t0, dur, vol = .12, type = 'sine') { if (!appPrefs.sound) return; const a = ac(); if (!a) return; const t = a.currentTime + t0, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .008); gn.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + dur + .05) }
function sfx(k) { if (k === 'key') tone(2400, 0, .025, .035, 'triangle'); else if (k === 'msg') { tone(1046, 0, .22, .09); tone(1397, .1, .32, .09) } else if (k === 'send') { tone(620, 0, .07, .05); tone(930, .05, .09, .05) } else if (k === 'unlock') { tone(1300, 0, .05, .04, 'triangle'); tone(1700, .04, .05, .03, 'triangle') } else if (k === 'lock') tone(500, 0, .06, .05, 'triangle') }
function ringOnce() { [[784, 0], [988, .2], [1175, .4], [988, .6], [784, 1.0], [988, 1.2], [1175, 1.4], [1319, 1.6]].forEach(([f, t]) => { tone(f, t, .35, .11); tone(f * 2, t, .18, .03) }) }
document.addEventListener('pointerdown', () => ac(), { once: true });

/* ---------- 상태바 / 아일랜드 ---------- */
function setStatus(dark) { curDark = !!dark; $('#sb').classList.toggle('light', curDark); $('#hb').classList.toggle('light', curDark) }
function updateIsland() { updateCrumb(); $('#island').classList.remove('act') }

/* ============================================================
   잠금화면 / 암호
   ============================================================ */
function ncardHTML(n) {
    const ic = n.app === 'kakao' ? `<div class="ni" style="position:relative;overflow:visible"><img src="assets/photo-1.jpg" style="width:38px;height:38px;border-radius:50%;object-fit:cover;display:block"><span style="position:absolute;right:-4px;bottom:-4px;width:18px;height:18px;border-radius:5px;overflow:hidden;border:1.5px solid rgba(255,255,255,.9)">${appIcon('kakao')}</span></div>` : `<div class="ni">${appIcon(n.app)}</div>`;
    return `${ic}<div class="nt"><div class="nh"><span>${esc(n.title)}</span><small>${n.time}</small></div><div class="nb">${esc(n.body)}</div></div>`
}
function renderLock() {
    $('#lkc').innerHTML = `<div class="lk-date">${fmtLockDate()}</div><div class="lk-time" id="lkt">${clock12()}</div>
 <div class="lk-langw"><button class="lk-lang" onclick="event.stopPropagation();openLangSheet()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.5 5.8 3.5 9s-1 6.2-3.5 9c-2.5-2.8-3.5-5.8-3.5-9s1-6.2 3.5-9Z"/></svg>${(window.LANGS || []).find(l => l[0] === LANG)?.[1] || ''}</button></div>
 <div class="lk-notes">${lockNotes.map((n, i) => `<button class="ncard" data-i="${i}" onclick="lockNoteTap(${i},event)">${ncardHTML(n)}</button>`).join('')}</div>
 <button class="lk-btn" style="left:46px;${flashOn ? 'background:#fff;color:#000' : ''}" onclick="event.stopPropagation();flashOn=!flashOn;vib(15);renderLock()">${G.flash.replace('<svg', '<svg width="24" height="24" style="color:' + (flashOn ? '#000' : '#fff') + '"')}</button>
 <button class="lk-btn" style="right:46px" onclick="event.stopPropagation();vib(15);this.animate([{transform:'scale(1.2)'},{transform:'none'}],250)">${G.camera.replace('<svg', '<svg width="24" height="24" style="color:#fff"')}</button>
 <div class="lk-hint">${t('swipeUp')}</div>`
}
function openLangSheet() {
    vib(10); const d = document.createElement('div'); d.id = 'langSheet';
    d.innerHTML = `<div class="ls-g"><div class="ls-h">Language · 언어</div>${(window.LANGS || []).map(l => `<button class="${l[0] === LANG ? 'on' : ''}" data-l="${l[0]}">${l[1]}${l[0] === LANG ? ' ✓' : ''}</button>`).join('')}</div><button class="ls-c">${t('cancel')}</button>`;
    const close = () => { d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).onfinish = () => d.remove() };
    d.onclick = e => { e.stopPropagation(); const b = e.target.closest('[data-l]'); if (b) { if (b.dataset.l === LANG) return close(); setLang(b.dataset.l); return } if (e.target === d || e.target.closest('.ls-c')) close() };
    d.addEventListener('pointerdown', e => e.stopPropagation());
    $('#phone').appendChild(d); d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); d.querySelector('.ls-g').animate([{ transform: 'translateY(60px)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.9,.25,1)' })
}
function lockNoteTap(i, e) { e.stopPropagation(); if (lockNotes[i].app === 'kakao') pendingOpen = 'chat'; goPin() }
(function lockDrag() {
    const el = $('#lkc'); let y0 = null, dy = 0, moved = false;
    el.addEventListener('pointerdown', e => { if (view !== 'lock' || e.target.closest('button')) return; y0 = e.clientY; dy = 0; moved = false; el.setPointerCapture(e.pointerId) });
    el.addEventListener('pointermove', e => { if (y0 === null) return; dy = Math.min(0, (e.clientY - y0) / SC); if (Math.abs(dy) > 6) moved = true; el.style.transform = `translateY(${dy}px)`; el.style.opacity = 1 + dy / 500; $('#wall').style.filter = `blur(${Math.min(24, -dy / 8)}px) brightness(${1 - Math.min(.38, -dy / 700)})` });
    el.addEventListener('pointerup', e => {
        if (y0 === null) return; const d = dy; y0 = null; $('#wall').style.filter = '';
        if (d < -70 || !moved && !e.target.closest('button')) { goPin(d) } else { el.animate([{ transform: `translateY(${d}px)`, opacity: 1 + d / 500 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'cubic-bezier(.2,1.3,.4,1)' }); el.style.transform = ''; el.style.opacity = '' }
    });
})();
function goPin(fromDy = 0) {
    view = 'pin'; pincode = ''; const lk = $('#lkc'); lk.animate([{ transform: `translateY(${fromDy}px)`, opacity: Math.max(0, 1 + fromDy / 500) }, { transform: 'translateY(-120px)', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
    lk.style.transform = ''; lk.style.opacity = ''; lk.style.pointerEvents = 'none'; $('#wall').classList.add('dim'); renderPin(); const p = $('#pinL'); p.style.display = 'flex'; p.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1)' })
}
const PL = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
function renderPin() {
    $('#pinL').innerHTML = `<div class="pt">${t('enterPass')}</div><div class="pdots" id="pdots">${[0, 1, 2, 3].map(i => `<i class="${i < pincode.length ? 'on' : ''}"></i>`).join('')}</div>
 <div class="pkeys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="pk" onpointerdown="pinPress('${n}',this)"><b>${n}</b><small>${PL[n - 1]}</small></button>`).join('')}<span></span><button class="pk" onpointerdown="pinPress('0',this)"><b>0</b><small></small></button><span></span></div>
 <div class="pbot"><button onclick="vib(10)">${t('emergency')}</button><button id="pcancel" onclick="pinCancelOrDel()">${pincode ? t('delete') : t('cancel')}</button></div>`
}
function pinDots() { $('#pdots').innerHTML = [0, 1, 2, 3].map(i => `<i class="${i < pincode.length ? 'on' : ''}"></i>`).join(''); $('#pcancel').textContent = pincode ? t('delete') : t('cancel') }
function pinPress(n, el) {
    if (pincode.length >= 4) return; el.classList.add('dn'); setTimeout(() => el.classList.remove('dn'), 90); sfx('key'); vib(8); pincode += n; pinDots();
    if (pincode.length === 4) { if (pincode === '0000') { setTimeout(unlock, 140) } else { setTimeout(() => { const d = $('#pdots'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); vib([60, 40, 60]); setTimeout(() => { pincode = ''; pinDots() }, 420) }, 120) } }
}
function pinCancelOrDel() { if (pincode) { pincode = pincode.slice(0, -1); pinDots(); return } pinCancel() }
function pinCancel() {
    view = 'lock'; const p = $('#pinL'); p.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(30px)' }], { duration: 300 }).onfinish = () => p.style.display = 'none';
    const lk = $('#lkc'); lk.getAnimations().forEach(a => a.cancel()); lk.style.pointerEvents = ''; lk.animate([{ transform: 'translateY(-120px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,.9,.25,1)' }); $('#wall').classList.remove('dim')
}
function unlock() {
    sfx('unlock'); view = 'home'; $('#wall').classList.remove('dim');
    LOCK.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => { LOCK.style.visibility = 'hidden'; $('#pinL').style.display = 'none'; $('#lkc').getAnimations().forEach(a => a.cancel()); $('#lkc').style.pointerEvents = '' };
    renderHome(); HOME.style.visibility = 'visible'; HOME.animate([{ transform: 'scale(1.18)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.2,.9,.22,1)' });
    [...HOME.querySelectorAll('.app,.widget')].forEach((el, i) => el.animate([{ transform: 'scale(.7)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 30 + i * 14, easing: 'cubic-bezier(.2,1.1,.3,1)', fill: 'backwards' }));
    setStatus(true); if (pendingOpen) { pendingOpen = null; setTimeout(() => { chatId = 'Hanni'; openApp('chat', HOME.querySelector('.app[data-app="kakao"] .icon')) }, 520) }
}

/* ============================================================
   홈 화면
   ============================================================ */
function badgeOf(id) { if (id === 'phone') return 3 + declined; if (id === 'mail') return [0, 1].filter(i => !readMail.has(i)).length; if (id === 'kakao') return Object.values(unread).reduce((a, b) => a + b, 0) + hanniUnread; return 0 }
function appBtn(id) { const b = badgeOf(id); return `<button class="app" data-app="${id}" onclick="openApp('${id}',this.firstElementChild)"><div class="icon"><div class="ic">${appIcon(id)}</div>${b ? `<span class="bdg">${b}</span>` : ''}</div><span class="lbl">${t('app_' + id)}</span></button>` }
function renderHome() {
    HOME.innerHTML = `<div class="hgrid">
  <button class="widget wcal" data-app="calendar" onclick="openApp('calendar',this)"><div class="wd">${wdLong(2026, 10, 21)}</div><div class="wn">21</div>${(events[21] || []).map(x => `<div class="we">${esc(x.split(' · ')[0])}<small>${esc(x.split(' · ')[1] || t('allDay'))}</small></div>`).join('')}</button>
  <button class="widget wwx" data-app="weather" onclick="openApp('weather',this)"><div class="c">${t('seoul')} ➚</div><div class="tp">22°</div><span style="position:absolute;top:14px;right:14px">${G.cloud}</span><div class="ds">${t('mostlySunny')}<small>${t('hiLo')}</small></div></button>
  ${['instagram', 'photos', 'mail', 'calendar', 'clock', 'notes', 'weather', 'settings', 'maps', 'journal', 'x'].map(appBtn).join('')}
 </div><button class="spot" onclick="showSearch()">${G.search.replace('<svg', '<svg width="13" height="13"')}${t('search')}</button>
 <div class="dock">${['phone', 'safari', 'kakao', 'music'].map(appBtn).join('')}</div>`
}

/* ============================================================
   화면 전환 엔진
   ============================================================ */
const PARENT = { note: 'notes', chat: 'kakao', maild: 'mail', reel: 'instagram', screentime: 'settings' };
const rootOf = v => PARENT[v] || v;
function viewDark() { if (['lock', 'pin', 'home'].includes(view)) return true; const p = APP.lastElementChild; return !!(p && p.dataset.dark) }
function wireScroll(pg) { const sc = pg.querySelector('.scroll'); if (sc) sc.addEventListener('scroll', () => pg.classList.toggle('scrolled', sc.scrollTop > 38), { passive: true }) }
function show(id, anim = 'swap') {
    const old = [...APP.children]; old.forEach(o => { o.querySelectorAll('video').forEach(v => v.pause()) });
    if (PLAYER.dataset.voice && !(id === 'chat')) { PLAYER.pause() }
    view = id; const v = VIEWS[id](); const pg = document.createElement('div'); pg.className = 'pg ' + (v.cls || ''); pg.innerHTML = v.html; pg.dataset.view = id; pg.dataset.dark = v.dark ? '1' : '';
    if (anim === 'pop') APP.insertBefore(pg, APP.firstChild); else APP.appendChild(pg);
    setStatus(v.dark); wireScroll(pg);
    const done = () => old.forEach(o => o.remove());
    if (anim === 'push') { pg.classList.add('pushed'); pg.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], T); old.forEach(o => o.animate([{ transform: 'none', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(.92)' }], T)); setTimeout(done, T.duration) }
    else if (anim === 'pop') { pg.animate([{ transform: 'translateX(-28%)', filter: 'brightness(.92)' }, { transform: 'none', filter: 'brightness(1)' }], T); old.forEach(o => { o.classList.add('pushed'); o.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { ...T, fill: 'forwards' }) }); setTimeout(done, T.duration) }
    else done();
    v.init && v.init(pg); updateIsland(); return pg
}
function zoomFrames(r) {
    const W = SCREEN.clientWidth, H = SCREEN.clientHeight, s = r.w / W, iy = Math.max(0, (H - r.h / s) / 2), dx = r.x + r.w / 2 - W / 2, dy = r.y + r.h / 2 - H / 2;
    return [{ transform: `translate(${dx}px,${dy}px) scale(${s})`, clipPath: `inset(${iy}px 0px round ${15 / s}px)`, opacity: .25 }, { transform: 'translate(0px,0px) scale(1)', clipPath: `inset(0px 0px round ${devRadius()}px)`, opacity: 1 }]
}
function openApp(id, el) {
    if (callState) return; if (view !== 'home') { return }
    lastRect = el ? relRect(el) : null; APP.innerHTML = ''; show(id, 'none'); const tok = ++animTok;
    APP.style.visibility = 'visible'; APP.getAnimations().forEach(a => a.cancel());
    APP.animate(zoomFrames(lastRect || { x: 166, y: 396, w: 60, h: 60 }), { duration: 540, easing: 'cubic-bezier(.2,.9,.22,1)' });
    HOME.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(1.1)', opacity: 0 }], { duration: 400, easing: 'ease-in' }).onfinish = () => { if (tok === animTok && view !== 'home') HOME.style.visibility = 'hidden' };
    if (firstOpen) { firstOpen = false; setTimeout(() => { $('#hb').classList.add('pulse'); setTimeout(() => $('#hb').classList.remove('pulse'), 3400) }, 900) }
}
function closeApp() {
    if (callState || ['home', 'lock', 'pin'].includes(view)) return;
    const root = rootOf(view); if (PLAYER.dataset.voice) PLAYER.pause();
    view = 'home'; renderHome(); HOME.style.visibility = 'visible'; setStatus(true);
    const icon = HOME.querySelector(`.app[data-app="${root}"] .icon`); const r = icon ? relRect(icon) : { x: 166, y: 396, w: 60, h: 60 };
    const tok = ++animTok; APP.getAnimations().forEach(a => a.cancel());
    const a = APP.animate(zoomFrames(r).reverse(), { duration: 460, easing: 'cubic-bezier(.3,.75,.2,1)', fill: 'forwards' });
    a.onfinish = () => { if (tok !== animTok) return; APP.style.visibility = 'hidden'; APP.querySelectorAll('video').forEach(v => v.pause()); APP.innerHTML = ''; a.cancel() };
    HOME.animate([{ transform: 'scale(1.1)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.2,.9,.22,1)' }); updateIsland()
}
function push(id) { show(id, 'push') }
function back() { if (PARENT[view]) show(PARENT[view], 'pop'); else closeApp() }
function hbAction() {
    if (callState) return; const vw = OV.querySelector('.viewer'); if (vw) return closeViewer();
    if (view === 'lock') return goPin(); if (view === 'pin') return; if (view === 'home') return HOME.animate([{ transform: 'none' }, { transform: 'scale(.97)' }, { transform: 'none' }], 250); closeApp()
}
(function hbGesture() { const hb = $('#hb'); let y0 = null; hb.addEventListener('pointerdown', e => { y0 = e.clientY; hb.setPointerCapture(e.pointerId) }); hb.addEventListener('pointerup', e => { if (y0 === null) return; y0 = null; hbAction() }); hb.addEventListener('pointercancel', () => { y0 = null }) })();
function edgeBackIntent(dx, dy) { return dx > 90 && Math.abs(dx) > Math.abs(dy) * 1.3 }
(function edgeBack() {
    let x0 = null, y0 = 0, pg = null;
    const cancel = () => { x0 = null; if (pg) pg.style.transform = ''; pg = null };
    SCREEN.addEventListener('pointerdown', e => { const r = SCREEN.getBoundingClientRect(); if (callState || !PARENT[view] || (e.clientX - r.left) / SC > 22) return; x0 = e.clientX; y0 = e.clientY; pg = APP.lastElementChild });
    SCREEN.addEventListener('pointermove', e => { if (x0 === null) return; const dx = (e.clientX - x0) / SC, dy = (e.clientY - y0) / SC; if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { cancel(); return } if (pg) pg.style.transform = `translateX(${Math.max(0, dx)}px)` });
    SCREEN.addEventListener('pointerup', e => { if (x0 === null) return; const commit = edgeBackIntent((e.clientX - x0) / SC, (e.clientY - y0) / SC); cancel(); if (commit) back() });
    SCREEN.addEventListener('pointercancel', cancel);
})();
/* 뒤로가기: 상태바 '◀ 홈' + 브라우저/안드로이드 뒤로 버튼 + Backspace + 마우스 뒤로 버튼 */
function goBack() {
    if (callState) return; const ls = document.getElementById('langSheet'); if (ls) { ls.remove(); return }
    if (OV.querySelector('.viewer')) return closeViewer();
    if (['lock', 'pin', 'home'].includes(view)) { if (view === 'pin') pinCancel(); return } back()
}
function updateCrumb() { const on = !['lock', 'pin', 'home'].includes(view) && !callState; $('#sb').classList.toggle('crumb', on) }
$('#sbk').innerHTML = `<svg viewBox="0 0 7 12"><path d="M6 1 1 6l5 5"/></svg>${t('home')}`;
$('#sbk').addEventListener('click', e => { e.stopPropagation(); if (callState) return; if (OV.querySelector('.viewer')) closeViewer(); closeApp() });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hbAction(); else if (e.key === 'Backspace' && !e.target.closest('input,textarea')) { e.preventDefault(); goBack() } });
document.addEventListener('mouseup', e => { if (e.button === 3) { e.preventDefault(); goBack() } });
try { history.pushState({ wb: 1 }, ''); addEventListener('popstate', () => { goBack(); history.pushState({ wb: 1 }, '') }) } catch (e) { }

/* ---------- 공통 템플릿 ---------- */
function navHTML(o) { return `<div class="nav ${o.solid ? 'solid' : ''}">${o.back !== undefined ? `<button class="nb-back" onclick="${o.backFn || 'back()'}">${G.chevL}${o.back}</button>` : (o.left || '<span></span>')}<div class="nb-title">${o.title || ''}</div><div class="nb-right">${o.right || ''}</div></div>` }
function tabbar(items, on, cls = '', app = '') { return `<div class="tabbar ${cls}">${items.map(([ic, l], i) => `<button class="${i === on ? 'on' : ''}" ${app ? `onclick="deviceTab('${app}',${i})"` : ''}>${G[ic] || ic}<span>${l}</span></button>`).join('')}</div>` }
const sw = (on, fn) => `<button class="sw ${on ? 'on' : ''}" onclick="this.classList.toggle('on');vib(8);${fn || ''}"></button>`;

/* ============================================================
   앱 화면들
   ============================================================ */
const VIEWS = {};

/* --- 메모 --- */
function noteDate(d, full) { const [y, m, dd] = d.split('-').map(Number); if (full) return fmtYMD(y, m, dd); if (d === '2026-10-21') return fmtTime(7 * 60 + 42); if (d === '2026-10-20') return t('yesterday'); const diff = (new Date(2026, 9, 21) - new Date(y, m - 1, dd)) / 864e5; if (diff < 7) return wdLong(y, m, dd); return fmtNum(y, m, dd) }
const noteRow = (n, i) => `<button class="row tap" onclick="noteId=${i};push('note')"><b>${esc(n[0])}</b><small><em>${noteDate(n[3])}</em>${esc(n[1])}</small></button>`;
VIEWS.notes = () => ({
    cls: 'grouped notes-pg', html: navHTML({ title: t('app_notes'), back: t('folders'), right: G.dots }) + `<div class="scroll"><h1 class="lt">${t('app_notes')}</h1><div class="srch">${G.search}${t('search')}</div>
 <div class="gh" style="margin-top:8px">📌 ${t('pinned')}</div><div class="group note-l">${notes.slice(0, 4).map((n, i) => noteRow(n, i)).join('')}</div>
 <div class="gh">${t('notesSec')}</div><div class="group note-l">${notes.slice(4).map((n, i) => noteRow(n, i + 4)).join('')}</div></div>
 <div class="toolbar"><span style="width:24px"></span><span style="color:#000;align-self:center;font-size:11px">${t('nNotes', notes.length)}</span>${G.compose}</div>`
});
VIEWS.note = () => { const n = notes[noteId]; return { cls: 'notes-pg', html: navHTML({ title: '', back: t('app_notes'), right: G.share + G.dots, solid: false }) + `<div class="scroll"><div class="note-v"><div class="nd">${noteDate(n[3], true)}</div><h2>${esc(n[0])}</h2>${esc(n[2])}</div></div><div class="toolbar">${G.check}${G.camera}${G.pen}${G.compose}</div>` } };

/* --- 캘린더 --- */
function calEvents() { if (calMonth !== 10) return []; return selectedDay === 6 ? ['🎂 ' + t('bdayEvent')] : events[selectedDay] || [] }
VIEWS.calendar = () => {
    const nov = calMonth === 10, first = new Date(2026, calMonth - 1, 1).getDay(), days = new Date(2026, calMonth, 0).getDate(); let c = ''; for (let i = 0; i < first; i++)c += '<div></div>';
    for (let d = 1; d <= days; d++) { const dow = (first + d - 1) % 7, has = nov && (d === 6 || !!events[d]), td = nov && d === 21; c += `<button class="cal-d ${td ? 'td' : ''} ${d === selectedDay ? 'sel' : ''} ${dow === 0 || dow === 6 ? 'we' : ''}" onclick="selectedDay=${d};show('calendar')"><span>${d}</span>${has ? '<i></i>' : ''}</button>` }
    const ev = calEvents().map(x => { const m = x.split(' · '); return `<div class="evt"><span class="bar" style="background:${x.startsWith('🎂') ? '#ff9500' : '#af52de'}"></span><b>${esc(m[0])}</b><small>${m[1] || t('allDay')}</small></div>` }).join('') || `<div class="evt muted">${t('noEvents')}</div>`;
    return {
        html: navHTML({ title: '', back: fmtYear(2026), backFn: 'closeApp()', right: G.list + G.search + G.plus }) + `<div class="scroll" style="padding-bottom:120px"><div style="display:flex;justify-content:space-between;align-items:center;margin:0 16px 8px"><h1 class="lt" style="margin:0">${fmtMonth(calMonth)}</h1><span style="display:flex;gap:26px;color:var(--blue)"><button style="width:22px" onclick="calNav(-1)">${G.chevLb}</button><button style="width:22px" onclick="calNav(1)">${G.chevRb}</button></span></div>
 <div class="cal-g cal-w">${wdNarrow().map(w => `<div>${w}</div>`).join('')}</div><div class="cal-g" id="calg">${c}</div><div style="border-top:.5px solid var(--sep);margin-top:4px;padding-top:4px">${ev}</div></div>
 <div class="tabbar" style="color:#ff3b30">${[t('today'), t('calendars'), t('inbox')].map((x, i) => `<button onclick="calendarAction(${i})" style="color:#ff3b30;font-size:16px;justify-content:center">${x}</button>`).join('')}</div>`
    }
};
function calNav(d) { const n = calMonth + d; if (n < 9 || n > 10) return; calMonth = n; selectedDay = n === 10 ? 21 : 1; const pg = show('calendar'); pg.querySelector('#calg').animate([{ transform: `translateX(${d * 40}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'cubic-bezier(.2,.9,.25,1)' }) }

/* --- 시계 --- */
VIEWS.clock = () => ({
    cls: 'dark', dark: true, html: `<div class="nav" style="color:#ff9f0a"><button disabled aria-disabled="true" title="Alarm editing unavailable" style="color:#ff9f0a;font-size:17px;justify-self:start;padding-left:8px;opacity:.4">${t('edit')}</button><div class="nb-title">${t('alarm')}</div><div class="nb-right" style="color:#ff9f0a">${G.plus}</div></div><div class="scroll"><h1 class="lt">${t('alarm')}</h1>
 <div style="margin:10px 16px 4px;font-size:15px;font-weight:600;display:flex;gap:6px;align-items:center">${t('sleepWake')}</div><div style="padding:8px 16px 14px;color:#8e8e93;font-size:15px;border-bottom:.5px solid rgba(255,255,255,.15)">${t('noAlarm')} <span style="float:right;color:#ff9f0a">${t('setUp')}</span></div>
 <div style="margin:18px 16px 4px;font-size:15px;font-weight:600">${t('other')}</div>
 ${Array.from({ length: 7 }, (_, i) => `<div class="alarm ${alarmStates[i] ? '' : 'off'}"><div><div class="at">${(p => p.before ? `<small>${p.dp}</small>${p.tm}` : `${p.tm}<small style="margin-left:4px">${p.dp}</small>`)(alarmParts(7, i))}</div><div class="al">${t('alarmLabel')}</div></div>${sw(alarmStates[i], `alarmStates[${i}]=!alarmStates[${i}];this.closest('.alarm').classList.toggle('off',!alarmStates[${i}]);saveProgress()`)}</div>`).join('')}</div>
 ${tabbar([['globe', t('worldClock')], ['alarm', t('alarm')], ['stopwatch', t('stopwatch')], ['timer', t('timer')]], 1, '', 'clock').replace('class="on"', 'class="on" style="color:#ff9f0a"')}`
});

/* --- 전화 --- */
function callWhen(s) { if (s.startsWith('오늘 ')) { const [h, m] = s.slice(3).split(':').map(Number); return ampm(h * 60 + m) } const w = s.split(' ')[0]; if (w === '어제') return t('yesterday'); if (KO_WD[w] != null) { return wdLong(2026, 10, 11 + KO_WD[w]) } return w }
const callNameDisp = n => n.replace(/^(.+?)( \(\d+\))?$/, (m, a, b) => dn(a) + (b || ''));
VIEWS.phone = () => {
    const all = [...extraCalls, ...calls].filter(c => !missOnly || c[2] === '부재중');
    return {
        html: `<div class="nav"><button disabled aria-disabled="true" title="Call history editing unavailable" style="color:var(--blue);font-size:17px;justify-self:start;padding-left:8px;opacity:.4">${t('edit')}</button><div class="seg"><button class="${missOnly ? '' : 'on'}" onclick="missOnly=false;show('phone')">${t('all')}</button><button class="${missOnly ? 'on' : ''}" onclick="missOnly=true;show('phone')">${t('missed')}</button></div><span></span></div>
 <div class="scroll"><h1 class="lt">${t('recents')}</h1><div class="srch">${G.search}${t('search')}</div>
 ${all.map(c => `<div class="prow ${c[2] === '부재중' ? 'miss' : ''}" style="cursor:pointer" onclick="dial('${esc(c[0].replace(/ \(\d+\)$/, ''))}')"><span class="pi">${c[2] === '발신' ? '<svg viewBox="0 0 24 24"><path d="M6.6 3.2c.6-.3 1.4-.1 1.8.5l1.9 3c.4.6.3 1.4-.2 1.9l-1.4 1.3a12.4 12.4 0 0 0 5.4 5.4l1.3-1.4c.5-.5 1.3-.6 1.9-.2l3 1.9c.6.4.8 1.2.5 1.8l-.9 1.9c-.5 1-1.6 1.6-2.7 1.4C10 19.6 4.4 14 3.3 6.8c-.2-1.1.4-2.2 1.4-2.7Z"/></svg>' : ''}</span><div class="pn"><b>${esc(callNameDisp(c[0]))}</b><small>${t('mobile')}</small></div><span class="pd">${callWhen(c[1])}</span><span class="inf">${G.info}</span></div>`).join('')}</div>
 ${tabbar([['star', t('favorites')], ['clock', t('recents')], ['contacts', t('contacts')], ['keypad', t('keypad')], ['voicemail', t('voicemail')]], 1, '', 'phone')}`
    }
};

/* --- 카카오톡 --- */
const isGroup = n => ['Jejak team', 'Exhibit desk'].includes(n);
const MEMBERS = { 'Jejak team': 5, 'Exhibit desk': 3 };
function lastDate(n) { const d = ((chatData[n] || []).filter(x => x[1] === 'date').slice(-1)[0] || [''])[0]; return d === '10월 20일' ? '어제' : d }
function dateKey(n) { if (n === 'Hanni') return 9999; const l = lastDate(n); if (l === '오늘') return 1021; if (l === '어제') return 1020; const m = l.match(/(\d+)월 (\d+)일/); return m ? +m[1] * 100 + +m[2] : 0 }
function previewText(s, grp) { const m = mediaLabels[s]; if (m) return m.kind === 'image' ? t('photo') : t('voiceMsg'); const b = s.match(/^\[(.+)\]$/); if (b) return /기프티콘/.test(b[1]) ? t('giftSent') : /파일/.test(b[1]) && !/영상/.test(b[1]) ? t('fileColon') + fileInfo(b[1])[0] : /영상/.test(b[1]) ? t('video') : t('photo'); return grp ? s.replace(/^.+?: /, '') : s }
function avatarFor(name, group) { if (/Hanni/.test(name)) return '<img src="assets/photo-1.jpg" alt="">'; if (group) return `<svg viewBox="0 0 24 24"><circle cx="8.5" cy="9" r="3" fill="#fff"/><circle cx="15.5" cy="9" r="3" fill="#fff"/><path d="M2.5 19c.4-3 2.9-5 6-5s5.6 2 6 5ZM9.5 19c.4-3 2.9-5 6-5s5.6 2 6 5Z" fill="#fff"/></svg>`; return G.sil }
function otherUnread() { return Object.entries(unread).filter(([k]) => k !== chatId).reduce((a, [, b]) => a + b, 0) + (chatId === 'Hanni' ? 0 : hanniUnread) }
VIEWS.kakao = () => {
    const list = chatNames.slice().sort((a, b) => dateKey(b) - dateKey(a));
    return {
        cls: 'kk', html: `<div class="kk-h"><b>${t('chats')}</b><span>${G.search}${G.chatPlus}${G.gear}</span></div><div class="scroll">${list.map(n => {
            const arr = chatData[n] || []; let last = arr.filter(x => x[1] !== 'date').slice(-1)[0], time = fmtLabel(lastDate(n)), cnt = unread[n] || 0;
            if (n === 'Hanni' && todayChat.length) { last = todayChat[todayChat.length - 1]; time = last[2]; cnt = hanniUnread }
            return `<button class="crow" onclick="chatId=${esc(JSON.stringify(n))};push('chat')"><div class="av">${avatarFor(n, isGroup(n))}</div><div style="flex:1;min-width:0"><div class="cn">${esc(dn(n))}${MEMBERS[n] ? `<small>${MEMBERS[n]}</small>` : ''}</div><div class="cp">${last ? esc(previewText(last[0], isGroup(n))) : ''}</div></div><div class="cm"><span class="ct">${time}</span>${cnt ? `<span class="kbdg">${cnt}</span>` : ''}</div></button>`
        }).join('')}</div>
 ${tabbar([['person', t('friends')], ['chat', t('chats')], ['openchat', t('openChat')], ['bag', t('shopping')], ['dotsH', t('more')]], 1, '', 'kakao')}`
    }
};
/* 채팅방 */
const AUD_DUR = { 'assets/demo-0.wav': '0:15', 'assets/demo-3.wav': '0:15' };
function fileInfo(n) { return ({ '과제 파일': [t('f_assign'), '1.2MB'], '수정한 과제 파일': [t('f_assign2'), '1.3MB'], '실기 체크 시트 파일': [t('f_check'), '48KB'] })[n] || [n + '.pdf', '820KB'] }
function bubble(s) {
    const m = mediaLabels[s];
    if (m && m.kind === 'image') return `<div class="bb img" onclick="event.stopPropagation();openViewerSrc('${m.src}',this.firstElementChild)"><img src="${m.src}" alt=""></div>`;
    if (m && m.kind === 'audio') { let w = ''; for (let i = 0; i < 20; i++)w += `<i style="height:${5 + Math.round(Math.abs(Math.sin(i * 1.7 + s.length)) * 15)}px;animation-delay:-${(i % 5) * .13}s"></i>`; return `<div class="bb aud" data-src="${m.src}" onclick="event.stopPropagation();playChatAudio(this)"><span class="pl">${G.playF}</span><span class="wv">${w}</span><span class="du">${AUD_DUR[m.src] || '0:10'}</span></div>` }
    const b = s.match(/^\[(.+)\]$/); if (b) {
        const n = b[1];
        if (/기프티콘/.test(n)) return `<div class="bb gift"><div class="gt">🍵</div><div class="gb"><b>${t('giftArrived')}</b>${t('giftItem')}</div><div class="gbtn">${t('giftCheck')}</div></div>`;
        if (/파일/.test(n) && !/영상/.test(n)) { const f = fileInfo(n); return `<div class="bb file"><span class="fi">${f[0].split('.').pop().toUpperCase()}</span><div><div class="fn">${esc(f[0])}</div><div class="fs">${t('expired')} · ${f[1]}</div></div></div>` }
        const vid = /영상/.test(n); return `<div class="bb exp">${vid ? G.video : G.photo}<span>${vid ? t('expVideo') : t('expPhoto')}</span></div>`
    }
    return `<div class="bb">${esc(s)}</div>`
}
function fullDate(l) { return fmtLabel(l, true) }
function chatItems(id) {
    const arr = id === 'Hanni' ? [...chatData[id], ...(todayChat.length ? [['오늘', 'date'], ...todayChat] : [])] : (chatData[id] || []); const grp = isGroup(id); const items = []; let tm = 0;
    arr.forEach((m, i) => {
        if (m[1] === 'date') { items.push({ date: m[0] }); return }
        let text = m[0], sender = id === 'Hanni' ? 'Hanni' : id; if (grp && m[1] === 'them') { const mm = text.match(/^(.+?): ([\s\S]*)$/); if (mm) { sender = mm[1]; text = mm[2] } }
        tm += 1; items.push({ who: m[1], text, sender, time: m[2] || ampm(tm), rd: m[3] === 'rd' })
    }); return items
}
function chatMsgs(id) {
    const it = chatItems(id), grp = isGroup(id); let o = '';
    it.forEach((x, i) => {
        if (x.date) { o += `<div class="dpill"><span>${G.calSm.replace('<svg', '<svg width="12" height="12"')}${fullDate(x.date)}</span></div>`; return }
        const p = it[i - 1], n = it[i + 1]; const first = !p || p.date || p.who !== x.who || p.sender !== x.sender; const last = !n || n.date || n.who !== x.who || n.sender !== x.sender || n.time !== x.time; const me = x.who === 'me';
        const tm = last ? `<div class="tm">${x.rd ? '<span class="rd">1</span>' : ''}<span>${x.time}</span></div>` : (x.rd ? '<div class="tm"><span class="rd">1</span></div>' : '');
        o += `<div data-chat-index="${i}" class="ln ${me ? 'me' : 'th'} ${first ? 'first' : ''}">${!me && first ? `<div class="sav">${avatarFor(x.sender)}</div>` : ''}<div class="col" style="${me ? 'align-items:flex-end' : ''}">${!me && first ? `<div class="who">${esc(dn(x.sender))}</div>` : ''}<div class="wrap">${me ? tm + bubble(x.text) : bubble(x.text) + tm}</div></div></div>`
    }); return o
}
function scrollChat(smooth) { const b = $('#msgs'); if (!b) return; if (smooth) b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); else b.scrollTop = b.scrollHeight }
function nearChatBottom(b) { return b.scrollHeight - b.clientHeight - b.scrollTop < 70 }
function refreshChat(pop, force = false) { const b = $('#msgs'); if (!b || view !== 'chat') return; const follow = force || nearChatBottom(b), top = b.scrollTop; b.innerHTML = chatMsgs(chatId); if (follow) { scrollChat(); clearNewChat() } else { b.scrollTop = top; if (pop) markNewChat() } if (pop) { const l = b.lastElementChild && b.lastElementChild.querySelector('.bb'); if (l) l.classList.add('pop') } }
function playChatAudio(el) {
    const src = el.dataset.src; document.querySelectorAll('.bb.aud').forEach(x => { x.classList.remove('playing'); x.querySelector('.pl').innerHTML = G.playF });
    if (PLAYER.dataset.voice === src && !PLAYER.paused) { PLAYER.pause(); return } PLAYER.src = src; PLAYER.dataset.voice = src; PLAYER.play().then(() => { el.classList.add('playing'); el.querySelector('.pl').innerHTML = G.pauseF }).catch(() => { });
    PLAYER.onended = () => { el.classList.remove('playing'); el.querySelector('.pl').innerHTML = G.playF; delete PLAYER.dataset.voice }
}
function showTyping() { if (!(view === 'chat' && chatId === 'Hanni')) return; const b = $('#msgs'); if (!b || $('#typ')) return; const follow = nearChatBottom(b); b.insertAdjacentHTML('beforeend', `<div class="ln th first" id="typ"><div class="sav">${avatarFor('Hanni')}</div><div class="col"><div class="who">Hanni</div><div class="wrap"><div class="bb typing pop"><i></i><i></i><i></i></div></div></div></div>`); if (follow) scrollChat(true) }
function hideTyping() { const t = $('#typ'); if (t) t.remove() }
function deliverHanni(text) {
    todayChat.push([text, 'them', nowAmpm()]);
    if (view === 'chat' && chatId === 'Hanni') { refreshChat(true); tone(1318, 0, .12, .05) }
    else { hanniUnread++; notify(text); if (view === 'kakao') show('kakao'); if (view === 'home') renderHome() } saveProgress()
}
function incomingMsg(text) { if (view === 'chat' && chatId === 'Hanni') { showTyping(); setTimeout(() => { hideTyping(); deliverHanni(text) }, 1500) } else deliverHanni(text) }

/* --- 알림 배너 --- */
function notify(body) {
    sfx('msg'); vib([30, 60, 30]);
    if (view === 'lock' || view === 'pin') { lockNotes.unshift({ title: 'Hanni', body, app: 'kakao', time: t('now') }); renderLock(); const c = document.querySelector('.lk-notes .ncard'); if (c) c.animate([{ transform: 'translateY(-30px) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.2,1.2,.4,1)' }); return }
    OV.querySelectorAll('.banner').forEach(b => b.remove()); const b = document.createElement('div'); b.className = 'banner'; b.innerHTML = `<div class="ncard">${ncardHTML({ title: 'Hanni', body, app: 'kakao', time: t('now') })}</div>`; OV.appendChild(b);
    b.animate([{ transform: 'translateY(-140%) scale(.96)' }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.2,1.25,.35,1)' });
    let y0 = null, dy = 0, mv = false; const hide = () => { if (!b.isConnected) return; b.animate([{ transform: `translateY(${Math.min(0, dy)}px)` }, { transform: 'translateY(-150%)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' }).onfinish = () => b.remove() };
    const tm = setTimeout(hide, 5600);
    b.addEventListener('pointerdown', e => { y0 = e.clientY; mv = false; b.setPointerCapture(e.pointerId) });
    b.addEventListener('pointermove', e => { if (y0 === null) return; dy = (e.clientY - y0) / SC; if (Math.abs(dy) > 5) mv = true; b.style.transform = `translateY(${dy < 0 ? dy : dy * .25}px)` });
    b.addEventListener('pointerup', () => { if (y0 === null) return; y0 = null; clearTimeout(tm); if (dy < -30) { hide(); return } b.style.transform = ''; if (!mv) { b.remove(); openHanni(b) } })
}
function openHanni(el) { if (callState || ['lock', 'pin'].includes(view)) return; if (view === 'chat' && chatId === 'Hanni') return; chatId = 'Hanni'; if (view === 'home') { openApp('chat', el?.querySelector ? el : null); return } push('chat') }

/* --- Mail --- */
function mailDate(s) { const m = s.match(/^(\d+)\/(\d+)$/); if (m) return fmtNum(2026, +m[1], +m[2]); if (s === '2025') return fmtNum(2025, 12, 2); if (s === '어제') return t('yesterday'); return s }
VIEWS.mail = () => ({
    html: navHTML({ title: t('inbox'), back: t('mailboxes'), backFn: 'closeApp()', right: t('edit') }) + `<div class="scroll"><h1 class="lt">${t('inbox')}</h1><div class="srch">${G.search}${t('search')}</div>
 ${emails.map((e, i) => `<button class="mrw" onclick="mailId=${i};readMail.add(${i});push('maild')"><span class="dot ${i < 2 && !readMail.has(i) ? '' : 'r'}"></span><div class="bd"><div class="l1"><b>${esc(e[0])}</b><span>${mailDate(e[3])}${G.chevR}</span></div><div class="sj">${esc(e[1])}</div><div class="pv">${esc(e[2])}</div></div></button>`).join('')}</div>
 <div class="toolbar">${G.filter}<span style="color:#000;font-size:11px;text-align:center;align-self:center">${t('updatedNow')}</span>${G.compose}</div>`
});
VIEWS.maild = () => {
    const e = emails[mailId], school = ![2, 4].includes(mailId); const body = e[2];
    return { html: navHTML({ title: '', back: t('inbox'), right: '', solid: false }) + `<div class="scroll"><div class="mail-d"><div class="hd"><span class="ini">${esc(e[0][0])}</span><div style="flex:1"><b>${esc(e[0])}</b><small>${t('toMe')}</small></div><small class="muted">${mailDate(e[3])}</small></div><h2>${esc(e[1])}</h2><div class="bd">${esc(body)}</div></div></div><div class="toolbar">${G.trash}${G.bookmark}${G.share.replace('M12 3v12M8 7l4-4 4 4', 'M9 15 4 10l5-5M4 10h10a6 6 0 0 1 6 6v3')}${G.compose}</div>` }
};

/* --- 사진 --- */
const allPhotos = []; photoSections.forEach(s => s[1].forEach(n => allPhotos.push({ src: 'assets/' + n, sec: s[0], sub: s[2] })));
const STORY_I = allPhotos.length; allPhotos.push({ src: 'assets/story.svg', thumb: 'assets/story.svg', sec: '2026년 10월 20일', sub: t('screenshot', fmtTime(21 * 60 + 41)) });
/* 사진 뷰어 */
let vList = allPhotos, vIdx = 0;
function fitRect(nw, nh) { const W = SCREEN.clientWidth, H = SCREEN.clientHeight, s = Math.min(W / nw, H / nh); const w = nw * s, h = nh * s; return { x: (W - w) / 2, y: (H - h) / 2, w, h } }
function placeImg(img) { const f = fitRect(img.naturalWidth || 1, img.naturalHeight || 1); Object.assign(img.style, { left: f.x + 'px', top: f.y + 'px', width: f.w + 'px', height: f.h + 'px' }); return f }
function flipFrom(img, r, f) { const s = Math.max(r.w / f.w, r.h / f.h), ix = Math.max(0, (f.w * s - r.w) / 2 / s), iy = Math.max(0, (f.h * s - r.h) / 2 / s); return { transform: `translate(${r.x + r.w / 2 - (f.x + f.w / 2)}px,${r.y + r.h / 2 - (f.y + f.h / 2)}px) scale(${s})`, clipPath: `inset(${iy}px ${ix}px round ${8 / s}px)` } }
function openViewerSrc(src, el) { vList = [{ src, sec: t('app_kakao'), sub: t('photo') }]; openViewer(0, el, true) }
async function openViewer(i, el, custom) {
    if (!custom) vList = allPhotos; vIdx = i; const p = vList[i]; const r = el ? relRect(el) : null;
    const v = document.createElement('div'); v.className = 'viewer'; v.innerHTML = `<div class="vbg"></div><img class="vi" src="${p.src}" alt=""><div class="vt"><button class="nb-back" onclick="closeViewer()">${G.chevL}</button><div class="ttl" id="vttl"></div><div class="nb-right" style="color:#fff">${t('edit')}</div></div><div class="vb">${G.share}${G.heart}${G.info}${G.trash}</div>`; OV.appendChild(v); setVTitle(); setStatus(true);
    const img = v.querySelector('.vi'); try { await img.decode() } catch (e) { } const f = placeImg(img);
    if (r) { img.animate([flipFrom(img, r, f), { transform: 'none', clipPath: `inset(0px 0px round 0px)` }], { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1)' }) }
    v.querySelector('.vbg').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });[...v.querySelectorAll('.vt,.vb')].forEach(x => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 }));
    viewerGestures(v)
}
function setVTitle() { const p = vList[vIdx]; const T_ = $('#vttl'); if (T_) T_.innerHTML = `${esc(fmtLabel(p.sec))}<small>${esc(p.sub || t('photo'))}</small>` }
function closeViewer() {
    const v = OV.querySelector('.viewer'); if (!v) return; const img = v.querySelector('.vi'); const th = vList === allPhotos ? document.querySelector(`[data-pi="${vIdx}"] img`) : null;
    const f = { x: parseFloat(img.style.left), y: parseFloat(img.style.top), w: parseFloat(img.style.width), h: parseFloat(img.style.height) };
    const cur = getComputedStyle(img).transform;
    if (th && view === 'photos') { th.scrollIntoView({ block: 'nearest' }); const r = relRect(th); img.animate([{ transform: cur === 'none' ? 'none' : cur }, flipFrom(img, r, f)], { duration: 380, easing: 'cubic-bezier(.3,.8,.25,1)', fill: 'forwards' }) }
    else img.animate([{ transform: cur === 'none' ? 'none' : cur, opacity: 1 }, { transform: 'scale(.85)', opacity: 0 }], { duration: 300, fill: 'forwards' });
    v.querySelector('.vbg').animate([{ opacity: getComputedStyle(v.querySelector('.vbg')).opacity }, { opacity: 0 }], { duration: 360, fill: 'forwards' });[...v.querySelectorAll('.vt,.vb')].forEach(x => x.style.opacity = 0);
    setTimeout(() => { v.remove(); setStatus(viewDark()); updateIsland() }, 390)
}
function viewerGestures(v) {
    const img = v.querySelector('.vi'), bg = v.querySelector('.vbg'); let x0 = null, y0 = 0, dx = 0, dy = 0, mode = null;
    v.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; mode = null; v.setPointerCapture(e.pointerId) });
    v.addEventListener('pointermove', e => {
        if (x0 === null) return; dx = (e.clientX - x0) / SC; dy = (e.clientY - y0) / SC; if (!mode && Math.hypot(dx, dy) > 8) mode = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        if (mode === 'h') img.style.transform = `translateX(${dx}px)`; if (mode === 'v') { const k = Math.max(.6, 1 - Math.max(0, dy) / 900); img.style.transform = `translate(${dx}px,${dy}px) scale(${k})`; bg.style.opacity = Math.max(0, 1 - Math.max(0, dy) / 400) }
    });
    v.addEventListener('pointerup', async () => {
        if (x0 === null) return; x0 = null;
        if (!mode) { v.classList.toggle('bare'); return }
        if (mode === 'v' && dy > 110) { closeViewer(); return }
        if (mode === 'h' && Math.abs(dx) > 70 && vList[vIdx + (dx < 0 ? 1 : -1)]) {
            const dir = dx < 0 ? 1 : -1; img.animate([{ transform: `translateX(${dx}px)` }, { transform: `translateX(${-dir * 110}%)` }], { duration: 220, fill: 'forwards' });
            setTimeout(async () => { vIdx += dir; img.getAnimations().forEach(a => a.cancel()); img.style.transform = ''; img.src = vList[vIdx].src; try { await img.decode() } catch (e) { } placeImg(img); setVTitle(); img.animate([{ transform: `translateX(${dir * 110}%)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.9,.25,1)' }) }, 210); return
        }
        img.animate([{ transform: img.style.transform || 'none' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,1.2,.4,1)' }); img.style.transform = ''; bg.style.opacity = 1
    })
}

/* --- Instagram --- */
const REELS = [{ t: 'habis ambil print, lanjut cari makan.', d: fmtYMD(2026, 10, 20), v: '321', n: 42 }, { t: 'enam foto, satu meja display. sore ini pasang bareng.', d: fmtYMD(2026, 10, 19), v: '198', n: 37 }, { t: 'nunggu hujan reda di depan tempat print.', d: fmtYMD(2026, 10, 17), v: '247', n: 51 }];
VIEWS.instagram = () => ({
    cls: 'ig', html: `<div class="ig-h"><button onclick="closeApp()" style="width:26px">${G.chevLb}</button><b>hanni</b>${G.bell}${G.dotsH}</div><div class="scroll">
 <div class="igp"><div class="pp"><img src="assets/photo-1.jpg" alt=""></div><div class="st"><span><b>3</b>${t('posts')}</span><span><b>1,284</b>${t('followers')}</span><span><b>312</b>${t('following')}</span></div></div>
 <div class="igbio"><b>Hanni</b><br>${t('bio')}</div>
 <div class="igbtn"><button>${t('followingBtn')}</button><button onclick="chatId='Hanni';push('chat')">${t('message')}</button><button class="sq">${G.person.replace('<svg', '<svg width="18" height="18"')}</button></div>
 <div class="igtabs"><span class="on">${G.grid}</span><span>${G.reels}</span><span>${G.tag}</span></div>
 <div class="iggrid">${['photo-1.jpg', 'photo-3.jpg', 'photo-4.jpg'].map((x, i) => `<button onclick="videoIndex=${i};push('reel')"><img src="assets/${x}" alt=""><svg class="rc" viewBox="0 0 24 24"><path d="M3.5 7.5A4 4 0 0 1 7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4Zm6.5 3v7l6-3.5Z"/></svg><span class="vc">${G.playF.replace('<svg', '<svg fill="none" stroke="#fff"')}${REELS[i].v}</span></button>`).join('')}</div></div>
 ${tabbar([['home', ''], ['search', ''], ['plusSq', ''], ['reels', ''], ['<span style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#bbb,#888);display:block"></span>', '']], -1, '', 'instagram')}`
});
function reelInner(i) {
    const r = REELS[i]; return `<div class="vwrap"><img class="diary-photo" src="assets/photo-${[1, 3, 4][i]}.jpg" alt="Hanni’s campus diary"><span class="diary-tag">CAMPUS DIARY</span>
 <div class="ract"><div class="liked">${G.heart}<span>${r.n + 1}</span></div><div>${G.comment}<span>${12 + i * 7}</span></div><div>${G.send}<span>${3 + i}</span></div><div>${G.dotsH}</div></div>
 <div class="rinfo"><div class="u"><img src="assets/photo-1.jpg" alt="">hanni<span>${t('followingTag')}</span></div>${esc(r.t)} ${t('cover')}<br><small>${r.d} · ${t('likedBy', 'w', r.n)}</small><br><small>${t('origAudio')}</small></div></div>`
}
VIEWS.reel = () => ({
    cls: 'reel dark', dark: true, html: `<div id="rhost">${reelInner(videoIndex)}</div><div class="rtop"><button class="rback" onclick="back()" aria-label="${t('back')}">${G.chevLb}</button><span>${t('reels')}</span>${G.camera}</div>${tabbar([['home', ''], ['search', ''], ['plusSq', ''], ['reels', ''], ['person', '']], 3, '', 'instagram').replace(/<button class="(on)?">/g, '<button class="$1" onclick="back()">')}`,
    init: pg => {
        playReel(pg); let y0 = null, dy = 0; pg.addEventListener('pointerdown', e => { if (e.target.closest('button,.tabbar')) return; y0 = e.clientY; dy = 0 }); pg.addEventListener('pointermove', e => { if (y0 === null) return; dy = (e.clientY - y0) / SC; const w = pg.querySelector('.vwrap'); if (w) w.style.transform = `translateY(${dy * .6}px)` });
        pg.addEventListener('pointerup', () => {
            if (y0 === null) return; y0 = null; const w = pg.querySelector('.vwrap'); const n = videoIndex + (dy < 0 ? 1 : -1);
            if (Math.abs(dy) > 80 && REELS[n]) { w.animate([{ transform: w.style.transform }, { transform: `translateY(${dy < 0 ? -100 : 100}%)` }], { duration: 250, fill: 'forwards' }); setTimeout(() => { videoIndex = n; $('#rhost').innerHTML = reelInner(n); $('#rhost .vwrap').animate([{ transform: `translateY(${dy < 0 ? 100 : -100}%)` }, { transform: 'none' }], { duration: 330, easing: 'cubic-bezier(.2,.9,.25,1)' }); playReel(pg) }, 240) }
            else { if (w) { w.style.transform = ''; if (Math.abs(dy) < 6) { const vd = w.querySelector('video'); if (vd) { vd.paused ? vd.play() : vd.pause() } } } }
        })
    }
});
function playReel(pg) { const v = pg.querySelector('video'); if (!v) return; PLAYER.pause(); v.muted = false; v.play().catch(() => { v.muted = true; v.play().catch(() => { }) }) }

/* --- 지도 (가상의 중연대 동네) --- */
let mapSel = null, mapPos = { x: -480, y: -640 };
function mapSVG() {
    return `<svg width="900" height="1200" viewBox="0 0 900 1200" style="position:absolute;inset:0">
 <rect width="900" height="1200" fill="#f2efe9"/>
 <path d="M0 980C160 940 260 1010 380 1080S640 1150 900 1120V1200H0Z" fill="#b9dcf7"/>
 <path d="M60 700h260v230H60Z" fill="#cfe8c4" rx="20"/><path d="M820 0h80v380h-80Z" fill="#cfe8c4"/>
 <rect x="110" y="110" width="460" height="460" rx="18" fill="#ece3d6"/>
 <g fill="#ddd2c2"><rect x="160" y="180" width="110" height="90" rx="6"/><rect x="400" y="190" width="120" height="110" rx="6"/><rect x="270" y="380" width="130" height="80" rx="6"/><rect x="160" y="400" width="80" height="90" rx="6"/><rect x="440" y="400" width="80" height="110" rx="6"/></g>
 <g fill="#e6e1d8"><rect x="610" y="640" width="90" height="70" rx="4"/><rect x="720" y="640" width="120" height="60" rx="4"/><rect x="610" y="730" width="70" height="90" rx="4"/><rect x="790" y="730" width="80" height="70" rx="4"/><rect x="610" y="900" width="140" height="60" rx="4"/><rect x="770" y="860" width="100" height="90" rx="4"/><rect x="640" y="340" width="120" height="60" rx="4"/><rect x="640" y="470" width="100" height="70" rx="4"/></g>
 <g stroke="#d8d3ca" stroke-width="22" fill="none" stroke-linecap="round"><path d="M0 605H900"/><path d="M590 0V1200"/><path d="M590 760H900"/><path d="M590 450H820"/><path d="M340 570V1000"/><path d="M760 760V980"/></g>
 <g stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round"><path d="M590 0V1200"/><path d="M590 760H900"/><path d="M590 450H820"/><path d="M340 570V1000"/><path d="M760 760V980"/></g>
 <path d="M0 605H900" stroke="#ffe08a" stroke-width="20"/>
 <g stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="2 9"><path d="M120 340H560M340 120V560"/></g>
 <g font-family="-apple-system,Pretendard,sans-serif" fill="#8a8578" font-size="13" font-weight="600" text-anchor="middle">
  <text x="340" y="152" font-size="16" fill="#7d6b55">${t('m_univ')}</text><text x="190" y="760" fill="#5f8f4e">${t('m_park')}</text>
  <text x="450" y="598" fill="#9a7d2c">${t('m_road')}</text><text x="604" y="250" transform="rotate(90 604 250)">${t('m_back')}</text><text x="830" y="752">${t('m_alley')}</text><text x="700" y="442">${t('m_cafe')}</text>
  <text x="335" y="425" font-size="11">${t('m_union')}</text><text x="200" y="450" font-size="11">${t('m_lib')}</text><text x="340" y="582" font-size="11">${t('m_gate')}</text><text x="560" y="1110" fill="#5b8fbf">${t('m_stream')}</text>
 </g></svg>`}
const MG = { home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4Z"/>', cup: '<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2"/>', pin: '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/>', bag: '<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>', game: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="15.5" cy="12" r=".6"/><circle cx="17" cy="14.5" r=".6"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>', bowl: '<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z"/><path d="M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>', bus: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 18v2.5M16 18v2.5"/><circle cx="8.5" cy="14.5" r=".7"/><circle cx="15.5" cy="14.5" r=".7"/>' };
const mg = k => `<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">${MG[k]}</svg>`;
const placeById = id => MAP_PLACES.find(p => p.id === id) || MAP_PLACES.find(p => p.name === id);
function mapSheet() {
    if (mapSel) {
        const p = placeById(mapSel); return `<div class="grab"></div><div class="mdet"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>${esc(p.name)}</h2><div class="sb">${esc(p.sub)}</div></div><button onclick="selPlace(null)" style="width:30px;height:30px;border-radius:50%;background:#e3e3e8;color:#7c7c80;font-size:17px">✕</button></div>
  <div class="acts"><button class="pri">${G.send.replace('<svg', '<svg style="color:#fff"')}${p.id === 'home' ? t('currentLoc') : t('walkMin', p.id === 's' ? 4 : p.id === 'corner' ? 9 : 12)}</button><button>${G.star}${p.fav ? t('favorited') : t('favorite')}</button><button>${G.share}${t('share')}</button><button>${G.dotsH}${t('moreInfo')}</button></div>
  <div class="inf">${(p.info.length ? p.info : [[t('info'), t('noInfo')]]).map(r => `<div><small>${esc(r[0])}</small>${esc(r[1])}</div>`).join('')}</div></div>`
    }
    const favs = MAP_PLACES.filter(p => p.fav);
    return `<div class="grab"></div><div class="srch" style="margin:0 0 14px;background:rgba(118,118,128,.14)">${G.search}${t('searchMaps')}</div>
 <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:var(--grey);margin-bottom:8px"><span>${t('favorites')}</span><span style="color:var(--blue);font-weight:500">${t('moreInfo')}</span></div>
 <div class="mfav">${favs.map(p => `<button onclick="selPlace('${p.id}')"><span class="fc" style="background:${p.color}">${mg(p.glyph)}</span>${esc(p.name)}<small>${p.id === 'home' ? t('currentLoc') : t('minN', p.id === 's' ? 4 : 9)}</small></button>`).join('')}<button><span class="fc" style="background:#e3e3e8"><svg viewBox="0 0 24 24" style="stroke:var(--blue)"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg></span>${t('add')}<small>&nbsp;</small></button></div>
 <div style="font-size:15px;font-weight:600;color:var(--grey);margin:16px 0 8px">${t('recentsMap')}</div><div class="group" style="margin:0">${MAP_RECENTS.map(r => `<button class="row tap" style="--inset:58px;min-height:56px" onclick="selPlace('${placeById(r[0]).id}')"><span class="st-ic" style="background:${placeById(r[0]).color};border-radius:50%">${mg(placeById(r[0]).glyph).replace('<svg', '<svg style="stroke:#fff;fill:none;stroke-width:2"')}</span><span style="flex:1"><div style="font-size:16px">${esc(r[0])}</div><div class="muted" style="font-size:13px">${esc(r[1])}</div></span></button>`).join('')}</div>`
}
function mapCanvas() {
    const pins = MAP_PLACES.map(p => `<div class="mpin ${p.fav ? '' : 'small'} ${mapSel === p.id ? 'sel' : ''}" style="left:${p.x}px;top:${p.y}px" onclick="event.stopPropagation();selPlace('${p.id}')"><span class="pc" style="background:${p.color}">${mg(p.glyph)}</span>${esc(p.name)}</div>`).join('');
    const h = placeById('home'); return mapSVG() + `<div class="me-dot" style="left:${h.x - 26}px;top:${h.y + 30}px"></div>` + pins
}
function setMapPos(x, y, anim) { const cv = $('#mapcv'); if (!cv) return; const W = SCREEN.clientWidth, H = SCREEN.clientHeight; mapPos = { x: Math.min(0, Math.max(W - 900, x)), y: Math.min(0, Math.max(H - 1200, y)) }; const t = `translate(${mapPos.x}px,${mapPos.y}px)`; if (anim) cv.animate([{ transform: cv.style.transform || 'none' }, { transform: t }], { duration: 450, easing: 'cubic-bezier(.2,.9,.25,1)' }); cv.style.transform = t }
function centerOn(p, anim) { const W = SCREEN.clientWidth, H = SCREEN.clientHeight; setMapPos(W / 2 - p.x, H * .27 - p.y, anim) }
function selPlace(id) {
    mapSel = id; const s = $('#msheet'); if (s) { s.innerHTML = mapSheet(); s.animate([{ transform: 'translateY(16px)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 260 }) }
    document.querySelectorAll('.mpin').forEach(el => el.classList.remove('sel')); if (id) { const p = placeById(id); const i = MAP_PLACES.indexOf(p); const el = document.querySelectorAll('.mpin')[i]; if (el) el.classList.add('sel'); centerOn(p, true); vib(8) }
}
VIEWS.maps = () => ({
    cls: 'mapv', html: `<div class="mapwrap" id="mapwrap"><div class="mapcv" id="mapcv">${mapCanvas()}</div></div>
 <div class="mbtns"><button>${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4Z"/><path d="m3 12 9 4 9-4M3 17l9 4 9-4"/></svg>'}</button><button onclick="centerOn(placeById('home'),true)">${'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5 3.5 10.6l7.2 2.7 2.7 7.2Z"/></svg>'}</button></div>
 <div class="msheet" id="msheet">${mapSheet()}</div>`,
    init: pg => {
        centerOn(placeById(mapSel || 'home')); const w = pg.querySelector('#mapwrap'); let x0 = null, y0 = 0, sx = 0, sy = 0, mv = false;
        w.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; sx = mapPos.x; sy = mapPos.y; mv = false });
        w.addEventListener('pointermove', e => { if (x0 === null) return; const dx = (e.clientX - x0) / SC, dy = (e.clientY - y0) / SC; if (Math.hypot(dx, dy) > 4) mv = true; if (mv) { w.style.cursor = 'grabbing'; setMapPos(sx + dx, sy + dy) } });
        w.addEventListener('pointerup', () => { x0 = null; w.style.cursor = '' })
    }
});

/* --- 날씨 --- */
const WX_RAIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15h12a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10.4-1A4.1 4.1 0 0 0 6 15Z" fill="#f5f8fc"/><path d="m8 18-1 2m6-2-1 2m6-2-1 2" stroke="#8cd1ff" stroke-width="1.8" stroke-linecap="round"/></svg>';
const WX_HOURS = [20, 19, 19, 18, 18, 19, 20, 22, 23, 24, 25, 26, 26, 25, 24, 23, 23, 22, 21, 21, 20, 20, 20, 19];
const WX_DAYS = [['cloud', 18, 26, 60], ['rain', 18, 25, 70], ['rain', 17, 24, 80], ['pcloud', 18, 26, 30], ['pcloud', 19, 27, 20], ['rain', 18, 25, 70], ['rain', 17, 24, 80], ['cloud', 18, 26, 40], ['rain', 18, 25, 60], ['pcloud', 18, 25, 20]];
function weatherIcon(kind) { return kind === 'rain' ? WX_RAIN : G[kind]; }
function weatherLocations() { sheetAU('Weather', `<button class="wx-location" onclick="closeSheet()"><span>My Location<small>Bandung · Cloudy</small></span><b>22°</b></button><p>October 21, 2026 · Weather for the AU. Forecast values are authored and do not update live.</p>`); }
VIEWS.weather = () => {
    const hour = Math.floor(nowMin() / 60);
    const hourly = Array.from({ length: 12 }, (_, i) => { const h = (hour + i) % 24, rain = h >= 14 && h <= 17, kind = rain ? 'rain' : h < 6 || h >= 19 ? 'moon' : h >= 9 && h <= 11 ? 'pcloud' : 'cloud'; return `<div class="wx-hour"><span>${i ? fmtHour(h) : t('now')}</span><span class="wx-hour-icon">${weatherIcon(kind)}</span><small>${rain ? '60%' : '&nbsp;'}</small><b>${i ? WX_HOURS[h] : 22}°</b></div>`; }).join('');
    return {
        cls: 'wx', dark: true, html: `<div class="wx-sky" aria-hidden="true"></div><div class="scroll"><header class="wx-current"><div class="wx-location-label">My Location</div><h1>Bandung</h1><div class="wx-temperature">22°</div><p>Cloudy</p><div class="wx-high-low">H:26° <span>L:18°</span></div></header>
 <section class="wcard wx-hourly"><p class="wx-summary">Cloudy conditions with showers expected this afternoon.</p><div class="hrs" aria-label="Hourly forecast">${hourly}</div></section>
 <section class="wcard wx-daily"><h2 class="wh">${G.calSm}10-DAY FORECAST</h2>${WX_DAYS.map(([kind, lo, hi, rain], i) => `<div class="d10"><span>${i ? wdShort(2026, 10, 21 + i) : t('today')}</span><div class="wx-day-icon">${weatherIcon(kind)}<small>${rain >= 40 ? rain + '%' : ''}</small></div><span class="lo">${lo}°</span><span class="rng"><i style="left:${(lo - 17) * 10}%;width:${(hi - lo) * 10}%">${i === 0 ? '<em style="left:50%"></em>' : ''}</i></span><span class="wx-high">${hi}°</span></div>`).join('')}</section>
 <div class="wx-details"><section class="wcard"><h2 class="wh">${G.sun}UV INDEX</h2><div class="wx-value">3</div><div class="wx-reading">Moderate</div><div class="wx-uv"><i></i></div><p>Use sun protection until 3 PM.</p></section>
 <section class="wcard"><h2 class="wh">${G.sun}SUNSET</h2><div class="wx-value wx-time">5:43<span>PM</span></div><svg class="wx-sunpath" viewBox="0 0 140 42" aria-hidden="true"><path d="M0 31h140" stroke="#fff" opacity=".25"/><path d="M0 39Q70-38 140 39" fill="none" stroke="#fff" stroke-width="2" opacity=".65"/><circle cx="115" cy="16" r="4" fill="#fff"/></svg><p>Sunrise: 5:28 AM</p></section>
 <section class="wcard"><h2 class="wh">${G.pcloud}FEELS LIKE</h2><div class="wx-value">23°</div><p>Humidity is making it feel slightly warmer.</p></section>
 <section class="wcard"><h2 class="wh">${WX_RAIN}PRECIPITATION</h2><div class="wx-value">4<span> mm</span></div><div class="wx-reading">Today</div><p>Showers most likely between 2 and 5 PM.</p></section>
 <section class="wcard"><h2 class="wh"><span aria-hidden="true">≋</span>WIND</h2><div class="wx-wind"><b>6</b><span>km/h<br>W</span></div><div class="wx-rule"></div><p>Gusts <strong>14 km/h</strong></p></section>
 <section class="wcard"><h2 class="wh">${WX_RAIN}HUMIDITY</h2><div class="wx-value">84<span>%</span></div><p>The dew point is 19° right now.</p></section></div>
 <footer class="wx-source">October 21, 2026<br>AU weather · illustrative forecast</footer></div><div class="wx-toolbar"><button onclick="closeApp()" aria-label="Back to Home">${G.chevL || G.chevLb}</button><span class="wx-page-dot" aria-label="Bandung, selected location"></span><button onclick="weatherLocations()" aria-label="Weather locations">${G.list}</button></div>`
    };
};

/* --- 설정 / 스크린 타임 --- */
const sIc = (c, i) => `<span class="st-ic" style="background:${c}">${(G[i] || i).replace('<svg', '<svg style="color:#fff" width="18" height="18"')}</span>`;
const sRow = (c, i, t, r = '', fn) => { if (!fn && !r.startsWith('<button')) fn = 'openDeviceSetting(' + JSON.stringify(t).replace(/"/g, '&quot;') + ')'; return `<div class="row ${fn ? 'tap' : ''}" style="--inset:57px;cursor:${fn ? 'pointer' : 'default'}" ${fn ? `onclick="${fn}"` : ''}>${sIc(c, i)}<span style="flex:1">${t}</span>${r.startsWith('<button') ? r : `<span class="muted" style="font-size:17px">${r}</span>${G.chevR}`}</div>`; };
VIEWS.screentime = () => {
    const apps = [['instagram', t('hm', 2, 41), 100], ['kakao', t('hm', 1, 52), 70], ['music', t('mOnly', 58), 36], ['photos', t('mOnly', 31), 19], ['safari', t('mOnly', 22), 14]].map(a => [a[0], t('app_' + a[0]), a[1], a[2]]);
    return {
        cls: 'grouped', html: navHTML({ title: t('screenTime'), back: t('app_settings') }) + `<div class="scroll"><h1 class="lt">${t('screenTime')}</h1>
 <div class="gh" style="margin-top:8px">${t('minjisIphone')}</div><div class="group" style="padding:14px 16px"><div class="muted" style="font-size:13px">${t('dailyAvg')}</div><div style="font-size:28px;font-weight:600">${t('hm', 6, 48)}</div><div class="muted" style="font-size:13px">${t('upPct', 32)}</div>
 <div class="bars">${[55, 62, 48, 70, 83, 77, 92].map(v => `<i style="height:${v}%"></i>`).join('')}</div><div style="display:flex;justify-content:space-between;padding:4px 16px 0;font-size:11px;color:#8e8e93">${wdNarrow().map(d => `<span>${d}</span>`).join('')}</div></div>
 <div class="gh">${t('mostUsed')}</div><div class="group">${apps.map(a => `<div class="row" style="--inset:58px;min-height:54px"><span style="width:30px;height:30px;border-radius:7px;overflow:hidden;flex:none">${appIcon(a[0])}</span><div style="flex:1"><div style="font-size:16px">${a[1]}</div><div style="height:5px;border-radius:3px;background:#007aff;width:${a[3]}%;margin-top:5px;opacity:.85"></div></div><span class="muted" style="font-size:15px">${a[2]}</span></div>`).join('')}</div>
 <div class="gh">${t('pickups')}</div><div class="group"><div class="row"><span style="flex:1">${t('firstPickup')}</span><span class="muted">${fmtTime(7 * 60 + 2)}</span></div><div class="row"><span style="flex:1">${t('avgPickups')}</span><span class="muted">${t('pickN', 143)}</span></div><div class="row"><span style="flex:1">${t('firstUsed')}</span><span class="muted">Instagram</span></div></div>
 <div class="gh">${t('notifSec')}</div><div class="group"><div class="row"><span style="flex:1">${t('app_kakao')}</span><span class="muted">${t('perDay', 41)}</span></div></div><div style="height:30px"></div></div>`
    }
};

/* ============================================================
   전화 (엔딩)
   ============================================================ */
function startRing() { ringOnce(); clearInterval(ringIv); ringIv = setInterval(() => { ringOnce(); vib([400, 250, 400]) }, 2600); vib([400, 250, 400]) }
function stopRing() { clearInterval(ringIv); ringIv = null; clearTimeout(ringTo); try { navigator.vibrate && navigator.vibrate(0) } catch (e) { } }
function incomingCall(replay = false) { if (callState || (phoneDone && !replay)) return; closeSheet(); callName = 'Hanni'; callDir = 'in'; callPrev = view; callState = 'ring'; if (PLAYER.dataset.voice) PLAYER.pause(); pauseMusicForCall(); APP.querySelectorAll('video').forEach(v => v.pause()); OV.querySelectorAll('.banner').forEach(b => b.remove()); renderCall(); startRing(); ringTo = setTimeout(missCall, 30000) }
function callTop() { const sh = callName === 'Hanni'; return `<div class="cav">${sh ? '<img src="assets/photo-1.jpg" alt="">' : /^[0-9*-]+$/.test(callName) ? `<span style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(#a5abb6,#7f858f)">${G.sil.replace('<svg', '<svg width="64"')}</span>` : `<span style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(#a5abb6,#7f858f);font-size:42px;font-weight:500">${esc(/^[가-힣]{3}$/.test(callName) ? callName[1] : [...dn(callName)][0].toUpperCase())}</span>`}</div><div class="cnm">${esc(dn(callName))}</div>` }
function renderCall() {
    let c = OV.querySelector('.call'); if (!c) { c = document.createElement('div'); c.className = 'call'; OV.appendChild(c); c.animate([{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.25,1)' }) }
    setStatus(true); const locked = ['lock', 'pin'].includes(callPrev); c.classList.toggle('act', callState !== 'ring');
    if (callState === 'ring') {
        c.innerHTML = callTop() + `<div class="csub">${t('mobile')}</div>` + (locked ? `<div class="ring-top"><div class="cb"><span class="cc" style="width:50px;height:50px">${G.bellF}</span>${t('remind')}</div><div class="cb"><span class="cc" style="width:50px;height:50px">${G.msgF}</span>${t('message2')}</div></div><div class="slider" id="slider"><div class="kn">${G.handset}</div><span>${t('slideAnswer')}</span></div>` :
            `<div class="ring-top"><div class="cb"><span class="cc" style="width:50px;height:50px">${G.bellF}</span>${t('remind')}</div><div class="cb"><span class="cc" style="width:50px;height:50px">${G.msgF}</span>${t('message2')}</div></div><div class="ring"><button class="cb red" onclick="declineCall()"><span class="cc"><span style="display:block;transform:rotate(135deg)">${G.handset}</span></span>${t('decline')}</button><button class="cb grn" onclick="answerCall()"><span class="cc">${G.handset}</span>${t('accept')}</button></div>`);
        if (locked) wireSlider()
    }
    else {
        const B = [['speaker', t('speaker')], ['videoF', 'FaceTime'], ['muteF', t('mute')], ['plusF', t('addCall')], ['end', t('endCall')], ['keypadF', t('keypad')]];
        const dl = callState === 'dialing'; c.innerHTML = callTop() + `<div class="csub" id="ctime">${dl ? t('calling') : '00:00'}</div>${dl ? '' : `<div class="cap" id="cap"><small>${t('liveCap')}</small>…</div>`}<div class="cgrid">${B.map(([i, l]) => i === 'end' ? `<button class="cb red" onclick="endCall()"><span class="cc"><span style="display:block;transform:rotate(135deg)">${G.handset}</span></span>${l}</button>` : `<button class="cb" ${i === 'keypadF' ? "onclick=\"callKeypad()\"" : 'disabled aria-disabled="true" title="Unavailable for caption calls"'}><span class="cc">${G[i]}</span>${l}</button>`).join('')}</div>`;
        if (!dl) c.querySelector('.cav').animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }], { duration: 400, fill: 'forwards', easing: 'cubic-bezier(.2,.9,.25,1)' })
    }
}
function wireSlider() {
    const s = $('#slider'), k = s.querySelector('.kn'), lab = s.querySelector('span'); let x0 = null, dx = 0; const max = s.clientWidth - k.clientWidth - 12;
    k.addEventListener('pointerdown', e => { x0 = e.clientX; k.setPointerCapture(e.pointerId) }); k.addEventListener('pointermove', e => { if (x0 === null) return; dx = Math.max(0, Math.min(max, (e.clientX - x0) / SC)); k.style.transform = `translateX(${dx}px)`; lab.style.opacity = 1 - dx / max });
    k.addEventListener('pointerup', () => { if (x0 === null) return; x0 = null; if (dx > max * .75) { answerCall() } else { k.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,1.3,.4,1)' }); k.style.transform = ''; lab.style.opacity = 1 } }); k.addEventListener('pointercancel', () => { x0 = null; dx = 0; k.style.transform = ''; lab.style.opacity = 1 })
}
function answerCall() { if (callDir === 'in') { curScript = endingScript(); isEnding = true } stopRing(); stopRingback(); vib(20); callState = 'active'; callStart = Date.now(); callHiddenAt = null; capIdx = -1; renderCall() }
function declineCall() { stopRing(); callState = ''; declined++; extraCalls.unshift(['Hanni', '오늘 ' + Math.floor(nowMin() / 60) + ':' + pad(nowMin() % 60), '부재중']); afterDecline(); closeCallUI() }
function missCall() { if (callState !== 'ring') return; stopRing(); callState = ''; declined++; extraCalls.unshift(['Hanni', '오늘 ' + Math.floor(nowMin() / 60) + ':' + pad(nowMin() % 60), '부재중']); afterDecline(); closeCallUI(); if (['lock', 'pin'].includes(view)) { lockNotes.unshift({ title: t('missedCall'), body: 'Hanni', app: 'phone', time: t('now') }); renderLock() } }
function endCall() {
    if (callState === 'dialing') { clearCallTimers(); stopRingback(); callState = ''; extraCalls.unshift([callName, '오늘 ' + Math.floor(nowMin() / 60) + ':' + pad(nowMin() % 60), '발신']); closeCallUI(); if (view === 'phone') show('phone'); return }
    if (callState !== 'active') return; callState = 'ended'; vib(15); const t = $('#ctime'); if (t) t.textContent = t_('callEnded'); const c = OV.querySelector('.call'); c && c.querySelectorAll('.cb').forEach(b => b.style.opacity = .4);
    extraCalls.unshift([callName, '오늘 ' + Math.floor(nowMin() / 60) + ':' + pad(nowMin() % 60), callDir === 'out' ? '발신' : '수신']); if (isEnding && capIdx >= (curScript || speech).length - 1) phoneDone = true; isEnding = false; setTimeout(() => { callState = ''; closeCallUI(); if (view === 'phone') show('phone') }, 1100)
}
/* Hanni 전화를 거절/놓쳤을 때: 카톡으로 다시 걸어달라고 하고, 90초 뒤 다시 걸어옴 */
function afterDecline() { nextCallAt = elapsed() + 90; if (declineSent) return; declineSent = true; CALL_DECLINED.forEach((m, k) => setTimeout(() => incomingMsg(m), 3000 + k * 2600)) }
/* 플레이어가 거는 전화 */
let callDir = 'in', curScript = null, isEnding = false;
function clearCallTimers() { callTimers.forEach(clearTimeout); callTimers = [] }
function startRingback() { const r = () => { tone(440, 0, 1, .05); tone(480, 0, 1, .05) }; r(); clearInterval(rbIv); rbIv = setInterval(r, 3000) }
function stopRingback() { clearInterval(rbIv); rbIv = null }
function dial(name) {
    if (callState) return; callName = name; callDir = 'out'; callPrev = view; callState = 'dialing'; if (PLAYER.dataset.voice) PLAYER.pause(); pauseMusicForCall(); renderCall(); startRingback(); vib(10);
    const ready = askedCall; const pick = (sc, ms, end) => { callTimers.push(setTimeout(() => { if (callState !== 'dialing') return; curScript = sc; isEnding = !!end; answerCall() }, ms)) };
    if (name === 'Hanni' && !phoneDone && ready) pick(endingScript(), 1800, true);
    else if (name === 'Hanni' && phoneDone) pick(HANNI_AFTER, 6000);
    else if (name === 'Hanni') { callTimers.push(setTimeout(() => { if (callState !== 'dialing') return; rejectOut(t('callEnded')); if (!busySent) { busySent = true; CALL_BUSY.forEach((m, k) => setTimeout(() => incomingMsg(m), 2500 + k * 2600)) } }, 3500)) }
    else if (OTHER_CALLS[name]) pick(OTHER_CALLS[name], /^0/.test(name) ? 1800 : 3000 + Math.random() * 3000);
    else { callTimers.push(setTimeout(() => { if (callState === 'dialing') rejectOut(t('noAnswer')) }, 9000)) }
}
function rejectOut(msg) {
    stopRingback(); clearCallTimers(); const t = $('#ctime'); if (t) t.textContent = msg; tone(480, 0, .25, .05); tone(480, .35, .25, .05); tone(480, .7, .25, .05); extraCalls.unshift([callName, '오늘 ' + Math.floor(nowMin() / 60) + ':' + pad(nowMin() % 60), '발신']); callState = 'ended';
    const c = OV.querySelector('.call'); c && c.querySelectorAll('.cb').forEach(b => b.style.opacity = .4); setTimeout(() => { callState = ''; closeCallUI(); if (view === 'phone') show('phone') }, 1300)
}
function closeCallUI() { const c = OV.querySelector('.call'); if (!c) return; c.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 320, fill: 'forwards' }).onfinish = () => { c.remove(); resumeMusicAfterCall(); setStatus(viewDark()); updateIsland(); if (view === 'home') renderHome() } }

/* ============================================================
   루프 / 시작
   ============================================================ */
let lastMin = -1, callHiddenAt = null;
function syncCallVisibility() { if (callState !== 'active') { callHiddenAt = null; return } if (document.hidden) { if (callHiddenAt === null) callHiddenAt = Date.now() } else if (callHiddenAt !== null) { callStart += Date.now() - callHiddenAt; callHiddenAt = null } }
document.addEventListener('visibilitychange', syncCallVisibility);
function tick() {
    typeof updateCrumb === "function" && updateCrumb(); const now = new Date(); $('#sbt').textContent = clock12(); const lk = $('#lkt'); if (lk) lk.textContent = clock12();
    if (now.getMinutes() !== lastMin) { lastMin = now.getMinutes(); if (view === 'home' && !HOME.getAnimations().length) renderHome() }
    tickStory();
    if (callState === 'active' && !document.hidden) {
        const sec = Math.floor((Date.now() - callStart) / 1000); const tm = $('#ctime'); if (tm) tm.textContent = pad(Math.floor(sec / 60)) + ':' + pad(sec % 60);
        const S = curScript || speech; const idx = Math.min(S.length - 1, Math.floor(sec / 3)); if (idx !== capIdx) { capIdx = idx; const c = $('#cap'); if (c) { c.animate([{ opacity: .2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 280 }); c.innerHTML = `<small>${esc(dn(S[idx][0]))}</small>${esc(S[idx][1])}` } }
        if (sec > S.length * 3 + 2) endCall()
    }
}
function fit() { const ph = $('#phone'); const mob = innerWidth <= 540; ph.classList.toggle('mob', mob); ph.classList.toggle('short', mob && innerHeight < 740); if (mob) { ph.style.width = innerWidth + 'px'; ph.style.height = (window.visualViewport?.height || innerHeight) + 'px'; ph.style.transform = ''; SC = 1 } else { ph.style.width = '393px'; ph.style.height = '852px'; SC = Math.min((innerHeight - 40) / 852, (innerWidth - 40) / 393, 1.1); ph.style.transform = `scale(${SC})` } }
// Bootstrap runs after the story features have restored saved progress.

// Keyboard access follows the same passcode and home actions as touch.
document.addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (view === 'pin' && /^\d$/.test(e.key)) { const b = [...document.querySelectorAll('.pk')].find(b => b.querySelector('b').textContent === e.key); if (b) pinPress(e.key, b); } else if (view === 'lock' && (e.key === 'Enter' || e.key === 'ArrowUp')) goPin(); });

// SOFT LAUNCH: original branching story and browser-local phone features.
const SAVE_KEY = 'minji-bandung-v2';
const WALLPAPERS = ['assets/shifu.png', 'assets/photo-2.jpg', 'assets/photo-3.jpg'];
let appPrefs = { sound: true, wallpaper: WALLPAPERS[0] }, storyChoices = [], favoritePhotos = new Set(), storageAvailable = true, storyBusy = false;
let livePassed = 0, liveBase = elapsed(), liveIndex = 0, pendingReplies = [], replyTimer = null, replyEpoch = 0;
const LIVE_MESSAGES = [[40, "aku udah di depan studio. nanti kalo kelasmu selesai kabarin ya"], [44, "payungku ketinggalan di kos. semoga siang ga hujan dulu 😭"], [150, "lagi pindah ke ruang sebelah. boleh telepon bentar?"]];
function liveSeconds() { return livePassed + elapsed() - liveBase; }
function validLive(l) { return !!l && Number.isFinite(l.seconds) && l.seconds >= 0 && Number.isInteger(l.index) && l.index >= 0 && l.index <= LIVE_MESSAGES.length && typeof l.asked === 'boolean' && Number.isFinite(l.retry) && l.retry >= 0 && l.retry <= 90; }
function tickStory() {
    if (pendingReplies.length && !replyTimer && !document.hidden && !callState) scheduleReply();
    if (phoneDone || callState || storyBusy || composerTyping || document.hidden) return;
    const seconds = liveSeconds(), event = LIVE_MESSAGES[liveIndex];
    if (event && seconds >= event[0] - 1.5 && seconds < event[0]) showTyping();
    if (event && seconds >= event[0]) { hideTyping(); liveIndex++; if (liveIndex === LIVE_MESSAGES.length) askedCall = true; deliverHanni(event[1]); saveProgress(); }
    if (askedCall && (seconds >= 210 || storyChoices.length === STORY_BEATS.length) && elapsed() >= nextCallAt) { saveProgress(); incomingCall(); }
}
let photoFilter = 'all', searchQuery = '', searchScope = '', searchReturn = 'home', searchTarget = '', sheetFocus = null;
UI.app_journal = { en: 'Journal', id: 'Jurnal' };
for (const [key, en] of Object.entries({ "seoul": "Bandung", "mostlySunny": "Cloudy · showers later", "hiLo": "H:26° L:18°", "bio": "DKV / semester 5 / besok jangan lupa ambil laundry", "m_univ": "Institut Teknologi Bumi", "m_park": "Taman Gantara", "m_road": "Jalan Gantara", "m_back": "Labtek Kode", "m_alley": "Cisatu Lane", "m_cafe": "Kopi Bragi", "m_union": "Studio Garis / DKV", "m_lib": "Central Library", "m_gate": "Gerbang Dagu", "m_stream": "Cikapundang", "sf_portal": "Gantara Portal", "sf_acad": "Student Desk", "sf_lib": "Library", "sf_pe": "JEJAK Archive", "wxSummary": "Cloudy conditions with showers expected this afternoon." })) { if (UI[key]) { UI[key].en = en; UI[key].id = en; } }
function validSave(s) {
    return !!s && s.version === 1 && Array.isArray(s.choices) && s.choices.length <= STORY_BEATS.length && s.choices.every(n => n === 0 || n === 1)
        && Array.isArray(s.today) && s.today.length >= TODAY_CHAT.length && s.today.length <= 150 && s.today.every(m => Array.isArray(m) && (m.length === 3 || m.length === 4 && m[3] === 'rd') && typeof m[0] === 'string' && m[0].length <= 2000 && ['me', 'them'].includes(m[1]) && typeof m[2] === 'string' && m[2].length <= 30)
        && (s.live === undefined || validLive(s.live))
        && (s.replies === undefined || Array.isArray(s.replies) && s.replies.length <= 12 && s.replies.every(m => typeof m === 'string' && m.length <= 2000))
        && typeof s.done === 'boolean' && (!s.done || s.choices.length === STORY_BEATS.length || s.live?.asked === true)
        && s.prefs && typeof s.prefs.sound === 'boolean' && WALLPAPERS.includes(s.prefs.wallpaper)
        && Array.isArray(s.favorites) && s.favorites.length <= allPhotos.length && s.favorites.every(p => allPhotos.some(x => x.src === p))
        && Array.isArray(s.readMail) && s.readMail.every(n => Number.isInteger(n) && n >= 0 && n < emails.length)
        && Array.isArray(s.alarms) && s.alarms.length === 7 && s.alarms.every(n => typeof n === 'boolean');
}
function restorePhonePreferences(s) {
    if (s?.version !== 1) return;
    if (s.prefs && typeof s.prefs.sound === 'boolean' && WALLPAPERS.includes(s.prefs.wallpaper)) appPrefs = { ...s.prefs };
    if (Array.isArray(s.favorites) && s.favorites.length <= allPhotos.length) favoritePhotos = new Set(s.favorites.filter(path => allPhotos.some(p => p.src === path)));
    if (Array.isArray(s.alarms) && s.alarms.length === 7 && s.alarms.every(v => typeof v === 'boolean')) alarmStates = s.alarms.slice();
}
function restoreProgress() { try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) { for (const key of ['minji-softlaunch-v1', 'minji-breakeven-v1', 'minji-sideb-v1']) { const old = localStorage.getItem(key); if (old && old.length <= 100000) { restorePhonePreferences(JSON.parse(old)); break; } } return; } if (raw.length > 100000) return; const s = JSON.parse(raw); if (!validSave(s)) return; storyChoices = s.choices.slice(); todayChat = s.today.map(m => m.slice()); pendingReplies = (s.replies || []).slice(); storyBusy = !!pendingReplies.length; phoneDone = s.done; appPrefs = { ...s.prefs }; favoritePhotos = new Set(s.favorites); readMail = new Set(s.readMail); alarmStates = s.alarms.slice(); askedCall = storyChoices.length === STORY_BEATS.length; if (s.live) { livePassed = s.live.seconds; liveBase = elapsed(); liveIndex = s.live.index; askedCall = askedCall || s.live.asked; nextCallAt = elapsed() + s.live.retry; } else if (askedCall) { nextCallAt = elapsed() + 8; } } catch { storageAvailable = false; } }
function saveProgress() { if (typeof saveDeviceState === 'function') saveDeviceState(); try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, live: { seconds: liveSeconds(), index: liveIndex, asked: askedCall, retry: Math.min(90, Math.max(0, nextCallAt - elapsed())) }, choices: storyChoices, today: todayChat, replies: pendingReplies, done: phoneDone, prefs: appPrefs, favorites: [...favoritePhotos], readMail: [...readMail], alarms: alarmStates })); storageAvailable = true; } catch { storageAvailable = false; } }
function endingKey() { return storyChoices.reduce((n, c, i) => n + STORY_BEATS[i].options[c].point, 0) >= 2 ? 'onair' : 'quiet'; }
function endingScript() { return ENDINGS[endingKey()].lines; }
function applyPreferences() { const wall = $('#wall'); wall.style.backgroundImage = `linear-gradient(180deg,#0005,transparent 40%,#0006),url('${appPrefs.wallpaper}')`; PLAYER.muted = !appPrefs.sound; }
function changeWallpaper(path) { if (!WALLPAPERS.includes(path)) return; appPrefs.wallpaper = path; applyPreferences(); saveProgress(); toastAU('Wallpaper updated'); }
function toastAU(text) { OV.querySelector('.au-toast')?.remove(); const d = document.createElement('div'); d.className = 'au-toast'; d.setAttribute('role', 'status'); d.textContent = text; OV.appendChild(d); setTimeout(() => d.remove(), 2600); }
function sheetAU(title, html) { closeSheet(); sheetFocus = document.activeElement; const d = document.createElement('section'); d.className = 'au-sheet'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', title); d.innerHTML = `<div class="au-modal"><header><h2>${esc(title)}</h2><button onclick="closeSheet()" aria-label="Close">${G.chevL}</button></header>${html}</div>`; OV.appendChild(d); d.querySelector('button')?.focus(); }
function closeSheet() { OV.querySelector('.au-sheet')?.remove(); if (sheetFocus?.isConnected) sheetFocus.focus(); sheetFocus = null; }
const originalHomeAction = hbAction;
hbAction = function () { if (OV.querySelector('.au-sheet')) { closeSheet(); return; } originalHomeAction(); };
const originalBack = back;
back = function () { if (searchTarget === view) { searchTarget = ''; show('search', 'pop'); return; } originalBack(); };
document.addEventListener('keydown', e => { const sheet = OV.querySelector('.au-sheet'); if (!sheet || e.key !== 'Tab') return; const nodes = [...sheet.querySelectorAll('button,a,input,textarea')]; const first = nodes[0], last = nodes.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } });
function restartPrompt() { sheetAU('Start SOFT LAUNCH again?', `<p>This resets your story choices and ending. Your wallpaper, sound preference, and favourite photos stay.</p><button class="au-primary" onclick="restartStory()">Restart story</button><button class="au-secondary" onclick="closeSheet()">Keep reading</button>`); }
function restartStory() { replyEpoch++; clearTimeout(replyTimer); replyTimer = null; pendingReplies = []; if (typeof resetPhoneSessions === 'function') resetPhoneSessions(); storyMinute = 7 * 60 + 17; storyClockStart = storyMinute; storyClockBase = elapsed(); livePassed = 0; liveBase = elapsed(); liveIndex = 0; nextCallAt = 0; declined = 0; busySent = false; declineSent = false; typingEpoch++; composerTyping = false; pendingText = ''; composerDraft = ''; storyChoices = []; todayChat = TODAY_CHAT.map(m => m.slice()); phoneDone = false; askedCall = false; storyBusy = false; capIdx = -1; readMail.clear(); saveProgress(); closeSheet(); closeApp(); if (typeof resetPhoneSessions === 'function') { resetPhoneSessions(); saveDeviceState(false); } toastAU('A new Wednesday. Open Hanni’s chat to begin.'); }
// Match the reference: tapping the composer types an authored line, then Send advances it.
let pendingText = '', composerChoice = 0, composerTyping = false, typingEpoch = 0, composerDraft = '';
let newChatCount = 0;
function clearNewChat() { newChatCount = 0; $('#new-chat')?.remove() }
function markNewChat() { newChatCount++; let chip = $('#new-chat'); if (!chip) { chip = document.createElement('button'); chip.id = 'new-chat'; chip.className = 'new-chat'; chip.setAttribute('onclick', 'scrollChat(true);clearNewChat()'); $('#msgs')?.insertAdjacentElement('afterend', chip) } chip.textContent = newChatCount + ' new ' + (newChatCount === 1 ? 'message' : 'messages') + ' ↓' }
function choicesHTML() {
    if (chatId !== 'Hanni') return '';
    if (storyBusy) return '<div class="au-chat-status" role="status">Hanni is typing…</div>';
    if (askedCall || phoneDone || storyChoices.length === STORY_BEATS.length) return `<div class="au-chat-status"><button onclick="requestHanniCall()">${phoneDone ? 'Have Hanni call again' : 'Have Hanni call'}</button>${phoneDone ? ` <button onclick="push('journal')">Read your ending</button>` : ''}</div>`;
    return '';
}
function kbdHTML() {
    const key = (label, k = label, cls = '') => `<button class="key ${cls}" data-k="${k}" data-c="${label}" onclick="kbdTap('${k}')">${label}</button>`;
    return `<div class="kin"><div class="kr">${[...'qwertyuiop'].map(c => key(c)).join('')}</div><div class="kr" style="padding:0 18px">${[...'asdfghjkl'].map(c => key(c)).join('')}</div><div class="kr">${key('⇧', 'shift', 'sp')}${[...'zxcvbnm'].map(c => key(c)).join('')}${key('⌫', 'delete', 'sp')}</div><div class="kr">${key('123', 'numbers', 'sp')}${key('☺', 'emoji', 'sp')}${key('space', 'space', 'wide')}${key('return', 'return', 'ret')}</div><div class="kbot">${G.globe}${G.mic}</div></div>`;
}
function openKbd() { const k = $('#kbd'); if (!k) return; k.classList.add('open'); $('#cin').classList.remove('safe'); setTimeout(scrollChat, 400); }
function closeKbd() { $('#kbd')?.classList.remove('open'); $('#cin')?.classList.add('safe'); }
function setField(text, cursor = false) { composerDraft = text; const b = view === 'chat' ? $('#msgs') : null, follow = b && nearChatBottom(b); const f = $('#fld'); if (!f) return; f.className = 'fld' + (!text && !cursor ? ' ph' : ''); f.innerHTML = text || cursor ? esc(text) + (cursor ? '<span class="cur"></span>' : '') : 'Message'; if (follow) scrollChat(); }
function pressKey(key) { const el = document.querySelector(`#kbd [data-k="${key}"]`); if (!el) return; el.classList.add('dn', 'pv'); sfx('key'); setTimeout(() => el.classList.remove('dn', 'pv'), 95); }
function tapInput() {
    openKbd(); if (chatId !== 'Hanni' || storyBusy || composerTyping || pendingText || storyChoices.length >= STORY_BEATS.length) return;
    const line = STORY_BEATS[storyChoices.length].options[composerChoice].text, epoch = ++typingEpoch; let i = line.startsWith(composerDraft) ? composerDraft.length : 0; composerTyping = true;
    function next() {
        if (epoch !== typingEpoch) return; if (view !== 'chat' || chatId !== 'Hanni') { composerTyping = false; return; }
        if (i === line.length) { composerTyping = false; pendingText = line; $('#snd').classList.add('on'); setField(line, true); return; }
        const c = line[i++]; setField(line.slice(0, i), true); if (/[a-z ]/i.test(c)) pressKey(c === ' ' ? 'space' : c.toLowerCase()); setTimeout(next, 45 + Math.random() * 35);
    } next();
}
function kbdTap(key) { if (key === 'return' && pendingText) { sendLine(); return; } pressKey(key); vib(5); tapInput(); }
function replyOptions() { if (chatId !== 'Hanni' || storyBusy || storyChoices.length >= STORY_BEATS.length) return; sheetAU('Minji’s reply', STORY_BEATS[storyChoices.length].options.map((o, i) => `<button class="au-secondary" onclick="selectDraft(${i})">${esc(o.text)}</button>`).join('')); }
function selectDraft(choice) { if (!STORY_BEATS[storyChoices.length]?.options[choice]) return; closeSheet(); typingEpoch++; composerTyping = false; pendingText = ''; composerChoice = choice; $('#snd')?.classList.remove('on'); tapInput(); }
function sendLine() { if (!pendingText || composerTyping || storyBusy || chatId !== 'Hanni') return; const step = storyChoices.length, choice = composerChoice; pendingText = ''; composerChoice = 0; setField('', true); $('#snd')?.classList.remove('on'); chooseReply(step, choice); refreshChat(true, true); }
function scheduleReply() {
    if (replyTimer || !pendingReplies.length) return; const epoch = replyEpoch;
    if (!document.hidden && !callState) showTyping();
    const delay = 900 + Math.min(pendingReplies[0].length * 32, 2800);
    replyTimer = setTimeout(() => {
        replyTimer = null; if (epoch !== replyEpoch || document.hidden || callState) return;
        hideTyping(); todayChat.forEach(m => { if (m[3] === 'rd') m.pop() });
        const text = pendingReplies.shift(); deliverHanni(text); storyBusy = !!pendingReplies.length;
        if (storyBusy) scheduleReply(); else if (storyChoices.length === STORY_BEATS.length) { askedCall = true; nextCallAt = elapsed() + 8; }
        if (view === 'chat' && chatId === 'Hanni') $('#reply-choices').innerHTML = choicesHTML(); saveProgress();
    }, delay);
}
function chooseReply(step, choice) {
    if (storyBusy || step !== storyChoices.length || !STORY_BEATS[step] || !STORY_BEATS[step].options[choice]) return;
    const beat = STORY_BEATS[step], option = beat.options[choice]; storyChoices.push(choice); todayChat.push([option.text, 'me', nowAmpm(), 'rd']); pendingReplies = [...option.reply, beat.next]; storyBusy = true; saveProgress(); sfx('send');
    if (view === 'chat' && chatId === 'Hanni') $('#reply-choices').innerHTML = choicesHTML(); scheduleReply();
}
function requestHanniCall() { if (callState) return; askedCall = true; closeKbd(); incomingCall(true); saveProgress(); }
function beginEnding() { if ((!askedCall && storyChoices.length !== STORY_BEATS.length) || phoneDone || callState) return; askedCall = true; incomingCall(); }
VIEWS.chat = () => ({ cls: 'chat', html: `<div class="chat-h"><button class="bk" onclick="back()" aria-label="Back to chats">${G.chevL}<span>${otherUnread() || ''}</span></button><div class="nm">${esc(dn(chatId))}${MEMBERS[chatId] ? `<small>${MEMBERS[chatId]}</small>` : ''}</div><div class="rt">${chatId === 'Hanni' ? `<button onclick="closeKbd();dial('Hanni')" aria-label="Call Hanni">${G.handset}</button>` : ''}<button onclick="showSearch(chatId)" aria-label="Search conversation">${G.search}</button><button onclick="push('journal')" aria-label="Story journal">${G.book}</button></div></div><div class="msgs" id="msgs" onclick="closeKbd()">${chatMsgs(chatId)}</div><div id="reply-choices">${choicesHTML()}</div><div class="cin safe" id="cin"><button onclick="replyOptions()" aria-label="Choose another reply">${G.plusSq}</button><button class="fld ph" id="fld" onclick="tapInput()" aria-label="Type a message">Message</button><button onclick="replyOptions()" aria-label="Reply options">${G.smile}</button><button class="snd" id="snd" onclick="sendLine()" aria-label="Send message">${G.arrowUp}</button></div><div class="kbd" id="kbd">${kbdHTML()}</div>`, init: () => { typingEpoch++; composerTyping = false; pendingText = ''; composerDraft = ''; composerChoice = 0; if (chatId === 'Hanni') hanniUnread = 0; else unread[chatId] = 0; scrollChat(); } });
const originalShow = show;
show = function (id, anim = 'swap') { const pg = originalShow(id, anim); if (['chat', 'maild', 'clock'].includes(id)) saveProgress(); return pg; };
const originalEndCall = endCall;
endCall = function () { const active = callState === 'active'; originalEndCall(); if (active && !phoneDone) nextCallAt = elapsed() + 30; saveProgress(); };
const originalAfterDecline = afterDecline;
afterDecline = function () { originalAfterDecline(); saveProgress(); };
const originalDeliverHanni = deliverHanni;
deliverHanni = function (text) { originalDeliverHanni(text); saveProgress(); };
function continueStory() { chatId = 'Hanni'; if (view === 'home') openApp('chat'); else push('chat'); }
VIEWS.journal = () => ({ cls: 'grouped', html: navHTML({ title: 'SOFT LAUNCH', back: 'Home', backFn: 'closeApp()' }) + `<div class="scroll"><h1 class="lt">SOFT LAUNCH</h1><div class="au-card"><span class="au-eyebrow">BANDUNG · 21 OCTOBER 2026</span><h2>Habis kelas, ketemu di kantin.</h2><p>Minji: Informatics Engineering, semester 5. Hanni: Visual Communication Design (DKV), semester 5. Di Institut Teknologi Bumi, mereka menyiapkan JEJAK: enam foto keseharian sekitar kampus, caption pendek, dan arsip web sederhana. Dari ketemu di kantin sampai saling menunggu selesai kelas, mereka mulai dekat. Satu janji makan siang yang tidak dikabari bikin keduanya belajar menghargai waktu masing-masing.</p><p>${phoneDone ? 'Ending reached' : storyChoices.length + ' of ' + STORY_BEATS.length + ' replies chosen'} · ${storageAvailable ? 'progress saved on this device' : 'saving unavailable; keep this tab open'}</p><button class="au-primary" onclick="continueStory()">${phoneDone ? 'Return to Hanni’s chat' : 'Continue the conversation'}</button></div>${STORY_BEATS.map((b, i) => `<div class="au-card"><span class="au-eyebrow">${i + 1} · ${storyChoices[i] === undefined ? 'UNREAD' : 'CHOSEN'}</span><h3>${b.title}</h3><p>${storyChoices[i] === undefined ? 'Your next reply is waiting in Hanni’s chat.' : esc(b.options[storyChoices[i]].text)}</p></div>`).join('')}${phoneDone ? `<div class="au-card au-ending"><span class="au-eyebrow">YOUR ENDING</span><h2>${ENDINGS[endingKey()].title}</h2><p>${ENDINGS[endingKey()].summary}</p><button class="au-primary" onclick="requestHanniCall()">Have Hanni call again</button><button class="au-secondary" onclick="sheetAU('The final call',endingScript().map(l=>'<p><b>'+esc(l[0])+'</b><br>'+esc(l[1])+'</p>').join(''))">Read the call transcript</button></div>` : ''}<div class="au-card"><p>Gantara, Dagu, Tamanasri, Cisatu, and the campus are fictionalised names. 31 consecutive days of messages, September 21–October 21. The dialogue, private records, and branching endings are original fiction.</p><button class="au-secondary" onclick="restartPrompt()">Replay with different choices</button></div></div>` });
function searchEntries(query, scope = '') {
    const q = query.trim().toLowerCase(); if (!q) return []; const results = [];
    for (const id of chatNames) { if (scope && scope !== id) continue; chatItems(id).forEach((m, index) => { if (!m.date && m.text.toLowerCase().includes(q)) results.push({ kind: 'chat', id, index, label: dn(id), text: m.text }); }); }
    if (!scope) { notes.forEach((n, index) => { if (n.slice(0, 3).join(' ').toLowerCase().includes(q)) results.push({ kind: 'note', index, label: n[0], text: n[1] }); }); emails.forEach((m, index) => { if (m.slice(0, 3).join(' ').toLowerCase().includes(q)) results.push({ kind: 'maild', index, label: m[1], text: m[0] }); }); }
    return results.slice(0, 80);
}
function searchResultsHTML() { const items = searchEntries(searchQuery, searchScope); if (!searchQuery.trim()) return '<p class="au-empty">Try “kantin”, “print”, or “Sabtu”.</p>'; return items.length ? `<p class="au-count">${items.length} result${items.length === 1 ? '' : 's'}</p>` + items.map((r, i) => `<button class="au-result" onclick="openSearchResult(${i})"><small>${r.kind === 'chat' ? 'MESSAGE' : r.kind === 'note' ? 'NOTE' : 'MAIL'} · ${esc(r.label)}</small><span>${esc(r.text)}</span></button>`).join('') : '<p class="au-empty">No matches. Try another word.</p>'; }
function showSearch(scope = '') { searchReturn = view; searchScope = scope; searchQuery = ''; if (view === 'home') openApp('search'); else push('search'); }
function leaveSearch() { if (searchReturn === 'home') closeApp(); else show(VIEWS[searchReturn] ? searchReturn : 'kakao', 'pop'); }
function updateSearch(value) { searchQuery = value; $('#search-results').innerHTML = searchResultsHTML(); }
function openSearchResult(index) { const r = searchEntries(searchQuery, searchScope)[index]; if (!r) return; if (r.kind === 'chat') chatId = r.id; else if (r.kind === 'note') noteId = r.index; else mailId = r.index; searchTarget = r.kind; show(r.kind, 'push'); if (r.kind === 'chat') { const line = $(`[data-chat-index="${r.index}"]`); line?.scrollIntoView({ block: 'center' }); line?.classList.add('au-search-hit'); } }
VIEWS.search = () => ({ html: navHTML({ title: 'Search', back: 'Back', backFn: 'leaveSearch()' }) + `<div class="scroll"><h1 class="lt">${searchScope ? esc(dn(searchScope)) : 'Search this phone'}</h1><input class="au-search" aria-label="Search messages, notes and mail" placeholder="Messages, notes, little things…" value="${esc(searchQuery)}" oninput="updateSearch(this.value)"><div id="search-results">${searchResultsHTML()}</div></div>`, init: pg => pg.querySelector('input')?.focus() });
function togglePhotoFavorite() { const path = vList[vIdx]?.src; if (!allPhotos.some(p => p.src === path)) return; favoritePhotos.has(path) ? favoritePhotos.delete(path) : favoritePhotos.add(path); saveProgress(); setVTitle(); }
function useViewedWallpaper() { const path = vList[vIdx]?.src; if (!WALLPAPERS.includes(path)) { toastAU('Choose a portrait in Settings → Wallpaper.'); return; } changeWallpaper(path); }
function photoInfo() { const p = vList[vIdx]; sheetAU('Photo details', `<p><b>${esc(fmtLabel(p.sec))}</b></p><p>${esc(p.sub || 'Camera roll')}</p><p>Public photo reference used in a fictional AU. Captions and personal records are invented.</p>`); }
const originalViewerTitle = setVTitle;
setVTitle = function () { originalViewerTitle(); const bar = OV.querySelector('.viewer .vb'); if (bar) { const liked = favoritePhotos.has(vList[vIdx].src); bar.innerHTML = `<button onclick="togglePhotoFavorite()" aria-label="${liked ? 'Remove from' : 'Add to'} favourites" aria-pressed="${liked}" style="color:${liked ? '#ff668b' : 'inherit'}">${G.heart}</button><button onclick="useViewedWallpaper()" aria-label="Use as wallpaper">${G.photo}</button><button onclick="photoInfo()" aria-label="Photo details">${G.info}</button><button onclick="closeViewer()" aria-label="Close photo">${G.chevL}</button>`; } };
function filterPhotos(filter) { photoFilter = filter; show('photos'); }
VIEWS.photos = () => ({ html: navHTML({ title: 'Photos', back: 'Home', backFn: 'closeApp()', right: `<button onclick="showSearch()" aria-label="Search this phone">${G.search}</button>` }) + `<div class="scroll"><h1 class="lt">Library</h1><div class="au-tabs"><button class="${photoFilter === 'all' ? 'active' : ''}" onclick="filterPhotos('all')">All photos</button><button class="${photoFilter === 'favorites' ? 'active' : ''}" onclick="filterPhotos('favorites')">Favourites · ${favoritePhotos.size}</button></div>${photoFilter === 'favorites' && !favoritePhotos.size ? '<p class="au-empty">Open a photo and tap the heart to keep it here.</p>' : ''}${photoSections.map(section => { const items = allPhotos.map((p, i) => ({ p, i })).filter(({ p }) => p.sec === section[0] && (photoFilter === 'all' || favoritePhotos.has(p.src))); return items.length ? `<div class="ph-sec">${esc(fmtLabel(section[0]))}</div><div class="ph-grid">${items.map(({ p, i }) => `<button data-pi="${i}" onclick="openViewer(${i},this.firstElementChild)"><img src="${p.src}" loading="lazy" alt="${esc(p.sub)}"></button>`).join('')}</div>` : ''; }).join('')}${photoFilter === 'all' || favoritePhotos.has(allPhotos[STORY_I].src) ? `<div class="ph-sec">Saved story</div><div class="ph-grid"><button data-pi="${STORY_I}" onclick="openViewer(${STORY_I},this.firstElementChild)"><img src="assets/story.svg" alt="Fictional SOFT LAUNCH story"></button></div>` : ''}</div>` });
VIEWS.settings = () => ({
    cls: 'grouped', html: navHTML({ title: t('app_settings') }) + `<div class="scroll"><h1 class="lt">${t('app_settings')}</h1><button class="srch" onclick="showSearch()">${G.search}${t('search')}</button>
 <div class="group" style="margin-bottom:22px"><div class="row" style="min-height:76px"><img class="settings-avatar" src="assets/yixuan.jpg" alt="Minji"><div style="flex:1"><b style="font-size:20px;font-weight:500">Minji Kim</b><div class="muted" style="font-size:13px">${t('acct')}</div></div>${G.chevR}</div></div>
 <div class="group" style="margin-bottom:22px">${sRow('#ff9500', '<svg viewBox="0 0 24 24"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5Z" fill="#fff"/></svg>', t('airplane'), sw(devicePrefs.airplane, "setDevicePreference('airplane',!devicePrefs.airplane)"))}${sRow('#007aff', '<svg viewBox="0 0 16 12"><path fill="#fff" d="M8 2.3c2.3 0 4.4.9 6 2.4l1.2-1.2A10.3 10.3 0 0 0 8 .6 10.3 10.3 0 0 0 .8 3.5L2 4.7a8.6 8.6 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 4a6.8 6.8 0 0 0-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.6 0-1.2.2-1.6.6L8 11.3l1.6-1.6c-.4-.4-1-.6-1.6-.6Z"/></svg>', 'Wi-Fi', devicePrefs.wifi ? 'minji_home_5G' : 'Off')}${sRow('#007aff', '<svg viewBox="0 0 24 24"><path d="m7 7 10 10-5 4V3l5 4L7 17" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>', 'Bluetooth', devicePrefs.bluetooth ? t('on') : 'Off')}${sRow('#34c759', '<svg viewBox="0 0 24 24"><path d="M12 4v16M7 9v11M17 7v13M2 13v7M22 11v9" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>', t('cellular'))}${sRow('#34c759', '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="16" height="10" rx="2.5" fill="none" stroke="#fff" stroke-width="2"/><rect x="5.5" y="9.5" width="8" height="5" rx="1" fill="#fff"/></svg>', t('battery'), '64%')}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#8e8e93', 'gear', t('general'), '', "push('generalsettings')")}${sRow('#007aff', 'person', t('access'))}${sRow('#8e8e93', 'camera', t('camera'))}${sRow('#32ade6', 'photo', t('wallpaper'), '', "push('wallpaper')")}${sRow('#8e8e93', 'search', t('search'), '', "showSearch()")}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#ff3b30', 'bellF', t('notif'))}${sRow('#ff2d55', 'speaker', t('sound'), '', "push('sounds')")}${sRow('#5856d6', '<svg viewBox="0 0 24 24"><path d="M15.5 3.5A8.5 8.5 0 1 0 20.5 15 7 7 0 0 1 15.5 3.5Z" fill="#fff"/></svg>', t('focus'))}${sRow('#5856d6', '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9h-9Z" fill="#fff"/><path d="M14 3.2V10h6.8A9 9 0 0 0 14 3.2Z" fill="#fff" opacity=".7"/></svg>', t('screenTime'), '', "push('screentime')")}</div>
 <div class="group" style="margin-bottom:22px">${sRow('#34c759', '<svg viewBox="0 0 24 24"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16c1.5 1 3.5 1 5 0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>', t('faceid'))}${sRow('#007aff', '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#fff" stroke-width="2"/><rect x="5" y="11" width="14" height="10" rx="2" fill="#fff"/></svg>', t('privacy'))}</div></div>`
});
Object.assign(PARENT, { wallpaper: 'settings', sounds: 'settings', generalsettings: 'settings' });
VIEWS.wallpaper = () => ({ cls: 'grouped', html: navHTML({ title: t('wallpaper'), back: t('app_settings') }) + `<div class="scroll"><h1 class="lt">${t('wallpaper')}</h1><div class="settings-wallpapers">${WALLPAPERS.map((p, i) => `<button onclick="changeWallpaper('${p}');show('wallpaper')" aria-label="Wallpaper ${i + 1}" aria-pressed="${appPrefs.wallpaper === p}" class="${appPrefs.wallpaper === p ? 'selected' : ''}"><img src="${p}" alt="Minji wallpaper ${i + 1}"><span>${appPrefs.wallpaper === p ? 'Current wallpaper' : 'Set as wallpaper'}</span></button>`).join('')}</div></div>` });
VIEWS.sounds = () => ({ cls: 'grouped', html: navHTML({ title: t('sound'), back: t('app_settings') }) + `<div class="scroll"><h1 class="lt">${t('sound')}</h1><div class="gh">RINGTONES AND ALERTS</div><div class="group"><div class="row"><span style="flex:1">Interface sounds</span>${sw(appPrefs.sound, 'appPrefs.sound=!appPrefs.sound;applyPreferences();saveProgress()').replace('<button', '<button aria-label="Interface sounds"')}</div></div></div>` });
VIEWS.generalsettings = () => ({ cls: 'grouped', html: navHTML({ title: t('general'), back: t('app_settings') }) + `<div class="scroll"><h1 class="lt">${t('general')}</h1><div class="group settings-section"><div class="row"><span style="flex:1">Name</span><span class="muted">Minji’s iPhone</span></div><div class="row"><span style="flex:1">Story</span><span class="muted">SOFT LAUNCH</span></div></div><div class="group settings-section">${sRow('#294f47', 'book', 'Journal & ending', '', "push('journal')")}<button class="row tap" onclick="restartPrompt()" style="color:#ff3b30">Restart story</button></div><p class="settings-footnote">${storageAvailable ? 'Progress saves automatically in this browser.' : 'Saving is unavailable. Keep this tab open to retain progress.'}</p></div>` });
// Make existing search surfaces open the same real search instead of decorative fields.
for (const name of ['kakao', 'notes', 'mail']) { const render = VIEWS[name]; VIEWS[name] = () => { const v = render(); v.html = v.html.replace(/<div class="srch">[\s\S]*?<\/div>/g, `<button class="srch" onclick="showSearch()">${G.search}Search this phone</button>`); if (name === 'kakao') v.html = v.html.replace('<span>' + G.search + G.chatPlus + G.gear + '</span>', `<span><button onclick="showSearch()" aria-label="Search chats">${G.search}</button><button onclick="push('settings')" aria-label="Settings">${G.gear}</button></span>`); return v; }; }
// shortcut: dated offline reading briefs; refresh sources before treating this as a live news feed.
const SAFARI_READS = [
    {
        "id": "prabowo-two-years",
        "category": "INDONESIA",
        "kind": "News brief",
        "date": "20 October 2026",
        "source": "CNA",
        "url": "https://www.channelnewsasia.com/asia/indonesia-president-prabowo-subianto-2-years-in-office-economic-gains-challenges-6474906",
        "title": "Two years of Prabowo: big promises meet a test of delivery",
        "deck": "Welfare spending, food safety and the haze crisis put government performance under scrutiny.",
        "body": [
            "CNA reports that Prabowo marked two years in office on October 20 with claims of progress on food security and energy independence. Questions remain over the cost and delivery of his welfare programmes.",
            "Food-poisoning incidents have raised concerns about oversight of the free-meals programme. Analysts also question spending priorities and fiscal sustainability. Forest fires and regional haze add another urgent test of government performance."
        ],
        "context": "Condensed reading brief based on CNA’s October 20 report. Open the original for interviews, figures and the government’s stated achievements."
    },
    {
        "id": "kalimantan-accountability",
        "category": "ENVIRONMENT",
        "kind": "News brief",
        "date": "9 October 2026",
        "source": "Associated Press",
        "url": "https://apnews.com/article/765b6a03d21e582ebaa125a07e88a528",
        "title": "Kalimantan residents take fire-response grievances to court",
        "deck": "Residents allege negligence after months of fires and choking smoke.",
        "body": [
            "Residents of West Kalimantan have accused the government of negligence in responding to forest fires, according to an October 9 Associated Press report.",
            "The group’s lawyer, Gloria Sanen, said their complaints also concern supervision of firefighting. These are residents’ allegations, not a court finding. The report describes fires continuing for more than three months."
        ],
        "context": "This brief follows the report’s account of the complaint. It does not establish who ignited particular fires or the outcome of the case."
    },
    {
        "id": "tanjung-puting",
        "category": "ENVIRONMENT",
        "kind": "Government response",
        "date": "12 October 2026",
        "source": "Cabinet Secretariat",
        "url": "https://setkab.go.id/en/president-prabowo-orders-special-attention-to-forest-and-land-fires-in-tanjung-puting-national-park/",
        "title": "Smoke hampers firefighting in Tanjung Puting",
        "deck": "BNPB reported roughly 513.89 hectares of newly detected fires inside the national park.",
        "body": [
            "Indonesia’s Cabinet Secretariat says BNPB reported new fires covering approximately 513.89 hectares in Tanjung Puting National Park, Central Kalimantan, at an October 12 meeting. Thick smoke limited aerial operations; teams strengthened the ground response.",
            "Prabowo directed special attention to the park and pledged pumps and water-drilling support. Officials described scattered fire sites in swamp terrain that vehicles struggle to reach."
        ],
        "context": "An official account of reported conditions and commitments. Promised equipment is not independently verified delivery."
    },
    {
        "id": "orangutans",
        "category": "WILDLIFE",
        "kind": "News brief",
        "date": "13 October 2026",
        "source": "Associated Press",
        "url": "https://apnews.com/article/677ea800733334d3d2e45cbfcd9e4861",
        "title": "Eight orangutans return to protected forest after wildfire rescue",
        "deck": "Fires disrupted habitat and food access in West Kalimantan.",
        "body": [
            "Eight endangered orangutans were released into Batu Nyambu protected forest on October 8 after wildfire rescues, the Associated Press reported on October 13, citing conservation group YIARI.",
            "The animals included three mothers with infants and two adolescent males. They had been rescued from fire-affected areas of Ketapang and North Kayong. YIARI said disrupted habitat pushed the animals towards plantations in search of food and shelter."
        ],
        "context": "Conservation reporting, with rescue details attributed to YIARI. This is not a live wildlife or fire-status update."
    },
    {
        "id": "rights-scrutiny",
        "category": "RIGHTS & GOVERNANCE",
        "kind": "Rights-group assessment",
        "date": "4 February 2026",
        "source": "Human Rights Watch",
        "url": "https://www.hrw.org/news/2026/02/04/indonesia-perks-for-military-lawmakers-spark-dissent-protests",
        "title": "Rights group criticises militarisation and protest crackdowns",
        "deck": "Human Rights Watch challenges the Prabowo administration’s treatment of dissent.",
        "body": [
            "Human Rights Watch’s February 4 assessment says policies benefiting military officers and lawmakers in 2025 fuelled protests over inequality. It criticises the use of active-duty officers in civilian affairs and the detention of thousands of demonstrators.",
            "The organisation calls for an end to abusive security-force involvement in economic and social matters. Its criticism also addresses the treatment of Indigenous Papuans, journalists and minorities."
        ],
        "context": "Background published in 2026 about events in 2025. These assessments are attributed to Human Rights Watch, not presented as a new October incident."
    },
    {
        "id": "newjeans-never-die",
        "category": "FROM THE READING LIST",
        "kind": "AU fan note",
        "date": "21 October 2026",
        "source": "Hanni’s saved note · fiction",
        "title": "NewJeans never die",
        "deck": "Playlist buat jalan ke studio.",
        "body": [
            "NewJeans never die. Pagi ini muter Ditto sambil nunggu angkot jalan. Sampai studio keburu ganti lagu, tapi thumbnail tugas masih yang kemarin.",
            "Minji minta link playlist. Katanya buat nemenin beresin kamar kos. Aku kirim, terus ingetin laundry-nya jangan sampai nginep lagi."
        ],
        "context": "Original SOFT LAUNCH fan writing. This note makes no claim about the real members’ views, legal affairs or current activities."
    },
    {
        "id": "panjang-umur-perjuangan",
        "category": "FROM THE READING LIST",
        "kind": "AU opinion",
        "date": "21 October 2026",
        "source": "Minji’s saved note · fiction",
        "title": "Panjang umur perjuangan",
        "deck": "Baca beritanya, cek tanggal dan sumbernya.",
        "body": [
            "Panjang umur perjuangan. Buat warga yang masih menghirup asap dan memperjuangkan ruang hidupnya, persoalannya ga selesai waktu beritanya lewat dari timeline.",
            "Pemerintah perlu ditagih soal udara bersih, bantuan yang sampai, dan kebebasan menyampaikan kritik. Simpan tautan laporannya juga. Kritik tetap perlu jelas dasarnya, apalagi kalau mau dibagikan lagi."
        ],
        "context": "Original opinion by a fictional AU character. Not a statement by the real Minji or Hanni."
    }
];
let safariReadId = SAFARI_READS[0].id;
PARENT.safarireader = 'safari';
function openSafariRead(id) { if (!SAFARI_READS.some(a => a.id === id)) return; safariReadId = id; push('safarireader'); }
function safariReadCard(a, i) { return `<button class="sf-news-card ${i === 0 ? 'sf-lead' : ''}" onclick="openSafariRead('${a.id}')"><small>${esc(a.category)} · ${esc(a.kind)}</small><h2>${esc(a.title)}</h2><p>${esc(a.deck)}</p><span>${esc(a.source)} · ${esc(a.date)}</span></button>`; }
VIEWS.safari = () => ({ cls: 'sf-app', html: navHTML({ title: 'Safari', back: 'Home', backFn: 'closeApp()' }) + `<div class="sf-address">${G.lock || ''}<span>Reading List</span><span>aA</span></div><div class="scroll"><header class="sf-masthead"><span>WEDNESDAY, OCTOBER 21, 2026</span><h1>The morning read.</h1><p>Indonesia, the environment & things worth keeping.</p></header><div class="sf-section">INDONESIA / IN FOCUS</div>${SAFARI_READS.filter(a => a.url).map(safariReadCard).join('')}<div class="sf-section">SAVED / CULTURE & VOICES</div>${SAFARI_READS.filter(a => !a.url).map(a => safariReadCard(a, 1)).join('')}<p class="sf-disclosure">Saved briefs · researched October 21, 2026. Source dates appear on each story. AU notes are fiction.</p><div class="sf-section">ON CAMPUS</div><div class="au-card"><span class="au-eyebrow">SOFT LAUNCH · OCTOBER 21</span><h2>Yang sering dilewati, akhirnya diperhatikan.</h2><p>JEJAK menampilkan enam foto keseharian sekitar kampus: warung, tempat print, papan pengumuman, dan jalan pulang. Pasang display pukul 16.00, cek bersama 16.30, buka 17.00 di Gantara Hall.</p><p>Hanni mengerjakan foto dan layout; Minji membuat arsip web. Danielle mengurus ruang, dibantu Haerin dan Hyein. Foto yang menampilkan orang hanya dipakai setelah mendapat izin.</p><button class="au-primary" onclick="mapSel='art';push('maps')">Find Gantara Hall</button></div><div class="sh">Recent searches</div>${searches.map(s => `<button class="au-result" onclick="showSearch();updateSearch(${esc(JSON.stringify(s.split(' ')[0]))})">${G.search}<span>${esc(s)}</span></button>`).join('')}</div>` });
VIEWS.safarireader = () => { const a = SAFARI_READS.find(a => a.id === safariReadId) || SAFARI_READS[0]; return { cls: 'sf-app', html: navHTML({ title: 'Reader', back: 'Reading List' }) + `<div class="scroll"><article class="sf-reader"><div class="sf-section">${esc(a.category)}</div><span class="sf-type">${esc(a.kind)}</span><h1>${esc(a.title)}</h1><p class="sf-deck">${esc(a.deck)}</p><div class="sf-byline">${esc(a.source)}<br><time>${esc(a.date)}</time> · Saved October 21, 2026</div>${a.body.map(p => `<p>${esc(p)}</p>`).join('')}<aside>${esc(a.context)}</aside>${a.url ? `<a class="au-primary" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Read original at ${esc(a.source)} ↗</a>` : ''}<button class="au-secondary" onclick="back()">Back to reading list</button></article></div>` }; };
// Saved state is restored before the phone is drawn. Opening the phone still requires its passcode.
restoreProgress(); applyPreferences();
addEventListener('pagehide', saveProgress);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveProgress(); });

// Verified Apple Music catalogue entries. Playback stays in Apple's official player.
const NEWJEANS_TRACKS = [
    { title: 'Ditto', album: "NewJeans 'OMG'", id: '1659513448', url: 'https://music.apple.com/us/album/newjeans-omg-single/1659513441?i=1659513448' },
    { title: 'OMG', album: "NewJeans 'OMG'", id: '1659513445', url: 'https://music.apple.com/us/album/newjeans-omg-single/1659513441?i=1659513445' },
    { title: 'Super Shy', album: "NewJeans 'Super Shy'", id: '1692686518', url: 'https://music.apple.com/us/album/newjeans-super-shy-single/1692686264?i=1692686518' },
    { title: 'New Jeans', album: "NewJeans 'Super Shy'", id: '1692686265', url: 'https://music.apple.com/us/album/newjeans-super-shy-single/1692686264?i=1692686265' }
];
let musicSelected = 0, musicTab = 'songs';
function musicEmbedURL() { return musicTab === 'essentials' ? 'https://embed.music.apple.com/us/playlist/newjeans-essentials/pl.e0c081843cfa4bf88da477cb338568f6' : NEWJEANS_TRACKS[musicSelected].url.replace('music.apple.com', 'embed.music.apple.com'); }
function openMusicTrack(index) { if (!Number.isInteger(index) || !NEWJEANS_TRACKS[index]) return; musicSelected = index; musicTab = 'songs'; PLAYER.pause(); show('music'); }
function openMusicTab(tab) { if (!['songs', 'essentials', 'debut'].includes(tab)) return; musicTab = tab; show('music'); }
VIEWS.music = () => { const track = NEWJEANS_TRACKS[musicSelected], src = musicTab === 'debut' ? 'https://embed.music.apple.com/us/album/newjeans-1st-ep-new-jeans/1635469682' : musicEmbedURL(), link = musicTab === 'songs' ? track.url : musicTab === 'debut' ? 'https://music.apple.com/us/album/newjeans-1st-ep-new-jeans/1635469682' : 'https://music.apple.com/us/playlist/newjeans-essentials/pl.e0c081843cfa4bf88da477cb338568f6'; return { html: navHTML({ title: 'Music', back: 'Home', backFn: 'closeApp()' }) + `<div class="scroll au-music"><h1 class="lt">NewJeans</h1><p class="au-music-sub">SOFT LAUNCH / on repeat</p><div class="au-tabs"><button class="${musicTab === 'songs' ? 'active' : ''}" onclick="openMusicTab('songs')">Songs</button><button class="${musicTab === 'essentials' ? 'active' : ''}" onclick="openMusicTab('essentials')">Essentials</button><button class="${musicTab === 'debut' ? 'active' : ''}" onclick="openMusicTab('debut')">Debut EP</button></div><iframe class="au-apple-player" title="Apple Music — ${esc(musicTab === 'songs' ? track.title : musicTab === 'debut' ? 'New Jeans debut EP' : 'NewJeans Essentials')}" src="${src}" height="${musicTab === 'songs' ? 175 : 450}" allow="autoplay *; encrypted-media *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"></iframe><a class="au-apple-link" href="${link}" target="_blank" rel="noopener noreferrer">Open in Apple Music ↗</a><p class="au-music-note">Official Apple Music player. Internet required; previews and full-track access depend on your region and Apple Music account.</p>${NEWJEANS_TRACKS.map((s, i) => `<button class="mrow" onclick="openMusicTrack(${i})" aria-label="Select ${esc(s.title)} by NewJeans"><span class="art au-album-note">${G.musicNote}</span><span class="mt ${i === musicSelected && musicTab === 'songs' ? 'pl' : ''}">${esc(s.title)}<small>NewJeans · ${esc(s.album)}</small></span>${G.playF.replace('<svg', '<svg width="16" fill="#fa2d48"')}</button>`).join('')}<div class="au-card"><b>Hanni’s queue note</b><p>“Ditto dulu sambil nunggu angkot jalan. Playlist-nya udah kukirim ke Minji, katanya mau diputar sambil beresin kos.”</p></div></div>` }; };

// Apple’s cross-origin player exposes no local pause control; suspend it during a call.
function pauseMusicForCall() { const frame = $('.au-apple-player'); if (frame?.src?.startsWith('https://embed.music.apple.com/')) { frame.dataset.resumeSrc = frame.src; frame.src = 'about:blank'; } }
function resumeMusicAfterCall() { const frame = $('.au-apple-player'); if (frame?.dataset.resumeSrc) { frame.src = frame.dataset.resumeSrc; delete frame.dataset.resumeSrc; } }

// Linked posts stay with their original authors; X supplies their text and media.
const X_POSTS = [
    { handle: 'GreenpeaceID', id: '2112460008696971777' },
    { handle: 'whiterosestea', id: '2112520666813747556' },
    { handle: 'elana_paw', id: '2112512851508076836' }
];
const X_AU_POSTS = [
    {
        "id": "han-newjeans",
        "name": "Hanni",
        "handle": "hanpixels_au",
        "photo": "assets/photo-1.jpg",
        "time": "7:15 AM",
        "text": "NewJeans never die. berangkat studio ditemenin Ditto. masuk kelas earphone dilepas dulu, nanti dikira ga denger pas dipanggil.",
        "likes": 219,
        "reposts": 31,
        "replies": [
            [
                "Minji",
                "Playlist-nya kirim dong."
            ],
            [
                "Hanni",
                "udah di chat. jangan lupa sarapan"
            ]
        ]
    },
    {
        "id": "min-perjuangan",
        "name": "Minji",
        "handle": "minjigit_au",
        "photo": "assets/yixuan.jpg",
        "time": "7:14 AM",
        "text": "Panjang umur perjuangan. Warga berhak dapat udara bersih dan bantuan yang sampai. Pemerintahan Prabowo perlu ditagih hasilnya. Bacaan dan sumbernya kusimpan di Safari, cek tanggal laporannya juga.",
        "likes": 167,
        "reposts": 48,
        "replies": [
            [
                "Hanni",
                "iya, jangan cuma baca potongan screenshot."
            ]
        ]
    },
    {
        "id": "dani-reading",
        "name": "Danielle",
        "handle": "danisun_au",
        "time": "7:13 AM",
        "text": "bacaan Indonesia pagi ini udah disimpan di Safari. soal kebakaran di Kalimantan dan respons pemerintah. ada berita baru, ada laporan latar; lihat tanggalnya sebelum share.",
        "likes": 112,
        "reposts": 27,
        "replies": []
    },
    {
        "id": "han-stairs",
        "name": "Hanni",
        "handle": "hanpixels_au",
        "photo": "assets/photo-1.jpg",
        "time": "7:12 AM",
        "text": "mau masuk studio baru inget penggaris di kantong map. dari tadi dicari di tas 😭",
        "likes": 128,
        "reposts": 9,
        "replies": [
            [
                "Minji",
                "Kemarin kamu masukin situ habis cek proof."
            ],
            [
                "Hanni",
                "IYA baru inget. nuhun ya"
            ]
        ]
    },
    {
        "id": "min-pencil",
        "name": "Minji",
        "handle": "minjigit_au",
        "photo": "assets/yixuan.jpg",
        "time": "7:12 AM",
        "text": "Kabel HDMI sudah di tas. Jangan sampai nanti yang dibawa ke ruangan cuma niat.",
        "likes": 86,
        "reposts": 4,
        "replies": [
            [
                "Haerin",
                "aku bawa adaptor. kali ini beneran dimasukin tas sekarang."
            ]
        ]
    },
    {
        "id": "dani-logistics",
        "name": "Danielle",
        "handle": "danisun_au",
        "time": "7:05 AM",
        "text": "JEJAK sore ini di Gantara Hall. yang bantu pasang display jam 4 ya. makan dulu sebelum datang, bongkar pasang panel suka lebih lama dari perkiraan.",
        "likes": 204,
        "reposts": 18,
        "replies": [
            [
                "Hyein",
                "lakban aku bawa. gunting siapa?"
            ]
        ]
    },
    {
        "id": "han-contact",
        "name": "Hanni",
        "handle": "hanpixels_au",
        "photo": "assets/photo-1.jpg",
        "time": "6:57 AM",
        "text": "ternyata “udah makan?” bisa beneran nanya makan. kemarin dijawab lengkap sama lauk dan harga es tehnya.",
        "likes": 173,
        "reposts": 12,
        "replies": [
            [
                "Minji",
                "Kamu nanya kantinnya murah apa engga."
            ],
            [
                "Hanni",
                "iya juga sih wkwk"
            ]
        ]
    },
    {
        "id": "haerin-mic",
        "name": "Haerin",
        "handle": "haerintest_au",
        "time": "6:45 AM",
        "text": "habis kelas mau ke perpustakaan dulu. yang nyari adaptor buat sore, ada di tas aku.",
        "likes": 251,
        "reposts": 27,
        "replies": [
            [
                "Danielle",
                "nanti ketemu jam 4. nuhun!"
            ]
        ]
    },
    {
        "id": "hyein-stickers",
        "name": "Hyein",
        "handle": "hyeinledger_au",
        "time": "6:32 AM",
        "text": "nota patungan kertas jangan ilang ya teman-teman. aku mau rekap sebelum uangnya berubah jadi kenangan.",
        "likes": 92,
        "reposts": 7,
        "replies": [
            [
                "Minji",
                "Sudah kufoto, nanti kukirim."
            ]
        ]
    },
    {
        "id": "min-umbrella",
        "name": "Minji",
        "handle": "minjigit_au",
        "photo": "assets/yixuan.jpg",
        "time": "6:18 AM",
        "text": "Payung masih dititip di tempat print. Hari ini harus diambil sekalian ambil pesanan.",
        "likes": 117,
        "reposts": 6,
        "replies": [
            [
                "Hanni",
                "punyaku di kos. nanti nebeng kalau hujan ya"
            ]
        ]
    },
    {
        "id": "han-chairs",
        "name": "Hanni",
        "handle": "hanpixels_au",
        "photo": "assets/photo-1.jpg",
        "time": "6:12 AM",
        "text": "display JEJAK sore ini, tugas studio pagi ini. satu-satu dulu. ada yang mau makan di kantin setelah kelas?",
        "likes": 148,
        "reposts": 11,
        "replies": [
            [
                "Danielle",
                "aku bisa jam setengah satu. kabarin kalau masih di sana"
            ]
        ]
    }
];
UI.app_x = { en: 'X', id: 'X' };
const X_SELF = 'minjigit_au', X_SAVE_KEY = 'bandung-x-v2';
const X_PROFILES = [
    {
        "handle": "minjigit_au",
        "name": "Minji",
        "photo": "assets/yixuan.jpg",
        "bio": "Teknik Informatika (Informatics Engineering), sem 5 / Institut Teknologi Bumi / web JEJAK / kos, kampus, kantin.",
        "color": "#d6e2dc"
    },
    {
        "handle": "hanpixels_au",
        "name": "Hanni",
        "photo": "assets/photo-1.jpg",
        "bio": "Desain Komunikasi Visual (DKV), sem 5 / Institut Teknologi Bumi / foto, layout, dan file final beneran.",
        "color": "#d9e6ea"
    },
    {
        "handle": "danisun_au",
        "name": "Danielle",
        "bio": "Gantara / urusan ruang JEJAK / kalau belum balas mungkin lagi kelas.",
        "color": "#f7e2a8"
    },
    {
        "handle": "haerintest_au",
        "name": "Haerin",
        "bio": "informatika / perpustakaan dulu habis kelas.",
        "color": "#d9d5ec"
    },
    {
        "handle": "hyeinledger_au",
        "name": "Hyein",
        "bio": "DKV / kertas, lakban, nota patungan.",
        "color": "#f4d7d8"
    }
];
const X_NOTIFICATIONS = [
    {
        "id": "n-han",
        "handle": "hanpixels_au",
        "kind": "like",
        "post": "min-pencil",
        "text": "Hanni liked your post"
    },
    {
        "id": "n-dani",
        "handle": "danisun_au",
        "kind": "repost",
        "post": "min-umbrella",
        "text": "Danielle reposted your post"
    },
    {
        "id": "n-reply",
        "handle": "hanpixels_au",
        "kind": "reply",
        "post": "min-umbrella",
        "text": "Hanni replied: “punyaku di kos. nanti nebeng kalau hujan ya”"
    }
];
const X_DM_SEED = [
    {
        "handle": "hanpixels_au",
        "side": "them",
        "text": "min, nanti kabelnya titip Dani aja kalau ga ketemu ya",
        "time": "7:14 AM"
    },
    {
        "handle": "hanpixels_au",
        "side": "me",
        "text": "Oke. Nanti setelah kelas aku kabarin.",
        "time": "7:15 AM"
    },
    {
        "handle": "hanpixels_au",
        "side": "them",
        "text": "sip. aku studio dulu",
        "time": "7:16 AM"
    },
    {
        "handle": "danisun_au",
        "side": "them",
        "text": "Min, file web udah bisa dibuka dari QR yang kemarin?",
        "time": "7:02 AM"
    },
    {
        "handle": "danisun_au",
        "side": "me",
        "text": "Sudah. Sore kita cek lagi di ruangan.",
        "time": "7:03 AM"
    },
    {
        "handle": "danisun_au",
        "side": "them",
        "text": "oke. aku urus kunci sama meja dulu.",
        "time": "7:04 AM"
    }
];
let xState = { version: 1, posts: [], replies: [], likes: [], reposts: [], bookmarks: [], following: X_PROFILES.filter(p => p.handle !== X_SELF).map(p => p.handle), draft: { text: '', replyTo: '', quoteId: '', media: '' }, dms: [], readDM: [], seen: [] };
let xStorageOK = true;
const xId = v => typeof v === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(v);
const xText = (v, n) => typeof v === 'string' && Array.from(v).length <= n;
const xMedia = v => v === '' || Array.from({ length: 6 }, (_, i) => `assets/photo-${i}.jpg`).includes(v);
const xHandle = h => X_PROFILES.some(p => p.handle === h);
function validXState(s) {
    const ids = a => Array.isArray(a) && a.length <= 1000 && a.every(xId);
    return !!s && s.version === 1 && Array.isArray(s.posts) && s.posts.length <= 100 && s.posts.every(p => p && xId(p.id) && p.id.startsWith('mine-') && xText(p.text, 280) && xText(p.time, 30) && (p.quoteId === '' || xId(p.quoteId)) && xMedia(p.media) && (p.text.trim() || p.quoteId || p.media))
        && new Set(s.posts.map(p => p.id)).size === s.posts.length
        && Array.isArray(s.replies) && s.replies.length <= 500 && s.replies.every(p => p && xId(p.id) && xId(p.postId) && xText(p.text, 280) && (p.text.trim() || p.media) && xText(p.time, 30) && (p.media === undefined || xMedia(p.media)))
        && ids(s.likes) && ids(s.reposts) && ids(s.bookmarks) && Array.isArray(s.following) && s.following.length <= 5 && s.following.every(xHandle)
        && s.draft && xText(s.draft.text, 2000) && (s.draft.replyTo === '' || xId(s.draft.replyTo)) && (s.draft.quoteId === '' || xId(s.draft.quoteId)) && xMedia(s.draft.media)
        && Array.isArray(s.dms) && s.dms.length <= 500 && s.dms.every(m => m && xHandle(m.handle) && m.side === 'me' && xText(m.text, 2000) && m.text.trim() && xText(m.time, 30))
        && Array.isArray(s.readDM) && s.readDM.length <= 5 && s.readDM.every(xHandle) && ids(s.seen);
}
try { const raw = localStorage.getItem(X_SAVE_KEY); if (raw && raw.length < 3000000) { const saved = JSON.parse(raw); if (validXState(saved)) xState = saved; } } catch { xStorageOK = false; }
const xReactions = { like: new Set(xState.likes), repost: new Set(xState.reposts), bookmark: new Set(xState.bookmarks) };
function saveX() { try { xState.likes = [...xReactions.like]; xState.reposts = [...xReactions.repost]; xState.bookmarks = [...xReactions.bookmark]; localStorage.setItem(X_SAVE_KEY, JSON.stringify(xState)); xStorageOK = true; } catch { xStorageOK = false; } }
const X_MORE = g('<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>');
const X_REPOST = g('<path d="m4 7 3-3 3 3M7 4v12a3 3 0 0 0 3 3h4M20 17l-3 3-3-3M17 20V8a3 3 0 0 0-3-3h-4"/>');
const X_BOOKMARK = g('<path d="M6 3h12v18l-6-4-6 4Z"/>');
const X_GROK = g('<path d="m5 19 14-14M7 5h12v12M4 14l6 6"/>');
const X_ENVELOPE = g('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>');
let xTimeline = 'forYou', xQuery = '', xSearchTab = 'posts', xPostId = 'han-stairs', xProfileHandle = 'hanpixels_au', xProfileTab = 'posts', xDmHandle = 'hanpixels_au', xGuideAnswer = '';
let xTrail = [], xScroll = {}, xMessageDrafts = {};
function xPosts() { return [...xState.posts.map(p => ({ ...p, name: 'Minji', handle: X_SELF, photo: 'assets/yixuan.jpg', likes: 0, reposts: 0, replies: [] })), ...X_AU_POSTS]; }
function xPost(id) { return xPosts().find(p => p.id === id); }
function xProfile(handle) { return X_PROFILES.find(p => p.handle === handle) || X_PROFILES[0]; }
function xAllReplies(p) { return [...p.replies.map(([name, text], i) => ({ id: p.id + '-r' + i, name, text, handle: X_PROFILES.find(a => a.name === name)?.handle || X_SELF, time: p.time })), ...xState.replies.filter(r => r.postId === p.id).map(r => ({ ...r, name: 'Minji', handle: X_SELF }))]; }
function xAvatar(handle, cls = '') { const p = xProfile(handle); return `<button class="x-person ${cls}" onclick="event.stopPropagation();openXProfile('${p.handle}')" aria-label="View ${p.name} profile">${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : `<span class="x-account-avatar" style="background:${p.color}">${p.name[0]}</span>`}</button>`; }
function xScrollKey() { return [view, xPostId, xProfileHandle, xDmHandle, xTimeline, xProfileTab].join('|'); }
function xRemember() { const sc = $('.pg[data-view="' + view + '"]>.scroll'); if (sc) xScroll[xScrollKey()] = sc.scrollTop || 0; }
function xSnapshot() { return { view, post: xPostId, profile: xProfileHandle, profileTab: xProfileTab, dm: xDmHandle }; }
function xNavigate(id, values = {}, root = false) { if (!VIEWS[id]) return; xRemember(); if (root) xTrail = []; else if (view.startsWith('x')) xTrail.push(xSnapshot()); if (values.post) xPostId = values.post; if (values.profile) xProfileHandle = values.profile; if (values.dm) xDmHandle = values.dm; if (values.profileTab) xProfileTab = values.profileTab; show(id, root ? 'swap' : 'push'); }
function xBack() { xRemember(); const prev = xTrail.pop(); if (!prev) { show('x', 'pop'); return; } xPostId = prev.post; xProfileHandle = prev.profile; xProfileTab = prev.profileTab; xDmHandle = prev.dm; show(prev.view, 'pop'); }
const beforeXBack = back;
back = function () { if (view.startsWith('x') && view !== 'x') { xBack(); return; } beforeXBack(); };
function openXPost(id) { if (!xPost(id)) return; xNavigate('xpost', { post: id }); }
function xReplies(id) { openXPost(id); }
function openXProfile(handle) { if (!xHandle(handle)) return; closeSheet(); xNavigate('xprofile', { profile: handle, profileTab: 'posts' }); }
function xRoot(id) { if (!VIEWS[id]) return; if (id === 'xnotifications') { xState.seen = X_NOTIFICATIONS.map(n => n.id); saveX(); } if (view === id) { const sc = $('.pg[data-view="' + view + '"]>.scroll'); sc?.scrollTo({ top: 0, behavior: 'smooth' }); return; } xNavigate(id, {}, true); }
function xPageInit(pg) { const sc = pg.querySelector('.scroll'); if (sc) sc.scrollTop = xScroll[xScrollKey()] || 0; }
function xReactionHTML(p, kind) { const active = xReactions[kind].has(p.id); return `${kind === 'like' ? G.heart : X_REPOST}<span>${(kind === 'like' ? p.likes : p.reposts) + (active ? 1 : 0)}</span>`; }
function reactX(id, kind, button) { const p = xPost(id); if (!p || !['like', 'repost', 'bookmark'].includes(kind)) return; const set = xReactions[kind]; set.has(id) ? set.delete(id) : set.add(id); saveX(); if (button) { button.innerHTML = kind === 'bookmark' ? X_BOOKMARK : xReactionHTML(p, kind); button.setAttribute('aria-pressed', String(set.has(id))); } }
function xSheet(title, html) { sheetAU(title, html); OV.querySelector('.au-sheet')?.classList.add('x-sheet'); }
function xRepostMenu(id) { const p = xPost(id); if (!p) return; xSheet('Repost', `<button class="x-sheet-row" onclick="reactX('${id}','repost');closeSheet();xRemember();show(view)">${X_REPOST}${xReactions.repost.has(id) ? 'Undo repost' : 'Repost'}</button><button class="x-sheet-row" onclick="closeSheet();openXComposer('','${id}')">${G.pen}Quote</button>`); }
function xPostMenu(id) { const p = xPost(id); if (!p) return; xSheet('Post', `<button class="x-sheet-row" onclick="reactX('${id}','bookmark');closeSheet();xRemember();show(view)">${X_BOOKMARK}${xReactions.bookmark.has(id) ? 'Remove bookmark' : 'Bookmark'}</button><button class="x-sheet-row" onclick="shareXPost('${id}')">${G.share}Share post</button>${id.startsWith('mine-') ? `<button class="x-sheet-row x-delete" onclick="deleteXPost('${id}')">Delete post</button>` : ''}`); }
function shareXPost(id) { const p = xPost(id); if (!p) return; xSheet('Share post', `<textarea class="x-share-text" readonly aria-label="Post text">${esc(p.name + ' · SOFT LAUNCH AU\n' + p.text)}</textarea><button class="x-sheet-row" onclick="copyXPost('${id}')">Copy text</button>`); }
async function copyXPost(id) { const p = xPost(id); if (!p) return; try { await navigator.clipboard.writeText(p.name + ' · SOFT LAUNCH AU\n' + p.text); toastAU('Copied'); closeSheet(); } catch { OV.querySelector('.x-share-text')?.select(); toastAU('Select the text to copy it.'); } }
function deleteXPost(id) { if (!xState.posts.some(p => p.id === id)) return; xState.posts = xState.posts.filter(p => p.id !== id); xState.replies = xState.replies.filter(p => p.postId !== id); if (xState.draft.replyTo === id) xState.draft.replyTo = ''; if (xState.draft.quoteId === id) xState.draft.quoteId = ''; for (const set of Object.values(xReactions)) set.delete(id); saveX(); closeSheet(); if (view === 'xpost' && xPostId === id) xBack(); else show(view); toastAU('Post deleted'); }
function xActions(p) { return `<div class="x-actions" onclick="event.stopPropagation()"><button onclick="openXComposer('${p.id}')" aria-label="Reply to ${p.name}">${G.chat}<span>${xAllReplies(p).length}</span></button><button onclick="xRepostMenu('${p.id}')" aria-label="Repost AU post" aria-pressed="${xReactions.repost.has(p.id)}">${xReactionHTML(p, 'repost')}</button><button onclick="reactX('${p.id}','like',this)" aria-label="Like AU post" aria-pressed="${xReactions.like.has(p.id)}">${xReactionHTML(p, 'like')}</button><button onclick="reactX('${p.id}','bookmark',this)" aria-label="Bookmark post" aria-pressed="${xReactions.bookmark.has(p.id)}">${X_BOOKMARK}</button><button onclick="shareXPost('${p.id}')" aria-label="Share post">${G.share}</button></div>`; }
function xQuoteHTML(id) { const p = xPost(id); return p ? `<button class="x-quote" onclick="event.stopPropagation();openXPost('${id}')"><b>${esc(p.name)} <span>AU · @${p.handle}</span></b><p>${esc(p.text)}</p></button>` : '<div class="x-quote">This post is unavailable.</div>'; }
function xAUPostHTML(p, detail = false) { return `<article class="x-post x-native ${detail ? 'x-detail-post' : ''}" id="x-au-${p.id}">${xAvatar(p.handle, 'x-native-avatar')}<div class="x-native-content"><div class="x-native-author"><button class="x-author-name" onclick="openXProfile('${p.handle}')">${esc(p.name)}</button><span class="x-au-label">AU</span><small>@${p.handle}</small><span class="x-post-time">· ${esc(p.time)}</span><button class="x-more" onclick="xPostMenu('${p.id}')" aria-label="Post options">${X_MORE}</button></div>${detail ? '<div class="x-post-body">' : `<button class="x-post-body" onclick="openXPost('${p.id}')">`}<span class="x-post-text">${esc(p.text)}</span>${detail ? '</div>' : '</button>'}${p.media ? `<button class="x-post-media" onclick="openXMedia('${p.media}')"><img src="${p.media}" alt="Attached AU photo"></button>` : ''}${p.quoteId ? xQuoteHTML(p.quoteId) : ''}${detail ? `<div class="x-detail-date">${esc(p.time)} · Oct 21, 2026 · SOFT LAUNCH AU</div>` : ''}${xActions(p)}</div></article>`; }
function openXMedia(path) { if (!xMedia(path) || !path) return; xSheet('Photo', `<img class="x-full-photo" src="${path}" alt="AU photo">`); }
function xPostHTML(p) { return `<article class="x-post x-source-post"><div id="x-fallback-${p.id}" class="x-byline"><span class="x-account-avatar" aria-hidden="true">${p.handle[0].toUpperCase()}</span><div><b>${esc(p.handle)}</b><small>@${esc(p.handle)}</small></div></div><div id="x-post-${p.id}" class="x-embed"></div><p id="x-status-${p.id}" class="x-load-status" role="status">Loading post…</p><a class="x-source" href="https://x.com/${p.handle}/status/${p.id}" target="_blank" rel="noopener noreferrer">Open on X ↗</a></article>`; }
function xFeedHTML() { let posts = xPosts(); if (xTimeline === 'following') posts = posts.filter(p => p.handle === X_SELF || xState.following.includes(p.handle) || xReactions.repost.has(p.id)); return posts.map((p, i) => xAUPostHTML(p) + (xTimeline === 'forYou' && i % 2 === 1 && i < 6 ? xPostHTML(X_POSTS[(i - 1) / 2]) : '')).join(''); }
function xNav(active = 'home') { const unread = X_NOTIFICATIONS.filter(n => !xState.seen.includes(n.id)).length; return `<nav class="x-nav" aria-label="X navigation">${[['home', G.home, 'Home', 'x'], ['search', G.search, 'Search', 'xsearch'], ['grok', X_GROK, 'Grok', 'xgrok'], ['notifications', G.bell, 'Notifications', 'xnotifications'], ['messages', X_ENVELOPE, 'Messages', 'xmessages']].map(([id, icon, label, route]) => `<button class="${active === id ? 'active' : ''}" onclick="xRoot('${route}')" aria-label="${label}" ${active === id ? 'aria-current="page"' : ''}>${icon}${id === 'notifications' && unread ? '<i class="x-nav-dot"></i>' : ''}</button>`).join('')}</nav>`; }
function xHeader(title = '', sub = false) { return `<header class="x-header">${sub ? `<button onclick="xBack()" aria-label="Back">${G.chevLb}</button>` : `<button class="x-profile" onclick="xDrawer()" aria-label="Account menu"><img src="assets/yixuan.jpg" alt="Minji"></button>`}${title ? `<b class="x-page-title">${esc(title)}</b>` : `<b class="x-wordmark" aria-label="X">𝕏</b>`}${title === 'Messages' ? `<button onclick="xNewDM()" aria-label="New message">${G.compose}</button>` : `<button onclick="refreshX()" aria-label="Refresh timeline">↻</button>`}</header>`; }
function xDrawer() { xSheet('Account', `<div class="x-drawer-profile">${xAvatar(X_SELF)}<b>Minji</b><small>@${X_SELF}</small><p>SOFT LAUNCH · fictional AU</p><span><b>${xState.following.length}</b> Following</span></div><button class="x-sheet-row" onclick="closeSheet();openXProfile('${X_SELF}')">${G.person}Profile</button><button class="x-sheet-row" onclick="closeSheet();xNavigate('xbookmarks')">${X_BOOKMARK}Bookmarks</button><button class="x-sheet-row" onclick="closeSheet();openXComposer()">${G.pen}Drafts${xState.draft.text || xState.draft.media ? ' · 1' : ''}</button><button class="x-sheet-row" onclick="closeSheet();push('settings')">${G.gear}Settings</button>${!xStorageOK ? '<p class="settings-footnote">Saving is unavailable. Keep this tab open to keep changes.</p>' : ''}`); OV.querySelector('.au-sheet')?.classList.add('x-drawer'); }
function refreshX() { xScroll[xScrollKey()] = 0; show(view); toastAU('You’re up to date.'); }
function setXTimeline(tab) { if (!['forYou', 'following'].includes(tab) || tab === xTimeline) return; xRemember(); xTimeline = tab; show('x'); }
function xTimelineInit(pg) { xPageInit(pg); if (xTimeline === 'forYou') mountXPosts(pg); const feed = pg.querySelector('.x-feed'); if (!feed) return; let start = null; feed.addEventListener('touchstart', e => { const t = e.touches[0]; start = { x: t.clientX, y: t.clientY, top: feed.scrollTop }; }, { passive: true }); feed.addEventListener('touchend', e => { if (!start) return; const t = e.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y; if (start.top === 0 && dy > 85 && Math.abs(dx) < 40) refreshX(); else if (Math.abs(dx) > 95 && Math.abs(dy) < 45) setXTimeline(dx < 0 ? 'following' : 'forYou'); start = null; }, { passive: true }); }
VIEWS.x = () => ({ cls: 'x-app', dark: false, html: xHeader() + `<div class="x-tabs" role="tablist" aria-label="Timeline"><button role="tab" aria-selected="${xTimeline === 'forYou'}" onclick="setXTimeline('forYou')"><span>For you</span></button><button role="tab" aria-selected="${xTimeline === 'following'}" onclick="setXTimeline('following')"><span>Following</span></button></div><div class="scroll x-feed">${xFeedHTML()}<p class="x-feed-end">You’re all caught up.</p></div><button class="x-compose" onclick="openXComposer()" aria-label="Compose post">${G.pen}</button>` + xNav(), init: xTimelineInit });
VIEWS.xpost = () => { const p = xPost(xPostId); return { cls: 'x-app', dark: false, html: xHeader('Post', true) + `<div class="scroll">${p ? xAUPostHTML(p, true) + `<div class="x-reply-prompt"><button onclick="openXComposer('${p.id}')">Post your reply</button></div>` + xAllReplies(p).map(r => `<article class="x-post x-native">${xAvatar(r.handle)}<div class="x-native-content"><div class="x-native-author"><button class="x-author-name" onclick="openXProfile('${r.handle}')">${esc(r.name)}</button><span class="x-au-label">AU</span></div><p class="x-post-text">${esc(r.text)}</p>${r.media ? `<button class="x-post-media" onclick="openXMedia('${r.media}')"><img src="${r.media}" alt="Reply photo"></button>` : ''}<small class="x-reply-time">${esc(r.time)}</small></div></article>`).join('') : '<p class="x-feed-end">This post is unavailable.</p>'}</div>`, init: xPageInit }; };
function followX(handle) { if (!xHandle(handle) || handle === X_SELF) return; const i = xState.following.indexOf(handle); if (i < 0) xState.following.push(handle); else xState.following.splice(i, 1); saveX(); xRemember(); show('xprofile'); }
function setXProfileTab(tab) {
    if (!['posts', 'replies', 'media'].includes(tab))
        return; xRemember(); xProfileTab = tab; show('xprofile');
}
VIEWS.xprofile = () => { const p = xProfile(xProfileHandle), own = p.handle === X_SELF, posts = xPosts().filter(a => a.handle === p.handle), following = xState.following.includes(p.handle); const content = xProfileTab === 'replies' ? xPosts().flatMap(a => xAllReplies(a).filter(r => r.handle === p.handle).map(r => `<button class="x-profile-reply" onclick="openXPost('${a.id}')"><small>Replying to @${a.handle}</small><p>${esc(r.text)}</p></button>`)).join('') : posts.filter(a => xProfileTab !== 'media' || a.media).map(a => xAUPostHTML(a)).join(''); return { cls: 'x-app', dark: false, html: xHeader(p.name, true) + `<div class="scroll"><div class="x-profile-banner" style="background:${p.color}"></div><div class="x-profile-info"><div class="x-profile-controls">${xAvatar(p.handle, 'x-profile-large')}<div>${own ? `<button class="x-follow" onclick="openXComposer()">Post</button>` : `<button class="x-message-profile" onclick="openXDM('${p.handle}')" aria-label="Message ${p.name}">${X_ENVELOPE}</button><button class="x-follow ${following ? 'following' : ''}" onclick="followX('${p.handle}')">${following ? 'Following' : 'Follow'}</button>`}</div></div><h2>${p.name} <span class="x-au-label">AU</span></h2><small>@${p.handle}</small><p>${esc(p.bio)}</p><div class="x-profile-meta">Gantara campus · Joined September 2026</div><div class="x-profile-stats"><b>${own ? xState.following.length : 4}</b> Following <b>${posts.length}</b> Posts</div></div><div class="x-tabs">${['posts', 'replies', 'media'].map(tab => `<button aria-selected="${xProfileTab === tab}" onclick="setXProfileTab('${tab}')"><span>${tab[0].toUpperCase() + tab.slice(1)}</span></button>`).join('')}</div>${content || '<p class="x-feed-end">Nothing here yet.</p>'}</div>`, init: xPageInit }; };
function openXComposer(replyTo = '', quoteId = '') {
    if ((replyTo && !xPost(replyTo)) || (quoteId && !xPost(quoteId))) return;
    const d = xState.draft; if ((d.text || d.media) && (d.replyTo !== replyTo || d.quoteId !== quoteId)) toastAU('Resuming your saved draft.'); else if (!d.text && !d.media) { d.replyTo = replyTo; d.quoteId = quoteId; saveX(); }
    xNavigate('xcompose');
}
function updateXDraft(text) { xState.draft.text = String(text).slice(0, 2000); saveX(); const n = Array.from(xState.draft.text).length, valid = (!!xState.draft.text.trim() || !!xState.draft.media || !!xState.draft.quoteId) && n <= 280; $('#x-draft-count').textContent = n + '/280'; $('#x-draft-count').classList.toggle('over', n > 280); $('#x-submit-post').disabled = !valid; }
function cancelXComposer() { saveX(); xBack(); }
function discardXDraft() { xState.draft = { text: '', replyTo: '', quoteId: '', media: '' }; saveX(); show('xcompose'); }
function xPhotoPicker() { xSheet('Add a photo', `<div class="x-photo-picker">${Array.from({ length: 6 }, (_, i) => `<button onclick="setXDraftPhoto('assets/photo-${i}.jpg')"><img src="assets/photo-${i}.jpg" alt="Photo ${i + 1}"></button>`).join('')}</div>`); }
function setXDraftPhoto(path) { if (!xMedia(path)) return; xState.draft.media = path; saveX(); closeSheet(); show('xcompose'); }
function submitXPost() {
    const d = xState.draft, text = d.text.trim(); if (Array.from(d.text).length > 280 || (!text && !d.media && !d.quoteId)) return false;
    if ((d.replyTo && !xPost(d.replyTo)) || (d.quoteId && !xPost(d.quoteId))) return false;
    if ((d.replyTo && xState.replies.length >= 500) || (!d.replyTo && xState.posts.length >= 100)) { toastAU('Your local timeline is full.'); return false; }
    const id = 'mine-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9), target = d.replyTo;
    if (target) { xState.replies.push({ id, postId: target, text, time: nowAmpm(), media: d.media }); } else xState.posts.unshift({ id, text, time: nowAmpm(), quoteId: d.quoteId, media: d.media });
    xState.draft = { text: '', replyTo: '', quoteId: '', media: '' }; saveX(); xTrail = []; xScroll = {}; if (target) { xPostId = target; show('xpost', 'pop'); } else show('x', 'pop'); toastAU(target ? 'Your reply was sent.' : 'Your post was sent.'); return true;
}
VIEWS.xcompose = () => { const d = xState.draft, p = xPost(d.replyTo), n = Array.from(d.text).length; return { cls: 'x-app x-composer', dark: false, html: `<header class="x-compose-header"><button onclick="cancelXComposer()">Cancel</button><span>Drafts</span><button class="x-post-submit" id="x-submit-post" onclick="submitXPost()" ${n > 280 || (!d.text.trim() && !d.media && !d.quoteId) ? 'disabled' : ''}>${p ? 'Reply' : 'Post'}</button></header><div class="scroll">${p ? `<div class="x-compose-context"><b>${esc(p.name)} <span>AU</span></b><p>${esc(p.text)}</p><small>Replying to <span>@${p.handle}</span></small></div>` : ''}<div class="x-writing">${xAvatar(X_SELF)}<div><span class="x-audience">${p ? 'Reply' : 'Everyone'} · AU</span><textarea id="x-draft-text" aria-label="Post text" placeholder="${p ? 'Post your reply' : 'What is happening?!'}" maxlength="2000" oninput="updateXDraft(this.value)">${esc(d.text)}</textarea>${d.media ? `<div class="x-draft-photo"><img src="${d.media}" alt="Attached photo"><button onclick="setXDraftPhoto('')" aria-label="Remove photo">×</button></div>` : ''}${d.quoteId ? xQuoteHTML(d.quoteId) : ''}</div></div></div><div class="x-compose-tools"><button onclick="xPhotoPicker()" aria-label="Add photo">${G.photo}</button><button onclick="discardXDraft()" class="x-discard">Discard draft</button><span id="x-draft-count" class="${n > 280 ? 'over' : ''}">${n}/280</span></div>`, init: pg => pg.querySelector('textarea')?.focus() }; };
VIEWS.xbookmarks = () => ({ cls: 'x-app', dark: false, html: xHeader('Bookmarks', true) + `<div class="scroll">${xPosts().filter(p => xReactions.bookmark.has(p.id)).map(p => xAUPostHTML(p)).join('') || '<div class="x-empty"><h2>Save posts for later</h2><p>Tap the bookmark on a post to find it here.</p></div>'}</div>`, init: xPageInit });
function setXSearchTab(tab) { if (!['posts', 'people'].includes(tab)) return; xSearchTab = tab; show('xsearch'); }
function xSearchHTML() {
    const q = xQuery.trim().replace(/^@/, '').toLowerCase(); if (xSearchTab === 'people') { const people = X_PROFILES.filter(p => (p.name + ' ' + p.handle + ' ' + p.bio).toLowerCase().includes(q)), real = X_POSTS.filter(p => p.handle.toLowerCase().includes(q)); return people.map(p => `<button class="x-search-result" onclick="openXProfile('${p.handle}')"><span class="x-account-avatar">${p.name[0]}</span><span><b>${p.name} · AU</b><small>@${p.handle}</small></span>${G.chevR}</button>`).join('') + real.map(p => `<a class="x-search-result" href="https://x.com/${p.handle}/status/${p.id}" target="_blank" rel="noopener noreferrer"><span class="x-account-avatar">${p.handle[0]}</span><span><b>${p.handle}</b><small>Original post on X</small></span>${G.chevR}</a>`).join('') || '<p class="x-feed-end">No people found.</p>'; }
    const matches = xPosts().filter(p => (p.text + ' ' + p.name + ' ' + p.handle).toLowerCase().includes(q)); return matches.length ? matches.map(p => xAUPostHTML(p)).join('') : '<p class="x-feed-end">No posts found.</p>';
}
function searchX(value) { xQuery = value; $('#x-search-results').innerHTML = xSearchHTML(); }
VIEWS.xsearch = () => ({ cls: 'x-app', dark: false, html: xHeader('Explore') + `<input class="x-search-field" aria-label="Search X" placeholder="Search X" value="${esc(xQuery)}" oninput="searchX(this.value)"><div class="x-tabs">${['posts', 'people'].map(tab => `<button aria-selected="${xSearchTab === tab}" onclick="setXSearchTab('${tab}')"><span>${tab === 'posts' ? 'Latest' : 'People'}</span></button>`).join('')}</div><div class="scroll" id="x-search-results">${xSearchHTML()}</div>` + xNav('search'), init: xPageInit });
VIEWS.xnotifications = () => ({ cls: 'x-app', dark: false, html: xHeader('Notifications') + `<div class="scroll">${X_NOTIFICATIONS.map(n => `<button class="x-notification ${xState.seen.includes(n.id) ? '' : 'unread'}" onclick="openXPost('${n.post}')"><span class="x-notification-icon ${n.kind}">${n.kind === 'like' ? G.heart : n.kind === 'repost' ? X_REPOST : G.chat}</span><span>${xProfile(n.handle).photo ? `<img src="${xProfile(n.handle).photo}" alt="${xProfile(n.handle).name}">` : ''}<span>${esc(n.text)}</span><small>SOFT LAUNCH AU · Today</small></span></button>`).join('')}</div>` + xNav('notifications'), init: xPageInit });
function xNewDM() { xSheet('New message', X_PROFILES.filter(p => p.handle !== X_SELF).map(p => `<button class="x-sheet-row" onclick="closeSheet();openXDM('${p.handle}')">${p.photo ? `<img class="x-new-dm-avatar" src="${p.photo}" alt="${p.name}">` : G.person}${p.name}<small>AU</small></button>`).join('')); }
function xDMRows(handle) { return [...X_DM_SEED, ...xState.dms].filter(m => m.handle === handle); }
function openXDM(handle) { if (!xHandle(handle) || handle === X_SELF) return; if (!xState.readDM.includes(handle)) xState.readDM.push(handle); saveX(); xNavigate('xdm', { dm: handle }); }
function updateXMessage(text) { xMessageDrafts[xDmHandle] = String(text).slice(0, 2000); const button = $('#x-send-dm'); if (button) button.disabled = !text.trim(); }
function sendXDM() { const text = (xMessageDrafts[xDmHandle] || '').trim(); if (!text || text.length > 2000 || xState.dms.length >= 500) return false; xState.dms.push({ handle: xDmHandle, side: 'me', text, time: nowAmpm() }); xMessageDrafts[xDmHandle] = ''; saveX(); show('xdm'); return true; }
VIEWS.xmessages = () => ({ cls: 'x-app', dark: false, html: xHeader('Messages') + `<div class="scroll">${X_PROFILES.filter(p => p.handle !== X_SELF && xDMRows(p.handle).length).map(p => { const last = xDMRows(p.handle).at(-1), unread = !xState.readDM.includes(p.handle); return `<button class="x-dm-thread ${unread ? 'unread' : ''}" onclick="openXDM('${p.handle}')">${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : `<span class="x-account-avatar">${p.name[0]}</span>`}<span><b>${p.name} <small>AU · ${esc(last.time)}</small></b><p>${last.side === 'me' ? 'You: ' : ''}${esc(last.text)}</p></span>${unread ? '<i class="x-nav-dot"></i>' : ''}</button>`; }).join('')}</div>` + xNav('messages'), init: xPageInit });
VIEWS.xdm = () => { const p = xProfile(xDmHandle); return { cls: 'x-app', dark: false, html: xHeader(p.name, true) + `<div class="scroll x-dm-messages"><button class="x-dm-intro" onclick="openXProfile('${p.handle}')">${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : ''}<b>${p.name}</b><small>@${p.handle} · SOFT LAUNCH AU</small></button><p class="x-dm-date">October 21, 2026</p>${xDMRows(p.handle).map(m => `<div class="x-dm-bubble ${m.side}"><p>${esc(m.text)}</p><small>${esc(m.time)}${m.side === 'me' ? ' · Sent' : ''}</small></div>`).join('')}</div><form class="x-dm-input" onsubmit="event.preventDefault();sendXDM()"><input aria-label="Start a message" placeholder="Start a message" maxlength="2000" value="${esc(xMessageDrafts[p.handle] || '')}" oninput="updateXMessage(this.value)"><button id="x-send-dm" aria-label="Send message" ${!(xMessageDrafts[p.handle] || '').trim() ? 'disabled' : ''}>${G.arrowUp}</button></form>`, init: pg => { const sc = pg.querySelector('.scroll'); if (sc) sc.scrollTop = sc.scrollHeight; } }; };
const X_GUIDE = [
    [
        "Apa itu JEJAK?",
        "Proyek kecil untuk pameran mahasiswa: enam foto keseharian sekitar kampus, caption pendek, dan arsip web. Hanni mengerjakan foto dan layout, Minji membuat web. Cetak Sela membantu mencetak display. Cek ruangan pukul 16.30, buka pukul 17.00 di Gantara Hall."
    ],
    [
        "Hanni lagi di mana?",
        "Pagi ini Hanni masuk Studio Garis untuk kelas. Dia mahasiswa DKV semester lima; Minji mahasiswa Teknik Informatika di Institut Teknologi Bumi, kampus fiktif di Bandung. Mereka baru memastikan waktu ketemu setelah kelas selesai."
    ],
    [
        "Kenapa sekarang selalu kabarin setelah kelas?",
        "Tanggal 15 Oktober, Minji berjanji makan siang pukul 12, tetapi praktikumnya molor dan dia lupa memberi kabar. Hanni menunggu setengah jam lalu kembali ke studio. Mereka sudah membicarakannya; sekarang Minji memastikan jadwal setelah benar-benar keluar kelas."
    ]
];
function askXGuide(index) { if (!X_GUIDE[index]) return; xGuideAnswer = X_GUIDE[index][1]; show('xgrok'); }
VIEWS.xgrok = () => ({ cls: 'x-app', dark: false, html: xHeader('Grok') + `<div class="scroll x-guide"><div class="x-guide-logo">${X_GROK}</div><h2>What do you want to know?</h2><p>SOFT LAUNCH story guide · AU</p>${X_GUIDE.map(([q], i) => `<button onclick="askXGuide(${i})">${q}</button>`).join('')}${xGuideAnswer ? `<div class="x-guide-answer">${esc(xGuideAnswer)}</div>` : ''}</div>` + xNav('grok') });
Object.assign(PARENT, Object.fromEntries(['xprofile', 'xpost', 'xcompose', 'xbookmarks', 'xsearch', 'xnotifications', 'xmessages', 'xdm', 'xgrok'].map(id => [id, 'x'])));
addEventListener('pagehide', saveX);

let xWidgetsPromise = null;
function loadXWidgets() {
    if (window.twttr?.widgets?.createTweet) return Promise.resolve(window.twttr.widgets);
    if (xWidgetsPromise) return xWidgetsPromise;
    xWidgetsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script'); script.src = 'assets/widgets.js'; script.async = true;
        const timeout = setTimeout(() => { script.remove(); reject(new Error('X timed out')); }, 12000);
        script.onload = () => { clearTimeout(timeout); if (window.twttr?.widgets?.createTweet) resolve(window.twttr.widgets); else reject(new Error('X unavailable')); };
        script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('X unavailable')); };
        document.head.appendChild(script);
    }).catch(error => { xWidgetsPromise = null; throw error; });
    return xWidgetsPromise;
}
async function mountXPosts(pg) {
    let widgets;
    try { widgets = await loadXWidgets(); } catch { if (pg.isConnected) pg.querySelectorAll('.x-load-status').forEach(el => { el.textContent = 'Couldn’t load this post. Open it on X or try refreshing.'; }); return; }
    if (!pg.isConnected) return;
    await Promise.all(X_POSTS.map(async post => {
        const slot = pg.querySelector('#x-post-' + post.id), status = pg.querySelector('#x-status-' + post.id);
        if (!slot || !status) return;
        try {
            const embedded = await widgets.createTweet(post.id, slot, { theme: 'light', dnt: true, conversation: 'none', align: 'center', lang: 'en' });
            if (!pg.isConnected) return;
            status.hidden = !!embedded;
            const fallback = pg.querySelector('#x-fallback-' + post.id); if (fallback) fallback.hidden = !!embedded;
            if (!embedded) status.textContent = 'This post is unavailable here. Open it on X.';
        } catch { if (pg.isConnected) status.textContent = 'Couldn’t load this post. Open it on X.'; }
    }));
}

// Device continuity stays separate from story choices so old story saves remain readable.
const DEVICE_KEY = 'bandung-device-v2';
let phoneLast = {}, phoneScroll = {}, phonePinned = {}, phoneDrafts = {}, screenChatId = chatId, changingPhoneScreen = false;
let devicePrefs = { airplane: false, wifi: true, bluetooth: true, notifications: true, focus: false }, deviceSetting = 'Wi-Fi';
const ownView = id => typeof id === 'string' && Object.hasOwn(VIEWS, id);
const bounded = (n, max = 1e7) => Number.isFinite(n) && n >= 0 && n <= max;
function phoneScreenKey(id = view) { return id + '|' + (id === 'chat' ? screenChatId : id === 'note' ? noteId : id === 'maild' ? mailId : id === 'safarireader' ? safariReadId : ''); }
function rememberPhoneScreen(suspend = false) {
    if (changingPhoneScreen || !ownView(view) || ['lock', 'pin', 'home'].includes(view)) return;
    const sc = $('.pg[data-view="' + view + '"] ' + (view === 'chat' ? '.msgs' : '.scroll'));
    if (sc) { phoneScroll[phoneScreenKey()] = sc.scrollTop || 0; if (view === 'chat') phonePinned[phoneScreenKey()] = nearChatBottom(sc); }
    const root = rootOf(view);
    phoneLast[root] = { view, chatId: view === 'chat' ? screenChatId : chatId, noteId, mailId, article: safariReadId, setting: deviceSetting };
    if (view === 'chat') {
        phoneDrafts[screenChatId] = { text: composerDraft, pending: pendingText, choice: composerChoice, step: storyChoices.length, keyboard: !!$('#kbd')?.classList.contains('open') };
        if (suspend) { typingEpoch++; composerTyping = false; }
    }
    if (view.startsWith('x')) { xRemember(); phoneLast[root].x = { post: xPostId, profile: xProfileHandle, profileTab: xProfileTab, dm: xDmHandle, timeline: xTimeline }; }
}
function restorePhoneScreen(id, pg) {
    if (id === 'chat') {
        screenChatId = chatId; const draft = phoneDrafts[chatId];
        if (draft && draft.step === storyChoices.length && chatId === 'Hanni') {
            composerChoice = draft.choice; pendingText = draft.pending; setField(draft.text, !!draft.text);
            if (pendingText) $('#snd')?.classList.add('on');
            if (draft.keyboard) { $('#kbd')?.classList.add('open'); $('#cin')?.classList.remove('safe'); }
        }
        const sc = pg.querySelector('.msgs'); const top = phoneScroll[phoneScreenKey()];
        if (sc && top !== undefined) { if (phonePinned[phoneScreenKey()]) scrollChat(); else sc.scrollTop = top; }
        sc?.addEventListener('scroll', () => { if (nearChatBottom(sc)) clearNewChat() }, { passive: true });
    } else if (!id.startsWith('x')) { const sc = pg.querySelector('.scroll'), top = phoneScroll[phoneScreenKey(id)]; if (sc && top !== undefined) sc.scrollTop = top; }
}
const showBeforeDevice = show;
show = function (id, anim = 'swap') {
    rememberPhoneScreen(true); changingPhoneScreen = true; let pg;
    try { pg = showBeforeDevice(id, anim); restorePhoneScreen(id, pg); } finally { changingPhoneScreen = false; }
    saveDeviceState(false); return pg;
};
const closeBeforeDevice = closeApp;
closeApp = function () { if (callState) return; rememberPhoneScreen(true); saveDeviceState(false); closeBeforeDevice(); };
const openBeforeDevice = openApp;
openApp = function (id, el) {
    if (view !== 'home' || callState) return; const last = phoneLast[id];
    if (last) { chatId = last.chatId; noteId = last.noteId; mailId = last.mailId; safariReadId = last.article; deviceSetting = last.setting; if (last.x) { xPostId = xPost(last.x.post) ? last.x.post : 'han-stairs'; xProfileHandle = last.x.profile; xProfileTab = last.x.profileTab; xDmHandle = last.x.dm; xTimeline = last.x.timeline; } id = last.view; }
    openBeforeDevice(id, el);
};
function resetPhoneSessions() { phoneLast = {}; phoneScroll = {}; phonePinned = {}; phoneDrafts = {}; clearNewChat(); }
function validDeviceState(s) {
    const text = (v, n) => typeof v === 'string' && v.length <= n;
    return !!s && s.version === 1 && Number.isInteger(s.clock) && s.clock >= 437 && s.clock <= 1439
        && s.prefs && Object.keys(devicePrefs).every(k => typeof s.prefs[k] === 'boolean')
        && s.unread && Object.entries(s.unread).every(([k, n]) => chatNames.includes(k) && Number.isInteger(n) && bounded(n, 1000))
        && Number.isInteger(s.hanniUnread) && bounded(s.hanniUnread, 1000) && Number.isInteger(s.declined) && bounded(s.declined, 1000)
        && Array.isArray(s.calls) && s.calls.length <= 100 && s.calls.every(c => Array.isArray(c) && c.length === 3 && text(c[0], 80) && (chatNames.includes(c[0]) || Object.hasOwn(OTHER_CALLS, c[0]) || /^[0-9*#]{1,20}$/.test(c[0])) && /^오늘 \d{1,2}:\d{2}$/.test(c[1]) && ['발신', '수신', '부재중'].includes(c[2]))
        && Array.isArray(s.notes) && s.notes.length <= 30 && s.notes.every(n => n && text(n.title, 100) && text(n.body, 2000) && ['kakao', 'phone', 'rem'].includes(n.app) && text(n.time, 30))
        && s.scroll && Object.keys(s.scroll).length <= 200 && Object.entries(s.scroll).every(([k, n]) => ownView(k.split('|')[0]) && k.length < 150 && bounded(n))
        && (s.pinned === undefined || s.pinned && Object.keys(s.pinned).length <= 200 && Object.entries(s.pinned).every(([k, v]) => ownView(k.split('|')[0]) && k.length < 150 && typeof v === 'boolean'))
        && s.last && Object.keys(s.last).length <= 40 && Object.entries(s.last).every(([k, v]) => ownView(k) && v && ownView(v.view) && rootOf(v.view) === k && chatNames.includes(v.chatId) && Number.isInteger(v.noteId) && bounded(v.noteId, notes.length - 1) && Number.isInteger(v.mailId) && bounded(v.mailId, emails.length - 1) && SAFARI_READS.some(a => a.id === v.article) && text(v.setting, 80) && (v.x === undefined || v.x && text(v.x.post, 120) && xHandle(v.x.profile) && xHandle(v.x.dm) && ['posts', 'replies', 'media'].includes(v.x.profileTab) && ['forYou', 'following'].includes(v.x.timeline)))
        && (s.xScroll === undefined || s.xScroll && Object.keys(s.xScroll).length <= 300 && Object.entries(s.xScroll).every(([k, n]) => k.startsWith('x') && ownView(k.split('|')[0]) && k.length < 200 && bounded(n)))
        && (s.tools === undefined || s.tools && (s.tools.watchStart === null || bounded(s.tools.watchStart, Date.now())) && bounded(s.tools.watchElapsed, 31536000) && bounded(s.tools.timerDeadline, Date.now() + 10800000) && Number.isInteger(s.tools.timerSeconds) && s.tools.timerSeconds >= 60 && s.tools.timerSeconds <= 10800 && typeof s.tools.digits === 'string' && /^[0-9*#]{0,20}$/.test(s.tools.digits))
        && s.drafts && Object.entries(s.drafts).every(([k, v]) => chatNames.includes(k) && v && text(v.text, 2000) && text(v.pending, 2000) && [0, 1].includes(v.choice) && Number.isInteger(v.step) && bounded(v.step, STORY_BEATS.length) && typeof v.keyboard === 'boolean');
}
function saveDeviceState(remember = true) {
    if (remember && !changingPhoneScreen) rememberPhoneScreen();
    extraCalls = extraCalls.slice(0, 100); lockNotes = lockNotes.slice(0, 30);
    try { localStorage.setItem(DEVICE_KEY, JSON.stringify({ version: 1, clock: nowMin(), prefs: devicePrefs, unread, hanniUnread, declined, calls: extraCalls, notes: lockNotes, last: phoneLast, scroll: phoneScroll, pinned: phonePinned, drafts: phoneDrafts, xScroll, tools: { watchStart, watchElapsed, timerDeadline, timerSeconds, digits: dialDigits } })); } catch { storageAvailable = false; }
}
function restoreDeviceState() {
    try {
        const raw = localStorage.getItem(DEVICE_KEY); if (!raw) { const old = localStorage.getItem('softlaunch-device-v1'); if (old && old.length <= 100000) { const s = JSON.parse(old); if (validDeviceState(s)) devicePrefs = Object.fromEntries(Object.keys(devicePrefs).map(k => [k, s.prefs[k]])); } return; } if (raw.length > 100000) return; const s = JSON.parse(raw); if (!validDeviceState(s)) return;
        storyMinute = s.clock; devicePrefs = { ...s.prefs }; unread = { ...s.unread }; hanniUnread = s.hanniUnread; declined = s.declined; extraCalls = s.calls; lockNotes = s.notes; phoneLast = s.last; phoneScroll = s.scroll; phonePinned = s.pinned || {}; phoneDrafts = s.drafts; xScroll = s.xScroll || {}; if (s.tools) { watchStart = s.tools.watchStart; watchElapsed = s.tools.watchElapsed; timerDeadline = s.tools.timerDeadline; timerSeconds = s.tools.timerSeconds; dialDigits = s.tools.digits; }
    } catch { }
}

function openPhoneChat(name) { if (!chatNames.includes(name)) return; chatId = name; push('chat'); }
function deviceTab(app, index) {
    const routes = { phone: ['phonefavorites', 'phone', 'phonecontacts', 'phonekeypad', 'phonevoicemail'], clock: ['worldclock', 'clock', 'stopwatch', 'timer'], kakao: ['friends', 'kakao', 'openchats', 'purchases', 'settings'], instagram: ['instagram', 'search', 'instagram', 'reel', 'instagram'] };
    const route = routes[app]?.[index]; if (ownView(route)) { if (route === 'search') showSearch(); else push(route); }
}
const deviceHeader = (title, parent) => navHTML({ title: esc(title), back: esc(parent), backFn: 'back()' });
const phoneTabs = index => tabbar([['star', t('favorites')], ['clock', t('recents')], ['contacts', t('contacts')], ['keypad', t('keypad')], ['voicemail', t('voicemail')]], index, '', 'phone');
const clockTabs = index => tabbar([['globe', t('worldClock')], ['alarm', t('alarm')], ['stopwatch', t('stopwatch')], ['timer', t('timer')]], index, '', 'clock');
Object.assign(PARENT, { phonefavorites: 'phone', phonecontacts: 'phone', phonekeypad: 'phone', phonevoicemail: 'phone', worldclock: 'clock', stopwatch: 'clock', timer: 'clock', friends: 'kakao', openchats: 'kakao', purchases: 'kakao', devicesetting: 'settings' });
function contactRows(names) { return names.map(name => `<button class="device-contact" onclick="dial('${name}')"><span class="av">${avatarFor(name)}</span><span>${esc(name)}<small>mobile</small></span>${G.handset}</button>`).join(''); }
VIEWS.phonecontacts = () => ({ html: deviceHeader('Contacts', 'Recents') + `<div class="scroll"><h1 class="lt">Contacts</h1>${contactRows(chatNames.filter(n => !isGroup(n)))}</div>` + phoneTabs(2) });
VIEWS.phonefavorites = () => ({ html: deviceHeader('Favorites', 'Recents') + `<div class="scroll"><h1 class="lt">Favorites</h1>${contactRows(['Hanni', 'Mom'])}</div>` + phoneTabs(0) });
VIEWS.phonevoicemail = () => ({ html: deviceHeader('Voicemail', 'Recents') + `<div class="scroll"><div class="x-empty"><h2>No Voicemail</h2><p>New voicemail messages will appear here.</p></div></div>` + phoneTabs(4) });
let dialDigits = '';
function phoneDigit(d) { if (!/^[0-9*#]$/.test(d) || dialDigits.length >= 20) return; dialDigits += d; const out = $('#dial-digits'); if (out) out.textContent = dialDigits; tone(440 + (/^[0-9]$/.test(d) ? Number(d) * 25 : 0), 0, .08, .04); }
function erasePhoneDigit() { dialDigits = dialDigits.slice(0, -1); $('#dial-digits').textContent = dialDigits; }
function callPhoneDigits() { if (dialDigits) dial(dialDigits); }
VIEWS.phonekeypad = () => ({ html: deviceHeader('Keypad', 'Recents') + `<div class="scroll"><div class="device-digits" id="dial-digits">${esc(dialDigits)}</div><div class="device-keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(d => `<button onclick="phoneDigit('${d}')">${d}</button>`).join('')}<span></span><button class="device-call" onclick="callPhoneDigits()" aria-label="Call entered number">${G.handset}</button><button onclick="erasePhoneDigit()" aria-label="Delete digit">⌫</button></div></div>` + phoneTabs(3) });
VIEWS.friends = () => ({ html: deviceHeader('Friends', 'Chats') + `<div class="scroll"><h1 class="lt">Friends</h1>${chatNames.filter(n => !isGroup(n)).map(n => `<button class="device-contact" onclick="openPhoneChat('${n}')"><span class="av">${avatarFor(n)}</span><span>${n}</span>${G.chat}</button>`).join('')}</div>` });
VIEWS.openchats = () => ({ html: deviceHeader('OpenChat', 'Chats') + `<div class="scroll"><div class="au-card"><h2>Your campus groups</h2><p>Catch up with the JEJAK team.</p>${chatNames.filter(isGroup).map(n => `<button class="au-secondary" onclick="openPhoneChat('${n}')">${esc(dn(n))}</button>`).join('')}</div></div>` });
VIEWS.purchases = () => ({ html: deviceHeader('Shopping', 'Chats') + `<div class="scroll"><div class="x-empty"><h2>No orders yet</h2><p>Your order history is empty.</p></div></div>` });
VIEWS.worldclock = () => ({ cls: 'dark', dark: true, html: deviceHeader('World Clock', 'Alarms') + `<div class="scroll"><h1 class="lt">World Clock</h1>${[['Bandung', 0], ['Hanoi', 0], ['Seoul', 120]].map(([name, offset]) => `<div class="device-world"><span>${name}<small>${offset ? '2 hours ahead' : 'Same time'}</small></span><b>${fmtTime((nowMin() + offset) % 1440)}</b></div>`).join('')}</div>` + clockTabs(0) });
let watchStart = null, watchElapsed = 0, timerDeadline = 0, timerSeconds = 300;
function watchSeconds() { return watchElapsed + (watchStart === null ? 0 : (Date.now() - watchStart) / 1000); }
function deviceDuration(n) { n = Math.max(0, Math.floor(n)); return pad(Math.floor(n / 60)) + ':' + pad(n % 60); }
function toggleWatch() { if (watchStart === null) watchStart = Date.now(); else { watchElapsed = watchSeconds(); watchStart = null; } show('stopwatch'); }
function resetWatch() { watchStart = null; watchElapsed = 0; show('stopwatch'); }
VIEWS.stopwatch = () => ({ cls: 'dark', dark: true, html: deviceHeader('Stopwatch', 'Alarms') + `<div class="scroll"><div class="device-counter" id="watch-time">${deviceDuration(watchSeconds())}</div><div class="device-counter-actions"><button onclick="resetWatch()">Reset</button><button onclick="toggleWatch()">${watchStart === null ? 'Start' : 'Stop'}</button></div></div>` + clockTabs(2) });
function setPhoneTimer(value) { const n = Number(value); if (Number.isInteger(n) && n >= 1 && n <= 180 && !timerDeadline) timerSeconds = n * 60; }
function togglePhoneTimer() { timerDeadline = timerDeadline ? 0 : Date.now() + timerSeconds * 1000; show('timer'); }
VIEWS.timer = () => ({ cls: 'dark', dark: true, html: deviceHeader('Timer', 'Alarms') + `<div class="scroll"><div class="device-counter" id="timer-time">${deviceDuration(timerDeadline ? (timerDeadline - Date.now()) / 1000 : timerSeconds)}</div><label class="device-timer-label">Minutes <input type="number" min="1" max="180" value="${timerSeconds / 60}" ${timerDeadline ? 'disabled' : ''} onchange="setPhoneTimer(this.value)"></label><div class="device-counter-actions"><button onclick="togglePhoneTimer()">${timerDeadline ? 'Cancel' : 'Start'}</button></div></div>` + clockTabs(3) });
function tickDevice() {
    if (view === 'stopwatch') $('#watch-time').textContent = deviceDuration(watchSeconds());
    if (timerDeadline) { const left = (timerDeadline - Date.now()) / 1000; if (view === 'timer') $('#timer-time').textContent = deviceDuration(left); if (left <= 0) { timerDeadline = 0; sfx('msg'); sheetAU('Timer finished', '<p>Your timer has ended.</p>'); } }
}
const tickBeforeDevice = tick; tick = function () { tickBeforeDevice(); tickDevice(); };

function openDeviceSetting(label) { deviceSetting = label; push('devicesetting'); }
function setDevicePreference(key, on) { if (!Object.hasOwn(devicePrefs, key)) return; devicePrefs[key] = !!on; saveDeviceState(); show(view); }
function settingSwitch(key, label) { return `<div class="row"><span style="flex:1">${esc(label)}</span><button class="sw ${devicePrefs[key] ? 'on' : ''}" role="switch" aria-checked="${devicePrefs[key]}" aria-label="${esc(label)}" onclick="setDevicePreference('${key}',${!devicePrefs[key]})"></button></div>`; }
VIEWS.devicesetting = () => {
    const label = deviceSetting; let content = '';
    if (label === 'Wi-Fi') content = settingSwitch('wifi', 'Wi-Fi') + `<div class="row">${devicePrefs.wifi ? '✓ minji_home_5G' : 'Not connected'}</div>`;
    else if (label === 'Bluetooth') content = settingSwitch('bluetooth', 'Bluetooth') + `<div class="row">${devicePrefs.bluetooth ? 'No accessories connected' : 'Bluetooth is off'}</div>`;
    else if (label === t('notif')) content = settingSwitch('notifications', 'Allow Notifications') + '<div class="settings-footnote">KakaoTalk · Messages stay in your chats when alerts are off.</div>';
    else if (label === t('focus')) content = settingSwitch('focus', 'Do Not Disturb') + '<div class="settings-footnote">Silence message banners while you concentrate.</div>';
    else if (label === t('battery')) content = '<div class="row">Battery Level <b style="margin-left:auto">64%</b></div><p class="settings-footnote">Last charged to 100% at 6:30 AM.</p>';
    else if (label === t('privacy')) content = '<div class="row">Location Services <span class="muted" style="margin-left:auto">Off</span></div><p class="settings-footnote">No location access has been granted.</p>';
    else if (label === t('faceid')) content = '<div class="row">Passcode <span style="margin-left:auto">On</span></div><p class="settings-footnote">Birthday hint: October 6. Face ID is unavailable on this phone.</p>';
    else if (label === t('cellular')) content = '<div class="row">No SIM</div><p class="settings-footnote">Cellular service is unavailable.</p>';
    else if (label === t('access')) content = '<div class="row">Text follows your browser’s font settings.</div><p class="settings-footnote">Zoom is available. Reduced motion follows your device preference.</p>';
    else content = '<div class="row">Unavailable</div><p class="settings-footnote">This setting cannot be changed on this phone.</p>';
    return { cls: 'grouped', html: deviceHeader(label, 'Settings') + `<div class="scroll"><h1 class="lt">${esc(label)}</h1><div class="group">${content}</div></div>` };
};
const notifyBeforeDevice = notify; notify = function (body) { if (!devicePrefs.notifications || devicePrefs.focus) return; notifyBeforeDevice(body); };
function callKeypad() { sheetAU('Keypad', `<div class="device-keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(d => `<button onclick="tone(${d === '*' || d === '#' ? 440 : 440 + Number(d) * 25},0,.12,.04)">${d}</button>`).join('')}</div>`); }

restoreDeviceState();
// Older story saves used the device clock; continue after their last saved message.
for (const m of todayChat.slice(TODAY_CHAT.length)) { const match = m[2]?.match(/^(\d{1,2}):(\d{2}) ([AP]M)$/); if (match) storyMinute = Math.max(storyMinute, (+match[1] % 12 + (match[3] === 'PM' ? 12 : 0)) * 60 + +match[2]); }
storyClockStart = Math.max(storyMinute, 437 + Math.floor(livePassed / 60)); storyMinute = storyClockStart; storyClockBase = elapsed();
document.addEventListener('visibilitychange', () => { if (document.hidden) { rememberPhoneScreen(true); saveDeviceState(false); } else if (pendingReplies.length && !replyTimer && !callState) scheduleReply(); });
addEventListener('pagehide', saveDeviceState);


window.visualViewport?.addEventListener('resize', fit);

function calendarAction(index) { if (index === 0) { calMonth = 10; selectedDay = 21; show('calendar'); } else if (index === 1) sheetAU('Calendars', '<p>✓ Personal<br>✓ JEJAK exhibition</p>'); else if (index === 2) push('mail'); }

addEventListener('resize', fit);
fit(); renderLock(); renderHome(); setStatus(true);
setInterval(tick, 250); tick();