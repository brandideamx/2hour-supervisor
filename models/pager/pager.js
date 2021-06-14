/**
 * PagerModel
 */

var PagerModel = (function() {
	this.data; // xml
	this.pages;
	this.bgs = [];
	this.currentPage;
	this.poll = this.pollForContent();
});

PagerModel.prototype = {
	pollForContent: function() {
		return setInterval(this.pollCheck, 500);
	},

	pollCheck: function() {
		if (typeof _shell !== 'undefined' && _shell !== undefined) {
            clearInterval(_pager.poll);
            if (typeof _loadedData !== 'undefined' && _loadedData !== undefined) {
                // console.log('| _loadedData is set');
                _pager.config(_loadedData);
            } else {
                // console.log('| Trying again...');
                _shell.tryGetData(function(data) {
                    _pager.config(data);
                });
            }
        }
	},

	config: function(data) {
		_shell.hideLoader();
		log('-- Pager Location: models/pager/pager.js');
		this.data = $(data);
		this.root = this.data.find('contentRoot').text();
		this.pager = new Pager(this.data.find('pager'), this.root);

		this.pager.attach($('#pager'));
		this.pager.setButtonText(this.data.find('buttons next').text());
		this.pager.addEventListener('Complete', function() {
			_shell.activityComplete();
			_shell.nextSection();
		});
	}
};

var _pager = new PagerModel();