import { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1920&q=80', // Cadillac Escalade luxury SUV
  'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=1920&q=80', // Luxury Cadillac sedan front view
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1920&q=80', // Black luxury Cadillac
  'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1920&q=80', // Luxury car interior leather seats
  'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=1920&q=80', // Person holding cash money
  'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=1920&q=80', // White Cadillac luxury vehicle
  'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1920&q=80', // Cash dollars bills
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1920&q=80', // Modern luxury car showroom
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1920&q=80', // Happy person with money
];

export default function BackgroundSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Preload next image
    const nextIndex = (currentIndex + 1) % backgroundImages.length;
    const img = new Image();
    img.src = backgroundImages[nextIndex];
  }, [currentIndex]);

  return (
    <>
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        >
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Gradient overlay for luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30" />
        </div>
      ))}
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}
