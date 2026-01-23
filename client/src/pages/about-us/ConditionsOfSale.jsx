import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const ConditionsOfSale = () => {
  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
            Conditions Of Sale
          </Title>
          {/* <p className="text-gray-500 italic text-base">Last Updated: January 2025</p> */}
        </Card>

        {/* Introduction */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center">
          <p className="text-gray-700 text-lg">
            Please read these terms carefully before placing an order.
          </p>
        </div>

        {/* Terms Content */}
        <Card className="shadow-md rounded-xl p-6 md:p-10">

          <Section
            number="1"
            title="Scope"
            content="These conditions apply to all sales made through Elmaghrib.com. By placing an order, you agree to these terms."
          />

          <Section
            number="2"
            title="Products"
            content="Elmaghrib.com sells Moroccan thobes, hoodies, and other apparel. We strive to display accurate product information, including colour, size, and materials. Slight variations may occur due to lighting, screen settings, or manufacturing."
          />

          <Section
            number="3"
            title="Ordering & Payment"
            list={[
              "Orders can be placed online via Stripe (credit/debit card) or PayPal.",
              "All payments are processed securely; Elmaghrib.com does not store credit card details.",
              "Orders will be confirmed via email once payment is successfully processed."
            ]}
          />

          <Section
            number="4"
            title="Delivery & Shipping"
            list={[
              "Delivery times and costs are outlined in our Delivery Policy.",
              "Elmaghrib.com is not liable for delays caused by third-party shipping providers.",
              "Customers are responsible for providing accurate delivery addresses."
            ]}
          />

          <Section
            number="5"
            title="Returns & Exchanges"
            list={[
              "Customers have 15 days from receipt to request a return or exchange (except for custom-made items).",
              "Returned items must be in original condition and packaging.",
              "Refunds will be processed within 15 days after receiving the returned product."
            ]}
          />

          <Section
            number="6"
            title="Custom Products"
            list={[
              "Custom-sized or personalized products are exempt from the right of withdrawal.",
              "Please ensure all custom requests are correct, as errors cannot be refunded."
            ]}
          />

          <Section
            number="7"
            title="Warranty & Liability"
            list={[
              "Products are covered under Irish consumer protection laws.",
              "Elmaghrib.com is not liable for misuse, damage caused by negligence, or natural wear and tear."
            ]}
          />

          <Section
            number="8"
            title="Privacy & Data Protection"
            list={[
              "All customer data is processed in compliance with GDPR and Irish Data Protection laws.",
              "Refer to our Privacy and Cookie Policy for full details."
            ]}
          />

          <Section
            number="9"
            title="Governing Law"
            content="These Conditions of Sale are governed by the laws of Ireland. Any disputes arising from sales or website use will fall under the jurisdiction of Irish courts."
          />

          {/* Important Notes */}
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mt-10">
            <h3 className="text-green-800 text-xl font-semibold mb-3">Important Notes for Customers</h3>
            <ul className="list-disc pl-6 text-green-900">
              <li>Orders are currently processed in EU & UK, but global shipping may be available in the future.</li>
              <li>Customers should create accounts for easier checkout.</li>
              <li>Future options will include customized sizes and international shipping.</li>
            </ul>
          </div>

        </Card>

        {/* Footer */}
        {/* <Card className="text-center shadow-md rounded-xl mt-10">
          <p className="text-gray-500 text-base">Thank you for choosing Elmaghrib.com</p>
        </Card> */}
      </div>
    </div>
  );
};

export default ConditionsOfSale;



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
