/**
 * Quiz
 */

var Quiz = (function(xml) {
	this.xml = xml;
	this.events = [];
	this.currentIdx = 0;
	this.colors = {
		correct: '#13b0c8',
		incorrect: '#8bc43f'
	};
	this.totalQs = 0;
	this.correctAs = 0;

	_quiz = this;
});

Quiz.prototype = {
	attach: function(el) {
		this.container = el;
	},

	addEventListener: function(evt, fn) {
		this.events[evt] = fn;
	},

	dispatchEvent: function(evt,score) {
		if (this.events[evt] != undefined) {
			this.events[evt](score);
		}
	},

	/*animateIn: function() {
		var elems = ['.question', '.answers'];
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
		var elems = ['.question', '.answers', '.feedback'];
		for (var i = 0; i < elems.length; i++) {
			TweenMax.to(elems[i], 1, {
				delay: 0.25 * i,
				ease: Power1.easeIn,
				top: 710
			});
		}
	},*/

	init: function() {
		/*TweenMax.to(this.container, 0.3, {
			autoAlpha: 1,
			onComplete: function(e) {
				_quiz.loadQuestion();
			}
		});*/
		this.totalQs = _quiz.xml.find('question').length;
		_quiz.loadQuestion();
	},

	loadQuestion: function(){
		_quiz.currData = _quiz.xml.find('question').eq(_quiz.currentIdx);
		var answers = _quiz.currData.find('answers');
		var counter = 0;
		var isMulti = _quiz.currData.attr("multiple") =="true" ? true : false;
		this.container.find('.question').html('<h1>'+ _quiz.currData.find('text').text() +'</h1>');
		this.container.find('.answers').empty();
		if(isMulti) this.container.find('.answers').addClass('multiple')
			else this.container.find('.answers').removeClass('multiple')
		answers.find('answer').each(function(){
			var answer = $('<div class="btn"></div>');
			answer.attr('id', counter);
			answer.html('<div class="valign"><div class="middle">'+$(this).text()+'</div></div>');
			answer.click(function(){
				if(_quiz.currData.attr("multiple") !="true"){
					_quiz.showFeedback($(this).attr('id'));
				}else{
					if($(this).hasClass("selected")){
						$(this).removeClass("selected")
					}else{
						$(this).addClass("selected")
					}
				}
			});

			_quiz.container.find('.answers').append(answer);
			counter ++;
		});
		var submitbutton = $('<div class="btn submit"></div>')
		submitbutton.html(_quiz.xml.find("buttons submit").text())
		submitbutton.click(function(){
					_quiz.showFeedbackMultiple();
			});
		_quiz.container.find('.answers').append(submitbutton);
		TweenMax.to(this.container, 0.3, { autoAlpha: 1 });
	},
	showFeedbackMultiple: function(){
		var selected = $(".selected")
		var feedback = this.container.find('.contentBlock').find('.feedback');
		var feedbackTxt = '';
		var next = $('<div class="btn"></div>');
		$('.answers').find('.btn').each(function(){
			$(this).unbind('click');
		});
		var id = []
		$.each(selected, function(){
			id.push($(this).attr("id"))
		})
		id.join(",")
		this.container.find('.contentBlock').css({width: '90%', height: '300px', top: '140px'});
		$('.submit').hide()
		next.html('next');
		next.click(function(){
			_quiz.currentIdx ++;
			if(_quiz.currentIdx < _quiz.xml.find('question').length){
				TweenMax.to(_quiz.container, 0.3, { autoAlpha: 0, onComplete: function(){
					TweenMax.set(feedback, { autoAlpha: 0 });
					_quiz.loadQuestion();
				}});
			}else{
				var scorePerc = (_quiz.correctAs/_quiz.totalQs)*100;
				_quiz.dispatchEvent('Complete', scorePerc);
			};
		});
		if(id.indexOf(',') == -1){
			if(_quiz.currData.attr('correct').indexOf(id) > -1){
				_quiz.correctAs++;
				feedbackTxt = _quiz.currData.find('feedback').find('correct').text();
			}else{
				feedbackTxt = _quiz.currData.find('feedback').find('incorrect').text();
			}
		}else{
			if(id == _quiz.currData.attr('correct')){
				_quiz.correctAs++;
				feedbackTxt = _quiz.currData.find('feedback').find('correct').text();
			}else{
				feedbackTxt = _quiz.currData.find('feedback').find('incorrect').text();
			}
		}
		
		feedback.html('<div class="cont">'+ feedbackTxt +'</div>');
		feedback.append(next);

		TweenMax.to(feedback, 0.3, { autoAlpha: 1 });
	},
	showFeedback: function(id){
		var feedback = this.container.find('.contentBlock').find('.feedback');
		var feedbackTxt = '';
		var next = $('<div class="btn"></div>');
		$('.answers').find('.btn').each(function(){
			$(this).unbind('click');
		});
		this.container.find('.contentBlock').css({width: '90%', height: '300px', top: '140px'});
		next.html('next');
		next.click(function(){
			_quiz.currentIdx ++;
			if(_quiz.currentIdx < _quiz.xml.find('question').length){
				TweenMax.to(_quiz.container, 0.3, { autoAlpha: 0, onComplete: function(){
					TweenMax.set(feedback, { autoAlpha: 0 });
					_quiz.loadQuestion();
				}});
			}else{
				var scorePerc = (_quiz.correctAs/_quiz.totalQs)*100;
				_quiz.dispatchEvent('Complete', scorePerc);
			};
		});
		if(id == _quiz.currData.attr('correct')){
			_quiz.correctAs++;
			feedbackTxt = _quiz.currData.find('feedback').find('correct').text();
		}else{
			feedbackTxt = _quiz.currData.find('feedback').find('incorrect').text();
		}
		feedback.html('<div class="cont">'+ feedbackTxt +'</div>');
		feedback.append(next);

		TweenMax.to(feedback, 0.3, { autoAlpha: 1 });
	}
};
