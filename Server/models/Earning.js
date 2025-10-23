const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
	employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
	customers: { type: Number, required: true }, // Số lượng khách hàng
});

module.exports = mongoose.model("Earning", earningSchema);
