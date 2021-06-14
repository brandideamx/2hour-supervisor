$('.next').css({
  top: 610,
  bottom: 'auto'
}).on('click', function() {
  $('.next').attr('style', '');
}).hide();
var btnLeft = $('.slider_controls--arrow-left'),
  btnRight = $('.slider_controls--arrow-right'),
  positionIdx = 0,
  slides = $('.slide:visible');

if (slides.length > 1) {
  $.each(slides, function(idx, el) {
    var slide = $(el);
    slide.css({ left: (935 * idx) + 'px' });

    var slideIndicator = $('<div />');
    slideIndicator.addClass('slider_controls--dots-container__dot');

    $('.slider_controls--dots-container').append(slideIndicator);
  });

  btnLeft.prop('disabled', true);
  updateDots(0);
} else {
  $(slides[0]).css({ left: '0px'});
  btnLeft.hide();
  btnRight.hide();
  $('.next').show();
}

function updateDots(idx) {
  $('.current').removeClass('current');
  $('.slider_controls--dots-container__dot').eq(idx).addClass('current viewed');
}

function tweenSlides(offset, direction) {
  var allAnimated = false;
  $.each(slides, function(idx, el) {
    var currentPosition = parseFloat($(el).css('left')),
      nextPosition = currentPosition + offset;

    if (!TweenMax.isTweening(el)) {
      TweenMax.to(el, 1.2, {
        overwrite: false,
        left: nextPosition,
        ease: Power4.easeInOut,
        onComplete: function() {
          if (idx === slides.length - 1) {
            allAnimated = true;
          }
        }
      });
    }
  });

  var animationWatcher = setInterval(function() {

    if (allAnimated) {
      if (direction === 'left') positionIdx--;
      else if (direction === 'right') positionIdx++;

      updateDots(positionIdx);
      clearInterval(animationWatcher);
    }
  }, 10);
}

btnLeft.on('click', function(e) {
  if (positionIdx === 1) btnLeft.prop('disabled', true);
  if (positionIdx === 0) return false;

  btnRight.removeClass('complete');
  tweenSlides(935, 'left');
});
btnRight.on('click', function(e) {
  if (positionIdx === slides.length - 2) {
    btnRight.addClass('complete');
    $('.next').show();
  }
  if (positionIdx === slides.length - 1) return false;
  btnLeft.prop('disabled', false);
  tweenSlides(-935, 'right');
});