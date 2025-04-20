import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    setPasswordError(""); // clear if valid
    return true;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Enter Your New Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
          {passwordError && (
          <p className="text-sm text-red-600 mb-2">{passwordError}</p>
          )}

        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Reset Password
        </button>
        {message && (
          <p className="text-center text-sm mt-4 text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
