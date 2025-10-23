const express = require("express");
const Employee = require("../models/Employee");
const multer = require("multer"); // Import multer
const path = require("path");
const router = express.Router();

// Cấu hình multer để lưu trữ file upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // Thư mục để lưu trữ hình ảnh
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file dựa trên thời gian và phần mở rộng của file gốc
	},
});

const upload = multer({ storage });

// Thêm nhân viên với hình ảnh
router.post("/", upload.single("avatar"), async (req, res) => {
	const { name, username } = req.body;

	try {
		// Lưu thông tin nhân viên kèm đường dẫn ảnh
		const newEmployee = new Employee({
			name,
			username,
			avatar: req.file ? `/uploads/${req.file.filename}` : "", // Đường dẫn ảnh được lưu
		});
		await newEmployee.save();
		res.status(201).json(newEmployee);
	} catch (error) {
		console.error("Lỗi khi thêm nhân viên:", error);
		res.status(500).json({ message: "Lỗi khi thêm nhân viên" });
	}
});
// Endpoint để lấy file ảnh
router.get("/uploads/:filename", (req, res) => {
	const filePath = path.join(__dirname, "uploads", req.params.filename);
	res.sendFile(filePath);
});
//phutd
// Lấy danh sách nhân viên
router.get("/", async (req, res) => {
	try {
		const employees = await Employee.find();
		res.json(employees);
	} catch (error) {
		console.error("Lỗi khi lấy danh sách nhân viên:", error);
		res.status(500).json({ message: "Lỗi khi lấy danh sách nhân viên" });
	}
});

// Thêm nhân viên mới
router.post("/", async (req, res) => {
	const { name, phone, email } = req.body;
	try {
		// Kiểm tra nếu các trường bắt buộc không có giá trị
		if (!name) {
			return res.status(400).json({ message: "Name is required" });
		}

		const newEmployee = new Employee({ name, phone, email });
		await newEmployee.save();
		res.status(201).json(newEmployee);
	} catch (error) {
		console.error("Lỗi khi thêm nhân viên mới:", error);
		res.status(400).json({ message: "Lỗi khi thêm nhân viên mới", error: error.message });
	}
});

// Xóa nhân viên theo ID
router.delete("/:id", async (req, res) => {
	try {
		const employee = await Employee.findByIdAndDelete(req.params.id);
		if (!employee) {
			return res.status(404).json({ message: "Không tìm thấy nhân viên." });
		}
		res.status(200).json({ message: "Nhân viên đã được xóa." });
	} catch (error) {
		res.status(500).json({ message: "Lỗi khi xóa nhân viên." });
	}
});

module.exports = router;
