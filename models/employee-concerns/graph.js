function Graph(c, points) {
    this.hotSpots = [];
    this.container = c;
    this.width = c.width();
    this.height = c.height();

    this.lines = this.makeCanvas();
    this.lineCtx = this.lines.getContext("2d");
    this.lineCtx.lineWidth = 4;
    this.lineCtx.strokeStyle = '#8cc63f';

    this.dots = this.makeCanvas();
    this.dotCtx = this.dots.getContext("2d");
    this.setCircleStyle('disabled');

    this.xInt = 330 / points;
    this.yInt = 18;
    this.yPos = 0;
    this.xPos = -1;
    this.equator = this.height / 2;

    this.showHotspot; // function
}
Graph.prototype.setCircleStyle = function(style) {
    this.dotCtx.fillStyle = 'white';
    this.dotCtx.lineWidth = 4;
    if (style == 'enabled') {
        this.dotCtx.strokeStyle = '#8cc63f';
        /*try {
            this.dotCtx.setLineDash([0]);
        } catch (e) {
            // unsupported browser
        }*/
    } else {
        this.dotCtx.strokeStyle = '#4c9cbc';
        /*try {
            this.dotCtx.setLineDash([2]);
        } catch (e) {
            // console.log(e);
            // unsupported browser
        }*/
    }
}
Graph.prototype.makeCanvas = function() {
    var c = $('<canvas width="' + this.width + '" height="' + this.height + '" />');
    this.container.append(c);
    return c[0];
}
Graph.prototype.addPoints = function(n) {
    this.xPos++;
    this.yPos = n;
    var coords = this.getCoords();
    if (this.xPos > 0) {
        this.setCircleStyle('enabled');
    }
    if (this.xPos == 0) {
        this.yPos = n;
        var coords = this.getCoords();
        this.lineCtx.moveTo(coords.x, coords.y);
    } else {
        /*	this.yPos += n;
        	if(this.yPos > 20){
        		this.yPos = 20;
        	}else if(this.yPos < 0){
        		this.yPos =	0;
        	}
        	var coords = this.getCoords();
        	*/
        this.lineCtx.lineTo(coords.x, coords.y);
        this.lineCtx.stroke();
    }
    this.dotCtx.beginPath();
    this.dotCtx.arc(coords.x, coords.y, 12, 0, 2 * Math.PI);
    this.dotCtx.stroke();
    this.dotCtx.fill();
    this.dotCtx.stroke();
    if (this.xPos > 0) {
        this.addHotspot();
    }
}
Graph.prototype.getCoords = function() {
    return {
        x: 70 + this.xPos * this.xInt,
        y: this.equator - this.yInt * this.yPos
    }
}
Graph.prototype.addHotspot = function() {
    var coords = this.getCoords();
    var div = $('<div class="hotspot" index="' + (this.xPos - 1) + '"></div>');
    div.css({
        'left': (coords.x - 10) + 'px',
        'top': (coords.y - 10) + 'px'
    });
    this.container.append(div);
    var _me = this;
    div.click(function() {
        _me.showHotspot($(this).attr('index'));
    })
}
