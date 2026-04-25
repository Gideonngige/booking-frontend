import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-gray-900 text-white shadow-lg">
      <div className="p-4 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="BookEvent Logo" className="h-10 w-10 object-cover rounded-full" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <NavLink to="/" className="hover:underline">
            Home
          </NavLink>
          <NavLink to="/explore" className="hover:underline">
            Explore
          </NavLink>
          <NavLink to="/create-event" className="hover:underline">
            Create Event
          </NavLink>
          <NavLink to="/login" className="hover:underline">
            Login
          </NavLink>
        </nav>

        {/* Hamburger Button — mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col bg-gray-900 px-4 pb-4 gap-4">
          <NavLink to="/" onClick={() => setMenuOpen(false)} className="hover:text-orange-400 py-2 border-b border-gray-700">
            Home
          </NavLink>
          <NavLink to="/explore" onClick={() => setMenuOpen(false)} className="hover:text-orange-400 py-2 border-b border-gray-700">
            Explore
          </NavLink>
          <NavLink to="/create-event" onClick={() => setMenuOpen(false)} className="hover:text-orange-400 py-2 border-b border-gray-700">
            Create Event
          </NavLink>
          <NavLink to="/login" onClick={() => setMenuOpen(false)} className="hover:text-orange-400 py-2">
            Login
          </NavLink>
        </nav>
      )}
    </header>
  );
}