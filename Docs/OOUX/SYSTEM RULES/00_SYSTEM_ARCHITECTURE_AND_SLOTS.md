# `00_SYSTEM_ARCHITECTURE_AND_SLOTS.md`

```yaml
METACLASS: SYSTEM_SPECIFICATION (NOT AN OBJECT)
DOCUMENT_ID: SYS-00-ARCH
VERSION: 2.1.0
STATUS: APPROVED
DEPENDS_ON: SYS-02-ENUMS (canonical keys, regions, slot model, validation levels)
TARGET_AUDIENCE: [LLM_AGENT, BACKEND_DEV, FRONTEND_DEV, ARCHITECT]
```

---

## 1. STRUCTURAL TOPOLOGY & SLOT ENGINE

The landing page layout is governed by a **Deterministic Linear Slot Tree**. The document object model (DOM) sequence is composed of **Fixed Anchor Slots** (immutable ordering) and **Interleaved Dynamic Slots** (variable ordering, 0..N multiplicity).

```
PAGE_VIEWPORT_CANVAS
│
├── [SLOT_INDEX: 00] [TYPE: FIXED_ANCHOR] ──────── HeroSection (Above-The-Fold)
│
├── [SLOT_INDEX: 01] [TYPE: DYNAMIC_CONTAINER] ─── DynamicSlotInstanceArray_A [0..N]
│
├── [SLOT_INDEX: 02] [TYPE: FIXED_ANCHOR] ──────── PricesSection
│
├── [SLOT_INDEX: 03] [TYPE: DYNAMIC_CONTAINER] ─── DynamicSlotInstanceArray_B [0..N]
│
├── [SLOT_INDEX: 04] [TYPE: FIXED_ANCHOR] ──────── TrustSection (Site-wide Data)
│
├── [SLOT_INDEX: 05] [TYPE: DYNAMIC_CONTAINER] ─── DynamicSlotInstanceArray_C [0..N]
│
└── [SLOT_INDEX: 06] [TYPE: FIXED_ANCHOR] ──────── FooterSection (Site-wide Shared)
```

---

## 2. COMPONENT TAXONOMY & CLASSIFICATION MATRIX

Every visual component belongs to exactly one structural archetype:

| Classification | Structural Behavior | Data Source Scope | Instance Multiplicity | Permitted Slots |
| :--- | :--- | :--- | :--- | :--- |
| **Fixed Anchor** | Position locked, undeletable | Page-level (Unique) | Exactly 1 per page | Slots `00`, `02` |
| **Dual-Role Anchor** | Position locked, undeletable | **Site-wide Global** | Exactly 1 per page | Slots `04`, `06` |
| **Static Module** | Reorderable in dynamic slots | **Site-wide Global** | Max 1 per page | Slots `01`, `03`, `05` |
| **Dynamic Module** | Reorderable, full mutation | Page-level (Unique) | **Unbounded (0..N)** | Slots `01`, `03`, `05` |

### 2.1 Taxonomy Definition
* **Fixed Anchor:** Non-removable core modules that define the essential transaction funnel (`Hero`, `Prices`).
* **Dual-Role Anchor:** Structurally locked like anchors, but consume data from global singleton stores rather than page-level storage (`TrustSection`, `FooterSection`). Local page config is strictly restricted to layout modes/toggles.
* **Static Module:** Reusable global modules (`SubscriptionSection`, `ContactSection`). Can be inserted into any dynamic slot, but only **one instance** of each may exist per page.
* **Dynamic Module:** Content and layout blocks that can be added multiple times (`Multi-instance`), modified, and arranged arbitrarily between anchors.

---

## 3. SLOT ALLOCATION & REORDERING ENGINE

### 3.1 Positional Model (`slot_index` + `order_in_slot`)

Position is expressed by **two** integers, defined canonically in `SYS-02-ENUMS §3`. A single
flat page-wide `order_index` is **deprecated**: with anchors pinned to 0/2/4/6 it could not
express more than one dynamic section between two anchors.

| Field | Anchors | Dynamic & Static modules |
| :--- | :--- | :--- |
| `slot_index` | Immutable: `00`, `02`, `04`, `06` | Mutable across `01`, `03`, `05` |
| `order_in_slot` | Always `0` (an anchor slot holds exactly one section) | `0..n-1` within its slot |

**Render order:** sort by `slot_index`, then `order_in_slot`.

