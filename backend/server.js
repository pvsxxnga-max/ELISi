const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); // สำหรับจำลองการส่งเมลอัปเดตสถานะให้ผู้กู้

const app = express();
app.use(express.json());
app.use(cors());

// --- IN-MEMORY DATABASE (จำลองเพื่อความพร้อมทดสอบทันทีโดยไม่ต้องการ DB ซับซ้อน) ---
let dbLoans = [
  {
    id: "LOAN-2569-001",
    name: "สินเชื่อเพื่อเกษตรกรรายย่อย",
    limit: 200000,
    details: "ช่วยเหลือเกษตรกรรายย่อยเพื่อฟื้นฟูผลผลิตและจัดหาปัจจัยการผลิต",
    conditions: "เป็นเกษตรกรที่มีทะเบียนเกษตรกร และมีที่ดินทำกินของตนเอง",
    startDate: "2026-01-01T00:00",
    endDate: "2026-06-21T14:30",
    requireGPS: true,
    customQuestions: []
  }
];

let dbApplications = [
  {
    appId: "APP-2569-0001234",
    loanName: "สินเชื่อเพื่อเกษตรกรรายย่อย",
    applicantName: "พัชญธิดา ปานเผือก",
    submitDate: "2026-05-20T14:30:00Z",
    status: 2, // 1=ส่งคำขอแล้ว, 2=กำลังตรวจสอบ, 3=ตรวจสอบเสร็จสิ้น, 4=อนุมัติ, 5=ไม่อนุมัติ
    step3Deadline: "2026-05-28T14:30:00Z",
    remarks: [
      { date: "2026-05-21T09:15:00Z", text: "อยู่ระหว่างตรวจสอบเอกสารประกอบคำขอ", staff: "เจ้าหน้าที่สินเชื่อ" }
    ],
    email: "phitchayada@example.com",
    gps: "13.7563, 100.5018"
  }
];

// --- API ENDPOINTS ---

// 1. ดึงข้อมูลสินเชื่อทั้งหมด (Logic เช็คเงื่อนไขหมดเขตและเวลาแสดงผล)
app.get('/api/loans', (req, res) => {
  const now = new Date();
  
  // กรองเฉพาะสินเชื่อที่:
  // - ยังไม่ถึงกำหนด (ยังส่งเรื่องไม่ได้ แต่อาจแสดงขึ้นหน้าเว็บเป็นสีเทา)
  // - สินเชื่อที่เลยวันหมดอายุไปแล้ว "แต่ไม่เกิน 24 ชั่วโมง" (จะซ่อนทันทีถ้าพ้น 24 ชั่วโมง)
  const visibleLoans = dbLoans.filter(loan => {
    const end = new Date(loan.endDate);
    const timeSinceEnd = now.getTime() - end.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    // หากพ้นเขตและเกิน 24 ชั่วโมง จะส่งคืนค่า false เพื่อลบออกจากระบบแสดงผลอัตโนมัติ
    if (now > end && timeSinceEnd > twentyFourHours) {
      return false;
    }
    return true;
  });

  res.status(200).json({ success: true, count: visibleLoans.length, data: visibleLoans });
});

// 2. สร้างสินเชื่อใหม่โดยเจ้าหน้าที่
app.post('/api/loans', (req, res) => {
  const { name, id, limit, details, conditions, startDate, endDate, requireGPS, customQuestions } = req.body;

  if(!name || !limit || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
  }

  const newLoan = {
    id: id || `LOAN-2569-${Math.floor(100 + Math.random() * 900)}`,
    name,
    limit: parseFloat(limit),
    details,
    conditions,
    startDate,
    endDate,
    requireGPS: !!requireGPS,
    customQuestions: customQuestions || []
  };

  dbLoans.push(newLoan);
  res.status(201).json({ success: true, message: 'สร้างโครงการสินเชื่อสำเร็จ', data: newLoan });
});

// 3. ดึงสถานะการยื่นกู้ของลูกค้าเฉพาะราย
app.get('/api/applications/:id', (req, res) => {
  const app = dbApplications.find(item => item.appId === req.params.id);
  if (!app) return res.status(404).json({ success: false, message: 'ไม่พบหมายเลขใบคำขอดังกล่าวในระบบ' });
  
  res.status(200).json({ success: true, data: app });
});

// 4. บันทึก/อัปเดตสถานะและส่งเมลแจ้งเตือนลูกค้าอัตโนมัติ (Email Simulation)
app.put('/api/applications/:id/status', (req, res) => {
  const { status, remarkText } = req.body;
  const appIndex = dbApplications.findIndex(item => item.appId === req.params.id);

  if (appIndex === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบคำขอนี้' });
  }

  const app = dbApplications[appIndex];
  app.status = status;
  
  const now = new Date();
  const remarkObj = {
    date: now.toISOString(),
    text: remarkText || 'อัปเดตสถานะการตรวจสอบโดยเจ้าหน้าที่สินเชื่อสำเร็จ',
    staff: 'ผู้ดูแลระบบระบบ e-LIS'
  };
  
  app.remarks.unshift(remarkObj);

  // --- Real-time Email Alert (Simulation) ---
  console.log(`[REAL-TIME EMAIL OUTBOUND] : ส่งไปที่ ${app.email}`);
  console.log(`เรียนคุณ ${app.applicantName}`);
  console.log(`สถานะใบคำขอ ${app.appId} ได้รับการอัปเดตแล้วเป็น: ขั้นตอนที่ ${status}`);
  console.log(`หมายเหตุเจ้าหน้าที่: "${remarkText}"`);

  res.status(200).json({ success: true, message: 'อัปเดตสถานะและส่งอีเมลแจ้งเตือนลูกค้าเรียบร้อยแล้ว', data: app });
});

// 5. รายงานสถิติและคำขอย้อนหลัง (Dashboard Admin)
app.get('/api/admin/dashboard-stats', (req, res) => {
  const stats = {
    totalPending: dbApplications.filter(a => a.status === 1).length,
    reviewing: dbApplications.filter(a => a.status === 2).length,
    step3Finished: dbApplications.filter(a => a.status === 3).length,
    approved: dbApplications.filter(a => a.status === 4).length,
    rejected: dbApplications.filter(a => a.status === 5).length,
  };
  res.status(200).json({ success: true, stats });
});

// ตั้งค่าพอร์ตเซิร์ฟเวอร์
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SUCCESS] e-LIS Backend Server is operational on port ${PORT}`);
});
