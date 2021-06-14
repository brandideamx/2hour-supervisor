/**
 * AudioPlayer
 * @rootFolder {str}
 * @id {num}
 */

function AudioPlayer(rootFolder, id) {
	id = id || '';
	this.name = '';
	this.rootFolder = rootFolder || '';

	this.div;
	this.watcher;
	this.onComplete;

	this.volume = 1;
	this.events = [];
	this.isPlaying = false;
	this.controller = new AudioController(this);

	this.setupDebug();
	this.setupControls(id);
}

AudioPlayer.prototype = {
	setupDebug: function() {
		var _audioPlayer = this;
		this.debug = $('<div id="audioDebug" />');
		this.debug.html('Audio Playing...');
		this.debug.on('click', function(e) {
			_audioPlayer.audioEnded();
		}).css('display', 'none');
	},

	setupControls: function(id) {
		this.div = $('<audio controls id="audioPlayer'+ id +'" />');
		this.div = this.div[0];

		$('body').append(this.div);
	},

	addEventListener: function(e, callback) {
		this.events.push({
			event: e,
			fn: callback
		});
	},

	dispatchEvent: function(e) {
		var _audioPlayer = this;
		$.each(this.events, function(i,el) {
			if (el.event == e)
				el.fn(_audioPlayer);
		});
	},

	queueFile: function(url) {
		//this.div.src = this.rootFolder +'content/audio/'+ url;
		this.div.src = url;
	},

	url: function() {
		return this.div.src;
	},

	play: function(url, events, offset) {
		var _audioPlayer = this;

		// Set isPlaying to true
		this.isPlaying = true;

		// Check offset
		offset = offset || 0;

		// Set volume
		this.setVolume(this.volume);
		this.onComplete = null;

		// The URL
		var audio_id = url;
		if (this.div.src != audio_id) {
			this.queueFile(audio_id);
		}

		// Play based on offset
		if (offset === 0) {
			_audioPlayer.div.play();
		} else {
			// Bind loadeddata
			$(_audioPlayer.div).on('loadeddata', function() {
				_audioPlayer.div.currentTime = offset;
				_audioPlayer.div.play();

				// Unbind loadeddata
				$(_audioPlayer.div).unbind('on');
			});
		}

		// Set debug to visible
		this.debug.css('display', 'block');

		// Events
		this.timedEvents = [];
		$(_audioPlayer.div).unbind().on('ended', function(e) {
			_audioPlayer.audioEnded();
		});

		for (var p in events) {
			// Complete event
			if (p == 'complete') {
				_audioPlayer.onComplete = events[p];
			} else {
				_audioPlayer.timedEvents.push({
					time: p,
					event: events[p],
					fired: false
				});
			}
		}

		// Set up watcher
		this.watcher = setInterval(function() {
			_audioPlayer.watchAudioTimer();
		}, 33);
		this.watchAudioTimer();
	},

	watchAudioTimer: function() {
		var t = this.div.currentTime;
		for (var i = 0; i < this.timedEvents.length; i++) {
			if (t > this.timedEvents[i].time && !this.timedEvents[i].fired) {
				this.timedEvents[i].fired = true;
				this.timedEvents[i].event();
			}
		}
	},

	audioEnded: function() {
		this.debug.css('display', 'none');
		this.dispatchEvent('End');
		this.pause();
		this.isPlaying = false;

		try { this.div.remove(); }
		catch (err) { $(this.div).remove(); }

		if (this.onComplete != null) this.onComplete();
	},

	pause: function() {
		try { this.div.pause(); }
		catch (err) {}

		this.isPlaying = false;
	},

	resume: function() {
		this.div.play();
		this.div.isPlaying = false; // Not sure why it's false
	},

	reset: function() {
		this.pause();
		this.isPlaying = false;
	},

	seek: function(n) {
		this.div.currentTime = n;
	},

	seekPercent: function(p) {
		this.div.currentTime = p * this.div.duration;
	},

	setVolume: function(n) {
		this.volume = n;
		try { this.div.volume = n }
		catch (err) {}
	},

	getProgress: function() {
		return {
			time: this.div.currentTime,
			percent: this.div.currentTime / this.div.duration
		}
	}
};

function AudioController(player, width) {
	this.name = '';

	this.player = player;
	this.hasPlayed = false;
	this.div = $('<div class="audioController"></div>');
	this.track = $('<div class="track"></div>');
	
	this.div.append(this.track);
	this.playButton = $('<div class="playButton"></div>');
	this.div.append(this.playButton);
	this.scrubber = $('<div class="scrubber"></div>');
	this.div.append(this.scrubber);
	this.volume = $('<div class="volume"><div class="fill"></div></div>');
	this.div.append(this.volume);

	_me = this;
	this.watcher = this.watchPlayback();
	this.playButton.click(function(){
		if(!$(this).hasClass('pause')){
			_me.player.resume();
			$(this).addClass('pause');
		}else{
			$(this).removeClass('pause');
			_me.player.pause();
		}
	})
	this.player.addEventListener('End', function(){
		_me.player.seek(0);
		_me.playButton.removeClass('pause');
	});
	this.volume.click(function(e){
		var mouseX = e.pageX - $(this).offset().left;
		var p = mouseX / $(this).width();
		$(this).find('.fill').css('width', Math.round(p*100) + '%');
		_me.player.setVolume(p);
	})
}

AudioController.prototype.attach= function(div, width){
	// console.log('attach to ');
	// console.log(div);
	// console.log(width);
	if(width == '' || width == undefined){
		width = 367;
	}
	this.trackRight = width - 64;

	this.trackLeft = 38;
	this.trackWidth = this.trackRight - this.trackLeft; 
	this.track.css({'width':this.trackRight - this.trackLeft + 'px',
					'left':this.trackLeft +12+ 'px'});
	this.scrubber.css('left', this.trackLeft);
	this.div.css('width', width);

	div.append(this.div);
	var _me = this;
	this.scrubber.draggable({
		axis:'x',
		containment:[this.div.offset().left + this.trackLeft, 0, this.div.offset().left + this.trackRight, 10],
		start:function(){
			_me.player.pause();
			clearInterval(_me.watcher);
		},
		'drag':function(){
			// drag?

		},
		stop:function(){
			var p = ($(this).position().left - _me.trackLeft)/_me.trackWidth;
			_me.player.seekPercent(p)
			if(_me.playButton.hasClass('pause')){
				_me.player.resume();
			}
			_me.watcher = _me.watchPlayback();
		}
	})
}
AudioController.prototype.watchPlayback = function(){
	var _me = this;
	var intID = setInterval(function(){
		var prog = _me.player.getProgress();
		if(prog.time > 0){
			_me.hasPlayed = true;
		}
		_me.scrubber.css('left', _me.trackLeft + _me.trackWidth*prog.percent);
	}, 33);
	return intID;
}