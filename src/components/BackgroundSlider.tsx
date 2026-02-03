import { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80', // Luxury car
  'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1920&q=80', // Cash money
  'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=1920&q=80', // Yacht lifestyle
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1920&q=80', // Luxury watch
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80', // Mansion/luxury home
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1920&q=80', // Designer shopping
];

export default function BackgroundSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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
          onLoad={() => index === 0 && setIsLoaded(true)}
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
