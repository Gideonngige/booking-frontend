import React from "react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">

        <h1 className="text-4xl font-bold text-center text-orange-500 mb-3">
          Terms of Service
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Effective Date: July 6, 2026
        </p>

        <p className="text-gray-700 leading-8 mb-8">
          Welcome to <strong>Karibu Event</strong>. These Terms of Service
          ("Terms") govern your access to and use of the Karibu Event website,
          mobile applications, and related services (collectively, the
          "Platform"). By accessing or using our Platform, you agree to be bound
          by these Terms. If you do not agree, please do not use our services.
        </p>

        {/* Acceptance */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            1. Acceptance of Terms
          </h2>

          <p className="text-gray-700 leading-8">
            By creating an account, browsing, purchasing tickets, organizing
            events, or using any feature of Karibu Event, you acknowledge that
            you have read, understood, and agree to comply with these Terms.
          </p>
        </section>

        {/* Eligibility */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            2. Eligibility
          </h2>

          <p className="text-gray-700 leading-8">
            You must be legally capable of entering into a binding agreement in
            your jurisdiction. If you are using the Platform on behalf of an
            organization, you confirm that you have authority to bind that
            organization to these Terms.
          </p>
        </section>

        {/* Accounts */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            3. User Accounts
          </h2>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Provide accurate and up-to-date information.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Notify us immediately of unauthorized account access.</li>
            <li>You are responsible for all activities under your account.</li>
          </ul>
        </section>

        {/* Event Organizers */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            4. Event Organizers
          </h2>

          <p className="text-gray-700 mb-4">
            Organizers are responsible for:
          </p>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Providing accurate event details.</li>
            <li>Ensuring events comply with applicable laws.</li>
            <li>Delivering the advertised event experience.</li>
            <li>Handling attendee communications when necessary.</li>
            <li>Obtaining any required permits or licenses.</li>
          </ul>
        </section>

        {/* Ticket Purchases */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            5. Ticket Purchases
          </h2>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>All ticket purchases are subject to availability.</li>
            <li>Prices may include taxes or applicable service fees.</li>
            <li>Tickets may not be duplicated or fraudulently resold.</li>
            <li>Each ticket is valid only for the specified event.</li>
          </ul>
        </section>

        {/* Payments */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            6. Payments
          </h2>

          <p className="text-gray-700 leading-8">
            Payments are processed securely through trusted third-party payment
            providers. Karibu Event does not store your complete payment card
            information.
          </p>
        </section>

        {/* Refunds */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            7. Cancellations & Refunds
          </h2>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Refund policies are determined by the event organizer.</li>
            <li>Cancelled events may qualify for refunds.</li>
            <li>Service fees may be non-refundable where permitted by law.</li>
            <li>Refund processing times depend on the payment provider.</li>
          </ul>
        </section>

        {/* Prohibited */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            8. Prohibited Activities
          </h2>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Using false identities.</li>
            <li>Posting misleading or fraudulent events.</li>
            <li>Violating applicable laws or regulations.</li>
            <li>Uploading malicious software or harmful code.</li>
            <li>Attempting unauthorized access to our systems.</li>
            <li>Harassing or abusing other users.</li>
            <li>Violating intellectual property rights.</li>
          </ul>
        </section>

        {/* IP */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            9. Intellectual Property
          </h2>

          <p className="text-gray-700 leading-8">
            All content on Karibu Event, including logos, branding, software,
            graphics, and design elements, is owned by or licensed to Karibu
            Event and is protected by applicable intellectual property laws.
          </p>
        </section>

        {/* Privacy */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            10. Privacy
          </h2>

          <p className="text-gray-700 leading-8">
            Your use of the Platform is also governed by our Privacy Policy,
            which explains how we collect, use, and protect your personal
            information.
          </p>
        </section>

        {/* Suspension */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            11. Suspension or Termination
          </h2>

          <p className="text-gray-700 leading-8">
            We reserve the right to suspend or terminate accounts that violate
            these Terms or engage in activities that may harm our users or the
            Platform.
          </p>
        </section>

        {/* Liability */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            12. Limitation of Liability
          </h2>

          <p className="text-gray-700 leading-8">
            Karibu Event acts as a platform connecting organizers and attendees.
            We are not responsible for the quality, safety, legality, or
            execution of events organized by third parties.
          </p>
        </section>

        {/* Warranty */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            13. Disclaimer
          </h2>

          <p className="text-gray-700 leading-8">
            The Platform is provided on an "as is" and "as available" basis
            without warranties of any kind, whether express or implied.
          </p>
        </section>

        {/* Changes */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            14. Changes to These Terms
          </h2>

          <p className="text-gray-700 leading-8">
            We may update these Terms from time to time. Continued use of the
            Platform after changes become effective constitutes acceptance of
            the revised Terms.
          </p>
        </section>

        {/* Governing */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            15. Governing Law
          </h2>

          <p className="text-gray-700 leading-8">
            These Terms shall be governed by and interpreted in accordance with
            the laws applicable in the jurisdiction where Karibu Event operates,
            without regard to conflict of law principles.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            16. Contact Us
          </h2>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="font-semibold text-lg text-orange-500">
              Karibu Event
            </p>

            <p className="mt-2 text-gray-700">
              Email: support@karibuevent.online
            </p>

            <p className="text-gray-700">
              Phone: +254 797 655 727
            </p>

            <p className="text-gray-700">
              Website: www.karibuevent.online
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default TermsOfService;