/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Create viewer.
var viewer = new Marzipano.Viewer(document.getElementById('pano'));

// Create asset and source.
var asset = new VideoAsset();
var source = new Marzipano.SingleAssetSource(asset);

// Create geometry.
// This is a trivial equirectangular geometry with a single level.
// The level size need not match the actual video dimensions because it is
// only used to determine the most appropriate level to render, and no such
// choice has to be made in this case.
var geometry = new Marzipano.EquirectGeometry([ { width: 1 } ]);

// Create view.
// We display the video at a fixed vertical fov.
var limiter = Marzipano.RectilinearView.limit.vfov(90*Math.PI/180, 90*Math.PI/180);
var view = new Marzipano.RectilinearView({ fov: Math.PI/2 }, limiter);

// Create scene.
var scene = viewer.createScene({
  source: source,
  geometry: geometry,
  view: view
});

// Display scene.
scene.switchTo();



// Whether playback has started.
var started = false;

// Try to start playback.
async function tryStart() {
  if (started) {
    return;
  }
  started = true;

  var video = document.createElement('video');
  video.src = 'images/mercedes-f1-1280x640.mp4';
  video.crossOrigin = 'anonymous';

  video.autoplay = true;
  video.muted = "muted";
  video.loop = true;

  // Prevent the video from going full screen on iOS.
  video.playsInline = true;
  video.webkitPlaysInline = true;
  try {
  await video.play();
  } catch(err) {
	  console.err(err)
 }

  waitForReadyState(video, video.HAVE_METADATA, 100, function() {
    waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
      asset.setVideo(video);
    });
  });
}

// Wait for an element to reach the given readyState by polling.
// The HTML5 video element exposes a `readystatechange` event that could be
// listened for instead, but it seems to be unreliable on some browsers.
function waitForReadyState(element, readyState, interval, done) {
  var timer = setInterval(function() {
    if (element.readyState >= readyState) {
      clearInterval(timer);
      done(null, true);
    }
  }, interval);
}

var init = function () {


  var velocity = 0.7;
  var friction = 3;
  
  
  var controls = viewer.controls();
  const upElement = document.createElement("a");
  const downElement = document.createElement("a");
  const leftElement = document.createElement("a");
  const rightElement = document.createElement("a");
  const zoomInElement = document.createElement("a");
  const zoomOutElement = document.createElement("a");
 
  controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(upElement,     'y', -velocity, friction), true);
  controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(downElement,   'y',  velocity, friction), true);
  controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(leftElement,   'x', -velocity, friction), true);
  controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(rightElement,  'x',  velocity, friction), true);
  controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(zoomInElement,  'zoom', -velocity, friction), true);
  controls.registerMethod('outElement',    new Marzipano.ElementPressControlMethod(zoomOutElement,  'zoom', velocity, friction), true);

  
  const mousDownEvent = new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true
    });
  
  const mouseUpEvent = new MouseEvent('mouseup', {
      view: window,
      bubbles: true,
      cancelable: true
    });
  
 var zoom = false; 
  
  // add eventListener for keydown
  document.addEventListener('keydown', function(e) {

    switch(e.keyCode){
    case 37: //LEFT arrow
      leftElement.dispatchEvent(mousDownEvent);
      leftElement.dispatchEvent(mouseUpEvent);
      break;
    case 38: //UP arrow
      if (zoom){
        zoomInElement.dispatchEvent(mousDownEvent);
          zoomInElement.dispatchEvent(mouseUpEvent);
      } else {
        upElement.dispatchEvent(mousDownEvent);
        upElement.dispatchEvent(mouseUpEvent);
      }
      break;
    case 39: //RIGHT arrow
      rightElement.dispatchEvent(mousDownEvent);
      rightElement.dispatchEvent(mouseUpEvent);
      break;
    case 40: //DOWN arrow
      if (zoom){
        zoomOutElement.dispatchEvent(mousDownEvent);
        zoomOutElement.dispatchEvent(mouseUpEvent);
      } else {
        downElement.dispatchEvent(mousDownEvent);
        downElement.dispatchEvent(mouseUpEvent);
      }
      break;
    case 13: //OK button
    	console.log('ok')
    	  if (!started) {
    		  console.log('starting')
    		  tryStart()
    	  }
      zoom = !zoom;
      break;
    case 10009: //RETURN button
  tizen.application.getCurrentApplication().exit();
      break;
    default:
      console.log('Key code : ' + e.keyCode);
      break;
    }
  });
};

window.onload = init;