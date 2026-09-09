        (function() {
            const navLinks = document.querySelectorAll('.nav-menu a');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href').split('/').pop();
                if (linkHref === currentPage) {
                    link.classList.add('active');
                } else if (currentPage !== 'index.html') {
                    link.classList.remove('active');
                }
            });

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        })();