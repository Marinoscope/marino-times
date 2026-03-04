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

    // Our Journal (News/Blog) — microCMS から非同期取得
    initJournal();

    // 記事詳細ページ（article.html）
    if (document.getElementById('article-content')) initArticle();

    // Schedule - Google Sheets から同期
    initSchedule();

    // Marino's Log (History)
    if (document.getElementById('history-list-preview')) renderHistoryPreview();
    if (document.getElementById('history-list-full')) renderHistoryFull();

    // Fan Projects / Group Activities Timeline (Our Activities)
    if (document.getElementById('activities-timeline-preview')) renderActivitiesPreview();
    if (document.getElementById('activities-timeline')) renderActivitiesFull();

    // Gallery (Music Videos & Others)
    if (document.getElementById('gallery-preview-list')) renderGalleryPreview();
    if (document.getElementById('gallery-mv-grid')) initGallery();
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
   microCMS 設定
   ========================================= */
const MICROCMS_API_KEY = 'hHa79ATpW9X7o6WxiZhw7AVquSgs1Niw0uYi';  // TODO: ここにmicroCMSのAPIキーを入力してください
const MICROCMS_ENDPOINT = 'https://marino-times.microcms.io/api/v1/journal';  // TODO: ここにエンドポイントURLを入力してください

/* =========================================
   Our Journal (News/Blog) Data & Rendering
   ========================================= */

// フォールバック用データ（microCMS取得失敗時に使用）
const fallbackJournalData = [
    {
        id: '1',
        date: '2026.02.15',
        category: 'Blog',
        title: '最近のこと。',
        image: 'https://placehold.jp/400x300.png?text=Blog+Image',
        link: 'https://sakurazaka46.com/s/s46/diary/blog/list?ima=0000&ct=56'
    },
    {
        id: '2',
        date: '2026.02.10',
        category: 'Media',
        title: '「そこ曲がったら、櫻坂？」出演',
        image: 'https://placehold.jp/400x300.png?text=TV+Show',
        link: '#'
    },
    {
        id: '3',
        date: '2026.02.01',
        category: 'Event',
        title: '8th Single ミート＆グリート 完売御礼',
        image: 'https://placehold.jp/400x300.png?text=Meet&Greet',
        link: '#'
    },
    {
        id: '4',
        date: '2026.01.20',
        category: 'Magazine',
        title: '「up PLUS」3月号 ソログラビア',
        image: 'https://placehold.jp/400x300.png?text=Magazine',
        link: '#'
    },
    {
        id: '5',
        date: '2026.01.01',
        category: 'Blog',
        title: 'あけましておめでとうございます🎍',
        image: 'https://placehold.jp/400x300.png?text=New+Year',
        link: '#'
    },
    {
        id: '6',
        date: '2025.12.25',
        category: 'Message',
        title: 'メリークリスマス🎄',
        image: 'https://placehold.jp/400x300.png?text=Xmas',
        link: '#'
    }
];

// microCMS から記事データを取得する関数
async function fetchJournalData(limit) {
    // APIキーが未設定の場合はフォールバックを返す
    if (!MICROCMS_API_KEY || MICROCMS_API_KEY === 'YOUR_API_KEY' ||
        !MICROCMS_ENDPOINT || MICROCMS_ENDPOINT.includes('YOUR_SERVICE')) {
        console.warn('[Journal] microCMS APIキーまたはエンドポイントが未設定のため、フォールバックデータを使用します。');
        return null;
    }

    try {
        let url = MICROCMS_ENDPOINT;
        const params = [];
        if (limit) params.push(`limit=${limit}`);
        params.push('orders=-publishedAt'); // 新しい順
        url += '?' + params.join('&');

        const response = await fetch(url, {
            headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`microCMS API Error: ${response.status}`);
        }

        const data = await response.json();

        // microCMS のレスポンスを内部形式に変換
        return data.contents.map(item => ({
            id: item.id,
            date: formatDate(item.publishedAt),
            category: item.category || '',
            title: item.title || '',
            image: item.thumbnail ? item.thumbnail.url : 'https://placehold.jp/400x300.png?text=No+Image',
            link: item.link || '#',
            body: item.body || ''
        }));
    } catch (error) {
        console.warn('[Journal] microCMSからの取得に失敗しました。フォールバックデータを使用します。', error);
        return null;
    }
}

// microCMS の publishedAt (ISO 8601) を "YYYY.MM.DD" 形式に変換
function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
}

