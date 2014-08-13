/*
HALF BAKED PSEUDO CODE
*/

var prevWord = "",
    canSpeak = false,
    // these are the words we wanna listen for mmkay
    keynouns = "Contest,Arguing,Lost,Escaping,Sleeping,Found,Fighting,Love,Journey,Mischief,Alive,Hurt,Meeting,Storm,Imprisoned,Planning,Time,Breaks,Parting,Transforming,Rescued,Revealed,Dying,Food,Axe,Returned,Ring,Clothes,Book,Sword,Door,Cauldron,Trap,Stairs,Fire,Key,Tree,Spell,Crown,Wall,Well,Treasure,Window,Gift,Beautiful,Foolish,Cursed,Brave,Frightened,Poisoned,Disguised,Happy,Fly,Hidden,Lucky,Talk,Healed,Sad,Tiny,Stolen,Ugly,Wicked,Wise,Strong,Faraway,Secret,Blind,lost,City,Crazy,Cave,Dungeon,Cottage,Sky,Garden,Forest,Mountain,Palace,Kitchen,Night,Road,River,Swamp,Tower,Village,Kingdom,Church,Home,Ruin,King,Beggar,Fairy,Prince,Brother,Sister,Giant,Princess,Child,Wolf,Page,Queen,Stepmother,Frog,Guard,Parent,Horse,Cook,Husband,Wife,Monster,Enemy,Old,Dragon,Thief,Orphan,Witch,GARB_AA,GARB_AE,GARB_AH,GARB_AO,GARB_AW,GARB_AY,GARB_B,GARB_CH,GARB_D,GARB_DH,GARB_EH,GARB_ER,GARB_EY,GARB_F,GARB_G,GARB_HH,GARB_IH,GARB_IY,GARB_JH,GARB_K,GARB_L,GARB_M,GARB_N,GARB_NG,GARB_OW,GARB_OY,GARB_P,GARB_R,GARB_S,GARB_SH,GARB_T,GARB_TH,GARB_UH,GARB_UW,GARB_V,GARB_W,GARB_Y,GARB_Z,GARB_ZH".toUpperCase(),
    keynounsArr = keynouns.split(",");

// This updates the UI when the app might get ready
// Only when both recorder and recognizer are ready do we enable the buttons
// TODO: change this to wait for annyang
function updateUI() {
  if (recorderReady && recognizerReady) {
    startBtn.disabled = stopBtn.disabled = false;
    if (!canSpeak) {
      updateStatus("You may now speak.");
      canSpeak = true;
    }
  }
};

// This is just a logging window where we display the status
function updateStatus(newStatus) {
  document.getElementById('current-status').innerHTML += "<br/>" + newStatus;
};


// This starts recording. We first need to get the id of the keyword search to use
// TODO: chnage this to annyang ready state
var startRecording = function() {
  if (recorder && recorder.start()) displayRecording(true);
};

// Stops recording
// TODO: chnage this to annyang ignore state
var stopRecording = function() {
  recorder && recorder.stop();
  displayRecording(false);
};

// To display the hypothesis sent by the recognizer on the webpage
// TODO: change to annyang hyp returned
function updateHyp(hyp) {
  if (outputContainer) {
    outputContainer.innerHTML = hyp.toLowerCase();
  }
};

// get a gif of the last word spoken
// this can be almost left alone
function getGif(lastword) {
  $.getJSON("http://api.giphy.com/v1/gifs/search?q=" + lastword + "&api_key=dc6zaTOxFJmzC", function(data) {
    var imgList = data.data,
        // generate a random number to select a different gif each time from the bag
        rand = Math.floor(Math.random(0, imgList.length-1)),
        // animated image for realzies internet
        gifType = "fixed_width_downsampled",
        gifFile = imgList[rand].images[gifType].url;

    $('body').append("<img class='giphy' src='" + gifFile + "'/>");
  });
};

// When the page is loaded, we spawn a new recognizer worker and call getUserMedia to
// request access to the microphone
// TODO: NOT this. Create a handler properly for doc ready 
window.onload = function() {
  outputContainer = document.getElementById("output");
  updateStatus("Please wait, I'll tell you when you can speak.");
  updateStatus("Recogniser init, asking for microphone access...");
   

  // if the word is not a duplicate, blank, or garbage, then grab a GIF!
  if (lastword !== prevWord && lastword !== '' && !garbage) {
    getGif(lastword);
  }
  
  if (workerData.hasOwnProperty('final') &&  workerData.final) {
    newHyp = "Final: " + newHyp;
  }

  // if there's background noise, suggest to the user that this is so.
  if (garbage) { 
    lastword = "* random noise *" 
  };

  // send the last word recognised to the UI
  updateHyp(lastword);
  prevWord = lastword;

  // Wiring JavaScript to the UI
  var startBtn = document.getElementById('startBtn'),
      stopBtn = document.getElementById('stopBtn');

    startBtn.disabled = true;
    stopBtn.disabled = true;
    startBtn.onclick = startRecording;
    stopBtn.onclick = stopRecording;

}; //end onload