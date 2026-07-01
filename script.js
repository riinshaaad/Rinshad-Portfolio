/* ===================================================================
   Mohammed Rinshad P — Data Analyst Portfolio
   Scroll-jacking, Animations & Interactivity
   =================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------
  const sections = document.querySelectorAll('.section');
  const navDots = document.querySelectorAll('.nav-dot');
  const progressFill = document.getElementById('progressTopFill');
  const typingEl = document.getElementById('typingText');
  const counters = document.querySelectorAll('.counter');

  const ctaButtons = document.querySelectorAll('[data-nav]');

  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  let currentIndex = 0;
  let isTransitioning = false;
  let isExperiencePopupOpen = false;
  let isExperience2PopupOpen = false;
  const totalSections = sections.length;
  const TRANSITION_DURATION = 700; // ms — slightly longer than CSS for safety

  // Track which sections have been animated
  const animatedSections = new Set();

  // ---------------------------------------------------------------
  // Section Navigation
  // ---------------------------------------------------------------
  function toggleExperiencePopup(show) {
    if (isTransitioning) return;
    const popup = document.getElementById('experiencePopup');
    if (!popup) return;
    
    isTransitioning = true;
    isExperiencePopupOpen = show;
    
    if (show) {
      popup.classList.add('experience-popup--active');
      const headingSpan = document.getElementById('skillsHeadingSpan');
      if (headingSpan) headingSpan.textContent = 'Experience';
    } else {
      popup.classList.remove('experience-popup--active');
      const headingSpan = document.getElementById('skillsHeadingSpan');
      if (headingSpan) headingSpan.textContent = 'Education';
    }
    
    setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_DURATION);
  }

  function toggleExperience2Popup(show) {
    if (isTransitioning) return;
    const popup = document.getElementById('experience2Popup');
    if (!popup) return;
    
    isTransitioning = true;
    isExperience2PopupOpen = show;
    
    if (show) {
      popup.classList.add('experience-popup--active');
      const prefixSpan = document.getElementById('skillsPrefixSpan');
      if (prefixSpan) prefixSpan.textContent = 'Projects';
    } else {
      popup.classList.remove('experience-popup--active');
      const prefixSpan = document.getElementById('skillsPrefixSpan');
      if (prefixSpan) prefixSpan.textContent = 'Skills';
    }
    
    setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_DURATION);
  }



  function goToSection(targetIndex, skipAnimation = false) {
    if (isTransitioning) return;
    if (targetIndex < 0 || targetIndex >= totalSections) return;
    if (targetIndex === currentIndex) return;

    if (isExperiencePopupOpen) {
      toggleExperiencePopup(false);
    }
    if (isExperience2PopupOpen) {
      toggleExperience2Popup(false);
    }

    isTransitioning = true;

    const currentSection = sections[currentIndex];
    const targetSection = sections[targetIndex];
    const direction = targetIndex > currentIndex ? 'forward' : 'backward';

    // Remove previous state classes from all sections
    sections.forEach((s, i) => {
      if (i !== currentIndex && i !== targetIndex) {
        s.classList.remove('section--active', 'section--left', 'section--right');
        // Position sections correctly
        if (i < targetIndex) {
          s.classList.add('section--left');
        } else {
          s.classList.add('section--right');
        }
      }
    });

    if (direction === 'forward') {
      // Prepare target to come from right
      targetSection.classList.remove('section--left', 'section--right');
      // Force a reflow so the browser registers the starting position
      void targetSection.offsetWidth;
      targetSection.classList.add('section--right');
      void targetSection.offsetWidth;

      // Animate
      currentSection.classList.remove('section--active');
      currentSection.classList.add('section--left');
      targetSection.classList.remove('section--right');
      targetSection.classList.add('section--active');
    } else {
      // Prepare target to come from left
      targetSection.classList.remove('section--left', 'section--right');
      void targetSection.offsetWidth;
      targetSection.classList.add('section--left');
      void targetSection.offsetWidth;

      // Animate
      currentSection.classList.remove('section--active');
      currentSection.classList.add('section--right');
      targetSection.classList.remove('section--left');
      targetSection.classList.add('section--active');
    }

    // Update state
    const prevIndex = currentIndex;
    currentIndex = targetIndex;

    // Update navigation dots
    updateNavDots();

    // Update progress bar
    updateProgress();

    // Trigger section-specific animations
    triggerSectionAnimations(targetIndex);

    // Re-enable transitions after animation completes
    setTimeout(() => {
      isTransitioning = false;
      // Clean up: position all non-active sections correctly
      sections.forEach((s, i) => {
        if (i !== currentIndex) {
          s.classList.remove('section--active');
          if (i < currentIndex) {
            s.classList.remove('section--right');
            s.classList.add('section--left');
          } else {
            s.classList.remove('section--left');
            s.classList.add('section--right');
          }
        }
      });
    }, TRANSITION_DURATION);
  }

  function updateNavDots() {
    navDots.forEach((dot, i) => {
      dot.classList.toggle('nav-dot--active', i === currentIndex);
    });
  }

  function updateProgress() {
    const percent = (currentIndex / (totalSections - 1)) * 100;
    progressFill.style.width = percent + '%';
  }

  // ---------------------------------------------------------------
  // Section-Specific Animations
  // ---------------------------------------------------------------
  function triggerSectionAnimations(index) {
    if (animatedSections.has(index)) return;
    animatedSections.add(index);

    const section = sections[index];

    // About section — counter animation
    if (section.id === 'about') {
      setTimeout(() => animateCounters(), 400);
      setTimeout(() => animateAboutText(), 600);
    }
  }

  // ---------------------------------------------------------------
  // Counter Animation
  // ---------------------------------------------------------------
  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 2000; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ---------------------------------------------------------------
  // About Text Typing Animation
  // ---------------------------------------------------------------
  let aboutOriginalText = '';
  const aboutTextEl = document.querySelector('.about__text');

  function prepareAboutText() {
    if (window.innerWidth <= 900) return;
    if (!aboutTextEl) return;
    aboutOriginalText = aboutTextEl.textContent.replace(/\s+/g, ' ').trim();
    aboutTextEl.textContent = '';
  }

  function animateAboutText() {
    if (!aboutTextEl || !aboutOriginalText) return;
    let i = 0;
    const speed = 4; 
    aboutTextEl.classList.add('typing');
    
    function typeChar() {
      if (i < aboutOriginalText.length) {
        aboutTextEl.textContent += aboutOriginalText.charAt(i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        aboutTextEl.classList.remove('typing');
        aboutTextEl.classList.add('typing-finished');
      }
    }
    typeChar();
  }



  // ---------------------------------------------------------------
  // Typing Effect
  // ---------------------------------------------------------------
  function startTypingEffect() {
    if (!typingEl) return;
    const phrases = [
      'Turning raw data into actionable insights.',
      'Building KPI-driven dashboards with Power BI.',
      'Delivering intelligent reports & automated workflows.',
      'Driving operational efficiency through data.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 45;
    const deleteSpeed = 25;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 400;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        // Typing forward
        typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          // Pause then start deleting
          setTimeout(() => {
            isDeleting = true;
            type();
          }, pauseAfterType);
          return;
        }
        setTimeout(type, typeSpeed);
      } else {
        // Deleting
        typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, pauseAfterDelete);
          return;
        }
        setTimeout(type, deleteSpeed);
      }
    }

    // Start after a brief delay
    setTimeout(type, 800);
  }

  // ---------------------------------------------------------------
  // Wheel Event (Scroll-Jacking)
  // ---------------------------------------------------------------
  let wheelAccumulator = 0;
  const WHEEL_THRESHOLD = 50;
  let wheelTimeout = null;

  // Helper to check if an element can natively scroll without hitting boundaries
  function isScrollableAndNotAtBoundary(target, direction) {
    const scrollContainer = target.closest('.section__inner, .experience-popup__content, .tech-popup, .chatbot-messages');
    if (!scrollContainer) return false;

    const style = window.getComputedStyle(scrollContainer);
    if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return false;

    if (direction > 0) { // scrolling down (content moves up)
      return scrollContainer.scrollTop + scrollContainer.clientHeight < scrollContainer.scrollHeight - 2;
    } else { // scrolling up (content moves down)
      return scrollContainer.scrollTop > 2;
    }
  }

  function handleWheel(e) {
    if (window.innerWidth <= 900) return;
    if (isTransitioning) return;

    if (isScrollableAndNotAtBoundary(e.target, e.deltaY)) {
      return; // allow native scroll
    }

    e.preventDefault();

    wheelAccumulator += e.deltaY;

    // Clear accumulator after inactivity
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      wheelAccumulator = 0;
    }, 200);

    if (Math.abs(wheelAccumulator) >= WHEEL_THRESHOLD) {
      if (wheelAccumulator > 0) {
        if (currentIndex === 2 && !isExperiencePopupOpen) {
          toggleExperiencePopup(true);
        } else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) {
          toggleExperience2Popup(true);
        } else {
          goToSection(currentIndex + 1);
        }
      } else {
        if (currentIndex === 2 && isExperience2PopupOpen) {
          toggleExperience2Popup(false);
        } else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) {
          toggleExperiencePopup(false);
        } else {
          goToSection(currentIndex - 1);
        }
      }
      wheelAccumulator = 0;
    }
  }

  // ---------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------
  function handleKeydown(e) {
    if (window.innerWidth <= 900) return;
    if (isTransitioning) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        if (currentIndex === 2 && !isExperiencePopupOpen) {
          toggleExperiencePopup(true);
        } else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) {
          toggleExperience2Popup(true);
        } else {
          goToSection(currentIndex + 1);
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        if (currentIndex === 2 && isExperience2PopupOpen) {
          toggleExperience2Popup(false);
        } else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) {
          toggleExperiencePopup(false);
        } else {
          goToSection(currentIndex - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        goToSection(0);
        break;
      case 'End':
        e.preventDefault();
        goToSection(totalSections - 1);
        break;
    }
  }

  // ---------------------------------------------------------------
  // Touch / Swipe Support
  // ---------------------------------------------------------------
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 60;

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  function handleTouchEnd(e) {
    if (window.innerWidth <= 900) return;
    if (isTransitioning) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Use whichever axis had more movement
    if (Math.abs(diffY) > Math.abs(diffX)) {
      // Vertical swipe
      if (Math.abs(diffY) > SWIPE_THRESHOLD) {
        // Prevent sliding to next section if the user is scrolling text natively
        if (isScrollableAndNotAtBoundary(e.target, diffY)) {
          return;
        }

        if (diffY > 0) {
          if (currentIndex === 2 && !isExperiencePopupOpen) toggleExperiencePopup(true);
          else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) toggleExperience2Popup(true);
          else goToSection(currentIndex + 1); // Swipe up → next
        } else {
          if (currentIndex === 2 && isExperience2PopupOpen) toggleExperience2Popup(false);
          else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) toggleExperiencePopup(false);
          else goToSection(currentIndex - 1); // Swipe down → prev
        }
      }
    } else {
      // Horizontal swipe
      if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX > 0) {
          if (currentIndex === 2 && !isExperiencePopupOpen) toggleExperiencePopup(true);
          else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) toggleExperience2Popup(true);
          else goToSection(currentIndex + 1); // Swipe left → next
        } else {
          if (currentIndex === 2 && isExperience2PopupOpen) toggleExperience2Popup(false);
          else if (currentIndex === 2 && isExperiencePopupOpen && !isExperience2PopupOpen) toggleExperiencePopup(false);
          else goToSection(currentIndex - 1); // Swipe right → prev
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Nav Dot Click Handlers
  // ---------------------------------------------------------------
  function initNavDots() {
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-index'), 10);
        goToSection(target);
      });
    });
  }

  // ---------------------------------------------------------------
  // CTA Button Navigation
  // ---------------------------------------------------------------
  function initCTAButtons() {
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = parseInt(btn.getAttribute('data-nav'), 10);
        goToSection(target);
      });
    });
  }

  // ---------------------------------------------------------------
  // Contact Form
  // ---------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      if (!name || !message) return;

      // Build WhatsApp message
      const phone = '918590438183';
      const text = `Hi Rinshad, I'm ${name}.\n\n${message}`;
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

      const btn = form.querySelector('.btn--whatsapp');
      const originalHTML = btn.innerHTML;

      // Animate button
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Opening WhatsApp...
      `;
      btn.style.pointerEvents = 'none';

      // Open WhatsApp
      window.open(waUrl, '_blank');

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.pointerEvents = '';
        form.reset();
      }, 2500);
    });
  }

  // ---------------------------------------------------------------
  // Name "i" Effect
  // ---------------------------------------------------------------
  function initNameEffect() {
    const nameEl = document.querySelector('.profile__name');
    if (!nameEl) return;
    
    const text = nameEl.textContent.trim();
    nameEl.innerHTML = '';
    
    const words = text.split(' ');
    
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      word.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.style.display = 'inline-block';
        
        if (char === 'i') {
          charSpan.classList.add('jiggle-i');
          charSpan.innerHTML = '<span class="i-dot"></span><span class="i-body">ı</span>';
        } else {
          charSpan.textContent = char;
        }
        
        wordSpan.appendChild(charSpan);
      });
      
      nameEl.appendChild(wordSpan);
      
      if (wordIndex < words.length - 1) {
        nameEl.appendChild(document.createTextNode(' '));
      }
    });
  }


  // ---------------------------------------------------------------
  // Chatbot Logic
  // ---------------------------------------------------------------
  function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    if (!chatbotToggle || !chatbotWindow) return;

    let isChatOpen = false;

    chatbotToggle.addEventListener('click', () => {
      isChatOpen = !isChatOpen;
      if (isChatOpen) {
        chatbotWindow.classList.add('active');
        chatbotInput.focus();
        if (chatbotMessages.children.length === 1) {
            // Add quick replies on first open
            addQuickReplies();
        }
      } else {
        chatbotWindow.classList.remove('active');
      }
    });

    chatbotClose.addEventListener('click', () => {
      isChatOpen = false;
      chatbotWindow.classList.remove('active');
    });

    // ---------------------------------------------------------------
    // AI Chatbot Logic (Powered by Google Gemini)
    // ---------------------------------------------------------------
    // IMPORTANT: Replace the string below with your free Google Gemini API key.
    // Get one at: https://aistudio.google.com/app/apikey
    const GEMINI_API_KEY = 'AIzaSyCtGaTuCFloJn8egtA6-xRK6wWEdKGaCJs'; 

    let chatHistory = [];

    const systemInstruction = `You are Rinshad's AI assistant for his portfolio website.
You are helpful, professional, and knowledgeable about Data Analytics, Business Analysis, and MIS (Management Information Systems).

About Rinshad: He is a versatile analyst who can work as a Data Analyst, Business Analyst, or MIS Analyst. He is passionate about turning complex data into clear, strategic decisions. He specializes in building robust datasets, predictive models, interactive dashboards, business process optimization, and management reporting systems.

Roles he can fulfill:
- **Data Analyst**: Building datasets, predictive models, statistical analysis, data visualization, and interactive dashboards.
- **Business Analyst**: Requirements gathering, process mapping, stakeholder communication, gap analysis, business process improvement, and translating business needs into data-driven solutions.
- **MIS Analyst**: Designing and maintaining management information systems, automated reporting pipelines, KPI tracking frameworks, operational dashboards, and ensuring data integrity across systems.

Education: He holds a Bachelor of Commerce (B.Com) in Finance from the University of Calicut. Mention this ONLY if asked about education, studies, or finance.
Tools he knows: Power BI, Tableau, SQL, Python (Pandas, NumPy, Matplotlib), MS Excel (Pivot, Power Query), and ERP/MIS reporting tools.
Work experience: Built ML models, HR intelligence platforms, customer retention dashboards, survey analysis, automated MIS reports, and business process workflows.
Contact: riinshaaadp@gmail.com or +91 8590438183, located in Kerala, India.

When visitors ask why they should hire a data analyst or business analyst:
Start your response with: "Hiring an Analyst like Rinshad..."
Explain how the role drives business growth.
Do not mention his specific projects first. Explain the general benefits first.
End by listing his contact details (riinshaaadp@gmail.com, +91 8590438183).

If a user asks what roles Rinshad can do, mention all three: Data Analyst, Business Analyst, and MIS Analyst, with a one-line summary of each.

Keep ALL responses extremely short, concise, and direct (maximum 2-3 sentences or a few short bullet points). Visitors do not want to read long paragraphs or too much text. Do not use markdown headers, just plain text or simple bullet points.`;

    function addMessage(text, sender) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${sender}`;
      
      // Basic formatting for bot responses (newlines to br, bold text)
      let formattedText = text;
      if (sender === 'bot') {
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
      }
      
      msgDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
      chatbotMessages.appendChild(msgDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      
      // Remove quick replies if user sends a message
      if (sender === 'user') {
          const quickReplies = chatbotMessages.querySelector('.quick-replies');
          if (quickReplies) quickReplies.remove();
      }
    }

    function addQuickReplies() {
      const replies = ['About Rinshad', 'Tools & Skills', 'Roles I Can Do', 'Contact Info'];
      const container = document.createElement('div');
      container.className = 'quick-replies chat-message bot';
      
      replies.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.textContent = text;
        btn.onclick = () => {
          chatbotInput.value = text;
          handleSend();
        };
        container.appendChild(btn);
      });
      
      chatbotMessages.appendChild(container);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showTyping() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-message bot typing-indicator-container';
      typingDiv.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      chatbotMessages.appendChild(typingDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      return typingDiv;
    }

    async function getGeminiResponse(userText) {
      if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        return "I'm currently running in offline mode. To enable my AI brain, please add your Gemini API key to the script.js file!";
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      // Format history for Gemini API
      const contents = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add the new user message
      contents.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: contents
          })
        });

        if (!response.ok) {
           console.error("API Error:", await response.text());
           return "I'm having trouble connecting to my AI brain right now. Please try again later.";
        }

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        
        // Update history
        chatHistory.push({ sender: 'user', text: userText });
        chatHistory.push({ sender: 'model', text: botReply });
        
        return botReply;

      } catch (error) {
        console.error("Fetch Error:", error);
        return "Oops, something went wrong while thinking. Please check the console or try again.";
      }
    }

    async function handleSend() {
      const text = chatbotInput.value.trim();
      if (!text) return;
      
      addMessage(text, 'user');
      chatbotInput.value = '';
      
      const typingIndicator = showTyping();
      
      const botResponse = await getGeminiResponse(text);
      
      typingIndicator.remove();
      addMessage(botResponse, 'bot');
      setTimeout(addQuickReplies, 500);
    }

    chatbotSend.addEventListener('click', handleSend);
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // ---------------------------------------------------------------
  // Project Card Navigation (Popup → Projects Section with Highlight)
  // ---------------------------------------------------------------
  function initProjectLinks() {
    const popupCards = document.querySelectorAll('[data-project-target]');

    popupCards.forEach(card => {
      card.style.cursor = 'pointer';

      card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-project-target');
        if (!targetId) return;

        // Silently reset popup state (no animation) so they don't fly around
        const popup1 = document.getElementById('experiencePopup');
        const popup2 = document.getElementById('experience2Popup');
        if (popup2) popup2.classList.remove('experience-popup--active');
        if (popup1) popup1.classList.remove('experience-popup--active');
        isExperience2PopupOpen = false;
        isExperiencePopupOpen = false;
        isTransitioning = false;

        // Restore heading text
        const headingSpan = document.getElementById('skillsHeadingSpan');
        if (headingSpan) headingSpan.textContent = 'Education';
        const prefixSpan = document.getElementById('skillsPrefixSpan');
        if (prefixSpan) prefixSpan.textContent = 'Skills';

        // Navigate to Projects section (index 3)
        goToSection(3);

        // After section transition, highlight the target project card
        setTimeout(() => {
          const targetCard = document.getElementById(targetId);
          if (!targetCard) return;

          // Remove any existing highlights
          document.querySelectorAll('.project-card--highlighted').forEach(c => {
            c.classList.remove('project-card--highlighted');
          });

          // Add highlight class
          targetCard.classList.add('project-card--highlighted');

          // Remove highlight after animation completes
          setTimeout(() => {
            targetCard.classList.remove('project-card--highlighted');
            }, 5700);
        }, TRANSITION_DURATION + 100);
      });
    });
  }

  // ---------------------------------------------------------------
  // Initialize
  // ---------------------------------------------------------------
  function init() {
    
    // Set initial section positions
    sections.forEach((section, i) => {
      if (i !== 0) {
        section.classList.add('section--right');
      }
    });

    // Trigger initial animation
    setTimeout(() => {
      sections[0].classList.add('section--active');
    }, 100);

    // On mobile, trigger about section counters immediately since scroll-jacking is disabled
    if (window.innerWidth <= 900) {
      setTimeout(() => animateCounters(), 500);
      setupMobileLayout();
    }

    // Mark hero as animated (it's visible on load)
    animatedSections.add(0);

    // Update initial state
    updateNavDots();
    updateProgress();

    // Start typing effect
    startTypingEffect();

    // Event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Init components
    initNavDots();
    initCTAButtons();
    initContactForm();
    initNameEffect();
    prepareAboutText();
    initChatbot();
    initSkillMarquee();
    initProjectLinks();
  }

  // ---------------------------------------------------------------
  // Skill Marquee — duplicate items for seamless loop
  // ---------------------------------------------------------------
  function initSkillMarquee() {
    const marquee = document.getElementById('skillMarquee');
    if (!marquee) return;
    const items = marquee.querySelectorAll('.skill-icon-card');
    // Clone all items and append for infinite loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      marquee.appendChild(clone);
    });

    // Fluid spotlight — track mouse on each card
    marquee.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.skill-icon-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });

    // Drag-to-scroll
    const wrapper = marquee.closest('.skill-marquee-wrapper');
    if (!wrapper) return;

    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
      scrollStart = wrapper.scrollLeft;
      wrapper.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.pageX - startX;
      wrapper.scrollLeft = scrollStart - dx;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        wrapper.classList.remove('is-dragging');
      }
    });

    // Touch support
    wrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      scrollStart = wrapper.scrollLeft;
      wrapper.classList.add('is-dragging');
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].pageX - startX;
      wrapper.scrollLeft = scrollStart - dx;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
      isDragging = false;
      wrapper.classList.remove('is-dragging');
    });
  }

  // ---------------------------------------------------------------
  // Mobile Layout Adjustments
  // ---------------------------------------------------------------
  function setupMobileLayout() {
    const bentoGlass = document.querySelector('.bento-card--glass');
    const bentoSolid = document.querySelector('.bento-card--solid');
    if (!bentoGlass || !bentoSolid) return;

    // Move Education cards to the Technical Proficiency card
    const eduMiniCards = bentoSolid.querySelectorAll('.edu-mini-card');
    if (eduMiniCards.length > 0) {
      const eduWrapper = document.createElement('div');
      eduWrapper.style.marginTop = '24px';
      eduMiniCards.forEach(card => eduWrapper.appendChild(card));
      bentoGlass.appendChild(eduWrapper);
    }
    
    // Update label of first card
    const glassLabel = bentoGlass.querySelector('.bento-card__label');
    if (glassLabel && glassLabel.textContent.includes('Technical Proficiency')) {
      glassLabel.textContent = 'Technical Proficiency & Education';
    }
    
    // Remove Projects popup as requested
    const projPopup = document.getElementById('experience2Popup');
    if (projPopup) projPopup.remove();

    // Now bentoSolid is Experience only
    const solidLabel = bentoSolid.querySelector('.bento-card__label');
    if (solidLabel) {
      solidLabel.textContent = 'Experience';
    }
    
    // Clean up Experience popup styling
    const expPopup = document.getElementById('experiencePopup');
    if (expPopup) {
      expPopup.style.marginTop = '0';
      expPopup.style.paddingTop = '10px';
      expPopup.style.borderTop = 'none';
      const title = expPopup.querySelector('.experience-popup__title');
      if (title) title.style.display = 'none'; 
    }
  }

  // ---------------------------------------------------------------
  // Tech Proficiency Popup Logic
  // ---------------------------------------------------------------
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
