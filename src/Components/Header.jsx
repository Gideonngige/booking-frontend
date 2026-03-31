
// HEADER COMPONENT
export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-gray-900 text-white p-4 flex shadow-lg justify-between items-center">
      <div className="flex items-center">
        <img src="/logo.png" alt="Tiki Logo" className="h-10 object-contain" />
      </div>
      <nav className="flex gap-6">
        <a href="#" className="hover:underline">Home</a>
        <a href="#" className="hover:underline">Explore</a>
        <a href="#" className="hover:underline">Create Event</a>
        <a href="#" className="hover:underline">Login</a>
      </nav>
    </header>
  );
};