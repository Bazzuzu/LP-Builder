# System Taxonomy

```yaml
METACLASS: DERIVED_OVERVIEW (NOT AN OBJECT)
DOCUMENT_ID: MAP-02-TAXONOMY
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS, OBJ-11-DYNAMIC-SECTION-BASE
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, UI_DESIGNER]
```

Производный документ. Канонические ключи, регионы и слоты — `SYS-02 §1`. Правила живут в файлах
секций; здесь только сводка, чтобы сравнить всё на одном экране.

---

## 1. Секции

Тринадцать ключей `COMPONENT_KEYS`. Реестр `src/sections/_registry.js` падает при загрузке, если
набор зарегистрированных модулей не совпадает с этим списком ровно.

| Секция | `component_key` | Слоты | Источник контента | Мульти-инстанс | Статус |
|---|---|---|---|---|---|
| Hero | `SECTION_HERO` | `00` | Page-specific | Нет (ровно 1) | `BUILT` |
| Prices | `SECTION_PRICES` | `02` | Page-specific | Нет (ровно 1) | `BUILT` |
| Trust | `SECTION_TRUST` | `04` | Global site-wide | Нет (ровно 1) | `BUILT` |
| Footer | `SECTION_FOOTER` | `06` | Global site-wide | Нет (ровно 1) | `BUILT` |
| Subscription | `SECTION_SUBSCRIPTION` | `01`,`03`,`05` | Global site-wide | Max 1 на страницу | `BUILT` |
| Contact Us | `SECTION_CONTACT` | `01`,`03`,`05` | Global site-wide | Max 1 на страницу | `BUILT` |
| Story & Specs | `SECTION_QUICK_FACTS` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| Multi-Card Grid | `SECTION_MULTI_CARD_GRID` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| Large Image Banner | `SECTION_LARGE_IMAGE_BANNER` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| Text & Media | `SECTION_TEXT_MEDIA` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| Logo Marquee | `SECTION_LOGO_MARQUEE` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| Feature | `SECTION_FEATURE` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |
| FAQ | `SECTION_FAQ` | `01`,`03`,`05` | Page-specific | Да (0..N) | `BUILT` |

**Архетипы** (`SYS-00 §2`, поле `archetype` модуля): Fixed Anchor — Hero, Prices. Dual-Role Anchor
— Trust, Footer (позиция локальна, данные глобальны). Static Module — Subscription, Contact.
Dynamic Module — остальные **семь**.

**Слоты и кратность выводятся, а не объявляются посекционно**: `permittedSlots(key, archetype)`
и `maxInstances(archetype)` в `src/model/enums.js`. Ни один модуль не перечисляет свои слоты сам.

**Story & Specs** — отображаемое имя секции 36; ключ `SECTION_QUICK_FACTS` не менялся.

### 1.1 Группы в каталоге «Add a section»

Навигационная группировка в ящике вставки (`LIBRARY_GROUPS`). На слоты, кратность и валидацию не
влияет.

| Группа | Заголовок в UI | Секции | Статус |
|---|---|---|---|
| `content` | Content sections | Story & Specs, Multi-Card Grid, Large Image Banner, Text & Media, FAQ | `BUILT` |
| `intermediate` | Intermediate & supporting | Logo Marquee, Feature | `BUILT` |
| `global` | Global static blocks | Subscription, Contact Us | `BUILT` |

Якоря в каталоге не показываются: `insertableTypes()` отдаёт только `dynamic` и `static`. Статический
модуль, уже стоящий на странице, показывается **отключённой** карточкой с причиной, а не исчезает.

---

## 2. Параметры и селекторы вариантов

