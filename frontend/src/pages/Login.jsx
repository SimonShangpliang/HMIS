import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("patient");
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setToken, setRole, setUser,axiosInstance} = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const res = await login({ email, password, userType });
  
      setToken(res.data.accessToken);
      setRole(res.data.role);
      setUser(res.data.user);
  
      const employee_id = res.data.user._id;
      const role = res.data.role;
  
      localStorage.setItem("role", role);
      localStorage.setItem("email", JSON.stringify(res.data.user.email));
      localStorage.setItem("user_id", JSON.stringify(employee_id));
  
      if (userType !== "patient") {
        const roleRes = await axios.get(`${import.meta.env.VITE_API_URL}/employees/get-role-id`, {
          params: {
            employee_id,
            role
          }
        });
        localStorage.setItem("role_id", roleRes.data.role_id);
      }
      setMessage({ type: "success", text: "Login successful!" });
      // Optional: add delay if you want a smoother transition
      setTimeout(() => {
        if (userType === "patient") navigate("/patient/profile");
        else navigate(`/${role}/profile`);
      }, 200);
    } catch (err) {
      console.error("Login failed", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Invalid email or password",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };
  

  return (
    <div className="relative min-h-screen bg-gray-100 flex justify-center items-center">
      {/* Home link */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </button>
      </div>

      {/* Message bar outside the login box */}
      {message && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg text-sm font-medium z-50 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Login box */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <img
          src="/profile-icon.png"
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 transition-transform duration-300 hover:scale-110"
        />

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-semibold ${
              userType === "patient"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setUserType("patient")}
          >
            Patient
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-semibold ${
              userType === "employee"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setUserType("employee")}
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />

          <div
            className="text-right text-sm italic text-teal-600 cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password", { state: { userType } })}
          >
            Forgot Password?
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 rounded-lg text-white text-lg ${
              isSubmitting ? "bg-gray-400" : "bg-teal-700 hover:bg-teal-800"
            }`}
          >
            {isSubmitting ? "Logging in..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;