// Journal 全体の初期化（fetch → render）
async function initJournal() {
    const previewContainer = document.getElementById('journal-grid-preview');
    const fullContainer = document.getElementById('journal-grid-full');

    // ローディング表示
    if (previewContainer) {
        previewContainer.innerHTML = '<p class="text-sm text-gray-400 col-span-full text-center py-8">読み込み中...</p>';
    }
    if (fullContainer) {
        fullContainer.innerHTML = '<p class="text-sm text-gray-400 col-span-full text-center py-8">読み込み中...</p>';
    }

    // プレビュー（トップページ 最新3件）
    if (previewContainer) {
        const data = await fetchJournalData(3);
        const items = data || fallbackJournalData.slice(0, 3);
        previewContainer.innerHTML = items.map(item => createJournalCardHTML(item)).join('');
    }

    // 全件表示（journal.html）+ カテゴリフィルター
    if (fullContainer) {
        const data = await fetchJournalData();
        const allItems = data || fallbackJournalData;

        // カテゴリフィルターボタンを生成
        const filterBar = document.getElementById('journal-filter-bar');
        if (filterBar && allItems.length > 0) {
            const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];

            // 「すべて」ボタン＋各カテゴリボタン
            const filterButtons = ['すべて', ...categories];
            filterBar.innerHTML = filterButtons.map(cat => `
                <button class="journal-filter-btn px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-200 border
                    ${cat === 'すべて'
                    ? 'bg-soft-brown text-white border-soft-brown'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-sakura-dark hover:text-sakura-dark'
                }"
                    data-category="${cat}">
                    ${cat}
                </button>
            `).join('');

            // フィルターボタンのクリックイベント
            filterBar.querySelectorAll('.journal-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selected = btn.dataset.category;

                    // ボタンのアクティブ状態を切り替え
                    filterBar.querySelectorAll('.journal-filter-btn').forEach(b => {
                        b.className = b.className
                            .replace('bg-soft-brown text-white border-soft-brown', '')
                            .replace('bg-white text-gray-500 border-gray-200', '')
                            + (b.dataset.category === selected
                                ? ' bg-soft-brown text-white border-soft-brown'
                                : ' bg-white text-gray-500 border-gray-200');
                    });

                    // カードをフィルタリングして再描画
                    const filtered = selected === 'すべて'
                        ? allItems
                        : allItems.filter(item => item.category === selected);
                    fullContainer.innerHTML = filtered.map(item => createJournalCardHTML(item)).join('');
                });
            });
        }

        // 初期表示（全件）
        fullContainer.innerHTML = allItems.map(item => createJournalCardHTML(item)).join('');
    }
}

// カードHTMLを生成する共通関数
function createJournalCardHTML(item) {
    // リンク先の決定:
    // 1. microCMS記事でlinkあり・bodyなし → 外部URLへ直接飛ばす
    // 2. microCMS記事でbodyあり → article.htmlで本文表示（linkがあれば詳細ページ内にボタン表示）
    // 3. フォールバック → 外部linkへ
    const isMicroCMS = item.id && MICROCMS_API_KEY !== 'YOUR_API_KEY';
    let href, target;
    if (isMicroCMS && item.link && item.link !== '#' && !item.body) {
        // 本文なし＋リンクあり → 外部URLへ直接
        href = item.link;
        target = '_blank';
    } else if (isMicroCMS) {
        // 本文あり or リンクなし → 記事詳細ページへ
        href = `article.html?id=${item.id}`;
        target = '_self';
    } else {
        // フォールバック
        href = item.link || '#';
        target = '_blank';
    }
    return `
        <article class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            <a href="${href}" target="${target}" class="block h-full">
                <div class="relative overflow-hidden h-48 bg-gray-100">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    ${item.category ? `<span class="absolute top-3 left-3 bg-white/90 px-3 py-1 text-xs font-bold rounded shadow-sm text-sakura-dark tracking-wider">${item.category}</span>` : ''}
                </div>
                <div class="p-5">
                    <time class="text-xs text-gray-400 font-mono block mb-3">${item.date}</time>
                    <h4 class="text-base font-bold text-soft-black leading-snug group-hover:text-sakura-dark transition-colors">${item.title}</h4>
                </div>
            </a>
        </article>
    `;
}

