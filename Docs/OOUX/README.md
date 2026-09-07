# OOUX-модель конструктора лендингов

## Как читать эти документы

1. **Эта документация самодостаточна.** Она описывает целевую систему и читается в отрыве от
   текущего кода. Сверка с реализацией — в одном месте, `BACKLOG.md`; внутри объектных
   документов ссылок на код нет.
2. **`SYSTEM RULES/02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md` — источник истины** для
   `component_key`, регионов, модели слотов, уровней валидации и глобальных констант.
   Если другой файл повторяет одно из этих значений — там копия, приоритет у SYS-02.
3. Дальше — от общего к частному: системные правила → абстрактные классы → корневые объекты →
   секции → дочерние объекты.
4. `01` и `02` в корне — **производные** обзоры. Правил в них нет, только навигация.
5. Секционные документы содержат **только своё**. Общий жизненный цикл и общие стилевые
   атрибуты описаны один раз в базовых классах `10` и `11` и оттуда не копируются.
6. Почему что-то устроено именно так и чем это было раньше — в `CHANGELOG.md`. В спеках
   истории нет.
7. Что осознанно не смоделировано — в `BACKLOG.md`.

## Статусы документов

| Статус | Значение |
|---|---|
| `APPROVED` | Непротиворечиво, открытых вопросов нет — можно реализовывать |
| `DRAFT` | Внутри остались открытые вопросы, они помечены в тексте |

## Структура

```
├── README.md                                   # этот файл
├── CHANGELOG.md                                # история решений и обоснования правок
├── BACKLOG.md                                  # несмоделированное + расхождения с реализацией
├── 01-object-map.md                            # карта объектов (производная)
├── 02-system-taxonomy.md                       # секции + параметры вариантов (производная)
│
├── [ СИСТЕМНЫЕ ПРАВИЛА (НЕ ОБЪЕКТЫ) ]
│   ├── 00_SYSTEM_ARCHITECTURE_AND_SLOTS.md     # топология, slot_index + order_in_slot, L0-валидация
│   ├── 01_SYSTEM_GLOBAL_DESIGN_TOKENS.md       # фоны (3 пресета), типографика (S/M/L)
│   ├── 02_SYSTEM_CANONICAL_ENUMS_AND_VALIDATION.md  # ★ реестры, уровни валидации, коды ошибок
│   └── 99_SYSTEM_LEAD_GENERATION_WORKFLOW.md   # триггеры лидов, CRM-payload, атрибуция
│
├── [ АБСТРАКТНЫЕ КЛАССЫ ]
│   ├── 10_ABSTRACT_OBJECT_PAGE_SECTION.md      # базовая секция: слот, порядок, anchor_id, alt-контракт
│   └── 11_ABSTRACT_OBJECT_DYNAMIC_SECTION.md   # динамическая база: фон, заголовок, миграция вариантов
│
├── [ КОРНЕВЫЕ ОБЪЕКТЫ ]
│   ├── 20_OBJECT_LANDING_PAGE.md               # страница: SEO, GEO, URL, статус, слоты
│   └── 21_OBJECT_FLIGHT_QUOTE_MODAL.md         # ★ модалка лид-формы (контракт полей + payload)
│
├── [ ОБЪЕКТЫ СЕКЦИЙ ]
│   ├── 30_OBJECT_SECTION_HERO.md               # Hero (slot 00)
│   ├── 31_OBJECT_SECTION_PRICES.md             # Prices (slot 02)
│   ├── 32_OBJECT_SECTION_TRUST.md              # Trust (slot 04, dual-role)
│   ├── 33_OBJECT_SECTION_FOOTER.md             # Footer (slot 06, dual-role)
│   ├── 34_OBJECT_SECTION_STATIC_SUBSCRIPTION.md# Subscription (static module, max 1)
│   ├── 35_OBJECT_SECTION_STATIC_CONTACT.md     # Contact Us (static module, max 1)
│   ├── 36_OBJECT_SECTION_QUICK_FACTS.md        # Quick Facts (2–4 карты, 3 фото)
│   ├── 37_OBJECT_SECTION_MULTI_CARD_GRID.md    # Multi-Card Grid (2/3/4)
│   ├── 38_OBJECT_SECTION_LARGE_IMAGE_BANNER.md # Large Image Banner
│   ├── 39_OBJECT_SECTION_TEXT_MEDIA.md         # Text & Media (0/1/2 фото)
│   ├── 40_OBJECT_SECTION_LOGO_MARQUEE.md       # Logo Marquee
│   └── 41_OBJECT_SECTION_FEATURE.md            # Feature (icon_size / item_count / has_paragraph)
│
└── [ ДОЧЕРНИЕ ОБЪЕКТЫ ]
    ├── 50_OBJECT_PRICE_ROW_ITEM.md             # строка таблицы цен (для 31)
    ├── 51_OBJECT_MEDIA_CARD_ITEM.md            # карточка сетки (для 37)
    └── 52_OBJECT_FEATURE_ITEM.md               # элемент преимуществ (для 41)
```

★ — реестр и модалка добавлены в ревизии 2, см. `CHANGELOG.md`.
