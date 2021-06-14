/**
 * Microaggressions
 */
var Micro = (function(root) {
    _micro = this;

    _micro.xml;
    _root = root;

    $.get(_root +'micro.xml', _micro.config);
});
Micro.prototype = {
    config: function(xml) {
        _micro.xml = $(xml);
        _micro.introPager(_micro.xml);
    },

    introPager: function(xml) {
        var pager = new Pager(xml.find('intro'), _root);
        pager.attach($('.container'));
        pager.setButtonText(xml.find('buttons next').text());
        pager.addEventListener('Complete', function() {
            $('.pagerWidget').remove();
            _micro.startSlides(xml);
        });
    },

    startSlides: function(xml) {
        var slideShow = new SlideShow(xml.find('slideshow'));
        slideShow.addEventListener('Complete', function() {
            _micro.conclusionPager(xml);
        });

        TweenMax.to('.definitions', 0.3, { autoAlpha: 1 });
        $('.definitions').on('click', function(e) {
            var root = _root.replace('../../', '');
            _shell.popupURL(root +'pages/definition_popup.html');
        });
    },

    conclusionPager: function(xml) {
        TweenMax.to('.definitions', 0.3, { autoAlpha: 0 });
        var pager = new Pager(xml.find('conclusion'), _root);
        pager.attach($('.container'));
        pager.setButtonText(xml.find('buttons next').text());
        pager.addEventListener('Complete', function() {
            $('.pagerWidget').remove();
            _shell.activityComplete();
            _shell.gotoSection(0);
        });
    }
};

/**
 * SlideShow
 */

var SlideShow = (function(xml) {
    _slideShow = this;

    this.xml = xml;
    this.events = [];
    this.currentSlideId = 1;
    this.slides = xml.find('slide').length;
    this.currentSlide = xml.find('slide#'+ this.currentSlideId);

    this.frontLoadSlides();
});
SlideShow.prototype = {
    frontLoadSlides: function() {
        this.xml.find('slide').each(function(i, e) {
            _slideShow.createSlide(i,$(e));
        });

        this.showSlide(this.currentSlideId);
    },

    createSlide: function(idx, slideData) {
        var slide = new Slide(slideData, function(el) {
            TweenMax.to(el, 0.3, { autoAlpha: 0, onComplete: function() {
                el.remove();
                _slideShow.next();
            }});
        });
    },

    showSlide: function(id) {
        TweenMax.to('.micro-template', 0.25, { autoAlpha: 0 });
        TweenMax.to('.micro-template#'+ id, 0.3, { autoAlpha: 1 });
    },

    next: function() {
        this.currentSlideId++;
        if (this.currentSlideId <= this.slides) {
            this.currentSlide = this.xml.find('slide#'+ this.currentSlideId);
            this.showSlide(this.currentSlideId);
        } else {
            this.dispatchEvent('Complete');
        }
    },

    addEventListener: function(evt, fn) {
        this.events[evt] = fn;
    },

    dispatchEvent: function(evt) {
        if (this.events[evt] != undefined) {
            this.events[evt]();
        }
    }
};

/**
 * Slide
 */

