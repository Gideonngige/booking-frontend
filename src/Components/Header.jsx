import { NavLink } from "react-router-dom";
// HEADER COMPONENT
export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-gray-900 text-white p-4 flex shadow-lg justify-between items-center">
      <div className="flex items-center">
        <img src="/logo.png" alt="Tiki Logo" className="h-10 object-contain" />
      </div>
      <nav className="flex gap-6">
        <NavLink to="/" className="hover:underline">Home</NavLink>
        <NavLink to="/explore" className="hover:underline">Explore</NavLink>
        <NavLink to="/create-event" className="hover:underline">Create Event</NavLink>
        <NavLink to="/login" className="hover:underline">Login</NavLink>
      </nav>
    </header>
  );
};