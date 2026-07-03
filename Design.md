# Design.md — Math Rescue Kit (Mathora)

> Design system spec สำหรับ dev ต่อใน Antigravity
> แกะจากไฟล์ `Math_Rescue_Kit__offline_.html` (React + framer-motion + KaTeX)
> เก็บไฟล์นี้ไว้ที่ root หรือ `.agents/` เพื่อให้ agent อ่านเป็น context หลัก

---

## 1. Design Language

ธีมคือ **"Field Kit / กล่องเครื่องมือกู้ภัย"** สไตล์ industrial — ให้ความรู้สึกเหมือนเปิดกล่องอุปกรณ์ช่างก่อนสอบ

หลักคิดที่ต้องรักษาไว้:

- **Two-world contrast** — เปลือกนอก (shell) เป็นโทน **มืด/industrial** (พาเนลเหล็ก, หมุด rivet, แถบ hazard สีเหลือง-ดำ, ไฟสถานะ READY/LOCKED, ตัวอักษร monospace). เนื้อหาข้างใน (การ์ดความรู้) เป็นโทน **สว่าง/สะอาด** อ่านง่าย
- **Tactile / physical** — เงาลึก, ขอบเส้น, หมุดมุมการ์ด, แถบไฟเรืองแสง (glow) ทำให้รู้สึกจับต้องได้
- **Monospace = ป้ายกำกับระบบ** — label, สถานะ, หัวข้อใหญ่ใช้ Space Mono เพื่อล้อ "เครื่องมือ/เทอร์มินัล"
- หลีกเลี่ยง generic AI aesthetic — ไม่มี gradient ม่วง-ฟ้าลอยๆ, ไม่มี glassmorphism แบบ default

---

## 2. Design Tokens

### 2.1 Shell palette (โทนมืด — หน้า landing + subject modal)

```css
--black:   #131110;  /* พื้นหลังหลัก */
--panel:   #1f1c17;  /* พาเนล subject modal */
--panel2:  #272219;  /* พาเนล part modal */
--steel:   #2d2823;
--edge:    #413a30;  /* เส้นขอบทุกที่ในโซนมืด */
--amber:   #f5a524;  /* สีเน้นหลัก (accent) — ไฟสถานะ, ปุ่ม, glow */
--ink:     #ece7dd;  /* ตัวอักษรบนพื้นมืด */
--mute:    #96907f;  /* ตัวอักษรรอง/label บนพื้นมืด */
--light:   #f7f7fb;  /* พื้นเนื้อหาโทนสว่าง */
```

### 2.2 Content palette (โทนสว่าง — ภายในการ์ดความรู้)

```css
--bg:      #f7f7fb;
--card-bg: #ffffff;
--ink:     #1f2330;
--muted:   #6b7280;
```

### 2.3 Category colors (7 หมวดเนื้อหา — ใช้เป็นจุดสี dot + พื้นอ่อน)

| Token         | สี        | ความหมาย        | พื้นอ่อน section |
|---------------|-----------|-----------------|------------------|
| `--concept`   | `#2563eb` | Concept / When  | `#eff6ff`        |
| `--formula`   | `#16a34a` | Formula / How   | `#f0fdf4`        |
| `--trigger`   | `#ea580c` | Trigger         | `#fff7ed`        |
| `--mistake`   | `#dc2626` | พลาดบ่อย        | `#fef2f2`        |
| `--tip`       | `#9333ea` | Exam tip        | `#faf5ff`        |
| `--hack`      | `#ca8a04` | เทคนิคจำ        | `#fffbeb`        |
| `--checklist` | `#1f2937` | Checklist       | `#f4f4f5`        |

### 2.4 Card accent (สีหัวการ์ด — map จาก `data-accent`)

```
green  → #16a34a
blue   → #2563eb
orange → #ea580c
purple → #9333ea
```
หัวการ์ด (`.card-head`) เป็น gradient:
`linear-gradient(135deg, <accent>, color-mix(in srgb, <accent> 70%, black))`

### 2.5 Typography

```
Mono (label/heading): 'Space Mono', ui-monospace, monospace
Body (Thai/Latin):    'Sarabun', 'Noto Sans Thai', sans-serif
```
- ทุก weight ของ Noto Sans Thai (400–800) ถูก embed มาแล้วในไฟล์ต้นฉบับ
- H1 หน้าแรก: `clamp(30px, 7vw, 54px)`, uppercase, letter-spacing `.02em`
- H2 modal: `clamp(26px, 5vw, 40px)`, weight 800
- Card title: 21px / weight 800
- Label mono: 10.5–11px, letter-spacing `.14em–.22em`, uppercase