// 記事詳細ページの初期化（article.html用）
async function initArticle() {
    const container = document.getElementById('article-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    if (!articleId) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-16">記事が見つかりませんでした。</p>';
        return;
    }

    try {
        const response = await fetch(`${MICROCMS_ENDPOINT}/${articleId}`, {
            headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY }
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const article = await response.json();
        document.title = `${article.title} - まりのたいむず`;

        container.innerHTML = `
            ${article.thumbnail ? `
            <div class="w-full overflow-hidden rounded-2xl mb-8 bg-gray-100">
                <img src="${article.thumbnail.url}" alt="${article.title}" class="w-full h-auto object-cover">
            </div>` : ''}

            <div class="mb-8">
                <div class="flex items-center gap-3 mb-4">
                    ${article.category ? `<span class="bg-sakura-pink px-3 py-1 text-xs font-bold rounded-full text-sakura-dark tracking-wider">${article.category}</span>` : ''}
                    <time class="text-xs text-gray-400 font-mono">${formatDate(article.publishedAt)}</time>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-soft-brown leading-relaxed">${article.title}</h1>
            </div>

            <div class="article-body text-gray-700 text-sm md:text-base">
                ${article.body || '<p class="text-gray-400">本文はありません。</p>'}
            </div>

            <div class="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                ${(article.link && article.link !== '#') ? `
                <a href="${article.link}" target="_blank"
                    class="inline-block bg-soft-brown text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-amber-800 transition-all duration-300 transform hover:-translate-y-1 text-sm">
                    関連ページを開く
                </a>` : ''}
                <a href="journal.html"
                    class="inline-block bg-sakura-dark text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-pink-400 transition-all duration-300 transform hover:-translate-y-1 text-sm">
                    記事一覧に戻る
                </a>
            </div>
        `;
    } catch (error) {
        console.error('[Article] 記事の取得に失敗しました:', error);
        container.innerHTML = `
            <div class="text-center py-16">
                <p class="text-gray-400 text-sm mb-4">記事の読み込みに失敗しました。</p>
                <a href="journal.html" class="text-sakura-dark text-sm font-bold hover:underline">&larr; 記事一覧に戻る</a>
            </div>
        `;
    }
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
    { date: "2024.07.07", title: "応援団体「まりのたいむず」結成", description: "幸阪茉里乃さんに関する情報を発信するアカウントとして「まりのたいむず」を発足。<br>X（旧Twitter）を中心に活動を開始。<br>活動コンセプトは「幸阪茉里乃さんを全力応援！」" },
    { date: "2024.08.27", title: "#marinotalk 購読キャンペーン", description: "#marinotalk 購読キャンペーンを実施。" },
    { date: "2024.10.07", title: "生誕広告企画 支援者募集", description: "幸阪茉里乃生誕祭2024生誕広告企画の支援者を募集開始。" },
    { date: "2024.12.16", title: "幸阪茉里乃生誕祭2024生誕駅広告", description: "皆様からの支援を受け、六本木駅に駅広告を掲出いたしました！<br>イラストはすーる様にご依頼しました！<br>※「MARINO301」様と共催。" },
    { date: "2024.12.16", title: "「幸阪茉里乃トレンドワード大賞2024」実施", description: "#幸阪茉里乃生誕祭2024 & 年末企画として、彼女の一年を彩るトレンドワードを大募集！<br>後日ランキング形式で発表しました！" },
    { date: "2025.10.14", title: "生誕広告企画 支援者募集", description: "幸阪茉里乃生誕祭2025生誕広告企画の支援者を募集開始。" },
    { date: "2025.12.17", title: "幸阪茉里乃生誕祭2025生誕駅広告", description: "皆様からの支援を受け、市ヶ谷駅に駅広告を掲出いたしました！<br>イラストはすーる様、温守♨️様、もちゃ様にご依頼しました！" },
    { date: "2026.03.XX", title: "公式サイト設立", description: "本ウェブサイトの設立。<br>より多彩な応援ができるよう、「まりのたいむず公式サイト」兼「幸阪茉里乃さん非公式ファンサイト」として、本ウェブサイトを設立しました！" }
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
   Schedule Data Rendering
   ========================================= */

// スケジュール用 Google Sheets CSV URL
const SHEET_SCHEDULE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTF_mZSMjo9gB3lHeruGf2jpVfKxMcnVA3TrVNo8Z3RZOJA7cQG9Ilfq5cH8YCSdp31SD5REAM342_d/pub?gid=309169578&single=true&output=csv';

// 取得した全スケジュールデータを保持する配列
let allScheduleData = [];

// スケジュールの状態管理
let currentScheduleCategory = 'all';
let showPastSchedules = false;

// フォールバック用データ（CSV取得失敗時）
const fallbackScheduleData = [
    { date: "2026.12.19", time: "", category: "Birthday", title: "幸阪茉里乃 生誕祭 2026", link: "" },
    { date: "2026.03.15", time: "", category: "Meet & Greet", title: "9th Single ミート＆グリート受付開始", link: "" },
    { date: "2026.02.25", time: "22:00", category: "Media", title: "雑誌「blt graph.」掲載", link: "" }
];

// カテゴリ別カラー定義
const SCHEDULE_CATEGORY_COLORS = {
    'Birthday': 'bg-sakura-pink text-sakura-dark',
    'Meet & Greet': 'bg-pearl-green text-teal-600',
    'Media': 'bg-blue-100 text-blue-600',
    'Live / Event': 'bg-purple-100 text-purple-600',
    'Release': 'bg-indigo-100 text-indigo-600',
    'default': 'bg-gray-100 text-gray-600'
};

// スケジュールHTMLの1行分を生成
function createScheduleItemHTML(item) {
    const colorClass = SCHEDULE_CATEGORY_COLORS[item.category] || SCHEDULE_CATEGORY_COLORS['default'];
    // 時間のフォントも日付と同じ font-mono に統一
    const timeDisplay = item.time ? `<span class="text-xs text-gray-400 font-mono ml-2 block md:inline">${item.time}</span>` : '';

    // リンクの有無でタグを出し分け
    const content = `
        <span class="text-sm text-gray-400 font-mono w-32 shrink-0">${item.formattedDate || item.date}${timeDisplay}</span>
        <span class="${colorClass} text-xs px-2 py-1 rounded w-fit h-fit shrink-0 tracking-wider">${item.category}</span>
        <p class="text-sm md:text-base font-medium flex-grow group-hover:text-sakura-dark transition-colors">${item.title}</p>
    `;

    if (item.link) {
        return `
            <li class="border-b border-gray-100 pb-4 last:border-0 last:pb-0 group">
                <a href="${item.link}" target="_blank" class="flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center">
                    ${content}
                    <span class="text-gray-300 group-hover:text-sakura-dark transition-colors">&rarr;</span>
                </a>
            </li>
        `;
    } else {
        return `
            <li class="flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                ${content}
            </li>
        `;
    }
}

// スケジュール全体の初期化
async function initSchedule() {
    const previewContainer = document.getElementById('schedule-preview-list');
    const fullContainer = document.getElementById('schedule-full-list');

    try {
        let fetchUrl = SHEET_SCHEDULE_CSV_URL;
        if (window.location.protocol === 'file:') {
            fetchUrl = 'https://corsproxy.io/?' + encodeURIComponent(SHEET_SCHEDULE_CSV_URL);
        }

        const response = await fetch(fetchUrl, { redirect: 'follow' });
        if (!response.ok) throw new Error("Failed to fetch Schedule CSV data.");

        const text = await response.text();
        if (text.trim().startsWith('<')) throw new Error("Received HTML instead of CSV.");

        const rows = text.split('\n').filter(row => row.trim() !== '');
        const parsedData = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = parseCSVRow(rows[i]);
            if (cols.length >= 4) { // 最低4列(date, time, category, title)
                const dateStr = cols[0] || '';
                // JSTの現在日時と比較するためのDateオブジェクトを作成 (2026.03.15 -> 2026-03-15T23:59:59+09:00のように丸1日は残す)
                let dateObj = null;
                if (dateStr.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
                    const [y, m, d] = dateStr.split('.');
                    // その日の23:59:59を基準にする（当日中は「未来/現在」として表示するため）
                    dateObj = new Date(`${y}-${m}-${d}T23:59:59+09:00`);
                }

                parsedData.push({
                    dateTimestamp: dateObj ? dateObj.getTime() : 0, // ソート・フィルタリング用
                    formattedDate: dateStr, // 表示用
                    time: cols[1] || '',
                    category: cols[2] || 'Other',
                    title: cols[3] || '',
                    link: cols[4] || ''
                });
            }
        }

        allScheduleData = parsedData.length > 0 ? parsedData : fallbackScheduleData.map(item => ({ ...item, formattedDate: item.date, dateTimestamp: new Date(item.date.replace(/\./g, '-') + 'T23:59:59+09:00').getTime() }));
    } catch (error) {
        console.warn("Could not load schedule from Google Sheets, using fallback.", error);
        allScheduleData = fallbackScheduleData.map(item => ({ ...item, formattedDate: item.date, dateTimestamp: new Date(item.date.replace(/\./g, '-') + 'T23:59:59+09:00').getTime() }));
    }

    // JSTの現在時刻を取得
    const nowJST = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    const nowTimestamp = new Date(nowJST).getTime();

    // 未来の予定（今日含む）と過去の予定に分ける
    const futureSchedules = allScheduleData.filter(item => item.dateTimestamp >= nowTimestamp);
    // 過去の予定は降順（新しい順）にしておく
    const pastSchedules = allScheduleData.filter(item => item.dateTimestamp < nowTimestamp).sort((a, b) => b.dateTimestamp - a.dateTimestamp);

    // プレビュー（トップページ）：未来の予定の直近5件（日付が近い順＝昇順）
    if (previewContainer) {
        // 未来の予定を昇順（近い日が上）にソート
        const previewData = [...futureSchedules].sort((a, b) => a.dateTimestamp - b.dateTimestamp).slice(0, 5);

        if (previewData.length > 0) {
            previewContainer.innerHTML = previewData.map(item => createScheduleItemHTML(item)).join('');
        } else {
            previewContainer.innerHTML = '<p class="text-sm text-gray-400 text-center py-8">現在、予定されているスケジュールはありません。</p>';
        }
    }

    // 全件表示（schedule.html）
    if (fullContainer) {
        renderScheduleFullList();
        setupScheduleFilters();
        setupPastScheduleToggle();
    }
}

// schedule.htmlのリスト描画
function renderScheduleFullList() {
    const listContainer = document.getElementById('schedule-full-list');
    if (!listContainer) return;

    // JSTの現在時刻を取得
    const nowJST = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    const nowTimestamp = new Date(nowJST).getTime();

    // 未来と過去に分ける
    const futureSchedules = allScheduleData.filter(item => item.dateTimestamp >= nowTimestamp).sort((a, b) => a.dateTimestamp - b.dateTimestamp);
    const pastSchedules = allScheduleData.filter(item => item.dateTimestamp < nowTimestamp).sort((a, b) => b.dateTimestamp - a.dateTimestamp);

    // カテゴリで絞り込み
    const filterFn = item => currentScheduleCategory === 'all' || item.category === currentScheduleCategory;

    let displayHtml = '';

    // 未来スケジュールの表示
    const filteredFuture = futureSchedules.filter(filterFn);
    if (filteredFuture.length > 0) {
        displayHtml += filteredFuture.map(item => createScheduleItemHTML(item)).join('');
    } else if (!showPastSchedules) {
        displayHtml += '<p class="text-sm text-gray-400 text-center py-8">現在、予定されているスケジュールはありません。</p>';
    }

    // 過去スケジュールの表示
    if (showPastSchedules) {
        const filteredPast = pastSchedules.filter(filterFn);
        if (filteredPast.length > 0) {
            // 区切り線を追加
            if (filteredFuture.length > 0) {
                displayHtml += `
                    <li class="py-6 flex items-center justify-center">
                        <div class="h-px bg-gray-200 flex-grow"></div>
                        <span class="px-4 text-xs font-bold text-gray-400 tracking-widest uppercase">Past Schedules</span>
                        <div class="h-px bg-gray-200 flex-grow"></div>
                    </li>
                `;
            } else {
                displayHtml += '<p class="text-sm text-gray-400 font-bold tracking-widest uppercase mb-4 mt-2">Past Schedules</p>';
            }
            displayHtml += filteredPast.map(item => createScheduleItemHTML(item)).join('');
        }
    }

    listContainer.innerHTML = displayHtml;
}

// schedule.htmlのフィルタリングボタンの設定
function setupScheduleFilters() {
    const filterBar = document.getElementById('schedule-filter-bar');
    if (!filterBar) return;

    // 全データからユニークなカテゴリを抽出
    const categories = new Set();
    allScheduleData.forEach(item => {
        if (item.category) categories.add(item.category);
    });

    // カテゴリをソートして配列化
    const categoriesArray = Array.from(categories).sort();

    // フィルタボタンの生成
    const baseBtnClasses = "px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 border flex-shrink-0";
    const activeBtnClasses = "bg-soft-brown text-white border-soft-brown shadow-md";
    const inactiveBtnClasses = "bg-white text-gray-500 border-gray-200 hover:border-sakura-pink hover:text-sakura-dark";

    let html = `
        <button class="filter-btn-schedule ${baseBtnClasses} ${currentScheduleCategory === 'all' ? activeBtnClasses : inactiveBtnClasses}" data-category="all">
            すべて
        </button>
    `;

    categoriesArray.forEach(cat => {
        const isActive = currentScheduleCategory === cat;
        html += `
            <button class="filter-btn-schedule ${baseBtnClasses} ${isActive ? activeBtnClasses : inactiveBtnClasses}" data-category="${cat}">
                ${cat}
            </button>
        `;
    });

    filterBar.innerHTML = html;

    // クリックイベントの追加
    const buttons = filterBar.querySelectorAll('.filter-btn-schedule');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentScheduleCategory = btn.getAttribute('data-category');
            // ボタンの見た目更新
            buttons.forEach(b => {
                b.className = `filter-btn-schedule ${baseBtnClasses} ${b.getAttribute('data-category') === currentScheduleCategory ? activeBtnClasses : inactiveBtnClasses}`;
            });
            // リストの再描画
            renderScheduleFullList();
        });
    });
}

