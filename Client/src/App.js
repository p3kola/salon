import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About"; // Import trang About
import "./App.css"; // Import file CSS

const App = () => {
	return (
		<Router>
			<div className="App">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} /> {/* Route cho trang About */}
					{/* Thêm các route khác tại đây */}
				</Routes>
			</div>
		</Router>
	);
};

export default App;
