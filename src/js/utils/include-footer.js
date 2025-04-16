document.addEventListener('DOMContentLoaded', function() {
  // Create a new XMLHttpRequest object
  const xhr = new XMLHttpRequest();
  
  // Configure it to get the footer content
  xhr.open('GET', '../components/footer.html', true);
  
  // Set up the callback function
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // Get the footer element
      const footerElement = document.querySelector('footer.site-footer');
      
      // If footer element exists, replace its content
      if (footerElement) {
        footerElement.outerHTML = xhr.responseText;
      } else {
        // If footer element doesn't exist, create it at the end of the body
        const body = document.body;
        body.insertAdjacentHTML('beforeend', xhr.responseText);
      }
    }
  };
  
  // Send the request
  xhr.send();
}); 