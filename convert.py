"""
Math Rescue Kit — HTML → Subject Data (JSON) converter
=======================================================
แปลงไฟล์ HTML rescue-card (1 ไฟล์ = 1 บท) เป็น subject data JSON
ที่ plug เข้า SPA shell ได้ทันที — VERBATIM ไม่แตะเนื้อหาการ์ด

ใช้:
    python convert.py --subject calculus --glob "Calculus_Rescue_Kit_Part*.html"
    python convert.py --subject set --glob "content/set/part-*.html" --out data/set.json

ต้องการ: Python 3.9+ (ใช้ stdlib ล้วน ไม่ต้อง pip)
"""

import argparse
import json
import os
import re
import glob as globmod


# ── Subject Registry (จาก math-rescue-agent.md) ──────────────────────────
REGISTRY = {
    "calculus": {"name": "Calculus",           "th": "แคลคูลัส",                              "glyph": "∫", "accent": "#f5a524"},
    "set":      {"name": "Sets",               "th": "เซต",                                   "glyph": "∪", "accent": "#2563eb"},
    "logic":    {"name": "Logic",              "th": "ตรรกศาสตร์",                            "glyph": "∴", "accent": "#9333ea"},
    "real":     {"name": "Real Numbers",       "th": "จำนวนจริงและพหุนาม",                    "glyph": "ℝ", "accent": "#16a34a"},
    "func":     {"name": "Functions",          "th": "ฟังก์ชัน",                              "glyph": "ƒ", "accent": "#ea580c"},
    "explog":   {"name": "Exp & Log",          "th": "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม",    "glyph": "ℯ", "accent": "#2563eb"},
    "trig":     {"name": "Trigonometry",       "th": "ฟังก์ชันตรีโกณมิติ",                    "glyph": "△", "accent": "#9333ea"},
    "analytic": {"name": "Analytic Geometry",  "th": "เรขาคณิตวิเคราะห์และภาคตัดกรวย",         "glyph": "∡", "accent": "#16a34a"},
    "matrix":   {"name": "Matrices",           "th": "เมทริกซ์",                              "glyph": "▦", "accent": "#ea580c"},
    "vector":   {"name": "Vectors 3D",         "th": "เวกเตอร์ในสามมิติ",                     "glyph": "→", "accent": "#2563eb"},
    "complex":  {"name": "Complex Numbers",    "th": "จำนวนเชิงซ้อน",                         "glyph": "𝑖", "accent": "#9333ea"},
    "seq":      {"name": "Sequences & Series", "th": "ลำดับและอนุกรม",                        "glyph": "Σ", "accent": "#16a34a"},
    "count":    {"name": "Counting",           "th": "หลักการนับเบื้องต้น",                   "glyph": "!", "accent": "#ea580c"},
    "prob":     {"name": "Probability",        "th": "ความน่าจะเป็นและการแจกแจง",              "glyph": "P", "accent": "#2563eb"},
    "stat":     {"name": "Statistics",         "th": "สถิติ",                                 "glyph": "x̄", "accent": "#9333ea"},
}


def natural_sort_key(s: str):
    """เรียงแบบมนุษย์: Part2 มาก่อน Part10 (ตรงกับ merge_to_one.py เดิม)"""
    return [int(c) if c.isdigit() else c.lower()
            for c in re.split(r"(\d+)", s)]


def extract_grid_inner(html: str, path: str) -> str:
    """
    ดึง innerHTML ของ <div class="grid"> แบบ VERBATIM (raw substring)
    ไม่ re-serialize เพื่อกันเนื้อหา/ช่องว่าง/สูตร KaTeX เพี้ยน
    """
    m = re.search(r'<div\s+class="grid"\s*>', html)
    if not m:
        raise ValueError(f"[{path}] ไม่พบ <div class=\"grid\">")
    start = m.end()
    # grid เป็น container ชั้นบนสุด → ปิดที่ </div> ตัวสุดท้ายก่อน </body>
    body_end = html.rfind("</body>")
    region = html[start:body_end] if body_end != -1 else html[start:]
    close = region.rfind("</div>")
    if close == -1:
        raise ValueError(f"[{path}] ไม่พบ </div> ปิด grid")
    return region[:close].strip()


