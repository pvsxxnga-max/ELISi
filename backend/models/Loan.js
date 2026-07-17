const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  loanCode: { type: String, required: true, unique: true }, // รันอัตโนมัติหรือตั้งเอง
  creditLimit: { type: Number, required: true },
  details: { type: String },
  conditions: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pdfFormUrl: { type: String }, // ลิงก์เก็บไฟล์เอกสารขออนุญาต
  customFields: [{
    fieldType: { type: String, enum: ['text', 'dropdown', 'upload', 'gps'] },
    question: { type: String },
    options: [String], // สำหรับ dropdown
    isRequired: { type: Boolean, default: true }
  }],
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
