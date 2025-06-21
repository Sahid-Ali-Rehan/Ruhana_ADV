import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

// Color palette constants
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

const FloatingInput = ({ icon, type, name, placeholder, value, onChange, showPassword, setShowPassword, isPassword = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      className="relative mb-6 group"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center border-b-2 py-2" style={{ borderColor: isFocused ? COLORS.terracotta : COLORS.sage }}>
        <div className="text-xl mr-3" style={{ color: isFocused ? COLORS.terracotta : COLORS.sage }}>
          {icon}
        </div>
        <input
          className="w-full bg-transparent outline-none text-lg py-1"
          style={{ color: COLORS.rust }}
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2"
            style={{ color: COLORS.terracotta }}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        )}
      </div>
      <motion.div 
        className="absolute bottom-0 left-0 h-0.5"
        style={{ backgroundColor: COLORS.terracotta }}
        animate={{ width: isFocused ? "100%" : "0%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const AuthButton = ({ children, onClick, disabled }) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 5px 15px ${COLORS.terracotta}40`
      }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 rounded-xl font-bold text-lg mt-2 relative overflow-hidden"
      style={{ 
        backgroundColor: COLORS.terracotta,
        color: COLORS.parchment
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      <motion.div 
        className="absolute inset-0 bg-black opacity-0"
        animate={{ 
          opacity: disabled ? 0.2 : 0 
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data } = await axios.post("https://ruhana-adv.onrender.com/api/auth/login", formData);
      toast.success(data.message);

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem('userId', data._id);

      // Redirect based on user role
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: COLORS.parchment,
        backgroundImage: "radial-gradient(#97A276 1px, transparent 1.5px)",
        backgroundSize: "40px 40px"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.terracotta }}
          >
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: COLORS.parchment }}></div>
          </motion.div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.rust }}>Welcome Back</h1>
          <div className="w-20 h-1 mx-auto mt-2" style={{ backgroundColor: COLORS.terracotta }}></div>
        </motion.div>
        
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl"
          style={{ backgroundColor: `${COLORS.parchment}cc`, backdropFilter: "blur(10px)" }}
        >
          <FloatingInput
            icon={<AiOutlineMail />}
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          
          <FloatingInput
            icon={<AiOutlineLock />}
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            isPassword={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          
          <AuthButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </AuthButton>
          
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-md" style={{ color: COLORS.rust }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-bold underline"
                style={{ color: COLORS.terracotta }}
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </motion.form>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-pointer"
                style={{ backgroundColor: COLORS.blush }}
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: COLORS.rust }}></div>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-sm" style={{ color: COLORS.terracotta }}>
            Secure login with social accounts
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;