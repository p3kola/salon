import React, { useState } from "react";

const IncomeForm = ({ onSubmit }) => {
	const [amount, setAmount] = useState("");
	const [customers, setCustomers] = useState(1); // Số lượng khách mặc định là 1

	const handleSubmit = (e) => {
		e.preventDefault();
		if (amount) {
			onSubmit({
				amount: parseFloat(amount),
				customers,
			});
			setAmount(""); // Xóa số tiền sau khi lưu
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label>Số tiền:</label>
				<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nhập số tiền" />
			</div>
			<button type="submit">Lưu</button>
		</form>
	);
};

export default IncomeForm;
