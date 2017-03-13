# Titanium UI - Slider

![Imgur](http://i.imgur.com/mJ82noZ.png)

====

Download ti.draggable and add to project
https://github.com/viezel/TiDraggable
https://github.com/caffeinalab/TiDraggable

View
	
	<!-- one thumb slider -->
    <Widget id="slider1" src="com.imobicloud.slider" class="slider-container" onChange="sliderChange">
    	<View class="slider-track" role="base"/>
		<View class="slider-track slider-track-0" role="track" index="0"/>
		<View class="slider-thumb slider-thumb-0" role="thumb" index="0">
			<ImageView class="slider-thumb-image"/>
			<Label id="lblPlayers" class="slider-thumb-label min-player">1 players</Label>
		</View>
    </Widget>

    <!-- many thumb slider -->
    <Widget id="slider2" src="com.imobicloud.slider" class="slider-container" onChange="sliderChange">
    	<View class="slider-track" role="base"/>
		<View class="slider-track slider-track-0" role="track" index="0"/>
		<View class="slider-track slider-track-1" role="track" index="1"/>
		<View class="slider-thumb slider-thumb-0" role="thumb" index="0">
			<ImageView class="slider-thumb-image"/>
			<Label id="lblMin" class="slider-thumb-label min-player">8 players</Label>
			<Label class="slider-thumb-label-2">min</Label>
		</View>
		<View class="slider-thumb slider-thumb-1" role="thumb" index="1">
			<ImageView class="slider-thumb-image"/>
			<Label id="lblMax" class="slider-thumb-label max-player">16 players</Label>
			<Label class="slider-thumb-label-2">max</Label>
		</View>
    </Widget>
    
Styles

	// 306 = 226 (width of slider-track) + 80 / 2 (half width of first thumb) + 80 / 2 (half width of last thumb)
	".slider-container": { width: 306, height: 52 } 
		".slider-track": { width: 226, height: 2, top: 41, backgroundColor: '#a8adb0', borderRadius: 2, touchEnabled: false }
		".slider-track-0": {  }
		".slider-track-1": { backgroundColor: '#abdb92' }
		".slider-thumb": { width: 80 }
		".slider-thumb-0": {  }
		".slider-thumb-1": {  }	
			".slider-thumb-image": { width: 19, height: 20, top: 32, backgroundImage: '/images/event_create/slider-handle.png', touchEnabled: false }
			".slider-thumb-label": { width: '100%', top: 12, font: { fontSize: 13, fontFamily: 'Exo2-Light' }, textAlign: 'center', touchEnabled: false }
			".min-player": { color: '#61b236' }
			".max-player": { color: '#da3620' }
			".slider-thumb-label-2": { top: 27, left: 5, color: '#71798a', font: { fontSize: 10, fontFamily: 'Exo2-Light' }, touchEnabled: false }
    
Controller

	// load sliders
	$.slider1.load({ min: 1, max: 10, values: [1] });
    $.slider2.load({ min: 5, max: 20, values: [5, 20] });

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
- 18/08/2016
	+ Use custom XML UI
	+ Remove $ parameter of load function

- Refactor: 
	+ use ti.draggable module
	+ add load function
	+ remove update function
- Remove ready event	
- Accept thumbs have the same value	
