/**
 * LogoCarousel Component
 * 
 * Displays a horizontally scrolling carousel of company logos.
 * Used to show "As seen on" or partner logos on the landing page.
 * 
 * @example
 * <LogoCarousel 
 *   logos={[
 *     { name: 'TechCrunch', src: '/logos/techcrunch.svg' },
 *     { name: 'Forbes', src: '/logos/forbes.svg' }
 *   ]}
 *   title="As seen on"
 * />
 */

import './LogoCarousel.css';

interface Logo {
  name: string;
  src: string;
}

interface LogoCarouselProps {
  logos: Logo[];
  title?: string;
}

export const LogoCarousel: React.FC<LogoCarouselProps> = ({ 
  logos, 
  title = 'As seen on' 
}) => {
  return (
    <div className="logo-carousel">
      {title && <p className="logo-carousel-title">{title}</p>}
      <div className="logo-carousel-track">
        {/* Duplicate for seamless loop */}
        {[...logos, ...logos].map((logo, index) => (
          <div key={`${logo.name}-${index}`} className="logo-item">
            <img 
              src={logo.src} 
              alt={logo.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
