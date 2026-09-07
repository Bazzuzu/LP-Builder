# System Taxonomy

Производный документ. Канонические ключи, регионы и слоты — `SYS-02-ENUMS`.
Правила живут в файлах секций; здесь только сводка для сравнения на одном экране.

## 1. Секции

| Секция | `component_key` | Слоты | Источник контента | Мульти-инстанс |
|---|---|---|---|---|
| Hero | `SECTION_HERO` | `00` | Page-specific | Нет (ровно 1) |
| Prices | `SECTION_PRICES` | `02` | Page-specific | Нет (ровно 1) |
| Trust | `SECTION_TRUST` | `04` | Global site-wide | Нет (ровно 1) |
| Footer | `SECTION_FOOTER` | `06` | Global site-wide | Нет (ровно 1) |
| Subscription | `SECTION_SUBSCRIPTION` | `01`,`03`,`05` | Global site-wide | Max 1 на страницу |
| Contact Us | `SECTION_CONTACT` | `01`,`03`,`05` | Global site-wide | Max 1 на страницу |
| Quick Facts | `SECTION_QUICK_FACTS` | `01`,`03`,`05` | Page-specific | Да (0..N) |
| Multi-Card Grid | `SECTION_MULTI_CARD_GRID` | `01`,`03`,`05` | Page-specific | Да (0..N) |
| Large Image Banner | `SECTION_LARGE_IMAGE_BANNER` | `01`,`03`,`05` | Page-specific | Да (0..N) |
| Text & Media | `SECTION_TEXT_MEDIA` | `01`,`03`,`05` | Page-specific | Да (0..N) |
| Logo Marquee | `SECTION_LOGO_MARQUEE` | `01`,`03`,`05` | Page-specific | Да (0..N) |
| Feature | `SECTION_FEATURE` | `01`,`03`,`05` | Page-specific | Да (0..N) |

**Архетипы** (`SYS-00-ARCH §2`): Fixed Anchor — Hero, Prices. Dual-Role Anchor — Trust, Footer
(позиция локальна, данные глобальны). Static Module — Subscription, Contact. Dynamic Module —
остальные шесть.

## 2. Параметры и селекторы вариантов

| Секция | Параметр | Значения | Что меняет |
|---|---|---|---|
| Hero | `eyebrow_mode` | `None` \| `Text` \| `Timer` \| `Logo` \| `Badge` | Микро-контент над заголовком |
| Prices | `media_layout_type` | `1 Image` \| `2 Images` | Sticky-колонка |
| Prices | `region_tabs_enabled` | `bool` | Вкладки регионов (нужно ≥2 нерегиональных `Global` значения) |
| Trust | `layout_mode` | `Extended` \| `Compact` | Плотность вёрстки |
| Quick Facts | `media_side` | `Left` \| `Right` | Сторона медиа-сетки |
| Multi-Card Grid | `card_count` | `2` \| `3` \| `4` | Число активных карточек |
| Text & Media | `media_mode` | `No Photo` \| `1 Photo` \| `2 Photos` | Медиа-колонка |
| Text & Media | `media_side` | `Left` \| `Right` | Сторона медиа-колонки |
| Feature | `icon_size` | `48` \| `64` | Размер иконки |
| Feature | `item_count` | `3` \| `4` | Число элементов |
| Feature | `has_paragraph` | `bool` | Наличие параграфа (`false` = буллеты) |

**Именованные пресеты Feature** — сокращение для комбинаций трёх параметров, не отдельные
компоненты: `Highlighted` = 64/3/true, `Standard` = 48/3–4/true, `Compact` = 48/3–4/false
(`41 §4.3`).

**Общее правило смены параметра** (`11_ABSTRACT §6.2`): миграция без потерь — поля неактивной
конфигурации сохраняются в документе секции, пресетом добираются только пустые.
