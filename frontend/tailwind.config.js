export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
      },
      colors: {
        primary: '#1E40AF', // โทนสีน้ำเงินกรมท่า e-LIS
        secondary: '#E0E7FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
