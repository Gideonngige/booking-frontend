// Home.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Search,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  X,
  Share2,
  Ticket,
  Clock,
  ArrowRight,
  Sparkles,
  CalendarSearch,
  RefreshCw,
  ChevronDown,
  Users,
} from "lucide-react";

import {
  Helmet,
} from "react-helmet-async";

import Swal from "sweetalert2";

import { API_URL } from "../config/env";

import FloatingParticles from "../Components/Floating-particles";

import logo from "../assets/logo.png";

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "Music",
  "Technology",
  "Business",
  "Education",
  "Sports",
  "Entertainment",
  "Arts & Culture",
  "Food & Drink",
  "Health & Wellness",
  "Fashion",
  "Religion & Spirituality",
  "Networking",
  "Conferences",
  "Workshops & Training",
  "Community",
  "Charity & Fundraising",
  "Family & Kids",
  "Travel & Outdoor",
  "Gaming & Esports",
  "Comedy",
  "Film & Media",
  "Nightlife & Parties",
  "Government & Politics",
  "Science & Innovation",
  "Agriculture",
  "Career & Jobs",
  "Real Estate",
  "Finance & Investment",
  "Automotive",
  "Environment",
  "Other",
];

/* =========================================================
   COUNTIES
========================================================= */

const counties = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

/* =========================================================
   INITIAL FILTERS
========================================================= */

const initialFilters = {
  search: "",
  county: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  date: "",
};

