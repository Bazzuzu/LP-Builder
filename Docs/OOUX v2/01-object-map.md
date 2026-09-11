# Object Map

```yaml
METACLASS: DERIVED_OVERVIEW (NOT AN OBJECT)
DOCUMENT_ID: MAP-01-OBJECT-MAP
VERSION: 2.0.0
STATUS: APPROVED
DEPENDS_ON: SYS-00-ARCH, SYS-02-ENUMS
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

Производный документ. Каноническая топология — `SYSTEM RULES/00_SYSTEM_ARCHITECTURE_AND_SLOTS.md`,
канонический список ключей — `SYS-02 §1`. Здесь только карта; собственных правил нет.

---

## 1. Дерево

```
[Landing Page Container]  (20_OBJECT_LANDING_PAGE)          localStorage `lpb.state.v2`
   │
   ├── [Slot 00: FIXED ANCHOR] ──> [Hero]                   page-specific, ровно 1
   │
   ├── [Slot 01: DYNAMIC CONTAINER] ──> [0..N динамических / статических модулей]
   │
   ├── [Slot 02: FIXED ANCHOR] ──> [Prices] ── 1:N ──> [Price Row Item] (50)
   │
   ├── [Slot 03: DYNAMIC CONTAINER] ──> [0..N динамических / статических модулей]
   │
   ├── [Slot 04: DUAL-ROLE ANCHOR] ──> [Trust]              global data, page-level layout
   │
   ├── [Slot 05: DYNAMIC CONTAINER] ──> [0..N динамических / статических модулей]
   │
   └── [Slot 06: DUAL-ROLE ANCHOR] ──> [Footer]             global data, read-only на странице

Содержимое любого динамического контейнера (01 / 03 / 05):
   ├── [Story & Specs]          0..N   ── 2..4 факта + 3 изображения          (36)
   ├── [Multi-Card Grid]        0..N   ── 1:N ──> [Media Card Item] (2|3|4)   (37, 51)
   ├── [Large Image Banner]     0..N   ── одно изображение + обязательная CTA (38)
   ├── [Text & Media]           0..N   ── media_mode: 0 | 1 | 2 фото          (39)
   ├── [Logo Marquee]           0..N   ── 1:N ──> [Logo Item]                 (40)
   ├── [Feature]                0..N   ── 1:N ──> [Feature Item] (3|4)        (41, 52)
   ├── [FAQ]                    0..N   ── 1:N ──> [FAQ Item] (1..20)          (42) ★
   ├── [Static Subscription]    max 1 на страницу   (global content)          (34)
   └── [Static Contact]         max 1 на страницу   (global content)          (35)

Вне дерева секций:
   └── [Flight Quote Modal] (21) — один оверлей на каждый отрендеренный документ
                                    (и в превью, и в экспорте), DOM id `lead-modal`;
                                    вызывается строкой цены или любой CTA с href `#lead-modal`

Вне страницы:
   └── [Global Content Store] — localStorage `lpb.globals.v2`: footer, contact, trust,
                                subscription. Страница читает, редактор страницы не пишет.
```

★ — `FAQ` существовал в коде и не существовал ни в одном документе v1.

---

## 2. Состав

| Объект | `component_key` | Слоты | Кратность на странице | Статус |
|---|---|---|---|---|
| Hero (30) | `SECTION_HERO` | `00` | ровно 1 | `BUILT` |
| Prices (31) | `SECTION_PRICES` | `02` | ровно 1 | `BUILT` |
| Trust (32) | `SECTION_TRUST` | `04` | ровно 1 | `BUILT` |
| Footer (33) | `SECTION_FOOTER` | `06` | ровно 1 | `BUILT` |
| Subscription (34) | `SECTION_SUBSCRIPTION` | `01`,`03`,`05` | max 1 | `BUILT` |
| Contact Us (35) | `SECTION_CONTACT` | `01`,`03`,`05` | max 1 | `BUILT` |
| Story & Specs (36) | `SECTION_QUICK_FACTS` | `01`,`03`,`05` | 0..N | `BUILT` |
| Multi-Card Grid (37) | `SECTION_MULTI_CARD_GRID` | `01`,`03`,`05` | 0..N | `BUILT` |
| Large Image Banner (38) | `SECTION_LARGE_IMAGE_BANNER` | `01`,`03`,`05` | 0..N | `BUILT` |
| Text & Media (39) | `SECTION_TEXT_MEDIA` | `01`,`03`,`05` | 0..N | `BUILT` |
| Logo Marquee (40) | `SECTION_LOGO_MARQUEE` | `01`,`03`,`05` | 0..N | `BUILT` |
| Feature (41) | `SECTION_FEATURE` | `01`,`03`,`05` | 0..N | `BUILT` |
| FAQ (42) | `SECTION_FAQ` | `01`,`03`,`05` | 0..N | `BUILT` |
| Flight Quote Modal (21) | — (не секция) | вне дерева | ровно 1 на документ | `BUILT` |

> **Отображаемое имя ≠ ключ.** В интерфейсе секция 36 называется **Story & Specs**; ключ
> `SECTION_QUICK_FACTS` не менялся — переименование ключа задевает канонический реестр, имя файла
> спеки и все уже сохранённые страницы. Правило общее: имена в этой таблице берутся из поля `name`
> модуля, ключи — из `COMPONENT_KEYS`, и совпадать они не обязаны.

---

## 3. Связи

| Связь | Механизм | Статус |
|---|---|---|
| Page 1:N Section | массив `PageDoc.sections`, порядок = `slot_index`, затем `order_in_slot` | `BUILT` |
| Section N:1 Page | секция не существует вне страницы; отдельного хранилища нет | `BUILT` |
| Prices 1:N Price Row Item | `props.rows[]` | `BUILT` |
| Multi-Card Grid 1:N Media Card Item | `props.cards[]`, активных `card_count`, остальные сохраняются | `BUILT` |
| Feature 1:N Feature Item | `props.items[]`, активных `item_count`, остальные сохраняются | `BUILT` |
| Logo Marquee 1:N Logo Item | `props.logos[]` | `BUILT` |
| FAQ 1:N FAQ Item | `props.items[]`, до 20 | `BUILT` |
| Price Row → Modal | `<button data-row-quote data-destination data-cabin>` | `BUILT` |
| CTA → Modal | делегированный клик по `a[href="#lead-modal"], [data-lead-open]` | `BUILT` |
| Page → Modal (route defaults) | модалка не читает `default_origin` / `default_destination` страницы | `DEFECT` |
| Trust / Footer / Subscription / Contact → Global Store | `GLOBAL_CONTENT_ARCHETYPES`, `ctx.globals` | `BUILT` |
| Модалка → CRM | запрос не отправляется, payload не собирается | `PLANNED` |

---

**Позиция секции** = `slot_index` + `order_in_slot` (`SYS-02 §3`). Якорям принадлежит по одному
слоту, поэтому порядок `Hero(0) < Prices(2) < Trust(4) < Footer(6)` обеспечен структурно, а не
арифметикой. Обязательность и неподвижность якоря **выводятся** из `ANCHOR_SLOT` и `archetype` —
полей `position_type` и `is_mandatory` в документе нет (`10_ABSTRACT §4.3`).
