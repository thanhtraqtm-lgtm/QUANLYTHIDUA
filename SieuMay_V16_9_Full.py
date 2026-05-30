# -*- coding: utf-8 -*-
"""
PM TỔNG HỢP V16.9 - HỆ THỐNG FULL CONTROL (SIÊU MÁY)
Phần mềm xử lý dữ liệu sáp nhập, kiểm toán và tổng hợp đa chỉ tiêu (Xã, Doanh thu, Lao động)
Phát triển trên nền tảng Python CustomTkinter cao cấp định dạng giao diện đồng bộ.
"""

import os
import re
import queue
import sqlite3
import threading
import unicodedata
import difflib
from datetime import datetime
from tkinter import filedialog, messagebox, ttk
import customtkinter as ctk
import pandas as pd

# Thiết lập chế độ giao diện
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

# --- DANH MỤC NGÀNH KINH TẾ (VSIC) ĐỂ TỰ ĐỘNG GIẢI MÃ ---
LEVEL_1_SECTORS = {
    'A': 'Nông nghiệp, lâm nghiệp và thủy sản',
    'B': 'Khai khoáng',
    'C': 'Công nghiệp chế biến, chế tạo',
    'D': 'Sản xuất và phân phối điện, khí đốt, nước nóng, hơi nước...',
    'E': 'Cung cấp nước; hoạt động quản lý và xử lý rác thải, nước thải',
    'F': 'Xây dựng',
    'G': 'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, môtô...',
    'H': 'Vận tải kho bãi',
    'I': 'Dịch vụ lưu trú và ăn uống',
    'J': 'Thông tin và truyền thông',
    'K': 'Hoạt động tài chính, ngân hàng và bảo hiểm',
    'L': 'Hoạt động kinh doanh bất động sản',
    'M': 'Hoạt động chuyên môn, khoa học và công nghệ',
    'N': 'Hoạt động hành chính và dịch vụ hỗ trợ',
    'O': 'Hoạt động của khối chính quyền, quốc phòng, an ninh...',
    'P': 'Giáo dục và đào tạo',
    'Q': 'Y tế và hoạt động trợ giúp xã hội',
    'R': 'Nghệ thuật, vui chơi và giải trí',
    'S': 'Hoạt động dịch vụ khác',
    'T': 'Hoạt động hộ gia đình có thuê lao động...',
    'U': 'Hoạt động của các tổ chức và cơ quan quốc tế'
}

LEVEL_2_SECTORS = {
    '01': 'Trồng trọt, chăn nuôi và dịch vụ nông nghiệp liên quan',
    '02': 'Lâm nghiệp và hoạt động dịch vụ lâm nghiệp liên quan',
    '03': 'Khai thác, nuôi trồng và dịch vụ thủy sản',
    '05': 'Khai thác than cứng và than non',
    '06': 'Khai thác dầu thô và khí đốt tự nhiên',
    '07': 'Khai thác quặng kim loại',
    '08': 'Khai khoáng khác',
    '09': 'Hoạt động dịch vụ hỗ trợ khai thác mỏ và quặng',
    '10': 'Chế biến thực phẩm (thịt, sữa, thủy sản, bột, rau quả)',
    '11': 'Sản xuất đồ uống (rượu, bia, nước ngọt)',
    '12': 'Sản xuất sản phẩm thuốc lá',
    '13': 'Dệt, gia công sợi, nhuộm vải',
    '14': 'Sản xuất trang phục, quần áo thời trang',
    '15': 'Sản xuất da, giày dép, túi xách hiệu',
    '16': 'Chế biến gỗ, lâm sản; sản xuất đồ mây tre đan',
    '17': 'Sản xuất giấy, bột giấy và bao bì sản phẩm',
    '18': 'In ấn, sao chép bản ghi các loại',
    '19': 'Sản xuất than cốc, lọc hóa dầu tinh chế',
    '20': 'Sản xuất hóa chất, phân bón và sản phẩm hóa chất',
    '21': 'Sản xuất thuốc, dược phẩm và dược liệu y tế',
    '22': 'Sản xuất sản phẩm từ cao su và plastic',
    '23': 'Sản xuất sản phẩm chất khoáng phi kim loại (xi măng, gạch)',
    '24': 'Sản xuất kim loại (sắt, thép, đồng)',
    '25': 'Sản xuất sản phẩm từ kim loại đúc sẵn (ốc vít, cửa sắt)',
    '26': 'Sản xuất linh kiện điện tử, máy tính và thiết bị quang học',
    '27': 'Sản xuất thiết bị điện (máy biến thế, dây cáp điện)',
    '28': 'Sản xuất máy móc, thiết bị công nông nghiệp',
    '29': 'Sản xuất ô tô, săm lốp và rơ moóc xe có động cơ',
    '30': 'Sản xuất phương tiện vận tải đường thủy, đường sắt, hàng không',
    '31': 'Sản xuất giường, tủ, bàn, ghế gia đình',
    '32': 'Công nghiệp chế biến, chế tạo khác (đồ chơi, vàng bạc)',
    '33': 'Sửa chữa, bảo dưỡng và lắp đặt máy móc thiết bị nhà xưởng',
    '35': 'Sản xuất, truyền tải và phân phối điện năng, khí hơi',
    '36': 'Khai thác, xử lý và cung cấp nước sinh hoạt',
    '37': 'Thoát nước và xử lý nước thải công nghiệp',
    '38': 'Thu gom rác thải; tái chế phế liệu bảo vệ môi trường',
    '39': 'Xử lý ô nhiễm và hoạt động quản lý chất thải khác',
    '41': 'Xây dựng nhà ở, văn phòng, chung cư',
    '42': 'Xây dựng công trình cầu đường, đường sắt, cảng biển',
    '43': 'Hoạt động xây dựng hoàn thiện chuyên dụng (sơn, điện nước)',
    '45': 'Bán, bảo dưỡng sửa chữa ô tô, xe máy',
    '46': 'Bán buôn bán sỉ, đại lý phân phối hàng hóa',
    '47': 'Bán lẻ cửa hàng tạp hóa, siêu thị, bán lẻ xăng dầu',
    '49': 'Vận tải đường bộ xe khách, xe tải chở hàng và đường ống',
    '50': 'Vận tải đường thủy ven biển và viễn dương',
    '51': 'Vận tải hàng không nội địa và quốc tế',
    '52': 'Kho bãi bốc dỡ hàng hóa và dịch vụ logistics hỗ trợ vận tải',
    '53': 'Bưu chính chuyển phát nhanh thư từ, bưu phẩm',
    '55': 'Dịch vụ cư trú khách sạn, nhà nghỉ, homestay nghỉ dưỡng',
    '56': 'Dịch vụ ăn uống quán ăn, nhà hàng tiệc cưới, quán cà phê',
    '58': 'Hoạt động xuất bản sách báo, phần mềm trò chơi',
    '59': 'Sản xuất phim, ghi âm âm nhạc và phát hành băng đĩa',
    '60': 'Hoạt động truyền hình phát thanh trực tuyến',
    '61': 'Viễn thông có dây và không dây internet',
    '62': 'Lập trình máy tính, thiết kế phần mềm và quản trị hệ thống',
    '63': 'Dịch vụ cổng thông tin điện tử, xử lý dữ liệu đám mây',
    '64': 'Dịch vụ tín dụng ngân hàng, quỹ tín dụng nhân dân',
    '65': 'Bảo hiểm nhân thọ, phi nhân thọ và tái bảo hiểm',
    '66': 'Tư vấn chứng khoán, định giá tài sản tài chính hỗ trợ',
    '68': 'Kinh doanh bất động sản, mua bán cho thuê nhà đất',
    '69': 'Dịch vụ pháp lý luật sư, công chứng và kế toán kiểm toán',
    '70': 'Tự quản lý văn phòng đại diện chính, tư vấn chiến lược',
    '71': 'Thiết kế kiến trúc xây dựng; kiểm tra chất lượng kỹ thuật',
    '72': 'Nghiên cứu khoa học và phát triển công nghệ sinh học',
    '73': 'Quảng cáo biểu diễn và nghiên cứu thị trường dư luận',
    '74': 'Hoạt động dịch vụ chuyên môn, khoa học công cộng khác',
    '75': 'Hoạt động thú y, chăm sóc vật nuôi',
    '77': 'Cho thuê ô tô, máy móc thi công xây dựng văn phòng',
    '78': 'Dịch vụ giới thiệu việc làm, cung cấp lao động thời vụ',
    '79': 'Đại lý du lịch lữ hành quốc tế và nội địa',
    '80': 'Dịch vụ bảo vệ an ninh tuần tra bảo vệ tòa nhà',
    '81': 'Vệ sinh công nghiệp nhà xưởng; chăm sóc vườn hoa công viên',
    '82': 'Hội thảo sự kiện lớn, dịch vụ photocopy hỗ trợ văn phòng',
    '84': 'Quản lý nhà nước, an ninh quốc phòng vững mạnh',
    '85': 'Giáo dục phổ thông, cao đẳng đại học và đào tạo nghề',
    '86': 'Hoạt động bệnh viện tuyến đầu, phòng khám đa khoa',
    '87': 'Chăm sóc y tế điều dưỡng dưỡng lão tập trung',
    '88': 'Hoạt động trợ giúp xã hội từ thiện, cứu trợ thiên tai',
    '90': 'Sáng tác nghệ thuật, thư viện, bảo tàng trưng bày',
    '91': 'Hoạt động bảo tồn thiên nhiên, thảo cầm viên sinh thái',
    '92': 'Hoạt động xổ số kiến thiết, casino vui chơi giải trí',
    '93': 'Hoạt động thể thao sân bóng, gym fitness, khu giải trí khác',
    '94': 'Hoạt động của hiệp hội doanh nghiệp, tôn giáo, chính trị',
    '95': 'Sửa chữa điện thoại di động, điện gia dụng trong gia đình',
    '96': 'Dịch vụ tắm hơi, spa làm đẹp, hớt tóc thẩm mỹ khác',
    '97': 'Dịch vụ thuê người giúp việc phục vụ nhà ở',
    '98': 'Hoạt động sản xuất nông lâm tự tiêu tự cung hộ gia đình',
    '99': 'Hoạt động của các tổ chức ngoại giao đại sứ quán quốc tế'
}


