import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const PaymentMethods = () => {
  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
           Payment Methods
          </Title>
        </Card>

        {/* Intro */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center">
          <p className="text-gray-700 text-lg">
         Elmaghrib.com offers secure and convenient payment options to ensure a smooth shopping experience. All transactions are processed through trusted and encrypted payment gateways.
               
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-md rounded-xl p-6 md:p-10">

          {/* <Section
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
          /> */}

          {/* Payment Methods Section */}
     <>
                <Paragraph className="font-semibold mt-4">1. Payment by Credit or Debit Card via Stripe</Paragraph>
                <Paragraph>We accept all major cards through Stripe, including:</Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>VISA</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>Maestro</li>
                </ul>
                <Paragraph>
                  Stripe is certified PCI DSS Level 1, the highest level of payment security.
                  Your card information is encrypted, never stored, and never accessible to Elmaghrib.com.
                  Once your payment is validated, your order will be confirmed immediately.
                </Paragraph>
                <Paragraph>
                  For more information, visit: <a href="https://stripe.com/ie" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://stripe.com/ie</a>
                </Paragraph>

                <Paragraph className="font-semibold mt-4">2. PayPal Payment</Paragraph>
                <Paragraph>
                  If you choose PayPal, you will be redirected to the official PayPal platform to complete your checkout.
                  With PayPal, you can pay:
                </Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>With your PayPal balance</li>
                  <li>Through your linked bank account</li>
                  <li>With your credit or debit card</li>
                </ul>
                <Paragraph>
                  If you do not have a PayPal account, simply click “Continue as Guest” to pay by card. PayPal will send you a confirmation email once your payment is completed.
                </Paragraph>

                <Paragraph className="font-semibold mt-4">3. Security of Payments</Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>All payments are encrypted using industry-standard SSL technology.</li>
                  <li>No banking information is processed or stored on our servers.</li>
                  <li>Payments must be fully received before any order is shipped.</li>
                </ul>

                <Paragraph className="font-semibold mt-4">4. Currency</Paragraph>
                <Paragraph>
                  All transactions on Elmaghrib.com are processed in Euro (€). If you are paying from outside the Eurozone, your bank or payment provider may apply a conversion fee.
                </Paragraph>

                <Paragraph className="font-semibold mt-4">5. Failed Payments or Errors</Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>Check if the card details entered are correct</li>
                  <li>Verify your bank’s security verification (3D Secure)</li>
                  <li>Try using another payment method</li>
                </ul>
                <Paragraph>If the issue continues, you can contact us at info@elmaghrib.com.</Paragraph>

                <Paragraph className="font-semibold mt-4">6. Fraud Prevention</Paragraph>
                <Paragraph>
                  For your protection, suspicious or high-value orders may undergo additional verification. Orders may be cancelled if fraudulent activity is suspected.
                </Paragraph>
              </>
          {/* <Section
            number="4"
            title="Intellectual Property"
            content="All images, graphics, text, logos, and designs are the property of Elmaghrib.com or its licensors and protected by Irish and international copyright laws. No content may be reproduced, distributed, or reused without written permission from Elmaghrib.com."
          /> */}
        </Card>

      </div>
    </div>
  );
};

export default PaymentMethods;

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
        {typeof content === "string" && <Paragraph>{content}</Paragraph>}
        {typeof content !== "string" && content}

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
