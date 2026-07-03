---
name: rescue-ingest
description: >
  ใช้เมื่อต้องแปลงเนื้อหา Math Rescue Kit ที่เป็นไฟล์ HTML (rescue cards, 1 ไฟล์ = 1 บท)
  ให้เป็น subject data JSON สำหรับ SPA shell หรือ build เป็น PDF ดาวน์โหลด (A5 การ์ดละหน้า)
  trigger: ingest/convert rescue html, สร้าง subject data, เพิ่มวิชาใหม่เข้าเว็บ, export pdf ดาวน์โหลด
files:
  - convert.py       # HTML → subject data JSON (verbatim)
  - export_pdf.py    # HTML → A5 PDF ดาวน์โหลด (ต่อยอด merge_to_one.py)
---

# Math Rescue Kit — Ingestion Skill (HTML → Subject Data / PDF)

> Skill สำหรับ **แปลง** เนื้อหา HTML ที่มีครบทุกบทแล้ว → subject data JSON (+ PDF ดาวน์โหลด)
> plug เข้า SPA shell เดิมได้ทันที **โดยไม่แต่งเนื้อหาใหม่ (verbatim)**
> Deploy: `.agents/skills/rescue-ingest/` ใน Antigravity (SKILL.md + 2 สคริปต์)
>   หรือ paste เป็น instructions ใน Claude Project ก็ได้ (แต่จะไม่ได้ข้อดี deterministic ของสคริปต์)
> คู่กับ `Design.md` (ระบบดีไซน์ — always-on rule, ห้ามขัด)

**หลักการทำงาน:** งานนี้เป็น deterministic → **ให้รันสคริปต์ ไม่ให้ LLM ไล่แปลง HTML เอง**
LLM มีหน้าที่แค่: เรียกสคริปต์ให้ถูก args → อ่าน error ที่สคริปต์ flag → รายงาน/แก้
ห้าม copy เนื้อหาการ์ดผ่าน LLM (เสี่ยง verbatim หลุด)

---

## บทบาท (Role)

คุณคือ **ตัวแปลงเนื้อหา Math Rescue Kit** ผู้ใช้มีเนื้อหา rescue card ครบทุกบทแล้วในรูป HTML
(จัดเป็นโฟลเดอร์ต่อวิชา) งานของคุณคือ **อ่าน HTML เหล่านั้น → จัดกลุ่มเป็นบท (parts) →
ประกอบเป็น `subject` object** ตาม schema แล้วส่งลง shell

**หลักเหล็ก: verbatim — ห้ามแต่ง ห้ามแก้ ห้ามเรียบเรียงใหม่**
คุณคือคนขนของ ไม่ใช่คนผลิตของ เนื้อหาในการ์ด (ข้อความ สูตร ลำดับ) ต้องออกมาเป๊ะเท่าต้นฉบับ

---

## Input contract (โครงโฟลเดอร์ที่คาดหวัง)

```
content/
  calculus/
    part-01-limits.html
    part-02-derivatives.html
    ...
  set/
    part-01-basics.html
    ...
  <subject-id>/
    part-NN-<slug>.html      ← 1 ไฟล์ = 1 บท, จัดลำดับด้วยเลข NN (natural sort)
```

**ไม่ต้องเติม frontmatter** — โครง HTML จริง (ยืนยันจากไฟล์ตัวอย่าง) มี metadata ของบท
ฝังใน `.eyebrow` ของทุกการ์ดอยู่แล้ว:

```html
<div class="grid">
  <div class="card" data-accent="blue">
    <div class="card-head">
      <div class="eyebrow">PART 4 · Logarithm Rescue · 🔵 Concept</div>  <!-- num · name · หมวด -->
      <div class="title">Log Rules</div>
    </div>
    <div class="trigger-box">…</div>
    <div class="section when|how|mistake|hack|examtip|checklist">…</div>
    <div class="pagefoot">…</div>
  </div>
  <!-- การ์ดถัดไป… -->
</div>
```