# --- TRỢ GIÚP ĐỊNH CỘT VÀ GIẢI MÃ VSIC ---
def strip_vietnamese_accent(s: str) -> str:
    s = str(s).strip().replace("Đ", "D").replace("đ", "d")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[\s_\-]+", "", s.lower())


def clean_normalize_text(text: str) -> str:
    if not text:
        return ""
    # Chuyển thành chữ thường
    s = str(text).strip().lower()
    # Chuyển chữ đ / Đ
    s = s.replace("đ", "d").replace("Đ", "D")
    # Khử dấu tiếng Việt
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    # Lọc bỏ ký tự đặc biệt, chỉ giữ ký tự chữ và số
    s = re.sub(r"[^\w\s]", " ", s)
    # Loại bỏ các từ đệm phổ biến trong tên ngành kinh tế để tránh nhiễu phân tích
    stop_words = ["hoat", "dong", "dich", "vu", "san", "xuat", "ban", "buon", "ban", "le", "nganh", "khac", "va", "co", "lien", "quan", "truc", "tiep"]
    words = s.split()
    filtered_words = [w for w in words if w not in stop_words]
    if not filtered_words:
        filtered_words = words
    return " ".join(filtered_words)


def calc_text_similarity(str1: str, str2: str) -> float:
    s1 = clean_normalize_text(str1)
    s2 = clean_normalize_text(str2)
    if not s1 or not s2:
        return 0.0
    return difflib.SequenceMatcher(None, s1, s2).ratio()


def get_level_2(level5: str) -> tuple[str, str]:
    if not level5:
        return "OTHER", "Ngành cấp 2 khác"
    code5 = str(level5).strip().zfill(5)
    div2 = code5[:2]
    return div2, LEVEL_2_SECTORS.get(div2, f"Mã ngành cấp 2 nhóm {div2}")


def get_level_1(level5: str) -> tuple[str, str]:
    if not level5:
        return "OTHER", "Ngành cấp 1 khác"
    code5 = str(level5).strip().zfill(5)
    div2_str = code5[:2]
    try:
        div = int(div2_str)
    except ValueError:
        first = code5[0].upper()
        return (first, LEVEL_1_SECTORS.get(first, "Ngành khác"))

    letter = "OTHER"
    if 1 <= div <= 3: letter = 'A'
    elif 5 <= div <= 9: letter = 'B'
    elif 10 <= div <= 33: letter = 'C'
    elif div == 35: letter = 'D'
    elif 36 <= div <= 39: letter = 'E'
    elif 41 <= div <= 43: letter = 'F'
    elif 45 <= div <= 47: letter = 'G'
    elif 49 <= div <= 53: letter = 'H'
    elif 55 <= div <= 56: letter = 'I'
    elif 58 <= div <= 63: letter = 'J'
    elif 64 <= div <= 66: letter = 'K'
    elif div == 68: letter = 'L'
    elif 69 <= div <= 75: letter = 'M'
    elif 77 <= div <= 82: letter = 'N'
    elif div == 84: letter = 'O'
    elif div == 85: letter = 'P'
    elif 86 <= div <= 88: letter = 'Q'
    elif 90 <= div <= 93: letter = 'R'
    elif 94 <= div <= 96: letter = 'S'
    elif 97 <= div <= 98: letter = 'T'
    elif div == 99: letter = 'U'

    return letter, LEVEL_1_SECTORS.get(letter, "Ngành khác / Chưa phân loại")


