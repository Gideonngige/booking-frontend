import React from 'react';


function Home() {

    // FILTER COMPONENT
const Filters = () => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <input className="border p-2 rounded" placeholder="Event Name" />
      <input className="border p-2 rounded" placeholder="County" />
      <select className="border p-2 rounded">
        <option>Type</option>
        <option>Concert</option>
        <option>Conference</option>
        <option>Party</option>
      </select>
      <input className="border p-2 rounded" placeholder="Min Price" />
      <input className="border p-2 rounded" placeholder="Max Price" />
      <input type="date" className="border p-2 rounded" />
    </div>
  );
};

// EVENT CARD
const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition">
      <img src={event.image} alt="event" className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{event.title}</h3>
        <p className="text-sm text-gray-500">{event.location}</p>
        <p className="text-sm">{event.date}</p>
        <p className="font-semibold text-orange-500">KES {event.price}</p>
      </div>
    </div>
  );
};

// SAMPLE DATA
const events = [
  {
    title: "Nairobi Music Fest",
    location: "Nairobi",
    date: "12 Aug 2026",
    price: 1500,
    image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800",
  },
  {
    title: "Tech Conference 2026",
    location: "Mombasa",
    date: "20 Sep 2026",
    price: 3000,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800",
  },
  {
    title: "Campus Bash Party",
    location: "Kisumu",
    date: "5 Jul 2026",
    price: 800,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  },
  {
    title: "Charity Run",
    location: "Nakuru",
    date: "18 Oct 2026",
    price: 500,
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800",
  },
  {
    title: "Business Summit",
    location: "Nairobi",
    date: "10 Nov 2026",
    price: 5000,
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800",
  },
  {
    title: "Food Festival",
    location: "Eldoret",
    date: "25 Jun 2026",
    price: 1200,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  },
  {
    title: "Wedding Expo",
    location: "Thika",
    date: "2 Dec 2026",
    price: 2000,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
  },
  {
    title: "Art & Culture Night",
    location: "Nairobi",
    date: "15 Aug 2026",
    price: 1000,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
  },
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-orange-500 to-gray-900 text-white p-10 text-center">
        <h1 className="text-4xl font-bold">Discover Amazing Events</h1>
        <p className="mt-2">Find, book and enjoy events near you</p>
      </div>

      {/* FILTERS */}
      <div className="p-6 -mt-10">
        <Filters />
      </div>

      {/* EVENTS GRID */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map((event, index) => (
          <EventCard key={index} event={event} />
        ))}
      </div>
    </div>
    
  );
}

export default Home;