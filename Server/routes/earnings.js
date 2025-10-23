const express = require("express");
const Earning = require("../models/Earning");
const router = express.Router();
const mongoose = require("mongoose");
const Revenue = require("../models/Revenue");

// Helper function to generate date range for different time periods
const getStartDate = (period) => {
	const now = new Date();
	switch (period) {
		case "day":
			return new Date(now.getFullYear(), now.getMonth(), now.getDate());
		case "week":
			const firstDayOfWeek = now.getDate() - now.getDay(); // Sunday is 0
			return new Date(now.setDate(firstDayOfWeek));
		case "month":
			return new Date(now.getFullYear(), now.getMonth(), 1);
		case "year":
			return new Date(now.getFullYear(), 0, 1);
		default:
			return new Date(0); // Defaults to the earliest possible date
	}
};

// Hàm cập nhật doanh thu theo tháng/năm
const updateMonthlyRevenue = async (employeeId, amount, customers) => {
	const today = new Date();
	const month = today.getMonth() + 1; // Tháng hiện tại
	const year = today.getFullYear(); // Năm hiện tại

	// Tìm hoặc tạo mới doanh thu cho nhân viên hoặc salon (nếu employeeId là null)
	const query = { employeeId, month, year };
	const update = {
		$inc: { totalAmount: amount, customerCount: customers }, // Cộng dồn thu nhập và số khách
	};

	try {
		await Revenue.findOneAndUpdate(query, update, { upsert: true }); // Nếu không có doanh thu thì tạo mới
	} catch (error) {
		console.error("Lỗi khi cập nhật doanh thu:", error);
	}
};

// Server-side route xử lý xóa thu nhập
// Xóa một giao dịch thu nhập dựa trên ID
router.delete("/:id", async (req, res) => {
	const earningId = req.params.id;

	try {
		// Kiểm tra nếu earningId không hợp lệ
		if (!mongoose.Types.ObjectId.isValid(earningId)) {
			return res.status(400).json({ message: "ID không hợp lệ" });
		}

		// Tìm và xóa giao dịch thu nhập
		const deletedEarning = await Earning.findByIdAndDelete(earningId);

		// Nếu không tìm thấy giao dịch thu nhập
		if (!deletedEarning) {
			return res.status(404).json({ message: "Không tìm thấy giao dịch thu nhập" });
		}

		// Giảm doanh thu sau khi xóa giao dịch
		await updateMonthlyRevenue(deletedEarning.employeeId, -deletedEarning.amount, -deletedEarning.customers);

		// Trả về phản hồi thành công
		res.status(200).json({ message: "Xóa giao dịch thành công", deletedEarning });
	} catch (error) {
		console.error("Lỗi khi xóa giao dịch thu nhập:", error);
		res.status(500).json({ message: "Lỗi khi xóa giao dịch thu nhập" });
	}
});

// Cập nhật thu nhập
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { amount } = req.body;

	// Kiểm tra nếu id không hợp lệ
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ message: "ID thu nhập không hợp lệ" });
	}

	try {
		const earning = await Earning.findById(id);

		if (!earning) {
			return res.status(404).json({ message: "Không tìm thấy thu nhập" });
		}

		const oldAmount = earning.amount; // Số tiền cũ

		// Cập nhật số tiền
		earning.amount = amount;
		await earning.save();

		// Điều chỉnh doanh thu (bù trừ số tiền cũ và thêm số tiền mới)
		await updateMonthlyRevenue(earning.employeeId, amount - oldAmount, 0); // Số lượng khách không đổi

		res.json({ message: "Cập nhật thu nhập thành công", earning });
	} catch (error) {
		console.error("Lỗi khi cập nhật thu nhập:", error);
		res.status(500).json({ message: "Lỗi khi cập nhật thu nhập" });
	}
});
// Thêm thu nhập cho nhân viên
router.post("/", async (req, res) => {
	const { employeeId, amount, customers } = req.body;

	// Kiểm tra dữ liệu gửi đến có hợp lệ không
	if (!employeeId || !amount || !customers) {
		return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });
	}

	try {
		// In dữ liệu ra console để kiểm tra
		console.log("Dữ liệu nhận được từ client:", { employeeId, amount, customers });

		const newEarning = new Earning({ employeeId, amount, customers });
		await newEarning.save(); // Lưu vào MongoDB

		// Cập nhật doanh thu
		await updateMonthlyRevenue(employeeId, amount, customers);

		res.status(201).json(newEarning); // Trả về dữ liệu đã lưu
	} catch (error) {
		console.error("Lỗi khi thêm thu nhập:", error); // Ghi log lỗi
		res.status(500).json({ message: "Lỗi khi thêm thu nhập" });
	}
});

// // Lấy thu nhập của một nhân viên
// router.get("/employee/:id", async (req, res) => {
// 	const employeeId = req.params.id;

// 	// Kiểm tra nếu employeeId không hợp lệ
// 	if (!mongoose.Types.ObjectId.isValid(employeeId)) {
// 		return res.status(400).json({ message: "employeeId không hợp lệ" });
// 	}

