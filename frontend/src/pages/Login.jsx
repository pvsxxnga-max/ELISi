import React from 'react';
import Swal from 'sweetalert2';

export default function Login() {
  const handleGoogleLogin = () => {
    // จำลองการเข้าสู่ระบบ
    Swal.fire({
      icon: 'success',
      title: 'เข้าสู่ระบบสำเร็จ',
      text: 'กำลังพาท่านเข้าสู่ระบบ e-LIS',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/profile-setup'; // พาไปหน้ากรอกข้อมูล
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* เปลี่ยนโลโก้จากกระทรวงเป็น e-LIS ตามความต้องการ */}
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            e-LIS
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900">e-Lending Information System</h1>
            <p className="text-sm text-gray-500">ระบบสารสนเทศเพื่อการบริหารสินเชื่อ</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-primary">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h2>
          
          <form className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-regular fa-user text-gray-400"></i>
                </div>
                <input type="text" placeholder="ชื่อผู้ใช้" className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-lg p-2 border" />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input type="password" placeholder="รหัสผ่าน" className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-lg p-2 border" />
              </div>
            </div>

            <button type="button" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-800">
              <i className="fa-solid fa-right-to-bracket mt-1 mr-2"></i> เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 text-lg">หรือ</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={handleGoogleLogin} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-lg font-medium text-gray-700 hover:bg-gray-50">
                <i className="fa-brands fa-google text-red-500 mt-1 mr-2"></i> ลงทะเบียนด้วย Google
              </button>
              <button onClick={() => window.location.href='/admin-login'} className="w-full flex justify-center py-2 px-4 border border-blue-200 rounded-md shadow-sm bg-blue-50 text-lg font-medium text-primary hover:bg-blue-100">
                <i className="fa-solid fa-user-tie mt-1 mr-2"></i> สำหรับเจ้าหน้าที่
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
