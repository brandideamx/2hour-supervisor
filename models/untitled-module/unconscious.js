/*
 * Unconscious Bias
 */

var Unconscious = (function() {
    this.poll = this.pollForContent();
});
Unconscious.prototype = {
    pollForContent: function() {
        return setInterval(this.pollCheck, 500);
    },

    pollCheck: function() {
        if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_unconscious.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _unconscious.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _unconscious.config(data);
                });
            }
        }
    },

    config: function(xml) {
        _shell.hideLoader();
        _unconscious.xml = $(xml);
        _unconscious.showIntro();
    },

    showIntro: function() {
        TweenMax.to('.unconscious .container', 0.001, { autoAlpha: 1 });

        var
        intro = _unconscious.xml.find('intro'),
        root  = _unconscious.xml.find('contentRoot').text(),
        pager = new Pager(intro, root);

        pager.attach($('.container'));
        pager.setButtonText(_unconscious.xml.find('buttons next').text());
        pager.addEventListener('Complete', function() {
            $('.pagerWidget').remove();
            _unconscious.startScenarios();
        });
    },

    startScenarios: function() {
        var scenarios = new Scenarios();
        scenarios.addEventListener('Complete', function() {
            // _unconscious.showConclusion();
            _shell.activityComplete();
            _shell.gotoSection(0);
            $('.container .scenario-template').remove();
        });
    },

    showConclusion: function() {
        var
        conclusion = this.xml.find('conclusion'),
        root       = this.xml.find('contentRoot').text(),
        pager      = new Pager(conclusion, root);

        pager.attach($('.container'));
        pager.setButtonText(this.xml.find('buttons next').text());
        pager.addEventListener('Complete', function() {
            $('.pagerWidget').remove();
            // _unconscious.startMicro();
            _shell.activityComplete();
            _shell.gotoSection(0);
        });
    },

    startMicro: function() {
        $('.scenario-template').remove();
        var micro = new Micro(_unconscious.xml.find('contentRoot').text());
    }
};

var _unconscious = new Unconscious();


/**
 * Scenarios
 * v.0.2
 */