| Секция | Параметр | Значения | Что меняет | Статус |
|---|---|---|---|---|
| Hero | `title_preset` | `S` \| `M` \| `L` | Размер заголовка | `BUILT` |
| Hero | `eyebrow_mode` | `None` \| `Text` \| `Timer` \| `Logo` \| `Badge` | Микро-контент над заголовком | `BUILT` |
| Hero | `on_expiry` | `HideEyebrow` \| `ShowExpiredLabel` \| `FreezeAtZero` | Поведение таймера после дедлайна | `BUILT` |
| Hero | `theme_mode` | `Light` \| `Dark` | Логотип, бейджи, цвет текста, дефолт фона | `BUILT` |
| Prices | `media_layout_type` | `1 Image` \| `2 Images` | Sticky-колонка | `BUILT` |
| Prices | `region_tabs_enabled` | `bool` | Вкладки регионов (нужно ≥2 нерегиональных `Global` значения) | `BUILT` |
| Trust | `layout_mode` | `Extended` \| `Compact` | Плотность вёрстки | `BUILT` |
| Story & Specs | `media_side` | `Left` \| `Right` | — параметра больше нет: layout фиксирован | `PLANNED` |
| Multi-Card Grid | `card_count` | `2` \| `3` \| `4` | Число активных карточек | `BUILT` |
| Text & Media | `media_mode` | `No Photo` \| `1 Photo` \| `2 Photos` | Медиа-колонка | `BUILT` |
| Text & Media | `media_side` | `Left` \| `Right` | Сторона медиа-колонки | `BUILT` |
| Feature | `_preset` | `S` \| `M` \| `L` | Пишет `icon_size`, `item_count`, `has_paragraph`, `heading_size` | `BUILT` |
| Feature | `item_count` | `3` \| `4` | Число элементов; контрол скрыт при `icon_size === 64` (пресет `L` фиксирован на 3) | `BUILT` |
| Feature | `icon_size`, `has_paragraph` | — | Отдельных контролов нет: только следствия пресета | `BUILT` |
| Logo Marquee | `speed` | `10..90` с | Секунд на полный цикл тикера | `BUILT` |
| FAQ | `columns` | `1` \| `2` | Число колонок | `BUILT` |
| FAQ | `start_open` | `bool` | Раскрыты ли ответы при загрузке | `BUILT` |

**Story & Specs `media_side`.** v1 описывал флип медиа-колонки; в коде его нет — секция сама
объявляет себя «Fixed layout, no media-side flip», и `media_side` объявляет только Text & Media.
Колонка-флип не является общим атрибутом базового класса и никогда им не была.

**Пресеты Feature** — не отдельные компоненты, а одно из трёх согласованных сочетаний:
`S` = 48/3/без параграфа/`SIZE_S`, `M` = 48/3/с параграфом/`SIZE_M`, `L` = 64/3/с
параграфом/`SIZE_L`. Кнопка пресета подсвечена только когда **все** её ключи уже совпадают.

---

## 3. Универсальные контролы динамической секции

Полный контракт — `11_ABSTRACT §4`. Здесь сводка отказов: единственный санкционированный способ
секции отказаться от части общего блока.

| Флаг фабрики | Что убирает | Кто берёт | Статус |
|---|---|---|---|
| `sub: false` (`headingFields`) | Поле `subheading` целиком | Story & Specs, Text & Media | `BUILT` |
| `scale: false` (`headingFields`) | **Пару** `heading_size` + `heading_align` | Story & Specs | `BUILT` |
| `toggle: false` (`ctaFields` / `ctaGroup`) | Переключатель `cta.on`; кнопка становится безусловной | Large Image Banner | `BUILT` |
| `open: true` (`mediaGroup`) | Ничего не убирает — открывает группу «Media» сразу | Text & Media, Large Image Banner | `BUILT` |

`scale: false` снимает обе кнопки сразу: убрать размер и оставить выравнивание нельзя, и такой
секции пока нет. Значение при этом никуда не девается — оно приходит из `defaults` секции и
по-прежнему доходит до рендера, просто перестаёт быть выбором автора.

**Порядок групп панели** — всегда `Content` → (своя группа повторяющегося контента) → `Media` →
`Appearance` → `Advanced`. Группа, все поля которой скрыты условием `when`, не рисуется вовсе. — `BUILT`

---

## 4. CTA

| Форма | Хранение | Кто использует | Статус |
|---|---|---|---|
| `cta: { on, label, href }` | вложенный объект в `props` | Text & Media (с тумблером, внутри `Content`), Large Image Banner (без тумблера, своя группа `Button`) | `BUILT` |
| `cta_label` / `cta_url` / `show_cta_button` | — | Плоская тройка из v1 в коде отсутствует; документ или пресет, пишущий эти ключи, даёт секцию без кнопки | `PLANNED` |

`#lead-modal` (`LEAD_ANCHOR`) — единственный «магический» href системы: рантайм перехватывает его и
открывает `21_OBJECT_FLIGHT_QUOTE_MODAL`. Всё остальное — обычная ссылка; `https?://` дополнительно
получает `target="_blank" rel="noopener noreferrer"`.

---

## 5. Общее правило смены параметра

Миграция без потерь (`11_ABSTRACT §5.5–5.8`):

| Механизм | Поведение | Статус |
|---|---|---|
| Репитер с `fixed: '<prop>'` | Рендерит первые *n*, остальные **сохраняет** в документе; инспектор пишет «N more items kept for the larger layout» | `BUILT` |
| Виджет `preset` с `applies` | Пишет только объявленные ключи; контентных полей не касается | `BUILT` |
| Поле, скрытое условием `when` | Не рисуется и не пишется; сохранённое значение остаётся нетронутым | `BUILT` |
| `defaults` | Внедряются ровно один раз, при вставке; ничто их позже не переприменяет | `BUILT` |
