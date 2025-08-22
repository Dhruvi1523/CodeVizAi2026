import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton} from "@clerk/clerk-react";

export default function Navbar() {
   
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Left side - Logo / Home */}
      <div className="text-xl font-bold text-blue-600">
        <Link to="/">CodeVizAi</Link>
      </div>

      {/* Right side - Auth buttons */}
      <div className="flex items-center gap-4">
        <SignedIn>
          {/* Clerk provides profile + sign out */}
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Link
            to="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}
