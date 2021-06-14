/**
 * Scoping out the Pager Widget
 */
(function(window) {
  var log = function(str) {},
    app;

  var Pager = function(data, root) {
    log('-- Pager Location: core/script/widgets.js');
    log('-- -- Root: ', root);
    log('-- -- Data: ', data);

    app = this;

    // Set params
    app.data = $(data);
    app.root = root;

    // Set defaults
    app.setDefaults();

    // Initialize
    app.init();
  };

  Pager.prototype = {
    constructor: Pager,

    setDefaults: function() {
      app.pages = app.data.find('page');
      app.currentPage = null;
      app.currentBackground = null;

      app.bgs = [];
      app.events = [];
      app.pageCache = {};
      app.accordions = {};

      app.disabled = false;
      app.div = app.buildEmptyMarkup();
    },

    init: function() {
      app.loadingPages = false;

      // Loop through the page nodes
      for (var i = 0; i < app.pages.length; i++) {
        app.extractBackground(i, $(app.pages[i]));
        app.checkForExternalPage(i, $(app.pages[i]));
      }

      // Add global event listeners
      app.div.find('.contentBlock .next').on('click', function() {
        if (!$(this).hasClass('disabled') && !$(this).prop('disabled')) {
          app.nextPage();
        }
      });
      app.div.delegate('.contentBlock .tryagain', 'click', function() {
        app.dispatchEvent('TryAgain');
      });

      // Check the status of our loading pages
      if (app.loadingPages) log('Pages are currently loading...');
      else log('Pages have loaded successfully.');

      // If pages have successfully loaded, show the first page
      if (!app.loadingPages) {
        setTimeout(function() {
          app.showPage(0, true);
        }, 500);
      }
    },

    extractBackground: function(i, page) {
      var backgroundCollection = {};

      // Check for a new image
      if (page.attr('background').toUpperCase() !== 'SAME') {
        var backgroundElement = $('<img class="bg" />');
        backgroundElement.attr('src', app.root + page.attr('background'));

        // Add to the DOM
        app.div.find('.backgrounds').append(backgroundElement);

        // Add to collection object
        backgroundCollection = {
          div: backgroundElement,
          options: page.find('background')
        };
      } else {
        // Assume it's already been added to the DOM and just
        // add to collection object
        backgroundCollection = {
          div: null,
          options: page.find('background')
        };
      }

      app.bgs.push(backgroundCollection);
    },

    checkForExternalPage: function(i, page) {
      if (page.attr('html') !== undefined) {
        // Creat the external reference
        var extPage = new PagerExternalPage(page.attr('html'), app.root, i);
        extPage.callback = function() {
          // Callback for when the external source loads
          app.externalPageLoaded();
        };
        app.pageCache[page.attr('html')] = extPage;
        app.loadingPages = true;
      }
    },

    externalPageLoaded: function() {
      var allLoaded = true;
      for (var page in app.pageCache) {
        if (!app.pageCache[page].loaded) allLoaded = false;
      }

      if (allLoaded) app.showPage(0, true);
    },

    setButtonText: function(txt) {
      var next = $('.pagerWidget .contentBlock .next');
      next.html(txt);
    },

    buildEmptyMarkup: function() {
      var markup =
        '<div class="pagerWidget">' +
        '	<div class="backgrounds"></div>' +
        '	<div class="contentBlock">' +
        '		<div class="text">' +
        '			<div class="header"></div>' +
        '			<div class="body"></div>' +
        '		</div>' +
        '		<div class="btn next" id="thenextbutton"></div>' +
        '	</div>' +
        '</div>';

      return $(markup);
    },

    showPage: function(pageIdx, snap) {
      // Check for completion
      if (pageIdx === app.pages.length) {
        app.dispatchEvent('Complete');
        return false;
      }

      // Set the JIRA context
      // Not sure of the syntax here, but this is how it was
      window.parent._shell.jiraItem('Slide '+ (pageIdx + 1));

      app.currentPage = pageIdx;
      app.showBackground(pageIdx);

      var
        paddingOffset = 144,
        accordionLength = 0,
        pg = $(app.pages[pageIdx]),
        contentBlock = $('.contentBlock'),
        header = $('.contentBlock .header'),
        text = $('.contentBlock .text'),
        body = $('.contentBlock .body'),
        next = $('.contentBlock .next');

      body.attr('id', 'page-'+ pageIdx);

      log('Page Details:');
      log(' HTML File: '+ pg.attr('html'));
      log(' Width: '+ pg.attr('width'));
      log(' Height: '+ pg.attr('height'));
      log(' X: '+ pg.attr('x'));
      log(' Y: '+ pg.attr('y'));

      // Check for snap boolean
      // I don't think snap is ever set to true if the page
      // uses external HTML file
      if (snap) {
        contentBlock.css({
          top: pg.attr('y') +'px',
          left: pg.attr('x') +'px',
          width: (pg.attr('width') - paddingOffset) +'px'
        });
        text.css({
          width: (pg.attr('width') - paddingOffset) +'px'
        });
        
        header.html(pg.find('header').text());
        
        // Check for external HTML
        if (pg.attr('html') === undefined) {
          // There is no external, so we get the data from the XML
          var filteredText = pg.find('body').text();
          filteredText = filterASCII(filteredText, 'mdash');
          filteredText = filterASCII(filteredText, 'ndash');
          body.html(filteredText);
          
          function filterASCII(src, needle) {
            var replace = '\\['+ needle +'\\]',
              regex = new RegExp(replace, 'g');
            return src.replace(regex, spanWrap(needle));
          }
          function spanWrap(ascii) {
            return '<span style="font-family:Arial,sans-serif;">&'+ ascii +';</span>';
          }
        } else {
          // There is an external, so we load it from the pageCache
          body.html(app.pageCache[pg.attr('html')].html);
          // app.pageGate(accordionLength);
          if ($('.accordion:visible').length > 0) {
            app.disabled = true;
            next.addClass('disabled');
            accordionLength = $('.accordion:visible').length;
            app.pageGate(accordionLength);
          }
        }

        // This seems like it's unnecessarily necessary
        var layoutWatcher = setInterval(function() {
          var contentHeight = 0;
          // Check for DOM element with "contents" ID
          if (!$('.contentBlock #contents').is('div')) {
            // In other words, contents doesn't exist
            contentHeight = text.height();
          } else {
            contentHeight = $('.contentBlock .body #contents').height();
          }

          if (contentHeight > 50) {
            contentBlock.css({
              height: contentHeight +'px'
            });

            // Position the disclaimer text about clicking green arrows
            $('.green').attr('style', 'top:'+ (contentHeight+80) +'px');

            // Check and set position of next button
            if (pg.attr('nextX') === undefined) {
              next.css({
                left: ((contentBlock.width() - next.width()) / 2 + 42) +'px'
              });
            } else {
              next.css({
                left: pg.attr('nextX') +'px'
              });
            }

            // Clear the loop if the contentHeight has been found and set
            clearInterval(layoutWatcher);
          }
        }, 100);
      } else {
        var newWidth = pg.attr('width') - paddingOffset;
        next.addClass('disabled');

        // Animate the text box across slides
        TweenMax.to(text, 0.3, {
          autoAlpha: 0,
          onComplete: function() {
            text.css({ width: newWidth +'px' });
            header.html(pg.find('header').text());

            if (pg.attr('html') === undefined) {
              body.html(pg.find('body').text());
            } else {
              body.html(app.pageCache[pg.attr('html')].html);
              if ($('.accordion:visible').length > 0) {
                app.disabled = true;
                next.addClass('disabled');
                accordionLength = $('.accordion:visible').length;
                app.pageGate(accordionLength);
              }
            }

            if (!$('.contentBlock #contents').is('div')) {
              contentBlock.css({ height: text.height() });
            } else {
              contentBlock.css({ height: $('.contentBlock #contents').height() });
            }

            var h = contentBlock.height();
            log('Page height: '+ h);
            log('Text height: '+ text.height());
            TweenMax.to(contentBlock, 0.5, {
              left: pg.attr('x'),
              top: pg.attr('y'),
              width: newWidth,
              height: h,
              onComplete: function() {
                TweenMax.to(text, 0.5, { autoAlpha: 1 });
                if (!app.disabled) next.removeClass('disabled');
                $('.green').attr('style', 'top:'+ ($('.contentBlock #contents').height() + 80) +'px');
              }
            });

            if (pg.attr('nextX') === undefined) {
              TweenMax.to(next, 0.5, { left: (newWidth - next.width()) / 2 + 42 });
            } else {
              TweenMax.to(next, 0.5, { left: pg.attr('nextX') +'px' });
            }
          }
        });
      }
    },

    pageGate: function(length) {
      var count = length;
      log('Accordion count from pageGate.count: ', count);
      if (count !== undefined && count > 0) {
        app.disable();
        $('.contentBlock').off('click').delegate('.accordion-head', 'click', function(e) {
          $(e.currentTarget).addClass('clicked');
          log('Count: '+ count, 'Clicked: '+ $('.contentBlock .accordion-head.clicked').length);
          if (count === $('.contentBlock .accordion-head.clicked').length) {
            app.enable();
          }
        });
      }
    },

    disable: function() {
      $('.contentBlock .next').addClass('disabled');
      app.disabled = true;
    },

    enable: function() {
      $('.contentBlock .next').removeClass('disabled');
      app.disabled = false;
    },

    nextPage: function() {
      app.showPage(this.currentPage + 1);
    },

    showBackground: function(n) {
      var bg = app.bgs[n];
      if (bg.div != null) {
        if (app.currentBackground != null) {
          TweenMax.to(app.currentBackground, 0.5, { autoAlpha: 0 });
        }
        app.currentBackground = bg.div;
      }

      if (bg.options.length > 0) {
        app.animateBackground(bg.options);
      }
      TweenMax.to(app.currentBackground, 0.5, { overwrite: false, autoAlpha: 1 });
    },

    animateBackground: function(options) {
      var args = {};
      args.x = options.attr('x');
      args.y = options.attr('y');
      args.scale = options.attr('scale');

      if (options.attr('animate') == 'true') {
        //args.alpha = 1;
        args.ease = 'Cubic.easeOut';
        TweenMax.to(this.currentBackground, 13, args);
      } else {
        TweenMax.set(this.currentBackground, args);
        TweenMax.to(this.currentBackground, 0.5, { alpha: 1 });
      }
    },

    updateJira: function() {
      try {
        _shell.jiraLocation('Page ' + (Number(this.currentPage) + 1));
      } catch (e) {}
    },

    attach: function(div) {
      div.append(this.div);
      this.dispatchEvent('Init');
    },

    addEventListener: function(evt, fn) {
      this.events[evt] = fn;
    },

    dispatchEvent: function(evt) {
      if (this.events[evt] != undefined) {
        this.events[evt]();
      }
    },

    remove: function() {
      this.div.remove();
    },

    noBack: function() {
      return false;
    },
    noNext: function() {
      return false;
    },

    setAccordionCount: function(n, idx) {
      this.accordions['page' + idx] = n;
    }
  };

  // External Page AJAX call
  function PagerExternalPage(url, root) {
    this.loaded = false;
    this.callback = null;
    this.html = null;

    var _pagerExternalPage = this;
    $.get(root + url, function(html) {
      _pagerExternalPage.html = html;
      _pagerExternalPage.loaded = true;

      if (_pagerExternalPage.callback != null)
        _pagerExternalPage.callback();

      // console.log('Visible accordions', $(html).find('.accordion:visible').length);
      // console.log('Invisible accordions', $(html).find('.accordion').length)
      _pagerExternalPage.setAccordionCount($(html).find('.accordion:visible').length, idx);
    });
  }

  window.Pager = Pager;

})(window);