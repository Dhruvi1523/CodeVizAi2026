import { Routes, Route, Link } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeaturesSection from "../components/FeaturesSelection";
import { ArrowRight, Play } from "lucide-react";

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-gray-200 font-sans">
      <Navbar />
      {/* Page Content */}
      <main className="flex-1 container mx-auto ">
        <div className="bg-[#0f172a] text-white w-full">
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

              <div className="py-5 flex flex-col sm:flex-row gap-4 justify-center items-center">
  {/* Primary Button */}
  <Link
    to="/code"
    className="
      inline-flex items-center justify-center gap-3 px-6 py-3 
      font-semibold text-[#f1f5f9] bg-[#6366f1] 
      rounded-lg shadow-lg min-w-[220px] 
      transition-transform transform hover:scale-105 
      focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#0f172a]
    "
  >
    <Play className="h-5 w-5 fill-current" />
    <span className="leading-none">Start Coding</span>
    <ArrowRight className="h-5 w-5" />
  </Link>

  {/* Secondary Button */}
  <Link
    to="/demo"
    className="
      inline-flex items-center justify-center px-6 py-3 
      font-semibold text-[#f1f5f9] bg-[#334155] 
      rounded-lg shadow-lg min-w-[220px] 
      transition-colors hover:bg-[#334155] 
      border border-[#334155]
      focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 focus:ring-offset-[#0f172a]
    "
  >
    View Demo
  </Link>
</div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-6">
              <div className="mt-16 grid grid-cols-3 gap-10 text-center pt-8  border-t">
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
          </div>

          {/* Features Section */}
          <FeaturesSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
