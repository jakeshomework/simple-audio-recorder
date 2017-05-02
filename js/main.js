/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

document.addEventListener("DOMContentLoaded", function() {
  appleCheck();
  flashRecorder();
});

// ---------- Class Control ----------



// ---------- End Class Control ----------


// ---------- Begin Browser Support ----------




function appleCheck() {
  var chromeContainer = document.getElementById('chrome');
  var safariContainer = document.getElementById('safariContainer');
  var iosContainer = document.getElementById('ios');


  function hasClass(el, className) {
    if (el.classList)
      return el.classList.contains(className)
    else
      return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }

  function addClass(el, className) {
    if (el.classList)
      el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
  }

  function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className)
    else if (hasClass(el, className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
      el.className=el.className.replace(reg, ' ')
    }
  }

  var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIos) {
    //document.getElementById("ios").innerHTML = "This an iOS device.";
    addClass(chromeContainer, 'hidden');
    addClass(safariContainer, 'hidden');
  } else if (isSafari) {
    //document.getElementById("safari").innerHTML = "Looks like you're using Safari browser.";
    addClass(chromeContainer, 'hidden');
    addClass(iosContainer, 'hidden');
  } else {
    //document.getElementById("root").innerHTML = ''
    addClass(safariContainer, 'hidden');
    addClass(iosContainer, 'hidden');
  }
  console.log("HEyDUDUE" + isIos + isSafari);
}



//---------- End Browser Support ----------


// ---------- Flash Business (Safari) ----------
function flashRecorder() {

  console.log("I'm the flashRecorder -- look at me!");
  var swfVersionStr = "11.4.0";
  // <!-- xiSwfUrlStr can be used to define an express installer SWF. -->
  var xiSwfUrlStr = "";
  var flashvars = {};
  var params = {};
  params.quality = "high";
  params.bgcolor = "#ffffff";
  params.play = "true";
  params.loop = "false";
  params.wmode = "window";
  params.scale = "noborder";
  params.menu = "true";
  params.devicefont = "false";
  params.salign = "";
  params.allowscriptaccess = "sameDomain";
  var attributes = {};
  attributes.id = "AudioRecorder";
  attributes.name = "AudioRecorder";
  attributes.align = "middle";
  swfobject.createCSS("html", "height:100%; background-color: #ffffff;");
  swfobject.createCSS("body", "margin:0; padding:0; overflow:hidden; height:100%;");
  swfobject.embedSWF (
    "AudioRecorder.swf", "flashContent",
    "400", "290",
    swfVersionStr, xiSwfUrlStr,
    flashvars, params, attributes
  );
}

//---------- End Flash Business ----------


window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
    // audioRecorder.exportWAV( doneEncoding );
    // could get mono instead by saying
    audioRecorder.exportMonoWAV( doneEncoding );
}

function gotBuffers( buffers ) {

    // ---------- No need to display waveform ---------
    // var canvas = document.getElementById( "wavedisplay" );
    // drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

    // the ONLY time gotBuffers is called is right after a new recording is completed -
    // so here's where we should set up the download.
    audioRecorder.exportWAV( doneEncoding );
}


//--------------------------------- Auto Downloading function
function autoDownload( fileName ) {
  simulateClick("save");
}

function simulateClick(elId) {
  var evt;
  var el = document.getElementById(elId);
  if (document.createEvent) {
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  (evt) ? el.dispatchEvent(evt) : (el.click && el.click());
}
//--------------------------------------------------------------

function doneEncoding( blob ) {
    Recorder.setupDownload( blob, "bookshelf-recording-" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;

}

function toggleRecording( e ) {
    if (e.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers( gotBuffers );
    } else {
        // start recording
        if (!audioRecorder)
            return;
        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
    }
}

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData);

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }

    rafID = window.requestAnimationFrame( updateAnalysers );
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio );
