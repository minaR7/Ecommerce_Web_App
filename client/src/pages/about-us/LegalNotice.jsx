import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const LegalNotice = () => {
  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
            Website Legal Information
          </Title>
        </Card>

        {/* Intro */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center">
          <p className="text-gray-700 text-lg">
            The following information outlines ownership, usage policies, data processing, and legal obligations.
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-md rounded-xl p-6 md:p-10">

          <Section
            number="1"
            title="Website Owner"
            list={[
              "Elmaghrib.com",
              "Address: 6 Newton Park, Mayfield, Cork, Ireland",
              "Email: info@elmaghrib.com",
              "Company Registration: Registered in Ireland.",
              "Company Registration Number: [Al-Quds Distributors Limited]",
              "VAT Number: [Blank for now]",
              "Director: [Kashif Nisar Mirza]"
            ]}
          />

          <Section
            number="2"
            title="Hosting Provider"
            list={[
              "[Hosting Provider Name]",
              "[Hosting Provider Address]",
              "[Hosting Provider Contact Info]"
            ]}
          />

          <Section
            number="3"
            title="Intellectual Property"
            content="All images, graphics, text, logos, and designs are the property of Elmaghrib.com or its licensors and protected by Irish and international copyright laws. No content may be reproduced, distributed, or reused without written permission from Elmaghrib.com."
          />

          <Section
            number="4"
            title="Website Use"
            content="By using Elmaghrib.com, you agree to follow Irish law and our terms. Misuse — including hacking, spreading harmful content, or violating copyright — is strictly prohibited."
          />

          <Section
            number="5"
            title="Limitation of Liability"
            content="Elmaghrib.com strives for accuracy and security in its website content and services. However, the website is provided “as is,” and we do not accept liability for any damages arising from the use of the website, including data loss, technical errors, or delays."
          />

          <Section
            number="6"
            title="Governing Law"
            content="This website and its terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of Irish courts."
          />

        </Card>

      </div>
    </div>
  );
};

export default LegalNotice;



// ------------------------------------------------
// Reusable Section Component (JSX version)
// ------------------------------------------------
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
            {list.map((item, idx) => (
              <li key={idx} className="mb-2">{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
