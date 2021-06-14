/**
 * Click Reveal Model
 */

var ClickReveal = (function(xml) {
	this.xml = $(xml);
	this.container;
	this.viewed = 0;
	this.events = [];
});

ClickReveal.prototype = {
	attach: function(el) {
		this.container = el;
	},

	setHeader: function(str) {
		this.container.find('.header').html(str);
	},

	setInstructions: function(str) {
		this.container.find('.instructions').html(str);
	},

	addEventListener: function(evt, fn) {
		this.events[evt] = fn;
	},

	dispatchEvent: function(evt) {
		if (this.events[evt] != undefined) {
			this.events[evt]();
		}
	},

	init: function() {
		_shell.hideLoader();
		TweenMax.set('.btn.next', { autoAlpha: 0 });
		TweenMax.to('.examples-container', 0.3, { autoAlpha: 1 });

		$('.example').remove();

		this.setHeader(this.xml.find('header').text());
		this.setInstructions(this.xml.find('instructions').text());

		TweenMax.to(this.container, 0.3, { autoAlpha: 1 });
		this.placeObjects();
	},

	placeObjects: function() {
		var _clickReveal = this;
		$.each(this.xml.find('example'), function(i,e) {
			_clickReveal.buildThumbnail(i, e);
		});
	},

	buildThumbnail: function(i, node) {
		var _clickReveal = this;
		var node = $(node);
		var example = $('<div class="example" />');
		if (node.attr('class') == 'long') example.addClass('long');
		offset = (node.attr('class') == 'long') ? 30 : 13;
		w = (node.attr('class') == 'long') ? 225 : 138;
		example.css({ left: (offset + (w * i)) });
		example.html('<img src="'
			+ '../../content/bullying/img/'
			+ node.find('img').attr('src') +'">');
		example.on('click', function(e) {
			$('.example').removeClass('selected');
			$(e.currentTarget).addClass('selected').addClass('seen');
			_clickReveal.showFeedback(node.find('label').text(), node.find('feedback').text());
		});
		this.container.append(example);
	},

	showFeedback: function(label, feedback) {
		var _clickReveal = this;
		var feedbackBox = $('.examples-feedback');
		feedbackBox.find('.title').html(label);
		feedbackBox.find('.copy').html(feedback);

		TweenMax.to(feedbackBox, 0.3, { autoAlpha: 1 });

		if ($('.seen').length == $('.example').length) {
			$('.btn.next').html(this.xml.find('next').text())
				.on('click', function() {
					_clickReveal.dispatchEvent('Complete');
				});

			TweenMax.to('.btn.next', 0.3, { autoAlpha: 1 });
		}
	}
};