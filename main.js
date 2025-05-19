document.addEventListener("DOMContentLoaded", function () {
	// Existing menu toggle code...
	const toggleBtn = document.querySelector('.menu-toggle');
	const nav = document.querySelector('.nav');
	toggleBtn.addEventListener('click', () => {
	  nav.classList.toggle('active');
	});
  
	// Close menu when nav link clicked
	const navLinks = document.querySelectorAll('.nav-link');
	navLinks.forEach(link => {
	  link.addEventListener('click', () => {
		nav.classList.remove('active');
	  });
	});
  
	// Dark mode toggle
	const darkModeToggle = document.querySelector('.dark-mode-toggle');
  
	// Load saved preference
	if (localStorage.getItem('dark-mode') === 'enabled') {
	  document.body.classList.add('dark');
	}
  
	darkModeToggle.addEventListener('click', () => {
	  document.body.classList.toggle('dark');
	  if (document.body.classList.contains('dark')) {
		localStorage.setItem('dark-mode', 'enabled');
	  } else {
		localStorage.setItem('dark-mode', 'disabled');
	  }
	});
  });
  