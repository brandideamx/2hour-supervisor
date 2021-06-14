/**
 * AssetLoader
 * @xmlPath {xml}
 */

function AssetLoader(xmlPath) {
	var _assetLoader = this;

	this.div = null;

	$.get(xmlPath, function(xml) {
		_assetLoader.initLoadSpace();

		var xml = $(xml);
		$.each(xml.find('asset'), function(i,e) {
			var asset = $(e);
			_assetLoader.preloadAsset(asset.text());
		});

		$.each(xml.find('dynamic'), function(i,e) {
			var dynamic = $(e);
			_assetLoader.preloadDynamic(dynamic);
		});
	});
}

AssetLoader.prototype = {
	initLoadSpace: function() {
		// Check for div
		if (!$('#preloadAssets').is('div')) {
			$('body').append('<div id="preloadAssets"></div>');
		}

		this.div = $('#preloadAssets');
		this.div.css({
			width: 0,
			height: 0,
			overflow: 'hidden'
		});
	},

	preloadAsset: function(url) {
		// Get rid of ../../
		url = this.stripUpDir(url);
		url = this.stripUpDir(url);

		// Assume img. Add new media types in future
		var asset = $('<div />');
		asset.css({
			width: 0,
			height: 0,
			background: 'url('+ url +')'
		});

		// Add image to DOM
		this.div.append(asset);
	},

	preloadDynamic: function(xml) {
		var _assetLoader = this;
		var xmlPath = xml.attr('url');
		var selector = xml.find('selector');
		$.get(xmlPath, function(xml) {
			selector.each(function(i,e) {
				var sel = $(e);
				var assets = xml.find(sel.text());
				assets.each(function(i,e) {
					var asset = $(e);
					_assetLoader.preloadAsset(asset.text());
				});
			});
		}
	},

	stripUpDir: function(url) {
		return (url.substring(0,3) == '../')
			? url.substr(3)
			: url;
	}
};