const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
	name: String,
	username: String,
	phone: String,
	email: String,
	avatar: String, // Lưu tên file ảnh
});

module.exports = mongoose.model("Employee", employeeSchema);
