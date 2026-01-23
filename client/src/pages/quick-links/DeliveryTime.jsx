import React from "react";
import { Card, Table } from "antd";

const deliveryIreland = [
  { type: "Standard Delivery", time: "3 to 4 business days", price: "3.95€" },
  { type: "Home Delivery", time: "2 to 3 business days", price: "6.95€" },
  { type: "Express Delivery", time: "1 business day", price: "8.95€" },
];

const deliveryEurope = [
  { type: "Standard Delivery", time: "Approximately 2 business days", price: "6.95€" },
  { type: "Express Delivery", time: "1 business day", price: "8.95€" },
];

const deliveryInternational = [
  { type: "Standard Delivery", time: "Approximately 2 business days", price: "14.95€" },
  { type: "Express Delivery", time: "1 business day", price: "19.95€" },
];

const DeliveryPolicy = () => {
  const columns = [
    { title: "Type", dataIndex: "type", key: "type", render: (text) => <strong>{text}</strong> },
    { title: "Estimated Delivery Time", dataIndex: "time", key: "time" },
    { title: "Price", dataIndex: "price", key: "price", render: (text) => <span className="font-bold text-gray-800">{text}</span> },
  ];

  return (
    <div className="min-h-screen w-full ">
      {/* Hero Header */}
      <header className="text-center py-20 text-white" style={{background: 'linear-gradient(180deg,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(14, 15, 17, 1) 100%)' }} >
        <h1 className="text-5xl font-bold mb-2">Delivery Policy</h1>
        <p className="text-lg opacity-90">Fast, Reliable Shipping Across Europe & Beyond</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Free Delivery Banner */}
        <Card className="mb-10 text-center bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg rounded-xl">
          <p className="text-2xl font-semibold">Free delivery within Europe for orders over 200€</p>
        </Card>

        {/* Intro Text */}
        {/* <Card className="mb-10 text-center bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg rounded-xl">
          <p className="text-2xl font-semibold">Free delivery within Europe for orders over 200€</p>
        </Card> */}

        <div className="mt-4 bg-white p-8 rounded-xl shadow mb-10 text-center text-gray-700 text-lg">
          We aim to prepare and ship all orders as quickly as possible. Delivery times depend on your location and the shipping method selected at checkout.
        </div>

        {/* Sections */}
        <Section title="🇮🇪 Delivery in Ireland">
          <Table
            dataSource={deliveryIreland}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.type}
            className="shadow rounded-xl overflow-hidden"
          />
        </Section>

        <Section title="🇪🇺 Delivery in Europe">
          <Table
            dataSource={deliveryEurope}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.type}
            className="shadow rounded-xl overflow-hidden"
          />
        </Section>

        <Section title="🌍 International Delivery">
          <Table
            dataSource={deliveryInternational}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.type}
            className="shadow rounded-xl overflow-hidden"
          />
        </Section>

        <Section title="⏱ Order Processing">
          <Card className="bg-gray-100 border-l-4 border-gray-700 p-6">
            <p>✓ Orders are usually processed within <strong>24 hours</strong>, except weekends and public holidays.</p>
            <p>✓ During sales periods or special events, processing times may be slightly longer.</p>
          </Card>
        </Section>

        <Section title="📍 Order Tracking">
          <Card className="bg-gray-100 border-l-4 border-gray-700 p-6">
            <p>Once your order has been confirmed and shipped, you will receive a <strong>tracking link by email or SMS</strong> to follow your package in real time.</p>
          </Card>
        </Section>

        <Section title="⚠️ Important Information">
          <Card className="bg-yellow-100 border-l-4 border-gray-700 p-6 mb-4">
            <p><strong>Delivery Delays:</strong> Delivery times are estimated and may vary due to customs, weather, or courier delays. Elmaghrib.com cannot be held responsible for delays caused by courier services.</p>
          </Card>
          <Card className="bg-yellow-100 border-l-4 border-gray-700 p-6">
            <p><strong>Incorrect Address:</strong> If the shipping address provided is incorrect or incomplete, delivery may be delayed or the order may be returned to us. Any re-shipping costs will be the customer's responsibility.</p>
          </Card>
        </Section>

        <Section title="Need Help?">
          <Card className="bg-gradient-to-br from-teal-900 to-teal-800 text-white text-center p-12 rounded-xl">
            <h2 className="text-xl font-bold mb-6">For questions about your delivery or tracking, feel free to contact us:</h2>
            <div className="flex flex-col md:flex-row justify-center gap-12 text-lg">
              <div className="flex items-center gap-3"><span className="text-2xl">📞</span> (+353) 851 280 534</div>
              <div className="flex items-center gap-3"><span className="text-2xl">📧</span> info@elmaghrib.com</div>
            </div>
          </Card>
        </Section>
      </main>
    </div>
  );
};

// Reusable Section Component
const Section = ({ title, children }) => {
  return (
    <section className="mb-10">
      <h2 className="flex items-center text-2xl md:text-3xl font-bold mb-6 gap-3 border-b-2 border-gray-700 pb-2">{title}</h2>
      {children}
    </section>
  );
};

export default DeliveryPolicy;
