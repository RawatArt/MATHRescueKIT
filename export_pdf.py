"""
Math Rescue Kit — HTML → PDF (download build)
=============================================
ต่อยอดจาก merge_to_one.py เดิม — เพิ่มกรณี "ดาวน์โหลด PDF" ให้รองรับหลายวิชา
สร้าง PDF A5 (การ์ดละ 1 หน้า) ต่อวิชา ไว้เป็นไฟล์ static ให้ SPA ลิงก์ปุ่มดาวน์โหลด

ใช้:
    # วิชาเดียว
    python export_pdf.py --glob "Calculus_Rescue_Kit_Part*.html" --out public/pdf/calculus.pdf

    # หลายวิชาในทีเดียว (โฟลเดอร์ content/<id>/*.html → public/pdf/<id>.pdf)
    python export_pdf.py --batch content --outdir public/pdf

ต้องการ: pip install playwright pypdf ; playwright install chromium
"""

import argparse
import glob
import os
import re

from playwright.sync_api import sync_playwright
from pypdf import PdfWriter, PdfReader


def natural_sort_key(filename: str):
    return [int(c) if c.isdigit() else c.lower()
            for c in re.split(r"(\d+)", filename)]


# ── PRINT CSS: คงจาก merge_to_one.py เดิมทุกบรรทัด (จูน A5 มาแล้ว) ─────────
PRINT_CSS = """
@page { size: A5 portrait; margin: 0; }
html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
.grid { display: block !important; padding: 0 !important; gap: 0 !important; }
.card {
    width: 148mm !important; min-height: 0 !important; max-height: none !important;
    margin: 0 auto !important; border-radius: 0 !important; box-shadow: none !important;
    border-left: none !important; border-right: none !important;
    border-top: none !important; border-bottom: none !important;
    page-break-before: always !important; page-break-after: always !important;
    break-before: page !important; break-after: page !important;
    page-break-inside: avoid !important; break-inside: avoid !important;
    padding: 6mm 6mm 5mm !important;
    display: flex !important; flex-direction: column !important; overflow: hidden !important;
}
.card-head { padding: 10px 14px 9px !important; }
.title  { font-size: 17px !important; }
.eyebrow { font-size: 10px !important; margin-bottom: 2px !important; }
.trigger-box { margin: 8px 12px 0 !important; padding: 7px 11px !important; }
.trigger-box .txt { font-size: 12.5px !important; }
.section { margin: 7px 12px 0 !important; padding: 8px 11px !important; }
.section:last-of-type { margin-bottom: 8px !important; }
.sec-head { font-size: 11.5px !important; margin-bottom: 4px !important; }
.when ul, .mistake ul, .checklist ul { font-size: 11.5px !important; line-height: 1.45 !important; }
.how ol  { font-size: 11.5px !important; line-height: 1.5 !important; }
.hack .txt { font-size: 12px !important; }
.examtip p { font-size: 11.5px !important; line-height: 1.45 !important; }
.pagefoot {
    font-size: 9px !important; 
    padding: 6px 12px 8px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
}
.katex { font-size: 0.98em !important; }
.card:first-child { page-break-before: auto !important; break-before: auto !important; }

.card { position: relative !important; }
.pdf-contact-badges {
    display: flex !important;
    flex-direction: row !important;
    gap: 6px !important;
}
.pdf-contact-badge {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    background-color: #f7f7fb !important;
    padding: 3px 6px !important;
    border-radius: 6px !important;
    font-family: 'Space Mono', monospace !important;
    font-size: 8px !important;
    font-weight: 600 !important;
    color: #1f2330 !important;
}
.pdf-contact-badge svg {
    width: 10px !important;
    height: 10px !important;
}
"""


def wait_for_katex(page, timeout_ms: int = 8000) -> None:
    try:
        page.wait_for_function(
            """() => {
                const els = document.querySelectorAll('.katex');
                return els.length > 0 || !document.querySelector('script[src*="katex"]');
            }""",
            timeout=timeout_ms,
        )
        page.wait_for_timeout(600)
    except Exception:
        page.wait_for_timeout(1200)


