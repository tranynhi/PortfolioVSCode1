import React from 'react';
import { createRoot } from 'react-dom/client';
import WorkGrid from '../components/WorkGrid';
import Footer from '../components/Footer';
import works from '../data/works';

// Render WorkGrid
const worksContainer = document.getElementById('works-container');
if (worksContainer) {
  const worksRoot = createRoot(worksContainer);
  worksRoot.render(<WorkGrid works={works} title="Selected works" />);
}

// Render Footer
const footerContainer = document.querySelector('footer.site-footer');
if (footerContainer) {
  const footerRoot = createRoot(footerContainer);
  footerRoot.render(<Footer />);
} 