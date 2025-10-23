import React from "react";

const EmployeeList = ({ employees, onSelect, onDelete }) => {
	return (
		<ul>
			{employees.length > 0 ? (
				employees.map((employee) => (
					<li key={employee._id}>
						<span onClick={() => onSelect(employee)}>
							{employee.name} ({employee.username})
						</span>
						<button onClick={() => onDelete(employee._id)}>Xóa</button>
					</li>
				))
			) : (
				<p>Không có nhân viên nào được hiển thị.</p>
			)}
		</ul>
	);
};

export default EmployeeList;
