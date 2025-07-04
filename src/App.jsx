import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Feature from "./Feature";
// in main.jsx or App.jsx
import "./index.css"; // or wherever your tailwind directives are
import Gallery from "./Ideas";
import Navbar from "./Navbar";
import Resources from "./Resources";
import Footer from "./Footer";
import Ideas from "./Ideas";
import Test from "./Test";
import FindPros from "./FindPros";
import DesignPage from "./DesignPage";
import DesignDetailPage from "./DesignDetailPage";
import Home from "./pages/Home";
import Search from "./SearchAi";
import DesignIdeas from "./DesignIdeasPage";
import VenderDetail from "./VenderDetail";
import SignUp from "./SignUp";
import Login from "./Login";

function App() {
  return (
    <Router>
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        {/* Add top padding equal to Navbar height */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/pros" element={<FindPros />} />
            <Route path="/test" element={<Test />} />
            <Route path="/feature" element={<Feature />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/design-page" element={<DesignPage />} />
            <Route path="/design-ideas" element={<DesignIdeas />} />
            <Route path="/design-detail-page" element={<DesignDetailPage />} />
            <Route path="/design-vendor" element={<VenderDetail />} />
            <Route path="/search-ai" element={<Search />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
