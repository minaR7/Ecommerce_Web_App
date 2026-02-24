import React from "react";
import { Spin } from "antd";
import { usePageContent } from "../../hooks/usePageContent";

const DeliveryPolicy = () => {
  const { page, loading } = usePageContent('delivery-time');

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  }

  return (
    <div className="min-h-screen w-full">
      <header className="text-center py-20 text-white" style={{background: 'linear-gradient(180deg,rgba(52, 63, 77, 1) 0%, rgba(32, 40, 54, 1) 45%, rgba(14, 15, 17, 1) 100%)' }} >
        <h1 className="text-5xl font-bold mb-2">{page?.title || 'Delivery Policy'}</h1>
        <p className="text-lg opacity-90">Fast, Reliable Shipping Across Europe & Beyond</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {page ? (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="text-center">Content not available</div>
        )}
      </main>
    </div>
  );
};

export default DeliveryPolicy;
