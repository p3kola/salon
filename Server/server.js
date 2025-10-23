const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const revenueRoutes = require("./routes/revenue");

const app = express();

// Cấu hình CORS
app.use(
	cors({
		origin: "http://103.92.24.44:3000", // Địa chỉ của frontend React
		methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
		credentials: true, // Nếu bạn cần gửi cookie hoặc thông tin xác thực
	})
);
// Endpoint trả về thời gian hiện tại của máy chủ
app.get("/api/current-time", (req, res) => {
	const currentTime = new Date();
	res.json({ currentTime: currentTime.toLocaleString() }); // Trả về thời gian dưới dạng chuỗi
});
const PORT = process.env.PORT || 5000;

// Kết nối tới MongoDB
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Cấu hình CORS
app.use(
	cors({
		origin: "http://103.92.24.44:3000", // Địa chỉ của frontend React
		methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
		credentials: true, // Nếu bạn cần gửi cookie hoặc thông tin xác thực
	})
);

// Middleware để log thời gian theo host
app.use((req, res, next) => {
	const currentHostTime = new Date(); // Lấy thời gian của hệ thống host
	console.log(`Request nhận vào lúc: ${currentHostTime.toString()}`);
	next();
});
revenueRoutes;
app.use("/api/revenue", revenueRoutes);
// Middleware
app.use(express.json());

// Cấu hình để phục vụ các file tĩnh từ thư mục "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Các route API
const employeeRoutes = require("./routes/employees");
const earningRoutes = require("./routes/earnings");

app.use("/api/employees", employeeRoutes);
app.use("/api/earnings", earningRoutes);

// Khởi động server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
