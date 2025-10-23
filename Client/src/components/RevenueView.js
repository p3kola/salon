import React, { useState, useEffect } from "react";
import axios from "axios";

const RevenueView = ({ employeeId }) => {
	const today = new Date();
	const currentMonth = today.getMonth() + 1; // Lấy tháng hiện tại (0-11 nên cần +1)
	const currentYear = today.getFullYear(); // Lấy năm hiện tại

	// Sử dụng state để giữ giá trị của tháng và năm
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [monthlyRevenue, setMonthlyRevenue] = useState({}); // State cho doanh thu tháng
	const [yearlyRevenue, setYearlyRevenue] = useState({}); // State cho doanh thu năm

	// Hàm lấy doanh thu theo tháng từ API
	const fetchMonthlyRevenue = async () => {
		try {
			const url =
				employeeId === "salon"
					? `http://103.92.24.44:5000/api/revenue/salon/${selectedMonth}/${selectedYear}`
					: `http://103.92.24.44:5000/api/revenue/employee/${employeeId}/${selectedMonth}/${selectedYear}`;
			const response = await axios.get(url);
			setMonthlyRevenue(response.data);
		} catch (error) {
			console.error("Lỗi khi lấy doanh thu theo tháng:", error);
		}
	};

	// Hàm lấy doanh thu theo năm từ API
	const fetchYearlyRevenue = async () => {
		try {
			const url = employeeId === "salon" ? `http://103.92.24.44:5000/api/revenue/salon/year/${selectedYear}` : `http://103.92.24.44:5000/api/revenue/employee/${employeeId}/${selectedYear}`;
			const response = await axios.get(url);
			setYearlyRevenue(response.data);
		} catch (error) {
			console.error("Lỗi khi lấy doanh thu theo năm:", error);
		}
	};

	useEffect(() => {
		// Gọi API để lấy dữ liệu doanh thu theo tháng và năm khi component render
		fetchMonthlyRevenue();
		fetchYearlyRevenue();
	}, [employeeId, selectedMonth, selectedYear]); // Cập nhật khi employeeId, selectedMonth, hoặc selectedYear thay đổi

	return (
		<div>
			<h3>
				Doanh thu tháng {selectedMonth}/{selectedYear}
			</h3>
			<p>Tổng tiền: {monthlyRevenue.totalAmount || 0} VNĐ</p>
			<p>Số khách hàng: {monthlyRevenue.customerCount || 0}</p>

			<h3>Doanh thu năm {selectedYear}</h3>
			<p>Tổng tiền: {yearlyRevenue.totalAmount || 0} VNĐ</p>
			<p>Số khách hàng: {yearlyRevenue.customerCount || 0}</p>
		</div>
	);
};

export default RevenueView;