export default function Home() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [filters, setFilters] =
    useState(initialFilters);

  const [
    showMobileFilters,
    setShowMobileFilters,
  ] = useState(false);

  /* =========================================================
     FETCH EVENTS
  ========================================================= */

  const fetchEvents = async (
    filterValues = filters
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params =
        new URLSearchParams();

      if (
        filterValues.search.trim()
      ) {
        params.append(
          "search",
          filterValues.search.trim()
        );
      }

      if (filterValues.county) {
        params.append(
          "county",
          filterValues.county
        );
      }

      if (
        filterValues.category
      ) {
        params.append(
          "category",
          filterValues.category
        );
      }

      if (
        filterValues.minPrice !==
        ""
      ) {
        params.append(
          "minPrice",
          filterValues.minPrice
        );
      }

      if (
        filterValues.maxPrice !==
        ""
      ) {
        params.append(
          "maxPrice",
          filterValues.maxPrice
        );
      }

      if (filterValues.date) {
        params.append(
          "date",
          filterValues.date
        );
      }

      const query =
        params.toString();

      const res = await fetch(
        `${API_URL}/get_all_events${
          query ? `?${query}` : ""
        }`
      );

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch events."
        );
      }

      setEvents(
        Array.isArray(data.events)
          ? data.events
          : []
      );
    } catch (err) {
      console.error(
        "Fetch events error:",
        err
      );

      setError(
        err.message ||
          "Failed to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL FETCH
  ========================================================= */

  useEffect(() => {
    fetchEvents(initialFilters);
  }, []);

  /* =========================================================
     FILTER CHANGE
  ========================================================= */

  const handleFilterChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFilters(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }

    setShowMobileFilters(false);

    fetchEvents(filters);
  };

  /* =========================================================
     CLEAR
  ========================================================= */

  const handleClearFilters =
    () => {
      setFilters(
        initialFilters
      );

      setShowMobileFilters(
        false
      );

      fetchEvents(
        initialFilters
      );
    };

  /* =========================================================
     QUICK CATEGORY
  ========================================================= */

  const handleQuickCategory = (
    category
  ) => {
    const newFilters = {
      ...filters,
      category,
    };

    setFilters(newFilters);

    fetchEvents(newFilters);
  };

  /* =========================================================
     ACTIVE FILTER COUNT
  ========================================================= */

  const activeFilterCount =
    useMemo(() => {
      return Object.values(
        filters
      ).filter(
        (value) =>
          value !== "" &&
          value !== null
      ).length;
    }, [filters]);

  /* =========================================================
     SHARE EVENT
  ========================================================= */

  const shareEvent = async (
    eventId,
    eventTitle
  ) => {
    const shareUrl =
      `${window.location.origin}/events/${eventId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: eventTitle,

          text:
            `Check out ${eventTitle} on Karibu Event.`,

          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(
        shareUrl
      );

      Swal.fire({
        icon: "success",
        title: "Link Copied",
        text:
          "Event link copied to your clipboard.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      /*
        Don't show an error when
        the native share dialog is
        simply cancelled.
      */

      if (
        err?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Share error:",
        err
      );

      Swal.fire({
        icon: "error",
        title:
          "Unable to Share Event",
        text:
          "We couldn't share this event. Please try again.",
        confirmButtonColor:
          "#f97316",
      });
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      {/* =====================================================
          SEO
      ===================================================== */}

      <Helmet>

        <title>
          Karibu Event | Discover,
          Book & Share Events in
          Kenya
        </title>

        <meta
          name="description"
          content="Find concerts, business events, sports, technology conferences, educational workshops and more across Kenya. Book tickets online with Karibu Event."
        />

        <meta
          name="keywords"
          content="events in Kenya, Nairobi events, concerts Kenya, business events, sports events, event tickets Kenya, Karibu Event"
        />

        <meta
          property="og:title"
          content="Karibu Event | Discover Amazing Events in Kenya"
        />

        <meta
          property="og:description"
          content="Book tickets for concerts, conferences, workshops and sports events across Kenya."
        />

        <meta
          property="og:image"
          content="https://www.karibuevent.online/logo.png"
        />

        <meta
          property="og:url"
          content="https://www.karibuevent.online"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <link
          rel="canonical"
          href="https://www.karibuevent.online/"
        />

        <script
          type="application/ld+json"
        >
          {JSON.stringify({
            "@context":
              "https://schema.org",

            "@type": "WebSite",

            name:
              "Karibu Event",

            url:
              "https://www.karibuevent.online",

            description:
              "Discover and book events across Kenya.",

            potentialAction: {
              "@type":
                "SearchAction",

              target:
                "https://www.karibuevent.online/?search={search_term_string}",

              "query-input":
                "required name=search_term_string",
            },
          })}
        </script>

      </Helmet>

      <div className="min-h-screen bg-[#f8f8f8]">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900">

          <FloatingParticles />

          {/* Decorative background */}

          <div className="absolute -top-32 -left-24 w-96 h-96 border border-white/10 rounded-full" />

          <div className="absolute -top-20 -left-12 w-96 h-96 border border-white/10 rounded-full" />

          <div className="absolute -bottom-52 right-0 w-[550px] h-[550px] bg-white/5 rounded-full" />

          <div className="absolute top-24 right-[10%] w-32 h-32 border border-white/10 rounded-full hidden lg:block" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-32 sm:pb-36">

            <div className="max-w-3xl mx-auto text-center">

              {/* Logo */}

              <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/10 backdrop-blur-sm rounded-full px-3 py-2">

                <div className="w-8 h-8 rounded-lg bg-white p-1 overflow-hidden">

                  <img
                    src={logo}
                    alt="Karibu Event"
                    className="w-full h-full object-contain"
                  />

                </div>

                <span className="text-sm font-semibold text-white">
                  Karibu Event
                </span>

                <Sparkles
                  size={15}
                  className="text-orange-200"
                />

              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] mt-7">

                Discover events worth
                showing up for.

              </h1>

              <p className="text-orange-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-5">

                Find concerts,
                conferences, workshops,
                festivals, business
                events and unforgettable
                experiences happening
                across Kenya.

              </p>

              {/* =============================================
                  HERO SEARCH
              ============================================= */}

              <form
                onSubmit={
                  handleSearch
                }
                className="max-w-2xl mx-auto mt-8"
              >

                <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center">

                  <div className="flex-1 relative">

                    <Search
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="search"
                      value={
                        filters.search
                      }
                      onChange={
                        handleFilterChange
                      }
                      placeholder="Search events, concerts, conferences..."
                      className="w-full h-12 pl-12 pr-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm sm:text-base"
                    />

                  </div>

                  <button
                    type="submit"
                    className="h-12 bg-orange-500 hover:bg-orange-600 text-white px-5 sm:px-7 rounded-xl font-bold transition flex items-center gap-2"
                  >

                    <Search
                      size={18}
                    />

                    <span className="hidden sm:inline">
                      Search
                    </span>

                  </button>

                </div>

              </form>

              {/* =============================================
                  QUICK CATEGORIES
              ============================================= */}

              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">

                <span className="text-orange-100/70 text-xs mr-1">
                  Popular:
                </span>

                {[
                  "Music",
                  "Business",
                  "Technology",
                  "Sports",
                ].map(
                  (category) => (

                    <button
                      key={
                        category
                      }
                      type="button"
                      onClick={() =>
                        handleQuickCategory(
                          category
                        )
                      }
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                        filters.category ===
                        category
                          ? "bg-white text-orange-600 border-white"
                          : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {category}
                    </button>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            FILTER BOX
        =================================================== */}

        <section className="relative z-20 -mt-16">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl">

              {/* =============================================
                  FILTER HEADER
              ============================================= */}

              <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">

                    <SlidersHorizontal
                      size={18}
                    />

                  </div>

                  <div>

                    <p className="font-bold text-gray-800 text-sm">
                      Find the right event
                    </p>

                    <p className="text-xs text-gray-400 hidden sm:block">
                      Filter by location,
                      category, date or
                      ticket price.
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  {activeFilterCount >
                    0 && (

                    <button
                      type="button"
                      onClick={
                        handleClearFilters
                      }
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                      Clear filters
                    </button>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileFilters(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    className="lg:hidden relative flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600"
                  >

                    Filters

                    {activeFilterCount >
                      0 && (

                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                        {
                          activeFilterCount
                        }
                      </span>

                    )}

                    <ChevronDown
                      size={15}
                      className={`transition ${
                        showMobileFilters
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </button>

                </div>

              </div>

              {/* =============================================
                  FILTER CONTENT
              ============================================= */}

              <div
                className={`p-5 sm:p-6 ${
                  showMobileFilters
                    ? "block"
                    : "hidden lg:block"
                }`}
              >

                <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">

                  {/* County */}

                  <FilterGroup
                    label="County"
                  >

                    <div className="relative">

                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />

                      <select
                        name="county"
                        value={
                          filters.county
                        }
                        onChange={
                          handleFilterChange
                        }
                        className={`${filterInputClass} pl-9 appearance-none`}
                      >

                        <option value="">
                          All counties
                        </option>

                        {counties.map(
                          (
                            county
                          ) => (

                            <option
                              key={
                                county
                              }
                              value={
                                county
                              }
                            >
                              {county}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </FilterGroup>

                  {/* Category */}

                  <FilterGroup
                    label="Category"
                  >

                    <select
                      name="category"
                      value={
                        filters.category
                      }
                      onChange={
                        handleFilterChange
                      }
                      className={
                        filterInputClass
                      }
                    >

                      <option value="">
                        All categories
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (

                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {category}
                          </option>

                        )
                      )}

                    </select>

                  </FilterGroup>

                  {/* Date */}

                  <FilterGroup
                    label="Event Date"
                  >

                    <input
                      type="date"
                      name="date"
                      value={
                        filters.date
                      }
                      onChange={
                        handleFilterChange
                      }
                      className={
                        filterInputClass
                      }
                    />

                  </FilterGroup>

                  {/* Min */}

                  <FilterGroup
                    label="Min Price"
                  >

                    <div className="relative">

                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        KES
                      </span>

                      <input
                        type="number"
                        min="0"
                        name="minPrice"
                        value={
                          filters.minPrice
                        }
                        onChange={
                          handleFilterChange
                        }
                        placeholder="0"
                        className={`${filterInputClass} pl-11`}
                      />

                    </div>

                  </FilterGroup>

                  {/* Max */}

                  <FilterGroup
                    label="Max Price"
                  >

                    <div className="relative">

                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        KES
                      </span>

                      <input
                        type="number"
                        min="0"
                        name="maxPrice"
                        value={
                          filters.maxPrice
                        }
                        onChange={
                          handleFilterChange
                        }
                        placeholder="Any"
                        className={`${filterInputClass} pl-11`}
                      />

                    </div>

                  </FilterGroup>

                  {/* Search button */}

                  <div className="flex items-end">

                    <button
                      type="button"
                      onClick={
                        handleSearch
                      }
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >

                      <Search
                        size={16}
                      />

                      Apply Filters

                    </button>

                  </div>

                </div>

                {/* Mobile clear */}

                {activeFilterCount >
                  0 && (

                  <button
                    type="button"
                    onClick={
                      handleClearFilters
                    }
                    className="sm:hidden w-full mt-3 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 flex items-center justify-center gap-2"
                  >
                    <X size={15} />
                    Clear All Filters
                  </button>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            EVENTS
        =================================================== */}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">

          {/* ===============================================
              SECTION HEADER
          =============================================== */}

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 text-orange-500">

                <CalendarSearch
                  size={18}
                />

                <span className="text-xs font-bold uppercase tracking-wider">
                  Explore Events
                </span>

              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">

                {activeFilterCount >
                0
                  ? "Events matching your search"
                  : "Discover upcoming events"}

              </h2>

              {!loading &&
                !error && (

                <p className="text-sm text-gray-400 mt-2">

                  {events.length ===
                  1
                    ? "1 event available"
                    : `${events.length} events available`}

                </p>

              )}

            </div>

            {!loading &&
              activeFilterCount >
                0 && (

              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                View all events

                <ArrowRight
                  size={16}
                />
              </button>

            )}

          </div>

          {/* ===============================================
              LOADING
          =============================================== */}

          {loading ? (

            <LoadingEvents />

          ) : error ? (

            /* =============================================
               ERROR
            ============================================= */

            <div className="bg-white border border-gray-100 rounded-2xl text-center py-16 px-5 mt-8">

              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">

                <RefreshCw
                  size={24}
                />

              </div>

              <h3 className="font-bold text-gray-800 text-lg mt-4">
                Unable to load events
              </h3>

              <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchEvents(
                    filters
                  )
                }
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm mt-5"
              >
                <RefreshCw
                  size={16}
                />
                Try Again
              </button>

            </div>

          ) : events.length ===
            0 ? (

            /* =============================================
               EMPTY
            ============================================= */

            <div className="bg-white border border-gray-100 rounded-2xl text-center py-16 px-5 mt-8">

              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">

                <CalendarSearch
                  size={28}
                />

              </div>

              <h3 className="font-black text-gray-800 text-xl mt-5">
                No events found
              </h3>

              <p className="text-sm text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">

                We couldn't find any
                events matching your
                current filters. Try
                changing the location,
                category, date or price.

              </p>

              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm mt-5"
              >
                <X size={16} />
                Clear Filters
              </button>

            </div>

          ) : (

            /* =============================================
               EVENT GRID
            ============================================= */

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 mt-8">

              {events.map(
                (event) => (

                  <EventCard
                    key={
                      event.id
                    }
                    event={
                      event
                    }
                    navigate={
                      navigate
                    }
                    onShare={
                      shareEvent
                    }
                  />

                )
              )}

            </div>

          )}

        </main>

        {/* ===================================================
            ORGANIZER CTA
        =================================================== */}

        <section className="px-4 sm:px-6 lg:px-8 pb-20">

          <div className="relative overflow-hidden max-w-7xl mx-auto bg-gray-900 rounded-3xl">

            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-orange-500/10" />

            <div className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full border border-white/5" />

            <div className="relative px-6 sm:px-10 lg:px-14 py-10 lg:py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div className="max-w-2xl">

                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">

                  <CalendarDays
                    size={23}
                  />

                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mt-5">
                  Planning an event?
                </h2>

                <p className="text-gray-400 mt-3 leading-relaxed">

                  Create your event,
                  manage ticket sales,
                  receive M-Pesa
                  payments and verify
                  attendees with QR
                  tickets using Karibu
                  Event.

                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
                className="group flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >

                Start Organizing

                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition"
                />

              </button>

            </div>

          </div>

        </section>

      </div>
    </>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({
  event,
  navigate,
  onShare,
}) {
  const availableTickets =
    Number(
      event.available_tickets ||
        0
    );

  const totalTickets =
    Number(
      event.total_tickets ||
        0
    );

  const price =
    Number(event.price || 0);

  const soldOut =
    availableTickets <= 0;

  const almostSoldOut =
    !soldOut &&
    totalTickets > 0 &&
    availableTickets <=
      Math.max(
        10,
        totalTickets * 0.1
      );

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          navigate(
            `/events/${event.id}`
          )
        }
        onKeyDown={(e) => {
          if (
            e.key === "Enter"
          ) {
            navigate(
              `/events/${event.id}`
            );
          }
        }}
        className="relative h-48 overflow-hidden cursor-pointer bg-gray-100"
      >

        <img
          src={
            event.image ||
            "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800"
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category */}

        {event.category && (

          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-orange-600 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
            {event.category}
          </span>

        )}

        {/* Share */}

        <button
          type="button"
          aria-label="Share event"
          onClick={(e) => {
            e.stopPropagation();

            onShare(
              event.id,
              event.title
            );
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/95 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-orange-500 shadow-sm transition"
        >
          <Share2
            size={16}
          />
        </button>

        {/* Date box */}

        <div className="absolute bottom-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-md min-w-[56px]">

          <p className="text-[10px] uppercase font-black text-orange-500">
            {getMonth(
              event.date
            )}
          </p>

          <p className="text-xl font-black text-gray-800 leading-none mt-0.5">
            {getDay(
              event.date
            )}
          </p>

        </div>

        {/* Availability */}

        {soldOut ? (

          <span className="absolute bottom-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
            Sold Out
          </span>

        ) : almostSoldOut ? (

          <span className="absolute bottom-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
            Selling Fast
          </span>

        ) : null}

      </div>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <div className="p-4">

        {/* Title */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/events/${event.id}`
            )
          }
          className="block text-left w-full"
        >

          <h3 className="font-black text-gray-800 text-lg leading-snug line-clamp-2 group-hover:text-orange-500 transition min-h-[50px]">
            {event.title}
          </h3>

        </button>

        {/* Location */}

        <div className="flex items-start gap-2 text-gray-400 text-sm mt-3">

          <MapPin
            size={15}
            className="text-orange-500 mt-0.5 flex-shrink-0"
          />

          <p className="line-clamp-1">
            {event.location}

            {event.county
              ? `, ${event.county}`
              : ""}
          </p>

        </div>

        {/* Date */}

        <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">

          <CalendarDays
            size={15}
            className="text-orange-500 flex-shrink-0"
          />

          <p>
            {formatEventDate(
              event.date
            )}
          </p>

        </div>

        {/* Time */}

        {event.time && (

          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">

            <Clock
              size={15}
              className="text-orange-500 flex-shrink-0"
            />

            <p>
              {formatEventTime(
                event.time
              )}
            </p>

          </div>

        )}

        {/* Price */}

        <div className="flex items-end justify-between gap-3 mt-5 pt-4 border-t border-gray-100">

          <div>

            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
              From
            </p>

            <p className="font-black text-orange-500 text-lg mt-0.5">

              {price === 0
                ? "FREE"
                : `KES ${price.toLocaleString()}`}

            </p>

          </div>

          <div className="text-right">

            <div className="flex items-center justify-end gap-1 text-gray-400">

              <Ticket
                size={13}
              />

              <span className="text-xs">
                {soldOut
                  ? "No tickets left"
                  : `${availableTickets.toLocaleString()} left`}
              </span>

            </div>

          </div>

        </div>

        {/* Book button */}

        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            navigate(
              `/events/${event.id}`
            )
          }
          className={`w-full mt-4 h-10 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
            soldOut
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 hover:bg-orange-500 text-white"
          }`}
        >

          {soldOut
            ? "Sold Out"
            : "View Event"}

          {!soldOut && (
            <ArrowRight
              size={15}
            />
          )}

        </button>

      </div>

    </article>
  );
}

/* =========================================================
   FILTER GROUP
========================================================= */

function FilterGroup({
  label,
  children,
}) {
  return (
    <div>

      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        {label}
      </label>

      {children}

    </div>
  );
}

/* =========================================================
   FILTER INPUT
========================================================= */

const filterInputClass =
  "w-full h-11 px-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

/* =========================================================
   LOADING
========================================================= */

function LoadingEvents() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 mt-8">

      {Array.from({
        length: 8,
      }).map((_, index) => (

        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
        >

          <div className="h-48 bg-gray-200" />

          <div className="p-4">

            <div className="h-5 bg-gray-200 rounded-lg w-4/5" />

            <div className="h-5 bg-gray-200 rounded-lg w-3/5 mt-2" />

            <div className="h-3 bg-gray-100 rounded-lg w-2/3 mt-5" />

            <div className="h-3 bg-gray-100 rounded-lg w-1/2 mt-3" />

            <div className="border-t border-gray-100 mt-5 pt-4">

              <div className="flex justify-between">

                <div className="h-6 bg-gray-200 rounded-lg w-24" />

                <div className="h-4 bg-gray-100 rounded-lg w-16" />

              </div>

              <div className="h-10 bg-gray-200 rounded-xl mt-4" />

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatEventDate(
  date
) {
  if (!date) {
    return "Date TBA";
  }

  try {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-KE",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return date;
  }
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatEventTime(
  time
) {
  if (!time) {
    return "";
  }

  try {
    return new Date(
      `2000-01-01T${time}`
    ).toLocaleTimeString(
      "en-KE",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  } catch {
    return time;
  }
}

/* =========================================================
   GET MONTH
========================================================= */

function getMonth(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(
      `${date}T00:00:00`
    )
      .toLocaleDateString(
        "en-KE",
        {
          month: "short",
        }
      )
      .toUpperCase();
  } catch {
    return "";
  }
}

/* =========================================================
   GET DAY
========================================================= */

function getDay(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(
      `${date}T00:00:00`
    ).getDate();
  } catch {
    return "";
  }
}