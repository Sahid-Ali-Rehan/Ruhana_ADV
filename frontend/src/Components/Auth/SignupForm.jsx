import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineMail, AiOutlineUser, AiOutlinePhone, AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false); // state to toggle password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Password strength check
    const passwordRegex = /^[A-Za-z\d]{8,}$/; // At least 8 characters, only letters and numbers
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters long and contain only letters and numbers.");
      return;
    }
    
  
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    try {
      const { data } = await axios.post("https://ruhana-adv.onrender.com/api/auth/signup", formData);
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#D7F4FA]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-center text-primary mb-4">Sign Up</h2>
        <div className="flex items-center mb-4 border-b border-primary">
          <AiOutlineUser className="text-2xl text-secondary mr-2" />
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full focus:outline-none text-muted"
            required
          />
        </div>
        <div className="flex items-center mb-4 border-b border-primary">
          <AiOutlineMail className="text-2xl text-secondary mr-2" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full focus:outline-none text-muted"
            required
          />
        </div>
        <div className="flex items-center mb-4 border-b border-primary">
          <AiOutlinePhone className="text-2xl text-secondary mr-2" />
          <input
            type="text"
            name="phonenumber"
            placeholder="Phone Number"
            value={formData.phonenumber}
            onChange={handleChange}
            className="w-full focus:outline-none text-muted"
            required
          />
        </div>
        <div className="flex items-center mb-4 border-b border-primary">
          <AiOutlineLock className="text-2xl text-secondary mr-2" />
          <input
            type={showPassword ? "text" : "password"} // toggle password visibility
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full focus:outline-none text-muted"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // toggle showPassword state
            className="ml-2 text-primary"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="flex items-center mb-6 border-b border-primary">
          <AiOutlineLock className="text-2xl text-secondary mr-2" />
          <input
            type={showPassword ? "text" : "password"} // toggle confirm password visibility
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full focus:outline-none text-muted"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-all"
        >
          Sign Up
        </button>
        <p className="text-center text-muted mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary font-semibold"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
