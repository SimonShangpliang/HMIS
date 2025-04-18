import { useState,useContext } from "react";
import { Link,useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { List } from "lucide-react"; // Import menu icon

const Navbar = ({ toggleSidebar,isSidebarOpen }) => {
  const { setToken, setRole,setUser,user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const res = await logout();
      setToken(null);
      setRole(null);
      setUser(null);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
      {/* Menu Button */}
      <button
  onClick={toggleSidebar}
  className="transition-all p-2 rounded-md"
>
  <List 
    size={24} 
    className={`${isSidebarOpen ? "text-blue-500" : "text-white"} transition-all`}  // Change icon color based on isSidebarOpen
  />
</button>




      {/* Logo */}
      <h2 className="text-xl font-bold text-white">Hospital Management System</h2>

      {/* User Info & Actions */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-sm sm:text-base">
              Welcome, <span className="font-semibold">{user.name}</span> {user.role}
            </span>
            <button 
              onClick={handleLogout} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/" className="text-gray-300 hover:text-white transition">
            Home
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
