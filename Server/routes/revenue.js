const express = require("express");
const mongoose = require("mongoose");
const Revenue = require("../models/Revenue");

const router = express.Router();

// Hàm cập nhật doanh thu hàng tháng
const updateMonthlyRevenue = async (employeeId, month, year, amount, customers) => {
	const query = { employeeId, month, year };
	const update = { $inc: { totalAmount: amount, customerCount: customers } };
	const options = { upsert: true, new: true }; // Tạo mới nếu chưa có, cập nhật nếu đã tồn tại
	return Revenue.findOneAndUpdate(query, update, options);
};

// Hàm cập nhật doanh thu tổng của salon
const updateSalonMonthlyRevenue = async (month, year, amount, customers) => {
	const query = { employeeId: null, month, year }; // employeeId = null => doanh thu salon
	const update = { $inc: { totalAmount: amount, customerCount: customers } };
	const options = { upsert: true, new: true }; // Tạo mới nếu chưa có, cập nhật nếu đã tồn tại
	return Revenue.findOneAndUpdate(query, update, options);
};

// Cập nhật doanh thu cho nhân viên
router.post("/update", async (req, res) => {
	const { employeeId, amount, customers } = req.body;
	const month = new Date().getMonth() + 1; // Lấy tháng hiện tại
	const year = new Date().getFullYear(); // Lấy năm hiện tại

	try {
		// Cập nhật doanh thu cho nhân viên
		await updateMonthlyRevenue(employeeId, month, year, amount, customers);
		// Cập nhật doanh thu tổng cho salon
		await updateSalonMonthlyRevenue(month, year, amount, customers);
		res.json({ message: "Doanh thu đã được cập nhật!" });
	} catch (error) {
		console.error("Lỗi khi cập nhật doanh thu:", error);
		res.status(500).json({ message: "Lỗi khi cập nhật doanh thu." });
	}
});

// Lấy doanh thu theo tháng cho nhân viên hoặc salon
router.get("/employee/:id/:month/:year", async (req, res) => {
	const { id, month, year } = req.params;

	try {
		const revenue = await Revenue.findOne({ employeeId: id === "salon" ? null : new mongoose.Types.ObjectId(id), month, year });

		if (!revenue) {
			return res.status(404).json({ message: "Không có doanh thu cho tháng này." });
		}

		res.json(revenue);
	} catch (error) {
		console.error("Lỗi khi lấy doanh thu theo tháng:", error);
		res.status(500).json({ message: "Lỗi khi lấy doanh thu theo tháng" });
	}
});

// Lấy doanh thu theo năm cho nhân viên hoặc salon
router.get("/employee/:id/:year", async (req, res) => {
	const { id, year } = req.params;

	try {
		const revenue = await Revenue.aggregate([
			{
				$match: {
					employeeId: id === "salon" ? null : new mongoose.Types.ObjectId(id),
					year: Number(year),
				},
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$totalAmount" },
					customerCount: { $sum: "$customerCount" },
				},
			},
		]);

		if (revenue.length === 0) {
			return res.status(404).json({ message: "Không có doanh thu cho năm này." });
		}

		res.json(revenue[0]);
	} catch (error) {
		console.error("Lỗi khi lấy doanh thu theo năm:", error);
		res.status(500).json({ message: "Lỗi khi lấy doanh thu theo năm" });
	}
});

// Lấy tổng doanh thu của salon theo năm
router.get("/salon/year/:year", async (req, res) => {
	const { year } = req.params;
	try {
		const revenue = await Revenue.aggregate([
			{ $match: { employeeId: null, year: Number(year) } },
			{
				$group: {
					_id: "$year",
					totalAmount: { $sum: "$totalAmount" },
					customerCount: { $sum: "$customerCount" },
				},
			},
		]);
		res.json(revenue[0] || { totalAmount: 0, customerCount: 0 });
	} catch (error) {
		console.error("Lỗi khi lấy doanh thu năm của salon:", error);
		res.status(500).json({ message: "Lỗi khi lấy doanh thu năm của salon." });
	}
});

module.exports = router;
