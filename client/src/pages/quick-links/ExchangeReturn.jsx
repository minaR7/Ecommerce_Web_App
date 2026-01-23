import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const ExchangeReturn = () => {
  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
           Exchange and Return Policy
          </Title>
        </Card>

        {/* Intro */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-l-4 border-[#202836] rounded-md p-4 mb-4 mt-4 text-center">
          <p className="text-gray-700 text-lg">
         If you are not fully satisfied with your purchase, you have 15 days from the date of receipt of your order to request an exchange or return. Any request made after this period will not be accepted.   
          </p>
        </div>

        {/* Content */}
        <Card className="shadow-md rounded-xl p-6 md:p-10">

          <Section
            number="1"
            title="How to request an exchange or return"
            content={<>
               {/* <Paragraph>To begin the process, you must:</Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>Notify us on the day you receive the package by emailing customer service at info@elmaghrib.com.</li>
                  <li>Return the item at your own expense to the address listed below.</li>
                  <li>Ensure the item is unused, unworn, unwashed, undamaged, and placed in its original packaging, including all accessories and tags.</li>
                </ul>
                <Paragraph>
                    <text className="text-bold">Return Address:</text>
                        <text className="text-bold">Return Address:</text>
                        <text className="text-bold">6 Newton Park, Mayfield</text>
                        <text className="text-bold">Cork, T23CF5D</text>
                        <text className="text-bold">Ireland</text>
                </Paragraph> */}
                <Paragraph>To begin the process, you must:</Paragraph>
      <ol className="list-decimal pl-6 mb-4 space-y-2">
        <li>Notify us on the day you receive the package by emailing customer service at <strong>info@elmaghrib.com</strong>.</li>
        <li>Return the item at your own expense to the address listed below.</li>
        <li>Ensure the item is unused, unworn, unwashed, undamaged, and placed in its original packaging, including all accessories and tags.</li>
      </ol>
      <div className="mt-2">
        <Paragraph className="font-semibold mb-1">Return Address:</Paragraph>
        <Paragraph>
          Elmaghrib.com<br/>
          6 Newton Park, Mayfield<br/>
          Cork, T23CF5D<br/>
          Ireland
        </Paragraph>
      </div>
            </>}
          />

           <Section
            number="2"
            title="Conditions for refund"
            list={[
                "A refund will be issued within 15 days after we receive and inspect the returned item.",
                "Refunds are made using the original payment method.",
                "Shipping fees are non-refundable.",
                "If the product shows signs of use, damage, perfume, stains, or missing packaging, the return will be refused."
            ]}
          />

          <Section
            number="3"
            title="Exchanges"
            list={[
              "Exchanges are subject to product availability.",
              "If the requested size or colour is unavailable, a refund will be issued instead.",
            ]}
          />

            <Section
                number="4"
                title="Custom-made items"
                content="Custom-made, tailored, or personalized products cannot be returned, exchanged, or refunded. This includes items altered according to the customer’s specific measurements or requests."
            />

        <Section
            number="4"
            title="Wrong or defective product"
             content={<>
               <Paragraph>If you received a damaged or incorrect item:</Paragraph>
                <ul className="list-disc pl-6 mb-2">
                  <li>Contact us within 24 hours of delivery at info@elmaghrib.com with photos showing the issue.</li>
                  <li>We will review the case and provide a replacement or refund at no additional cost.</li>
                </ul>
            </>}
          />

        <Section
            number="6"
            title="Lost or refused returns"
            list={[
              "Elmaghrib.com is not responsible for returns lost during shipping.",
            "We recommend using a tracked shipping service.",
            "Any return sent without prior confirmation from customer service will not be accepted.",
            ]}
          />


        </Card>

      </div>
    </div>
  );
};

export default ExchangeReturn;

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