var Scenarios = (function() {
    _self = this;

    this.xml;
    this.scenarios;
    this.currentScenario;
    this.events = [];

    $.get('../../content/untitled-module/scenarios.xml', this.config);
});
Scenarios.prototype = {
    config: function(xml) {
        _self.xml = $(xml);
        _self.scenarios = _self.xml.find('scenario').length;

        _self.beginScenario(1);
    },

    beginScenario: function(id) {
        $('.scenario-lbl').html(_shell.valign('Scenario '+ id));
        this.currentScenario = this.xml.find('scenario#'+ id);
        this.board = new Scene(this.currentScenario, this);
    },

    nextScenario: function() {
        var id = Number(this.currentScenario.attr('id'));
        var nextId = id+1;
        if (nextId <= this.scenarios) this.destroyScenario(nextId);
        else this.dispatchEvent('Complete');
    },

    destroyScenario: function(id) {
        $('.container').empty();
        this.beginScenario(id);
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
 * Scene
 */
var Scene = (function(xml, parent) {
    _scene = this;

    this.parent = parent;
    this.events = [];
    this.div = this.getTemplate();
    this.div.removeClass('keep-quiet');

    this.xml = xml;
    this.position = 0;
    this.roundLength = this.xml.find('round').length;
    this.root = '../../content/untitled-module/';

    this.config();
});
Scene.prototype = {
    config: function() {
        this.div.find('.img-bg').css({
            'background-image': 'url('+ this.root + this.xml.attr('img') +')'
        });
        this.div.find('.scenario-desc').html(this.xml.find('caption').text());
        this.buildBoards();
        this.attach('.container');
        this.step(0);
    },

    buildBoards: function() {
        var rounds = this.xml.find('round');
        $.each(rounds, function(i,e) {
            var board = new Board(i, e, _scene);
            board.attach(_scene.div.find('.board-container'), i, rounds.length);
        });
        var w = (1000 * (rounds.length-1)) - 170;
        $(_scene.div.find('.board-container')).append('<div class="green-line" style="width:'+ w +'px"></div>');
    },

    step: function(idx) {
        TweenMax.to('.board-container', 0.35, { top: 55 });
        if (idx == 0) { // First screen
            $('.img-bg').removeClass('blur');
            $('.btn.prev').addClass('disabled');
            $('.btn.next').removeClass('disabled');

            this.div.find('.scenario-desc').removeClass('small').removeClass('medium');

            TweenMax.to('.board-container', 0.65, { left: 1000 });
            TweenMax.to('.scenario-desc', 0.35, { delay: 0.3, top: 100, autoAlpha: 1, ease: Quad.easeOut,
                onComplete: function() {
                    $('.btn.next').off('click').on('click', function(e) {
                        $('.img-bg').addClass('blur');
                        TweenMax.set('.board-container', { autoAlpha: 1 });
                        setTimeout(function() { _scene.step(1) }, 200);
                    });
                }});
        } else if (idx == this.xml.find('round').length) { // Final screen
            TweenMax.to('.btn.next, .btn.prev', 0.001, { autoAlpha: 0 });

            TweenMax.to('.board-container', 0.65, { left: -(1000*(idx-1)), ease: Quad.easeOut, onComplete: function() {
                $('.btn.next').off('click');
                $('.btn.prev').off('click');
                $('.btn.conclusion-back').on('click', function(e) {
                    TweenMax.to('.btn.next, .btn.prev', 0.001, { autoAlpha: 1 });
                    _scene.step(idx-1)
                });
                $('.btn.transform').on('click', function(e) {
                    TweenMax.to('.scenario-desc', 0.35, { delay: 0.3, top: 60, autoAlpha: 0, ease: Quad.easeIn, onComplete: function() {
                        _scene.div.find('.scenario-desc').html(_scene.xml.find('caption').text());
                    }});
                    _scene.showFinal();
                });
            }});
        } else { // Other screens
            if ($('.board#board-'+ idx).find('.selected').length == 0)
                $('.btn.next').addClass('disabled');
            else
                $('.btn.next').removeClass('disabled');

            if (idx == 1) {
                $('.btn.prev').addClass('disabled');
                _scene.checkCapSize();
            } else if (idx > 1) {
                $('.btn.prev').removeClass('disabled');
            } else if (idx == this.xml.find('round').length - 1) {
                TweenMax.to('.scenario-desc', 0.35, { delay: 0.3, top: 100, autoAlpha: 1, ease: Quad.easeOut });
            }
            _scene.parallaxImage(idx);
            _scene.moveBoard(idx);
        }
    },

    checkCapSize: function() {
        if (!this.xml.find('caption').attr('class')) this.div.find('.scenario-desc').removeClass('small');
        else this.div.find('.scenario-desc').addClass(this.xml.find('caption').attr('class'));
    },

    moveBoard: function(idx) {
        TweenMax.to('.board-container', 0.65, { left: -(1000*(idx-1)), ease: Quad.easeOut, onComplete: function() {
            _scene.setNextPrev(idx);
        }});
    },

    enableNext: function() {
        this.div.find('.next').removeClass('disabled');
    },

    parallaxImage: function(idx) {
        var img = $('.img-bg'), indices = [1, 2, 3, 4];
        img.addClass('pos'+ indices[idx-1]);

        var idxOfIndices = indices.indexOf(idx);
        indices.splice(idxOfIndices, 1);
        $.each(indices, function(i,e) {
            img.removeClass('pos'+ e);
        });
    },

    setNextPrev: function(idx) {
        $('.btn.next').off('click').on('click', function(e) {
            if (!$(this).hasClass('disabled')) {
                _scene.step(idx+1);
            }
        });
        $('.btn.prev').off('click').on('click', function(e) { _scene.step(idx-1) });
    },

    showFinal: function() {
        var caption = this.xml.find('caption-changed');
        var img = this.xml.attr('img-changed');
        this.div.find('.scenario-desc').removeClass('small');

        TweenMax.to('.btn.next', 0.5, { autoAlpha: 0 });

        TweenMax.to('.board-container', 0.65, { left: -5000, ease: Quad.easeOut, onComplete: function() {
            TweenMax.set('.board-container', { autoAlpha: 0 });

            var currentImg = _scene.div.find('.img-bg');
            var newBackground = _scene.div.find('.img-bg').clone();

            currentImg.removeClass('blur');
            newBackground
                .addClass('final-bg')
                .removeClass('blur')
                .css('background-image', 'url(../../content/untitled-module/'+ img +')');

            _scene.div.append(newBackground);

            TweenMax.to(currentImg, 1, { delay: 0.75, left: -1000, ease: Quad.easeOut });
            TweenMax.to(newBackground, 1, { delay: 0.75, left: 0, ease: Quad.easeOut, onComplete: function() {
                _scene.div.find('.scenario-desc').html(caption.text());
                TweenMax.to('.scenario-desc', 0.85, { top: 100, autoAlpha: 1, ease: Quad.easeOut, onComplete: function() {
                    if (_scene.xml.attr('id') == 3) // NEEDS TO BE EQUAL TO LAST SCENE ID
                        _scene.div.find('.final-next-popup p').html('Click NEXT to move ahead with the training.');

                    TweenMax.to('.final-next-popup', 1.25, { delay: 2, marginTop: 30, autoAlpha: 1, ease: Quad.easeOut });
                    _scene.div.find('.final-next').off('click').on('click', function(e) {
                        TweenMax.set('.final-next-popup', { autoAlpha: 0, marginTop: 0 });
                        TweenMax.set('.next, .prev', { autoAlpha: 1 });
                        _scene.parent.nextScenario();
                    });
                }});
            }});

            //$('.btn.next').removeClass('disabled').off('click').on('click', function(e) { _scene.parent.nextScenario(); });
            $('.btn.prev').off('click').on('click', function(e) {
                TweenMax.to('.final-next-popup', 0.75, { marginTop: 0, autoAlpha: 0 });
                _scene.div.find('.final-next').off('click');

                TweenMax.set('.board-container', { autoAlpha: 1 });
                _scene.step(_scene.roundLength);
            });
        }});
    },

    getTemplate: function() {
        return $('.scenario-template').clone();
    },

    attach: function(target) {
        $(target).append(this.div);
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
 * Board
 */
var Board = (function(i, e, parent) {
    this.xml = $(e);
    this.parent = parent;
    this.div = $('<div class="board" id="board-'+ this.xml.attr('id') +'" />');
    this.div.css('left', (188 + (1000*i)));
    //if (i == this.parent.xml.find('round').length-1) this.div.css('left', 80 + (1000*i));
    if (i == this.parent.xml.find('round').length-1) this.div.css('left', 260 + (1000*i));

    this.currentStupidIdx = i;

    this.config();
});
Board.prototype = {
    config: function() {
        if (!this.xml.attr('end')) {
            this.div.html(this.getTemplate());
            this.createOptions();
        } else {
            this.div.addClass('end');
            this.div.html(this.getEndTemplate());
        }
    },

    createOptions: function() {
        var _board = this;
        $.each(this.xml.find('option'), function(i, e) {
            var opt = $(e);
            var li = $('<li class="opt" id="opt-'+ opt.attr('id') +'">');
            var inner = [
                '<div class="valign">',
                '   <div class="middle">'+ opt.find('label').text(),
                '       <div class="feedback">'+ opt.find('feedback').text() +'</div>',
                '   </div>',
                '</div>'
            ];

            li.html(inner.join('')).on('click', function(e) {
                _board.optClick(e);
            });

            _board.div.find('ul').append(li);
        });

        if (this.xml.find('option').length == 2) _board.div.find('ul').addClass('just-two');
    },

    optClick: function(e) {
        var clicked = $(e.currentTarget), others = this.div.find('li');

        // Add specific class to clicked to check against
        clicked.addClass('no-fade selected');

        // Loop through others and fade them out/remove click event
        $.each(others, function(i,e) {
            var li = $(e);
            li.off('click');
            if (!li.hasClass('no-fade')) TweenMax.to(li, 0.15, { autoAlpha: 0 });
        });

        // Animate the clicked box
        var _this = this;
        setTimeout(function() { _this.boxReveal(clicked) }, 100);

        // Enable next
        this.parent.enableNext();
        // console.log(this);
    },

    boxReveal: function(clicked) {
        // Get current position
        var offset = {
            top: clicked.offset().top - clicked.parent().offset().top,
            left: clicked.offset().left - clicked.parent().offset().left
        };

        // Set clicked position to current
        clicked.css({
            position: 'absolute',
            top: offset.top,
            left: offset.left
        }).addClass('remove-extra').addClass('green-header');

        // Fade out inner text
        TweenMax.to(clicked.find('.middle'), 0.15, { autoAlpha: 0, onComplete: function() {
            TweenMax.set(clicked.find('.feedback'), { autoAlpha: 1 });
        }});

        // Animate box
        var animParams = {
            top: 0, left: 0,
            width: 565, height: 216,
            backgroundColor: 'white',
            transformOrigin: 'center center center',
            ease: Quad.easeInOut,
            onComplete: function() { TweenMax.to(clicked.find('.middle'), 0.3, { autoAlpha: 1 }); }
        };
        TweenMax.to(clicked, 0.25, animParams);
    },

    getTemplate: function() {
        var head = this.xml.find('header').text();
        var length = head.split(' ').length;
        var size = (length < 30)
            ? 'font-size:24px;line-height:28px'
            : (length < 50)
                ? 'font-size:20px;line-height:22px'
                : (length < 70)
                    ? 'font-size:16px;line-height:18px'
                    : '';
        var html = [
            '<div class="inner">',
            '   <div class="header" style="'+ size +'">'+ head +'</div>',
            '   <div class="options-container">',
            '       <ul class="option-list"></ul>',
            '   </div>',
            '</div>'
        ];

        return html.join('');
    },

    getEndTemplate: function() {
        var head = this.xml.find('header').text();
        var html = [
            '<div class="inner">',
            '   <div class="header">'+ head +'</div>',
            '   <div class="end-feedback-container">',
            '       <div class="dynamic-size"><span>'+ this.xml.find('body').text() +'</span></div>',
            // '       <a class="btn conclusion-back" href="javascript:void(0)">BACK</a>',
            '       <a class="btn transform" href="javascript:void(0)">TRANSFORM</a>',
            '   </div>',
            '</div>'
        ];

        return html.join('');
    },

    attach: function(target, idx, length) {
        $(target).append(this.div);
        if (idx == 0) {
            $(target).append('<div class="circle cright" id="c'+ idx +'" style="left:'+(800 + (1000*idx))+'px"></div>');
        } else if (idx == length-1) {
            $(target).append('<div class="circle cleft" id="c'+ idx +'" style="left:'+ (248 + (1000*idx)) +'px"></div>'); /*4070*/
        } else {
            $(target).append('<div class="circle cright" id="c'+ idx +'" style="left:'+(800 + (1000*idx))+'px"></div>');
            $(target).append('<div class="circle cleft" id="c'+ idx +'" style="left:'+(179 + (1000*idx))+'px"></div>');
        }
    }
};