import React from 'react';
import { Carousel, Rate } from 'antd';

const carouselData = [
  {
    imageSrc: '/assets/slide-hero.jpg',
    name: 'Product 1',
    price: '$100',
    value: 4.5
  },
  {
    imageSrc: 'https://via.placeholder.com/800x400',
    name: 'Product 2',
    price: '$150',
    value: 3.2
  },
  {
    imageSrc: '/assets/slide-hero.jpg',
    name: 'Product 3',
    price: '$200',
    value: 5
  },
  {
    imageSrc: '/assets/jabador-white-and-gold-503x800.jpg',
    name: 'Product 3',
    price: '$200',
    value: 3.5
  },
  {
    imageSrc: 'https://via.placeholder.com/800x400',
    name: 'Product 3',
    price: '$200',
    value: 4.2
  }
];

const CustomCarousel = () => {
  return (
    <Carousel autoplay autoplaySpeed={5000}>
      {carouselData.map((item, index) => (
        <div key={index}>
          <div style={{ position: 'relative' }}>
            <img
              src={item.imageSrc}
              alt={item.name}
              style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '1rem',
                borderRadius: '8px',
                color: '#fff',
                maxWidth: '80%'
              }}
            >
              <h2 style={{ fontSize: '2rem', margin: 0 }}>{item.name}</h2>
              <p style={{ margin: '0.5rem 0' }}>{item.price}</p>
              <Rate allowHalf disabled defaultValue={item.value} />
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default CustomCarousel;
