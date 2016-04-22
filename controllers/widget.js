// https://github.com/viezel/TiDraggable
var Draggable = require('ti.draggable');

if (OS_ANDROID) {
	var measurement = require('alloy/measurement');
}

var G, params;
var dataReady, sliderReady;

init(arguments[0] || {});
function init(args) {
  	var exclude = ['id', 'clickable'];
    $.slider.applyProperties( _.omit(args, exclude) );
}

/*
 _params = {
 	min: 0,
 	max: 100,
 	values: [20, 80]
 }
 * */
exports.load = function(_G, _params) {
	params && unload();
	
	G = _G;
	params = _params;
	dataReady = true;
	loadUI();
};

function unload() {
	$.slider.removeAllChildren();
	G = params = null;
	dataReady = false;
};
exports.unload = unload;

function sliderPostlayout(e) {
  	this.removeEventListener('postlayout', sliderPostlayout);
  	sliderReady = true;
  	loadUI();
}

function loadUI() {
	if (dataReady !== true || sliderReady !== true) { return; }
	
  	var fullWidth = $.slider.rect.width;
  	var draggableWidth;
  	
  	var baseTrack = G.UI.create('View', { classes: 'imc-slider-track' });
  	$.slider.add(baseTrack);
  	
  	var values = params.values;
  	for(var i = 0, ii = values.length; i < ii; i++){
  		var thumb = Draggable.createView( G.createStyle({
			thumbIndex: i, 
			classes: 'imc-slider-thumb imc-slider-thumb-' + i,
			draggableConfig: { enabledOnLongpress: true, minLeft: 0, minTop: 0, maxTop: 0 },
			zIndex: ii + i + 1
		}) ); 
		
  		var track = G.UI.create('View', { classes: 'imc-slider-track imc-slider-track-' + i, zIndex: ii - i });
		
		var thumbHalfWidth 	= thumb.width / 2;
		draggableWidth 		= fullWidth - thumbHalfWidth - (thumb.width - thumbHalfWidth);
		var unitWidth 		= draggableWidth / (params.max - params.min);
		var valueWidth 		= (values[i] - params.min) * unitWidth;
		
		thumb.draggable.setConfig({
		  	maxLeft: draggableWidth
		});
		thumb.left = valueWidth;
		thumb.unitWidth = unitWidth;
		thumb.draggableWidth = draggableWidth;
		track.width = valueWidth;
		track.left = thumbHalfWidth;
		
		thumb.addEventListener("start", touchstart);
		thumb.addEventListener("move", touchmove);
		thumb.addEventListener("end", touchend);
		thumb.addEventListener("cancel", touchend);
		
		$.slider.add(track);
		$.slider.add(thumb);
		
		$.trigger('change', { index: i, value: values[i], pos: valueWidth });
	};
	
	baseTrack.width = draggableWidth;
}

function touchstart(e) {
	var thumb = e.source;
	thumb._zIndex = thumb.zIndex;
	thumb.zIndex = 100;
}

function touchmove(e) {
	var thumb = e.source;
	
	var posX;
	if (OS_IOS) {
		posX = e.left;
	} else {
		posX = Math.floor(measurement.pxToDP(e.left));
	}
	
	var value = Math.floor((posX / thumb.unitWidth) + params.min);
	$.trigger('change', { index: thumb.thumbIndex, value: value, pos: posX });
}

function touchend(e) {
  	var thumb = e.source;
  	var index = thumb.thumbIndex;
	thumb.zIndex = thumb._zIndex;
	
	var posX;
	if (OS_IOS) {
		posX = e.left;
	} else {
		posX = Math.floor(measurement.pxToDP(e.left));
	}
	
	var value = Math.floor((posX / thumb.unitWidth) + params.min);
	$.trigger('change', { index: index, value: value, pos: posX });
	
	if (index - 1 >= 0) {
		var prevThumb = getViews(index - 1).thumb;
		prevThumb.draggable.setConfig({ maxLeft: posX });
	}
	
	if (index + 1 <= params.values.length - 1) {
		var nextThumb = getViews(index + 1).thumb;
		nextThumb.draggable.setConfig({ minLeft: posX });
	}
}

exports.getValue = function() {
	return params.values;
};

function setValue(values) {
	params.values = values;
	
	var children = $.slider.children;
	
	for(var i = 0, ii = values.length; i < ii; i++){
		var views = getViews(i);
	  	var track = views.track;
	  	var thumb = views.thumb;
	  	
	  	var value = values[i];
  		var valueWidth = (value - params.min) * thumb.unitWidth;
		track.width = valueWidth;
		thumb.left  = valueWidth;
		
		$.trigger('change', { index: i, value: value, pos: valueWidth });
	};
};
exports.setValue = setValue;

function getViews(index) {
	/*
	children at 0 is baseTrack
	index: track, thumb
	0: 1, 2
  	1: 3, 4
  	2: 5, 6
  	==> track: index * 2 + 1
  	==> thumb: index * 2 + 2
	 * */
  	
  	index = index * 2;
  	var children = $.slider.children;
  	return { track: children[index + 1], thumb: children[index + 2] };
}
