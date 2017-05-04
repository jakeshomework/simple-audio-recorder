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

// ---------- Begin Browser Support ----------
// ----- USED http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
// ----- ...to generage the js variable below

var chrome="";
chrome += "<div id=\"chrome\">";
chrome += "		<div id=\"viz\">";
chrome += "			<canvas id=\"analyser\" width=\"1024\" height=\"500\"><\/canvas>";
chrome += "			<!-- <canvas id=\"wavedisplay\" width=\"1024\" height=\"500\"><\/canvas> -->";
chrome += "		<\/div>";
chrome += "";
chrome += "		<div id=\"controls\">";
chrome += "			<div>Audio Recorder<\/div>";
chrome += "			<img id=\"record\" src=\"img\/mic128.png\" onclick=\"toggleRecording(this);\">";
chrome += "			<a id=\"save\" href=\"#\"><img src=\"img\/save.svg\"><\/a>";
chrome += "			<div>Click to begin recording<\/div>";
chrome += "		<\/div>";
chrome += "	<\/div>";

var ios="";
ios += "<div id=\"ios\">";
ios += "  <h5>iPhone and iPad option<\/h5>";
ios += "  <div class=flex-col>";
ios += "    <div>";
ios += "      <div class=\"flex\">";
ios += "        <img class=\"flex-item\" src=\"img\/voice-memos.png\" \/>";
ios += "        <div class=\"app-desc flex-item\">";
ios += "					<h4>Voice Memos<\/h4>";
ios += "          <a href=\"https:\/\/appsto.re\/us\/gx3V_.i\"><h5>Apple<\/h5><\/a>";
ios += "          <a href=\"https:\/\/appsto.re\/us\/gx3V_.i\">";
ios += "            <li>View in iTunes<\/li>";
ios += "          <\/a>";
ios += "					<p>Apple Inc. All rights reserved<\/p>";
ios += "        <\/div>";
ios += "      <\/div>";
ios += "    <\/div>";
ios += "  <\/div>";
ios += "<\/div>";



var safari="";
safari += "<div id=\"safariContainer\">";
safari += "	<div id=\"flashContent\">";
safari += "		<a href=\"http:\/\/www.adobe.com\/go\/getflash\">";
safari += "			<img src=\"http:\/\/www.adobe.com\/images\/shared\/download_buttons\/get_flash_player.gif\" alt=\"Get Adobe Flash player\" \/>";
safari += "		<\/a>";
safari += "		<p>This page requires Flash Player version 11.4.0 or higher.<\/p>";
safari += "	<\/div>";
safari += "<\/div>";

document.addEventListener("DOMContentLoaded", function() {
  appleCheck();
});

function appleCheck() {
  var root = document.getElementById('root');


  var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var theContent = '';
  if (isIos) {
    theContent = ios;
  } else if (isSafari) {
    flashRecorder();
    theContent = safari;
  } else {
    theContent = chrome;
  }
  document.getElementById("root").innerHTML = theContent;
}



//---------- End Browser Support ----------


// ---------- Flash Business (Safari) ----------
function flashRecorder() {
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
        for (var i = 10; i < numBars-10; ++i) {
            var magnitude = 10;
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
