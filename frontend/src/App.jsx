



import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Appointments from "./pages/test/Appointments_doc";
import TestPage from "./pages/test/TestPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;