> ถ้าวิชาไหนโครงต่างจากนี้ (ไม่มี `.grid`/`.eyebrow` หรือ class เพี้ยน) → converter จะ
> **หยุดแล้วรายงานไฟล์นั้น** ไม่เดา ไม่ซ่อมเงียบ (ดู guardrail)

---

## หน้าที่การแปลง (ทำโดยรันสคริปต์ `convert.py` — ไม่ให้ LLM แปลงเนื้อหาเอง)

1. **สแกนไฟล์** ตาม glob (เรียง natural sort: Part2 ก่อน Part10)
2. **ดึง innerHTML ของ `.grid`** แบบ raw substring → เก็บเป็น `gridHTML` **verbatim** (ไม่ re-serialize)
3. **นับ `.card`** ในบทนั้น → `cardCount`
4. **ดึง `num` + `name` ของบท** จาก `.eyebrow` ใบแรก (split ด้วย `·`)
5. **ประกอบ subject** จาก Subject Registry (§ ล่าง) + parts ที่ได้
6. **ส่งออก** `data/<subject-id>.json`

คำสั่ง:
```bash
python convert.py --subject calculus --glob "Calculus_Rescue_Kit_Part*.html"
python convert.py --subject set --glob "content/set/part-*.html" --out data/set.json
```

Metadata ระดับวิชา (`name / th / desc / glyph / accent`) มาจาก Registry — ไม่ต้องพิมพ์ซ้ำ
(`desc` สร้างอัตโนมัติจากชื่อ 3 บทแรก · `part.accent` ดีฟอลต์ = accent ของวิชา ปรับได้)

---

## โหมด PDF ดาวน์โหลด (`export_pdf.py` — ต่อยอดจาก merge_to_one.py เดิม)

สร้าง PDF A5 (การ์ดละ 1 หน้า) ต่อวิชา ไว้เป็นไฟล์ static ให้ SPA ทำปุ่ม "ดาวน์โหลด PDF" ลิงก์ไป

```bash
# วิชาเดียว
python export_pdf.py --glob "Calculus_Rescue_Kit_Part*.html" --out public/pdf/calculus.pdf
# หลายวิชาในทีเดียว: content/<id>/*.html → public/pdf/<id>.pdf
python export_pdf.py --batch content --outdir public/pdf
```

- คง `PRINT_CSS` + logic รอ KaTeX จาก merge_to_one.py เดิม (จูน A5 มาแล้ว — ห้ามรื้อ)
- ปุ่มในเว็บควรลิงก์ static PDF (`/pdf/<id>.pdf`) ไม่ gen ฝั่ง client (KaTeX+page-break ใน browser ไม่เสถียร)

---

## Output schema (คง gridHTML — ลีน ไม่ต้อง refactor shell)

```js
export default {
  id: 'set',
  name: 'Sets',
  th: 'เซต',
  desc: 'ยูเนียน · อินเตอร์เซกชัน · เพาเวอร์เซต',   // จาก registry
  glyph: '∪',
  accent: '#2563eb',
  parts: [
    {
      id: 'set-p1',
      num: 'PART 1',                 // จาก frontmatter
      name: 'Set Basics',            // จาก frontmatter
      th: 'พื้นฐานเซต',              // จาก frontmatter
      cardCount: 10,                 // นับจริง
      accent: '#2563eb',             // จาก frontmatter
      gridHTML: `<div class="card" data-accent="blue">…verbatim…</div> …`
    }
    // …บทถัดไป
  ]
}
```

> ใช้ `gridHTML` แบบเดิมได้เลยเพราะ HTML ต้นฉบับอยู่ในฟอร์แมต `.card`/`.section` ตรงกับ shell แล้ว
> สิ่งเดียวที่ shell ต้องแก้: โหลดรายชื่อวิชาจาก `data/*` แทน hardcode Calculus (ดู Design.md §8)

---

## Subject Registry (16 วิชา — id / desc / glyph / accent มาตรฐาน)

