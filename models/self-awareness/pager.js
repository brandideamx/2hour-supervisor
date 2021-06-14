/**
 * A content pager with minimal interaction
 * @param  {xml}    data     Pager XML data
 * @param  {string} root     Content root directory
 * @return {obj}             Creates an object
 */
var Pager = (function(data, root) {
    _pager = this;

    // jQueried XML
    _pager.data = $(data);

    // Root content
    _pager.root = root;

    // Disabled state
    _pager.disabled = false;

    // Reference page count
    _pager.pages = _pager.data.find('page');

    // Current page refrence
    _pager.currentPage;

    // Current background image
    _pager.currentBackground;

    // Background collection
    _pager.bgs = [];

    // Event collection
    _pager.events = [];

    // Page cache
    _pager.pageCache = {};

    // Reference for accordion elements
    _pager.accordions = {};

    // Markup
    _pager.div = _pager.buildEmptyMarkup();

    _log('Pager Constructor', _pager);
    // Initialize
    _pager.init();
});
Pager.prototype = {
    init: function() {
        // console.log('-- Pager Location: models/self-awareness/pager.js');
        _pager.loadBackgrounds();
        _pager.defineClickHandles();

        if (!_pager.hasHTMLPages()) _pager.showPage(0, true);
        else _pager.loadPages();
    },

    hasHTMLPages: function() {
        for (var i = 0; i < _pager.pages.length; i++) {
            if ($(_pager.pages[i]).attr('html') !== undefined) return true;
        }

        return false;
    },

    defineClickHandles: function() {
        _pager.div.find('.contentBlock .next').on('click', function(e) {
            _log('Next clicked...');
            if (!$(e.currentTarget).hasClass('disabled'))
                _pager.nextPage();
        });

        _pager.div.on('click', '.contentBlock .tryagain', function(e) {
            _pager.dispatchEvent('TryAgain');
        });
    },

    loadBackgrounds: function() {
        $.each(_pager.pages, function(i,e) {
            var page = $(e), bgObj, bg = null;
            _log('Page '+ i +': ', page);
            // Check background image for repeat
            if (page.attr('background').toUpperCase() != 'SAME') {
                // Create new image
                bg = $('<img />');
                bg.addClass('bg').attr('src', _pager.root + page.attr('background'));

                // Append it to the background div
                _pager.div.find('.backgrounds').append(bg);
            }

            _pager.bgs.push({
                div: bg,
                options: page.find('background')
            });
        });
    },

    loadPages: function() {
        // Loop through pages
        $.each(_pager.pages, function(i,e) {
            var page = $(e), bgObj, bg = null;

            // Check for an HTML page
            if (page.attr('html') != undefined) {
                var externalPage = new PagerExternalPage({
                    idx: i,
                    parent: _pager,
                    root: _pager.root,
                    url: page.attr('html'),
                    callback: function() {
                        _pager.externalPageLoaded();
                    }
                });

                _pager.pageCache[page.attr('html')] = externalPage;
            }
        });
    },

    buildEmptyMarkup: function() {
        var markup = '<div class="pagerWidget">'
                   + '  <div class="backgrounds"></div>'
                   + '  <div class="contentBlock">'
                   + '      <div class="header no-margin"></div>'
                   + '      <div class="text">'
                   + '          <div class="body"></div>'
                   + '      </div>'
                   + '      <div class="btn next" id="thenextbutton"></div>'
                   + '  </div>'
                   + '</div>';

        // Return jQuery object;
        return $(markup);
    },

    nextPage: function() {
        // Check for completion
        if ((_pager.currentPage + 1) == _pager.pages.length)
            _pager.dispatchEvent('Complete');
        else
            _pager.showPage(_pager.currentPage+1);
    },

    prevPage: function() { return false },

    disable: function() {
        $('.contentBlock .next').addClass('disabled');
        _pager.disabled = true;
    },

    enable: function() {
        $('.contentBlock .next').removeClass('disabled');
        _pager.disabled = false;
    },

    showPage: function(idx, snap) {
        // Set jira
        // jira.setItem('Core Pager, Page: '+ (idx+1));

        // Check snap
        snap = snap || false;

        // Current page
        _pager.currentPage = idx;

        _log('Show page: current page - '+ idx);

        // Show page background
        _pager.showBackground(idx);

        // Set vars
        var page = $(_pager.pages[idx]),
        el = {
            block:  _pager.div.find('.contentBlock'),
            header: _pager.div.find('.contentBlock .header'),
            text:   _pager.div.find('.contentBlock .text'),
            body:   _pager.div.find('.contentBlock .body'),
            next:   _pager.div.find('.contentBlock .next')
        };

        el.body.attr('id', 'page-'+ idx);

        // Page width
        var pagew = page.attr('width') - 144;

        if (snap) { _log('Page '+ idx +' is snapped.');

            // Set dimensions of content block
            TweenMax.set(el.block, {
                width : pagew,
                top   : page.attr('y'),
                left  : page.attr('x')
            });

            _pager.getContent(el, page, pagew, function() {
                _log('Got contents...');
            });

            // Watch layout changes
            var watchCount = 0;
            var layoutWatcher = setInterval(function() {
                var contents = $('.contentBlock #contents');
                var contentHeight = _pager.getContentHeight(page, contents, el.block, el.body);

                _log('Checking for content height: '+ contentHeight);
                if (contentHeight > 100 || watchCount > 10) {
                    el.block.css({ height: contentHeight });

                    TweenMax.to(el.block, 0.5, { delay: 0.1, autoAlpha: 1 });
                    TweenMax.to(el.text, 0.5, { delay: 0.2, autoAlpha: 1 });
                    TweenMax.to(el.body, 0.5, { delay: 0.3, autoAlpha: 1 });

                    // Next position
                    _pager.setNextPosition(page, el.block, el.next);

                    // Clear watcher
                    clearInterval(layoutWatcher);
                }
                watchCount++;
            }, 100);
        } else { _log('Page '+ idx +' is not snapped.');
            el.next.addClass('disabled');
            _pager.getContent(el, page, pagew, function() {
                var contents = $('.contentBlock #contents'),
                    contentHeight = _pager.getContentHeight(page, contents, el.block, el.body);

                TweenMax.to(el.block, 0.5, {
                    width: pagew,
                    height: contentHeight,
                    top: page.attr('y'),
                    left: page.attr('x'),
                    onComplete: function() {
                        TweenMax.to(el.block, 0.5, { delay: 0.1, autoAlpha: 1 });
                        TweenMax.to(el.text, 0.5, { delay: 0.2, autoAlpha: 1 });
                        TweenMax.to(el.body, 0.5, { delay: 0.3, autoAlpha: 1 });

                        if (!_pager.disabled) _pager.enable();

                        // Next position
                        _pager.setNextPosition(page, el.block, el.next);
                    }
                })
            });
        }

        _pager.pageGate(_pager);
    },

    getHeader: function(pg, header) {
        if (pg.find('header').text() != '')
            header.html(pg.find('header').text()).css('margin-bottom', 17);
        else
            header.css('margin-bottom', 0);
    },

    getContent: function(el, page, w, callback) {
        callback = null || callback;

        // Make sure elements are hidden;
        TweenMax.set(el.text, { autoAlpha: 0 });
        TweenMax.set(el.body, { autoAlpha: 0 });
        TweenMax.set(el.next, { autoAlpha: 0 });

        el.text.css('width', w);
        _pager.getHeader(page, el.header);

        if (page.attr('html') == undefined) {
            // Is not external
            txt = page.find('body').text();
            txt = txt.replace('[mdash]', '<span style="font-family:Arial">&mdash;</span>');
            txt = txt.replace('[ndash]', '<span style="font-family:Arial">&ndash;</span>');
            el.body.html(txt);
        } else {
            // External
            el.body.html(_pager.pageCache[page.attr('html')].html);
            el.header.html(''); // Remove header because there is one in the external
        }

        if (callback != null) callback();
    },

    getContentHeight: function(page, contents, contentBlock, body) {
        if (!page.attr('heightOffset') || page.attr('heightOffset') == undefined) {
            if (!contents.is('div')) {
                contentBlock.css({ height: body.height() + 100 });
            } else {
                contentBlock.css({ height: contents.height() });
            }
        } else {
            contentBlock.css({ height: page.attr('heightOffset') });
        }

        return contentBlock.height();
    },

    setNextPosition: function(pg, contentBlock, next) {
        if (pg.attr('nextX') == undefined) {
            _log('No next X');
            _log(next, ((contentBlock.width() - next.width()) / 2+42));
            //next.css('left', ((contentBlock.width() - next.width()) / 2+42) +'px !important');
            //TweenMax.to(next, 0.3, { delay: 1, autoAlpha: 1 });
            TweenMax.to(next, 0.3, {
                delay: 0.5,
                autoAlpha: 1,
                left: ((contentBlock.width() - next.width()) / 2 + 42)
            });
        } else {
            _log('Next X:', pg.attr('nextX'));
            //next.css('left', pg.attr('nextX') +'px !important');
            //TweenMax.to(next, 0.3, { delay: 1, autoAlpha: 1 });
            TweenMax.to(next, 0.3, {
                delay: 0.5,
                autoAlpha: 1,
                left: pg.attr('nextX')
            });
        }
    },

    showBackground: function(n) {
        var bg = _pager.bgs[n];
        if (bg.div != null) {
            if (_pager.currentBackground != null)
                TweenMax.to(_pager.currentBackground, 0.5, { autoAlpha: 0 });
            _pager.currentBackground = bg.div;
        }
        if (bg.options.length > 0) _pager.animateBackground(bg.options);

        TweenMax.to(_pager.currentBackground, 0.5, { overwrite: false, autoAlpha: 1 });
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
            TweenMax.to(this.currentBackground, 0.5, { autoAlpha: 1 });
        }
    },

    updateCounter: function() { return false },

    externalPageLoaded: function() {
        var allLoaded = true;
        for (var page in _pager.pageCache)
            if (!_pager.pageCache[page].loaded)
                allLoaded = false;

        if (allLoaded) _pager.showPage(0, true);
    },

    setButtonText: function(txt) {
        $('.pagerWidget .contentBlock .next').html(txt);
    },

    setAccordionCount: function(n, idx) {
        _pager.accordions['page'+idx] = n;
        if (_pager.accordions.length > 0)
            _pager.disable();
    },

    pageGate: function(p) {
        setTimeout(function() {
            // console.log('Pager', p);
            var count = p.accordions['page'+ p.currentPage];
            // console.log('Count ', count);

            if (_shell.getQP().qa == 'true') count = undefined;
            if (count != undefined && count > 0) {
                p.disable();
                $('.contentBlock').on('click', '.accordion-head', function(e) {
                    var accordion = $(e.currentTarget);
                    accordion.addClass('clicked');
                    if (count == $('.contentBlock .accordion-head.clicked').length)
                        p.enable();
                });
            }
        }, 300);
    },

    attach: function(target) {
        $(target).append(_pager.div);
        _pager.dispatchEvent('Init');
    },

    addEventListener: function(evt, fn) {
        _pager.events[evt] = fn;
    },

    dispatchEvent: function(evt) {
        if (_pager.events[evt] != undefined)
            _pager.events[evt]();
    },

    remove: function() {
        _pager.div.remove();
    },

    updateJira: function() {
        try {
            _shell.jiraLocation('Pager::Page '+ (Number(_pager.currentPage)+1));
        } catch(e) {
            // console.log(e);
        }
    }
};

/**
 * Gets external .html pages for content
 * @param  {object} params [idx, parent, root, url]
 * @return {null}
 */
var PagerExternalPage = (function(params) {
    // Internal Reference
    var _externalPage = this;

    // Set index
    this.idx = params.idx;

    // Set parent
    this.parent = params.parent;

    // Define null html for return data
    this.html = null;

    // Loaded state
    this.loaded = false;

    // Define null callback
    this.callback = null || params.callback;

    // Get the data from the URL
    $.get(params.root + params.url, function(html) {
        // Set the HTML
        _externalPage.html = html;

        // Set loaded state
        _externalPage.loaded = true;

        // Check for callback
        if (_externalPage.callback != null)
            _externalPage.callback();

        // Set page accordion count
        var accordions = $(_externalPage.html).find('.accordion').length;
        _externalPage.parent.setAccordionCount(accordions, _externalPage.idx);
    });
});

_log = function() {
    // console.log(arguments);
};