// 過去のスケジュール表示切り替えボタンの設定
function setupPastScheduleToggle() {
    const toggleBtn = document.getElementById('toggle-past-schedule-btn');
    if (!toggleBtn) return;

    const indicator = document.getElementById('past-schedule-indicator');
    const textNode = document.getElementById('past-schedule-text');

    toggleBtn.addEventListener('click', () => {
        showPastSchedules = !showPastSchedules;

        // UI更新
        if (showPastSchedules) {
            indicator.classList.remove('bg-gray-300');
            indicator.classList.add('bg-sakura-dark');
            toggleBtn.classList.remove('border-gray-200', 'text-gray-400');
            toggleBtn.classList.add('border-sakura-pink', 'text-soft-brown');
            if (textNode) textNode.textContent = "過去の予定を隠す";
        } else {
            indicator.classList.add('bg-gray-300');
            indicator.classList.remove('bg-sakura-dark');
            toggleBtn.classList.add('border-gray-200', 'text-gray-400');
            toggleBtn.classList.remove('border-sakura-pink', 'text-soft-brown');
            if (textNode) textNode.textContent = "過去の予定を表示";
        }

        renderScheduleFullList();
    });
}

/* =========================================
   Gallery Data Rendering
   ========================================= */

// Google Sheets CSV URL (ユーザーが後で公開URLに差し替える)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTF_mZSMjo9gB3lHeruGf2jpVfKxMcnVA3TrVNo8Z3RZOJA7cQG9Ilfq5cH8YCSdp31SD5REAM342_d/pub?gid=59471726&single=true&output=csv'; // TODO: ここに公開したCSVのURLを貼り付けてください

