document.addEventListener('DOMContentLoaded', () => {

    // 1. Scrolled Navbar Style
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for scroll animations (fade-up, fade-in)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated if you only want it once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Smooth scrolling for anchor links (safari fallback mostly, css handles it modernly)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for navbar height
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 4. Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNavigation = document.getElementById('primary-navigation');

    if (mobileNavToggle && primaryNavigation) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNavigation.setAttribute('data-visible', !isExpanded);
        });

        // Close mobile menu when a link is clicked
        const navLinks = primaryNavigation.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                primaryNavigation.setAttribute('data-visible', 'false');
            });
        });
    }

    // 5. Accordions
    const accordions = document.querySelectorAll('.accordion-card');
    accordions.forEach(acc => {
        const header = acc.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Optional: Close other accordions
            accordions.forEach(a => {
                if (a !== acc && a.classList.contains('active')) {
                    a.classList.remove('active');
                    a.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            acc.classList.toggle('active');
            const content = acc.querySelector('.accordion-content');
            if (acc.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 5b. Services Accordions (Rettangoli)
    const serviceRectangles = document.querySelectorAll('.service-rectangle');
    serviceRectangles.forEach(rect => {
        const header = rect.querySelector('.rectangle-header');
        if (header) {
            header.addEventListener('click', () => {
                // Optional: Close other service rectangles if we want classical accordion behavior
                serviceRectangles.forEach(r => {
                    if (r !== rect && r.classList.contains('active')) {
                        r.classList.remove('active');
                    }
                });

                rect.classList.toggle('active');
            });
        }
    });


    // 6. Embla Carousel – Scale Tween Effect (Storie di Successo)
    const emblaNode = document.querySelector('.embla__viewport');
    if (emblaNode && typeof EmblaCarousel !== 'undefined') {
        const TWEEN_FACTOR_BASE = 0.4;
        let tweenFactor = 0;
        let tweenNodes = [];

        const autoplayPlugin = typeof EmblaCarouselAutoplay !== 'undefined'
            ? EmblaCarouselAutoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: true })
            : null;

        const plugins = autoplayPlugin ? [autoplayPlugin] : [];

        const emblaApi = EmblaCarousel(emblaNode, {
            loop: true,
            align: 'center',
            slidesToScroll: 1,
            containScroll: false,
        }, plugins);

        // Scale Tween Functions
        function setTweenNodes(emblaApi) {
            tweenNodes = emblaApi.slideNodes().map(function (slideNode) {
                return slideNode.querySelector('.slide-card');
            });
        }

        function setTweenFactor(emblaApi) {
            tweenFactor = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
        }

        function numberWithinRange(number, min, max) {
            return Math.min(Math.max(number, min), max);
        }

        function tweenScale(emblaApi, eventName) {
            var engine = emblaApi.internalEngine();
            var scrollProgress = emblaApi.scrollProgress();
            var slidesInView = emblaApi.slidesInView();
            var isScrollEvent = eventName === 'scroll';

            emblaApi.scrollSnapList().forEach(function (scrollSnap, snapIndex) {
                var diffToTarget = scrollSnap - scrollProgress;
                var slidesInSnap = engine.slideRegistry[snapIndex];

                slidesInSnap.forEach(function (slideIndex) {
                    if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach(function (loopItem) {
                            var target = loopItem.target();
                            if (slideIndex === loopItem.index && target !== 0) {
                                var sign = Math.sign(target);
                                if (sign === -1) {
                                    diffToTarget = scrollSnap - (1 + scrollProgress);
                                }
                                if (sign === 1) {
                                    diffToTarget = scrollSnap + (1 - scrollProgress);
                                }
                            }
                        });
                    }

                    var tweenValue = 1 - Math.abs(diffToTarget * tweenFactor);
                    var clampedTween = numberWithinRange(tweenValue, 0, 1);
                    // Center = scale(1), sides = scale(0.75)
                    var scale = 0.75 + clampedTween * 0.25;
                    // Center = opacity(1), sides = opacity(0.5)
                    var opacity = 0.5 + clampedTween * 0.5;
                    // Center = full brightness, sides = dimmed
                    var brightness = 0.5 + clampedTween * 0.5;

                    var tweenNode = tweenNodes[slideIndex];
                    if (tweenNode) {
                        tweenNode.style.transform = 'scale(' + scale + ')';
                        tweenNode.style.opacity = opacity;
                        tweenNode.style.filter = 'brightness(' + brightness + ')';
                        tweenNode.style.boxShadow = clampedTween > 0.8
                            ? '0 25px 60px rgba(0, 0, 0, 0.3)'
                            : '0 5px 20px rgba(0, 0, 0, 0.1)';
                    }
                    // Z-index: center on top
                    var slideNode = emblaApi.slideNodes()[slideIndex];
                    if (slideNode) {
                        slideNode.style.zIndex = Math.round(clampedTween * 10);
                    }
                });
            });
        }

        // Initialize tweens
        setTweenNodes(emblaApi);
        setTweenFactor(emblaApi);
        tweenScale(emblaApi);

        emblaApi
            .on('reInit', setTweenNodes)
            .on('reInit', setTweenFactor)
            .on('reInit', function () { tweenScale(emblaApi); })
            .on('scroll', function () { tweenScale(emblaApi, 'scroll'); })
            .on('slideFocus', function () { tweenScale(emblaApi); });

        // Navigation Buttons
        var prevBtn = document.querySelector('.embla__button--prev');
        var nextBtn = document.querySelector('.embla__button--next');

        if (prevBtn) prevBtn.addEventListener('click', function () { emblaApi.scrollPrev(); });
        if (nextBtn) nextBtn.addEventListener('click', function () { emblaApi.scrollNext(); });

        // Slide click: center slide opens modal, side slides scroll to them
        var slideNodes = emblaApi.slideNodes();
        slideNodes.forEach(function (slideNode, index) {
            slideNode.addEventListener('click', function () {
                var selectedIndex = emblaApi.selectedScrollSnap();
                if (index === selectedIndex) {
                    // This is the center slide — open the modal
                    var modalBtn = slideNode.querySelector('.open-modal-btn');
                    if (modalBtn) {
                        var modalId = modalBtn.getAttribute('data-modal');
                        var modal = document.getElementById(modalId);
                        if (modal) {
                            modal.classList.add('show');
                            document.body.style.overflow = 'hidden';
                            if (autoplayPlugin) autoplayPlugin.stop();
                        }
                    }
                } else {
                    // This is a side slide — scroll to it
                    emblaApi.scrollTo(index);
                }
            });
        });

        // Store reference for modal close
        window.__emblaAutoplay = autoplayPlugin;
    }

    // Chiusura modale (con il bottone X)
    var closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
                if (window.__emblaAutoplay) window.__emblaAutoplay.play();
            }
        });
    });

    // Chiusura modale cliccando fuori dal contenuto
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
            document.body.style.overflow = '';
            if (window.__emblaAutoplay) window.__emblaAutoplay.play();
        }
    });

    // 7. Back to Top Button
    var backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    // 8. Mobile Pricing Carousel
    const pricingEmblaNode = document.querySelector('.pricing-embla');
    const pricingViewport = document.querySelector('.pricing-embla__viewport');

    if (pricingViewport && typeof EmblaCarousel !== 'undefined') {
        let pricingEmblaApi = null;

        const initPricingEmbla = () => {
            if (window.innerWidth <= 768) {
                if (!pricingEmblaApi) {
                    pricingEmblaApi = EmblaCarousel(pricingViewport, {
                        align: 'center',
                        containScroll: 'trimSnaps'
                    });

                    const prevBtn = pricingEmblaNode.querySelector('.pricing-prev');
                    const nextBtn = pricingEmblaNode.querySelector('.pricing-next');

                    if (prevBtn) {
                        prevBtn.addEventListener('click', () => pricingEmblaApi.scrollPrev(), false);
                    }
                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => pricingEmblaApi.scrollNext(), false);
                    }

                    // Add active class toggling on buttons depending on embla status (optional but nice)
                }
            } else {
                if (pricingEmblaApi) {
                    pricingEmblaApi.destroy();
                    pricingEmblaApi = null;
                }
            }
        };

        // Initialize on load and on resize
        initPricingEmbla();
        window.addEventListener('resize', initPricingEmbla);
    }
});
