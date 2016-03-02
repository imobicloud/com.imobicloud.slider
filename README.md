# Titanium UI - Slider

![Imgur](http://i.imgur.com/mJ82noZ.png)

====

Download ti.draggable and add to project
https://github.com/viezel/TiDraggable

View
	
	<!-- one thumb slider -->
    <Widget id="slider1" src="com.imobicloud.slider" class="imc-slider" onChange="sliderChange"/>

    <!-- many thumb slider -->
    <Widget id="slider2" src="com.imobicloud.slider" class="imc-slider" onChange="sliderChange"/>
    
Styles

	".imc-slider": { width: 226, height: 20, top: 32 }
		".imc-slider-track": { height: 2, backgroundColor: '#a8adb0', borderRadius: 2 }
		".imc-slider-track-0": {  }
		".imc-slider-track-1": { backgroundColor: '#abdb92' }
		".imc-slider-thumb": { width: 19, height: 20, backgroundImage: '/images/event_create/slider-handle.png' }
		".imc-slider-thumb-0": {  }
		".imc-slider-thumb-1": {  }	
    
Controller

	// load sliders
	$.slider1.load($, { min: 1, max: 10, values: [1] });
    $.slider2.load($, { min: 1, max: 20, values: [1, 20] });

	// get value
	$.slider1.getValue();	// => [20]
    $.slider2.setValue();	// => [10,20,25]
    
    // set value
	$.slider1.setValue([25]);	
    $.slider2.setValue([15, 20, 30]);	
    
    // unload sliders
    $.slider1.unload();
    $.slider2.unload();
    
    function sliderChange(e){
    	alert(e.index + ' ' + e.value);
    }

Events

- change
	+ index: thumb index
	+ value: thumb value
	+ pos: center position of thumb
	
Changes log:

- Refactor: 
	+ use ti.draggable module
	+ add load function
	+ remove update function
- Remove ready event	
- Accept thumbs have the same value	