// 取得した全動画データを保持する配列
let allGalleryData = [];

// フォールバック用データ（CSV取得失敗時）
const fallbackGalleryData = [
    { title: "なぜ 恋をして来なかったんだろう？", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=S4gEJIyLHlM", publishDate: "2020-11-18", note: "1st single" },
    { title: "思ったよりも寂しくない", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=D0W44Z3D3wo", publishDate: "2021-03-31", note: "2nd single" },
    { title: "無言の宇宙", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=7GZGTse6dUs", publishDate: "2021-09-28", note: "3rd single" },
    { title: "僕のジレンマ", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=ZBk4V-uqcXs", publishDate: "2022-03-24", note: "4th single" },
    { title: "車間距離", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=MKXSWXlSOB0", publishDate: "2022-03-29", note: "4th single" },
    { title: "Cool", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=XEKPn3WbksE", publishDate: "2023-02-07", note: "5th single" },
    { title: "Start over!", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=YJRFD1AdaUE", publishDate: "2023-05-30", note: "6th single" },
    { title: "ドローン旋回中", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=rNwzfyr07SM", publishDate: "2023-06-21", note: "6th single" },
    { title: "隙間風よ", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=5Z4emyH-fME", publishDate: "2023-10-10", note: "7th single" },
    { title: "油を注せ！", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=x9a0_2aGeWU", publishDate: "2024-02-06", note: "8th single" },
    { title: "愛し合いなさい", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=MAP3cnAexxM", publishDate: "2024-06-12", note: "9th single" },
    { title: "僕は僕を好きになれない", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=Ktu_LGjGd7A", publishDate: "2024-10-09", note: "10th single" },
    { title: "Nothing Special", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=WdUBD5slEnc", publishDate: "2025-02-12", note: "11th single" },
    { title: "港区パセリ", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=aLu4oyQ2zdw", publishDate: "2025-06-11", note: "12th single" },
    { title: "木枯らしは泣かない", category: "single", youtubeUrl: "https://www.youtube.com/watch?v=aQ1iXj4oXfI", publishDate: "2025-10-15", note: "13th single" },
    { title: "Addiction", category: "album", youtubeUrl: "https://www.youtube.com/watch?v=ReuFa_D1Vok", publishDate: "2022-07-26", note: "2nd album" },
    { title: "ドライフルーツ", category: "single", youtubeUrl: "", publishDate: "2026-03-01", note: "14th single" }, // 公開日仮
    { title: "【いのまり】幸阪の愛爆発！井上と花やしきデート！", category: "others", youtubeUrl: "https://www.youtube.com/watch?v=GDYuXZBT_ic", publishDate: "2024-08-13", note: "" },
    { title: "【ドッキリ】田村保乃を1日中驚かせてみた！by幸阪茉里乃", category: "others", youtubeUrl: "https://www.youtube.com/watch?v=6aa7Cwg19pk", publishDate: "2024-03-13", note: "" },
    { title: "【あすけん】目指せ100点！櫻坂46の自炊の腕前を初披露！【料理】", category: "others", youtubeUrl: "https://www.youtube.com/watch?v=ObloX5HXUpk", publishDate: "2025-11-18", note: "" },
    { title: "【#二期生ずっと一緒】13人全員で一軒家貸し切りBBQ＆プレゼント交換会！", category: "others", youtubeUrl: "https://www.youtube.com/watch?v=QhxUwwhB-b0", publishDate: "2025-12-16", note: "" },
    { title: "櫻坂46『2nd TOUR 2022 “As you know?”』（for J-LODlive）", category: "live", youtubeUrl: "https://www.youtube.com/watch?v=uxC0v1902dE", publishDate: "2022-11-30", note: "" },
    { title: "櫻坂46『1st TOUR 2021』（for J-LODlive）", category: "live", youtubeUrl: "https://www.youtube.com/watch?v=P8jb-ENfWB4", publishDate: "2021-12-24", note: "" },
    { title: "欅坂46 『誰がその鐘を鳴らすのか？』 KEYAKIZAKA46 Live Online", category: "live", youtubeUrl: "https://www.youtube.com/watch?v=fOL3JDWG7aQ", publishDate: "2020-08-29", note: "" }
];

// 現在の状態
let currentGalleryFilter = 'all'; // 全体の絞り込み: 'all', 'single', 'album', 'live', 'others'
let currentGallerySort = 'desc'; // 全体の並び替え: 'desc'(新しい順), 'asc'(古い順)

// YouTube URLから Video ID を抽出するUtility
function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
    return match ? match[1] : null;
}

// CSVの行をパースする簡単な実装 (カンマ区切り、ダブルクォーテーション対応)
function parseCSVRow(row) {
    const result = [];
    let insideQuotes = false;
    let currentValue = '';
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    result.push(currentValue.trim().replace(/^"|"$/g, ''));
    return result;
}

// カードHTMLを生成する共通関数
function createGalleryCardHTML(item) {
    const youtubeId = item.youtubeId || extractYouTubeId(item.youtubeUrl);

    // ラベルにはE列の補足情報（1st Singleなど）を表示する
    const categoryLabel = item.note ? item.note : '';

    return `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sakura-pink transition-colors group flex flex-col h-full">
            <h4 class="text-sm font-bold text-soft-brown group-hover:text-sakura-dark transition-colors leading-relaxed mb-2">${item.title}</h4>
            <div class="text-xs text-gray-400 font-mono mb-4 flex items-center gap-1.5 min-h-[20px]">
                ${categoryLabel ? `<span class="inline-flex items-center justify-center bg-gray-100 px-2 py-0.5 rounded-full text-[10px] tracking-wider text-gray-500 uppercase">${categoryLabel}</span>` : ''}
            </div>
            ${youtubeId ? `
            <div class="mt-auto w-full overflow-hidden rounded-xl bg-gray-100" style="aspect-ratio: 16/9;">
                <iframe class="w-full h-full" src="https://www.youtube.com/embed/${youtubeId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
            ` : `
            <div class="mt-auto w-full flex items-center justify-center rounded-xl bg-gray-100/80 border border-gray-100" style="aspect-ratio: 16/9;">
                <span class="text-sm font-bold text-gray-400 tracking-widest">準備中</span>
            </div>
            `}
        </div>
    `;
}

// トップページ用のプレビュー表示（ランダムに3件抽出）
function renderGalleryPreview() {
    const listContainer = document.getElementById('gallery-preview-list');
    if (!listContainer) return;

    // 現在の最新の全データ(fetch後ならallGalleryData, 前ならfallbackGalleryData)を使用
    const dataToUse = allGalleryData.length > 0 ? allGalleryData : fallbackGalleryData;

    // UUID等の厳密性を持たせずに配列をシャッフルして3件取得
    const shuffled = [...dataToUse].sort(() => 0.5 - Math.random());
    const previewData = shuffled.slice(0, 3);

    const html = previewData.map(item => createGalleryCardHTML(item)).join('');
    listContainer.innerHTML = html;
}

// Galleryページ：初期化＆データフェッチ
async function initGallery() {
    try {
        // ローカル環境(file://)からのアクセスの場合のみCORSが発生するためプロキシを通し、
        // 本番環境(http/https)では直接Google Sheetsから取得する（不要なプロキシ起因のエラーを防ぐため）
        let fetchUrl = SHEET_CSV_URL;
        if (window.location.protocol === 'file:') {
            fetchUrl = 'https://corsproxy.io/?' + encodeURIComponent(SHEET_CSV_URL);
        }

        // Google Sheetsの公開URLはリダイレクトが発生するため、redirect: 'follow' を明示する
        // 取得したテキストの最初の文字が `<` ならエラーとみなす
        const response = await fetch(fetchUrl, { redirect: 'follow' });
        if (!response.ok) throw new Error("Failed to fetch CSV data.");

        const text = await response.text();
        if (text.trim().startsWith('<')) {
            throw new Error("Received HTML instead of CSV. Redirection might have failed or URL might be wrong.");
        }

        const rows = text.split('\n').filter(row => row.trim() !== '');

        const parsedData = [];
        // 1行目はヘッダーとみなし、2行目から処理
        for (let i = 1; i < rows.length; i++) {
            const cols = parseCSVRow(rows[i]);
            // A列:タイトル, B列:カテゴリ, C列:URL, D列:公開日, E列:補足
            if (cols.length >= 4) {
                parsedData.push({
                    title: cols[0],
                    category: cols[1].toLowerCase(),
                    youtubeUrl: cols[2],
                    publishDate: cols[3],
                    note: cols[4] || ''
                });
            }
        }

        allGalleryData = parsedData.length > 0 ? parsedData : fallbackGalleryData;
    } catch (error) {
        console.warn("Could not load from Google Sheets, using fallback data.", error);
        allGalleryData = fallbackGalleryData;
    }

    renderAllGalleryGrids();
}

// 共通ソート機能を使用してすべてのグリッドを再描画
function renderAllGalleryGrids() {
    // 選択されたフィルタに応じて、大セクションの表示・非表示を切り替え
    const sectionMv = document.getElementById('section-mv');
    const sectionLive = document.getElementById('section-live');
    const sectionOthers = document.getElementById('section-others');

    if (sectionMv) sectionMv.style.display = (currentGalleryFilter === 'all' || currentGalleryFilter === 'single' || currentGalleryFilter === 'album') ? 'block' : 'none';
    if (sectionLive) sectionLive.style.display = (currentGalleryFilter === 'all' || currentGalleryFilter === 'live') ? 'block' : 'none';
    if (sectionOthers) sectionOthers.style.display = (currentGalleryFilter === 'all' || currentGalleryFilter === 'others') ? 'block' : 'none';

    // 1. MV グリッド (Single / Album フィルタ適用)
    const mvContainer = document.getElementById('gallery-mv-grid');
    if (mvContainer) {
        let mvData = allGalleryData.filter(item => item.category === 'single' || item.category === 'album');
        if (currentGalleryFilter === 'single' || currentGalleryFilter === 'album') {
            mvData = mvData.filter(item => item.category === currentGalleryFilter);
        }
        mvData.sort((a, b) => currentGallerySort === 'asc' ? new Date(a.publishDate) - new Date(b.publishDate) : new Date(b.publishDate) - new Date(a.publishDate));

        if (mvData.length === 0) {
            mvContainer.innerHTML = '<p class="text-sm text-gray-400 col-span-full text-center py-8">該当する動画はありません</p>';
        } else {
            mvContainer.innerHTML = mvData.map(item => createGalleryCardHTML(item)).join('');
        }
    }

    // 2. Live Movies グリッド
    const liveContainer = document.getElementById('gallery-live-grid');
    if (liveContainer) {
        let liveData = allGalleryData.filter(item => item.category === 'live');
        liveData.sort((a, b) => currentGallerySort === 'asc' ? new Date(a.publishDate) - new Date(b.publishDate) : new Date(b.publishDate) - new Date(a.publishDate));

        if (liveData.length === 0) {
            liveContainer.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-400 text-sm">準備中です</p><p class="text-gray-300 text-xs mt-2">動画が追加され次第、こちらに表示されます</p></div>';
        } else {
            liveContainer.innerHTML = liveData.map(item => createGalleryCardHTML(item)).join('');
        }
    }

    // 3. Others グリッド
    const othersContainer = document.getElementById('gallery-others-grid');
    if (othersContainer) {
        let othersData = allGalleryData.filter(item => item.category === 'others');
        othersData.sort((a, b) => currentGallerySort === 'asc' ? new Date(a.publishDate) - new Date(b.publishDate) : new Date(b.publishDate) - new Date(a.publishDate));

        if (othersData.length === 0) {
            othersContainer.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-400 text-sm">準備中です</p><p class="text-gray-300 text-xs mt-2">動画が追加され次第、こちらに表示されます</p></div>';
        } else {
            othersContainer.innerHTML = othersData.map(item => createGalleryCardHTML(item)).join('');
        }
    }
}

// ギャラリー全体 絞り込み
function filterGallery(category) {
    currentGalleryFilter = category;
    renderAllGalleryGrids();
    updateFilterButtons(category);
}

// ギャラリー全体 並び替え
function sortGallery(direction) {
    currentGallerySort = direction;
    renderAllGalleryGrids();
    updateSortButtons(direction);
}

// 絞り込みボタンのアクティブ状態切り替え
function updateFilterButtons(activeCategory) {
    const buttons = {
        'all': document.getElementById('filter-all'),
        'single': document.getElementById('filter-single'),
        'album': document.getElementById('filter-album'),
        'live': document.getElementById('filter-live'),
        'others': document.getElementById('filter-others')
    };
    const activeClass = 'gallery-filter-btn px-4 py-2 text-xs font-bold rounded-full border-2 border-soft-brown bg-soft-brown text-white transition-all hover:shadow-md';
    const inactiveClass = 'gallery-filter-btn px-4 py-2 text-xs font-bold rounded-full border-2 border-soft-brown text-soft-brown bg-white transition-all hover:shadow-md';

    Object.entries(buttons).forEach(([key, btn]) => {
        if (btn) btn.className = key === activeCategory ? activeClass : inactiveClass;
    });
}

// 並び替えボタンのアクティブ状態切り替え
function updateSortButtons(direction) {
    const btnNew = document.getElementById('sort-new');
    const btnOld = document.getElementById('sort-old');
    const activeClass = 'gallery-sort-btn px-4 py-2 text-xs font-bold rounded-full border-2 border-sakura-dark bg-sakura-dark text-white transition-all hover:shadow-md';
    const inactiveClass = 'gallery-sort-btn px-4 py-2 text-xs font-bold rounded-full border-2 border-sakura-dark text-sakura-dark bg-white transition-all hover:shadow-md';

    if (btnNew) btnNew.className = direction === 'desc' ? activeClass : inactiveClass;
    if (btnOld) btnOld.className = direction === 'asc' ? activeClass : inactiveClass;
}
