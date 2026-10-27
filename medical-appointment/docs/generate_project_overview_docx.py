import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs can be top, bottom, left, right.
    value: dict(sz=4, val='single', color='CBD5E1')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right'):
        edge_data = kwargs.get(edge)
        if edge_data:
            b_xml = f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", 4)}" w:space="0" w:color="{edge_data.get("color", "CBD5E1")}"/>'
        else:
            b_xml = f'<w:{edge} {nsdecls("w")} w:val="none"/>'
        tcBorders.append(parse_xml(b_xml))
    tcPr.append(tcBorders)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF) # Blue-800
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) # Sky-600
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x76, 0x6E) # Teal-700
    return h

def add_body_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = 'Calibri'
        r_bold.font.size = Pt(10)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(10)
    r_text.font.italic = italic
    r_text.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
    return p

def add_bullet_p(doc, bold_prefix, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Calibri'
        r_b.font.size = Pt(10)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    r_t = p.add_run(text)
    r_t.font.name = 'Calibri'
    r_t.font.size = Pt(10)
    r_t.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    return p

def add_callout_box(doc, title, text, bg_hex="F0FDF4", border_color="16A34A"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.7)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    set_cell_border(cell, left=dict(sz=16, val='single', color=border_color),
                           top=dict(sz=4, val='single', color='E2E8F0'),
                           bottom=dict(sz=4, val='single', color='E2E8F0'),
                           right=dict(sz=4, val='single', color='E2E8F0'))
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if title:
        rt = p.add_run(title + "\n")
        rt.font.name = 'Calibri'
        rt.font.size = Pt(10.5)
        rt.font.bold = True
        rt.font.color.rgb = RGBColor(0x16, 0x65, 0x34) if bg_hex=="F0FDF4" else RGBColor(0x1E, 0x40, 0xAF)
    rb = p.add_run(text)
    rb.font.name = 'Calibri'
    rb.font.size = Pt(9.5)
    rb.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(4)

def format_table(table, col_widths, headers, data, header_bg="1E40AF"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Headers
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        hdr_cells[i].width = Inches(col_widths[i])
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        set_cell_border(hdr_cells[i], top=dict(sz=4, val='single', color='1E3A8A'),
                                     bottom=dict(sz=8, val='single', color='1E3A8A'),
                                     left=dict(sz=4, val='single', color='3B82F6'),
                                     right=dict(sz=4, val='single', color='3B82F6'))
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Data
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            row_cells[col_idx].width = Inches(col_widths[col_idx])
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
            set_cell_border(row_cells[col_idx], top=dict(sz=4, val='single', color='E2E8F0'),
                                                bottom=dict(sz=4, val='single', color='E2E8F0'),
                                                left=dict(sz=4, val='single', color='E2E8F0'),
                                                right=dict(sz=4, val='single', color='E2E8F0'))
            p = row_cells[col_idx].paragraphs[0]
            if col_idx in (0, 1):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(4)

def generate_full_report(output_path):
    global doc
    doc = docx.Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    # Base style
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(10)
    font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # --- Title Banner Block ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("BÁO CÁO TỔNG QUAN HỆ THỐNG & CHI TIẾT TÍNH NĂNG")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF) # Blue-800

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(10)
    run_sub = sub_p.add_run("Dự án Nền tảng Đặt lịch khám bệnh & Quản lý phòng khám trực tuyến (Klinik / MediCare)")
    run_sub.font.name = 'Calibri'
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(0x02, 0x84, 0xC7) # Sky-600

    # Meta Info Card
    meta_table = doc.add_table(rows=1, cols=1)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_cell = meta_table.cell(0, 0)
    meta_cell.width = Inches(6.7)
    set_cell_background(meta_cell, "F0F7FF")
    set_cell_margins(meta_cell, top=130, bottom=130, left=170, right=170)
    set_cell_border(meta_cell, left=dict(sz=18, val='single', color='2563EB'),
                               top=dict(sz=4, val='single', color='DBEAFE'),
                               bottom=dict(sz=4, val='single', color='DBEAFE'),
                               right=dict(sz=4, val='single', color='DBEAFE'))

    meta_p = meta_cell.paragraphs[0]
    meta_p.paragraph_format.space_after = Pt(2)
    meta_p.paragraph_format.line_spacing = 1.15
    
    r = meta_p.add_run("• Hệ thống: ")
    r.bold = True
    meta_p.add_run("Klinik Medical Appointment & Clinic Management System\n")

    r = meta_p.add_run("• Kiến trúc: ")
    r.bold = True
    meta_p.add_run("Client-Server (React 19 Vite + Spring Boot 3.3.0 + Apache Kafka + Spring AI RAG)\n")

    r = meta_p.add_run("• Tiến độ hoàn thiện: ")
    r.bold = True
    r_val = meta_p.add_run("Hoàn thành 100% (15/15 Commits Đã Kiểm Thử & Chạy Thông Suốt ✅)\n")
    r_val.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
    r_val.bold = True

    r = meta_p.add_run("• Cập nhật: ")
    r.bold = True
    meta_p.add_run("27/10/2026   |   Phiên bản tài liệu: v3.0 Official Release")

    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(6)

    # ==========================================
    # 1. GIỚI THIỆU TỔNG QUAN & BỐI CẢNH DỰ ÁN
    # ==========================================
    add_heading_1(doc, "1. GIỚI THIỆU TỔNG QUAN & BỐI CẢNH DỰ ÁN")
    add_body_p(doc, "Dự án Klinik (MediCare) được xây dựng nhằm giải quyết bài toán quá tải bệnh viện, minh bạch hóa quy trình đặt hẹn khám bệnh và số hóa toàn diện hoạt động vận hành phòng khám y tế tư nhân.", "Bối cảnh thực tiễn: ")
    add_bullet_p(doc, "Đối với Bệnh nhân: ", "Xóa bỏ cảnh xếp hàng lấy số từ sáng sớm; hỗ trợ tìm bác sĩ đúng chuyên khoa, định vị phòng khám gần nhất qua bản đồ VietMap, nhận tư vấn sơ bộ từ Trợ lý AI và đặt lịch theo khung giờ trống 30 phút/slot.")
    add_bullet_p(doc, "Đối với Bác sĩ: ", "Quản lý ca khám trực quan qua Dashboard Chart.js, kiểm soát định mức tuần (tối thiểu 20h/tuần), tiếp nhận/xử lý lịch hẹn và in phiếu khám bệnh PDF chuẩn hóa.")
    add_bullet_p(doc, "Đối với Quản trị viên (Admin): ", "Toàn quyền quản lý danh bạ bác sĩ, cấp tài khoản có upload ảnh đại diện từ máy tính, phân bổ chuyên khoa, quản trị lịch hẹn toàn viện mà không cần can thiệp bất kỳ câu lệnh SQL nào.")

    # ==========================================
    # 2. LỊCH SỬ TIẾN TRÌNH THEO DÒNG COMMIT
    # ==========================================
    add_heading_1(doc, "2. LỊCH SỬ TIẾN TRÌNH PHÁT TRIỂN THEO DÒNG COMMIT (TỪ ĐẦU ĐẾN NAY)")
    add_body_p(doc, "Toàn bộ mã nguồn dự án được phát triển bài bản qua 15 commit trên nhánh main, phản ánh từng cột mốc hoàn thiện tính năng:", "Lịch sử commit: ")

    commit_headers = ["STT", "Commit Hash", "Ngày thực hiện", "Thông điệp & Nội dung triển khai chính"]
    commit_widths = [0.5, 1.1, 1.1, 4.0]
    commit_data = [
        ["1", "b2511a0", "18/10/2026", "first commit: Khởi tạo cấu trúc dự án monorepo gồm backend Spring Boot và frontend React Vite."],
        ["2", "3fe0176", "18/10/2026", "docs: add project and medical-appointment README: Bổ sung tài liệu cài đặt, hướng dẫn môi trường."],
        ["3", "fa5ca00", "25/10/2026", "chord :update db: Cập nhật cấu trúc cơ sở dữ liệu ban đầu cho các bảng nghiệp vụ."],
        ["4", "97c72fa", "25/10/2026", "feat: update database schema and add initial seed data: Hoàn thiện database dat_lich_kham_benh.sql, entity, repository, JasperReports, Kafka và Spring AI Pinecone RAG."],
        ["5", "0c9d2de", "25/10/2026", "feat: update frontend components and patient pages: Xây dựng giao diện trang chủ, danh bạ bác sĩ, bản đồ VietMap, trang đặt lịch khám, lịch sử hẹn, thanh toán VNPay và trợ lý AI."],
        ["6", "78e5bb9", "25/10/2026", "feat: add admin dashboard interface and protect doctor routes: Thiết lập khung làm việc Admin, bảo vệ các Private Routes cho Bác sĩ và Admin."],
        ["7", "96a727a", "25/10/2026", "feat: complete doctor account provisioning UI and backend management APIs: Xây dựng API quản trị bác sĩ, API lịch hẹn toàn viện, form cấp tài khoản bác sĩ mã hóa BCrypt."],
        ["8", "1d32802", "25/10/2026", "docs: update progress report and generate professional docx report: Soạn thảo báo cáo tiến độ TIEN_DO_HOAN_THIEN.md và script tạo file Word .docx."],
        ["9", "48c3937", "25/10/2026", "feat: add doctor account creation and avatar image upload: Bổ sung API POST /api/upload/image dạng multipart, tự động Geocoding tọa độ phòng khám."],
        ["10", "76bc2da", "25/10/2026", "feat: convert doctor provisioning into in-page dialog with local avatar upload: Chuyển cấp tài khoản bác sĩ sang Dialog Modal, xem trước ảnh tức thì, sinh mật khẩu ngẫu nhiên, sao chép phiếu bàn giao."],
        ["11", "cedc9fa", "25/10/2026", "feat: complete interactive API connections for all admin modules: Kết nối API 100% cho toàn bộ phân hệ Admin (Admin Dashboard KPI, cập nhật trạng thái lịch hẹn realtime, xóa bệnh nhân)."],
        ["12", "1049b02", "25/10/2026", "feat(admin): refactor Clean Architecture with AdminContext: Tái cấu trúc phân hệ Admin theo Clean Architecture, tách DoctorTable, DoctorProvisionDialog, Pagination."],
        ["13", "54b64ec", "26/10/2026", "feat(upload): store doctor avatars directly in backend images/ and serve via /images/**: Lưu ảnh trực tiếp vào backend images/ phục vụ tĩnh qua WebMvcConfigurer."],
        ["14", "1f7f911", "27/10/2026", "feat: auto-provision default doctor schedule, enforce weekly minimum hours compliance, and optimize patient booking date picker UX: Tự động cấp lịch trực chuẩn (35h/tuần, T2-T6) cho bác sĩ mới; áp dụng định mức >= 20h/tuần; hiển thị thứ trực tuần và gợi ý 4 ngày khám gần nhất cho bệnh nhân."],
        ["15", "acfeebb", "27/10/2026", "fix(appointment): optimize /api/appointment/save performance, fix blocking Kafka producer timeout, add comprehensive error handling, and implement BookingSuccessModal: Khắc phục lỗi treo 60s bằng async Kafka, chuẩn hóa 400 Bad Request, tạo modal BookingSuccessModal với voucher và tải PDF trực tiếp."]
    ]
    t_commits = doc.add_table(rows=len(commit_data) + 1, cols=4)
    format_table(t_commits, commit_widths, commit_headers, commit_data, header_bg="1E40AF")

    # ==========================================
    # 3. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ
    # ==========================================
    add_heading_1(doc, "3. KIẾN TRÚC HỆ THỐNG & DANH MỤC CÔNG NGHỆ")
    add_body_p(doc, "Hệ thống Klinik vận hành theo mô hình Client-Server phân tán hiện đại, kết hợp Kiến trúc Hướng sự kiện (Event-Driven) và Trí tuệ Nhân tạo tăng cường tri thức (RAG).", "Tổng quan công nghệ: ")

    tech_headers = ["Thành phần", "Công nghệ / Thư viện", "Vai trò và Ứng dụng trong Hệ thống"]
    tech_widths = [1.5, 1.8, 3.4]
    tech_data = [
        ["Frontend SPA", "React 19 + Vite 7\nTailwind CSS, React Router v7", "Giao diện đơn trang tốc độ cao, responsive đa thiết bị cho Bệnh nhân, Bác sĩ và Quản trị viên."],
        ["Backend Core", "Spring Boot 3.3.0\nJava 21, Spring Data JPA", "Cung cấp hệ thống RESTful API an toàn, xử lý logic nghiệp vụ y tế, phân quyền và kết nối CSDL."],
        ["Cơ sở dữ liệu", "MySQL 8.0\nPinecone Vector DB", "Lưu trữ dữ liệu quan hệ (người dùng, lịch hẹn, ca trực) và dữ liệu vector embedding tài liệu y khoa."],
        ["Bảo mật & Auth", "Spring Security\nBCrypt + Google OAuth 2.0", "Mã hóa mật khẩu 1 chiều, xác thực phiên làm việc, hỗ trợ đăng nhập 1 chạm an toàn bằng tài khoản Google."],
        ["Event-Driven", "Apache Kafka\n(CompletableFuture Async)", "Xử lý hàng đợi sự kiện đặt lịch/hủy lịch ngầm, kích hoạt tác vụ gửi email thông báo mà không nghẽn HTTP."],
        ["Bản đồ & GIS", "VietMap API + VietMap GL JS\nCông thức Haversine", "Geocoding địa chỉ phòng khám thành tọa độ; hiển thị bản đồ trực quan và tính số km thực tế đến bác sĩ."],
        ["Báo cáo Y tế", "JasperReports Engine\nDejaVu Sans Phông chữ", "Biên dịch và kết xuất phiếu khám bệnh chuẩn định dạng PDF hỗ trợ tiếng Việt có dấu hoàn chỉnh."],
        ["Trí tuệ nhân tạo", "Spring AI + OpenRouter API\n(Longcat / Qwen Chat Models)", "Trợ lý AI tư vấn triệu chứng y khoa ban đầu và đề xuất danh sách bác sĩ chuyên khoa phù hợp nhất."]
    ]
    t_tech = doc.add_table(rows=len(tech_data) + 1, cols=3)
    format_table(t_tech, tech_widths, tech_headers, tech_data, header_bg="0284C7")

    # ==========================================
    # 4. MA TRẬN PHÂN QUYỀN 4 VAI TRÒ
    # ==========================================
    add_heading_1(doc, "4. MA TRẬN PHÂN QUYỀN 4 VAI TRÒ NGƯỜI DÙNG")
    add_body_p(doc, "Hệ thống thiết lập ma trận kiểm soát truy cập nghiêm ngặt dựa trên vai trò (Role-Based Access Control - RBAC):", "Phân quyền người dùng: ")

    role_headers = ["Nhóm Chức Năng Nghiệp Vụ", "Khách (Guest)", "Bệnh Nhân", "Bác Sĩ", "Admin"]
    role_widths = [3.1, 0.9, 0.9, 0.9, 0.9]
    role_data = [
        ["Xem trang chủ, bài viết, danh bạ chuyên khoa", "Có", "Có", "Có", "Có"],
        ["Tìm kiếm danh sách bác sĩ, xem giá khám, hồ sơ", "Có", "Có", "Có", "Có"],
        ["Xem bản đồ số VietMap định vị phòng khám", "Có", "Có", "Có", "Có"],
        ["Trò chuyện với Trợ lý ảo AI & Gợi ý bác sĩ", "Có", "Có", "Có", "Có"],
        ["Đăng nhập 1 chạm qua Google OAuth 2.0", "Không", "Có", "Có", "Không"],
        ["Đặt lịch khám theo khung giờ khả dụng (BookableSlot)", "Không", "Có", "Không", "Không"],
        ["Thanh toán trực tuyến qua cổng VNPay Sandbox", "Không", "Có", "Không", "Không"],
        ["Quản lý lịch sử đặt khám, Dời ngày khám, Hủy hẹn", "Không", "Có", "Không", "Không"],
        ["Nhận phiếu xác nhận đặt lịch & In file PDF trực tiếp", "Không", "Có", "Không", "Không"],
        ["Doctor Dashboard: Thống kê KPI, biểu đồ Chart.js", "Không", "Không", "Có", "Không"],
        ["Cấu hình lịch làm việc tuần, theo dõi định mức >= 20h", "Không", "Không", "Có", "Không"],
        ["Tiếp nhận ca khám, Hoàn tất khám, Từ chối lịch hẹn", "Không", "Không", "Có", "Không"],
        ["In phiếu khám bệnh JasperReports PDF", "Không", "Không", "Có", "Không"],
        ["Nhận chuông thông báo thời gian thực khi có hẹn mới", "Không", "Không", "Có", "Không"],
        ["Admin Dashboard: Thống kê vận hành toàn phòng khám", "Không", "Không", "Không", "Có"],
        ["Cấp tài khoản Bác sĩ mới (Upload avatar từ thiết bị)", "Không", "Không", "Không", "Có"],
        ["Cập nhật hồ sơ bác sĩ, điều chuyển chuyên khoa công tác", "Không", "Không", "Không", "Có"],
        ["Cấp lại mật khẩu bác sĩ trực tiếp trên giao diện", "Không", "Không", "Không", "Có"],
        ["Xóa hồ sơ bác sĩ (Kiểm tra ràng buộc lịch hẹn)", "Không", "Không", "Không", "Có"],
        ["Quản lý lịch hẹn toàn viện (Duyệt/Đổi trạng thái realtime)", "Không", "Không", "Không", "Có"],
        ["Quản lý danh bạ bệnh nhân & Xóa hồ sơ bệnh nhân", "Không", "Không", "Không", "Có"]
    ]
    t_roles = doc.add_table(rows=len(role_data) + 1, cols=5)
    format_table(t_roles, role_widths, role_headers, role_data, header_bg="0F766E")

    # ==========================================
    # 5. CHI TIẾT CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI
    # ==========================================
    add_heading_1(doc, "5. CHI TIẾT CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI")
    
    add_heading_2(doc, "5.1. Phân hệ Bệnh nhân (Patient Portal)")
    add_bullet_p(doc, "Khám phá & Tìm kiếm Bác sĩ: ", "Bộ lọc đa tiêu chí theo chuyên khoa, kinh nghiệm, học hàm/học vị, mức viện phí; hỗ trợ tìm theo tên bác sĩ và địa chỉ phòng khám.")
    add_bullet_p(doc, "Bản đồ VietMap GIS: ", "Tự động geocoding vị trí phòng khám; tính số km thực tế từ vị trí bệnh nhân đến bác sĩ theo công thức Haversine và hiển thị trực quan trên bản đồ số.")
    add_bullet_p(doc, "Trải nghiệm Đặt lịch trực quan: ", "Hiển thị thứ trực tuần của bác sĩ, gợi ý 4 ngày khám gần nhất, cho phép đặt lịch trước 30 ngày theo khung giờ khả dụng 30 phút/slot.")
    add_bullet_p(doc, "Thanh toán & Xuất phiếu: ", "Tích hợp cổng VNPay Sandbox và thanh toán tại quầy; tự động mở modal BookingSuccessModal hiển thị mã lịch hẹn (sao chép 1 chạm) và tải file PDF tức thì.")
    add_bullet_p(doc, "Quản lý Lịch sử khám bệnh: ", "Theo dõi trạng thái lịch khám (Chờ duyệt, Đã duyệt, Đã khám, Đã hủy); dời lịch sang ngày/giờ mới không cần hủy lịch cũ; in phiếu PDF từ lịch sử.")

    add_heading_2(doc, "5.2. Phân hệ Bác sĩ (Doctor Portal)")
    add_bullet_p(doc, "Doctor Dashboard & Analytics: ", "Biểu đồ tròn tỷ lệ trạng thái lịch hẹn, biểu đồ kết hợp cột-đường thống kê doanh thu và lượt khám 12 tháng, tổng hợp chỉ số KPI tháng.")
    add_bullet_p(doc, "Quản lý Lịch làm việc tuần: ", "Đăng ký ca trực linh hoạt theo từng thứ; theo dõi thanh đo định mức tối thiểu (20h/tuần, 3 ngày/tuần); nút 1-click phục hồi lịch chuẩn 35h/tuần.")
    add_bullet_p(doc, "Xử lý Lịch hẹn & Hồ sơ bệnh nhân: ", "Tiếp nhận ca khám, xác nhận hoàn tất khám, từ chối kèm lý do; xem tiền sử bệnh án và triệu chứng của bệnh nhân.")
    add_bullet_p(doc, "Xuất phiếu khám bệnh PDF: ", "Tạo file PDF phiếu khám y tế chuyên nghiệp chuẩn mẫu JasperReports với phông chữ tiếng Việt DejaVu Sans.")
    add_bullet_p(doc, "Chuông thông báo thời gian thực: ", "Tự động nhận thông báo khi có bệnh nhân đặt lịch mới hoặc dời lịch khám.")

    add_heading_2(doc, "5.3. Phân hệ Quản trị viên phòng khám (Clinic Admin Portal)")
    add_bullet_p(doc, "Admin Dashboard: ", "Thống kê thời gian thực tổng số bác sĩ, chuyên khoa, lịch hẹn toàn viện, bệnh nhân đăng ký và ước tính doanh thu toàn phòng khám.")
    add_bullet_p(doc, "Quản lý danh sách Bác sĩ: ", "Giao diện bảng phân trang chuẩn mực, tìm kiếm theo tên/email/phone/địa chỉ, lọc theo chuyên khoa.")
    add_bullet_p(doc, "Cấp tài khoản Bác sĩ mới: ", "Modal in-page tiện lợi, upload ảnh đại diện từ máy tính, geocode địa chỉ, sinh mật khẩu an toàn, sao chép phiếu bàn giao và tự động sinh lịch làm việc 35h/tuần.")
    add_bullet_p(doc, "Cập nhật hồ sơ & Điều chuyển chuyên khoa: ", "Modal chỉnh sửa linh hoạt chuyên khoa công tác, mức giá khám, địa chỉ và ảnh đại diện.")
    add_bullet_p(doc, "Cấp lại mật khẩu trực tiếp: ", "Admin chủ động cấp mật khẩu mới cho bác sĩ kèm công cụ sinh chuỗi ngẫu nhiên và sao chép.")
    add_bullet_p(doc, "Quản trị Lịch hẹn toàn viện: ", "Xem tất cả lịch hẹn của mọi khoa, cập nhật trạng thái trực tiếp trên từng dòng qua Select Dropdown.")
    add_bullet_p(doc, "Quản lý Bệnh nhân: ", "Tra cứu danh bạ bệnh nhân đã đăng ký, xóa tài khoản không hoạt động.")

    add_heading_2(doc, "5.4. Trí tuệ Nhân tạo Y tế & RAG Engine")
    add_bullet_p(doc, "Trợ lý AI tư vấn triệu chứng: ", "Tích hợp OpenRouter LLM qua Spring AI, cung cấp phản hồi y khoa ban đầu và ghi nhớ ngữ cảnh hội thoại.")
    add_bullet_p(doc, "Kiến trúc RAG (Retrieval-Augmented Generation): ", "Lưu trữ vector embedding tài liệu y khoa và bác sĩ trên Pinecone; thực hiện semantic search lấy ngữ cảnh chính xác làm cơ sở cho mô hình LLM trả lời.")
    add_bullet_p(doc, "AI Doctor Suggestion: ", "Phân tích mô tả triệu chứng của bệnh nhân để tự động đề xuất 3 bác sĩ chuyên khoa phù hợp nhất kèm khoảng cách km cụ thể.")

    # ==========================================
    # 6. CHUYÊN ĐỀ: CÁC TÍNH NĂNG MỚI NHẤT
    # ==========================================
    add_heading_1(doc, "6. CHUYÊN ĐỀ: CÁC TÍNH NĂNG MỚI NHẤT ĐƯỢC BỔ SUNG & TỐI ƯU HÓA")
    add_body_p(doc, "Dưới đây là các nâng cấp đột phá vừa được hoàn thiện và tích hợp vào hệ thống trong các phiên bản gần nhất:", "Điểm nhấn nâng cấp: ")

    add_callout_box(doc, "1. Phân hệ Admin tương tác & Cấp tài khoản Bác sĩ (Thoát ly can thiệp SQL)",
                    "Trước đây, mọi thao tác thêm bác sĩ hay gán quyền đều phải can thiệp thủ công bằng câu lệnh SQL vào MySQL. "
                    "Hiện tại, phân hệ Admin đã hoàn thiện 100% với giao diện tương tác hiện đại tại /admin/doctors, "
                    "cho phép cấp tài khoản ngay trên web, mã hóa mật khẩu BCrypt tự động và bảo đảm toàn vẹn dữ liệu.",
                    bg_hex="EFF6FF", border_color="2563EB")

    add_callout_box(doc, "2. Upload ảnh đại diện trực tiếp từ máy tính (POST /api/upload/image)",
                    "Hỗ trợ người dùng chọn file ảnh từ máy tính hoặc điện thoại, hiển thị xem trước tức thì (preview) và "
                    "lưu trữ an toàn tại thư mục tĩnh images/ của backend, phục vụ công khai qua đường dẫn /images/**.",
                    bg_hex="F0FDF4", border_color="16A34A")

    add_callout_box(doc, "3. Tự động cấp lịch làm việc chuẩn (35 giờ/tuần) khi tạo bác sĩ",
                    "Khắc phục triệt để tình trạng bác sĩ mới tạo có lịch trống 100%. Khi Admin tạo bác sĩ, hệ thống tự động sinh "
                    "bộ lịch chuẩn Thứ Hai - Thứ Sáu, ca sáng 08:00-11:30, ca chiều 13:30-17:00 (tổng 35h/tuần), giúp bệnh nhân "
                    "có thể đặt khám ngay lập tức.",
                    bg_hex="FAF5FF", border_color="9333EA")

    add_callout_box(doc, "4. Ràng buộc tuân thủ định mức làm việc tối thiểu (>= 20h/tuần, >= 3 ngày/tuần)",
                    "Thiết lập quy chuẩn phòng khám: Bác sĩ phải trực tối thiểu 20h/tuần và tối thiểu 3 ngày/tuần. "
                    "Giao diện Doctor Portal tích hợp thanh đo tuân thủ (Compliance Banner) hiển thị thời gian thực số giờ trực "
                    "và số ngày trực kèm nút 1-click khôi phục lịch chuẩn 35h/tuần.",
                    bg_hex="FFFBEB", border_color="D97706")

    add_callout_box(doc, "5. Nâng cấp trải nghiệm Đặt lịch khám cho Bệnh nhân (Patient UX)",
                    "Loại bỏ hoàn toàn các pop-up alert chặn màn hình; hiển thị trực quan các thứ bác sĩ có lịch trực trong tuần; "
                    "gợi ý sẵn 4 ngày khám gần nhất có lịch; mở rộng phạm vi đặt lịch linh hoạt trước trong vòng 30 ngày.",
                    bg_hex="F0FDFA", border_color="0D9488")

    add_callout_box(doc, "6. Tối ưu hóa hiệu năng API POST /api/appointment/save & Async Kafka",
                    "Khắc phục triệt để lỗi treo 60 giây do Kafka offline bằng cách chuyển tiến trình gửi tin nhắn sang bất đồng bộ "
                    "(CompletableFuture.runAsync) với timeout 1.5s (API phản hồi chỉ 10-20ms). Chuẩn hóa xử lý ngoại lệ "
                    "trả về HTTP 400 Bad Request rõ ràng và bổ sung trọn bộ metadata (id, doctorName, specialtyName, price).",
                    bg_hex="FEF2F2", border_color="DC2626")

    add_callout_box(doc, "7. Phiếu xác nhận đặt lịch khám (BookingSuccessModal) & In PDF tức thì",
                    "Modal xác nhận sang trọng với hiệu ứng checkmark, hộp mã lịch hẹn nổi bật kèm nút sao chép 1 chạm, "
                    "nút 'Xem Lịch Sử Hẹn' và nút 'In Phiếu (PDF)' gọi trực tiếp reportService.downloadAppointment tải ngay file PDF.",
                    bg_hex="ECFDF5", border_color="059669")

    # ==========================================
    # 7. BẢNG TỔNG HỢP API ENDPOINTS
    # ==========================================
    add_heading_1(doc, "7. BẢNG TỔNG HỢP API ENDPOINTS TOÀN DIỆN")
    add_body_p(doc, "Danh mục toàn bộ các RESTful API được xây dựng và kiểm thử thành công trong hệ thống Klinik:", "Danh mục endpoints: ")

    api_headers = ["Phương Thức", "Đường Dẫn Endpoint", "Mô Tả Chức Năng Nghiệp Vụ", "Quyền"]
    api_widths = [0.9, 2.5, 2.7, 0.6]
    api_data = [
        ["POST", "/api/patient/login", "Đăng nhập tài khoản Bệnh nhân", "Public"],
        ["POST", "/api/patient/register", "Đăng ký tài khoản Bệnh nhân mới", "Public"],
        ["POST", "/api/patient/forgot_password", "Gửi mã OTP khôi phục mật khẩu qua Email", "Public"],
        ["POST", "/api/patient/reset_password", "Đặt lại mật khẩu mới với Token OTP", "Public"],
        ["POST", "/api/doctor/login", "Đăng nhập tài khoản Bác sĩ", "Public"],
        ["POST", "/api/doctor/google-login", "Đăng nhập Bác sĩ bằng Google ID Token", "Public"],
        ["GET", "/api/doctor/all", "Lấy danh sách tất cả bác sĩ đang công tác", "Public"],
        ["GET", "/api/doctor/{id}", "Lấy chi tiết hồ sơ bác sĩ theo ID", "Public"],
        ["GET", "/api/availability/schedule", "Lấy lịch làm việc theo thứ của bác sĩ", "Doctor"],
        ["POST", "/api/availability/update", "Cập nhật ca làm việc tuần của bác sĩ", "Doctor"],
        ["GET", "/api/availability/summary", "Lấy báo cáo định mức số giờ và số ngày trực tuần", "Doctor"],
        ["POST", "/api/availability/init-default", "Khôi phục bộ lịch làm việc chuẩn (35h/tuần)", "Doctor"],
        ["GET", "/api/bookable_slots/doctor/{id}/slots", "Lấy các khung giờ khám trống theo ngày", "Public"],
        ["POST", "/api/appointment/save", "Đặt lịch khám mới (offline & online VNPay)", "Patient"],
        ["GET", "/api/appointment/doctor/{doctorId}", "Lấy danh sách lịch hẹn của bác sĩ", "Doctor"],
        ["GET", "/api/appointment/patient/{patientId}", "Lấy lịch sử hẹn khám của bệnh nhân", "Patient"],
        ["PUT", "/api/appointment/reschedule/{id}", "Dời lịch khám sang ngày và giờ mới", "Patient"],
        ["PUT", "/api/appointment/status/{id}", "Cập nhật trạng thái lịch hẹn (confirmed, completed, rejected)", "Doctor"],
        ["GET", "/api/appointment/payment/result", "Webhook xử lý kết quả thanh toán từ VNPay", "Public"],
        ["POST", "/api/doctor/create", "Cấp tài khoản bác sĩ mới kèm phân khoa & BCrypt", "Admin"],
        ["POST", "/api/upload/image", "Upload ảnh đại diện bác sĩ từ thiết bị máy tính", "Admin"],
        ["PUT", "/api/doctor/admin/{id}", "Cập nhật thông tin bác sĩ & đổi chuyên khoa", "Admin"],
        ["PUT", "/api/doctor/admin/{id}/reset-password", "Cấp lại mật khẩu mới trực tiếp cho bác sĩ", "Admin"],
        ["DELETE", "/api/doctor/{id}", "Xóa hồ sơ bác sĩ có kiểm tra ràng buộc lịch hẹn", "Admin"],
        ["GET", "/api/appointment/all", "Lấy toàn bộ lịch hẹn của mọi khoa phục vụ Admin", "Admin"],
        ["PUT", "/api/appointment/admin/{id}/status", "Admin trực tiếp cập nhật trạng thái lịch hẹn", "Admin"],
        ["GET", "/api/patient/all", "Lấy danh bạ toàn bộ bệnh nhân đã đăng ký", "Admin"],
        ["DELETE", "/api/patient/admin/{id}", "Xóa hồ sơ bệnh nhân", "Admin"],
        ["GET", "/api/specialty/all", "Lấy danh mục chuyên khoa để phân bổ bác sĩ", "Public"],
        ["GET", "/dashboard/stats", "Thống kê các chỉ số KPI hoạt động của bác sĩ", "Doctor"],
        ["GET", "/api/report/appointment/{id}", "Xuất phiếu khám bệnh dạng file PDF (JasperReports)", "Doctor"],
        ["POST", "/api/ai/chat", "Trò chuyện với Trợ lý Y tế AI (OpenRouter LLM)", "Public"],
        ["POST", "/api/ai/suggest-doctors", "AI phân tích triệu chứng gợi ý bác sĩ kèm khoảng cách", "Public"],
        ["POST", "/api/rag-chat/ask", "Truy vấn y tế với RAG + Pinecone Vector Database", "Public"],
        ["GET", "/api/notification/doctor/{id}", "Lấy danh sách thông báo của bác sĩ", "Doctor"]
    ]
    t_api = doc.add_table(rows=len(api_data) + 1, cols=4)
    format_table(t_api, api_widths, api_headers, api_data, header_bg="1E40AF")

    # ==========================================
    # 8. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY
    # ==========================================
    add_heading_1(doc, "8. HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH & KHỞI CHẠY HỆ THỐNG")
    add_body_p(doc, "Hệ thống được đóng gói hoàn chỉnh và có thể khởi chạy dễ dàng trên máy trạm thông qua các bước:", "Quy trình triển khai: ")
    add_bullet_p(doc, "Bước 1 - Khởi tạo CSDL: ", "Tạo database MySQL dat_lich_kham_benh và import file schema database/dat_lich_kham_benh.sql.")
    add_bullet_p(doc, "Bước 2 - Khởi chạy Backend: ", "Mở terminal tại thư mục backend/, kiểm tra cấu hình application.properties và chạy lệnh: ./mvnw spring-boot:run (Backend chạy tại cổng 8080, Swagger UI tại /swagger-ui/index.html).")
    add_bullet_p(doc, "Bước 3 - Khởi chạy Frontend: ", "Mở terminal tại thư mục frontend/, chạy npm install và khởi động bằng lệnh: npm run dev (Frontend chạy tại cổng 5173).")
    add_bullet_p(doc, "Bước 4 - Truy cập phân hệ: ", "Bệnh nhân: http://localhost:5173 | Bác sĩ: http://localhost:5173/doctor/dashboard | Admin: http://localhost:5173/admin/dashboard.")

    # ==========================================
    # 9. KẾT LUẬN & ĐÁNH GIÁ ĐẠT ĐƯỢC
    # ==========================================
    add_heading_1(doc, "9. KẾT LUẬN & ĐÁNH GIÁ ĐẠT ĐƯỢC")
    add_body_p(doc, "Dự án Klinik (MediCare) đã hoàn thành xuất sắc 100% các mục tiêu đề ra, trở thành một nền tảng y tế số toàn diện, hiện đại và chuẩn mực. Toàn bộ các phân hệ từ Bệnh nhân, Bác sĩ cho đến Quản trị phòng khám đều hoạt động trơn tru, ổn định và sẵn sàng phục vụ thực tiễn.", "Tổng kết: ")

    # Save document
    doc.save(output_path)
    print(f"Report successfully saved to: {output_path}")

if __name__ == "__main__":
    out1 = "/Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/docs/BAO_CAO_TONG_QUAN_VA_TINH_NANG_DU_AN.docx"
    out2 = "/Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/docs/TONG_QUAN_VA_TINH_NANG_DU_AN.docx"
    generate_full_report(out1)
    generate_full_report(out2)
