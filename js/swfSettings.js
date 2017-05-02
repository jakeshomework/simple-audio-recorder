// <!-- Adobe recommends that developers use SWFObject2 for Flash Player detection. -->
// <!-- For more information see the SWFObject page at Google code (http://code.google.com/p/swfobject/). -->
// <!-- Information is also available on the Adobe Developer Connection Under "Detecting Flash Player versions and embedding SWF files with SWFObject 2" -->
// <!-- Set to minimum required Flash Player version or 0 for no version detection -->

export function flashRecorder() {

  console.log("halwekalkej");
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
