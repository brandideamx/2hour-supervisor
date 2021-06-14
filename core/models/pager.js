/**
 * Pager
 */

var Pager = (function(data, root) {
	this.pages;
	this.currentPage;
	this.currentBackground;

	this.bgs = [];
	this.events = [];
	this.pageCache = {};
	this.accordions = {};

	this.data = $(data);
	this.root = root;
	this.disabled = false;
	this.pages = this.data.find('page');
	this.div = this.buildEmptyMarkup();

	this.init();
});

Pager.prototype = {

	init: function() {
		// console.log('-- Pager Location: core/models/pager.js');
		var _me = this;
		for (var i = 0; i < this.pages.length; i++) {
			var $p = $(this.pages[i]);
			var bgObj;

		    if ($p.attr('background').toUpperCase() != 'SAME') {
		        var bg = $('<img class="bg" src="' + this.root + $p.attr('background') + '">');
		        this.div.find('.backgrounds').append(bg);
		        bgObj = { div: bg, options: $p.find('background') };
		    } else {
		        bgObj = { div: null, options: $p.find('background') };
		    }
		    this.bgs.push(bgObj);

		    if ($p.attr('html') != undefined) {
		        this.pageCache[$p.attr('html')] = new PagerExternalPage($p.attr('html'), this.root, _me, i);
		    }
		}

		this.div.find('.contentBlock .next').click(function() {
		    if (!$(this).hasClass('disabled')) {
		        _me.nextPage();
		    }
		});

		this.div.delegate('.contentBlock .tryagain', 'click', function() {
			_me.dispatchEvent('TryAgain');
		});

		TweenMax.set(this.div.find('.contentBlock .btn.tryagain'), { autoAlpha: 0 });
		TweenMax.delayedCall(1, function() {
		    _me.showPage(0, true);
		});
	},

	setButtonText: function(txt) {
		var next = $('.pagerWidget .contentBlock .next');
		next.html(txt);
	},

	buildEmptyMarkup: function() {
		var markup = '<div class="pagerWidget">'
				   + '	<div class="backgrounds"></div>'
				   + '	<div class="contentBlock">'
				   + '		<div class="text">'
				   + '			<div class="header"></div>'
				   + '			<div class="body"></div>'
				   + '		</div>'
				   // + '		<div class="btn tryagain"></div>'
				   + '		<div class="btn next" id="thenextbutton"></div>'
				   + '	</div>'
				   + '</div>';

		return $(markup);
	},

	showPage: function(n, snap) {
		if (n == this.pages.length) {
			this.dispatchEvent('Complete');
		} else {
			window.parent.setJiraItem('Slide '+ (n+1));

			this.currentPage = n;
			this.showBackground(n);

			var _me = this, pg = $(this.pages[n]);
			var contentBlock = $('.contentBlock'),
				header = $('.contentBlock .header'),
				text = $('.contentBlock .text'),
				body = $('.contentBlock .body'),
				next = $('.contentBlock .next');

			body.attr('id', 'page-'+ n);

			if (snap) {
				contentBlock.css({
					top: pg.attr('y') +'px',
					left: pg.attr('x') +'px'
				});

				contentBlock.css('width', pg.attr('width') - 144);
				text.css('width', pg.attr('width') - 144);
				header.html(pg.find('header').text());

				if (pg.attr('html') == undefined) {
					//body.wrap('<div id="contents"></div>');
					body.html(pg.find('body').text());
				} else {
					body.html(this.pageCache[pg.attr('html')].html);
				}

				if (!$('.contentBlock #contents').is('div')) {
					contentBlock.css('height', text.height());
				} else {
					contentBlock.css('height', $('.contentBlock #contents').height());
				}
				$('.green').attr('style', 'top:'+ ($('.contentBlock #contents').height() + 80) +'px');
				if (pg.attr('nextX') == undefined) {
					next.css('left', (contentBlock.width() - next.width()) / 2 + 42);
				} else {
					next.css('left', pg.attr('nextX') +'px');
				}
			} else {
				var newWidth = pg.attr('width') - 144;
				next.addClass('disabled');

				TweenMax.to(text, 0.3, { alpha: 0, onComplete: function() {
					text.css('width', newWidth +'px');
					header.html(pg.find('header').text());

					if (pg.attr('html') == undefined) {
						body.html(pg.find('body').text());
					} else {
						body.html(_me.pageCache[pg.attr('html')].html);
					}

					var h = 0;
					if (!$('.contentBlock #contents').is('div')) {
						h = contentBlock.css('height', text.height());
					} else {
						h = contentBlock.css('height', $('.contentBlock #contents').height());
					}
					TweenMax.to(contentBlock, 0.5, {
						left: pg.attr('x'),
						top: pg.attr('y'),
						width: newWidth,
						height: contentBlock.css('height', h),
						onComplete: function() {
							TweenMax.to(text, 0.5, { alpha: 1 });
							if (!_me.disabled) next.removeClass('disabled');
							$('.green').attr('style', 'top:'+ ($('.contentBlock #contents').height() + 80) +'px');
						}
					});

					if (pg.attr('nextX') == undefined) {
						TweenMax.to(next, 0.5, { left: (newWidth - next.width()) / 2 + 42 });
					} else {
						TweenMax.to(next, 0.5, { left: pg.attr('nextX') +'px' });
					}
				}});
			}

			this.pageGate();
		}
	},

	pageGate: function() {
		var _me = this;
		var count = this.accordions['page'+ this.currentPage];
		if (count != undefined && count > 0) {
			_me.disable();
			$('.contentBlock').delegate('.accordion-head', 'click', function(e) {
				$(e.currentTarget).addClass('clicked');
				if (count == $('.contentBlock .accordion-head.clicked').length) {
			        _me.enable();
				}
			});
		}
	},

	disable: function() {
		$('.contentBlock .next').addClass('disabled');
		this.disabled = true;
	},

	enable: function() {
		$('.contentBlock .next').removeClass('disabled');
		this.disabled = false;
	},

	nextPage: function() {
		this.showPage(this.currentPage+1);
	},

	prevPage: function() { return false; },
	updateCounter: function() { return false; },

	showBackground: function(n) {
		var bg = this.bgs[n];
		if (bg.div != null) {
		    if (this.currentBackground != null) {
		        TweenMax.to(this.currentBackground, 0.5, {
		            alpha: 0
		        });
		    }
		    this.currentBackground = bg.div;
		}
		if (bg.options.length > 0) {
		    this.animateBackground(bg.options);
		}
		TweenMax.to(this.currentBackground, 0.5, { overwrite: false, alpha: 1 });
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
			_shell.jiraLocation('Page ' + (Number(this.currentPage)+1));
		} catch(e) {}
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

	noBack: function() { return false; },
	noNext: function() { return false; },

	setAccordionCount: function(n, idx) {
		this.accordions['page'+idx] = n;
	}
};

function PagerExternalPage(url, root, _pager, idx) {
    this.loaded = false;
    this.callback = null;
    this.html = null;
    var _me = this;
    $.get(root + url, function(html) {
        _me.html = html;
        _me.loaded = true;
        if (_me.callback != null) {
            _me.callback();
        }

        _pager.setAccordionCount($(html).find('.accordion').length, idx);
    });
}
