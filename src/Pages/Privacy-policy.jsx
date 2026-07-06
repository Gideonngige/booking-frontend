import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-center text-orange-500 mb-3">
          Privacy Policy
        </h1>

        <p className="text-center text-gray-500 mb-10">
          Last Updated: July 6, 2026
        </p>

        <p className="text-gray-700 leading-8 mb-8">
          Welcome to <strong>Karibu Event</strong>. Your privacy is important to
          us. This Privacy Policy explains how we collect, use, store, and
          protect your personal information when you use our platform. By
          accessing or using Karibu Event, you agree to the practices described
          in this Privacy Policy.
        </p>

        {/* Information We Collect */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            1. Information We Collect
          </h2>

          <p className="text-gray-700 mb-4">
            We may collect the following categories of information:
          </p>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>
              Personal information such as your name, email address, phone
              number, and profile picture.
            </li>

            <li>
              Account credentials including your encrypted password.
            </li>

            <li>
              Event information such as events you create, register for, or
              attend.
            </li>

            <li>
              Payment information for ticket purchases. Payment processing is
              handled securely through trusted third-party payment providers.
            </li>

            <li>
              Device information including browser type, IP address, operating
              system, and device identifiers.
            </li>

            <li>
              Usage information including pages visited, searches performed, and
              interactions with our platform.
            </li>
          </ul>
        </section>

        {/* How We Use */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            2. How We Use Your Information
          </h2>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Create and manage your account.</li>
            <li>Allow you to organize, discover, and attend events.</li>
            <li>Process ticket purchases and payments.</li>
            <li>Send confirmations, reminders, and notifications.</li>
            <li>Provide customer support.</li>
            <li>Improve our services and user experience.</li>
            <li>Prevent fraud and enhance platform security.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        {/* Sharing */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            3. Sharing Your Information
          </h2>

          <p className="text-gray-700 mb-4">
            We do not sell your personal information.
          </p>

          <p className="text-gray-700 mb-4">
            We may share your information with:
          </p>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Event organizers for events you register to attend.</li>
            <li>Payment providers to process transactions.</li>
            <li>Cloud hosting and technology service providers.</li>
            <li>Government authorities where required by law.</li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            4. Cookies and Tracking Technologies
          </h2>

          <p className="text-gray-700 leading-8">
            We use cookies and similar technologies to improve website
            functionality, remember your preferences, understand user behavior,
            and enhance your browsing experience.
          </p>
        </section>

        {/* Security */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            5. Data Security
          </h2>

          <p className="text-gray-700 leading-8">
            We implement industry-standard security measures including encrypted
            communication, secure authentication, and restricted access to
            protect your personal information. However, no online platform can
            guarantee complete security.
          </p>
        </section>

        {/* Retention */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            6. Data Retention
          </h2>

          <p className="text-gray-700 leading-8">
            We retain your information only as long as necessary to provide our
            services, comply with legal obligations, resolve disputes, and
            enforce our agreements.
          </p>
        </section>

        {/* User Rights */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            7. Your Rights
          </h2>

          <p className="text-gray-700 mb-4">
            Depending on applicable laws, you may have the right to:
          </p>

          <ul className="list-disc ml-8 space-y-3 text-gray-700">
            <li>Access your personal information.</li>
            <li>Correct inaccurate information.</li>
            <li>Delete your account.</li>
            <li>Withdraw consent where applicable.</li>
            <li>Request a copy of your stored information.</li>
          </ul>
        </section>

        {/* Third Party */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            8. Third-Party Services
          </h2>

          <p className="text-gray-700 leading-8">
            Karibu Event may contain links to third-party websites or services.
            We are not responsible for the privacy practices of those external
            services.
          </p>
        </section>

        {/* Children */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            9. Children's Privacy
          </h2>

          <p className="text-gray-700 leading-8">
            Our platform is not intended for children under the age required by
            applicable law without parental or guardian consent.
          </p>
        </section>

        {/* Updates */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            10. Changes to This Privacy Policy
          </h2>

          <p className="text-gray-700 leading-8">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with the updated revision date.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-orange-500 mb-4">
            11. Contact Us
          </h2>

          <p className="text-gray-700 leading-8">
            If you have any questions about this Privacy Policy or how your
            information is handled, please contact us:
          </p>

          <div className="mt-6 p-6 rounded-lg bg-orange-50 border border-orange-200">
            <p>
              <strong>Karibu Event</strong>
            </p>

            <p>Email: support@karibuevent.online</p>

            <p>Phone: +254 797 655 727</p>

            <p>Website: www.karibuevent.online</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;