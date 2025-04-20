import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';

const HomePage = () => {
  const [images, setImages] = useState([
    '/images/slides/maintenance-workers.jpg',
    '/images/slides/service-image-2.jpg',
    '/images/slides/service-image-3.jpg',
    '/images/slides/service-image-4.jpg',
    '/images/slides/service-image-5.jpg'
  ]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <Layout>
      <section className="relative w-full h-screen max-h-[600px]">
        <div className="w-full h-full relative overflow-hidden">
          {images.map((src, index) => (
            <div 
              key={index} 
              className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={src} 
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-fill"
                onError={(e) => {
                  console.error(`Failed to load image: ${src}`);
                  e.target.src = '/images/placeholder.jpg'; 
                }}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handlePrevClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white p-4 rounded-full hover:bg-opacity-80 focus:outline-none z-20"
          aria-label="Previous slide"
        >
          <span className="text-3xl">&lt;</span>
        </button>
        
        <button 
          onClick={handleNextClick}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white p-4 rounded-full hover:bg-opacity-80 focus:outline-none z-20"
          aria-label="Next slide"
        >
          <span className="text-3xl">&gt;</span>
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {images.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`inline-block h-3 w-3 rounded-full cursor-pointer transition-colors ${
                idx === currentImageIndex ? 'bg-white scale-125' : 'bg-gray-400 hover:bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;