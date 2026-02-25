document.addEventListener('DOMContentLoaded', () => {
    initSakura();
    initScrollObserver();

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');
        });
    }

    // Our Journal (News/Blog)
    if (document.getElementById('journal-grid-preview')) renderActivityPreview();
    if (document.getElementById('journal-grid-full')) renderActivityFull();

    // Marino's Log (History)
    if (document.getElementById('history-list-preview')) renderHistoryPreview();
    if (document.getElementById('history-list-full')) renderHistoryFull();

    // Fan Projects / Group Activities Timeline (Our Activities)
    if (document.getElementById('activities-timeline-preview')) renderActivitiesPreview();
    if (document.getElementById('activities-timeline')) renderActivitiesFull();

    // Gallery (Music Videos)
    if (document.getElementById('gallery-preview-list')) renderGalleryPreview();
    if (document.getElementById('gallery-full-list')) renderGallery();
});

/* =========================================
   Sakura Animation Logic
   ========================================= */
function initSakura() {
    const container = document.getElementById('sakura-container');
    const petalCount = 30; // Number of petals falling at once

    for (let i = 0; i < petalCount; i++) {
        createPetal(container);
    }
}

function createPetal(container) {
    const petal = document.createElement('div');
    petal.classList.add('sakura');

    // Randomize size
    const size = Math.random() * 10 + 10; // 10px to 20px
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    // Randomize position
    petal.style.left = `${Math.random() * 100}vw`;

    // Randomize animation duration and delay
    const duration = Math.random() * 5 + 5; // 5s to 10s
    const delay = Math.random() * 5; // 0s to 5s

    petal.style.animationDuration = `${duration}s, ${Math.random() * 2 + 2}s`; // Fall duration, Sway duration
    petal.style.animationDelay = `${delay}s, ${Math.random() * 1}s`;

    container.appendChild(petal);

    // Remove and recreate after animation ends to prevent accumulation if using finite animation, 
    // but here we use infinite. However, optimizing DOM is good.
    // Since it's infinite, they just loop. Keyframe 'fall' goes from -10% to 110%.
}


/* =========================================
   Scroll Intersection Observer
   ========================================= */
function initScrollObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));
}


/* =========================================
   Activity / News Data Rendering
   ========================================= */
const activityData = [
    {
        id: 1,
        date: '2026.02.15',
        category: 'Blog',
        title: '最近のこと。',
        image: 'https://placehold.jp/400x300.png?text=Blog+Image',
        link: 'https://sakurazaka46.com/s/s46/diary/blog/list?ima=0000&ct=56'
    },
    {
        id: 2,
        date: '2026.02.10',
        category: 'Media',
        title: '「そこ曲がったら、櫻坂？」出演',
        image: 'https://placehold.jp/400x300.png?text=TV+Show',
        link: '#'
    },
    {
        id: 3,
        date: '2026.02.01',
        category: 'Event',
        title: '8th Single ミート＆グリート 完売御礼',
        image: 'https://placehold.jp/400x300.png?text=Meet&Greet',
        link: '#'
    },
    {
        id: 4,
        date: '2026.01.20',
        category: 'Magazine',
        title: '「up PLUS」3月号 ソログラビア',
        image: 'https://placehold.jp/400x300.png?text=Magazine',
        link: '#'
    },
    {
        id: 5,
        date: '2026.01.01',
        category: 'Blog',
        title: 'あけましておめでとうございます🎍',
        image: 'https://placehold.jp/400x300.png?text=New+Year',
        link: '#'
    },
    {
        id: 6,
        date: '2025.12.25',
        category: 'Message',
        title: 'メリークリスマス🎄',
        image: 'https://placehold.jp/400x300.png?text=Xmas',
        link: '#'
    }
];

// 共通のActivity（Blog/News）カード生成処理
function createActivityCardHTML(item) {
    return `
        <article class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <a href="${item.link}" target="_blank" class="block h-full">
                <div class="relative overflow-hidden h-48 bg-gray-100">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-3 left-3 bg-white/90 px-3 py-1 text-xs font-bold rounded shadow-sm text-sakura-dark tracking-wider">${item.category}</span>
                </div>
                <div class="p-5">
                    <time class="text-xs text-gray-400 font-mono block mb-3">${item.date}</time>
                    <h4 class="text-base font-bold text-soft-black leading-snug group-hover:text-sakura-dark transition-colors">${item.title}</h4>
                </div>
            </a>
        </article>
    `;
}

