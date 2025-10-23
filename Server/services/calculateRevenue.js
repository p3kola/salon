const Earning = require("../models/Earning");
const Revenue = require("../models/Revenue");

async function calculateMonthlyRevenue(month, year) {
  try {
    // Lấy tất cả thu nhập của tháng và năm chỉ định
    const earnings = await Earning.aggregate([
      { 
        $match: { 
          month: month, 
          year: year 
        } 
      },
      { 
        $group: { 
          _id: "$employeeId", // Nhóm theo nhân viên
          totalRevenue: { $sum: "$amount" }, // Tính tổng doanh thu của từng nhân viên
        } 
      }
    ]);

    // Tính tổng doanh thu của toàn bộ tiệm
    const totalRevenue = earnings.reduce((sum, earning) => sum + earning.totalRevenue, 0);

    // Tạo object để lưu doanh thu của từng nhân viên
    const employeeRevenue = {};
    earnings.forEach(earning => {
      employeeRevenue[earning._id] = earning.totalRevenue;
    });

    // Lưu vào bảng Revenue
    const newRevenue = new Revenue({
      month: month,
      year: year,
      totalRevenue: totalRevenue,
      employeeRevenue: employeeRevenue,
    });
    
    await newRevenue.save();
    console.log("Doanh thu tháng", month, "năm", year, "đã được lưu.");
  } catch (error) {
    console.error("Lỗi khi tính doanh thu:", error);
  }
}

module.exports = calculateMonthlyRevenue;
