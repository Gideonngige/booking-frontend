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
    image: "https://source.unsplash.com/400x300/?concert",
  },
  {
    title: "Tech Conference",
    location: "Mombasa",
    date: "20 Sep 2026",
    price: 3000,
    image: "https://source.unsplash.com/400x300/?conference",
  },
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-10 text-center">
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