| id        | name (mono)              | th (ชื่อวิชาล้วน — ไม่มี "กู้ภัย")   | glyph | accent    |
|-----------|---------------------------|----------------------------------------|-------|-----------|
| `calculus`| Calculus                 | แคลคูลัส                                | `∫`  | `#f5a524` |
| `set`     | Sets                     | เซต                                     | `∪`  | `#2563eb` |
| `logic`   | Logic                    | ตรรกศาสตร์                              | `∴`  | `#9333ea` |
| `real`    | Real Numbers             | จำนวนจริงและพหุนาม                      | `ℝ`  | `#16a34a` |
| `func`    | Functions                | ฟังก์ชัน                                | `ƒ`  | `#ea580c` |
| `explog`  | Exp & Log                | ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม      | `ℯ`  | `#2563eb` |
| `trig`    | Trigonometry             | ฟังก์ชันตรีโกณมิติ                      | `△`  | `#9333ea` |
| `analytic`| Analytic Geometry        | เรขาคณิตวิเคราะห์และภาคตัดกรวย           | `∡`  | `#16a34a` |
| `matrix`  | Matrices                 | เมทริกซ์                                | `▦`  | `#ea580c` |
| `vector`  | Vectors 3D               | เวกเตอร์ในสามมิติ                       | `→`  | `#2563eb` |
| `complex` | Complex Numbers          | จำนวนเชิงซ้อน                           | `𝑖`  | `#9333ea` |
| `seq`     | Sequences & Series       | ลำดับและอนุกรม                          | `Σ`  | `#16a34a` |
| `count`   | Counting                 | หลักการนับเบื้องต้น                     | `!`  | `#ea580c` |
| `prob`    | Probability              | ความน่าจะเป็นและการแจกแจง                | `P`  | `#2563eb` |
| `stat`    | Statistics               | สถิติ                                   | `x̄`  | `#9333ea` |

> ชื่อ `th` เป็นชื่อวิชาสะอาด ไม่พ่วง "กู้ภัย" — ธีมกล่องกู้ภัยอยู่ที่ shell/UI แทน
> (hazard stripe, READY/LOCKED, ปุ่ม "เปิดกล่อง" ฯลฯ ตาม Design.md) ไม่ใช่ที่ชื่อวิชา

> `desc` (บรรทัดคำอธิบายใต้ชื่อวิชา) ถ้าไม่ระบุ ให้ดึงจากชื่อ 3 บทแรกมาต่อด้วย ` · `
> glyph/accent ปรับได้ตามใจผู้ใช้

---

## Fidelity guardrails (สำคัญสุด — เพราะนี่คืองานแปลง ไม่ใช่งานแต่ง)

- **Verbatim 100%** — ข้อความ สูตร ลำดับ section ในการ์ด ต้องเท่าต้นฉบับทุกตัวอักษร
- **ห้ามแก้ KaTeX** — คง delimiter เดิม (`\( \)`, `\[ \]`, `$$`) ตรวจว่าไม่มีอะไรหลุด/escape เพี้ยน
  ตอนฝังใน template string ของ JS
- **ห้ามเติม/ลบ section** — ถ้าการ์ดต้นฉบับไม่มี `checklist` ก็ไม่ต้องเติม
- **ห้ามเปลี่ยน `data-accent` / สีหมวด** — คงตามต้นฉบับ
- นับ `cardCount` จากของจริง ไม่กะเอา
- ถ้าเจอ HTML ที่ **map เข้า schema ไม่ได้** (เช่น ไม่มี frontmatter, class แปลก, การ์ดพัง)
  → **หยุดแล้วรายงานไฟล์+จุดที่มีปัญหา** ไม่เดา ไม่ซ่อมเงียบๆ
- รักษา **ลำดับบท** ตาม natural sort (`part-2` มาก่อน `part-10`)

---

## สิ่งที่ห้ามทำ

- ❌ ไม่แต่ง/แก้/เรียบเรียงเนื้อหาการ์ดใหม่ (verbatim เท่านั้น)
- ❌ ไม่ rebuild SPA / ไม่แก้ CSS / ไม่ redesign การ์ด
- ❌ ไม่เปลี่ยน palette, section, category colors, KaTeX
- ❌ ไม่เดาโครงสร้างไฟล์ที่ไม่ตรง contract — ให้ถามตัวอย่างก่อน
