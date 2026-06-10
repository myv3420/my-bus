// キャッシュ名（ダイヤ改正時はここのバージョンを上げると全端末で強制更新される）
const CACHE_NAME = 'bus-timetable-v2';

// キャッシュするファイル
const FILES = [
    './',
    './index.html'
];

// インストール時：ファイルをキャッシュに保存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
    );
    self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// アクセス時：ネット優先、失敗したらキャッシュを返す
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 成功したら最新版をキャッシュに上書き保存
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                // オフライン時はキャッシュから返す
                return caches.match(event.request);
            })
    );
});