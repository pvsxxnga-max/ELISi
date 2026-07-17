import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// คอนฟิกหลักของระบบ e-LIS
const BRAND_NAME = "e-LIS";
const BRAND_DESC = "ระบบสารสนเทศเพื่อการบริหารสินเชื่อ";
const FORM_DOWNLOAD_URL = "https://drive.google.com/file/d/13mCe6T6Q4pNbd3vrX6t3aYcYlAS6QrxC/view?usp=drivesdk";

export default function App() {
  // ระบบ Router จำลองเพื่อความง่ายและไม่พังง่ายบน GitHub Pages / Preview
  const [currentPage, setCurrentPage] = useState('login'); 
  const [userProfile, setUserProfile] = useState(null); // เก็บข้อมูลผู้กู้
  const [selectedLoan, setSelectedLoan] = useState(null); // สินเชื่อที่กำลังดูรายละเอียด
  const [selectedApplication, setSelectedApplication] = useState(null); // คำขอที่ต้องการดูสถานะ
  
  // ข้อมูลจำลอง (State ในหน่วยความจำเพื่อให้ระบบ Interactive ได้สมบูรณ์แบบ)
  const [loans, setLoans] = useState([
    {
      id: "LOAN-2569-001",
      name: "สินเชื่อเพื่อเกษตรกรรายย่อย",
      limit: 200000,
      details: "ช่วยเหลือเกษตรกรรายย่อยเพื่อฟื้นฟูผลผลิตและจัดหาปัจจัยการผลิต",
      conditions: "เป็นเกษตรกรที่มีทะเบียนเกษตรกร และมีที่ดินทำกินของตนเองหรือเช่าระยะยาว",
      startDate: "2026-01-01T00:00",
      endDate: "2026-06-21T14:30",
      requireGPS: true,
      customQuestions: [
        { type: "dropdown", question: "ประเภทผลผลิตหลัก", options: ["ข้าว", "พืชไร่", "ปศุสัตว์", "ประมง"] }
      ]
    },
    {
      id: "LOAN-2569-002",
      name: "สินเชื่อเพื่อผู้ประกอบการ SME",
      limit: 500000,
      details: "เสริมสภาพคล่องธุรกิจขนาดย่อมและขนาดกลางในช่วงขับเคลื่อนเศรษฐกิจดิจิทัล",
      conditions: "จดทะเบียนนิติบุคคลไม่ต่ำกว่า 1 ปี และมีผลประกอบการเป็นบวก",
      startDate: "2026-03-01T08:00",
      endDate: "2026-07-31T23:59",
      requireGPS: false,
      customQuestions: []
    },
    {
      id: "LOAN-2569-003",
      name: "สินเชื่อเพื่อการศึกษา",
      limit: 100000,
      details: "เพื่อสนับสนุนค่าเล่าเรียนและอุปกรณ์การศึกษาระดับอุดมศึกษา",
      conditions: "เป็นนักศึกษาระดับปริญญาตรีขึ้นไป และมีผู้ปกครองเป็นผู้ค้ำประกันร่วม",
      startDate: "2026-09-01T09:00", // ยังไม่ถึงระยะเวลา
      endDate: "2026-12-31T18:00",
      requireGPS: false,
      customQuestions: []
    }
  ]);

  const [applications, setApplications] = useState([
    {
      appId: "APP-2569-0001234",
      loanName: "สินเชื่อเพื่อเกษตรกรรายย่อย",
      applicantName: "พัชญธิดา ปานเผือก",
      submitDate: "20 พ.ค. 2569 เวลา 14:30 น.",
      status: 2, // 1=ส่งคำขอ, 2=กำลังตรวจสอบ, 3=ตรวจสอบเสร็จสิ้น, 4=อนุมัติ/ไม่อนุมัติ
      step3Deadline: "28 พ.ค. 2569",
      remarks: [
        { date: "21 พ.ค. 2569 09:15 น.", text: "อยู่ระหว่างตรวจสอบเอกสารประกอบคำขอ กรุณารอการแจ้งเตือนจากระบบ", staff: "เจ้าหน้าที่สินเชื่อ" }
      ],
      email: "phitchayada@example.com"
    }
  ]);

  // ฟังก์ชันช่วยเหลือ: เช็คสถานะเวลาเปิด-ปิดของสินเชื่อ
  const getLoanTimeStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const hideLimit = new Date(end.getTime() + (24 * 60 * 60 * 1000)); // 24 ชั่วโมงหลังหมดเขต

    if (now < start) {
      return { status: "UPCOMING", text: "ยังไม่ถึงระยะเวลา", class: "bg-gray-100 text-gray-500 border-gray-200" };
    } else if (now > hideLimit) {
      return { status: "HIDDEN", text: "สิ้นสุดรายการ", class: "hidden" };
    } else if (now > end) {
      return { status: "EXPIRED", text: "หมดเขตการยื่นสินเชื่อ", class: "bg-red-50 text-red-500 border-red-100" };
    } else {
      return { status: "ACTIVE", text: "เปิดรับสมัคร", class: "bg-green-50 text-green-600 border-green-100" };
    }
  };

  // --- RENDERING SUB-PAGES ---

  // 1. หน้าแรก (Login)
  const renderLogin = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-800 text-white font-bold rounded-full flex items-center justify-center text-lg shadow-inner">
            e
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none">{BRAND_NAME}</h1>
            <p className="text-xs text-gray-500">{BRAND_DESC}</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800">
          <i className="fa-solid fa-shield-halved"></i>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto px-4 my-auto py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับสู่ระบบยื่นขออนุมัติสินเชื่อออนไลน์อัจฉริยะ</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">ชื่อผู้ใช้</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="fa-regular fa-user"></i>
                </span>
                <input type="text" placeholder="กรอกชื่อผู้ใช้" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">รหัสผ่าน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input type="password" placeholder="กรอกรหัสผ่าน" className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg" />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer">
                  <i className="fa-solid fa-eye-slash"></i>
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                setUserProfile({ name: "พัชญธิดา ปานเผือก", email: "phitchayada@example.com", isVerified: true });
                Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ', text: 'ยินดีต้อนรับผู้ใช้ระบบ e-LIS', timer: 1500, showConfirmButton: false });
                setCurrentPage('user-dashboard');
              }}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors shadow-md mt-2"
            >
              <i className="fa-solid fa-right-to-bracket mr-2"></i> เข้าสู่ระบบ
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">หรือ</span></div>
            </div>

            <button 
              onClick={() => {
                Swal.fire({
                  title: 'ลงทะเบียนผ่าน Google',
                  text: 'กำลังพาไปผูกบัญชีเพื่อความปลอดภัยสูงสุด',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'ตกลง',
                  cancelButtonText: 'ยกเลิก'
                }).then((res) => {
                  if(res.isConfirmed) setCurrentPage('register-form');
                });
              }}
              className="w-full border border-gray-300 bg-white text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center text-lg"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg" className="w-5 h-5 mr-2" alt="Google Logo" />
              ลงทะเบียนด้วย Google
            </button>

            <button 
              onClick={() => setCurrentPage('admin-dashboard')}
              className="w-full bg-blue-50 text-blue-800 py-2.5 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-lg"
            >
              <i className="fa-solid fa-user-tie mr-2"></i> สำหรับเจ้าหน้าที่
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100 bg-white">
        © 2026 {BRAND_NAME} {BRAND_DESC} สงวนลิขสิทธิ์
      </footer>
    </div>
  );

  // 2. หน้ากรอกข้อมูลผู้ลงทะเบียน (Register Form)
  const renderRegisterForm = () => {
    const handleSave = () => {
      setUserProfile({
        name: "พัชญธิดา ปานเผือก",
        email: "phitchayada@example.com",
        isVerified: true
      });
      Swal.fire('บันทึกสำเร็จ!', 'ข้อมูลผู้ขอสินเชื่อของท่านถูกบันทึกแล้ว', 'success').then(() => {
        setCurrentPage('user-dashboard');
      });
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between" style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-800 text-white font-bold rounded-full flex items-center justify-center text-lg">e</div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-none">{BRAND_NAME}</h1>
              <p className="text-xs text-gray-500">{BRAND_DESC}</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl w-full mx-auto px-4 py-8">
          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold">1</div>
              <span className="text-xs font-semibold text-blue-800 mt-1">กรอกข้อมูล</span>
            </div>
            <div className="h-0.5 bg-gray-300 flex-1 mx-2 -mt-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">2</div>
              <span className="text-xs text-gray-400 mt-1">ยืนยันตัวตน</span>
            </div>
            <div className="h-0.5 bg-gray-300 flex-1 mx-2 -mt-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">3</div>
              <span className="text-xs text-gray-400 mt-1">เสร็จสิ้น</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">ข้อมูลผู้ลงทะเบียน</h2>
              <p className="text-gray-500 text-sm mt-1">กรุณากรอกข้อมูลเพื่อความสะดวกรวดเร็วเมื่อส่งขอยื่นกู้สินเชื่อ (สามารถกดข้ามได้)</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> เลขประจำตัวประชาชน</label>
                  <input type="text" placeholder="กรอกเลขประจำตัวประชาชน 13 หลัก" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> คำนำหน้าชื่อ</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-base bg-white">
                    <option>เลือกคำนำหน้าชื่อ</option>
                    <option>นาย</option>
                    <option>นาง</option>
                    <option>นางสาว</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> ชื่อ</label>
                  <input type="text" placeholder="กรอกชื่อ" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base">ชื่อกลาง (ถ้ามี)</label>
                  <input type="text" placeholder="กรอกชื่อกลาง" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> นามสกุล</label>
                  <input type="text" placeholder="กรอกนามสกุล" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> วันเดือนปีเกิด</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> เพศ</label>
                  <div className="flex space-x-6 py-2.5">
                    <label className="flex items-center space-x-2"><input type="radio" name="gender" /> <span>ชาย</span></label>
                    <label className="flex items-center space-x-2"><input type="radio" name="gender" /> <span>หญิง</span></label>
                    <label className="flex items-center space-x-2"><input type="radio" name="gender" /> <span>ไม่ระบุ</span></label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> เบอร์โทรศัพท์มือถือ</label>
                  <input type="tel" placeholder="กรอกเบอร์โทรศัพท์มือถือ" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-base"><span className="text-red-500">*</span> อีเมล</label>
                  <input type="email" placeholder="กรอกอีเมล" className="w-full border border-gray-300 rounded-lg p-2.5 text-base" />
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start space-x-3 text-sm mt-4 border border-blue-100">
                <i className="fa-solid fa-circle-info mt-0.5 text-base"></i>
                <div>
                  <p className="font-semibold">นโยบายความคุ้มครองข้อมูล</p>
                  <p className="text-blue-900 opacity-90">ระบบจะจัดเก็บรักษาข้อมูลของท่านเป็นความลับอย่างเข้มงวดที่สุด เพื่อประโยชน์ในการพิสูจน์ตัวตนอย่างเป็นทางการ</p>
                </div>
              </div>

              <div className="flex flex-col space-y-3 mt-8">
                <button 
                  onClick={handleSave} 
                  className="w-full bg-blue-800 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors shadow-md"
                >
                  <i className="fa-regular fa-floppy-disk mr-2"></i> บันทึกข้อมูลและไปยังหน้าหลัก
                </button>
                <button 
                  onClick={() => {
                    setUserProfile({ name: "ผู้ใช้ทั่วไป (ไม่ได้ระบุข้อมูล)", email: "guest@example.com", isVerified: false });
                    setCurrentPage('user-dashboard');
                  }} 
                  className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base"
                >
                  ข้ามไปยังหน้าหลัก <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // 3. แดชบอร์ดผู้กู้ (User Dashboard)
  const renderUserDashboard = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-800 text-white font-bold rounded-full flex items-center justify-center text-lg">e</div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 leading-none">{BRAND_NAME}</h1>
            <p className="text-xs text-gray-500">{BRAND_DESC}</p>
          </div>
        </div>
        <button onClick={() => setCurrentPage('login')} className="text-gray-500 hover:text-red-500 font-medium">
          ออกจากระบบ <i className="fa-solid fa-arrow-right-from-bracket ml-1"></i>
        </button>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-85">ยินดีต้อนรับ</p>
            <h2 className="text-2xl font-bold">{userProfile?.name || "พัชญธิดา ปานเผือก"}</h2>
            <p className="text-xs text-blue-200 mt-1">ผู้ลงทะเบียนระบบบริหารจัดการสินเชื่อยื่นเรื่องขออนุมัติ</p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl border border-white/20">
            <i className="fa-regular fa-user"></i>
          </div>
        </div>

        {/* Available Loans */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-800 pl-3">สินเชื่อที่เปิดรับสมัคร</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loans.map(loan => {
              const timeStatus = getLoanTimeStatus(loan.startDate, loan.endDate);
              if (timeStatus.status === "HIDDEN") return null;

              return (
                <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                  <div className="p-5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${timeStatus.class}`}>
                      {timeStatus.text}
                    </span>
                    <h4 className="font-bold text-lg text-gray-800 mt-4 leading-snug">{loan.name}</h4>
                    <p className="text-gray-500 text-sm mt-2">วงเงินอนุมัติสูงสุด</p>
                    <p className="text-2xl font-extrabold text-blue-800 mt-1">{loan.limit.toLocaleString()} บาท</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex space-x-2">
                    <button 
                      onClick={() => setSelectedLoan(loan)}
                      className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                      รายละเอียด
                    </button>
                    <button 
                      disabled={timeStatus.status !== "ACTIVE"}
                      onClick={() => handleApplyLoan(loan)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-bold text-white transition-colors ${
                        timeStatus.status === "ACTIVE" ? 'bg-blue-800 hover:bg-blue-900 shadow' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      ยื่นสินเชื่อ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Statuses (ประวัติการยื่นคำขอ) */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-800 pl-3">ประวัติการยื่นคำขอสินเชื่อ</h3>
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.appId} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold text-sm">{app.appId}</span>
                    <span className="text-sm text-gray-400">{app.submitDate}</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mt-1.5">{app.loanName}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">อีเมลรับอัปเดตสถานะ: {app.email}</p>
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                      app.status === 1 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      app.status === 2 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      app.status === 3 ? 'bg-teal-50 text-teal-700 border-teal-100' :
                      app.status === 4 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {app.status === 1 ? 'ส่งคำขอพิจารณาแล้ว' :
                       app.status === 2 ? 'กำลังตรวจสอบเอกสารและพิจารณา' :
                       app.status === 3 ? 'ตรวจสอบเอกสารเสร็จสิ้น' :
                       app.status === 4 ? 'ได้รับการอนุมัติ' : 'ไม่ได้รับการอนุมัติ'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedApplication(app);
                      setCurrentPage('status-tracking');
                    }}
                    className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shadow"
                  >
                    ติดตามสถานะ <i className="fa-solid fa-arrow-pointer ml-1"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold">รายละเอียดรายการสินเชื่อ</h3>
              <button onClick={() => setSelectedLoan(null)} className="text-white hover:text-red-200 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">รหัสและชื่อสินเชื่อ</p>
                <h4 className="text-xl font-bold text-blue-900 mt-0.5">{selectedLoan.id} - {selectedLoan.name}</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-blue-800 font-semibold">วงเงินอนุมัติสูงสุด</p>
                  <p className="text-xl font-bold text-blue-900">{selectedLoan.limit.toLocaleString()} บาท</p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-semibold">หมดเขตยื่นคำขอ</p>
                  <p className="text-base font-bold text-blue-900">{new Date(selectedLoan.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700"><i className="fa-solid fa-circle-info mr-1 text-blue-800"></i> รายละเอียดสินเชื่อ</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{selectedLoan.details}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700"><i className="fa-solid fa-list-check mr-1 text-blue-800"></i> เงื่อนไขการพิจารณา</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{selectedLoan.conditions}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button onClick={() => setSelectedLoan(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ฟังชันก์เมื่อผู้กู้กดยื่นสินเชื่อ (จัดการเช็คว่าผูกข้อมูลเรียบร้อยหรือยัง และเช็คสิทธิ์ GPS)
  const handleApplyLoan = (loan) => {
    if (!userProfile || !userProfile.isVerified) {
      Swal.fire({
        title: 'จำเป็นต้องระบุข้อมูลโปรไฟล์',
        text: 'เนื่องจากคุณข้ามขั้นตอนลงทะเบียน คุณต้องกรอกข้อมูลส่วนตัวให้สมบูรณ์ก่อนเพื่อป้องกันการกรอกใหม่ในอนาคต',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'กรอกข้อมูลตอนนี้',
        cancelButtonText: 'ยกเลิก'
      }).then(res => {
        if(res.isConfirmed) setCurrentPage('register-form');
      });
      return;
    }

    if (loan.requireGPS) {
      Swal.fire({
        title: 'ขออนุญาตเข้าถึงตำแหน่งพิกัด GPS',
        text: 'สินเชื่อนี้มีความจำเป็นต้องใช้ตำแหน่งปัจจุบันเพื่อประกอบการพิจารณา หากไม่อนุญาตจะไม่สามารถยื่นคำขอได้',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยินยอมและแชร์ตำแหน่ง',
        cancelButtonText: 'ไม่อนุญาต'
      }).then(res => {
        if(res.isConfirmed) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              submitLoanApplication(loan, `พิกัด GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            },
            () => {
              Swal.fire('ข้อผิดพลาด', 'คุณจำเป็นต้องให้สิทธิ์เข้าถึงพิกัดเพื่อยื่นสินเชื่อรายการนี้', 'error');
            }
          );
        }
      });
    } else {
      submitLoanApplication(loan);
    }
  };

  const submitLoanApplication = (loan, gpsData = null) => {
    Swal.fire({
      title: 'ยืนยันการส่งคำขอสินเชื่อ',
      text: `ท่านต้องการส่งคำขอสินเชื่อ "${loan.name}" เข้าสู่ระบบเพื่อเริ่มการพิจารณาใช่หรือไม่?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'ตกลงยื่นขออนุมัติ',
      cancelButtonText: 'ยกเลิก'
    }).then(res => {
      if (res.isConfirmed) {
        const newAppId = `APP-2569-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const now = new Date();
        const formattedDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + " เวลา " + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
        
        const newApp = {
          appId: newAppId,
          loanName: loan.name,
          applicantName: userProfile.name,
          submitDate: formattedDate,
          status: 1,
          step3Deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
          remarks: [
            { date: formattedDate, text: "รับส่งคำขอพิจารณาสำเร็จในระบบ e-LIS เรียบร้อยแล้ว", staff: "ระบบอัตโนมัติ" }
          ],
          email: userProfile.email
        };

        setApplications([newApp, ...applications]);
        Swal.fire('ส่งคำขอสำเร็จ!', `หมายเลขอ้างอิงคำขอของท่านคือ: ${newAppId}`, 'success');
      }
    });
  };

  // 4. หน้าติดตามสถานะการยื่นคำขอสินเชื่อแบบละเอียด (Status Detail)
  const renderStatusTracking = () => {
    if (!selectedApplication) return null;

    // คำนวณความเคลื่อนไหวสถานะแบบ Real-time ของ Step 3
    // สมมติว่าหากพ้นกำหนดเวลาใน Step 3 แล้ว แต่สถานะยังไม่ไป 4 จะต้องแจ้งพ้นกำหนด (กากบาท)
    const isOverdue = selectedApplication.status < 4 && new Date() > new Date(selectedApplication.step3Deadline);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between" style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-800 text-white font-bold rounded-full flex items-center justify-center text-lg">e</div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-none">{BRAND_NAME}</h1>
              <p className="text-xs text-gray-500">{BRAND_DESC}</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('user-dashboard')} className="text-gray-500 hover:text-blue-800 font-semibold">
            <i className="fa-solid fa-chevron-left mr-1"></i> กลับแดชบอร์ด
          </button>
        </header>

        <main className="max-w-xl w-full mx-auto px-4 py-8 flex-1">
          <h2 className="text-2xl font-extrabold text-blue-900 mb-6 text-center">ตรวจสอบสถานะการยื่นคำขอ</h2>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6">
            <div className="flex items-center space-x-4 bg-blue-50/50 p-4 rounded-xl border border-blue-50 mb-6">
              <div className="w-12 h-12 bg-blue-800 text-white rounded-xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">เลขที่คำขอ : {selectedApplication.appId}</p>
                <h4 className="font-bold text-gray-800">{selectedApplication.loanName}</h4>
                <p className="text-xs text-gray-500 mt-0.5">ส่งคำขอเมื่อ : {selectedApplication.submitDate}</p>
              </div>
            </div>

            {/* Stepper Status Timeline */}
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-gray-200">
              
              {/* Step 1 */}
              <div className="flex items-start space-x-4 relative">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-lg z-10 shadow-sm">
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-gray-800 text-base">1. ส่งคำขอพิจารณาแล้ว</h5>
                    <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">เสร็จสิ้น <i className="fa-solid fa-circle-check"></i></span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedApplication.submitDate}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 shadow-sm ${
                  selectedApplication.status >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <i className="fa-regular fa-clock"></i>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-gray-800 text-base">2. กำลังตรวจสอบเอกสารและพิจารณา</h5>
                    {selectedApplication.status === 2 && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full font-bold animate-pulse">กำลังตรวจสอบ <i className="fa-regular fa-clock"></i></span>
                    )}
                    {selectedApplication.status > 2 && (
                      <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">เสร็จสิ้น <i className="fa-solid fa-circle-check"></i></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 shadow-sm ${
                  isOverdue ? 'bg-red-500 text-white' :
                  selectedApplication.status >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isOverdue ? <i className="fa-solid fa-circle-xmark animate-bounce"></i> : <i className="fa-solid fa-file-shield"></i>}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-gray-800 text-base">3. ตรวจสอบเอกสารเสร็จสิ้น</h5>
                    {isOverdue ? (
                      <span className="text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">เลยกำหนดส่งตรวจอีกครั้ง</span>
                    ) : selectedApplication.status === 3 ? (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full font-bold">อยู่ระหว่างขั้นตอน</span>
                    ) : selectedApplication.status > 3 ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">เสร็จสิ้น <i className="fa-solid fa-circle-check"></i></span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ภายในวันที่กำหนด: <span className="font-bold text-blue-900">{selectedApplication.step3Deadline}</span></p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 shadow-sm ${
                  selectedApplication.status === 4 ? 'bg-green-600 text-white' :
                  selectedApplication.status === 5 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <i className="fa-solid fa-flag-checkered"></i>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-gray-800 text-base">4. อนุมัติ / ไม่อนุมัติ</h5>
                    {selectedApplication.status === 4 && <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">ได้รับการอนุมัติ</span>}
                    {selectedApplication.status === 5 && <span className="text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">ไม่ได้รับการอนุมัติ</span>}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Remarks Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-3"><i className="fa-regular fa-comment-dots mr-1.5 text-blue-800"></i> บันทึกหมายเหตุจากเจ้าหน้าที่</h4>
            <div className="space-y-3">
              {selectedApplication.remarks.map((rem, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-800">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{rem.date}</span>
                    <span className="font-bold text-blue-800">{rem.staff}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{rem.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  // 5. แดชบอร์ดระบบเจ้าหน้าที่ (Admin Dashboard)
  const renderAdminDashboard = () => {
    const [showCreateLoanModal, setShowCreateLoanModal] = useState(false);
    const [selectedStatusApp, setSelectedStatusApp] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // ตัวแปรเก็บฟอร์มเพิ่มสินเชื่อ
    const [newLoanName, setNewLoanName] = useState('');
    const [newLoanCode, setNewLoanCode] = useState(`LOAN-2569-${Math.floor(100 + Math.random() * 900)}`);
    const [newLimit, setNewLimit] = useState('');
    const [newDetails, setNewDetails] = useState('');
    const [newConditions, setNewConditions] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [requireGPS, setRequireGPS] = useState(false);
    const [customQuestions, setCustomQuestions] = useState([]);

    const handleAddQuestion = () => {
      setCustomQuestions([...customQuestions, { type: 'text', question: '', options: [] }]);
    };

    const handleCreateLoanSubmit = () => {
      if(!newLoanName || !newLimit || !newStart || !newEnd) {
        Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
        return;
      }

      const freshLoan = {
        id: newLoanCode,
        name: newLoanName,
        limit: parseFloat(newLimit),
        details: newDetails,
        conditions: newConditions,
        startDate: newStart,
        endDate: newEnd,
        requireGPS,
        customQuestions
      };

      setLoans([...loans, freshLoan]);
      setShowCreateLoanModal(false);
      Swal.fire('สร้างสำเร็จ!', `รายการสินเชื่อ ${newLoanName} ถูกเพิ่มเข้าระบบ ELIS แล้ว`, 'success');
    };

    const handleUpdateStatus = (app, statusNum) => {
      Swal.fire({
        title: 'ใส่บันทึกหมายเหตุการอัปเดตสถานะ',
        input: 'textarea',
        inputPlaceholder: 'กรอกหมายเหตุของเจ้าหน้าที่เพื่อแจ้งให้ผู้ยื่นทราบผ่านทางระบบและอีเมล...',
        showCancelButton: true,
        confirmButtonText: 'ยืนยันและอัปเดต',
        cancelButtonText: 'ยกเลิก',
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage('กรุณากรอกบันทึกหมายเหตุสำหรับลูกค้าก่อนดำเนินการ');
          }
          return value;
        }
      }).then(res => {
        if(res.isConfirmed) {
          const now = new Date();
          const formattedDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + " เวลา " + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
          
          const updated = applications.map(item => {
            if(item.appId === app.appId) {
              return {
                ...item,
                status: statusNum,
                remarks: [{ date: formattedDate, text: res.value, staff: "เจ้าหน้าที่บริหารสินเชื่อ" }, ...item.remarks]
              };
            }
            return item;
          });
          setApplications(updated);
          Swal.fire('สำเร็จ!', 'อัปเดตข้อมูลสถานะและส่งอีเมลหาลูกค้าเรียบร้อยแล้ว', 'success');
        }
      });
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <header className="bg-blue-900 text-white py-3.5 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white text-blue-950 font-bold rounded-full flex items-center justify-center text-lg">e</div>
            <div>
              <h1 className="text-xl font-bold leading-none">{BRAND_NAME} - ระบบเจ้าหน้าที่เพื่อบริหารสินเชื่อ</h1>
              <p className="text-xs text-blue-200 mt-1">แดชบอร์ดจัดการคำขอและวิเคราะห์ประเมินผล</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('login')} className="bg-blue-800 text-white hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-bold border border-blue-700">
            ออกจากระบบ
          </button>
        </header>

        <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <span className="text-xs text-gray-400 font-bold uppercase">รออัปเดตสถานะ</span>
              <p className="text-2xl font-extrabold text-blue-900 mt-1">18 ราย</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <span className="text-xs text-gray-400 font-bold uppercase">กำลังตรวจสอบ</span>
              <p className="text-2xl font-extrabold text-yellow-600 mt-1">32 ราย</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
              <span className="text-xs text-gray-400 font-bold uppercase">อนุมัติแล้ว</span>
              <p className="text-2xl font-extrabold text-green-600 mt-1">15 ราย</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
              <span className="text-xs text-gray-400 font-bold uppercase">ไม่อนุมัติ</span>
              <p className="text-2xl font-extrabold text-red-600 mt-1">8 ราย</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
              <span className="text-xs text-gray-400 font-bold uppercase">รอตรวจสอบอีกครั้ง</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">6 ราย</p>
            </div>
          </div>

          {/* Actions & Filters Panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 border border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setShowCreateLoanModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors"
              >
                <i className="fa-solid fa-circle-plus mr-1.5"></i> เพิ่มรายการสินเชื่อใหม่
              </button>
              <button 
                onClick={() => Swal.fire('ส่งออกข้อมูล', 'ระบบกำลังจัดเตรียมไฟล์ PDF สรุปคำขอสำหรับเครื่องพิมพ์...', 'info')}
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors"
              >
                <i className="fa-solid fa-file-pdf mr-1.5"></i> ส่งออกข้อมูล (PDF)
              </button>
              <button 
                onClick={() => Swal.fire('ส่งออกข้อมูล', 'ระบบกำลังส่งออกเป็นไฟล์ Word สัญญา...', 'info')}
                className="bg-blue-50 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold border border-blue-200 transition-colors"
              >
                <i className="fa-solid fa-file-word mr-1.5"></i> ส่งออกข้อมูล (Word)
              </button>
            </div>
            <div className="flex space-x-2">
              <input type="date" className="border border-gray-300 rounded-lg p-1.5 text-sm" />
              <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200">
                กรองประวัติย้อนหลัง
              </button>
            </div>
          </div>

          {/* Management Applications Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800"><i className="fa-solid fa-list mr-1 text-blue-900"></i> รายการพิจารณาอนุมัติสินเชื่อทั้งหมดในระบบ</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm font-bold text-gray-500 bg-gray-50">
                    <th className="p-4">รหัสคำขอ</th>
                    <th className="p-4">ชื่อผู้กู้</th>
                    <th className="p-4">สินเชื่อ</th>
                    <th className="p-4">วันที่ส่งเรื่อง</th>
                    <th className="p-4">สถานะปัจจุบัน</th>
                    <th className="p-4 text-right">ดำเนินการอัปเดต</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.appId} className="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50">
                      <td className="p-4 font-mono font-bold text-blue-800">{app.appId}</td>
                      <td className="p-4 font-semibold">{app.applicantName}</td>
                      <td className="p-4">{app.loanName}</td>
                      <td className="p-4 text-gray-400">{app.submitDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          app.status === 1 ? 'bg-blue-100 text-blue-800' :
                          app.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 3 ? 'bg-teal-100 text-teal-800' :
                          app.status === 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 1 ? 'รอดำเนินการ' :
                           app.status === 2 ? 'กำลังตรวจสอบ' :
                           app.status === 3 ? 'ตรวจสอบเสร็จสิ้น' :
                           app.status === 4 ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button 
                          onClick={() => handleUpdateStatus(app, 2)}
                          className="text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded border border-yellow-200 font-semibold"
                        >
                          ตรวจเอกสาร
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app, 3)}
                          className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded border border-teal-200 font-semibold"
                        >
                          ผ่านขั้น 3
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app, 4)}
                          className="text-xs bg-green-600 text-white px-2.5 py-1 rounded font-semibold shadow"
                        >
                          อนุมัติ
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app, 5)}
                          className="text-xs bg-red-600 text-white px-2.5 py-1 rounded font-semibold shadow"
                        >
                          ไม่อนุมัติ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Create Loan Dynamic Dialog */}
        {showCreateLoanModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform my-8">
              <div className="bg-blue-900 text-white p-5 flex justify-between items-center">
                <h3 className="text-lg font-bold"><i className="fa-solid fa-circle-plus mr-2"></i> สร้างและเพิ่มหลักสูตรสินเชื่อใหม่</h3>
                <button onClick={() => setShowCreateLoanModal(false)} className="text-white hover:text-red-200">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">รหัสสินเชื่อ (ตั้งค่ารันอัตโนมัติ)</label>
                    <input 
                      type="text" 
                      value={newLoanCode} 
                      onChange={(e) => setNewLoanCode(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-500 font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1"><span className="text-red-500">*</span> ชื่อสินเชื่อ</label>
                    <input 
                      type="text" 
                      placeholder="กรอกชื่อรายการ" 
                      value={newLoanName} 
                      onChange={(e) => setNewLoanName(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1"><span className="text-red-500">*</span> วงเงินอนุมัติสูงสุด</label>
                    <input 
                      type="number" 
                      placeholder="เช่น 300000" 
                      value={newLimit} 
                      onChange={(e) => setNewLimit(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1"><span className="text-red-500">*</span> เริ่มเปิดยื่นสินเชื่อ</label>
                    <input 
                      type="datetime-local" 
                      value={newStart} 
                      onChange={(e) => setNewStart(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1"><span className="text-red-500">*</span> หมดเขตยื่นกู้</label>
                    <input 
                      type="datetime-local" 
                      value={newEnd} 
                      onChange={(e) => setNewEnd(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">รายละเอียดสินเชื่อ</label>
                  <textarea 
                    rows="2" 
                    placeholder="กรอกคำอธิบายและวัตถุประสงค์สินเชื่อ" 
                    value={newDetails} 
                    onChange={(e) => setNewDetails(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">เงื่อนไขการพิจารณาอย่างย่อ</label>
                  <textarea 
                    rows="2" 
                    placeholder="ข้อกำหนดการคัดกรองเบื้องต้น" 
                    value={newConditions} 
                    onChange={(e) => setNewConditions(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  ></textarea>
                </div>

                {/* PDF Request and Form Download */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-2"><i className="fa-solid fa-cloud-arrow-up text-blue-900 mr-1.5"></i> เอกสารอนุมัติลงทะเบียนสินเชื่อ</h4>
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    <a 
                      href={FORM_DOWNLOAD_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full md:w-auto bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold text-center"
                    >
                      <i className="fa-solid fa-download mr-1"></i> ดาวน์โหลดแบบฟอร์มขอเพิ่มสินเชื่อ
                    </a>
                    <div className="flex-1 w-full">
                      <input type="file" accept=".pdf" className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>

                {/* Dynamic Configuration Fields */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-3"><i className="fa-solid fa-gears mr-1.5 text-blue-800"></i> ตั้งค่าข้อมูลเพิ่มเติมที่ผู้กู้จำเป็นต้องส่งข้อมูล</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={requireGPS} 
                        onChange={(e) => setRequireGPS(e.target.checked)} 
                        className="rounded text-blue-800" 
                      />
                      <span className="text-sm font-bold text-gray-700">บังคับขอสิทธิ์ GPS ตรวจจับตำแหน่งเพื่อยืนยันพิกัดตอนยื่นกู้</span>
                    </label>

                    {/* Dynamic Questions simulating google form */}
                    <div className="space-y-3">
                      {customQuestions.map((q, idx) => (
                        <div key={idx} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 relative">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-800">คำถามข้อที่ {idx + 1} (Dynamic Field)</span>
                            <button 
                              onClick={() => setCustomQuestions(customQuestions.filter((_, qIdx) => qIdx !== idx))} 
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              type="text" 
                              placeholder="กรอกชื่อคำถาม" 
                              value={q.question} 
                              onChange={(e) => {
                                const temp = [...customQuestions];
                                temp[idx].question = e.target.value;
                                setCustomQuestions(temp);
                              }}
                              className="border border-gray-300 rounded-lg p-1.5 text-sm"
                            />
                            <select 
                              value={q.type} 
                              onChange={(e) => {
                                const temp = [...customQuestions];
                                temp[idx].type = e.target.value;
                                setCustomQuestions(temp);
                              }}
                              className="border border-gray-300 rounded-lg p-1.5 text-sm bg-white"
                            >
                              <option value="text">กรอกข้อความคำตอบ</option>
                              <option value="dropdown">ตัวเลือกประเภทดร็อปดาวน์</option>
                              <option value="upload">อัปโหลดรูปภาพหลักฐาน</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleAddQuestion}
                      className="border-2 border-dashed border-blue-200 text-blue-800 hover:bg-blue-50/50 py-2 w-full rounded-lg text-sm font-bold transition-all"
                    >
                      <i className="fa-solid fa-plus-circle mr-1"></i> เพิ่มคำถามประเภทฟอร์มแบบ Dynamic (คล้าย Google Form)
                    </button>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button 
                  onClick={() => setShowCreateLoanModal(false)} 
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleCreateLoanSubmit} 
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-bold"
                >
                  สร้างรายการสินเชื่อ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Switcher หน้าจอจำลอง
  switch (currentPage) {
    case 'login': return renderLogin();
    case 'register-form': return renderRegisterForm();
    case 'user-dashboard': return renderUserDashboard();
    case 'status-tracking': return renderStatusTracking();
    case 'admin-dashboard': return renderAdminDashboard();
    default: return renderLogin();
  }
}
