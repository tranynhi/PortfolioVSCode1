import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WorkCard = ({ imageSrc, imageAlt, title, link }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Initial animation
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none reverse"
      }
    });

    // Hover animation setup
    const card = cardRef.current;
    const image = imageRef.current;
    const title = titleRef.current;

    const handleMouseEnter = () => {
      gsap.to(image, {
        scale: 1.05,
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(title, {
        y: -10,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(image, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
      gsap.to(title, {
        y: 0,
        opacity: 0.8,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <article className="work-item" ref={cardRef}>
      <div className="image-wrapper">
        <img 
          ref={imageRef}
          src={imageSrc} 
          alt={imageAlt}
          className="work-image"
        />
        <div className="overlay">
          <a href={link} className="view-project">View Project →</a>
        </div>
      </div>
      <h3 ref={titleRef}>{title}</h3>
    </article>
  );
};

export default WorkCard; 