// 	try {
// 		const earnings = await Earning.find({ employeeId: new mongoose.Types.ObjectId(employeeId) });
// 		if (!earnings || earnings.length === 0) {
// 			return res.status(404).json({ message: "Không có thu nhập cho nhân viên này." });
// 		}
// 		res.json(earnings);
// 	} catch (error) {
// 		console.error("Lỗi khi lấy thu nhập của nhân viên:", error);
// 		res.status(500).json({ message: "Lỗi khi lấy thu nhập của nhân viên" });
// 	}
// });

//phutd

// router.get("/current-time", (req, res) => {
// 	const currentTime = new Date();
// 	res.json({ currentTime });
// });
// Lấy danh sách các giao dịch trong ngày cho nhân viên
router.get("/employee/:id/statistics/day", async (req, res) => {
	const employeeId = req.params.id;
	const today = new Date();
	// console.log("Ngày giờ hiện tại của máy chủ BK :", today.toLocaleString()); // Kiểm tra thời gian host
	const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	// Kiểm tra nếu employeeId không hợp lệ
	if (!mongoose.Types.ObjectId.isValid(employeeId)) {
		return res.status(400).json({ message: "employeeId không hợp lệ" });
	}

	try {
		// Tìm tất cả các giao dịch của nhân viên từ đầu ngày đến hiện tại
		const earnings = await Earning.find({
			employeeId: new mongoose.Types.ObjectId(employeeId),
			date: { $gte: startOfDay },
		}).sort({ date: -1 }); // Sắp xếp theo thời gian giảm dần

		if (!earnings || earnings.length === 0) {
			// Trả về mảng rỗng nếu không có thu nhập thay vì lỗi
			return res.status(200).json([]);
		}

		res.json(earnings); // Trả về danh sách các giao dịch
	} catch (error) {
		console.error("Lỗi khi lấy danh sách thu nhập trong ngày:", error);
		res.status(500).json({ message: "Lỗi khi lấy thu nhập trong ngày" });
	}
});
//phutd
// Lấy thu nhập trong tuần cho nhân viên
router.get("/employee/:id/statistics/week", async (req, res) => {
	const employeeId = req.params.id;
	const today = new Date();
	const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

	// Kiểm tra nếu employeeId không hợp lệ
	if (!mongoose.Types.ObjectId.isValid(employeeId)) {
		return res.status(400).json({ message: "employeeId không hợp lệ" });
	}

	try {
		console.log(`Lấy thu nhập cho nhân viên: ${employeeId}, từ đầu tuần: ${startOfWeek}`);

		const earnings = await Earning.aggregate([
			{
				$match: {
					employeeId: new mongoose.Types.ObjectId(employeeId),
					date: { $gte: startOfWeek },
				},
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
					customerCount: { $sum: "$customers" },
				},
			},
		]);

		if (!earnings || earnings.length === 0) {
			// Trả về giá trị mặc định nếu không có thu nhập thay vì lỗi
			return res.status(200).json({ totalAmount: 0, customerCount: 0 });
		}

		res.json(earnings[0]);
	} catch (error) {
		console.error("Lỗi khi lấy thu nhập trong tuần:", error);
		res.status(500).json({ message: "Lỗi khi lấy thu nhập trong tuần" });
	}
});

// Thống kê thu nhập cho một nhân viên trong khoảng thời gian (ngày, tuần, tháng, năm)
router.get("/employee/:id/statistics", async (req, res) => {
	const { period } = req.query; // day, week, month, year
	const employeeId = req.params.id;
	const startDate = getStartDate(period);

	// Kiểm tra nếu employeeId không hợp lệ
	if (!mongoose.Types.ObjectId.isValid(employeeId)) {
		return res.status(400).json({ message: "employeeId không hợp lệ" });
	}

	try {
		const earnings = await Earning.aggregate([
			{
				$match: {
					employeeId: new mongoose.Types.ObjectId(employeeId), // Thêm 'new'
					date: { $gte: startDate },
				},
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
					customerCount: { $sum: "$customers" },
				},
			},
		]);

		res.json(earnings.length > 0 ? earnings[0] : { totalAmount: 0, customerCount: 0 });
	} catch (error) {
		console.error("Lỗi khi thống kê thu nhập của nhân viên:", error);
		res.status(500).json({ message: "Lỗi khi thống kê thu nhập của nhân viên" });
	}
});

// Thống kê thu nhập cho toàn bộ salon trong khoảng thời gian (ngày, tuần, tháng, năm)
router.get("/salon/statistics", async (req, res) => {
	const { period } = req.query; // day, week, month, year
	const startDate = getStartDate(period);

	try {
		const earnings = await Earning.aggregate([
			{
				$match: { date: { $gte: startDate } },
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
					customerCount: { $sum: "$customers" },
				},
			},
		]);

		res.json(earnings.length > 0 ? earnings[0] : { totalAmount: 0, customerCount: 0 });
	} catch (error) {
		console.error("Lỗi khi thống kê thu nhập của tiệm:", error);
		res.status(500).json({ message: "Lỗi khi thống kê thu nhập của tiệm" });
	}
});

module.exports = router;
