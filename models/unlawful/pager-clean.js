// Breaking down the Pager Component

// TODO Constructor => would like to turn this into a closure that returns the prototyped object

var Pager = (function(data, root) {

  var app;
  var Mod = function(data, root) {
    app = this;

    app.pages;
    app.currentPage;
    app.currentBackground;

    app.root = root;
    app.data = $(data);

    app.disabled = false;
    app.div = app.buildEmptyMarkup();

    // Collections
    app.bgs = [];
    app.events = [];
    app.pageCache = [];
    app.accordions = [];
    app.pages = app.data.find('page');

    app.init();
  }

  Mod.prototype = {

    /**
     * Sets up the pages and adds backgrounds,
     * also delegates click events
     */
    init: function() {

      app.setBackgrounds();
      app.delegateEvents();

      // Show first page
      TweenMax.delayedCall(1, function() {
        app.showPage(0, true);
      });
    },

    setBackgrounds: function() {
      // Loop through the page nodes
      for (var i = 0; i < app.pages.length; i++) {
        var $p = $(app.pages[i]), bgCollection;

        // Look for background attribute
        var backgroundAttribute = $p.attr('background');
        if (backgroundAttribute.toUpperCase() !== 'SAME') {
          var bg = $('<img class="bg" src="'+ app.root + backgroundAttribute +'">');
          app.div.find('.backgrounds').append(bg);
          bgCollection = { div: bg, options: $p.find('background') }
        } else {
          bgCollection = { div: null, options: $p.find('background') }
        }

        // Add collection to the global backgrounds container
        app.bgs.push(bgCollection);

        // Check page HTML
        if ($p.attr('html') !== undefined) {
          app.pageCache[$p.attr('html')] = new PagerExternalPage($p.attr('html'), app.root, app, i);
          // console.log('PageCache...', app.pageCache);
        }
      }
    },

    delegateEvents: function() {
      // Next button
      app.div.find('.contentBlock .next').on('click', function(e) {
        // Check if the buttons is disabled or not
        if (!$(this).hasClass('disabled')) {
          app.nextPage();
        }
      });

      // Try Again button
      app.div.delegate('.contentBlock .tryagain', 'click', function(e) {
        app.dispatchEvent('TryAgain');
      });

      // TODO Hide TryAgain by default => this should probably be done in CSS
      TweenMax.set('.contentBlock .btn.tryagain', { autoAlpha: 0 });
    },

    setButtonText: function(txt) {
      // Not sure where this function is being called
      $('.pagerWidget .contentBlack .next').html(txt);
    },

    /**
     * Create the HTML for the page
     */
    buildEmptyMarkup: function() {
      var markup = [
        '<div class="pagerWidget">',
        ' <div class="backgrounds"></div>',
        ' <div class="contentBlock">',
        '   <div class="text">',
        '     <div class="header"></div>',
        '     <div class="body"></div>',
        '   </div>',
        '   <div class="btn next" id="thenextbutton"></div>',
        ' </div>',
        '</div>'
      ].join('');

      return $(markup);
    },

    /**
     * Create the page and check animate all the things
     */
    showPage: function(n, snap) {
      // Check for completion
      if (n == app.pages.length) {
        app.dispatchEvent('Complete');
        return false;
      }

      // Get the current page and page elements
      app.currentPage = n;

      // Transition background
      app.showBackground(n);

      var pg       = $(this.pages[n]),
      contentBlock = {
        inner: $('.contentBlock'),
        header: $('.contentBlock .header'),
        text: $('.contentBlock .text'),
        body: $('.contentBlock .body'),
        next: $('.contentBlock .next'),
        contents: $('.contentBlock #contents')
      };

      contentBlock.body.attr('id', 'page-'+ n);

      // console.log('ContentBlock', contentBlock);

      // Check for snap, even though I can't remember what that means
      if (snap) {
        app.contentSnap(pg, contentBlock);
      } else {
        app.contentDefault(pg, contentBlock);
      }

      // Gate the page if there are accordions
      app.pageGate();
    },

    showBackground: function(n) {
      var bg = app.bgs[n];
      if (bg.div != null) {
        if (app.currentBackground != null) {
          // Fade out initial
          TweenMax.to(app.currentBackground, 0.5, { autoAlpha: 0 });
        }

        app.currentBackground = bg.div;
      }

      // If there are options like x and y, animate the image
      if (bg.options.length > 0) {
        app.animateBackground(bg.options);
      }

      // Fade new bg image in
      TweenMax.to(app.currentBackground, 0.5, { overwrite: false, alpha: 1 });
    },

    animateBackground: function(options) {
      var args = {};
      args.x     = options.attr('x');
      args.y     = options.attr('y');
      args.scale = options.attr('scale');

      if (options.attr('animate') == 'true') {
        args.ease = 'Cubic.easeOut';
        TweenMax.to(app.currentBackground, 13, args);
      } else {
        TweenMax.set(app.currentBackground, args);
        TweenMax.to(app.currentBackground, 0.5, { autoAlpha: 1 });
      }
    },

    contentSnap: function(pg, contentBlock) {
      // console.log('ContentSNAP');
      // Add CSS to contentBlock
      contentBlock.inner.css({
        top: pg.attr('y') +'px',
        left: pg.attr('x') +'px',
        width: pg.attr('width') - 144
      });

      contentBlock.text.css({ width: pg.attr('width') - 144});
      contentBlock.header.html(pg.find('header').text());
      contentBlock.next.html('Next');

      // Check the page HTML and see if
      // we are getting external HTML
      if (pg.attr('html') === undefined) {
        contentBlock.body.html(pg.find('body').text());
      } else {
        contentBlock.body.html(app.pageCache[pg.attr('html')].html);
      }

      // Change the contentBlocks height
      app.setContentHeight(contentBlock);

      // TODO Set CTA position, this should probably be done with CSS
      app.setCTAPosition(contentBlock.contents.height() + 80);

      if (pg.attr('nextX') === undefined) {
        contentBlock.next.css('left', (contentBlock.inner.width() - contentBlock.next.width()) / 2 + 42);
      } else {
        contentBlock.next.css('left', pg.attr('nextX') +'px');
      }
    },

    contentDefault: function(pg, contentBlock) {
      // console.log('COntentDEFAULT');
      // I don't know why we are changing the width defined in the XML
      var newWidth = pg.attr('width') - 144;

      // Disable the next button
      contentBlock.next.addClass('disabled');

      // Animate text off and update content before animating back in
      TweenMax.to(contentBlock.text, 0.3, {
        autoAlpha: 0,
        onComplete: function() {
          getContents();
        }
      });

      var getContents = function() {
        // console.log('Get CONTENTS ------');
        contentBlock.text.css('width', newWidth +'px');
        contentBlock.header.html(pg.find('header').text());

        if (pg.attr('html') === undefined) {
          contentBlock.body.html(pg.find('body').text());
        } else {
          contentBlock.body.html(app.pageCache[pg.attr('html')].html);
        }

        var h = app.setContentHeight(contentBlock);
        // console.log('WHAT THE EVER LOVING HECKFIRE?', h);

        // Animate some more
        TweenMax.to(contentBlock.inner, 0.5, {
          left: pg.attr('x'),
          top: pg.attr('y'),
          width: newWidth,
          height: h,
          onComplete: function() {
            showContents();
          }
        });

        // Set next position
        var leftPos = (pg.attr('nextX') === undefined)
          ? (newWidth - contentBlock.next.width()) / 2 + 42
          : pg.attr('nextX') +'px';
        TweenMax.to(contentBlock.next, 0.5, { left: leftPos });
      };

      var showContents = function() {
        TweenMax.to(contentBlock.text, 0.5, { autoAlpha: 1 });
        if (!app.disabled) contentBlock.next.removeClass('disabled');
        app.setCTAPosition(contentBlock.contents.height() + 80);
      }
    },

    setContentHeight: function(contentBlock) {
      if (!contentBlock.contents.is('div')) {
        contentBlock.inner.css('height', contentBlock.text.height());
      } else {
        contentBlock.inner.css('height', contentBlock.contents.height());
      }

      return contentBlock.inner.outerHeight();
    },

    setCTAPosition: function(pos) {
      $('.green').attr('style', 'top:'+ pos +'px');
    },

    pageGate: function() {
      // console.log('Gated progress based on accordions.');
      // console.log(' Captured Accordions: ', app.accordions);

      var count = app.accordions['page'+ app.currentPage];
      // console.log(' Count: ', count);

      // Check if count is defined
      if (count !== undefined && count > 0) {
        app.disable();
        // Delegate accordion click events
        $('.contentBlock').delegate('.accordion-head', 'click', function(e) {
          var target = $(e.currentTarget);
          // console.log('   Current Accordion Target: ', target);
          target.addClass('clicked');
          var clickedCount = $('.contentBlock .accordion-head.clicked').length;
          if (Number(count) === Number(clickedCount)) {
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
      app.showPage(app.currentPage+1);
    },

    prevPage: function() { return false },
    updateCounter: function() { return false },
    noBack: function() { return false },
    noNext: function() { return false },

    updateJira: function() {
      try {
        _shell.jiraLocation('Page '+ (Number(app.currentPage)+1));
      } catch(e) {
        // throw error
      }
    },

    attach: function(div) {
      div.append(app.div);
      app.dispatchEvent('Init');
    },

    addEventListener: function(evt, fn) {
      app.events[evt] = fn;
    },

    dispatchEvent: function(evt) {
      if (app.events[evt] !== undefined) {
        app.events[evt]();
      }
    },

    setAccordionCount: function(n, idx) {
      app.accordions['page'+ idx] = n;
    }
  };

  var PagerExternalPage = function(url, root, _pager, idx) {
    this.loaded = false;
    this.callback = null;
    this.html = null;

    var _pagerExternalPage = this;
    $.get(root + url, function(html) {
      _pagerExternalPage.html = html;
      _pagerExternalPage.loaded = true;

      if (_pagerExternalPage.callback != null) {
        _pagerExternalPage.callback();
      }

      _pager.setAccordionCount($(html).find('.accordion:visible').length, idx);
    });
  }

  return Mod;

})()