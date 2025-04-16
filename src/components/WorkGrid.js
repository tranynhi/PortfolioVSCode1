import React from 'react';
import WorkCard from './WorkCard';

const WorkGrid = ({ works, title }) => {
  return (
    <section id="works" className="my-works" aria-labelledby="works-title">
      <h2 id="works-title">{title}</h2>
      <div className="works-grid">
        {works.map((work, index) => (
          <WorkCard
            key={index}
            imageSrc={work.imageSrc}
            imageAlt={work.imageAlt}
            title={work.title}
            link={work.link}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkGrid; 