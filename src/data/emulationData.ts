/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit, ReportSubmission, Department } from '../types';

export const UNITS_DATA: Unit[] = [
  { Ma_DV: 'TKPH', Ten_Don_Vi: 'Thống kê Cơ Sở TP. Hưng Yên', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKNQ', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Văn Lâm', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKYM', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Yên Mỹ', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKMH', Ten_Don_Vi: 'Thống kê Cơ Sở thị xã Mỹ Hào', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKKC', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Khoái Châu', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKLB', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Kim Động', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKHHT', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Phù Cừ', Vung: 'Khu vực 1' },
  { Ma_DV: 'TKQP', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Quỳnh Phụ', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKHH', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Hưng Hà', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKDH', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Đông Hưng', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKTT', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Thái Thụy', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKTH', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Tiền Hải', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKKX', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Kiến Xương', Vung: 'Khu vực 2' },
  { Ma_DV: 'TKVT', Ten_Don_Vi: 'Thống kê Cơ Sở huyện Vũ Thư', Vung: 'Khu vực 2' }
];

export const DEPARTMENTS_DATA: Department[] = [
  { Ma_Phong: 'P_TH', Ten_Phong: 'Phòng Thống kê Tổng hợp' },
  { Ma_Phong: 'P_CN', Ten_Phong: 'Phòng Thống kê Công nghiệp' },
  { Ma_Phong: 'P_NNXH', Ten_Phong: 'Phòng Thống kê Nông nghiệp và Xã hội' },
  { Ma_Phong: 'P_DV', Ten_Phong: 'Phòng Thống kê Thương mại - Dịch vụ' },
  { Ma_Phong: 'P_TCHC', Ten_Phong: 'Phòng Tổ Chức Hành Chính' }
];

export const REPORT_TEMPLATES = [
  // I. BÁO CÁO NHANH (Tổng 120 điểm)
  { name: "Báo cáo ước tính thu ngân sách 6 đầu năm 2026", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-06-15", score: 30 },
  { name: "Báo cáo ước tính chi ngân sách 6 tháng đầu năm 2026", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-06-15", score: 30 },
  { name: "Báo cáo ước tính thu ngân sách năm 2025", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2025-11-15", score: 30 },
  { name: "Báo cáo ước tính chi ngân sách năm 2025", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2025-11-15", score: 30 },

  // II. BÁO CÁO PHÂN TÍCH (Tổng 100 điểm)
  { name: "Báo cáo/chuyên đề phân tích", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-08-31", score: 100 },

  // III. BÁO CÁO CHÍNH THỨC (Tổng 300 điểm)
  { name: "Báo cáo Hệ thống chỉ tiêu kinh tế - xã hội chủ yếu các xã/phường quản lý năm 2025", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-04-05", score: 100 },
  { name: "Niên giám Thống kê cấp xã năm 2025", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-06-15", score: 200 },

  // IV. BÁO CÁO KHÁC (Tổng 210 điểm theo danh mục đầu mục, thực tế chi tiết cộng dồn các chỉ tiêu)
  { name: "Báo cáo tổng kết công tác thống kê tổng hợp năm 2026", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-09-20", score: 50 },
  { name: "Báo cáo hiện trạng trang thiết bị Công nghệ thông tin năm 2026", dept: "P_TCHC", deptName: "Phòng Tổ Chức Hành Chính", type: "Năm", deadline: "2026-09-15", score: 40 },
  { name: "Báo cáo công tác phương pháp chế độ 6 tháng đầu năm 2026", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "6 tháng", deadline: "2026-03-20", score: 50 },
  { name: "Báo cáo công tác phương pháp chế độ năm 2026", dept: "P_TH", deptName: "Phòng Thống kê Tổng hợp", type: "Năm", deadline: "2026-09-20", score: 50 },
  { name: "Phiếu kê khai tài sản thu nhập của người có nghĩa vụ kê khai hằng năm năm 2025", dept: "P_TCHC", deptName: "Phòng Tổ Chức Hành Chính", type: "Năm", deadline: "2026-12-15", score: 40 },
  { name: "Lập danh sách đơn vị điều tra nhu cầu và mức độ hài lòng của người sử dụng thông tin thống kê năm 2026", dept: "P_DV", deptName: "Phòng Thống kê Thương mại - Dịch vụ", type: "Năm", deadline: "2026-10-15", score: 30 },

  // V. TỔNG ĐIỀU TRA KINH TẾ NĂM 2026 (Tổng 390 điểm)
  { name: "Lập danh sách đơn vị điều tra phiếu tôn giáo, tín ngưỡng (TDT Kinh tế 2026)", dept: "P_NNXH", deptName: "Phòng Thống kê Nông nghiệp và Xã hội", type: "Năm", deadline: "2026-04-15", score: 30 },
  { name: "Lập danh sách đơn vị điều tra phiếu sự nghiệp ngoài công lập (TDT Kinh tế 2026)", dept: "P_CN", deptName: "Phòng Thống kê Công nghiệp", type: "Năm", deadline: "2026-04-15", score: 30 },
  { name: "Lập danh sách đơn vị điều tra phiếu hội, hiệp hội; tổ chức phi chính phủ nước ngoài tại tỉnh Hưng Yên", dept: "P_DV", deptName: "Phòng Thống kê Thương mại - Dịch vụ", type: "Năm", deadline: "2026-04-15", score: 30 },
  { name: "Chất lượng phiếu điều tra tôn giáo", dept: "P_NNXH", deptName: "Phòng Thống kê Nông nghiệp và Xã hội", type: "Năm", deadline: "2026-05-31", score: 100 },
  { name: "Chất lượng phiếu điều tra sự nghiệp ngoài công lập", dept: "P_CN", deptName: "Phòng Thống kê Công nghiệp", type: "Năm", deadline: "2026-08-31", score: 100 },
  { name: "Chất lượng phiếu điều tra hội, hiệp hội; tổ chức phi chính phủ nước ngoài tại Việt Nam", dept: "P_DV", deptName: "Phòng Thống kê Thương mại - Dịch vụ", type: "Năm", deadline: "2026-08-31", score: 100 },

  // PHẦN BỔ SUNG: Báo cáo định kỳ định lượng (Tháng, Quý)
  { name: "Báo cáo Tình hình sản xuất Nông lâm nghiệp và Thủy sản", dept: "P_NNXH", deptName: "Phòng Thống kê Nông nghiệp và Xã hội", type: "Tháng", deadline: "2026-MM-15", score: 30 },
  { name: "Chỉ số sản xuất công nghiệp IIP", dept: "P_CN", deptName: "Phòng Thống kê Công nghiệp", type: "Tháng", deadline: "2026-MM-18", score: 30 },
  { name: "Kết quả kinh doanh bán lẻ hàng hóa và doanh thu dịch vụ", dept: "P_DV", deptName: "Phòng Thống kê Thương mại - Dịch vụ", type: "Tháng", deadline: "2026-MM-12", score: 30 },
  { name: "Báo cáo công tác Cải cách hành chính", dept: "P_TCHC", deptName: "Phòng Tổ Chức Hành Chính", type: "Quý", deadline: "2026-QQ-20", score: 40 }
];

/**
 * Generate beautifully pre-populated submission records that contain a realistic distribution of:
 * - On time submissions (high scores)
 * - Late submissions (some penalty days and deductions)
 * - Non-submitted reports (outstanding ones, current time is mid-2026)
 */
export function generateInitialSubmissions(): ReportSubmission[] {
  const submissions: ReportSubmission[] = [];
  let currentId = 1;

  UNITS_DATA.forEach((unit) => {
    REPORT_TEMPLATES.forEach((template, tIdx) => {
      // We will generate the target occurrences based on template periodicity
      const occurrences: { name: string; deadline: string; typeLabel: string }[] = [];

      if (template.type === "Tháng") {
        // Generate 12 months (from Month 1 to Month 12 of 2026)
        const dayMatch = template.deadline.match(/MM-(\d+)/);
        const dayStr = dayMatch ? dayMatch[1].padStart(2, '0') : "15";
        
        for (let m = 1; m <= 12; m++) {
          const mStr = m.toString().padStart(2, '0');
          occurrences.push({
            name: `${template.name} - Tháng ${m}/2026`,
            deadline: `2026-${mStr}-${dayStr}`,
            typeLabel: `Tháng ${m}`
          });
        }
      } else if (template.type === "Quý") {
        // Generate 4 quarters
        const dayMatch = template.deadline.match(/QQ-(\d+)/);
        const dayStr = dayMatch ? dayMatch[1].padStart(2, '0') : "20";
        const quarters = [
          { roman: "I", month: "03" },
          { roman: "II", month: "06" },
          { roman: "III", month: "09" },
          { roman: "IV", month: "12" }
        ];
        
        quarters.forEach((q) => {
          occurrences.push({
            name: `${template.name} - Quý ${q.roman}/2026`,
            deadline: `2026-${q.month}-${dayStr}`,
            typeLabel: `Quý ${q.roman}`
          });
        });
      } else {
        // Standard Annual / 6 months / Crop season
        occurrences.push({
          name: template.name,
          deadline: template.deadline,
          typeLabel: template.type
        });
      }

      // Process each occurrence for the current unit
      occurrences.forEach((occ) => {
        const deadlineDate = new Date(occ.deadline);
        const isPast = deadlineDate < new Date('2026-05-25'); // Current system date is May 25, 2026

        let ngayNop: string | null = null;
        let soNgayTre: number | null = null;
        let diemThoiGian: number | null = null;
        let diemChatLuong: number | null = null;
        let tongDiem: number | null = null;
        let nhanXet = "";

        if (isPast) {
          // 92% chance of being submitted if deadline has passed
          const submitted = Math.random() < 0.92;
          if (submitted) {
            // 85% chance of being on time, 15% chance of late
            const isLate = Math.random() < 0.15;
            if (isLate) {
              // Late submit: between 1 and 6 days late
              const delayDays = Math.floor(Math.random() * 6) + 1;
              const subDate = new Date(deadlineDate);
              subDate.setDate(subDate.getDate() + delayDays);
              
              ngayNop = subDate.toISOString().split('T')[0];
              soNgayTre = delayDays;
              
              // Penalty: -2 index points per day late, minimum score is 0
              diemThoiGian = Math.max(0, template.score - (delayDays * 2));
              // Quality score random between 80% to 100% of standard
              const qualityRatio = 0.8 + (Math.random() * 0.2);
              diemChatLuong = Math.round(template.score * qualityRatio * 10) / 10;
              tongDiem = Math.round((diemThoiGian + diemChatLuong) * 10) / 10;
              nhanXet = `Nộp trễ hạn ${delayDays} ngày. Báo cáo chất lượng đạt chuẩn, cần chú ý đảm bảo đúng kỳ sau.`;
            } else {
              // On time submit: 1 to 4 days early or exactly on prompt
              const advanceDays = Math.floor(Math.random() * 4);
              const subDate = new Date(deadlineDate);
              subDate.setDate(subDate.getDate() - advanceDays);
              
              ngayNop = subDate.toISOString().split('T')[0];
              soNgayTre = 0;
              diemThoiGian = template.score; // Maximum score for time constraint
              
              // Quality score random high (85% to 100%)
              const qualityRatio = 0.85 + (Math.random() * 0.15);
              diemChatLuong = Math.round(template.score * qualityRatio * 10) / 10;
              tongDiem = Math.round((diemThoiGian + diemChatLuong) * 10) / 10;
              nhanXet = "Nộp đúng hạn đạt kết quả xuất sắc. Đối chiếu biểu số liệu nghiệp vụ sạch sẽ.";
            }
          } else {
            // Past deadline and still NOT submitted
            ngayNop = null;
            soNgayTre = null;
            diemThoiGian = 0;
            diemChatLuong = 0;
            tongDiem = 0;
            nhanXet = "⚠️ QUÁ HẠN: Đơn vị chưa nộp tờ trình báo cáo kịp thời.";
          }
        } else {
          // Deadline is in the FUTURE (e.g., June or Dec 2026)
          // 25% chance they submitted early, 75% still pending
          const submittedEarly = Math.random() < 0.25;
          if (submittedEarly) {
            const subDate = new Date(deadlineDate);
            subDate.setDate(subDate.getDate() - Math.floor(Math.random() * 10) - 1);
            
            ngayNop = subDate.toISOString().split('T')[0];
            soNgayTre = 0;
            diemThoiGian = template.score;
            diemChatLuong = Math.round(template.score * 0.95 * 10) / 10;
            tongDiem = Math.round((diemThoiGian + diemChatLuong) * 10) / 10;
            nhanXet = "Nộp báo cáo sớm trước thời hạn định. Số liệu đã được phê chuẩn.";
          } else {
            ngayNop = null;
            soNgayTre = null;
            diemThoiGian = null;
            diemChatLuong = null;
            tongDiem = null;
            nhanXet = "Đang chờ thu nghiệp báo cáo (Chưa đến hạn nộp chuyên môn).";
          }
        }

        submissions.push({
          ID: currentId++,
          Ma_DV: unit.Ma_DV,
          Ten_Don_Vi: unit.Ten_Don_Vi,
          Vung: unit.Vung,
          Ma_Phong: template.dept,
          Ten_Phong: template.deptName,
          Ten_Bao_Cao: occ.name,
          Loai_BC: occ.typeLabel,
          Han_Nop: occ.deadline,
          Ngay_Nop: ngayNop,
          Diem_Thoi_Gian: diemThoiGian,
          Diem_Chat_Luong: diemChatLuong,
          Tong_Diem: tongDiem,
          Diem_Dinh_Muc: template.score,
          So_Ngay_Tre: soNgayTre,
          Nhan_Xet: nhanXet
        });
      });
    });
  });

  return submissions;
}
