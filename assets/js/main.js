/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
//     reset: true
});

sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__img, .contact__input',{interval: 200}); 

/*==================== COURSE PAGE NAVIGATION ====================*/
document.addEventListener('DOMContentLoaded', function() {
    const courseNavLinks = document.querySelectorAll('.course__nav-link');
    if (courseNavLinks.length > 0) {  // Only run if we're on a course page
        // Highlight active section while scrolling
        window.addEventListener('scroll', () => {
            let current = '';
            document.querySelectorAll('.course__content[id]').forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            courseNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').slice(1) === current) {
                    link.classList.add('active');
                }
            });
        });

        // Smooth scroll to section when clicking nav links
        courseNavLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
});

/*==================== SHOW SCROLL TOP ====================*/ 
function scrollTop() {
    const scrollTop = document.getElementById('scroll-top');
    // When the scroll is higher than 560 viewport height, add the show-scroll class
    if(this.scrollY >= 560) {
        scrollTop.classList.add('show-scroll');
    } else {
        scrollTop.classList.remove('show-scroll');
    }
}
window.addEventListener('scroll', scrollTop);

/*==================== COURSE MODULES ====================*/
document.addEventListener('DOMContentLoaded', function() {
    const moduleItems = document.querySelectorAll('.module__item');
    
    if (moduleItems.length > 0) {  // Only run if we're on a course page
        moduleItems.forEach(item => {
            const header = item.querySelector('.module__header');
            
            header.addEventListener('click', () => {
                // comment/uncomment to for the feature about collapsing others once one is expanded
                // const currentlyActive = document.querySelector('.module__item.active');
                // if (currentlyActive && currentlyActive !== item) {
                //     currentlyActive.classList.remove('active');
                // }
                //
                item.classList.toggle('active');
            });
        });
    }
});

/*==================== COURSES CAROUSEL ====================*/
document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.getElementById('coursesWrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (wrapper && prevBtn && nextBtn) {
        const scrollAmount = 340; // Width of card + gap

        prevBtn.addEventListener('click', () => {
            wrapper.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            wrapper.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Hide/show navigation buttons based on scroll position
        wrapper.addEventListener('scroll', () => {
            prevBtn.style.opacity = wrapper.scrollLeft > 0 ? '1' : '0.5';
            nextBtn.style.opacity = 
                wrapper.scrollLeft < (wrapper.scrollWidth - wrapper.clientWidth) ? '1' : '0.5';
        });

        // Initial button state
        prevBtn.style.opacity = '0.5';
    }
});
