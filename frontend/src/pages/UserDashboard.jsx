import React, { useState, useEffect } from 'react';

export default function UserDashboard() {
  const [loans, setLoans] = useState([]);

  // Mock Data จำลองข้อมูลจาก Backend
  useEffect(() => {
    setLoans([
      { id: 1, name: 'สินเชื่อเพื่อเกษตรกรรายย่อย', limit: 200000, startDate: '2026-01-01', endDate: '2026-06-21' },
      { id: 2, name: 'สินเชื่อเพื่อการศึกษา', limit: 100000, startDate: '2026-08-01', endDate: '2026-12-31' }, // ยังไม่ถึงเวลา
    ]);
  }, []);

  const checkLoanStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { status: 'upcoming', text: 'ยังไม่ถึงระยะเวลา', color: 'bg-orange-100 text-orange-600', btnState: 'disabled' };
    if (now > end) return { status: 'expired', text: 'หมดเขตการยื่นสินเชื่อ', color: 'bg-gray-100 text-gray-500', btnState: 'disabled' };
    return { status: 'active', text: 'เปิดรับสมัคร', color: 'bg-blue-100 text-blue-600', btnState: 'active' };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white pt-10 pb-20 px-6 rounded-b-3xl shadow-md">
        <h2 className="text-xl">ยินดีต้อนรับ</h2>
        <h1 className="text-3xl font-bold">พัชญธิดา ปานเผือก</h1>
        <p className="text-blue-100 mt-1">ระบบ e-Lending Information System (e-LIS)</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-10">
        <h3 className="text-xl font-bold mb-4 text-gray-800">สินเชื่อที่เปิดรับสมัคร</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {loans.map(loan => {
            const loanStatus = checkLoanStatus(loan.startDate, loan.endDate);
            return (
              <div key={loan.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 text-center relative overflow-hidden">
                <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-semibold ${loanStatus.color}`}>
                  {loanStatus.text}
                </span>
                <div className="w-16 h-16 mx-auto mt-6 bg-blue-50 rounded-full flex items-center justify-center text-primary text-2xl mb-3">
                  <i className="fa-solid fa-seedling"></i>
                </div>
                <h4 className="font-bold text-lg text-gray-800">{loan.name}</h4>
                <p className="text-gray-500 text-sm mt-2">วงเงินสูงสุด</p>
                <p className="text-2xl font-bold text-primary mb-4">{loan.limit.toLocaleString()} บาท</p>
                
                <button 
                  disabled={loanStatus.btnState === 'disabled'}
                  className={`w-full py-2 rounded-lg font-bold text-lg transition-colors ${
                    loanStatus.btnState === 'active' 
                    ? 'bg-primary text-white hover:bg-blue-800' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ยื่นสินเชื่อ
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