def html_to_pdf(page, html_path: str, out_pdf: str) -> None:
    page.goto(f"file://{os.path.abspath(html_path)}", wait_until="networkidle", timeout=30_000)
    wait_for_katex(page)
    page.add_style_tag(content=PRINT_CSS)
    page.evaluate("""() => {
        const footers = document.querySelectorAll('.card .pagefoot');
        footers.forEach(foot => {
            const badgeHTML = `
            <div class="pdf-contact-badges">
                <div class="pdf-contact-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#06C755"><path d="M22.5 10.5C22.5 5.8 17.8 2 12 2C6.2 2 1.5 5.8 1.5 10.5C1.5 14.2 4.1 17.5 8 18.6C8.3 18.7 8.5 18.9 8.5 19.2C8.5 19.2 8.4 20 8.3 20.3C8.1 21 8 21 8.5 21.2C9.1 21.6 12 19.8 13.6 18.8C14.1 18.5 14.6 18.2 15.2 17.9C19.7 16.2 22.5 13.5 22.5 10.5ZM9.8 12.8H7.9C7.6 12.8 7.3 12.5 7.3 12.2V8.2C7.3 7.9 7.6 7.6 7.9 7.6C8.2 7.6 8.5 7.9 8.5 8.2V11.5H9.8C10.1 11.5 10.4 11.8 10.4 12.1C10.4 12.5 10.1 12.8 9.8 12.8ZM12.2 12.2C12.2 12.5 11.9 12.8 11.6 12.8C11.3 12.8 11 12.5 11 12.2V8.2C11 7.9 11.3 7.6 11.6 7.6C11.9 7.6 12.2 7.9 12.2 8.2V12.2ZM16.4 12.2C16.4 12.5 16.1 12.8 15.8 12.8C15.5 12.8 15.2 12.5 15.2 12.2V9.8L13.8 12.6C13.8 12.7 13.6 12.8 13.5 12.8C13.4 12.8 13.3 12.7 13.2 12.6C13.2 12.6 13.2 12.5 13.2 12.4V8.2C13.2 7.9 13.5 7.6 13.8 7.6C14.1 7.6 14.4 7.9 14.4 8.2V10.7L15.8 7.9C15.8 7.7 16 7.6 16.1 7.6C16.2 7.6 16.3 7.6 16.4 7.7C16.4 7.7 16.4 7.8 16.4 7.9V12.2Z"/></svg>
                    <span>LINE: artrawat</span>
                </div>
                <div class="pdf-contact-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.562H7.078V12.073H10.125V9.414C10.125 6.408 11.916 4.755 14.658 4.755C15.972 4.755 17.344 4.99 17.344 4.99V7.937H15.831C14.341 7.937 13.875 8.861 13.875 9.816V12.073H17.203L16.671 15.562H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/></svg>
                    <span>Facebook: Rawat Arthit</span>
                </div>
            </div>`;
            foot.insertAdjacentHTML('beforeend', badgeHTML);
        });
    }""")
    page.wait_for_timeout(300)
    page.pdf(path=out_pdf, width="148mm", height="210mm", print_background=True,
             margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})


def convert_and_merge(page, files: list[str], output_name: str) -> int:
    files = sorted(files, key=natural_sort_key)
    if not files:
        print(f"   ⚠️  ไม่พบไฟล์สำหรับ {output_name}")
        return 0

    temp_pdfs = []
    for i, html_file in enumerate(files, 1):
        temp = html_file.replace(".html", "__temp.pdf")
        print(f"    [{i:02d}/{len(files)}] {os.path.basename(html_file)}")
        try:
            html_to_pdf(page, html_file, temp)
            temp_pdfs.append(temp)
        except Exception as exc:
            print(f"        ✗ ข้าม: {exc}")

    if not temp_pdfs:
        return 0

    contact_html = os.path.abspath(os.path.join("templates", "contact_page.html"))
    if os.path.exists(contact_html):
        contact_temp = os.path.abspath(os.path.join("templates", "contact__temp.pdf"))
        print(f"    [+] แนบหน้าช่องทางติดต่อ (contact page)")
        try:
            page.goto(f"file://{contact_html}", wait_until="networkidle", timeout=30_000)
            page.wait_for_timeout(300)
            page.pdf(path=contact_temp, width="148mm", height="210mm", print_background=True,
                     margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
            temp_pdfs.append(contact_temp)
        except Exception as exc:
            print(f"        ✗ ข้ามหน้าติดต่อ: {exc}")

    os.makedirs(os.path.dirname(output_name) or ".", exist_ok=True)
    merger, total = PdfWriter(), 0
    for pdf in temp_pdfs:
        merger.append(pdf)
        total += len(PdfReader(pdf).pages)
    with open(output_name, "wb") as f:
        merger.write(f)
    merger.close()
    for pdf in temp_pdfs:
        try:
            os.remove(pdf)
        except OSError:
            pass
    print(f"   ✓ {output_name}  ({total} หน้า A5)")
    return total


def main():
    ap = argparse.ArgumentParser(description="Rescue Kit HTML → A5 PDF (download build)")
    ap.add_argument("--glob", help='วิชาเดียว: pattern เช่น "content/set/part-*.html"')
    ap.add_argument("--out", help="ไฟล์ PDF ปลายทาง (คู่กับ --glob)")
    ap.add_argument("--batch", help="โหมดหลายวิชา: โฟลเดอร์แม่ที่มี <subject-id>/*.html")
    ap.add_argument("--outdir", default="public/pdf", help="โฟลเดอร์ PDF ปลายทาง (โหมด --batch)")
    args = ap.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 1600})
        page = ctx.new_page()

        if args.batch:
            subs = sorted(d for d in os.listdir(args.batch)
                          if os.path.isdir(os.path.join(args.batch, d)))
            print(f"📚 batch: {len(subs)} วิชา\n")
            for sid in subs:
                print(f"📂 {sid}")
                files = glob.glob(os.path.join(args.batch, sid, "*.html"))
                convert_and_merge(page, files, os.path.join(args.outdir, f"{sid}.pdf"))
        else:
            if not args.glob or not args.out:
                raise SystemExit("ต้องระบุ --glob และ --out (หรือใช้ --batch)")
            print(f"📂 กำลังแปลง {args.glob}\n")
            convert_and_merge(page, glob.glob(args.glob), args.out)

        ctx.close()
        browser.close()

    print("\n🎉 เสร็จสมบูรณ์")


if __name__ == "__main__":
    main()
