# Object Map

Каноническая топология — `SYSTEM RULES/00_SYSTEM_ARCHITECTURE_AND_SLOTS.md`.
Этот файл — её визуальное представление и не вводит собственных правил.

```
[Landing Page Container]  (20_OBJECT_LANDING_PAGE)
   │
   ├── [Slot 00: FIXED ANCHOR] ──> [Hero Section]            page-specific, ровно 1
   │
   ├── [Slot 01: DYNAMIC CONTAINER] ──> [0..N Dynamic / Static Module Instances]
   │
   ├── [Slot 02: FIXED ANCHOR] ──> [Prices Section] ── 1:N ──> [Price Row Item]
   │
   ├── [Slot 03: DYNAMIC CONTAINER] ──> [0..N Dynamic / Static Module Instances]
   │
   ├── [Slot 04: DUAL-ROLE ANCHOR] ──> [Trust Section]       global data, page-level layout
   │
   ├── [Slot 05: DYNAMIC CONTAINER] ──> [0..N Dynamic / Static Module Instances]
   │
   └── [Slot 06: DUAL-ROLE ANCHOR] ──> [Footer Section]      site-wide, read-only на странице

Содержимое любого динамического контейнера (01 / 03 / 05):
   ├── [Quick Facts]            0..N   ── 2..4 fact cards
   ├── [Multi-Card Grid]        0..N   ── 1:N ──> [Media Card Item]  (2 | 3 | 4)
   ├── [Large Image Banner]     0..N
   ├── [Text & Media]           0..N   ── media_mode: 0 | 1 | 2 фото
   ├── [Logo Marquee]           0..N   ── 1:N ──> [Logo Item]
   ├── [Feature Section]        0..N   ── 1:N ──> [Feature Item]  (3 варианта)
   ├── [Static Subscription]    max 1 на страницу   (global content)
   └── [Static Contact]         max 1 на страницу   (global content)

Вне дерева секций:
   └── [Flight Quote Modal] (21) — один оверлей на страницу, вызывается строкой цены
                                    или любой CTA с href `#lead-modal`
```

**Позиция секции** = `slot_index` + `order_in_slot` (`SYS-02-ENUMS §3`).
Якорям принадлежит по одному слоту, поэтому их взаимный порядок обеспечен структурно.
