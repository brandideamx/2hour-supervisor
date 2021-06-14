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

	setBody: function(str) {
		this.container.find('.body').html(str);
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
		TweenMax.set('.btn.next', { autoAlpha: 0 });
		TweenMax.to('.examples-container', 0.3, { autoAlpha: 1 });

		$('.example').remove();
		
		this.setHeader(this.xml.find('header').text());
		this.setBody(this.xml.find('body').text());
		this.setInstructions(this.xml.find('instructions').text());

		TweenMax.to(this.container, 0.3, { autoAlpha: 1 });

        // console.log("about to placing objects");
		this.placeObjects();
	},

	placeObjects: function() {
		var _clickReveal = this;
		var counter = 0;

		$.each(this.xml.find('example'), function(i,e) {
			counter++;
		});
		$.each(this.xml.find('example'), function(i,e) {
			// console.log(i + " | " + e);
			_clickReveal.buildThumbnail(i, e, counter);
		});
	},

	buildThumbnail: function(i, node, counter) {
		var _clickReveal = this;
		var node = $(node);
		var example = $('<div class="example" />');
		if (node.attr('class') == 'long') example.addClass('long');

		if(counter == 7){
			offset = (node.attr('class') == 'long') ? 30 : 13;
		}else if(counter == 6){
			offset = (node.attr('class') == 'long') ? 30 : 76;
		}

		example.html('<p class="example-column-label">' + node.find('label').text() + '</p>');
		example.addClass("long");
		example.on('click', function(e) {
			$('.example').removeClass('selected');
			$(e.currentTarget).addClass('selected').addClass('seen');
			_clickReveal.showFeedback(node.find('feedback-title').text(), node.find('feedback-body').text());
		});
		// console.log("thumbnail built | " + node.find('img').attr('src'));
		$('#examples-column-left').append(example);
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