import React from "react";
import { Card, Typography, Spin } from "antd";
import { usePageContent } from "../../hooks/usePageContent";

const { Title } = Typography;

const ExchangeReturn = () => {
  const { page, loading } = usePageContent('exchange-return');

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  }

  return (
    <div className="min-h-screen w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <Card className="text-center shadow-md rounded-xl mb-8">
          <Title level={1} className="!text-4xl md:!text-5xl font-bold text-gray-900 mb-0">
           {page?.title || 'Exchange and Return Policy'}
          </Title>
        </Card>

        {page ? (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="text-center">Content not available</div>
        )}
      </div>
    </div>
  );
};

export default ExchangeReturn;
