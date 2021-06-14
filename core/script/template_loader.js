function TemplateLoader(){
	this.templates = [];
	this.templates.onLoad = null;
}
TemplateLoader.prototype.addTemplate = function(url){
	var _me = this;
	var template = new LoadedTemplate(url);
	this.templates.push(template);
	template.addCallback(function(){
		_me.templateLoaded();
	});
}
TemplateLoader.prototype.get = function(id){
	for(var i = 0; i<this.templates.length; i++){
		if(i == id){
			return this.templates[i].data;
		}
		if(id == this.templates[i].url){
			return this.templates[i].data;
		}
	}
	return 'Template not found.';
}
TemplateLoader.prototype.templateLoaded = function(){
	var loadDone = true;
	for(var i = 0; i<this.templates.length; i++){
		if(!this.templates[i].loaded){
			loadDone = false;
		}
	}	
	if(loadDone){
		if(this.onLoad){	
			this.onLoad();
		}
	}
}




function LoadedTemplate(url){
	var _me = this;

	this.url = url;
	this.loaded = false;
	this.data = null;
	this.callback = null;

	$.get('includes/'+url+'.html', function(data){
		_me.onLoad(data);
	})
}
LoadedTemplate.prototype.addCallback = function(fn){
	this.callback = fn;
}
LoadedTemplate.prototype.onLoad = function(data){
	this.data = data;
	this.loaded = true;
	if(this.callback){
		this.callback();
	}
}