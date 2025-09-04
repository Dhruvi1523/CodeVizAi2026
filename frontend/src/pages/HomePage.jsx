import { Routes, Route,  Link } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeaturesSection from "../components/FeaturesSelection";

// ------------------ Layout Component (Navbar + Footer) ------------------
function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-gray-200 font-sans">
      <Navbar/>
      {/* Page Content */}
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="bg-[#0d1117] text-white w-full">
          {/* Hero Section */}
          <div className="min-h-screen flex flex-col items-center justify-center px-6  w-full">
            <div className="text-center w-full">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Visualize Your Code <br />
                <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                  With AI Power
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-300">
                Run code, analyze complexity, visualize algorithms, and generate
                flowcharts with AI explanations – all in one platform.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex justify-center gap-4 ">
                <Link
                  to="/code"
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition"
                >
                  ▶ Start Coding
                </Link>
                <Link
                  to="/demo"
                  className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium shadow-lg transition"
                >
                  View Demo
                </Link>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-3 gap-10 text-center">
              <div>
                <h2 className="text-3xl font-bold text-indigo-400">10+</h2>
                <p className="text-gray-400">Languages</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-400">50+</h2>
                <p className="text-gray-400">Algorithms</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-yellow-400">AI</h2>
                <p className="text-gray-400">Powered</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <FeaturesSection />
        </div>
      </main>
      <Footer/>
    </div>
  );
}







export default HomePage;