### 2.6 Radius / Shadow / Motion

```css
/* Radius */
subject-card: 18px;  part-tile: 14px;  modal: 20–22px;  card(content): 18px;

/* Shadow */
subject-card: 0 18px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05);
part-tile:    0 10px 24px rgba(0,0,0,.35);
modal:        0 50px 130px rgba(0,0,0,.6);
content-card: 0 6px 24px rgba(20,20,40,0.10);

/* Signature motif — hazard stripe (แถบเหลือง-ดำทแยง) */
background: repeating-linear-gradient(45deg, #f5a524 0 13px, #171310 13px 26px);

/* Motion — framer-motion spring (ใช้ทุก transition หลัก) */
{ type:'spring', stiffness:300, damping:33, mass:0.9 }
```
Interaction: subject card `whileHover:{y:-5}` · part tile `whileHover:{y:-3}` · `whileTap:{scale:0.98}`

---

## 3. Architecture (component tree)

Navigation แบบ 3 ชั้น เชื่อมด้วย **shared-layout animation** (`layoutId`) — คลิกการ์ดแล้ว "ขยาย" เป็น modal อย่างต่อเนื่อง

```
App
├── Header                         // โลโก้ hazard + H1 "Math Rescue Kit" + แถบ hazard
├── Subjects grid                  // การ์ดวิชา (Calculus พร้อมใช้ + อีก 3 วิชา LOCKED)
│   └── SubjectCard  (layoutId="subject-<id>")
└── AnimatePresence
    └── SubjectModal (layoutId="subject-<id>")   // เปิดกล่องวิชา → เลือกบท
        ├── PartTile (layoutId="part-<id>") × N
        └── AnimatePresence
            └── PartModal (layoutId="part-<id>") // เปิดบท → grid การ์ดความรู้
                └── grid  (dangerouslySetInnerHTML = part.gridHTML)
```

พฤติกรรมสำคัญ:
- กด **Esc** → ปิด part ก่อน ถ้าไม่มีค่อยปิด subject
- เปิด modal → ล็อก scroll ของ `#mrk-root`
- KaTeX render ผ่าน `renderMathInElement` ตอน PartModal mount (delimiters: `\( \)` inline, `\[ \]` และ `$$ $$` display)
- `Rivet` = จุดหมุดตกแต่งมุมการ์ด (radial-gradient เล็กๆ)

---

## 4. Component specs

### 4.1 SubjectCard
- พื้น: `linear-gradient(180deg,#221e18,#17130f)`, border `--edge`, minHeight 200
- แถบ hazard บนสุด (height 8) + หมุด 2 มุมบน
- glyph ใหญ่จางมุมขวาล่าง (`rgba(245,165,36,.07)`, 126px, mono)
- ไฟสถานะ: จุดกลม + `READY`(amber, glow) / `LOCKED`(เทา, ไม่มี glow)
- footer: จำนวนบท/การ์ด + CTA `เปิดกล่อง →`
- state `comingSoon` → opacity .55, cursor not-allowed, ไม่มี layoutId

### 4.2 PartTile
- พื้น: `linear-gradient(180deg,#2b2620,#201b16)`, radius 14
- แถบสีซ้าย (width 5) = `p.accent` + glow เท่าสี accent
- badge จำนวนการ์ด (พื้น accent, ตัวหนังสือ `#131110`)
- state `locked` → opacity .5, `เร็วๆ นี้`

### 4.3 SubjectModal (โซนมืด)
- overlay: `rgba(9,8,7,.72)` + blur 7px
- พาเนล: `--panel`, radius 22, inset `clamp(10px,3vw,34px)`
- glow เรืองบนหัว: `radial-gradient(130% 100% at 50% -18%, rgba(245,165,36,.16), transparent 52%)`
- เส้น amber วิ่งบนสุด (scaleX 0→1)
- grid ของ PartTile: `repeat(auto-fill,minmax(220px,1fr))`, gap 14
- ปุ่มปิด: `ปิดกล่อง ✕`

### 4.4 PartModal (โซนสว่าง)
- overlay: `rgba(10,9,8,.5)` + blur 3px
- พาเนลสว่าง: `radial-gradient(140% 90% at 50% -5%, #fff, #f7f7fb 66%)`
- top bar sticky (พื้นขาวโปร่ง blur) — ปุ่ม `← กลับไปเลือกบท` + ชื่อบท + legend 7 หมวดสี
- เนื้อหา: `<div class="grid">` เต็มด้วยการ์ดความรู้

---

## 5. Content card anatomy (`.card`)

