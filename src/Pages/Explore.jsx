import React from "react";

export default function Explore() {
  const stories = [
    {
      id: 1,
      title: "Why Santorini is Perfect for Destination Weddings",
      location: "Santorini, Greece",
      image:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
      excerpt:
        "With breathtaking sunsets, whitewashed architecture, and stunning ocean views, Santorini remains one of the world's most sought-after wedding destinations.",
    },
    {
      id: 2,
      title: "The Hidden Beauty of Maasai Mara",
      location: "Narok, Kenya",
      image:
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200",
      excerpt:
        "From wildlife safaris to luxury lodges, Maasai Mara offers unforgettable experiences for travelers and event organizers alike.",
    },
    {
      id: 3,
      title: "Dubai: The Ultimate Luxury Event Destination",
      location: "Dubai, UAE",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
      excerpt:
        "Whether it's a business summit, product launch, or exclusive gala dinner, Dubai provides world-class venues and experiences.",
    },
    {
      id: 4,
      title: "Paris: A City of Romance and Inspiration",
      location: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1200",
      excerpt:
        "From the Eiffel Tower to charming cafés, Paris offers endless inspiration for memorable celebrations and events.",
    },
    {
      id: 5,
      title: "Cape Town's Stunning Coastal Venues",
      location: "Cape Town, South Africa",
      image:
        "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=1200",
      excerpt:
        "Imagine hosting an event with Table Mountain as your backdrop. Cape Town combines natural beauty with modern luxury.",
    },
    {
      id: 6,
      title: "Tokyo's Blend of Tradition and Innovation",
      location: "Tokyo, Japan",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
      excerpt:
        "Tokyo delivers futuristic venues, vibrant culture, and unique experiences for travelers and event planners.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600"
          alt="Explore"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Explore The World
          </h1>

          <p className="text-gray-200 mt-4 max-w-2xl text-lg">
            Discover breathtaking destinations, inspiring stories, and amazing
            places where your next event or adventure could happen.
          </p>

          <div className="mt-8 w-full max-w-xl">
            <input
              type="text"
              placeholder="Search destinations..."
              className="w-full p-4 rounded-xl outline-none text-gray-800"
            />
          </div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">
          Featured Destinations
        </h2>

        <p className="text-gray-500 mb-10">
          Discover incredible places perfect for travel, celebrations, business
          conferences, weddings, and unforgettable experiences.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-60 object-cover"
              />

              <div className="p-6">
                <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full">
                  {story.location}
                </span>

                <h3 className="text-xl font-bold text-gray-800 mt-4">
                  {story.title}
                </h3>

                <p className="text-gray-500 mt-3">
                  {story.excerpt}
                </p>

                <button className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition">
                  Read Story
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRAVEL TIPS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Travel & Event Planning Tips
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-orange-50">
              <h3 className="font-bold text-xl text-orange-600 mb-3">
                Choose the Right Season
              </h3>

              <p className="text-gray-600">
                Research weather patterns and tourist seasons before selecting
                a destination for your event.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50">
              <h3 className="font-bold text-xl text-blue-600 mb-3">
                Consider Accessibility
              </h3>

              <p className="text-gray-600">
                Ensure guests can easily access your venue through airports,
                roads, and local transportation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-50">
              <h3 className="font-bold text-xl text-green-600 mb-3">
                Explore Local Culture
              </h3>

              <p className="text-gray-600">
                Integrating local experiences into your event creates memorable
                moments for attendees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white">
            Get Inspired Weekly
          </h2>

          <p className="text-orange-100 mt-4">
            Receive travel stories, destination ideas, and event planning tips
            directly in your inbox.
          </p>

          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <input
  type="email"
  placeholder="Enter your email"
  className="flex-1 p-4 rounded-xl outline-none border-2 border-white bg-white/10 text-white placeholder-white/80"
/>

            <button className="bg-gray-900 text-white px-8 rounded-xl hover:bg-black transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}