// CreateEventPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaImage,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTicketAlt,
  FaUserTie,
  FaUpload,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

import {
  MdCategory,
  MdEvent,
} from "react-icons/md";

import api from "../Api/api";
import Swal from "sweetalert2";

export default function CreateEvent() {
  const navigate = useNavigate();

  /* =========================================================
     USER
  ========================================================= */

  let user = null;

  try {
    user = localStorage.getItem("user")
      ? JSON.parse(
          localStorage.getItem("user")
        )
      : null;
  } catch {
    user = null;
  }

  /* =========================================================
     FORM
  ========================================================= */

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      county: "",
      location: "",
      date: "",
      time: "",
      price: "",
      total_tickets: "",
      organizer_name:
        user?.name || "",
      contact_email:
        user?.email || "",
      image: null,
    });

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  /* =========================================================
     REDIRECTS
  ========================================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "organizer") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================================
     CLEAN IMAGE OBJECT URL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

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
     MINIMUM DATE
  ========================================================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    if (name === "image") {
      const file =
        files?.[0];

      if (file) {
        handleImage(file);
      }

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE IMAGE
  ========================================================= */

  const handleImage = (file) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please select an image file.",
        confirmButtonColor:
          "#f97316",
      });

      return;
    }

    /*
      10MB frontend limit.
      Change this if your backend has
      another upload limit.
    */

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: "Please upload an image smaller than 10MB.",
        confirmButtonColor:
          "#f97316",
      });

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setFormData(
      (previous) => ({
        ...previous,
        image: file,
      })
    );

    setImagePreview(preview);
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImagePreview("");

    setFormData(
      (previous) => ({
        ...previous,
        image: null,
      })
    );
  };

  /* =========================================================
     DRAG AND DROP
  ========================================================= */

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragover"
    ) {
      setDragActive(true);
    }

    if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      handleImage(file);
    }
  };

  /* =========================================================
     VALIDATE
  ========================================================= */

  const validateForm = () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.county ||
      !formData.location.trim() ||
      !formData.date ||
      !formData.time ||
      formData.price === "" ||
      !formData.total_tickets ||
      !formData.organizer_name.trim() ||
      !formData.contact_email.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Complete Event Details",
        text:
          "Please fill in all required fields.",
        confirmButtonColor:
          "#f97316",
      });

      return false;
    }

    if (
      Number(formData.price) < 0
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Invalid Ticket Price",
        text:
          "Ticket price cannot be negative.",
        confirmButtonColor:
          "#f97316",
      });

      return false;
    }

    if (
      Number(
        formData.total_tickets
      ) < 1
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Invalid Ticket Quantity",
        text:
          "Your event must have at least one ticket.",
        confirmButtonColor:
          "#f97316",
      });

      return false;
    }

    if (!formData.image) {
      Swal.fire({
        icon: "warning",
        title:
          "Event Poster Required",
        text:
          "Please upload an event image or poster.",
        confirmButtonColor:
          "#f97316",
      });

      return false;
    }

    const eventDate =
      new Date(
        `${formData.date}T${formData.time}`
      );

    if (
      eventDate <= new Date()
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Invalid Event Date",
        text:
          "Please select a future date and time.",
        confirmButtonColor:
          "#f97316",
      });

      return false;
    }

    return true;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const data =
          new FormData();

        data.append(
          "title",
          formData.title.trim()
        );

        data.append(
          "description",
          formData.description.trim()
        );

        data.append(
          "category",
          formData.category
        );

        data.append(
          "county",
          formData.county
        );

        data.append(
          "location",
          formData.location.trim()
        );

        data.append(
          "date",
          formData.date
        );

        data.append(
          "time",
          formData.time
        );

        data.append(
          "price",
          formData.price
        );

        data.append(
          "total_tickets",
          formData.total_tickets
        );

        data.append(
          "organizer_name",
          formData.organizer_name.trim()
        );

        data.append(
          "contact_email",
          formData.contact_email.trim()
        );

        data.append(
          "image",
          formData.image
        );

        await api.post(
          "/create_event/",
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        await Swal.fire({
          icon: "success",
          title:
            "Event Submitted!",
          html: `
            <div style="line-height:1.6">
              Your event has been submitted successfully.
              <br/><br/>
              It will become publicly visible after administrator approval.
            </div>
          `,
          confirmButtonText:
            "Go to Dashboard",
          confirmButtonColor:
            "#f97316",
        });

        navigate(
          "/creator-dashboard"
        );
      } catch (err) {
        console.error(
          "Create event error:",
          err
        );

        Swal.fire({
          icon: "error",
          title:
            "Failed to Create Event",
          text:
            err.response?.data
              ?.message ||
            err.response?.data
              ?.error ||
            "An unexpected error occurred. Please try again.",
          confirmButtonColor:
            "#f97316",
        });
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-r from-orange-500 to-gray-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/creator-dashboard"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-100 hover:text-white transition"
          >
            <FaArrowLeft />

            Back to Dashboard
          </button>

          <div className="mt-6 max-w-2xl">

            <p className="text-orange-100 text-sm font-medium">
              Organizer Workspace
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-white mt-1">
              Create a New Event
            </h1>

            <p className="text-orange-100 mt-3 leading-relaxed">
              Add your event details,
              ticket information and
              promotional poster. Your
              event will be submitted for
              approval before it becomes
              publicly available.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="space-y-6">

              {/* ===============================================
                  BASIC INFORMATION
              =============================================== */}

              <SectionCard
                icon={
                  <MdEvent />
                }
                title="Event Information"
                description="Tell attendees what your event is about."
              >

                <div className="space-y-5">

                  <FormGroup
                    label="Event Title"
                    required
                  >

                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={150}
                      placeholder="e.g. Nairobi Tech Summit 2026"
                      className={
                        inputClass
                      }
                    />

                    <div className="flex justify-end mt-1">

                      <span className="text-xs text-gray-400">
                        {
                          formData
                            .title
                            .length
                        }
                        /150
                      </span>

                    </div>

                  </FormGroup>

                  <FormGroup
                    label="Description"
                    required
                  >

                    <textarea
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={
                        handleChange
                      }
                      rows={7}
                      maxLength={3000}
                      placeholder="Describe the event, what attendees should expect, key activities, speakers, entertainment, requirements and other important information..."
                      className={`${inputClass} resize-none`}
                    />

                    <div className="flex justify-between mt-1">

                      <span className="text-xs text-gray-400">
                        Give attendees
                        enough information
                        to decide whether
                        to book.
                      </span>

                      <span className="text-xs text-gray-400">
                        {
                          formData
                            .description
                            .length
                        }
                        /3000
                      </span>

                    </div>

                  </FormGroup>

                  <div className="grid md:grid-cols-2 gap-5">

                    <FormGroup
                      label="Category"
                      required
                    >

                      <div className="relative">

                        <MdCategory className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                        <select
                          name="category"
                          value={
                            formData.category
                          }
                          onChange={
                            handleChange
                          }
                          className={`${inputClass} pl-10 bg-white`}
                        >
                          <option value="">
                            Select category
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
                                {
                                  category
                                }
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </FormGroup>

                    <FormGroup
                      label="Organizer Name"
                      required
                    >

                      <IconInput
                        icon={
                          <FaUserTie />
                        }
                      >
                        <input
                          type="text"
                          name="organizer_name"
                          value={
                            formData.organizer_name
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. Nexindi Events"
                          className={`${inputClass} pl-10`}
                        />
                      </IconInput>

                    </FormGroup>

                  </div>

                </div>

              </SectionCard>

              {/* ===============================================
                  LOCATION & SCHEDULE
              =============================================== */}

              <SectionCard
                icon={
                  <FaMapMarkerAlt />
                }
                title="Location & Schedule"
                description="Tell attendees where and when the event will happen."
              >

                <div className="grid md:grid-cols-2 gap-5">

                  <FormGroup
                    label="County"
                    required
                  >

                    <select
                      name="county"
                      value={
                        formData.county
                      }
                      onChange={
                        handleChange
                      }
                      className={`${inputClass} bg-white`}
                    >
                      <option value="">
                        Select county
                      </option>

                      {counties.map(
                        (county) => (
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

                  </FormGroup>

                  <FormGroup
                    label="Venue / Location"
                    required
                  >

                    <IconInput
                      icon={
                        <FaMapMarkerAlt />
                      }
                    >
                      <input
                        type="text"
                        name="location"
                        value={
                          formData.location
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. KICC, Nairobi"
                        className={`${inputClass} pl-10`}
                      />
                    </IconInput>

                  </FormGroup>

                  <FormGroup
                    label="Event Date"
                    required
                  >

                    <IconInput
                      icon={
                        <FaCalendarAlt />
                      }
                    >
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={
                          formData.date
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </IconInput>

                  </FormGroup>

                  <FormGroup
                    label="Start Time"
                    required
                  >

                    <IconInput
                      icon={
                        <FaClock />
                      }
                    >
                      <input
                        type="time"
                        name="time"
                        value={
                          formData.time
                        }
                        onChange={
                          handleChange
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </IconInput>

                  </FormGroup>

                </div>

              </SectionCard>

              {/* ===============================================
                  TICKETING
              =============================================== */}

              <SectionCard
                icon={
                  <FaTicketAlt />
                }
                title="Ticketing"
                description="Set the ticket price and number of tickets available."
              >

                <div className="grid md:grid-cols-2 gap-5">

                  <FormGroup
                    label="Ticket Price"
                    required
                  >

                    <IconInput
                      icon={
                        <FaMoneyBillWave />
                      }
                    >
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="1"
                        value={
                          formData.price
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. 1500"
                        className={`${inputClass} pl-10 pr-16`}
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                        KES
                      </span>

                    </IconInput>

                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter 0 for a free
                      event.
                    </p>

                  </FormGroup>

                  <FormGroup
                    label="Total Tickets"
                    required
                  >

                    <IconInput
                      icon={
                        <FaTicketAlt />
                      }
                    >
                      <input
                        type="number"
                        name="total_tickets"
                        min="1"
                        step="1"
                        value={
                          formData.total_tickets
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. 500"
                        className={`${inputClass} pl-10`}
                      />
                    </IconInput>

                    <p className="text-xs text-gray-400 mt-1.5">
                      Maximum number of
                      tickets available
                      for this event.
                    </p>

                  </FormGroup>

                </div>

              </SectionCard>

              {/* ===============================================
                  CONTACT
              =============================================== */}

              <SectionCard
                icon={
                  <FaEnvelope />
                }
                title="Contact Information"
                description="This contact can be used for event-related enquiries."
              >

                <FormGroup
                  label="Contact Email"
                  required
                >

                  <IconInput
                    icon={
                      <FaEnvelope />
                    }
                  >
                    <input
                      type="email"
                      name="contact_email"
                      value={
                        formData.contact_email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="events@example.com"
                      className={`${inputClass} pl-10`}
                    />
                  </IconInput>

                </FormGroup>

              </SectionCard>

              {/* ===============================================
                  POSTER
              =============================================== */}

              <SectionCard
                icon={
                  <FaImage />
                }
                title="Event Poster"
                description="Upload an attractive image that represents your event."
              >

                {!imagePreview ? (

                  <label
                    onDragEnter={
                      handleDrag
                    }
                    onDragOver={
                      handleDrag
                    }
                    onDragLeave={
                      handleDrag
                    }
                    onDrop={
                      handleDrop
                    }
                    className={`block border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition ${
                      dragActive
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/40"
                    }`}
                  >

                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={
                        handleChange
                      }
                      className="hidden"
                    />

                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-orange-500 text-xl">
                      <FaUpload />
                    </div>

                    <p className="font-bold text-gray-700 mt-4">
                      Upload your event
                      poster
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      Click to browse or
                      drag and drop an
                      image here.
                    </p>

                    <p className="text-xs text-gray-400 mt-3">
                      JPG, PNG or WEBP •
                      Maximum 10MB
                    </p>

                  </label>

                ) : (

                  <div className="relative overflow-hidden rounded-2xl border border-gray-100">

                    <img
                      src={
                        imagePreview
                      }
                      alt="Event poster preview"
                      className="w-full max-h-[500px] object-cover"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">

                      <div className="flex items-end justify-between gap-3">

                        <div>

                          <p className="text-white font-semibold">
                            {
                              formData
                                .image
                                ?.name
                            }
                          </p>

                          <p className="text-white/70 text-xs mt-1">
                            Event poster
                            selected
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-red-500 shadow"
                        >
                          <FaTimes />
                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </SectionCard>

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="lg:sticky lg:top-5 space-y-5">

              {/* ===============================================
                  LIVE PREVIEW
              =============================================== */}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="px-5 py-4 border-b border-gray-100">

                  <p className="font-bold text-gray-800">
                    Event Preview
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    A quick preview of
                    your event.
                  </p>

                </div>

                <div className="relative h-44 bg-gray-100">

                  {imagePreview ? (

                    <img
                      src={
                        imagePreview
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">

                      <FaImage className="text-3xl" />

                      <span className="text-xs mt-2">
                        Event poster
                      </span>

                    </div>

                  )}

                  {formData.category && (

                    <span className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-orange-500 shadow-sm">
                      {
                        formData.category
                      }
                    </span>

                  )}

                </div>

                <div className="p-5">

                  <h3 className="font-black text-gray-800 text-xl leading-tight">
                    {formData.title ||
                      "Your Event Title"}
                  </h3>

                  <div className="space-y-2.5 mt-4">

                    <PreviewRow
                      icon={
                        <FaCalendarAlt />
                      }
                      text={
                        formData.date
                          ? formatDate(
                              formData.date
                            )
                          : "Event date"
                      }
                    />

                    <PreviewRow
                      icon={
                        <FaClock />
                      }
                      text={
                        formData.time
                          ? formatTime(
                              formData.time
                            )
                          : "Event time"
                      }
                    />

                    <PreviewRow
                      icon={
                        <FaMapMarkerAlt />
                      }
                      text={
                        formData.location ||
                        formData.county ||
                        "Event location"
                      }
                    />

                  </div>

                  <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-end">

                    <div>

                      <p className="text-xs text-gray-400">
                        Ticket Price
                      </p>

                      <p className="font-black text-orange-500 text-lg mt-1">
                        {formData.price ===
                        ""
                          ? "KES 0"
                          : Number(
                                formData.price
                              ) === 0
                            ? "FREE"
                            : `KES ${Number(
                                formData.price
                              ).toLocaleString()}`}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-gray-400">
                        Tickets
                      </p>

                      <p className="font-bold text-gray-700 mt-1">
                        {formData.total_tickets ||
                          "0"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ===============================================
                  REVIEW NOTICE
              =============================================== */}

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">

                <div className="flex gap-3">

                  <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />

                  <div>

                    <p className="font-bold text-gray-800 text-sm">
                      Event Approval
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                      Your event will be
                      submitted for
                      administrator review.
                      It will become
                      publicly visible once
                      approved.
                    </p>

                  </div>

                </div>

              </div>

              {/* ===============================================
                  CHECKLIST
              =============================================== */}

              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">

                <p className="font-bold text-gray-800">
                  Event Checklist
                </p>

                <div className="space-y-3 mt-4">

                  <ChecklistItem
                    complete={
                      Boolean(
                        formData.title
                      )
                    }
                    label="Event title"
                  />

                  <ChecklistItem
                    complete={
                      Boolean(
                        formData.description
                      )
                    }
                    label="Description"
                  />

                  <ChecklistItem
                    complete={
                      Boolean(
                        formData.date &&
                          formData.time
                      )
                    }
                    label="Date & time"
                  />

                  <ChecklistItem
                    complete={
                      Boolean(
                        formData.county &&
                          formData.location
                      )
                    }
                    label="Venue"
                  />

                  <ChecklistItem
                    complete={
                      formData.price !==
                        "" &&
                      Boolean(
                        formData.total_tickets
                      )
                    }
                    label="Ticket information"
                  />

                  <ChecklistItem
                    complete={
                      Boolean(
                        formData.image
                      )
                    }
                    label="Event poster"
                  />

                </div>

              </div>

              {/* ===============================================
                  SUBMIT
              =============================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 py-3.5 font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Creating Event...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />

                    Submit Event for
                    Approval
                  </>
                )}

              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  navigate(
                    "/creator-dashboard"
                  )
                }
                className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-300 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15";

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
            {icon}
          </div>

          <div>

            <h2 className="font-bold text-gray-800 text-lg">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   FORM GROUP
========================================================= */

function FormGroup({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-gray-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/* =========================================================
   ICON INPUT
========================================================= */

function IconInput({
  icon,
  children,
}) {
  return (
    <div className="relative">

      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
        {icon}
      </span>

      {children}

    </div>
  );
}

/* =========================================================
   PREVIEW ROW
========================================================= */

function PreviewRow({
  icon,
  text,
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-gray-500">

      <span className="text-orange-500 mt-0.5 flex-shrink-0">
        {icon}
      </span>

      <span className="line-clamp-2">
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   CHECKLIST
========================================================= */

function ChecklistItem({
  complete,
  label,
}) {
  return (
    <div className="flex items-center gap-2.5">

      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
          complete
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-300"
        }`}
      >
        <FaCheckCircle />
      </div>

      <span
        className={`text-sm ${
          complete
            ? "text-gray-700"
            : "text-gray-400"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {
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

function formatTime(time) {
  try {
    return new Date(
      `2000-01-01T${time}`
    ).toLocaleTimeString(
      "en-KE",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return time;
  }
}