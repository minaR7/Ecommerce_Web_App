import React from "react";
import { Card, Typography, Spin } from "antd";
import { usePageContent } from "../../hooks/usePageContent";

const { Title, Paragraph } = Typography;

const PrivacyPolicy = () => {
  const { page, loading } = usePageContent('privacy-policy');

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  }

  if (page) {
    return (
      <div className="min-h-screen w-full py-10 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <Card className="text-center shadow-md rounded-xl mb-8">
            <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
              {page.title}
            </Title>
            <p className="text-gray-500 italic text-base">
              Last Updated: {new Date(page.updated_at).toLocaleDateString()}
            </p>
          </Card>
          <Card className="shadow-md rounded-xl p-6 md:p-10">
            <div dangerouslySetInnerHTML={{ __html: page.content }} className="prose max-w-none" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
            Privacy & Cookie Policy
          </Title>
        </Card>

        {/* Intro */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center">
          <p className="text-gray-700 text-lg">
            This policy explains how we collect, use, and protect your data.
          </p>
        </div>

        <Card className="shadow-md rounded-xl p-6 md:p-10">

          <Section
            number="1"
            title="Responsible Entity"
            list={[
              "Elmaghrib.com",
              "Address: 6 Newton Park, Mayfield, Cork, Ireland",
              "Email (Data Protection Officer): contact@elmaghrib.com",
            ]}
          />

          <Section
            number="2"
            title="Scope of Policy"
            content="This Privacy and Cookie Policy explains how Elmaghrib.com collects, processes, and stores personal data according to GDPR and Irish Data Protection Law. By using our website, you consent to the practices described here."
          />

          <Section
            number="3"
            title="Personal Data We Collect"
            list={[
              "Name, surname, email, phone number, delivery and billing addresses.",
              "Account information (username, password, unique user ID).",
              "Payment information and purchase history (processed securely via Stripe or PayPal).",
              "Optional information for personalised services (future custom sizing).",
              "Currently operating within EU & UK, with plans for future global expansion."
            ]}
          />

          <Section
            number="4"
            title="How We Use Your Data"
            list={[
              "Order Processing & Delivery – managing purchases, returns and exchanges.",
              "Customer Accounts – creating and maintaining profiles.",
              "Customer Service – responding to inquiries and issues.",
              "Marketing (with consent) – newsletters, product updates, promotions.",
              "Website Operation – improving performance and ensuring security.",
              "Legal Compliance – fraud prevention and regulatory requirements."
            ]}
          />

          <Section
            number="5"
            title="Data Sharing"
            list={[
              "Payment processors (Stripe, PayPal).",
              "Shipping partners for delivery purposes.",
              "Legal authorities when required by law.",
              "No sale of customer data to third parties.",
            ]}
          />

          <Section
            number="6"
            title="Data Retention"
            content="Your data is retained only as long as needed for the purposes outlined. If you close your account or request deletion, we securely remove your data unless retention is legally required."
          />

          <Section
            number="7"
            title="Your Rights"
            list={[
              "Access your personal data.",
              "Correct inaccurate or incomplete information.",
              "Request deletion or restriction of processing.",
              "Object to processing or marketing.",
              "Withdraw consent at any time.",
              "Data portability (where applicable).",
              "Requests processed via: contact@elmaghrib.com",
            ]}
          />

          <Section
            number="8"
            title="Cookies & Tracking"
            list={[
              "Functional Cookies – essential for login, cart, and navigation.",
              "Analytical Cookies – used for improving site performance (Google Analytics).",
              "Marketing Cookies – used for personalised ads (Facebook Pixel).",
              "Cookie settings can be modified in your browser.",
            ]}
          />

          <Section
            number="9"
            title="Security"
            content="We apply strong technical and organisational measures including encryption, secure servers, and restricted access to protect your data."
          />

          <Section
            number="10"
            title="International Transfers"
            content="Your data is stored in Ireland. If data is transferred outside the EU/EEA in the future, we will implement GDPR-approved safeguards."
          />

          <Section
            number="11"
            title="Changes to This Policy"
            content="This policy may be updated periodically. Significant changes will be posted on our website. Please review regularly to stay informed."
          />

          <Section
            number="12"
            title="Contact"
            list={[
              "Data Protection Officer – Elmaghrib.com",
              "Email: contact@elmaghrib.com",
              "Address: 6 Newton Park, Mayfield, Cork, Ireland"
            ]}
          />

        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;


/// ------------------------------------------------
/// Reusable Section Component
/// ------------------------------------------------
const Section = ({ number, title, content, list }) => {
  return (
    <div className="mb-10 pb-6 border-b border-gray-200 last:border-none last:pb-0">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-[#202836] text-white flex items-center justify-center font-bold text-lg mr-4">
          {number}
        </div>

        <Title level={3} className="!text-2xl font-semibold text-gray-800 m-0">
          {title}
        </Title>
      </div>

      <div className="mt-4 ml-14 text-gray-600 text-base leading-relaxed">
        {content && <Paragraph>{content}</Paragraph>}

        {list && (
          <ul className="list-disc pl-5">
            {list.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