var Slide = (function(xml, callback) {
    this.z = 10;
    this.div;
    this.xml = xml;
    this.callback = callback;

    this.build();
});
Slide.prototype = {
    build: function() {
        this.div = this.getTemplate();
        this.div.attr('id', this.xml.attr('id')).removeClass('keep-quiet');
        this.div.css({ zIndex: this.z - this.xml.attr('id') });

        var imgPath = _root + this.xml.attr('img');
        this.div.find('.img-container').css('backgroundImage', 'url('+ imgPath +')');

        var bubble = this.xml.find('speechbubble');
        var txt = bubble.text();
        txt = txt.replace('[mdash]', '<span style="font-family:Arial">&mdash;</span>');
        this.div.find('.speech-bubble')
            .css({
                top   : bubble.attr('y') +'px',
                left  : bubble.attr('x') +'px',
                width : bubble.attr('w')
            })
            .html(_shell.valign(txt) +'<div class="tail '+ bubble.attr('tail') +'"></div>');

        var _slide = this;
        this.div.find('.question').html(this.xml.find('question').text());
        var btns = [{
            el: '.btn.yes',
            clickHandle: 'clickYes'
        }, {
            el: '.btn.no',
            clickHandle: 'clickNo'
        }];

        $.each(btns, function(i,e) {
            $(_slide.div.find(e.el)).on('click', function(ev) {
                _slide[e.clickHandle](ev);
            });
        });

        this.attach();
    },

    getFeedback: function(type) {
        return $(this.xml.find(type+'feedback'));
    },

    isFeedbackCorrect: function(data) {
        return (data.attr('correct') != undefined) ? true : false;
    },

    clickYes: function(e) {
        var _slide = this;
        var elements = ['.question', '.yes', '.no'];
        $.each(elements, function(i,e) {
            var el = $(_slide.div.find('.controls-container '+ e));
            TweenMax.to(el, 0.3, { autoAlpha: 0, onComplete: function() {
                if (i == elements.length -1) _slide.evaluateOption('yes');
            }});
        });
    },

    clickNo: function(e) {
        var _slide = this;
        var elements = ['.question', '.yes', '.no'];
        $.each(elements, function(i,e) {
            var el = $(_slide.div.find('.controls-container '+ e));
            TweenMax.to(el, 0.3, { autoAlpha: 0, onComplete: function() {
                if (i == elements.length -1) _slide.evaluateOption('no');
            }});
        });
    },

    evaluateOption: function(selected) {
        var container = $('.container'),
        _slide        = this,
        feedbackData  = this.getFeedback(selected),
        fbcontainer   = this.div.find('.img-container .feedback-container'),
        exlamation    = '<div class="exlaim"></div>';

        // console.log('Fbdata', feedbackData);
        fbcontainer.html(exlamation + _shell.valign(feedbackData.find('feedback').text()));

        // Bind click event to next button
        container.on('click', '.btn.nextslide', function(e) {
            _slide.nextClickHandle(e);
        });

        // Fade out speech bubble
        TweenMax.to(this.div.find('.speech-bubble'), 0.3, { autoAlpha: 0 });

        // Next instructions
        var controls = this.div.find('.controls-container'),
        nextbtn      = $('<div class="btn nextslide">NEXT</div>'),
        instructions = $('<div class="next-inst-container" />');
        instructions.html('<div class="next-inst">'+ this.xml.find('next-instructions').text() +'</div>')
        controls.append(instructions).append(nextbtn);

        if (feedbackData.find('feedback').attr('class') != undefined)
            fbcontainer.addClass(feedbackData.find('feedback').attr('class'));
        else
            fbcontainer.removeClass(function() { return $(this).attr('class') }).addClass('feedback-container');

        // Check for correct feedback
        if (this.isFeedbackCorrect(feedbackData)) {
            TweenMax.to(fbcontainer, 0.25, { bottom: 0, ease: Quad.easeOut });
            TweenMax.to(nextbtn, 0.3, { delay: 0.3, autoAlpha: 1 });
            TweenMax.to(instructions.find('.next-inst'), 0.5, { delay: 0.5, autoAlpha: 1, left: 0 });
        } else {
            TweenMax.to(fbcontainer, 0.25, { bottom: 0, ease: Quad.easeOut });
            TweenMax.to(nextbtn, 0.3, { delay: 0.3, autoAlpha: 1 });
            TweenMax.to(instructions.find('.next-inst'), 0.5, { delay: 0.5, autoAlpha: 1, left: 0 });
        }
    },

    nextClickHandle: function(e) {
        var
        _slide    = this,
        hears     = _slide.div.find('.person-hears'),
        question  = _slide.div.find('.question'),
        inst      = _slide.div.find('.next-inst-container .next-inst');

        hears.html(_slide.xml.find('hears').text());
        TweenMax.to(hears, 0.3, { autoAlpha: 1 });
        TweenMax.to(question, 0.3, { autoAlpha: 0 });
        TweenMax.to(inst, 0.5, { autoAlpha: 0 });

        _slide.div.find('.btn.nextslide').off('click').on('click', function(e) {
            _slide.nextSlide(e);
        });
    },

    nextSlide: function(e) {
        var
        _slide      = this,
        hears       = _slide.div.find('.person-hears'),
        btn         = _slide.div.find('.nextslide'),
        controls    = _slide.div.find('.controls-container'),
        fbcontainer = _slide.div.find('.img-container .feedback-container');

        TweenMax.set(btn, { autoAlpha: 0 });
        TweenMax.set(hears, { autoAlpha: 0 });
        TweenMax.set(controls, { autoAlpha: 1 });
        TweenMax.set(fbcontainer, { bottom: -220 });

        btn.off('click');

        _slide.callback($('.container .micro-template#'+ _slide.xml.attr('id')));
    },

    getTemplate: function() {
        return $('.micro-template.keep-quiet').clone();
    },

    attach: function() {
        $('.container').append(this.div);
    }
};