class SieuMay_V16_9_Full(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("PM TỔNG HỢP V16.9 - HỆ THỐNG FULL CONTROL")
        self.geometry("1400x900")
        
        # Thư mục cơ sở dữ liệu để persistent
        self.db_folder = "KHO_DATA"
        os.makedirs(self.db_folder, exist_ok=True)
        self.db_path = os.path.join(self.db_folder, "data.db")
        self.init_sqlite()

        # Biến giữ dữ liệu
        self.df_working = None  # File vừa tải lên tạm thời
        self.df1 = None         # Kho 1: File doanh nghiệp / cơ sở
        self.df2 = None         # Kho 2: Danh bạ, hoặc Từ điển ngành cấp 5
        self.df_merged = None   # Kết quả ghép nối tổng hợp cuối cùng
        self.df_agg = None      # Dữ liệu phân tách tổ chức cấp 1/2/5
        self.selected_audit_id = None  # Bản ghi đang được chọn thanh tra

        self.task_queue = queue.Queue()
        self.setup_ui()
        self.setup_styles()
        self.after(100, self.process_queue)
        
        # Load lịch sử từ SQLite nếu có sẵn
        self.try_autoload_from_db()

    def setup_styles(self):
        # Định nghĩa style cho ttk Treeview hiện đại hơn
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview",
                        background="#ffffff",
                        foreground="#1e293b",
                        rowheight=26,
                        fieldbackground="#ffffff",
                        font=("Segoe UI", 10))
        style.configure("Treeview.Heading",
                        background="#f1f5f9",
                        foreground="#0f172a",
                        font=("Segoe UI", 10, "bold"),
                        borderwidth=1)
        style.map("Treeview", background=[("selected", "#e2e8f0")], foreground=[("selected", "#0f172a")])

        # Màu cảnh báo cho các nhãn hàng
        self.trees["Kho 1"].tag_configure("red_flag", background="#fee2e2", foreground="#991b1b")
        self.trees["Kho 2"].tag_configure("red_flag", background="#fee2e2", foreground="#991b1b")
        self.trees["Kết quả"].tag_configure("red_flag", background="#fee2e2", foreground="#991b1b")
        self.trees["Kết quả"].tag_configure("yellow_flag", background="#fef3c7", foreground="#92400e")
        self.trees["Kết quả"].tag_configure("green_flag", background="#d1fae5", foreground="#065f46")

    def init_sqlite(self):
        """Khởi tạo cấu trúc bảng lưu trữ thông tin kiểm toán bền vững."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            # Bảng chứa thông tin cờ và ghi chú kiểm toán của kiểm toán viên
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_marks (
                    ma_dn TEXT PRIMARY KEY,
                    marked_color TEXT,
                    marked_note TEXT,
                    updated_at TEXT
                )
            """)
            # Bảng lưu tạm file kho 1 và kho 2 để tự động phục hồi khi mở app
            cursor.execute("CREATE TABLE IF NOT EXISTS system_state (key TEXT PRIMARY KEY, value TEXT)")
            conn.commit()
            conn.close()
        except Exception as e:
            print("Lỗi tạo db SQLite local:", e)

    def save_audit_note_to_db(self, ma_dn, color, note):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            now_str = datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO audit_marks (ma_dn, marked_color, marked_note, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(ma_dn) DO UPDATE SET
                    marked_color=excluded.marked_color,
                    marked_note=excluded.marked_note,
                    updated_at=excluded.updated_at
            """, (ma_dn, color, note, now_str))
            conn.commit()
            conn.close()
        except Exception as e:
            print("Không thể lưu trạng thái kiểm toán dòng:", e)

    def load_all_audit_marks(self):
        marks = {}
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT ma_dn, marked_color, marked_note FROM audit_marks")
            for row in cursor.fetchall():
                marks[row[0]] = {"color": row[1], "note": row[2]}
            conn.close()
        except Exception as e:
            print("Không thể tải thông tin cờ:", e)
        return marks

    def try_autoload_from_db(self):
        def worker():
            try:
                conn = sqlite3.connect(self.db_path)
                # Tải Kho 1
                try:
                    df1_stored = pd.read_sql("SELECT * FROM data_table_1", conn)
                    if not df1_stored.empty:
                        self.df1 = df1_stored
                        self.task_queue.put({'type': 'update_tree', 'name': 'Kho 1', 'df': self.df1})
                except:
                    pass

                # Tải Kho 2
                try:
                    df2_stored = pd.read_sql("SELECT * FROM data_table_2", conn)
                    if not df2_stored.empty:
                        self.df2 = df2_stored
                        self.task_queue.put({'type': 'update_tree', 'name': 'Kho 2', 'df': self.df2})
                except:
                    pass

                conn.close()
                
                # Tự động kết nối luôn nếu hai kho đều đã có
                if self.df1 is not None and self.df2 is not None:
                    self.perform_calculation_and_merge()
            except Exception as e:
                print("Autoload states failed:", e)
        threading.Thread(target=worker, daemon=True).start()

    def setup_ui(self):
        # Sidebar điều khiển chính
        self.sidebar = ctk.CTkFrame(self, width=280, corner_radius=0, fg_color="#0f172a")
        self.sidebar.pack(side="left", fill="y")
        
        # Tiêu đề sidebar
        lbl_title = ctk.CTkLabel(self.sidebar, text="SIÊU MÁY V16.9", font=("Segoe UI", 20, "bold"), text_color="#38bdf8")
        lbl_title.pack(pady=(20, 5), padx=20)
        lbl_sub = ctk.CTkLabel(self.sidebar, text="Hệ thống Sáp nhập dữ liệu sạch", font=("Segoe UI", 11), text_color="#94a3b8")
        lbl_sub.pack(pady=(0, 20), padx=20)

        # Danh sách các nút tác vụ sang xịn mịn
        self.btn_load_1 = ctk.CTkButton(self.sidebar, text="📥 Nạp mới dữ liệu", command=self.smart_loader, height=42, fg_color="#1e293b", hover_color="#334155")
        self.btn_load_1.pack(pady=6, padx=20, fill="x")

        self.btn_save_db1 = ctk.CTkButton(self.sidebar, text="💾 Ghi nhớ vào Kho 1", command=lambda: self.save_to_db(1), height=42, fg_color="#0369a1", hover_color="#0284c7")
        self.btn_save_db1.pack(pady=6, padx=20, fill="x")

        self.btn_save_db2 = ctk.CTkButton(self.sidebar, text="💾 Ghi nhớ vào Kho 2 (Từ điển)", command=lambda: self.save_to_db(2), height=42, fg_color="#0f766e", hover_color="#0d9488")
        self.btn_save_db2.pack(pady=6, padx=20, fill="x")

        self.btn_load_store1 = ctk.CTkButton(self.sidebar, text="📂 Sục hồi Kho 1 đã lưu", command=lambda: self.load_from_db(1), height=42, fg_color="#1e293b", hover_color="#334155")
        self.btn_load_store1.pack(pady=6, padx=20, fill="x")

        self.btn_load_store2 = ctk.CTkButton(self.sidebar, text="📂 Sục hồi Kho 2 đã lưu", command=lambda: self.load_from_db(2), height=42, fg_color="#1e293b", hover_color="#334155")
        self.btn_load_store2.pack(pady=6, padx=20, fill="x")

        self.btn_run_merge = ctk.CTkButton(self.sidebar, text="📊 Chạy Sáp nhập & Tổng hợp", command=self.smart_aggregate_router, height=45, fg_color="#4f46e5", hover_color="#4338ca", font=("Segoe UI", 12, "bold"))
        self.btn_run_merge.pack(pady=15, padx=20, fill="x")

        self.btn_export = ctk.CTkButton(self.sidebar, text="🚀 Xuất Excel Đa tầng (.xlsx)", command=self.export_final, height=45, fg_color="#059669", hover_color="#059669", font=("Segoe UI", 12, "bold"))
        self.btn_export.pack(pady=6, padx=20, fill="x")

        # Nút xóa trắng database
        self.btn_clear_all = ctk.CTkButton(self.sidebar, text="🗑️ Đặt lại CSDL (Xóa hết)", command=self.clear_all_caches, height=35, fg_color="#991b1b", hover_color="#7f1d1d")
        self.btn_clear_all.pack(side="bottom", pady=25, padx=20, fill="x")

        # Khối hiển thị bên phải
        self.main_view = ctk.CTkFrame(self, corner_radius=0, fg_color="#f8fafc")
        self.main_view.pack(side="right", fill="both", expand=True)

        # Tabview quan sát dữ liệu các bảng
        self.tabview = ctk.CTkTabview(self.main_view, fg_color="#ffffff", text_color="#1e293b", segmented_button_selected_color="#4f46e5")
        self.tabview.pack(fill="both", expand=True, padx=12, pady=(10, 5))
        
        self.trees = {
            "Kho 1": self.setup_tree(self.tabview.add("Danh sách Kho 1")),
            "Kho 2": self.setup_tree(self.tabview.add("Từ điển Kho 2")),
            "Kết quả": self.setup_tree(self.tabview.add("Kết quả sáp nhập & Kiểm toán", ))
        }
        
        # Bổ sung bộ lọc điều khiển nhanh cho danh sách kết quả sáp nhập
        filter_panel = ctk.CTkFrame(self.tabview.tab("Kết quả sáp nhập & Kiểm toán"), height=55, fg_color="#f8fafc", border_width=1, border_color="#e2e8f0")
        filter_panel.pack(side="top", fill="x", padx=5, pady=5)

        lbl_filter_xa = ctk.CTkLabel(filter_panel, text="Địa bàn Xã:", font=("Segoe UI", 11, "bold"))
        lbl_filter_xa.grid(row=0, column=0, padx=(10, 2), pady=10, sticky="w")
        self.combo_xa = ctk.CTkComboBox(filter_panel, values=["Tất cả"], width=130, command=self.trigger_interactive_filter)
        self.combo_xa.grid(row=0, column=1, padx=5, pady=10)

        lbl_filter_dt = ctk.CTkLabel(filter_panel, text="Mức Doanh thu (Trđ):", font=("Segoe UI", 11, "bold"))
        lbl_filter_dt.grid(row=0, column=2, padx=(15, 2), pady=10, sticky="w")
        self.combo_dt = ctk.CTkComboBox(filter_panel, values=["Tất cả", "Có doanh thu >0", "Doanh thu nhỏ (<100 Trđ)", "Doanh thu lớn (>=1000 Trđ)", "Rỗng/Bằng 0"], width=160, command=self.trigger_interactive_filter)
        self.combo_dt.grid(row=0, column=3, padx=5, pady=10)

        lbl_filter_ld = ctk.CTkLabel(filter_panel, text="Quy mô Nhân sự:", font=("Segoe UI", 11, "bold"))
        lbl_filter_ld.grid(row=0, column=4, padx=(15, 2), pady=10, sticky="w")
        self.combo_ld = ctk.CTkComboBox(filter_panel, values=["Tất cả", "Rỗng hoặc bằng 0", "Siêu nhỏ (1-5 người)", "Vừa và lớn (>5 người)"], width=150, command=self.trigger_interactive_filter)
        self.combo_ld.grid(row=0, column=5, padx=5, pady=10)

        lbl_filter_flag = ctk.CTkLabel(filter_panel, text="Bộ lọc Cờ:", font=("Segoe UI", 11, "bold"))
        lbl_filter_flag.grid(row=0, column=6, padx=(15, 2), pady=10, sticky="w")
        self.combo_flag = ctk.CTkComboBox(filter_panel, values=["Tất cả dòng", "Bị cắm cờ (🔴 hoặc 🟡)", "🔴 Cờ Đỏ (Nguy hiểm / Sai mã)", "🟡 Cờ Vàng (Dị biệt)", "🟢 Cờ Xanh (Phê duyệt sạch)", "⚠️ Chưa khớp mã từ điển"], width=170, command=self.trigger_interactive_filter)
        self.combo_flag.grid(row=0, column=7, padx=5, pady=10)

        # Thanh bổ sung tính năng kiểm toán cục bộ từng dòng ngay trong tkinter
        self.setup_audit_panel()

        # Tiến trình và thanh trạng thái dưới chân
        self.progress_bar = ctk.CTkProgressBar(self.main_view, mode="indeterminate", height=6)
        self.progress_bar.pack(side="bottom", fill="x", padx=15, pady=(5, 5))
        self.progress_bar.set(0)
        
        status_bar = ctk.CTkFrame(self.main_view, height=30, fg_color="#f1f5f9", corner_radius=0)
        status_bar.pack(side="bottom", fill="x")
        self.lbl_status = ctk.CTkLabel(status_bar, text="Sẵn sàng tiếp nhận dữ liệu", font=("Segoe UI", 12), text_color="#475569")
        self.lbl_status.pack(pady=4)

    def setup_tree(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="#ffffff")
        frame.pack(fill="both", expand=True, padx=2, pady=2)
        
        scroll_y = ttk.Scrollbar(frame, orient="vertical")
        scroll_x = ttk.Scrollbar(frame, orient="horizontal")
        
        tree = ttk.Treeview(frame, show='headings', yscrollcommand=scroll_y.set, xscrollcommand=scroll_x.set)
        
        scroll_y.config(command=tree.yview)
        scroll_y.pack(side="right", fill="y")
        
        scroll_x.config(command=tree.xview)
        scroll_x.pack(side="bottom", fill="x")
        
        tree.pack(side="left", fill="both", expand=True)
        return tree

    def setup_audit_panel(self):
        """Khung kiểm duyệt và sửa lỗi cho bản ghi đang chọn ôn hòa."""
        audit_tab = self.tabview.tab("Kết quả sáp nhập & Kiểm toán")
        
        # Bọc khu vực thao tác kiểm duyệt phía cuối
        audit_frame = ctk.CTkFrame(audit_tab, height=140, fg_color="#f8fafc", border_width=1, border_color="#cbd5e1")
        audit_frame.pack(side="bottom", fill="x", padx=5, pady=5)
        
        # Label tiêu đề
        lbl_audit_sub = ctk.CTkLabel(audit_frame, text="🔎 SIÊU ÂM DỮ LIỆU & KIỂM CHUẨN ĐIỂM DỊ BIỆT DÒNG", font=("Segoe UI", 12, "bold"), text_color="#1e3a8a")
        lbl_audit_sub.grid(row=0, column=0, columnspan=4, padx=15, pady=(8, 2), sticky="w")
        
        lbl_info_dn = ctk.CTkLabel(audit_frame, text="Mã DN đề nghị kiểm tra: Chưa chọn dòng", font=("Segoe UI", 11, "bold"), text_color="#475569")
        lbl_info_dn.grid(row=1, column=0, columnspan=2, padx=15, pady=2, sticky="w")
        self.lbl_active_ma_dn = lbl_info_dn

        # Phân loại cờ sắc nét
        lbl_select_flag = ctk.CTkLabel(audit_frame, text="Cấp độ Nhãn Kiểm duyệt:", font=("Segoe UI", 11, "bold"))
        lbl_select_flag.grid(row=2, column=0, padx=15, pady=5, sticky="w")
        self.combo_audit_color = ctk.CTkComboBox(audit_frame, values=["🔴 Cờ Đỏ (Nguy hiểm / Sai mã)", "🟡 Cờ Vàng (Nghi ngờ dị biệt)", "🟢 Cờ Xanh (Phê duyệt sạch)", "⚪ Bình thường / Tháo cờ"], width=230)
        self.combo_audit_color.grid(row=2, column=1, padx=5, pady=5, sticky="w")

        # Ghi chú kiểm toán viên
        lbl_select_note = ctk.CTkLabel(audit_frame, text="Nhận định / Hành động sửa chữa:", font=("Segoe UI", 11, "bold"))
        lbl_select_note.grid(row=2, column=2, padx=15, pady=5, sticky="w")
        self.txt_audit_note = ctk.CTkEntry(audit_frame, width=420, placeholder_text="Ví dụ: Sai lệch doanh thu gấp 10 lần thực tế, đã sửa đổi...", font=("Segoe UI", 11))
        self.txt_audit_note.grid(row=2, column=3, padx=5, pady=5, sticky="w")

        # Nút áp dụng sửa đổi cờ
        btn_apply_audit = ctk.CTkButton(audit_frame, text="💾 Lưu phê chuẩn kiểm tra dòng", command=self.apply_audit_row_changes, width=220, height=35, fg_color="#10b981", hover_color="#059669")
        btn_apply_audit.grid(row=2, column=4, padx=15, pady=5, sticky="e")

        # Lắng nghe sự kiện click dòng kết quả
        self.trees["Kết quả"].bind("<<TreeviewSelect>>", self.on_select_result_row)

    def on_select_result_row(self, event):
        selected = self.trees["Kết quả"].selection()
        if not selected:
            return
        row_id = selected[0]
        values = self.trees["Kết quả"].item(row_id, "values")
        if not values or len(values) < 4:
            return
        
        # Ma DN ở cột thứ 3 (index 2) trong thứ tự hiển thị
        ma_dn = values[2]
        self.selected_audit_id = ma_dn
        self.lbl_active_ma_dn.configure(text=f"Mã DN đang kiểm chuẩn: {ma_dn} | Khởi tạo từ: Phường/Xã: {values[1]}")
        
        # Tải lại cờ nếu đã từng lưu kiểm duyệt trong quá khứ
        marks = self.load_all_audit_marks()
        if ma_dn in marks:
            mark_info = marks[ma_dn]
            color_db = mark_info["color"]
            note_db = mark_info["note"] or ""
            
            # Map ngược sang combo
            if color_db == "red":
                self.combo_audit_color.set("🔴 Cờ Đỏ (Nguy hiểm / Sai mã)")
            elif color_db == "yellow":
                self.combo_audit_color.set("🟡 Cờ Vàng (Nghi ngờ dị biệt)")
            elif color_db == "green":
                self.combo_audit_color.set("🟢 Cờ Xanh (Phê duyệt sạch)")
            else:
                self.combo_audit_color.set("⚪ Bình thường / Tháo cờ")
                
            self.txt_audit_note.delete(0, 'end')
            self.txt_audit_note.insert(0, note_db)
        else:
            # Check lỗi tự động của hệ thống để gợi ý ghi chú kiểm duyệt
            is_unmapped = (values[4] == "Chưa xác định")
            try:
                dt_val = float(values[9])
                ld_val = float(values[10])
            except:
                dt_val, ld_val = 0.0, 0.0

            auto_note = ""
            if is_unmapped:
                self.combo_audit_color.set("🔴 Cờ Đỏ (Nguy hiểm / Sai mã)")
                auto_note = "Lỗi nghiêm trọng: Mã ngành cấp 5 chưa được liên kết / Sai mã ngành"
            elif dt_val > 5000 and ld_val == 0:
                self.combo_audit_color.set("🟡 Cờ Vàng (Nghi ngờ dị biệt)")
                auto_note = "Hệ thống cảnh báo: Doanh thu rất lớn nhưng báo cáo nhân sự rỗng"
            else:
                self.combo_audit_color.set("⚪ Bình thường / Tháo cờ")
                
            self.txt_audit_note.delete(0, 'end')
            self.txt_audit_note.insert(0, auto_note)

    def apply_audit_row_changes(self):
        """Khắc ghi trực tiếp trạng thái cờ xuống SQLite và cập nhật lại biểu đồ và hàng."""
        if not self.selected_audit_id:
            messagebox.showwarning("Thông báo", "Vui lòng click chọn một dòng cụ thể trong danh sách Kết quả sáp nhập trước.")
            return
        
        selected_combo = self.combo_audit_color.get()
        note = self.txt_audit_note.get().strip()
        
        color_code = "none"
        if "🔴" in selected_combo:
            color_code = "red"
        elif "🟡" in selected_combo:
            color_code = "yellow"
        elif "🟢" in selected_combo:
            color_code = "green"
            
        # Ghi đè vào DB SQLite bền vững
        self.save_audit_note_to_db(self.selected_audit_id, color_code, note)
        
        # Cập nhật danh sách hiển thị
        self.perform_calculation_and_merge()
        self.lbl_status.configure(text=f"Đã lưu phê duyệt kiểm toán cho Mã DN {self.selected_audit_id}")

    # --- ĐA NHIỆM & KHÓA NÚT CHỐNG TREO ---
    def run_async(self, func):
        self.progress_bar.start()
        # Khóa nút
        self.btn_load_1.configure(state="disabled")
        self.btn_save_db1.configure(state="disabled")
        self.btn_save_db2.configure(state="disabled")
        self.btn_load_store1.configure(state="disabled")
        self.btn_load_store2.configure(state="disabled")
        self.btn_run_merge.configure(state="disabled")
        self.btn_export.configure(state="disabled")
        
        threading.Thread(target=func, daemon=True).start()

    def process_queue(self):
        try:
            while True:
                msg = self.task_queue.get_nowait()
                if msg['type'] == 'done':
                    self.progress_bar.stop()
                    self.progress_bar.set(0)
                    # Mở lại nút
                    self.btn_load_1.configure(state="normal")
                    self.btn_save_db1.configure(state="normal")
                    self.btn_save_db2.configure(state="normal")
                    self.btn_load_store1.configure(state="normal")
                    self.btn_load_store2.configure(state="normal")
                    self.btn_run_merge.configure(state="normal")
                    self.btn_export.configure(state="normal")
                    
                    if 'status' in msg:
                        self.lbl_status.configure(text=msg['status'])

                elif msg['type'] == 'status':
                    self.lbl_status.configure(text=msg['text'])

                elif msg['type'] == 'update_tree':
                    self.update_tree_ui(msg['name'], msg['df'])

                elif msg['type'] == 'error':
                    self.progress_bar.stop()
                    self.progress_bar.set(0)
                    self.lbl_status.configure(text="Đã xảy ra lỗi khi tính toán")
                    messagebox.showerror("Lỗi hệ thống", msg['message'])
                    # Mở lại nút
                    self.btn_load_1.configure(state="normal")
                    self.btn_save_db1.configure(state="normal")
                    self.btn_save_db2.configure(state="normal")
                    self.btn_load_store1.configure(state="normal")
                    self.btn_load_store2.configure(state="normal")
                    self.btn_run_merge.configure(state="normal")
                    self.btn_export.configure(state="normal")

        except queue.Empty:
            pass
        self.after(100, self.process_queue)

    def update_tree_ui(self, name, df):
        tree = self.trees[name]
        for i in tree.get_children():
            tree.delete(i)
        
        # Ánh xạ tên cột tiếng Việt sang trọng
        cols = list(df.columns)
        tree["columns"] = cols
        
        for c in cols:
            tree.heading(c, text=c, anchor="center")
            # Thiết kế độ rộng cột thông minh dạt dào, ngăn chặn triệt để hiện tượng ép cứng cột
            c_lower = c.lower()
            if "tên" in c_lower or "diễn" in c_lower or "ghi chú" in c_lower or "nhận định" in c_lower:
                tree.column(c, width=320, minwidth=150, anchor="w", stretch=False)
            elif "stt" in c_lower:
                tree.column(c, width=60, minwidth=40, anchor="center", stretch=False)
            elif "mã" in c_lower or "mst" in c_lower:
                tree.column(c, width=160, minwidth=100, anchor="center", stretch=False)
            elif "doanh thu" in c_lower or "lao động" in c_lower or "trạng thái" in c_lower:
                tree.column(c, width=180, minwidth=120, anchor="center", stretch=False)
            else:
                tree.column(c, width=150, minwidth=100, anchor="center", stretch=False)

        # Đổ dữ liệu
        for idx, r in df.iterrows():
            vals = ["" if pd.isna(x) else str(x) for x in r]
            
            # Phân loại cờ sắc nét cho visual
            item_tag = "normal_row"
            if name == "Kết quả":
                # Cờ cảnh báo liên quan đến kiểm toán
                trang_thai_kiem_toan = r.get("Trạng thái kiểm toán", "")
                if "🔴" in trang_thai_kiem_toan or r.get("Tên Ngành Chi Tiết", "") == "Chưa xác định":
                    item_tag = "red_flag"
                elif "🟡" in trang_thai_kiem_toan:
                    item_tag = "yellow_flag"
                elif "🟢" in trang_thai_kiem_toan:
                    item_tag = "green_flag"
            tree.insert("", "end", values=vals, tags=(item_tag,))

    # --- LOGIC XỬ LÝ SÁP NHẬP ---
    def smart_loader(self):
        """Mở hộp thoại chọn tệp Excel đa định dạng (xls, xlsx, xlsb, csv)."""
        path = filedialog.askopenfilename(
            title="Chọn tệp nguồn dữ liệu",
            filetypes=[("Excel Files", "*.xlsx *.xls *.xlsb *.csv")]
        )
        if not path:
            return

        def worker():
            self.task_queue.put({'type': 'status', 'text': f"Đang phân tích tệp: {os.path.basename(path)}..."})
            try:
                # Đọc tệp thông qua Pandas
                if path.endswith('.csv'):
                    df = pd.read_csv(path, dtype=str)
                else:
                    df = pd.read_excel(path, dtype=str, engine='openpyxl')
                
                # Làm sạch và loại bỏ các cột rỗng hoàn toàn
                df = df.dropna(how='all')
                
                self.df_working = df
                # Đổ dữ liệu tạm thời vào bảng Kho 1 trước để quan sát
                self.task_queue.put({'type': 'update_tree', 'name': 'Kho 1', 'df': self.df_working.head(100)})
                self.task_queue.put({
                    'type': 'done',
                    'status': f"Đã nạp tạm thời tệp {os.path.basename(path)} gồm {len(df)} dòng dữ liệu."
                })
            except Exception as e:
                self.task_queue.put({'type': 'error', 'message': f"Không thể đọc file {os.path.basename(path)}. Chi tiết: {str(e)}"})
        
        self.run_async(worker)

    def save_to_db(self, n):
        """Lưu trữ dữ liệu hoạt động hiện tại vào SQLite."""
        if self.df_working is None:
            messagebox.showwarning("Thông báo", "Vui lòng bấm '📥 Nạp mới dữ liệu' và chọn tệp trước.")
            return

        def worker():
            self.task_queue.put({'type': 'status', 'text': f"Đang lưu trữ tệp vào bảng dữ liệu Kho {n}..."})
            try:
                conn = sqlite3.connect(self.db_path)
                table_name = f"data_table_{n}"
                
                # Ghi đè vào bảng SQLite
                self.df_working.to_sql(table_name, conn, if_exists="replace", index=False)
                conn.commit()
                conn.close()

                if n == 1:
                    self.df1 = self.df_working.copy()
                else:
                    self.df2 = self.df_working.copy()

                self.task_queue.put({'type': 'update_tree', 'name': f'Kho {n}', 'df': self.df_working})
                self.task_queue.put({
                     'type': 'done',
                     'status': f"Đã lưu bền vững và cập nhật Kho {n} thành công."
                })
            except Exception as e:
                self.task_queue.put({'type': 'error', 'message': f"Lỗi biên soạn SQLite: {str(e)}"})

        self.run_async(worker)

    def load_from_db(self, n):
        """Sục phục hồi dữ liệu từ SQLite của Kho tương ứng."""
        def worker():
            self.task_queue.put({'type': 'status', 'text': f"Đang truy vấn phục hồi dữ liệu Kho {n}..."})
            try:
                conn = sqlite3.connect(self.db_path)
                table_name = f"data_table_{n}"
                
                df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
                conn.close()

                if df.empty:
                    self.task_queue.put({'type': 'error', 'message': f"Danh bảng Kho {n} trong SQLite hiện đang trống rỗng."})
                    return

                if n == 1:
                    self.df1 = df
                else:
                    self.df2 = df

                self.task_queue.put({'type': 'update_tree', 'name': f'Kho {n}', 'df': df})
                self.task_queue.put({
                    'type': 'done', 
                    'status': f"Phục hồi thành công {len(df)} dòng dữ liệu từ SQLite của Kho {n}."
                })
            except Exception as e:
                self.task_queue.put({'type': 'error', 'message': f"Không tìm thấy bảng lưu trữ Kho {n}. Hãy ấn 'Ghi nhớ' trước."})

        self.run_async(worker)

    # --- THUẬT TOÁN KẾT NỐI, GIẢI MÃ VSIC VÀ ÁNH XẠ CHỈ TIÊU ---
    def smart_aggregate_router(self):
        """Kích hoạt router ghép nối và kiểm toán dòng."""
        if self.df1 is None:
            messagebox.showwarning("Thiếu dữ liệu", "Phải cung cấp Danh sách doanh nghiệp tại Kho 1 để bắt đầu.")
            return

        def worker():
            self.task_queue.put({'type': 'status', 'text': "Đang vận hành sáp nhập thuật toán đa luồng..."})
            try:
                self.perform_calculation_and_merge()
                self.task_queue.put({'type': 'done', 'status': "Ghép nối thành công! Hãy kiểm tra tab Kết quả kiểm toán."})
            except Exception as e:
                self.task_queue.put({'type': 'error', 'message': f"Lỗi sáp nhập: {str(e)}"})

        self.run_async(worker)

    def perform_calculation_and_merge(self):
        """Thực hiện kết nối Kho 1 và Kho 2 theo mã lý thuyết VSIC."""
        # 1. Phát hiện cột thông minh cho Kho 1
        cols_1 = {strip_vietnamese_accent(c): c for c in self.df1.columns}
        
        col_xa = self.find_best_match(cols_1, ['xa', 'xaphuong', 'phuongxa', 'address', 'diaban'])
        col_ma = self.find_best_match(cols_1, ['madn', 'ma_dn', 'masothue', 'mst', 'macoso', 'ma_co_so', 'hoso', 'ho_so'])
        col_m5 = self.find_best_match(cols_1, ['manganh5', 'ma_nganh_5', 'manganh', 'ma_nganh'])
        col_dt = self.find_best_match(cols_1, ['dt', 'doanhthu', 'doanh_thu', 'thu_nhap', 'thunhap'])
        col_ld = self.find_best_match(cols_1, ['ld', 'laodong', 'lao_dong', 'nhansu', 'nhan_su'])
        
        # Nhận diện cột tên ngành do ĐTV tự nhập bằng tay dạt dào
        col_ten_dtv = self.find_best_match(cols_1, ['tennganhdtv', 'ten_nganh_dtv', 'tennganhthucte', 'ten_nganh_thuc_te', 'ten_nganh_co_so', 'tenganh', 'tenganhcoso', 'mota', 'mota_nganh', 'hoatdongkinhdoanh', 'nganh_nghe', 'hoat_dong_kd'])

        # 2. Tạo từ điển bản đồ từ Kho 2 để tra cứu nhanh O(1)
        industry_map = {}
        if self.df2 is not None:
            cols_2 = {strip_vietnamese_accent(c): c for c in self.df2.columns}
            col_m5_ind = self.find_best_match(cols_2, ['manganh5', 'ma_nganh_5', 'manganh', 'ma_nganh'])
            col_ten_ind = self.find_best_match(cols_2, ['tennganh', 'ten_nganh', 'ten', 'mota', 'mo_ta'])
            
            if col_m5_ind and col_ten_ind:
                for _, row in self.df2.iterrows():
                    code = str(row.get(col_m5_ind, "")).strip()
                    if code:
                        industry_map[code] = str(row.get(col_ten_ind, "")).strip()

        # 3. Quét thông tin cờ của Kiểm toán viên từ SQLite local
        audit_marks = self.load_all_audit_marks()

        # 4. Tạo kết quả sáp nhập
        merged_rows = []
        for idx, row in self.df1.iterrows():
            xa_val = str(row.get(col_xa, "")).strip() if col_xa else "Không xác định"
            ma_dn_val = str(row.get(col_ma, "")).strip() if col_ma else "Không rõ"
            m5_val = str(row.get(col_m5, "")).strip() if col_m5 else ""
            
            # Làm sạch mã ngành (vắt sạch ký tự thừa)
            m5_val = re.sub(r'[^0-9]', '', m5_val).zfill(5) if m5_val else ""

            # Giải nghĩa doanh thu và lao động
            try:
                dt_str = str(row.get(col_dt, "0")).replace(",", "").strip()
                dt_val = float(dt_str) if dt_str else 0.0
            except:
                dt_val = 0.0

            try:
                ld_str = str(row.get(col_ld, "0")).replace(",", "").strip()
                ld_val = float(ld_str) if ld_str else 0.0
            except:
                ld_val = 0.0

            # Tra từ điển Kho 2
            ten_nganh = industry_map.get(m5_val, "Chưa xác định")

            # Tự động decoder đa tầng VSIC Kinh tế quốc gia
            l1_code, l1_name = get_level_1(m5_val)
            l2_code, l2_name = get_level_2(m5_val)

            # Đồng bộ cờ từ SQLite
            color_state = "none"
            audit_note_state = ""
            
            # Lấy tên ngành thực tế do ĐTV/cơ sở tự gõ để so khớp ngữ nghĩa
            ten_dtv_val = ""
            if col_ten_dtv:
                ten_dtv_val = str(row.get(col_ten_dtv, "")).strip()

            similarity_pct = None
            if ten_dtv_val and ten_nganh != "Chưa xác định":
                similarity_pct = int(calc_text_similarity(ten_dtv_val, ten_nganh) * 100)

            if ma_dn_val in audit_marks:
                color_state = audit_marks[ma_dn_val]["color"]
                audit_note_state = audit_marks[ma_dn_val]["note"] or ""
            else:
                # Tự động phân tích điểm mâu thuẫn để cắm cờ sơ bộ
                if ten_nganh == "Chưa xác định":
                    color_state = "red"
                    audit_note_state = f"Hệ thống: Mã ngành '{m5_val}' không khớp từ điển hoặc sai mã ngành5!"
                elif similarity_pct is not None:
                    if similarity_pct < 35:
                        color_state = "red"
                        audit_note_state = f"Nghi ngờ sai mã ngành: ĐTV gõ '{ten_dtv_val}', tên gốc là '{ten_nganh}' (Độ lệch rất lớn - khớp {similarity_pct}%)"
                    elif similarity_pct < 65:
                        color_state = "yellow"
                        audit_note_state = f"Cảnh báo lệch nhẹ: ĐTV gõ '{ten_dtv_val}', tên gốc là '{ten_nganh}' (Độ khớp đạt {similarity_pct}%)"
                    elif dt_val > 5000 and ld_val <= 0:
                        color_state = "yellow"
                        audit_note_state = "Hệ thống: Nghi vấn mâu thuẫn doanh thu lớn nhưng không có lao động"
                elif dt_val > 5000 and ld_val <= 0:
                    color_state = "yellow"
                    audit_note_state = "Hệ thống: Nghi vấn mâu thuẫn doanh thu lớn nhưng không có lao động"

            # Nhãn hiển thị cờ tượng trưng
            marked_label = "⚪ Sạch"
            if color_state == "red":
                marked_label = "🔴 Cờ Đỏ (Nguy hiểm)"
            elif color_state == "yellow":
                marked_label = "🟡 Cờ Vàng (Nghi vấn)"
            elif color_state == "green":
                marked_label = "🟢 Cờ Xanh (Phê duyệt)"

            merged_rows.append({
                "STT": idx + 1,
                "Địa bàn Xã": xa_val,
                "Mã Doanh Nghiệp": ma_dn_val,
                "Mã Ngành Cấp 5": m5_val,
                "Tên Ngành Chi Tiết": ten_nganh,
                "Tên ĐTV nhập": ten_dtv_val if ten_dtv_val else "Không có cột dữ liệu này",
                "Mã Ngành Cấp 1": l1_code,
                "Tên Ngành Cấp 1": l1_name,
                "Mã Ngành Cấp 2": l2_code,
                "Tên Ngành Cấp 2": l2_name,
                "Doanh thu khai báo (Trđ)": dt_val,
                "Lao động (Người)": ld_val,
                "Trạng thái kiểm toán": marked_label,
                "Nhận định kiểm toán viên": audit_note_state
            })

        self.df_merged = pd.DataFrame(merged_rows)
        self.df_merged["STT"] = range(1, len(self.df_merged) + 1)
        
        # Đồng bộ danh sách Phường xã lên combo bộ lọc
        communes = ["Tất cả"] + sorted(list(self.df_merged["Địa bàn Xã"].unique()))
        self.combo_xa.configure(values=communes)

        # Trigger hiển thị danh sách
        self.trigger_interactive_filter()

    def find_best_match(self, col_dict, list_keys):
        """Phát hiện cột gần đúng nâng cao."""
        for key in list_keys:
            if key in col_dict:
                return col_dict[key]
        return None

    def trigger_interactive_filter(self, event=None):
        """Hệ thống bộ lọc đa chỉ tiêu tương tác tức thời giống hệt React."""
        if self.df_merged is None or self.df_merged.empty:
            return
        
        filtered = self.df_merged.copy()

        # 1. Lọc xã
        sel_xa = self.combo_xa.get()
        if sel_xa and sel_xa != "Tất cả":
            filtered = filtered[filtered["Địa bàn Xã"] == sel_xa]

        # 2. Lọc doanh thu
        sel_dt = self.combo_dt.get()
        if sel_dt == "Có doanh thu >0":
            filtered = filtered[filtered["Doanh thu khai báo (Trđ)"] > 0]
        elif sel_dt == "Doanh thu nhỏ (<100 Trđ)":
            filtered = filtered[(filtered["Doanh thu khai báo (Trđ)"] > 0) & (filtered["Doanh thu khai báo (Trđ)"] < 100)]
        elif sel_dt == "Doanh thu lớn (>=1000 Trđ)":
            filtered = filtered[filtered["Doanh thu khai báo (Trđ)"] >= 1000]
        elif sel_dt == "Rỗng/Bằng 0":
            filtered = filtered[filtered["Doanh thu khai báo (Trđ)"] <= 0]

        # 3. Lọc lao động
        sel_ld = self.combo_ld.get()
        if sel_ld == "Rỗng hoặc bằng 0":
            filtered = filtered[filtered["Lao động (Người)"] <= 0]
        elif sel_ld == "Siêu nhỏ (1-5 người)":
            filtered = filtered[(filtered["Lao động (Người)"] >= 1) & (filtered["Lao động (Người)"] <= 5)]
        elif sel_ld == "Vừa và lớn (>5 người)":
            filtered = filtered[filtered["Lao động (Người)"] > 5]

        # 4. Lọc cờ cảnh báo
        sel_flag = self.combo_flag.get()
        if sel_flag == "Bị cắm cờ (🔴 hoặc 🟡)":
            filtered = filtered[filtered["Trạng thái kiểm toán"].str.contains("🔴|🟡")]
        elif "🔴" in sel_flag:
            filtered = filtered[filtered["Trạng thái kiểm toán"].str.contains("🔴")]
        elif "🟡" in sel_flag:
            filtered = filtered[filtered["Trạng thái kiểm toán"].str.contains("🟡")]
        elif "🟢" in sel_flag:
            filtered = filtered[filtered["Trạng thái kiểm toán"].str.contains("🟢")]
        elif "Chưa khớp" in sel_flag:
            filtered = filtered[filtered["Tên Ngành Chi Tiết"] == "Chưa xác định"]

        # Cập nhật kết quả lên Treeview
        self.task_queue.put({'type': 'update_tree', 'name': 'Kết quả', 'df': filtered})

    # --- ĐA PHỒNG KHỐI BÁO CÁO MULTI-TAB EXCEL ---
    def export_final(self):
        """Xuất tổng hợp kết nối đa tầng tinh gọn chỉ với 1 click chuột."""
        if self.df_merged is None or self.df_merged.empty:
            messagebox.showwarning("Không có dữ liệu", "Vui lòng chạy '📊 Chạy Sáp nhập & Tổng hợp' để có kết quả sáp nhập trước khi xuất.")
            return

        out_path = filedialog.asksaveasfilename(
            title="Lưu báo cáo tổng hợp",
            defaultextension=".xlsx",
            filetypes=[("Excel Workbook", "*.xlsx")],
            initialfile="Bao_Cao_Tong_Hop_Huyen_Phu_V16_9.xlsx"
        )
        if not out_path:
            return

        def worker():
            self.task_queue.put({'type': 'status', 'text': "Đang khởi tạo các luồng báo cáo tổng hợp..."})
            try:
                with pd.ExcelWriter(out_path, engine='xlsxwriter') as writer:
                    # 1. Bảng sáp nhập chi tiết làm nòng cốt
                    self.df_merged.to_excel(writer, sheet_name="Dữ Liệu Sáp Nhập Sạch", index=False)

                    # 2. Tổng hợp ngành kinh tế cấp 1
                    agg_cap1 = self.calculate_aggregation_level('cap_1')
                    agg_cap1.to_excel(writer, sheet_name="Tổng Hợp Ngành Cấp 1", index=False)

                    # 3. Tổng hợp ngành kinh tế cấp 2
                    agg_cap2 = self.calculate_aggregation_level('cap_2')
                    agg_cap2.to_excel(writer, sheet_name="Tổng Hợp Ngành Cấp 2", index=False)

                    # 4. Nhật ký lỗi và điểm cắm cờ
                    anomalies = self.df_merged[self.df_merged["Trạng thái kiểm toán"].str.contains("🔴|🟡") | (self.df_merged["Tên Ngành Chi Tiết"] == "Chưa xác định")]
                    anomalies.to_excel(writer, sheet_name="Nhật Ký Điểm Dị Biệt", index=False)

                    # Định dạng cột rộng đẹp mắt thông qua xlsxwriter
                    for sheet in writer.sheets:
                        ws = writer.sheets[sheet]
                        ws.set_zoom(95)
                        # Tự độ rộng cho các cột
                        ws.set_column('A:Z', 22)

                self.task_queue.put({
                    'type': 'done',
                    'status': f"Chúc mừng! Đã xuất xong tệp báo cáo đa tầng sạch tại {os.path.basename(out_path)}"
                })
                # Mở hộp thoại thông báo bên ngoài
                messagebox.showinfo("Xuất báo cáo thành công", f"Hệ thống đã kết xuất tinh gọn báo cáo tại:\n{out_path}")
            except Exception as e:
                self.task_queue.put({'type': 'error', 'message': f"Lỗi tạo tệp Excel: {str(e)}"})

        self.run_async(worker)

    def calculate_aggregation_level(self, level='cap_1'):
        """Thuật toán nhóm tổng hợp nhanh giống hệt utils."""
        temp = self.df_merged.copy()
        
        if level == 'cap_1':
            gp_code = "Mã Ngành Cấp 1"
            gp_name = "Tên Ngành Cấp 1"
        elif level == 'cap_2':
            gp_code = "Mã Ngành Cấp 2"
            gp_name = "Tên Ngành Cấp 2"
        else:
            gp_code = "Mã Ngành Cấp 5"
            gp_name = "Tên Ngành Chi Tiết"

        # Định dạng nhóm
        grouped = temp.groupby(["Địa bàn Xã", gp_code, gp_name]).agg(
            Tong_Doanh_Thu_Trd=("Doanh thu khai báo (Trđ)", "sum"),
            Tong_Lao_Dong_Nguoi=("Lao động (Người)", "sum"),
            So_Luong_DN_Co_So=("Mã Doanh Nghiệp", "count")
        ).reset_index()

        # Đổi tên cột cho thanh lịch tiếng Việt
        grouped.columns = [
            "Địa bàn Xã", "Mã nhóm ngành", "Tên phân nhóm chi tiết",
            "Tổng doanh thu (Trđ)", "Tổng số nhân sự (Người)", "Số DN góp mặt"
        ]
        return grouped

    def clear_all_caches(self):
        """Xóa trắng cơ sở dữ liệu SQLite để làm việc lại từ đầu."""
        if not messagebox.askyesno("Xác nhận đặt lại", "Bạn có chắc chắn muốn xóa toàn bộ CSDL và nhật ký cờ kiểm toán đã lưu không? Hành động này dọn dẹp sạch sẽ CSDL SQLite local."):
            return

        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS data_table_1")
            cursor.execute("DROP TABLE IF EXISTS data_table_2")
            cursor.execute("DROP TABLE IF EXISTS audit_marks")
            conn.commit()
            conn.close()

            self.df_working = None
            self.df1 = None
            self.df2 = None
            self.df_merged = None

            # Xóa các dòng hiển thị hiện hành
            for k in self.trees:
                for row in self.trees[k].get_children():
                    self.trees[k].delete(row)

            self.lbl_status.configure(text="Hệ thống đã reset sạch sẽ!")
            messagebox.showinfo("Thành công", "Đã dọn dẹp thành công SQLite local.")
        except Exception as e:
            messagebox.showerror("Lỗi", f"Không thể xóa CSDL local: {e}")


if __name__ == "__main__":
    app = SieuMay_V16_9_Full()
    app.mainloop()