// プレビュー表示（最新3件）
function renderActivityPreview() {
    const listContainer = document.getElementById('journal-grid-preview');
    if (!listContainer) return;

    // 最新のニュースから3件を表示
    const previewData = activityData.slice(0, 3);
    const html = previewData.map(item => createActivityCardHTML(item)).join('');
    listContainer.innerHTML = html;
}

// 全件表示
function renderActivityFull() {
    const listContainer = document.getElementById('journal-grid-full');
    if (!listContainer) return;

    const html = activityData.map(item => createActivityCardHTML(item)).join('');
    listContainer.innerHTML = html;
}

/* =========================================
   History Data Rendering
   ========================================= */
const historyData = [
    { date: "2002.12.19", title: "三重県にて誕生", description: "" },
    { date: "2018.08.20", title: "坂道合同新規メンバー募集オーディション 合格", description: "高校1年生の夏、「坂道合同新規メンバー募集オーディション」に合格。" },
    { date: "2020.02.16", title: "欅坂46への配属発表", description: "SHOWROOM配信にて、坂道研修生から欅坂46（櫻坂46の前身）の新2期生として配属されることが発表される。" },
    { date: "2022.09.18", title: "『そこ曲がったら、櫻坂？』にて「幸阪茉里乃DEATHゲーム」放送", description: "冠番組の企画にて、ドSキャラである「マリノ様」が初登場。MCやメンバーへの鋭いツッコミと独特のワードセンスを発揮し、バラエティにおける新たな一面を見せる。" },
    { date: "2023.11.26", title: "『そこ曲がったら、櫻坂？』にて「帰ってきた！幸阪茉里乃DEATHゲームシーズン2」放送", description: "好評につき第2弾が放送。番組内に欠かせないキャラクターとしての立ち位置を確立する。" },
    { date: "2023.12.07", title: "『秘密のケンミンSHOW極』初出演", description: "三重県代表として「みそ焼きうどん」を紹介。" },
    { date: "2024.06.06", title: "『サクラミーツ』ゲスト出演", description: "テレビ朝日系番組『サクラミーツ』にゲスト出演。サルゴリラとのコントに挑戦し、堂々とした演技を披露する。" },
    { date: "2025.07.03", title: "『秘密のケンミンSHOW極 夏の2時間SP』出演", description: "2度目の出演を果たす。" },
    { date: "2025.09.11", title: "『サクラミーツフェス』ゲスト出演", description: "EX THEATER ROPPONGIで開催されたリアルイベントにゲスト出演。" },
    { date: "2025.11.20", title: "『秘密のケンミンSHOW極』出演", description: "3度目の出演を果たす。" },
];

// 共通のHistory要素生成処理
function createHistoryItemHTML(item) {
    return `
        <div class="relative">
            <span class="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full bg-white border-4 border-sakura-dark"></span>
            <span class="text-sm text-sakura-dark font-bold block mb-1">${item.date}</span>
            <h4 class="text-lg font-bold text-soft-black mb-2">${item.title}</h4>
            ${item.description ? `<p class="text-gray-600 text-sm leading-6">${item.description}</p>` : ''}
        </div>
    `;
}

// トップページ用のプレビュー表示（最古の3件）
function renderHistoryPreview() {
    const listContainer = document.getElementById('history-list-preview');
    if (!listContainer) return;

    // 最古の3件のみ表示
    const previewData = historyData.slice(0, 3);
    const html = previewData.map((item, index) => createHistoryItemHTML(item, index)).join('');
    listContainer.innerHTML = html;

    // アニメーションの再初期化
    initScrollObserver();
}
// 全件表示（古い順・時系列）
function renderHistoryFull() {
    const listContainer = document.getElementById('history-list-full');
    if (!listContainer) return;

    const html = historyData.map(item => createHistoryItemHTML(item)).join('');
    listContainer.innerHTML = html;
}

/* =========================================
   Our Activities Data Rendering
   ========================================= */
const activitiesData = [
    { date: "202X.0X.0X", title: "応援団体「まりのたいむず」結成", description: "Twitter（X）を中心に活動を開始。" },
    { date: "202X.0X.0X", title: "〇〇ツアーにて初のフラワースタンド贈花", description: "ファン有志から協賛を募り、会場へフラワースタンドをお贈りしました。" },
    { date: "202X.12.19", title: "幸阪茉里乃さん生誕祭メッセージ企画", description: "皆様から集めたお祝いメッセージをアルバムにまとめ、運営を通じてお届けしました。" }
];

