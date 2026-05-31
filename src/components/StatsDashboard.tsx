/**

 * @license

 * SPDX-License-Identifier: Apache-2.0

 */



import React from 'react';

import { ReportSubmission, LeaderboardRow } from '../types';

import { Calendar, Award, AlertCircle, Clock, TrendingUp, BarChart2 } from 'lucide-react';



interface StatsDashboardProps {

  submissions: ReportSubmission[];

  leaderboard: LeaderboardRow[];

  onSelectUnit: (maDv: string) => void;

}



export default function StatsDashboard({ submissions, leaderboard, onSelectUnit }: StatsDashboardProps) {

  // 1. Calculate General Metrics

  const totalReportsCount = submissions.length;

  

  // Submitted reports

  const submittedReports = submissions.filter(s => s.Ngay_Nop !== null);

  const totalSubmittedCount = submittedReports.length;

  const submissionRate = totalReportsCount > 0 ? (totalSubmittedCount / totalReportsCount) * 100 : 0;

  

  // Late submission vs On-time submission

  const onTimeCount = submittedReports.filter(s => (s.So_Ngay_Tre ?? 0) <= 0).length;

  const lateCount = submittedReports.filter(s => (s.So_Ngay_Tre ?? 0) > 0).length;

  const onTimeRate = totalSubmittedCount > 0 ? (onTimeCount / totalSubmittedCount) * 100 : 0;



  // Overdue and Non-submitted

  const overdueCount = submissions.filter(s => s.Ngay_Nop === null && new Date(s.Han_Nop) < new Date('2026-05-25')).length;



  // Average Score calculations

  const scoredSubmissions = submissions.filter(s => s.Tong_Diem !== null);

  const totalScoreVal = scoredSubmissions.reduce((sum, s) => sum + (s.Tong_Diem ?? 0), 0);

  const avgScore = scoredSubmissions.length > 0 ? totalScoreVal / scoredSubmissions.length : 0;



  // Average Quality Score

  const qualitySubmissions = submissions.filter(s => s.Diem_Chat_Luong !== null);

  const avgQualityScore = qualitySubmissions.length > 0

    ? qualitySubmissions.reduce((sum, s) => sum + (s.Diem_Chat_Luong ?? 0), 0) / qualitySubmissions.length

    : 0;



  // Average Time Score

  const timeSubmissions = submissions.filter(s => s.Diem_Thoi_Gian !== null);

  const avgTimeScore = timeSubmissions.length > 0

    ? timeSubmissions.reduce((sum, s) => sum + (s.Diem_Thoi_Gian ?? 0), 0) / timeSubmissions.length

    : 0;



  // 2. Region-specific analysis

  const regions = ['Khu vực 1', 'Khu vực 2'];

  const regionStats = regions.map(region => {

    const regionUnits = leaderboard.filter(item => item.Vung === region);

    const regionSubmissions = submissions.filter(s => s.Vung === region);

    const regionScored = regionSubmissions.filter(s => s.Tong_Diem !== null);

    

    const avgRegionalScore = regionUnits.length > 0 

      ? regionUnits.reduce((acc, u) => acc + u.Diem_Thi_Dua, 0) / regionUnits.length 

      : 0;



    const completed = regionSubmissions.filter(s => s.Ngay_Nop !== null).length;

    const completeness = regionSubmissions.length > 0 ? (completed / regionSubmissions.length) * 100 : 0;



    return {

      name: region,

      avgScore: avgRegionalScore,

      completeness,

      totalUnits: regionUnits.length

    };

  });



  // Sort leaderboard list for top 5 ranking

  const topUnits = [...leaderboard].slice(0, 5);

  const bottomUnits = [...leaderboard].slice(-3).reverse();



  return (

    <div className="space-y-6" id="stats-dashboard-container">

      {/* Premium Welcome Banner for Hung Yen Statistics Campaign */}

      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden border border-indigo-400/20">

        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">

          <Award className="w-40 h-40 text-white" />

        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-sky-100 px-3 py-1 rounded-full border border-white/20">

              Hệ thống thi đua Thống kê 2026

            </span>

            <h2 className="text-xl md:text-2xl font-black mt-2 tracking-tight">

              HỆ THỐNG BIỂU ĐỒ ĐIỂM THI ĐUA CÁC ĐƠN VỊ

            </h2>

            <p className="text-xs text-indigo-50 mt-1.5 max-w-2xl font-sans leading-relaxed">

              Hệ thống thi đua tự động đánh giá chi tiết theo hai cột điểm chính: <strong className="text-white font-black underline decoration-sky-300 decoration-2">Điểm thời gian</strong> (tối đa đạt đúng hạn, giảm trừ điểm trễ) và <strong className="text-amber-300 font-extrabold">Điểm chất lượng Chuyên môn</strong> do Thống kê Tỉnh Hưng Yên chấm duyệt.

            </p>

          </div>

          <div className="flex gap-4 items-center shrink-0">

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center">

              <span className="text-[10px] uppercase text-sky-300 font-bold block">Tổng số cơ sở</span>

              <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">{leaderboard.length} đơn vị</span>

            </div>

          </div>

        </div>

      </div>



      {/* Dynamic Summary Cards Row */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        

        {/* Metric 1 - Tỷ lệ Hoàn thành */}

        <div className="bg-white p-5 rounded-2xl border-2 border-sky-100 shadow-md flex items-center space-x-4 hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden group">

          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">

            <Calendar className="w-5 h-5" />

          </div>

          <div>

            <p className="text-[11px] text-slate-800 font-black font-sans tracking-wide uppercase">Tỷ lệ Hoàn thành</p>

            <h3 className="text-xl font-black font-sans text-sky-700 leading-none mt-1.5">{submissionRate.toFixed(1)}%</h3>

            <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">

              Đã nộp: <strong className="text-slate-800 font-extrabold">{totalSubmittedCount}</strong>/{totalReportsCount} báo cáo

            </p>

          </div>

          <div className="absolute bottom-0 right-0 w-12 h-1 bg-sky-500 rounded-bl-full" />

        </div>



        {/* Metric 2 - Điểm Thi Đua TB */}

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-md flex items-center space-x-4 hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden">

          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">

            <Award className="w-5 h-5" />

          </div>

          <div>

            <p className="text-[11px] text-slate-800 font-black font-sans tracking-wide uppercase">Điểm Thi đua TB</p>

            <h3 className="text-xl font-black font-sans text-indigo-700 leading-none mt-1.5">{avgScore.toFixed(1)} đ</h3>

            <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">

              Chỉ số tổng hợp thi đua

            </p>

          </div>

          <div className="absolute bottom-0 right-0 w-12 h-1 bg-indigo-500 rounded-bl-full" />

        </div>



        {/* Metric 3 - Điểm Chất lượng TB */}

        <div className="bg-white p-5 rounded-2xl border-2 border-amber-100 shadow-md flex items-center space-x-4 hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden">

          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">

            <TrendingUp className="w-5 h-5" />

          </div>

          <div>

            <p className="text-[11px] text-slate-800 font-black font-sans tracking-wide uppercase">Điểm Chất lượng TB</p>

            <h3 className="text-xl font-black font-sans text-amber-700 leading-none mt-1.5">{avgQualityScore.toFixed(1)} đ</h3>

            <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">

              Đánh giá từ Phòng nghiệp vụ

            </p>

          </div>

          <div className="absolute bottom-0 right-0 w-12 h-1 bg-amber-500 rounded-bl-full" />

        </div>



        {/* Metric 4 - Điểm Thời gian TB */}

        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-md flex items-center space-x-4 hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden">

          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">

            <Clock className="w-5 h-5" />

          </div>

          <div>

            <p className="text-[11px] text-slate-800 font-black font-sans tracking-wide uppercase">Điểm Thời gian TB</p>

            <h3 className="text-xl font-black font-sans text-emerald-700 leading-none mt-1.5">{avgTimeScore.toFixed(1)} đ</h3>

            <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">

              Đạt tỉ lệ đúng hạn: <strong className="text-emerald-800 font-extrabold">{onTimeRate.toFixed(0)}%</strong>

            </p>

          </div>

          <div className="absolute bottom-0 right-0 w-12 h-1 bg-emerald-500 rounded-bl-full" />

        </div>



        {/* Metric 5 - Cảnh báo Chậm trễ */}

        <div className="bg-white p-5 rounded-2xl border-2 border-rose-100 shadow-md flex items-center space-x-4 hover:translate-y-[-2px] transition-transform duration-200 relative overflow-hidden">

          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">

            <AlertCircle className="w-5 h-5" />

          </div>

          <div>

            <p className="text-[11px] text-slate-800 font-black font-sans tracking-wide uppercase">Chỉ tiêu Quá hạn</p>

            <h3 className="text-xl font-black font-sans text-rose-700 leading-none mt-1.5">{overdueCount} chỉ tiêu</h3>

            <p className="text-[10px] text-slate-600 mt-1 font-sans font-bold">

              Các mục cần bám sát nhắc nhở

            </p>

          </div>

          <div className="absolute bottom-0 right-0 w-12 h-1 bg-rose-500 rounded-bl-full" />

        </div>



      </div>



      {/* Main Charts block Grid */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        

        {/* Left column: Regional Comparative Analysis (Beautiful dynamic SVG Bars) */}

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-1">

          <div>

            <div className="flex items-center justify-between mb-4">

              <h4 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-tight flex items-center gap-1.5">

                <TrendingUp className="w-4 h-4 text-sky-500" /> So sánh vùng thi đua

              </h4>

              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase">

                Phân bổ Địa bàn

              </span>

            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed mb-6">

              Đối chiếu điểm hiệu suất bình quân (Diem_Thi_Dua) và tổng số lượng hoàn thành giao vận chỉ tiêu báo cáo giữa hai vùng trọng điểm.

            </p>

          </div>



          <div className="space-y-6 my-4">

            {regionStats.map((reg, index) => (

              <div key={reg.name} className="space-y-2">

                <div className="flex items-center justify-between">

                  <span className="font-semibold text-xs text-slate-700 font-sans">{reg.name}</span>

                  <span className="text-xs text-slate-500 font-mono">

                    Hoàn thành: <span className="font-bold text-slate-700">{reg.completeness.toFixed(1)}%</span>

                  </span>

                </div>

                

                {/* Horizontal Progress bar for Completeness */}

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">

                  <div 

                    className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-sky-500' : 'bg-teal-500'}`}

                    style={{ width: `${reg.completeness}%` }}

                  />

                </div>



                <div className="flex items-center justify-between pt-1">

                  <span className="text-[10px] text-slate-400 font-sans">Điểm trung bình cơ sở</span>

                  <span className="font-mono text-xs font-extrabold text-slate-800">{reg.avgScore.toFixed(1)}đ</span>

                </div>

              </div>

            ))}

          </div>



          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">

            <span className="text-[10px] text-slate-400 font-mono block uppercase">Vùng dẫn đầu thi đua 2026</span>

            <span className="font-sans text-sm font-bold text-sky-700 block mt-1">

              {regionStats[0].avgScore > regionStats[1].avgScore ? regionStats[0].name : regionStats[1].name}

            </span>

          </div>

        </div>



        {/* Middle column: Visual Emulation Standings SVG Bars Chart */}

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <h4 className="text-sm font-bold text-slate-800 font-sans uppercase tracking-tight flex items-center gap-1.5">

                <BarChart2 className="w-4 h-4 text-teal-600" /> Biểu đồ so điểm xếp hạng

              </h4>

              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase">

                14 Đơn vị Cơ sở

              </span>

            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed mb-6">

              Biểu đồ trực quan điểm thi đua làm thang đo xếp hạng. Điểm số là điểm bình quân của tất cả báo cáo đã chấm.

            </p>

          </div>



          {/* Interactive Responsive SVG Bar Chart */}

          <div className="relative w-full h-56 mt-2">

            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">

              {/* Grid Lines */}

              <line x1="40" y1="10" x2="580" y2="10" stroke="#f1f5f9" strokeWidth="1" />

              <line x1="40" y1="50" x2="580" y2="50" stroke="#f1f5f9" strokeWidth="1" />

              <line x1="40" y1="90" x2="580" y2="90" stroke="#f1f5f9" strokeWidth="1" />

              <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />

              <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeWidth="1" />

              <line x1="40" y1="170" x2="580" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />



              {/* Y Axis Labels */}

              <text x="15" y="14" fontSize="9" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">200</text>

              <text x="15" y="54" fontSize="9" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">150</text>

              <text x="15" y="94" fontSize="9" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">100</text>

              <text x="15" y="134" fontSize="9" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">50</text>

              <text x="15" y="174" fontSize="9" fill="#94a3b8" fontFamily="monospace" textAnchor="middle">0</text>



              {/* Bars Generation */}

              {leaderboard.map((item, idx) => {

                const maxVal = 200; // max expected scale

                const val = Math.min(maxVal, item.Diem_Thi_Dua);

                const height = (val / maxVal) * 160;

                const x = 40 + idx * 38;

                const y = 170 - height;

                const barWidth = 20;



                // Alternate colors by region

                const fillColor = item.Vung === 'Khu vực 1' ? '#0ea5e9' : '#14b8a6';



                return (

                  <g key={item.Ma_DV} className="group cursor-pointer" onClick={() => onSelectUnit(item.Ma_DV)}>

                    {/* Hover Card Indicator */}

                    <rect 

                      x={x - 4} 

                      y="5" 

                      width={barWidth + 8} 

                      height="185" 

                      fill="transparent" 

                      className="group-hover:fill-slate-50/50 rounded transition-colors duration-200" 

                    />

                    

                    {/* Main Bar */}

                    <rect 

                      x={x} 

                      y={y} 

                      width={barWidth} 

                      height={height} 

                      fill={fillColor} 

                      rx="3"

                      className="transition-all duration-300 group-hover:brightness-95" 

                    />



                    {/* Score Label inside bar */}

                    <text 

                      x={x + barWidth / 2} 

                      y={y - 6} 

                      fontSize="8" 

                      className="font-bold font-sans fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"

                      textAnchor="middle"

                    >

                      {item.Diem_Thi_Dua.toFixed(0)}đ

                    </text>



                    {/* Unit brief label below line */}

                    <text 

                      x={x + barWidth / 2} 

                      y="185" 

                      fontSize="8" 

                      fill="#64748b" 

                      fontFamily="sans-serif"

                      fontWeight="600"

                      transform={`rotate(35, ${x + barWidth / 2}, 185)`}

                      textAnchor="start"

                      className="uppercase"

                    >

                      {item.Ma_DV}

                    </text>

                  </g>

                );

              })}

            </svg>

          </div>

          

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-sans text-slate-500 pt-3 border-t border-slate-100">

            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500"></span> Khu vực 1</span>

            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-500"></span> Khu vực 2</span>

            <span className="text-[10px] text-slate-400 font-mono tracking-tight">Rê chuột lên cột để xem điểm cụ thể</span>

          </div>

        </div>



      </div>



      {/* Emulation Leaderboards Rankings Lists Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        

        {/* Top 5 list */}

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <h4 className="text-sm font-bold text-emerald-800 font-sans uppercase tracking-tight">

                🏆 Đầu bảng thi đua (Top 5 Dẫn đầu)

              </h4>

              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-sans font-semibold">

                Phong độ cao

              </span>

            </div>

            

            <div className="divide-y divide-slate-100 mt-2">

              {topUnits.map((item, idx) => (

                <div 

                  key={item.Ma_DV} 

                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors duration-150"

                  onClick={() => onSelectUnit(item.Ma_DV)}

                >

                  <div className="flex items-center space-x-3.5">

                    <span className="w-5 text-center font-mono text-sm font-extrabold text-[#10b981]">

                      #{idx + 1}

                    </span>

                    <div>

                      <h5 className="text-xs font-bold text-slate-700">{item.Ten_Don_Vi}</h5>

                      <span className="text-[10px] text-slate-400 font-sans">{item.Vung} (Mã: {item.Ma_DV})</span>

                    </div>

                  </div>

                  <div className="text-right">

                    <span className="font-mono text-xs font-extrabold text-slate-800">{item.Diem_Thi_Dua.toFixed(1)}đ</span>

                    <span className="text-[9px] block text-slate-400 font-sans">Độ chuẩn: {((item.Nop_Dung_Han / item.Tong_Bao_Cao) * 100).toFixed(0)}%</span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>



        {/* Bottom review checklist list */}

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <h4 className="text-sm font-bold text-rose-800 font-sans uppercase tracking-tight font-sans">

                ⚠️ Nhóm cần đôn đốc (Xếp hạng thấp nhất)

              </h4>

              <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-sans font-semibold">

                Chậm trễ / Quá hạn

              </span>

            </div>

            

            <div className="divide-y divide-slate-100 mt-2">

              {bottomUnits.map((item, idx) => (

                <div 

                  key={item.Ma_DV} 

                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors duration-150"

                  onClick={() => onSelectUnit(item.Ma_DV)}

                >

                  <div className="flex items-center space-x-3.5">

                    <span className="w-5 text-center font-mono text-sm font-extrabold text-[#f43f5e]">

                      #{leaderboard.length - idx}

                    </span>

                    <div>

                      <h5 className="text-xs font-bold text-slate-700">{item.Ten_Don_Vi}</h5>

                      <span className="text-[10px] text-[#f43f5e] font-sans font-medium">Trễ hạn: {item.Nop_Tre_Han} lần | Chưa nộp: {item.Chua_Nop}</span>

                    </div>

                  </div>

                  <div className="text-right">

                    <span className="font-mono text-xs font-extrabold text-slate-800">{item.Diem_Thi_Dua.toFixed(1)}đ</span>

                    <span className="text-[9px] block text-[#64748b] font-sans">{item.Vung} (Mã: {item.Ma_DV})</span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>



      </div>



    </div>

  );

}

