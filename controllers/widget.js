/*
 args = {
 	min: 0,
 	max: 100,
 	sensitive: 1,
 	tssclass: '',
 	values: [20, 80]
 }
 * */
var args = arguments[0] || {},
	vars = {};

var measurement;
OS_ANDROID && (measurement = require('alloy/measurement'));

init();
function init() {
	// normalize data
	
	args.max = parseInt(args.max, 10);
	args.min = parseInt(args.min, 10);
	args.values = JSON.parse(args.values);
	args.sensitive = args.sensitive ? parseInt(args.sensitive, 10) : 1;
	
	vars.posXs = [];
	
	//
	
	var prefix = 'slider-' + args.tssclass,
		thumbHalfWidth = $.createStyle({ classes: prefix + '-thumb' }).width / 2;
	
	$.addClass($.slider, prefix);
	$.addClass($.tracks, prefix + '-track', { left: thumbHalfWidth, right: thumbHalfWidth });
	
	for(var i = 0, ii = args.values.length; i < ii; i++){
		$.tracks.add( $.UI.create('View', { classes: prefix + '-track ' + prefix + '-track-' + i, left: 0, width: 0, zIndex: ii - i }) );
		$.thumbs.add( $.UI.create('View', { thumbIndex: i, classes: prefix + '-thumb ' + prefix + '-thumb-' + i }) );
	};
}

function postlayout(e) {
  	this.removeEventListener('postlayout', postlayout);
  	
  	var trackWidth = this.rect.width,
  		partWidth  = trackWidth / (args.max - args.min);
  	vars.partWidth = partWidth;
  	
  	vars.maxX = trackWidth;
  	
  	updateValues();
}

function updateValues() {
  	var max = args.max,
		min = args.min,
		values = args.values,
		partWidth = vars.partWidth,
		tracks = $.tracks.children,
		thumbs = $.thumbs.children;
	
	for(var i = 0, ii = values.length; i < ii; i++){
	  	var value = values[i];
	  	if (value < min) { values[i] = value = min; }
	  	else if (value > max) { values[i] = value = max; }
	  	
  		var posX = (value - min) * partWidth;
  		
  		vars.posXs[i] = posX;
  		
		tracks[i].width = posX;
		thumbs[i].left = posX;
		
		$.trigger('change', { index: i, value: value, pos: posX });
	};
}

function touchstart(e) {
	e.cancelBubble = true;
	
	var index = e.source.thumbIndex;
	if (index == null) { return; }
	
	vars.touchX = e.x;
	if (OS_ANDROID) { vars.touchX = measurement.pxToDP(e.x); }
	
	var index = e.source.thumbIndex;
	vars.cacheX = vars.posXs[index];
	vars.cacheValue = args.values[index];
	
	e.source.zIndex = 1;
}

function touchend(e) {
	e.cancelBubble = true;
	
	var index = e.source.thumbIndex;
	if (index == null) { return; }
	
	var posX  = vars.posXs[index];
	
	var track = $.tracks.children[index];	
	if (track.width == 0) { track.width = 1; }	
	track.animate({ width: posX });
	
	e.source.zIndex = 0;
	
	vars.touchX = vars.cacheX = vars.cacheValue = null;
}

function touchcancel(e) {
	e.cancelBubble = true;
	
	var index = e.source.thumbIndex;
	if (index == null) { return; }
	
	var posX = vars.cacheX;
		
	vars.posXs[index] = posX;
	
	$.thumbs.children[index].animate({ left: posX });
	
	args.values[index] = vars.cacheValue;
	
	$.trigger('change', { index: index, value: vars.cacheValue, pos: posX });
	
	e.source.zIndex = 0;
	
	vars.touchX = vars.cacheX = vars.cacheValue = null;
}

function touchmove(e) {
	e.cancelBubble = true;
	
	var index = e.source.thumbIndex;
	if (index == null) { return; }
	
	if (vars.x != null && Math.abs(vars.x - e.x) >= args.sensitive) { return; }
	vars.x = e.x;
	
  	var pos = e.source.convertPointToView({ x: e.x, y: e.y }, $.thumbs);
  	if (OS_ANDROID) { pos.x = measurement.pxToDP(pos.x); }
  	
  	pos.x -= vars.touchX;
  	if (pos.x < 0 || pos.x > vars.maxX) { return; }
  	
  	var posX = pos.x;
  		
  	var prev = vars.posXs[index - 1];
  	if (prev && posX < prev) { return; }
  	var next = vars.posXs[index + 1];
  	if (next && posX > next) { return; }
  	
  	vars.posXs[index] = posX;
  	
  	$.thumbs.children[index].left = posX;
  	
  	var value = (posX / vars.partWidth) + args.min;
  	value = Math[ value - parseInt(value) >= 0.5 ? 'ceil' : 'floor' ](value);
  	args.values[index] = value;
	
	$.trigger('change', { index: index, value: value, pos: posX });
}

exports.getValue = function() {
	return args.values;
};

function setValue(values) {
	args.values = values;
	updateValues();
};
exports.setValue = setValue;

exports.update = function(params) {
    if (!params) { return; }
    
    args = params;
    
    if (params.min && params.max) {
        vars.partWidth = $.tracks.rect.width / (params.max - params.min);
    }
    
    setValue(params.values);
};