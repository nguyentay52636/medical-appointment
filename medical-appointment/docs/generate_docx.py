import re
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{top}"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{left}"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{bottom}"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{right}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def build_docx_from_markdown(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # Set page margins (1 inch)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    # Base font setup
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    i = 0
    n = len(lines)

    in_code_block = False
    code_lines = []

    while i < n:
        raw_line = lines[i].rstrip('\r\n')
        line = raw_line.strip()

        # Handle code blocks
        if line.startswith('```'):
            if in_code_block:
                # End of code block: output as shaded box / mono paragraph
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.3)
                p.paragraph_format.right_indent = Inches(0.3)
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(6)
                code_text = '\n'.join(code_lines)
                run = p.add_run(code_text)
                run.font.name = 'Consolas'
                run.font.size = Pt(9.5)
                run.font.color.rgb = RGBColor(15, 23, 42)
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(raw_line)
            i += 1
            continue

        # Skip empty lines
        if not line:
            i += 1
            continue

        # Math Block ($$...$$)
        if line.startswith('$$'):
            math_lines = []
            if line.endswith('$$') and len(line) > 2:
                math_lines.append(line[2:-2].strip())
                i += 1
            else:
                i += 1
                while i < n and not lines[i].strip().startswith('$$'):
                    math_lines.append(lines[i].strip())
                    i += 1
                if i < n and lines[i].strip().startswith('$$'):
                    i += 1
            
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.left_indent = Inches(0.3)
            p.paragraph_format.right_indent = Inches(0.3)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            math_text = '\n'.join(math_lines)
            run = p.add_run(math_text)
            run.font.name = 'Cambria Math'
            run.font.size = Pt(11)
            run.font.italic = True
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue
            continue

        # Skip markdown horizontal rule
        if line in ['---', '***', '___']:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            p_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
            p._p.get_or_add_pPr().append(p_border)
            i += 1
            continue

        # Markdown Table Parsing
        if line.startswith('|') and line.endswith('|'):
            table_lines = []
            while i < n and lines[i].strip().startswith('|') and lines[i].strip().endswith('|'):
                table_lines.append(lines[i].strip())
                i += 1

            if len(table_lines) >= 2:
                # First line: headers
                headers = [c.strip() for c in table_lines[0].strip('|').split('|')]
                # Second line: separator (check if it has '---')
                has_separator = '---' in table_lines[1]
                data_rows = []
                start_row = 2 if has_separator else 1
                for r_idx in range(start_row, len(table_lines)):
                    row_cells = [c.strip() for c in table_lines[r_idx].strip('|').split('|')]
                    data_rows.append(row_cells)

                # Create Word table
                num_cols = len(headers)
                t = doc.add_table(rows=len(data_rows) + 1, cols=num_cols)
                t.alignment = WD_TABLE_ALIGNMENT.CENTER
                t.autofit = True

                # Fill header
                hdr_cells = t.rows[0].cells
                for col_idx, h_text in enumerate(headers):
                    if col_idx < len(hdr_cells):
                        hdr_cells[col_idx].text = h_text.replace('**', '')
                        set_cell_background(hdr_cells[col_idx], "1E40AF") # Deep Medical Blue
                        set_cell_margins(hdr_cells[col_idx], top=120, bottom=120, left=150, right=150)
                        set_cell_borders(hdr_cells[col_idx], "1E3A8A", "1E3A8A", "1E3A8A", "1E3A8A")
                        p = hdr_cells[col_idx].paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        for run in p.runs:
                            run.font.name = 'Times New Roman'
                            run.font.bold = True
                            run.font.size = Pt(10)
                            run.font.color.rgb = RGBColor(255, 255, 255)

                # Fill rows
                for r_idx, r_data in enumerate(data_rows):
                    row_cells = t.rows[r_idx + 1].cells
                    bg_color = "F8FAFC" if (r_idx % 2 == 1) else "FFFFFF"
                    for col_idx in range(num_cols):
                        if col_idx < len(row_cells):
                            cell_val = r_data[col_idx] if col_idx < len(r_data) else ""
                            row_cells[col_idx].text = cell_val.replace('**', '').replace('`', '')
                            set_cell_background(row_cells[col_idx], bg_color)
                            set_cell_margins(row_cells[col_idx], top=100, bottom=100, left=140, right=140)
                            set_cell_borders(row_cells[col_idx], "E2E8F0", "E2E8F0", "E2E8F0", "E2E8F0")
                            p = row_cells[col_idx].paragraphs[0]
                            for run in p.runs:
                                run.font.name = 'Times New Roman'
                                run.font.size = Pt(9.5)
                                run.font.color.rgb = RGBColor(30, 41, 59)

                # Space after table
                spacer = doc.add_paragraph()
                spacer.paragraph_format.space_before = Pt(4)
                spacer.paragraph_format.space_after = Pt(4)
            continue

        # Blockquote (starts with >)
        if line.startswith('>'):
            quote_text = line.lstrip('>').strip()
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.3)
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(4)
            # Add subtle left border
            p_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:left w:val="single" w:sz="18" w:space="8" w:color="2563EB"/></w:pBdr>')
            p._p.get_or_add_pPr().append(p_border)

            # Format bold/normal in quote
            format_inline_text(p, quote_text, italic=True)
            i += 1
            continue

        # Headings
        if line.startswith('# '):
            h_text = line[2:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run(h_text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(18)
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 64, 175) # Blue 800
            i += 1
            continue

        if line.startswith('## '):
            h_text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(h_text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = RGBColor(37, 99, 235) # Blue 600
            i += 1
            continue

        if line.startswith('### '):
            h_text = line[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(h_text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
            i += 1
            continue

        if line.startswith('#### '):
            h_text = line[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(h_text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(71, 85, 105) # Slate 600
            i += 1
            continue

        # Bullet list item
        if line.startswith('- ') or line.startswith('* '):
            bullet_text = line[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            format_inline_text(p, bullet_text)
            i += 1
            continue

        # Numbered list item (e.g. 1. 2.)
        num_match = re.match(r'^(\d+)\.\s+(.*)$', line)
        if num_match:
            num_str, list_text = num_match.groups()
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r_num = p.add_run(f"{num_str}. ")
            r_num.font.bold = True
            format_inline_text(p, list_text)
            i += 1
            continue

        # Standard prose paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        format_inline_text(p, line)
        i += 1

    doc.save(docx_path)
    print(f"File DOCX created successfully at: {docx_path}")

def format_inline_text(paragraph, text, italic=False):
    # Split text by bold (**text** or `code` or $math$)
    pattern = re.compile(r'(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)')
    parts = pattern.split(text)

    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            bold_text = part[2:-2]
            run = paragraph.add_run(bold_text)
            run.font.bold = True
            run.font.italic = italic
        elif part.startswith('`') and part.endswith('`'):
            code_text = part[1:-1]
            run = paragraph.add_run(code_text)
            run.font.name = 'Consolas'
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(194, 65, 12) # Amber 700 / Code color
        elif part.startswith('$') and part.endswith('$') and len(part) > 2:
            math_text = part[1:-1]
            run = paragraph.add_run(math_text)
            run.font.name = 'Cambria Math'
            run.font.size = Pt(10.5)
            run.font.italic = True
            run.font.color.rgb = RGBColor(30, 58, 138)
        else:
            run = paragraph.add_run(part)
            run.font.italic = italic

if __name__ == '__main__':
    import sys
    base_dir = '/Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/docs'
    if len(sys.argv) >= 3:
        md_file = sys.argv[1]
        docx_file = sys.argv[2]
    elif len(sys.argv) == 2:
        md_file = sys.argv[1]
        docx_file = os.path.splitext(md_file)[0] + '.docx'
    else:
        md_file = os.path.join(base_dir, 'BAO_CAO_TONG_QUAN_VA_TINH_NANG_DU_AN.md')
        docx_file = os.path.join(base_dir, 'BAO_CAO_TONG_QUAN_VA_TINH_NANG_DU_AN.docx')
    build_docx_from_markdown(md_file, docx_file)