การ์ดความรู้ 1 ใบ = โครงคงที่ ต่อไปนี้ (section เรียงตามนี้เสมอ แต่มีได้ไม่ครบทุกอัน):

```html
<div class="card" data-accent="green|blue|orange|purple">
  <div class="card-head">
    <div class="eyebrow">PART 1 · Algebra Rescue · 🟢 Formula</div>
    <div class="title">Exponent Rules</div>
  </div>

  <div class="trigger-box">           <!-- กล่องเส้นประ ส้ม: สัญญาณ/trigger -->
    <div class="ic">🎯</div>
    <div class="txt">…ประโยคจำสั้นๆ…</div>
  </div>

  <div class="section when">…👀 เมื่อเจอโจทย์แบบนี้ (ul)…</div>
  <div class="section how">…✅ วิธีคิด (ol, ตัวหนา)…</div>
  <div class="section mistake">…❌ จุดที่พลาดบ่อย (ul, สีแดงเข้ม)…</div>
  <div class="section hack">…🧠 เทคนิคจำ (.txt ตัวหนา)…</div>
  <div class="section examtip">…🎯 ข้อสอบชอบออก (p)…</div>
  <div class="section checklist">…☑ Before You Submit (ul, bullet = ☐)…</div>
</div>
```

กติกา section:
- `.section` = padding 12/14, radius 12, พื้น `#fafafa` (override ด้วยสีหมวด)
- `.sec-head .dot` = จุดสี 9px ตามหมวด
- `when`→ฟ้า, `how`→เขียว, `mistake`→แดง, `hack`→เหลือง, `examtip`→ม่วง, `checklist`→เทา
- checklist ใช้ `content:"\2610  "` (☐) หน้าแต่ละ item
- การ์ด grid: flex-wrap, gap 28, การ์ดกว้าง 420px (มือถือ `<560px` → 100%)

---

## 6. Data model

```js
window.__RESCUE = {
  id, name, th, desc,               // ข้อมูลวิชา
  parts: [
    {
      id, num, name, th,            // เช่น num:'PART 1', name:'Algebra Rescue', th:'พีชคณิตกู้ภัย'
      cardCount: 12,
      accent: '#16a34a',
      gridHTML: `<div class="card">…</div> …`   // HTML การ์ดทั้งบท (มี KaTeX \( \))
    },
    …
  ]
}
```
- Subject grid สร้างจาก `DATA` + วิชา `comingSoon` อีก 3 (stat/trig/vec) hardcode ใน `App`
- **สำคัญ:** `gridHTML` render ด้วย `dangerouslySetInnerHTML` → คอมเมนต์ในไฟล์ระบุ *"อย่าแก้เนื้อหาการ์ดด้วยมือ"* (ควรมี generator แยก)

---

## 7. Responsive

```
Content card grid:  flex-wrap, gap 28 → มือถือ(<560px) gap 16, card 100%
Subjects grid:      repeat(auto-fill, minmax(258px,1fr)), gap 18
Parts grid:         repeat(auto-fill, minmax(220px,1fr)), gap 14
Modal inset:        clamp() ปรับตาม viewport
H1/H2:              clamp() ทั้งคู่
```

---

## 8. Tech stack + Antigravity notes

**Stack ต้นฉบับ:** React (UMD) + framer-motion (`Motion`) + KaTeX + Babel standalone (in-browser JSX) — เป็น single-file offline bundle

**แนะนำเมื่อ dev ต่อ:**
- ย้ายไป **Vite + React + TypeScript**, framer-motion เวอร์ชัน npm, `katex` + `react-katex`
- ยกโทเคนใน §2 ไปไว้ใน `theme.css`/`tailwind.config` เป็น source of truth เดียว
- แยก `gridHTML` (HTML ก้อน) ออกมาเป็น **data-driven cards** (JSON + `<Card>` component) แทน `dangerouslySetInnerHTML` — ปลอดภัยและแก้ง่ายกว่า
- คง signature 3 อย่างไว้เสมอ เพื่อไม่ให้หลุดแบรนด์: **hazard stripe**, **amber `#f5a524` accent + glow**, **Space Mono labels**

**วิธีสั่ง agent (Planning mode):**
> อ่าน `@Design.md` แล้ว scaffold โปรเจกต์ Vite+React+TS ตามระบบนี้: ทำ `theme.css` จาก §2, สร้าง component ตาม §3–4, และ `<Card>` component ที่ render จาก JSON ตาม schema §5–6 — คง hazard stripe / amber accent / Space Mono ไว้

> อย่าใช้ Fast mode กับงานนี้เพราะเป็น multi-file scaffold — ให้ agent วางแผนก่อน review แล้วค่อยลงมือ
