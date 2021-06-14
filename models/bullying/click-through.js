/**
 * ClickThrough
 */

var ClickThrough = (function(xml) {
	this.xml = xml;
	this.events = [];
	this.currentIdx = 0;
	this.currentScene;
    this.currentOpt;
	this.colors = {
		correct: '#13b0c8',
		incorrect: '#8bc43f'
	};

	_clickThrough = this;
});

ClickThrough.prototype = {
	attach: function(el) {
		this.container = el;
	},

	addEventListener: function(evt, fn) {
		this.events[evt] = fn;
	},

	dispatchEvent: function(evt) {
		if (this.events[evt] != undefined) {
			this.events[evt]();
		}
	},

	animateIn: function() {
		var elems = ['.content', '.instructions', '.media'];
		var pos = [476, 430, 0];
		for (var i = 0; i < elems.length; i++) {
			TweenMax.to(elems[i], 1, {
				delay: 0.25 * i,
				ease: Power1.easeOut,
				top: pos[i]
			});
		}
	},

	animateOut: function() {
		var elems = ['.media', '.instructions', '.content'];
		for (var i = 0; i < elems.length; i++) {
			TweenMax.to(elems[i], 1, {
				delay: 0.25 * i,
				ease: Power1.easeIn,
				top: 710
			});
		}
	},

	init: function() {
		_shell.hideLoader();
		$media = $('.media'),
		$content = $('.content'),
		$inst = $('.instructions');

		TweenMax.to(this.container, 0.3, {
			autoAlpha: 1,
			onComplete: function(e) {
				_clickThrough.goToScene(_clickThrough.currentIdx);
			}
		});
	},

	next: function() {
		_clickThrough.animateOut();
		_clickThrough.currentIdx++;

		if (_clickThrough.currentIdx < _clickThrough.xml.find('scenario').length) {
			$media.empty().removeClass('email').removeClass('image');
			$inst.empty();
			$content.empty().removeClass('is-feedback').removeClass('correct');
			setTimeout(function() {
				_clickThrough.goToScene(_clickThrough.currentIdx);
			}, 2000);
		} else {
			_clickThrough.dispatchEvent('Complete');
		}
	},

	goToScene: function(idx) {
		log('goToScene('+ idx +')');
		var dir = '../../content/bullying/img/';
		var sceneXML = $(this.xml.find('scenario')[idx]);

		$inst.html('<p>'+ sceneXML.find('instructions').text() +'</p>');
		$media.css({ backgroundImage: 'url('+ dir + sceneXML.find('img').attr('src') +')' });

		this.currentScene = sceneXML;
		this.buildByType(sceneXML.find('content').attr('type'));
	},

	buildByType: function(type) {
		$content.on('click', '.close', function(e) {
			_clickThrough.resetContent('initial');
		});

		if (type == 'email') this.buildEmail();
		else this.buildImage();

		this.animateIn();
	},

	buildEmail: function() {
		var $email = {
			to: $('<div class="to" />'),
			cc: $('<div class="cc" />'),
			sub: $('<div class="subject" />'),
			body: $('<div class="body" />')
		};

		$.each($email, function(i,e) {
			var c = _clickThrough.currentScene.find('content');
			e.html(c.find(e.attr('class')).text());

			$media.append(e);
		});

		$media.addClass(_clickThrough.currentScene.find('content').attr('type'));

		// Bind option click handles
		this.container.on('click', '.option', function(e) {
			_clickThrough.optionClickHandle(e);
		});

		this.initialQuestion();
	},

	buildImage: function() {
		$media.addClass(_clickThrough.currentScene.find('content').attr('type'));
		$.each(this.currentScene.find('content feedback'), function(i,e) {
			var hotspot = $(e);

			if (hotspot.attr('id') != 'yes') {
				var el = $('<div class="option" />');
				el.css({
					width: hotspot.attr('w'),
					height: hotspot.attr('h'),
					top: hotspot.attr('y') +'px',
					left: hotspot.attr('x') +'px',
					backgroundColor: 'rgba(0,100,0,0.3)'
				});
				el.attr('id', hotspot.attr('id'));
				el.on('click', function(e) {
					_clickThrough.optionClickHandle(e);
				});

				$media.append(el);
			} else {
				$('.content').unbind('click').on('click', '.btn#yes', function(e) {
					_clickThrough.currentOpt = hotspot;
					if (hotspot.attr('correct') == 'true')
						_clickThrough.imgOptionClickHandle(e);
					else
						_clickThrough.optionClickHandle(e);
				});
			}
		});
		this.initialQuestion();
	},

	optionClickHandle: function(e) {
		log('optionClickHandle()');
		var opt = $(e.currentTarget);
		if (opt.parent().hasClass('disabled')) {
			// console.log('Disabled.');
		} else {

			_clickThrough.currentOpt = _clickThrough.currentScene.find('feedback#'+ opt.attr('id'));

			var color = (_clickThrough.currentOpt.attr('correct') == 'true')
			? _clickThrough.colors.correct
			: _clickThrough.colors.incorrect;

			log('Opt', opt);
			opt.css({
				color: 'white',
				backgroundColor: color
			});

			_clickThrough.showInitialFeedback();
			_clickThrough.toggleBg();

			opt.parent().addClass('disabled');
		}
	},

	imgOptionClickHandle: function(e) {
		log('imgOptionClickHandle()');
		var opt = $(e.currentTarget);
		if (opt.parent().hasClass('disabled')) {
			// console.log('Disabled.');
		} else {
			_clickThrough.currentOpt = _clickThrough.currentScene.find('feedback#'+ opt.attr('id'));

			var color = (_clickThrough.currentOpt.attr('correct') == 'true')
				? _clickThrough.colors.correct
				: _clickThrough.colors.incorrect;

			log('Opt', opt);
			opt.css({
				color: 'white',
				backgroundColor: color
			});

			_clickThrough.firstStageCorrect();
			_clickThrough.toggleBg();

			opt.parent().addClass('disabled');
		}
	},

	initialQuestion: function() {
		$('.disabled').removeClass('disabled')
		$(".instructions").show();
		log('initialQuestion()');
		var html = '<div class="question">'
			+ 	this.currentScene.find('question').text()
			+ '</div>'
			+ '<div class="btn option" id="'+ this.currentScene.find('mainbtn').text().toLowerCase() +'">'
			+ 	this.currentScene.find('mainbtn').text()
			+ '</div>';

		$content.html(html);
	},

	firstStageFeedback: function() {
		var feedback = this.currentOpt;
		var html = '<div class="close alpha-off">X</div>'
			+ '<div class="question">'
			+ 	feedback.find('label').text()
			+ '</div>'
			+ '<div class="description">'
			+ 	feedback.find('description').text()
			+ '</div>'
			+ '<div class="btn option tryagain" id="tryagain">'
			+ 	feedback.find('option').text()
			+ '</div>';

		$content.html(html);
		$content.find('.tryagain').on('click', function(e) {
			_clickThrough.resetContent('initial');
		});
	},

	firstStageCorrect: function() {
		$(".instructions").hide();
		$(".option").hide();
		var feedback = this.currentOpt;
		var html = '<div class="close alpha-off">X</div>'
			+ '<div class="question">'
			+ 	feedback.find('label').text()
			+ '</div>'
			+ '<div class="description">'
			+ 	feedback.find('description').text()
			+ '</div>'
			+ '<div class="btn option next" id="next">'
			+ 	feedback.find('option').text()
			+ '</div>';

		$content.html(html);
		$content.find('.btn.next').on('click', function(e) {
			_clickThrough.next();
		});
	},

	secondStageOptions: function() {
		log('secondStageOptions()');
		var feedback = this.currentOpt;
		var html = '<div class="close alpha-off">X</div>'
			+ '<div class="question">'
			+ 	feedback.find('label').text()
			+ '</div>'
			+ '<div class="description">'
			+ 	feedback.find('description').text()
			+ '</div>';

		$content.html(html);

		for (var i = 0; i < feedback.find('option').length; i++) {
			var opt = $(feedback.find('option')[i]);
			var el = $('<div class="btn opt'+ (i+1) +' one-third alpha-off" />')
				.attr('id', i)
				.html('<div class="table"><div class="table-cell">'+ opt.find('btn').text() +'</div></div>');

			el.on('click', function(e) {
				var opt = $(feedback.find('option')[$(e.currentTarget).attr('id')]);
				_clickThrough.finalFeedback(opt);
			});

			$content.append(el);
		}

		TweenMax.to('.one-third', 0.3, { autoAlpha: 1, delay: 0.75 });
	},

	finalFeedback: function(opt) {
		var html = '<div class="close alpha-off">X</div>'
			+ '<div class="question">'
			+ 	opt.find('btn').text()
			+ '</div>'
			+ '<div class="description">'
			+ 	opt.find('final').text()
			+ '</div>';

		if (opt.attr('correct') == 'false') {
			html += '<div class="btn option tryagain" id="tryagain">'
			+ 	this.xml.find('tryagain').text()
			+ '</div>';
		} else {
			html += '<div class="btn option show-changes">'
			+ this.xml.find('changes').text()
			+ '</div>';
		}

		$content.html(html);
		$content.find('.tryagain').on('click', function(e) {
			_clickThrough.resetContent('secondary');
		});
		$content.find('.show-changes').on('click', function(e) {
			_clickThrough.revealChanges();
		});
	},

	resetContent: function(stage) {
		log('resetContent('+ stage +')');
		if (stage == 'initial') {
			this.initialQuestion('shit');
			this.container.on('click', '.option', function(e) {
				_clickThrough.optionClickHandle(e);
			});

			this.toggleBg();
		} else {
			this.secondStageOptions();
		}
	},

	toggleBg: function() {
		var correct = this.currentOpt.attr('correct');
		log('toggleBG', ($content.hasClass('is-feedback')));
		if ($content.hasClass('is-feedback')) {
			$content.removeClass('is-feedback');

			// Animate out close btn
			TweenMax.to('.content .close', 0.5, {
				autoAlpha: 0,
				ease: Power1.easeOut
			});

			// Animate content div
			TweenMax.to($content, 0.3, {
				top: 476,
				height: 224,
				ease: Power1.easeInOut,
				backgroundColor: _clickThrough.colors.correct
			});
		} else {
			$content.addClass('is-feedback');
			if (correct == 'true') $content.addClass('correct');

			// Animate in close btn
			TweenMax.to('.content .close', 0.5, {
				autoAlpha: 1,
				ease: Power1.easeOut
			});

			// Animate content div
			TweenMax.to($content, 0.3, {
				top: 430,
				height: 273,
				ease: Power1.easeInOut,
				backgroundColor: (correct == 'true')
					? _clickThrough.colors.correct
					: _clickThrough.colors.incorrect
			});
		}
	},

	showInitialFeedback: function() {
		log('showInitialFeedback()');

		// Disable option clicking
		this.container.off('click', '.option');

		var feedback = this.currentOpt;
		if (feedback.attr('correct') == 'true') {
			if (feedback.find('option').length > 1) {
				this.secondStageOptions();
			} else {
				this.firstStageCorrect();
			}
		} else {
			this.firstStageFeedback();
		}
	},

	revealChanges: function() {
		$('.body').html(this.currentScene.find('content glorified').text());
		TweenMax.to('.email .option', 0.3, { backgroundColor: 'transparent', color: '#454545' });
		TweenMax.to('.glorified', 0.3, { autoAlpha: 0 });
		TweenMax.to('.show-changes', 0.3, { autoAlpha: 0, onComplete: function() {
			$('.show-changes').remove();
		} });

		if (this.currentScene.find('content').attr('type') == 'image') {
			var dir = '../../content/bullying/img/';
			var newImg = this.currentScene.find('glorified').attr('src');
			$media.css({ backgroundImage: 'url('+ dir + newImg +')' });
		}

		log(this.xml);
		var html = '<div class="btn option next">'
			+ this.xml.find('next').text()
			+ '</div>';

		$content.append(html);
		$content.find('.btn.next').on('click', function(e) {
			_clickThrough.next();
		});

		//fixes choppy button fix
		TweenMax.to('.btn.option.next', 0.0, {
				top: 0,
				autoAlpha: 0,
				ease: Power1.easeOut
			});

		setTimeout(function(){
			 TweenMax.to('.btn.option.next', 0.3, {
					top: 0,
					autoAlpha: 1,
					ease: Power1.easeOut
				});
		}, 1000);
	}
};