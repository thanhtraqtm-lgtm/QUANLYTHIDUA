/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReportSubmission, LeaderboardRow } from '../types';

interface SyncResults {
  spreadsheetId: string;
  spreadsheetUrl: string;
  syncTimestamp: string;
  sheetsCreated: string[];
}

export async function createNewSpreadsheet(accessToken: string, title?: string): Promise<{ id: string; url: string }> {
  const sheetTitle = title || "Hệ thống Báo cáo Thi đua Thống kê (Đồng bộ Tự động)";
  
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: sheetTitle
      },
      sheets: [
        {
          properties: {
            title: "Bảng Xếp Hạng Thi Đua",
            gridProperties: {
              frozenRowCount: 1
            }
          }
        },
        {
          properties: {
            title: "Danh Sách Chi Tiết Báo Cáo",
            gridProperties: {
              frozenRowCount: 1
            }
          }
        },
        {
          properties: {
            title: "Nhật Ký Đồng Bộ"
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Tạo bảng tính thất bại: ${errText}`);
  }

  const result = await response.json();
  return {
    id: result.spreadsheetId,
    url: result.spreadsheetUrl
  };
}

export async function ensureSpreadsheetTabs(accessToken: string, spreadsheetId: string): Promise<string[]> {
  // 1. Fetch metadata to check existing sheets
  const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });

  if (!metaResponse.ok) {
    const errText = await metaResponse.text();
    throw new Error(`Đọc thông tin bảng tính Google Sheet bị lỗi: ${errText}`);
  }

  const metadata = await metaResponse.json();
  const existingTitles: string[] = (metadata.sheets || []).map((s: any) => s.properties?.title);

  const targetTabs = ["Bảng Xếp Hạng Thi Đua", "Danh Sách Chi Tiết Báo Cáo", "Nhật Ký Đồng Bộ"];
  const missingTabs = targetTabs.filter(tab => !existingTitles.includes(tab));

  if (missingTabs.length === 0) {
    return existingTitles;
  }

  // 2. Add missing sheets via batchUpdate
  const requests = missingTabs.map(title => ({
    addSheet: {
      properties: {
        title,
        ...(title !== "Nhật Ký Đồng Bộ" ? { gridProperties: { frozenRowCount: 1 } } : {})
      }
    }
  }));

  const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requests })
  });

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`Tạo các tab dữ liệu bổ sung thất bại: ${errText}`);
  }

  return [...existingTitles, ...missingTabs];
}

export async function syncDataToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  leaderboard: LeaderboardRow[],
  submissions: ReportSubmission[],
  triggeredBy: string
): Promise<SyncResults> {
  // Gracefully ensure tabs are set up (Bảng xếp hạng, Chi tiết báo cáo, Nhật ký...)
  await ensureSpreadsheetTabs(accessToken, spreadsheetId);

  const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  // 1. Prepare Leaderboard spreadsheet values
  const leaderboardHeaders = [
    "Hạng",
    "Mã Đơn Vị",
    "Tên Bộ Phận/Đơn Vị",
    "Địa Bàn/Vùng",
    "Tổng số báo cáo",
    "Đã nộp bài",
    "Nộp đúng hạn",
    "Nộp trễ hạn",
    "Chưa nộp bài",
    "Tổng Điểm Định Mức",
    "Tổng Điểm Thời Gian",
    "Tổng Điểm Chất Lượng",
    "Chỉ Số Thi Đua"
  ];
  const leaderboardValues = [
    leaderboardHeaders,
    ...leaderboard.map(row => [
      row.Rank,
      row.Ma_DV,
      row.Ten_Don_Vi,
      row.Vung,
      row.Tong_Bao_Cao,
      row.Da_Nop,
      row.Nop_Dung_Han,
      row.Nop_Tre_Han,
      row.Chua_Nop,
      row.Tong_Diem_Dinh_Muc,
      row.Diem_Thoi_Gian_Tong,
      row.Diem_Chat_Luong_Tong,
      row.Diem_Thi_Dua
    ])
  ];

  // 2. Prepare Report Submissions spreadsheet values
  const reportHeaders = [
    "Mã ID",
    "Mã ĐV Nộp",
    "Tên Đơn Vị Nộp",
    "Vùng",
    "Phòng Chuyên Môn Nhận",
    "Tên Phòng Ban",
    "Tên Báo Cáo Nghiệp Vụ",
    "Kỳ Báo Cáo/Loại",
    "Thời Hạn Quy Định",
    "Ngày Thực Tế Nộp",
    "Điểm Thời Gian",
    "Điểm Chất Lượng (Chấm bởi Phòng)",
    "Điểm Đạt Định Mức",
    "Tổng Điểm Thực Tế",
    "Số Ngày Báo Cáo Trễ",
    "Nội Dung Nhận Xét/Ghi Chú"
  ];
  const reportValues = [
    reportHeaders,
    ...submissions.map(row => [
      row.ID,
      row.Ma_DV,
      row.Ten_Don_Vi,
      row.Vung,
      row.Ma_Phong,
      row.Ten_Phong,
      row.Ten_Bao_Cao,
      row.Loai_BC,
      row.Han_Nop,
      row.Ngay_Nop || "Chưa nộp",
      row.Diem_Thoi_Gian !== null ? row.Diem_Thoi_Gian : "Chưa cập nhật",
      row.Diem_Chat_Luong !== null ? row.Diem_Chat_Luong : "Chưa chấm",
      row.Diem_Dinh_Muc,
      row.Tong_Diem !== null ? row.Tong_Diem : "Chưa tính",
      row.So_Ngay_Tre !== null ? row.So_Ngay_Tre : "-",
      row.Nhan_Xet || ""
    ])
  ];

  // 3. Prepare Audit Log values
  const logHeaders = ["Thời Gian Đồng Bộ (GMT+7)", "Người Đồng Bộ", "Tổng Số Đơn Vị", "Tổng Chi Tiết Chép Mẫu"];
  const logValues = [
    logHeaders,
    [timestamp, triggeredBy, leaderboard.length, submissions.length]
  ];

  // 4. Clean old contents
  const clearTargets = [
    "Bảng Xếp Hạng Thi Đua!A1:Z1000",
    "Danh Sách Chi Tiết Báo Cáo!A1:Z50000",
    "Nhật Ký Đồng Bộ!A1:Z500"
  ];

  for (const target of clearTargets) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(target)}:clear`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
  }

  // 5. Commit write operations via batchUpdate values
  const data = [
    {
      range: "Bảng Xếp Hạng Thi Đua!A1",
      values: leaderboardValues
    },
    {
      range: "Danh Sách Chi Tiết Báo Cáo!A1",
      values: reportValues
    },
    {
      range: "Nhật Ký Đồng Bộ!A1",
      values: logValues
    }
  ];

  const writeResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data
    })
  });

  if (!writeResponse.ok) {
    const errText = await writeResponse.text();
    throw new Error(`Ghi dữ liệu sang Google Sheets bị lỗi: ${errText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    syncTimestamp: timestamp,
    sheetsCreated: ["Bảng Xếp Hạng Thi Đua", "Danh Sách Chi Tiết Báo Cáo", "Nhật Ký Đồng Bộ"]
  };
}
