import React, { useState } from "react";
import axios from "axios";

const EmployeeForm = ({ employee, onSubmit }) => {
	const [name, setName] = useState(employee ? employee.name : "");
	const [username, setUsername] = useState(employee ? employee.username : "");
	const [phone, setPhone] = useState(employee ? employee.phone : "");
	const [email, setEmail] = useState(employee ? employee.email : "");
	const [avatar, setAvatar] = useState(null); // State để lưu trữ file ảnh

	const handleSubmit = async (e) => {
		e.preventDefault();

		// FormData dùng để gửi dữ liệu nhân viên (text fields) và file ảnh (nếu có)
		const formData = new FormData();
		formData.append("name", name);
		formData.append("username", username);
		formData.append("phone", phone);
		formData.append("email", email);

		// Kiểm tra nếu có ảnh được chọn
		if (avatar) {
			formData.append("avatar", avatar); // Thêm file ảnh vào formData
		}

		try {
			let response;
			if (employee) {
				// Sửa thông tin nhân viên (bao gồm cả việc sửa ảnh nếu có)
				response = await axios.put(`http://103.92.24.44:5000/api/employees/${employee._id}`, formData, {
					headers: {
						"Content-Type": "multipart/form-data", // Header để gửi dữ liệu dạng FormData
					},
				});
			} else {
				// Thêm nhân viên mới
				response = await axios.post("http://103.92.24.44:5000/api/employees", formData, {
					headers: {
						"Content-Type": "multipart/form-data", // Header để gửi dữ liệu dạng FormData
					},
				});
			}

			// Gọi hàm onSubmit sau khi xử lý xong
			onSubmit();
		} catch (error) {
			console.error("Có lỗi xảy ra:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
			<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
			<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
			<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

			{/* Input để chọn ảnh */}
			<input
				type="file"
				onChange={(e) => setAvatar(e.target.files[0])}
				accept="image/*" // Chỉ chấp nhận file ảnh
			/>
			<button type="submit">Lưu</button>
		</form>
	);
};

export default EmployeeForm;