def parse_part(path: str, part_id: str, accent: str) -> dict:
    """อ่านไฟล์บทหนึ่ง → part object (gridHTML verbatim + metadata จาก eyebrow)"""
    with open(path, encoding="utf-8") as f:
        html = f.read()

    grid = extract_grid_inner(html, path)

    # นับการ์ดจริง
    card_count = len(re.findall(r'<div\s+class="card"', grid))
    if card_count == 0:
        raise ValueError(f"[{path}] ไม่พบ .card เลย — ตรวจโครง HTML")

    # metadata ของบท ดึงจาก .eyebrow ใบแรก: "PART 4 · Logarithm Rescue · 🔵 Concept"
    eb = re.search(r'<div\s+class="eyebrow">([^<]*)</div>', grid)
    if not eb:
        raise ValueError(f"[{path}] ไม่พบ .eyebrow — ดึง num/name ของบทไม่ได้")
    segs = [s.strip() for s in eb.group(1).split("·")]
    num = segs[0] if len(segs) > 0 and segs[0] else "PART ?"          # "PART 4"
    name = segs[1] if len(segs) > 1 and segs[1] else num              # "Logarithm Rescue"
    th = name  # ชื่อบทภาษาไทยถ้ามีแยก ให้ override ทีหลังได้

    return {
        "id": part_id,
        "num": num,
        "name": name,
        "th": th,
        "cardCount": card_count,
        "accent": accent,
        "gridHTML": grid,   # ← verbatim
    }


def build_subject(subject_id: str, files: list[str]) -> dict:
    if subject_id not in REGISTRY:
        raise SystemExit(f"❌ ไม่รู้จัก subject id '{subject_id}' — เพิ่มใน REGISTRY ก่อน")
    reg = REGISTRY[subject_id]

    files = sorted(files, key=natural_sort_key)
    if not files:
        raise SystemExit("❌ ไม่พบไฟล์ HTML ตาม --glob")

    parts, problems = [], []
    for i, path in enumerate(files, 1):
        pid = f"{subject_id}-p{i}"
        try:
            parts.append(parse_part(path, pid, reg["accent"]))
            print(f"  ✓ [{i:02d}] {os.path.basename(path)}  "
                  f"→ {parts[-1]['num']} · {parts[-1]['name']} ({parts[-1]['cardCount']} cards)")
        except Exception as exc:
            problems.append((path, str(exc)))
            print(f"  ✗ [{i:02d}] {os.path.basename(path)}  → {exc}")

    if problems:
        # ตามหลัก guardrail: เจอ map ไม่ได้ = หยุด+รายงาน ไม่เดา
        raise SystemExit(f"\n❌ มี {len(problems)} ไฟล์ที่แปลงไม่ได้ — แก้ก่อนแล้วรันใหม่")

    desc = " · ".join(p["name"] for p in parts[:3])
    return {
        "id": subject_id,
        "name": reg["name"],
        "th": reg["th"],
        "desc": desc,
        "glyph": reg["glyph"],
        "accent": reg["accent"],
        "parts": parts,
    }


def main():
    ap = argparse.ArgumentParser(description="HTML rescue cards → subject data JSON (verbatim)")
    ap.add_argument("--subject", required=True, help="subject id เช่น calculus, set, trig")
    ap.add_argument("--glob", required=True, help='pattern เช่น "content/set/part-*.html"')
    ap.add_argument("--out", default=None, help="ไฟล์ผลลัพธ์ (ดีฟอลต์ data/<subject>.json)")
    args = ap.parse_args()

    files = globmod.glob(args.glob)
    print(f"📂 subject='{args.subject}' พบ {len(files)} ไฟล์\n")

    subject = build_subject(args.subject, files)

    out = args.out or os.path.join("data", f"{args.subject}.json")
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(subject, f, ensure_ascii=False, indent=2)

    total_cards = sum(p["cardCount"] for p in subject["parts"])
    print(f"\n🎉 เขียน {out}")
    print(f"   {len(subject['parts'])} บท · {total_cards} การ์ด รวม")


if __name__ == "__main__":
    main()