function createActivityItemHTML(item) {
    return `
        <div class="relative">
            <span class="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full bg-white border-4 border-pearl-dark"></span>
            <span class="text-sm text-teal-700 font-bold block mb-1">${item.date}</span>
            <h4 class="text-lg font-bold text-soft-black mb-2">${item.title}</h4>
            ${item.description ? `<p class="text-gray-600 text-sm leading-6">${item.description}</p>` : ''}
        </div>
    `;
}

// トップページプレビュー用（古い3件）
function renderActivitiesPreview() {
    const listContainer = document.getElementById('activities-timeline-preview');
    if (!listContainer) return;

    const previewData = activitiesData.slice(0, 3);
    const html = previewData.map(item => createActivityItemHTML(item)).join('');
    listContainer.innerHTML = html;
}

// 全件表示用（Our Activities ページ）
function renderActivitiesFull() {
    const listContainer = document.getElementById('activities-timeline');
    if (!listContainer) return;

    const html = activitiesData.map(item => createActivityItemHTML(item)).join('');
    listContainer.innerHTML = html;
}

/* =========================================
   Gallery Data Rendering
   ========================================= */
const galleryData = [
    { title: "なぜ 恋をして来なかったんだろう？ (1st Single)", hasMV: true, youtubeId: "UYx_WxKD8ko" },
    { title: "思ったよりも寂しくない (2nd Single)", hasMV: true, youtubeId: "ifq7qT6DQf0" },
    { title: "無言の宇宙 (3rd Single)", hasMV: true, youtubeId: "7GZGTse6dUs" },
    { title: "僕のジレンマ (4th Single)", hasMV: true, youtubeId: "ZBk4V-uqcXs" },
    { title: "車間距離 (4th Single)", hasMV: true, youtubeId: "MKXSWXlSOB0" },
    { title: "Cool (5th Single)", hasMV: true, youtubeId: "XEKPn3WbksE" },
    { title: "Start over! (6th Single)", hasMV: true, youtubeId: "YJRFD1AdaUE" },
    { title: "ドローン旋回中 (6th Single)", hasMV: true, youtubeId: "rNwzfyr07SM" },
    { title: "隙間風よ (7th Single)", hasMV: true, youtubeId: "5Z4emyH-fME" },
    { title: "油を注せ！ (8th Single)", hasMV: true, youtubeId: "01PkQtmidfs" },
    { title: "愛し合いなさい (9th Single)", hasMV: true, youtubeId: "MAP3cnAexxM" }
];

// カードHTMLを生成する共通関数
function createGalleryCardHTML(item) {
    return `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sakura-pink transition-colors group flex flex-col h-full">
            <h4 class="text-sm font-bold text-soft-brown group-hover:text-sakura-dark transition-colors leading-relaxed mb-4">${item.title}</h4>
            ${item.hasMV && item.youtubeId ? `
            <div class="mt-auto w-full overflow-hidden rounded-xl bg-gray-100" style="aspect-ratio: 16/9;">
                <iframe class="w-full h-full" src="https://www.youtube.com/embed/${item.youtubeId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            ` : ''}
        </div>
    `;
}

// トップページ用のプレビュー表示（最新3件）
function renderGalleryPreview() {
    const listContainer = document.getElementById('gallery-preview-list');
    if (!listContainer) return;

    // 後ろから3件（最新）を取得して反転させて表示するか、そのまま先頭3件にするか。リストに従い、後ろから新しいと仮定して末尾3件を取得して逆順にするなど調整可能。
    // 今回は配列の末尾3件（最新）を抽出して降順で表示する。
    const previewData = galleryData.slice(-3).reverse();
    const html = previewData.map(item => createGalleryCardHTML(item)).join('');
    listContainer.innerHTML = html;
}

// Galleryページ用の全件表示
function renderGallery() {
    const listContainer = document.getElementById('gallery-full-list');
    if (!listContainer) return;

    // 最新のもの（末尾）から表示
    const fullData = [...galleryData].reverse();
    const html = fullData.map(item => createGalleryCardHTML(item)).join('');
    listContainer.innerHTML = html;
}
