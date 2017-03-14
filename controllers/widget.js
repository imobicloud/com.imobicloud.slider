/*
 Download this module
 https://github.com/viezel/TiDraggable
 * */

if (OS_ANDROID) {
	var measurement = require('alloy/measurement');
}

/*
 args = {
 	min: 20,
 	max: 100,
 	values: [0, 100]
 }
 * */
var args = $.args;
var baseLeft = 0,
	baseWidth = 0;
var tracks = [];
var thumbs = [],
	thumbCount = 0;
var unitWidth = 0;

init();
function init() {
  	var exclude = ['id', 'children', 'min', 'max', 'values', 'thumbAnchor0'];
    $.container.applyProperties( _.omit(args, exclude) );
    
    if (args.children) {
    	var actions = {
    		base: loadBase,
    		track: loadTrack,
    		thumb: loadThumb
    	};
		_.each(args.children, function(child) {
			if (child.role) {
				var action = actions[child.role];
				action && action(child);
			} else {
				$.container.add(child);
			}
		});
		args.children = null;
	}
}

// == BASE

function loadBase(view) {
	view.addEventListener('postlayout', baseReady);
  	$.container.add(view);
}

function baseReady(e) {
  	this.removeEventListener('postlayout', baseReady);
  	baseLeft = this.rect.x;
  	baseWidth = this.rect.width;
}

// == TRACKS

function loadTrack(view) {
	tracks.push(view);
  	$.container.add(view);
}

function unloadTracks() {
	tracks.length = 0;
}

// == THUMBNAILS

function loadThumb(view) {
	view.addEventListener('postlayout', thumbReady);
	
	// https://github.com/viezel/TiDraggable
	var Draggable = require('ti.draggable');
	
	var thumb = Draggable.createView({
		draggableConfig: { enabledOnLongpress: true, minTop: 0, maxTop: 0 },
		thumbIndex: view.index, 
		width: view.width,
		height: Ti.UI.SIZE,
		zIndex: 1
	});
	
	thumb.addEventListener("start", touchstart);
	thumb.addEventListener("move", touchmove);
	thumb.addEventListener("end", touchend);
	thumb.addEventListener("cancel", touchend);
	
	thumb.add(view);
	thumbs.push(thumb);
	
  	$.container.add(thumb);
}

function unloadThumbs() {
	thumbs.length = 0;
}

function thumbReady(e) {
  	this.removeEventListener('postlayout', thumbReady);
  	var thumb = thumbs[this.index];
  	thumb.thumbHalf = args['thumbAnchor' + this.index] || this.rect.width / 2;
  	thumb.thumbWidth = this.rect.width;
  	
  	thumbCount ++;
  	
  	checkDataReady();
}

function checkDataReady() {
  	if (baseWidth != 0 && thumbCount == thumbs.length) {
		if (args.values && args.min != null && args.max != null) {
			loadUI();
		}
  	}
}

/*
 _params = {
 	min: 0,
 	max: 100,
 	values: [20, 80]
 }
 * */
exports.load = function(_params) {
	_.extend(args, _params);
	
	checkDataReady();
};

exports.getValue = function() {
	return args.values;
};

function setValue(values) {
	args.values = values;
	loadUI();
};
exports.setValue = setValue;

exports.unload = function() {
	unloadTracks();
	unloadThumbs();
    $.container.removeAllChildren();
};

function valueToPos(value) {
  	return Math.floor((value - args.min) * unitWidth);
}

function posToValue(pos) {
  	return Math.floor((pos / unitWidth) + args.min);
}

function loadUI() {
	unitWidth = baseWidth / (args.max - args.min);
  	
  	var values = args.values;
  	for (var i = 0, ii = values.length; i < ii; i++) {
  		var value = values[i];
  		var pos = valueToPos(value);
  		
  		var thumb = thumbs[i];
  		thumb.zIndex = ii + i + 1;
  		thumb._zIndex = thumb.zIndex;
  		thumb.left = baseLeft + pos - thumb.thumbHalf;
  		
  		if (i != 0) {
  			var prevThumb = thumbs[i - 1];
  			prevThumb.draggable.setConfig({ maxLeft: pos });
  			thumb.draggable.setConfig({ minLeft: prevThumb.left });
  		} else {
  			thumb.draggable.setConfig({ minLeft: baseLeft - thumb.thumbHalf });
  		}
  		
  		var track = tracks[i];
  		track.zIndex = ii - i;
  		track.left = baseLeft;
  		track.width = pos;
  		
		$.trigger('change', { index: i, value: value, pos: pos });
	};
	
	var lastThumb = thumbs[thumbs.length - 1];
	lastThumb.draggable.setConfig({ maxLeft: baseLeft + baseWidth - lastThumb.thumbHalf });
}

function touchstart(e) {
	e.cancelBubble = true;
	
	var thumb = e.source;
	thumb.zIndex = 100;
}

function touchmove(e) {
	e.cancelBubble = true;
	
	var thumb = e.source,
		index = thumb.thumbIndex;
	updateUI(index, e.left);
}

function touchend(e) {
	e.cancelBubble = true;
	
  	var thumb = e.source,
		index = thumb.thumbIndex;
	var pos = updateUI(index, e.left);
		
	thumb.zIndex = thumb._zIndex;
	
	if (index - 1 >= 0) {
		var prevThumb = thumbs[index - 1];
		prevThumb.draggable.setConfig({ maxLeft: pos });
	}
	
	if (index + 1 <= args.values.length - 1) {
		var nextThumb = thumbs[index + 1];
		nextThumb.draggable.setConfig({ minLeft: pos });
	}
}

function updateUI(index, left) {
  	var pos;
	if (OS_IOS) {
		pos = left;
	} else {
		pos = Math.floor(measurement.pxToDP(left));
	}
	
	var track = tracks[index];
	track.width = pos;
	
	$.trigger('change', { index: index, value: posToValue(pos), pos: pos });
	
	return pos;
}
