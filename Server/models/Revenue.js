const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null }, // null nếu là doanh thu toàn salon
    month: { type: Number, required: true }, // Tháng của doanh thu (1-12)
    year: { type: Number, required: true },  // Năm của doanh thu
    totalAmount: { type: Number, default: 0 }, // Tổng doanh thu trong tháng
    customerCount: { type: Number, default: 0 }, // Tổng số lượng khách hàng
    createdAt: { type: Date, default: Date.now } // Ngày tạo bản ghi
});

module.exports = mongoose.model("Revenue", revenueSchema);
