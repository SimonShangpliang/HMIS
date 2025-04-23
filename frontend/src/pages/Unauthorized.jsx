import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate=useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="text-red-500 h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Unauthorized Access</h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300" onClick={() => navigate("/")}
            >
            Return to Dashboard
          </button>
        
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} HMIS IITG. All rights reserved.
      </p>
    </div>
  );
};

export default UnauthorizedPage;