import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-left">
        <img src="/assets/images/flower.svg" alt="logo" className="footer-logo" />
        <h2 className="footer-title">
          crafting experiences  
          <br />
          with purpose and care <br />
          for the curious mind.
        </h2>
      </div>

      <div className="footer-right">
        <ul className="footer-links">
          <li><a href="https://www.linkedin.com/in/nhi-tran-y/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://www.behance.net/nhi-tran-y" target="_blank" rel="noopener noreferrer">Behance</a></li>
          <li><a href="https://dribbble.com/nhi-tran-y" target="_blank" rel="noopener noreferrer">Dribbble</a></li>
          <li><a href="mailto:tranynhi2015@gmail.com">Email me</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer; 