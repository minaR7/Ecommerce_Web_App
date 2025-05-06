import React from 'react';
import { Carousel, Card, Rate } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const carouselData = [
  {
    id: '1',
    imageSrc: '/assets/slide-hero.jpg',
    name: 'Product 1',
    price: '$100',
    value: 4.5
  },
  {
    id: '2',
    imageSrc: '/assets/moroccan-jabador.jpg.webp',
    name: 'Product 2',
    price: '$150',
    value: 3.2
  },
  {
    id: '3',
    imageSrc: '/assets/slide-hero.jpg',
    name: 'Product 3',
    price: '$200',
    value: 5
  },
  {
    id: '4',
    imageSrc: '/assets/jabador-white-and-gold-503x800.jpg',
    name: 'Product 4',
    price: '$120',
    value: 3.5
  },
  {
    id: '5',
    imageSrc: '/assets/moroccan-thobes.jpg.webp',
    name: 'Product 5',
    price: '$90',
    value: 4.2
  },
  {
    id: '6',
    imageSrc: 'https://via.placeholder.com/800x400',
    name: 'Product 6',
    price: '$180',
    value: 4.0
  }
];

const createSlidingWindows = (data, windowSize) => {
  const windows = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    windows.push(data.slice(i, i + windowSize));
  }
  return windows;
};

const CustomCarousel = () => {
  const navigate = useNavigate();
  const windowSize = 4;
  const slides = createSlidingWindows(carouselData, windowSize);

  return (
   <>
    <div className="flex flex-col justify-center items-center text-center px-4"  style={{paddingTop: "2rem", color: "#111226"}}>
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Best Sellers
        </h1>
        <p className="text-lg md:text-2xl font-bold">
            High Quality Moroccan Fashion
        </p>
    </div>
    <Carousel autoplay autoplaySpeed={5000} style={{padding: "0rem 4rem 1rem 4rem"}}>
      {slides.map((group, index) => (
        <div key={index}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              padding: '2rem',
            }}
          >
            {group.map((item) => (
              <Card
                key={item.id}
                hoverable
                style={{
                  width: '23%',
                  minWidth: '200px',
                  flexGrow: 1,
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  boxShadow: '2px 3px 4px lightgray',
                }}
                cover={
                  <img
                    alt={item.name}
                    src={item.imageSrc}
                    style={{ height: '300px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${item.id}`)}
                  />
                }
              >
                <Meta title={item.name} description={item.price} />
                <div style={{ marginTop: '0.5rem' }}>
                  <Rate allowHalf disabled defaultValue={item.value} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Carousel>
   </>
  );
};

export default CustomCarousel;
