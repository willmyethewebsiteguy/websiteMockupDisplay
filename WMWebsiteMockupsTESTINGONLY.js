/*==========
  Version 0.1
  Squarespace Website Mockups
  Copyright Will Myers 
========== */
(function () {
  const pS = {
    id:'website-mockup',
    cssUrl: 'https://assets.codepen.io/3198845/WMWebsiteMockupsTESTINGONLY.css',
  }
  
  let WebsiteMockupFunctions = (function(){
    // Functional Default Settings
    let defaults = {
      
    };

    let global = window.wmWebsiteMockupSettings || {};

    /** 
     * Emit a custom event
     * @param  {String} type   The event type
     * @param  {Object} detail Any details to pass along with the event
     * @param  {Node}   elem   The element to attach the event to
     */
    function emitEvent(type, detail = {}, elem = document) {
      // Make sure there's an event type
      if (!type) return;

      // Create a new event
      let event = new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        detail: detail,
      });

      // Dispatch the event
      return elem.dispatchEvent(event);
    }
    
    /**
     * Debounce functions for better performance
     * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {Function} fn The function to debounce
     */
    function debounce(fn) {
      // Setup a timer
      let timeout;

      // Return a function to run debounced
      return function () {
        // Setup the arguments
        let context = this;
        let args = arguments;

        // If there's a timer, cancel it
        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }

        // Setup the new requestAnimationFrame()
        timeout = window.requestAnimationFrame(function () {
          fn.apply(context, args);
        });
      };
    }   
    
    /**
     * Create Resize Event Listener
     * @param  {Constructor} instance The current instantiation
     **/
    function createResizeListener(instance) {
      function handleEvent() {
        debounce(setContainerHeight(instance));
      }

      window.addEventListener("resize", handleEvent);
    }

    /**
     * Create Page Load Event Listener
     * @param  {Constructor} instance The current instantiation
     **/
    function createLoadListener(instance) {
      function handleEvent() {
        setContainerHeight(instance);
      }

      window.addEventListener("load", handleEvent);
      window.addEventListener("DOMContentLoaded", handleEvent);
    }
    
    /**
     * Get Local Settings
     * @param  {instance} The settings for this instance
     */
    function getLocalSettings(el) {
      let localSettings = {};

      return localSettings;
    }

    function setContainerHeight(instance) {
      // console.log('hi', instance.elements.container)

      let container = instance.elements.container,
          containerHeight = container.getBoundingClientRect().height;

      container.style.setProperty('--height', `${containerHeight}px`)
    }

    /**
     * CheckScroll
     * @param {String} instance
     */
    function createScrollListener(instance) {
      let touchElement = instance.elements.touchContainer,
          container = instance.elements.overflowWrapper;

      function hasScrolled(el) {
        return el.scrollTop > 10 ? true : false;
      }

      function handleEvent() {
        console.log('scrolling');
        if (hasScrolled(container)) {
          touchElement.classList.add('scrolled')
        } else {
          touchElement.classList.remove('scrolled')
        }
      }

      container.addEventListener("scroll", handleEvent);
      window.addEventListener("DOMContentLoaded", handleEvent);
    }

    /**
     * The constructor object
     * @param {String} selector The selector for the element to render into
     * @param {Object} options  User options and settings
     */
    function Constructor(el, options = {}) {
      
      //Add CSS Function
      this.addCSS();
      let local = getLocalSettings(el);

      this.settings = Object.assign({}, defaults, global, local, options);
      
      // Add Elements Obj
      this.elements = {
        container: el,
        get arrow() {
          return this.container.querySelector(".touch-arrow");
        },
        get touchContainer() {
          return this.container.querySelector(".touch-container");
        },
        get background() {
          return this.container.querySelector(".touch-background");
        },
        get overflowWrapper() {
          return this.container.querySelector(".overflow-wrapper");
        }
      };

      // Add Loading Event Listener
      createLoadListener(this);

      // Add Resize Event Listener
      createResizeListener(this);
      
      // Add Scroll Listener
      createScrollListener(this);
      
      this.elements.container.classList.add('loaded')
    }

    /**
     * Add CSS
     */
    Constructor.prototype.addCSS = function () {
      let cssFile = document.querySelector(`#${pS.id}`);
      function addCSSFile() {
        let head = document.getElementsByTagName("head")[0],
            link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = `${pS.id}-css`;
        link.type = "text/css";
        link.href = pS.cssUrl;
        link.onload = function () {
          loaded();
        };
        
        head.prepend(link);
      }

      function loaded() {
        const event = new Event(`${pS.id}:css-loaded`);
        window.dispatchEvent(event);
        document.querySelector("body").classList.add(`${pS.id}-css-loaded`);
      }

      if (!cssFile) {
        addCSSFile();
      } else {
        document.head.prepend(cssFile);
        loaded();
      }
    };

    return Constructor;

  }());

  let BuildWebsiteMockupHTML = (function () {
    // Default Structural Settings
    let defaults = {

    };

    let global = window.wmWebsiteMockupSettings || {};

    /**
     * Inject the button into the DOM
     * @param  {Constructor} intance The settings for this instance
     */
    function injectTemplate(instance) {
      
      function buildContainer() {
        let html = `<div class="overflow-wrapper">
  <img src="${instance.elements.imageURL}" />
</div>`

        if(instance.elements.link) {
          html = `<a href="${instance.elements.link.href}" class="overflow-wrapper">
  <img src="${instance.elements.imageURL}" />
</a>`
        }
        
        return html;
      }
      
      
      let template = `
<div class="wm-website-mockup">
  ${buildContainer()}
  <div class="touch-container">
    <div class="touch-background"></div>
    <div class="touch-arrows"></div>
  </div>
</div>
        `;

      instance.elements.blockContent.insertAdjacentHTML('afterend', template)
    }

    /**
     * Breakdown HTML when in Edit Mode
     * @param  {Constructor} instance The current instantiation
     */
    function watchForEditMode(instance) {
      let elemToObserve = document.querySelector("body");
      let prevClassState = elemToObserve.classList.contains("sqs-edit-mode-active");
      let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName == "class") {
            let currentClassState = mutation.target.classList.contains("sqs-edit-mode-active");
            if (prevClassState !== currentClassState) {
              prevClassState = currentClassState;
              if (currentClassState) instance.destroy(instance);
            }
          }
        });
      });
      observer.observe(elemToObserve, { attributes: true });
    }

    /**
     * The constructor object
     * @param {String} selector The selector for the element to render into
     * @param {Object} options  User options and settings
     */
    function Constructor(el, options = {}) {

      this.settings = Object.assign({}, defaults, global, options);

      // Add Elements Obj
      this.elements = {
        block: el,
        get blockContent() {
          let blockContent = this.block.querySelector('.sqs-block-content');
          return blockContent;
        },
        get imageURL() {
          let src = this.blockContent.querySelector('img').dataset.src;
          return src;
        },
        get imageResolution() {
          let resolution = this.blockContent.querySelector('img').dataset.imageResolution;
          return resolution;
        },
        get container() {
          let container = this.block.querySelector('.wm-website-mockup');
          return container;
        },
        get link() {
          let link = this.block.querySelector('a');
          return link;
        }
      };

      // Inject template into the DOM
      injectTemplate(this);
      
      this.elements.container.closest('.sqs-block').classList.add('wm-website-mockup-block');

      // Breakdown when in Edit Mode
      watchForEditMode(this);

      new WebsiteMockupFunctions(this.elements.container);
    }

    /**
     * Destroy this instance
     */
    Constructor.prototype.destroy = function (instance) {
      instance._elements.container.remove();
    };
    
    
    return Constructor;
  })();

  //Build HTML
  let websiteMockupsImgs = document.querySelectorAll(".image-block");
  for (const el of websiteMockupsImgs) {
    let isMockup = window.getComputedStyle(el).getPropertyValue('--wm-plugin'), 
        isBuilt = el.querySelector('.wm-website-mockup.loaded');

    //Stop if already Loaded
    if (isMockup && !isBuilt) {
      new BuildWebsiteMockupHTML(el, {});
    }
  }

  //Add Javascript
  let websiteMockupHTML = document.querySelectorAll(".wm-website-mockup:not(.loaded)");
  for (const structure of websiteMockupHTML) {
    if (!structure.matches(".loaded")) {
      new WebsiteMockupFunctions(structure, {});
    }
  }
})();