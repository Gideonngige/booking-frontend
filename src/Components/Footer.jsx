// FOOTER COMPONENT
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-white pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Book Event */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Karibu Event</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Browse Events</li>
            <li>Buy Tickets</li>
            <li>Popular Events</li>
            <li>Upcoming Events</li>
          </ul>
        </div>

        {/* Plan Event */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Plan Event</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Create Event</li>
            <li>Manage Events</li>
            <li>Pricing</li>
            <li>Promotions</li>
          </ul>
        </div>

        {/* Find Event */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Find Event</h3>
          <ul className="space-y-2 text-gray-400">
            <li>By Category</li>
            <li>By Location</li>
            <li>Free Events</li>
            <li>Trending Events</li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Connect with Us</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Facebook</li>
            <li>Twitter</li>
            <li>Instagram</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
<div className="mt-10 border-t border-gray-700 pt-6">
  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
    <p className="text-gray-500 text-sm text-center md:text-left">
  © {year} Karibu Event. All rights reserved. A product of  {" "}
  <a
    href="https://nexinditechcompany.online"
    target="_blank"
    rel="noopener noreferrer"
    className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
  >
    Nexind Tech Company
  </a>
</p>

    <div className="flex items-center gap-3 text-sm">
      <Link
        to="/privacy-policy"
        className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
      >
        Privacy Policy
      </Link>

      <span className="text-gray-600">|</span>

      <Link
        to="/terms-of-service"
        className="text-gray-400 hover:text-orange-500 transition-colors duration-200 mr-4"
      >
        Terms of Service
      </Link>
    </div>
  </div>
</div>
    </footer>
  );
};