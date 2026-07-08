from __future__ import annotations

import re
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image as PdfImage,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "entregables_pdf"


DOCS = [
    ("docs/submission.md", "01_final_submission_form_manglar_azul_mrv.pdf", "Final Submission Form - Manglar Azul MRV"),
    ("docs/deployment-lacnet.md", "02_lacnet_smart_contract_deployment_guide_manglar_azul_mrv.pdf", "LACNet Smart Contract Deployment Guide - Manglar Azul MRV"),
    ("pitch/output/output.pptx", "03_pitch_deck_manglar_azul_mrv.pdf", "Pitch Deck - Manglar Azul MRV"),
    ("README.md", "04_readme_repositorio_manglar_azul_mrv.pdf", "README del Repositorio"),
    ("docs/architecture.md", "05_arquitectura_manglar_azul_mrv.pdf", "Arquitectura"),
    ("docs/demo-script.md", "06_guion_video_demo_manglar_azul_mrv.pdf", "Guion de Video Demo"),
    ("docs/rubric-checklist.md", "07_checklist_rubrica_manglar_azul_mrv.pdf", "Checklist de Rubrica"),
    ("mrv/output/mrv_report.txt", "08_reporte_mrv_resumen_manglar_azul_mrv.pdf", "Reporte MRV Resumen"),
]


def register_fonts() -> tuple[str, str, str]:
    font_dir = Path("C:/Windows/Fonts")
    regular = font_dir / "arial.ttf"
    bold = font_dir / "arialbd.ttf"
    mono = font_dir / "consola.ttf"

    if regular.exists() and bold.exists() and mono.exists():
        pdfmetrics.registerFont(TTFont("Arial", str(regular)))
        pdfmetrics.registerFont(TTFont("Arial-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("Consolas", str(mono)))
        return "Arial", "Arial-Bold", "Consolas"

    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, FONT_BOLD, FONT_MONO = register_fonts()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=22,
            leading=27,
            textColor=colors.HexColor("#12312C"),
            spaceAfter=18,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#12312C"),
            spaceBefore=14,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#1D6B3A"),
            spaceBefore=10,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#12312C"),
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=10,
            leading=14,
            leftIndent=12,
            spaceAfter=4,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName=FONT_MONO,
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0A2522"),
        ),
        "center": ParagraphStyle(
            "Center",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#12312C"),
        ),
    }


S = styles()


class HorizontalRule(Flowable):
    def __init__(self, width=450, color="#F2B94B"):
        super().__init__()
        self.width = width
        self.height = 8
        self.color = colors.HexColor(color)

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(2)
        self.canv.line(0, 4, self.width, 4)


def clean_inline(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r"<font name='Consolas'>\1</font>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    return text


def make_table(rows: list[list[str]]):
    table = Table([[Paragraph(clean_inline(cell), S["body"]) for cell in row] for row in rows], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D7E8DD")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#12312C")),
                ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#B8CCC4")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def markdown_to_story(markdown: str, title: str):
    story = [Paragraph(title, S["title"]), HorizontalRule(), Spacer(1, 0.12 * inch)]
    lines = markdown.splitlines()
    code_lines: list[str] = []
    table_lines: list[str] = []
    bullets: list[ListItem] = []
    in_code = False

    def flush_code():
        nonlocal code_lines
        if code_lines:
            story.append(Preformatted("\n".join(code_lines), S["code"]))
            story.append(Spacer(1, 0.08 * inch))
            code_lines = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            rows = []
            for line in table_lines:
                cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
                if cells and not all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
                    rows.append(cells)
            if rows:
                story.append(make_table(rows))
                story.append(Spacer(1, 0.1 * inch))
            table_lines = []

    def flush_bullets():
        nonlocal bullets
        if bullets:
            story.append(ListFlowable(bullets, bulletType="bullet", leftIndent=18))
            story.append(Spacer(1, 0.08 * inch))
            bullets = []

    for raw_line in lines:
        line = raw_line.rstrip()

        if line.startswith("```"):
            if in_code:
                flush_code()
                in_code = False
            else:
                flush_bullets()
                flush_table()
                in_code = True
            continue

        if in_code:
            code_lines.append(line)
            continue

        if line.strip().startswith("|") and line.strip().endswith("|"):
            flush_bullets()
            table_lines.append(line)
            continue
        flush_table()

        if not line.strip():
            flush_bullets()
            story.append(Spacer(1, 0.05 * inch))
            continue

        if line.startswith("# "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[2:].strip()), S["h1"]))
        elif line.startswith("## "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[3:].strip()), S["h2"]))
        elif line.startswith("### "):
            flush_bullets()
            story.append(Paragraph(clean_inline(line[4:].strip()), S["h2"]))
        elif line.startswith("- "):
            bullets.append(ListItem(Paragraph(clean_inline(line[2:].strip()), S["bullet"])))
        elif re.match(r"^\d+\.\s+", line):
            flush_bullets()
            story.append(Paragraph(clean_inline(line), S["body"]))
        else:
            flush_bullets()
            story.append(Paragraph(clean_inline(line), S["body"]))

    flush_code()
    flush_table()
    flush_bullets()
    return story


def render_markdown_pdf(source: Path, destination: Path, title: str):
    text = source.read_text(encoding="utf-8")
    doc = SimpleDocTemplate(
        str(destination),
        pagesize=A4,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title=title,
    )
    doc.build(markdown_to_story(text, title))


def render_text_pdf(source: Path, destination: Path, title: str):
    doc = SimpleDocTemplate(
        str(destination),
        pagesize=A4,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title=title,
    )
    story = [Paragraph(title, S["title"]), HorizontalRule(), Spacer(1, 0.18 * inch)]
    story.append(Preformatted(source.read_text(encoding="utf-8"), S["code"]))
    doc.build(story)


def render_pitch_pdf(destination: Path):
    slide_paths = [ROOT / "pitch" / "output" / f"slide-{index:02}.png" for index in range(1, 9)]
    page_size = (1280, 720)
    pdf = canvas.Canvas(str(destination), pagesize=page_size)
    pdf.setTitle("Pitch Deck - Manglar Azul MRV")

    for slide_path in slide_paths:
        pdf.drawImage(str(slide_path), 0, 0, width=page_size[0], height=page_size[1])
        pdf.showPage()

    pdf.save()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old_pdf in OUT.glob("*.pdf"):
        old_pdf.unlink()

    generated = []
    for source_name, output_name, title in DOCS:
        source = ROOT / source_name
        destination = OUT / output_name

        if source.suffix.lower() == ".pptx":
            render_pitch_pdf(destination)
        elif source.suffix.lower() == ".md":
            render_markdown_pdf(source, destination, title)
        else:
            render_text_pdf(source, destination, title)

        generated.append(destination)

    print("PDFs generados:")
    for path in generated:
        print(path)


if __name__ == "__main__":
    main()
