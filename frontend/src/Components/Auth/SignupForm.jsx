import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AiOutlineMail, AiOutlineUser, AiOutlinePhone, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaArrowRight } from "react-icons/fa";

// Black & white color palette
const COLORS = {
  pureWhite: "#FFFFFF",
  lightGray: "#F5F5F5",
  mediumGray: "#E0E0E0",
  darkGray: "#333333",
  pureBlack: "#000000",
};

const FloatingInput = ({ icon, type, name, placeholder, value, onChange, showPassword, setShowPassword, isPassword = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      className="relative mb-8 group"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center border-b-2 py-3" style={{ borderColor: isFocused ? COLORS.pureBlack : COLORS.mediumGray }}>
        <div className="text-xl mr-4" style={{ color: isFocused ? COLORS.pureBlack : COLORS.darkGray }}>
          {icon}
        </div>
        <input
          className="w-full bg-transparent outline-none text-xl py-1 placeholder-gray-400 tracking-wide"
          style={{ color: COLORS.pureBlack }}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          required
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{ color: COLORS.pureBlack }}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </motion.button>
        )}
      </div>
      <motion.div 
        className="absolute bottom-0 left-0 h-0.5 bg-black"
        animate={{ width: isFocused ? "100%" : "0%" }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

const AuthButton = ({ children, onClick, disabled }) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
      }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-5 rounded-none font-bold text-xl mt-6 relative overflow-hidden flex items-center justify-center gap-4"
      style={{ 
        backgroundColor: COLORS.pureBlack,
        color: COLORS.pureWhite,
        letterSpacing: "0.1em"
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      <motion.div 
        className="absolute left-0 top-0 w-0 h-full bg-white"
        animate={{ 
          width: disabled ? "0%" : ["0%", "100%", "0%"],
          left: disabled ? "0%" : ["0%", "0%", "100%"],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut"
        }}
        style={{ opacity: 0.1 }}
      />
      <FaArrowRight className="relative z-10" />
    </motion.button>
  );
};

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Password strength check
    const passwordRegex = /^[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters long and contain only letters and numbers.");
      setIsLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
  
    try {
      const { data } = await axios.post("https://ruhana-adv.onrender.com/api/auth/signup", formData);
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.pureWhite }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2 border-black"
          >
            <div className="w-12 h-12 rounded-full border-2 border-black"></div>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-wide mb-3" style={{ color: COLORS.pureBlack }}>Create Account</h1>
          <div className="w-24 h-0.5 mx-auto bg-black"></div>
        </motion.div>
        
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white p-10 border border-black shadow-2xl"
        >
          <FloatingInput
            icon={<AiOutlineUser />}
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
          />
          
          <FloatingInput
            icon={<AiOutlineMail />}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          
          <FloatingInput
            icon={<AiOutlinePhone />}
            type="text"
            name="phonenumber"
            placeholder="Phone Number"
            value={formData.phonenumber}
            onChange={handleChange}
          />
          
          <FloatingInput
            icon={<AiOutlineLock />}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            isPassword={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          
          <FloatingInput
            icon={<AiOutlineLock />}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            isPassword={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          
          <div className="mt-4 mb-6">
            <div className="flex items-center mb-3">
              <motion.div 
                className="w-6 h-6 rounded-full mr-3 flex items-center justify-center border border-black"
                animate={{ 
                  backgroundColor: formData.password.length >= 8 ? COLORS.pureBlack : COLORS.pureWhite
                }}
              >
                {formData.password.length >= 8 && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </motion.div>
              <span className="text-lg" style={{ color: COLORS.darkGray }}>At least 8 characters</span>
            </div>
            <div className="flex items-center">
              <motion.div 
                className="w-6 h-6 rounded-full mr-3 flex items-center justify-center border border-black"
                animate={{ 
                  backgroundColor: /[A-Za-z]/.test(formData.password) && /\d/.test(formData.password) ? COLORS.pureBlack : COLORS.pureWhite
                }}
              >
                {/[A-Za-z]/.test(formData.password) && /\d/.test(formData.password) && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </motion.div>
              <span className="text-lg" style={{ color: COLORS.darkGray }}>Letters and numbers</span>
            </div>
          </div>
          
          <AuthButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </AuthButton>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-lg" style={{ color: COLORS.darkGray }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold underline hover:opacity-80 transition-opacity"
                style={{ color: COLORS.pureBlack }}
              >
                Login
              </button>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default SignupForm;