1. **Anchor Immutability Invariant:**
   Because anchor `slot_index` values are immutable constants, the ordering
   `Hero(00) < Prices(02) < Trust(04) < Footer(06)` holds structurally. No arithmetic is needed
   to preserve it, and no reorder operation can violate it.

2. **Dynamic Slot Movement:**
   * Dynamic and static modules reside in dynamic container slots (`01`, `03`, `05`).
   * **Reorder within a slot:** swap `order_in_slot` with the adjacent sibling.
   * **Move across an anchor:** set `slot_index` to the neighbouring dynamic slot and seat the
     section at the **end of the boundary it just crossed**, so the move reads as one step
     rather than a jump over the whole slot:
     * moving **up** -> `order_in_slot = len(target slot)` (lands last, directly above the anchor);
     * moving **down** -> `order_in_slot = 0` (lands first, directly below the anchor).
     Sibling indices are re-packed to stay dense.
   * A move is rejected (`E008`) if the target slot is not permitted for the section's
     archetype (see `SYS-02-ENUMS §1`).

3. **Insertion:** a new section is appended to the chosen slot with
   `order_in_slot = len(slot)`. **Duplication:** the clone is inserted directly beneath its
   source (`order_in_slot = source.order_in_slot + 1`), siblings shift down.

### 3.2 Multi-Instance Handling
* Any dynamic module (e.g., `OBJECT_SECTION_TEXT_MEDIA`) can be instantiated $N$ times on a single page.
* Each instance receives a unique immutable `instance_id` (UUIDv4).
* States, media uploads, and visual overrides are strictly isolated per `instance_id`.

---

## 4. PRESET & TEMPLATE INJECTION PIPELINE

When a user initiates an `INSERT_SECTION` action:

```
[User Trigger: Insert Section]
         │
         ▼
[Read component_key]
         │
         ├── IF (StaticModule) ──> Check uniqueness on current page ──> [Inject Singleton Ref]
         │
         └── IF (DynamicModule) ─> [Generate new instance_id]
                                          │
                                          ▼
                                   [Fetch System Defaults Schema]
                                          │
                                          ▼
                                   [Inject Predefined Content & Assets]
                                   * Priority: FeatureSections populate default
                                     badges/copy immediately.
```

---

## 5. PAGE INTEGRITY INVARIANTS (VALIDATION ENGINE)

Validation is layered — see `SYS-02-ENUMS §4` for the level definitions and the full error code
registry. This section specifies **L0 (structural)** only. `L1` content completeness is owned by
each section document; `L2` field formats are enforced per field on save.

A `Draft` must remain savable even when L1 is unsatisfied. The gate below runs on the
`Draft -> Published` transition.

```typescript
function validatePageStructure(page: LandingPage): ValidationResult {
  // 1. Mandatory anchors present (keys per SYS-02-ENUMS §1)
  assert(page.hasComponent('SECTION_HERO'),   "E001: Missing mandatory HeroSection");
  assert(page.hasComponent('SECTION_PRICES'), "E002: Missing mandatory PricesSection");
  assert(page.hasComponent('SECTION_TRUST'),  "E003: Missing mandatory TrustSection");
  assert(page.hasComponent('SECTION_FOOTER'), "E004: Missing mandatory FooterSection");

  // 2. Anchors occupy their immutable slots
  assert(
    page.slotOf('SECTION_HERO')   === 0 &&
    page.slotOf('SECTION_PRICES') === 2 &&
    page.slotOf('SECTION_TRUST')  === 4 &&
    page.slotOf('SECTION_FOOTER') === 6,
    "E005: Fixed Anchor slot violation"
  );

  // 3. Static module uniqueness
  assert(page.countInstances('SECTION_SUBSCRIPTION') <= 1, "E006: Duplicate Subscription section");
  assert(page.countInstances('SECTION_CONTACT') <= 1,      "E007: Duplicate Contact section");

  // 4. Every section sits in a slot its archetype permits
  for (const s of page.sections) {
    assert(permittedSlots(s.component_key).includes(s.slot_index),
      `E008: ${s.component_key} is not permitted in slot ${s.slot_index}`);
  }

  return { isValid: true };
}
```

**Publishing requires all three levels to pass** (`SYS-02-ENUMS §4`): `validatePageStructure`
(L0), every visible section's content check (L1), and field formats (L2 — normally already
clean, since invalid values are rejected per field on save). Sections with
`is_visible === false` are skipped by L1.
