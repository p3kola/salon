import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeForm from "../components/EmployeeForm";
import IncomeForm from "../components/IncomeForm";
import RevenueView from "../components/RevenueView";

const Home = () => {
	const [employees, setEmployees] = useState([]);
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [earningsToday, setEarningsToday] = useState([]); // Danh sách thu nhập hôm nay
	const [earningsWeek, setEarningsWeek] = useState({ totalAmount: 0, customerCount: 0 }); // Thêm thu nhập tuần
	const [view, setView] = useState("home"); // 'home', 'add', 'delete' là các view khác nhau

	// State để lưu thông tin chỉnh sửa
	const [editingEarning, setEditingEarning] = useState(null);
	const [newAmount, setNewAmount] = useState(0);

	// Lấy danh sách nhân viên khi component được mount
	useEffect(() => {
		fetchEmployees();
	}, []);

	// Chọn nhân viên đầu tiên mặc định khi danh sách nhân viên thay đổi
	useEffect(() => {
		if (employees.length > 0) {
			handleSelectEmployee(employees[0]);
		}
	}, [employees]);

	// Khi selectedEmployee thay đổi, lấy thu nhập trong ngày và trong tuần
	useEffect(() => {
		if (selectedEmployee) {
			fetchEarningsToday(selectedEmployee._id);
			fetchEarningsWeek(selectedEmployee._id);
		}
	}, [selectedEmployee]);

	// Hàm lấy danh sách nhân viên từ API
	const fetchEmployees = async () => {
		try {
			const response = await axios.get("http://103.92.24.44:5000/api/employees");
			setEmployees(response.data);
		} catch (error) {
			console.error("Có lỗi xảy ra khi lấy danh sách nhân viên:", error);
		}
	};
	//phutd
	// Hàm lấy thu nhập trong ngày từ API
	const fetchEarningsToday = async (employeeId) => {
		try {
			const response = await axios.get(`http://103.92.24.44:5000/api/earnings/employee/${employeeId}/statistics/day`);

			if (Array.isArray(response.data) && response.data.length > 0) {
				setEarningsToday(response.data); // Hiển thị tất cả giao dịch nếu có
			} else {
				setEarningsToday([]); // Nếu không có dữ liệu, hiển thị danh sách rỗng
			}
		} catch (error) {
			console.error("Có lỗi xảy ra khi lấy thu nhập trong ngày:", error);
			setEarningsToday([]); // Nếu có lỗi, đặt earningsToday là mảng rỗng
		}
	};

	// Hàm lấy thu nhập trong tuần từ API
	const fetchEarningsWeek = async (employeeId) => {
		try {
			const response = await axios.get(`http://103.92.24.44:5000/api/earnings/employee/${employeeId}/statistics/week`);

			// Đảm bảo rằng phản hồi không bị lỗi và có dữ liệu hợp lệ
			if (response.data && typeof response.data === "object") {
				setEarningsWeek(response.data); // Cập nhật thu nhập tuần
			} else {
				setEarningsWeek({ totalAmount: 0, customerCount: 0 }); // Mặc định nếu không có dữ liệu
			}
		} catch (error) {
			console.error("Có lỗi xảy ra khi lấy thu nhập trong tuần:", error);
			setEarningsWeek({ totalAmount: 0, customerCount: 0 }); // Nếu có lỗi, đặt mặc định
		}
	};

	// Hiển thị form chỉnh sửa thu nhập
	const handleEditEarning = (earning) => {
		setEditingEarning(earning);
		setNewAmount(earning.amount);
	};

	const handleUpdateEarning = async () => {
		try {
			await axios.put(`http://103.92.24.44:5000/api/earnings/${editingEarning._id}`, {
				amount: newAmount,
			});
			await fetchEarningsToday(selectedEmployee._id); // Cập nhật lại danh sách thu nhập hôm nay
			setEditingEarning(null);
			setNewAmount(0);
		} catch (error) {
			console.error("Có lỗi khi cập nhật thu nhập:", error);
		}
	};

	// Xử lý xóa một giao dịch thu nhập
	const handleDeleteEarning = async (earningId) => {
		try {
			await axios.delete(`http://103.92.24.44:5000/api/earnings/${earningId}`);
			await fetchEarningsToday(selectedEmployee._id); // Cập nhật lại danh sách thu nhập sau khi xóa
			await fetchEarningsWeek(selectedEmployee._id); // Cập nhật thu nhập tuần sau khi xóa
		} catch (error) {
			console.error("Có lỗi khi xóa thu nhập:", error);
		}
	};

	// Chọn một nhân viên từ danh sách
	const handleSelectEmployee = (employee) => {
		setSelectedEmployee(employee);
		fetchEarningsToday(employee._id); // Lấy thu nhập theo ngày
		fetchEarningsWeek(employee._id); // Lấy thu nhập theo tuần
	};

	// Gửi thông tin thu nhập mới
	const handleIncomeSubmit = async (incomeData) => {
		if (!selectedEmployee) {
			alert("Vui lòng chọn nhân viên!");
			return;
		}

		try {
			await axios.post("http://103.92.24.44:5000/api/earnings", {
				employeeId: selectedEmployee._id,
				amount: incomeData.amount,
				customers: incomeData.customers,
			});
			await fetchEarningsToday(selectedEmployee._id); // Cập nhật thu nhập sau khi thêm mới
			await fetchEarningsWeek(selectedEmployee._id); // Cập nhật thu nhập tuần sau khi thêm mới
		} catch (error) {
			console.error("Có lỗi khi thêm thu nhập:", error);
		}
	};
	// Gửi yêu cầu xóa nhân viên
	const handleDeleteEmployeeById = async (id) => {
		try {
			console.log("ID nhân viên đang xóa:", id); // Kiểm tra ID được gửi lên
			await axios.delete(`http://103.92.24.44:5000/api/employees/${id}`);
			fetchEmployees(); // Cập nhật lại danh sách nhân viên sau khi xóa
			setView("home"); // Quay về giao diện home sau khi xóa
		} catch (error) {
			console.error("Có lỗi khi xóa nhân viên:", error);
		}
	};
	//phutd
	// Gửi yêu cầu thêm nhân viên
	// Gửi yêu cầu thêm nhân viên
	const handleFormSubmit = async (employeeData) => {
		try {
			// Tạo một đối tượng FormData
			const formData = new FormData();

			// Thêm các thông tin của nhân viên vào formData
			formData.append("name", employeeData.name);
			formData.append("username", employeeData.username);
			formData.append("phone", employeeData.phone);
			formData.append("email", employeeData.email);

			// Nếu có ảnh avatar thì thêm vào formData
			if (employeeData.avatar) {
				formData.append("avatar", employeeData.avatar); // 'avatar' là tên trường để lưu file ảnh
			}

			// Gửi formData qua API
			await axios.post("http://103.92.24.44:5000/api/employees", formData, {
				headers: {
					"Content-Type": "multipart/form-data", // Đảm bảo rằng header đúng
				},
			});

			// Cập nhật lại danh sách nhân viên sau khi thêm
			fetchEmployees();
			setView("home"); // Quay lại view chính
		} catch (error) {
			console.error("Có lỗi khi thêm nhân viên:", error);
		}
	};

	return (
		<>
			{/* Header được đặt trên cùng */}
			<div className="header">
				<h1>
					<div className="logo">Logo</div>
					Minh Anh Salon
				</h1>
				<div className="employee-buttons">
					<button onClick={() => setView("add")}>Thêm nhân viên</button>
					<button onClick={() => setView("delete")}>Xóa nhân viên</button>
				</div>
			</div>

			{/* Kiểm tra chế độ và ẩn/hiển thị nội dung tương ứng */}
			{/* Nội dung bên dưới header, chia theo tỷ lệ 7/3 */}

			{view === "home" && (
				<div className="container">
					{/* Phần trái (tỷ lệ 7): danh sách nhân viên và form nhập thu nhập tách biệt */}
					<div className="left-section">
						{/* Danh sách nhân viên */}
						<div className="employee-list-section">
							<ul className="employee-list">
								{employees.map((employee) => (
									<li key={employee._id} onClick={() => handleSelectEmployee(employee)}>
										{employee.name} ({employee.username}){/* Nút xóa nhân viên */}
										<button onClick={() => handleDeleteEmployeeById(employee._id)}>Xóa</button>
									</li>
								))}
							</ul>
						</div>

						{/* tong doanh thu */}
						{selectedEmployee && <RevenueView employeeId={selectedEmployee._id || "salon"} />}
						{/* {selectedEmployee && <RevenueView employeeId={selectedEmployee._id} />} */}

						{/* Form nhập thu nhập, tách riêng với danh sách nhân viên */}
						{selectedEmployee && (
							<div className="income-form-section">
								<h3>Nhập thu nhập cho: {selectedEmployee.name}</h3>
								<IncomeForm onSubmit={handleIncomeSubmit} />
							</div>
						)}
					</div>

					{/* Phần phải (tỷ lệ 3): hình đại diện và thu nhập gần đây */}
					<div className="right-section">
						{selectedEmployee && (
							<>
								<div className="employee-avatar-large">
									<div className="avatar-container">
										<img src={selectedEmployee.avatar ? `http://103.92.24.44:5000${selectedEmployee.avatar}` : "path/to/default-avatar.png"} alt={`${selectedEmployee.name}'s avatar`} />
									</div>
								</div>
								{/* phutd */}
								<div className="earnings-list">
									<h3>Thu nhập hôm nay</h3>
									<ul>
										{Array.isArray(earningsToday) && earningsToday.length > 0 ? (
											earningsToday
												.sort((a, b) => new Date(a.date) - new Date(b.date)) // Hiển thị theo thứ tự nhập
												.map((earning, index) => (
													<li key={index}>
														Khách hàng {index + 1}: {earning.amount} VNĐ
														<button onClick={() => handleEditEarning(earning)}>Sửa</button>
														<button
															onClick={() => {
																handleDeleteEarning(earning._id);
															}}
														>
															Xóa
														</button>
													</li>
												))
										) : (
											<li>Chưa có thu nhập hôm nay.</li> // Thông báo khi không có thu nhập
										)}
									</ul>

									{/* Tổng thu nhập hôm nay */}
									{earningsToday.length > 0 && (
										<div className="total-earnings">
											<p>Tổng tiền: {earningsToday.reduce((sum, earning) => sum + earning.amount, 0)} VNĐ</p>
										</div>
									)}
								</div>
								{editingEarning && (
									<div>
										<h3>Chỉnh sửa thu nhập</h3>
										<input type="number" value={newAmount} onChange={(e) => setNewAmount(Number(e.target.value))} />
										<button onClick={handleUpdateEarning}>Cập nhật</button>
										<button onClick={() => setEditingEarning(null)}>Hủy</button>
									</div>
								)}
								{/* Hiển thị thu nhập trong tuần */}
								<div className="earnings-list">
									<h3>Thu nhập tuần này</h3>
									{earningsWeek.totalAmount > 0 ? (
										<>
											<p>Tổng tiền: {earningsWeek.totalAmount} VNĐ</p>
											<p>Số khách hàng: {earningsWeek.customerCount}</p>
										</>
									) : (
										<p>Chưa có thu nhập tuần này.</p> // Thông báo khi không có thu nhập tuần
									)}
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Hiển thị khi thêm nhân viên */}
			{view === "add" && (
				<div>
					<h2>Thêm Nhân viên</h2>
					<EmployeeForm onSubmit={fetchEmployees} />
					<button onClick={() => setView("home")}>Hủy</button>
				</div>
			)}

			{/* Hiển thị khi xóa nhân viên */}
			{view === "delete" && (
				<div>
					<h2>Xóa nhân viên</h2>
					<ul>
						{employees.map((employee) => (
							<li key={employee._id}>
								{employee.name} ({employee.username})<button onClick={() => handleDeleteEmployeeById(employee._id)}>Xóa</button>
							</li>
						))}
					</ul>
					<button onClick={() => setView("home")}>Hủy</button>
				</div>
			)}
		</>
	);
};

export default Home;
