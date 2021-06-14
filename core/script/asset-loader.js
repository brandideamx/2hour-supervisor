/**
 * Asset Loader
 */

function AssetLoader(xmlPath) {
	var _this = this;
	this.div = null;

	$.get(xmlPath, function(data) {
		_this.initLoadSpace();

		data = $(data);
		data
			.find('asset').each(function() {
				_this.preloadAsset($(this).text());
			})
			.find('dynamic').each(function() {
				_this.preloadDynamic($(this));
			});

		//console.log('AssetLoader Div::'+ _this.div);
	});
}

AssetLoader.prototype = {
	initLoadSpace: function() {
		var preloadAssets = $('#preloadAssets');
		if (preloadAssets.length == 0) {
			$('body').append('<div id="preloadAssets" />');
		}

		this.div = preloadAssets;
		this.div.css({
			width: 0,
			height: 0,
			overflow: 'hidden'
		});
	},

	preloadAsset: function(url) {
		url = this.strip_updir(url);
		url = this.strip_updir(url);

		var asset = $('<div />');
		asset.css({
			width: 0,
			height: 0,
			background: 'url('+ url +') no-repeat'
		});
		this.div.append(asset);
	},

	preloadDynamic: function(xml) {
		var _this = this;
		var xmlPath = $(xml).attr('url');
		var sel = $(xml).find('selector');

		$.get(xmlPath, function(data) {
			sel.each(function() {
				var assets = $(data).find($(this).text());
				assets.each(function() {
					_this.preloadAsset($(this).text());
				});
			});
		})
	},

	strip_updir: function(url) {
		return (url.substring(0,3) == '../') ? url.substr(3) : url;
	}
};