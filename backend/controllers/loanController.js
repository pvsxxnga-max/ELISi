const Loan = require('../models/Loan');

exports.getAvailableLoans = async (req, res) => {
  try {
    const now = new Date();
    // คำนวณเวลาย้อนหลัง 24 ชั่วโมง
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // ดึงสินเชื่อทั้งหมดที่:
    // 1. ยังไม่ถึงเวลาเริ่ม (โชว์ปุ่มเทาที่หน้าบ้าน)
    // 2. อยู่ในช่วงเวลา
    // 3. หมดเขตไปแล้ว แต่ยังไม่เกิน 24 ชั่วโมง
    const loans = await Loan.find({
      endDate: { $gte: twentyFourHoursAgo }
    }).sort({ startDate: 1 });

    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
