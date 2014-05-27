/*
~~~~~~~~~ WARNING: HACKY WEEKEND CODING AHEAD ~~~~~~~~~
~~~~~~~~~~~~~~~ PROCEED AT YOUR OWN RISK ~~~~~~~~~~~~~~
*/

var prevWord = "",
    canSpeak = false,
    // how do you log-probability
    prob = -999999,
    // these are the words we wanna listen for mmkay
    keynouns = "Contest,Arguing,Lost,Escaping,Sleeping,Found,Fighting,Love,Journey,Mischief,Alive,Hurt,Meeting,Storm,Imprisoned,Planning,Time,Breaks,Parting,Transforming,Rescued,Revealed,Dying,Food,Axe,Returned,Ring,Clothes,Book,Sword,Door,Cauldron,Trap,Stairs,Fire,Key,Tree,Spell,Crown,Wall,Well,Treasure,Window,Gift,Beautiful,Foolish,Cursed,Brave,Frightened,Poisoned,Disguised,Happy,Fly,Hidden,Lucky,Talk,Healed,Sad,Tiny,Stolen,Ugly,Wicked,Wise,Strong,Faraway,Secret,Blind,lost,City,Crazy,Cave,Dungeon,Cottage,Sky,Garden,Forest,Mountain,Palace,Kitchen,Night,Road,River,Swamp,Tower,Village,Kingdom,Church,Home,Ruin,King,Beggar,Fairy,Prince,Brother,Sister,Giant,Princess,Child,Wolf,Page,Queen,Stepmother,Frog,Guard,Parent,Horse,Cook,Husband,Wife,Monster,Enemy,Old,Dragon,Thief,Orphan,Witch,GARB_AA,GARB_AE,GARB_AH,GARB_AO,GARB_AW,GARB_AY,GARB_B,GARB_CH,GARB_D,GARB_DH,GARB_EH,GARB_ER,GARB_EY,GARB_F,GARB_G,GARB_HH,GARB_IH,GARB_IY,GARB_JH,GARB_K,GARB_L,GARB_M,GARB_N,GARB_NG,GARB_OW,GARB_OY,GARB_P,GARB_R,GARB_S,GARB_SH,GARB_T,GARB_TH,GARB_UH,GARB_UW,GARB_V,GARB_W,GARB_Y,GARB_Z,GARB_ZH".toUpperCase(),
    keynounsArr = keynouns.split(",");

// These will be initialized later
var recognizer, recorder, callbackManager, audioContext, outputContainer,
    // Only when both recorder and recognizer do we have a ready application
    recorderReady = recognizerReady = false;

// A convenience function to post a message to the recognizer and associate
// a callback to its response
function postRecognizerJob(message, callback) {
  var msg = message || {};

  if (callbackManager) {
    msg.callbackId = callbackManager.add(callback);
  }
  if (recognizer) {
    recognizer.postMessage(msg);
  }
};

// This function initializes an instance of the recorder
// it posts a message right away and calls onReady when it
// is ready so that onmessage can be properly set
function spawnWorker(workerURL, onReady) {
  recognizer = new Worker(workerURL);
  recognizer.onmessage = function(event) {
    onReady(recognizer);
  };
  recognizer.postMessage('');
};

// This updates the UI when the app might get ready
// Only when both recorder and recognizer are ready do we enable the buttons
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

// A not-so-great recording indicator
function displayRecording(display) {
  if (display) {
    document.getElementById('recording-indicator').innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  } else {
    document.getElementById('recording-indicator').innerHTML = "";
  }
};

// Callback function once the user authorises access to the microphone
// in it, we instanciate the recorder
function startUserMedia(stream) {
  var input = audioContext.createMediaStreamSource(stream);
  // Firefox hack https://support.mozilla.org/en-US/questions/984179
  window.firefox_audio_hack = input;
  var audioRecorderConfig = {errorCallback: function(x) {updateStatus("Error from recorder: " + x);}};
  recorder = new AudioRecorder(input, audioRecorderConfig);
  // If a recognizer is ready, we pass it to the recorder
  if (recognizer) {
    recorder.consumers = [recognizer];
  }
  recorderReady = true;
  updateStatus("Audio recorder ready!");
  updateUI();
};

// This starts recording. We first need to get the id of the keyword search to use
var startRecording = function() {
  if (recorder && recorder.start()) displayRecording(true);
};

// Stops recording
var stopRecording = function() {
  recorder && recorder.stop();
  displayRecording(false);
};

// Called once the recognizer is ready
// We then add the grammars to the input select tag and update the UI
var recognizerReady = function() {
  recognizerReady = true;
  updateStatus("Recogniser ready!");
  updateUI();
};

// load our grammar object into pocketsphinx
var feedGrammar = function() {
  // add the keywords to the grammar in the correct gramma object format
  var grammarKeywords = {numStates: 1, start: 0, end: 0, transitions: []};
  for (var i = 0; i < keynounsArr.length; i++) {
    // if the word is from the garbage group, assign it a different probability confidence filter
    if (keynounsArr[i].substr(0,4) === "GARB") {
      prob = -5;
    }
    // push!
    grammarKeywords.transitions.push({from: 0, to: 0, logp: prob, word: keynounsArr[i]});
  };

  postRecognizerJob({command: 'addGrammar', data: grammarKeywords});
  recognizerReady();
};

// To display the hypothesis sent by the recognizer on the webpage
function updateHyp(hyp) {
  if (outputContainer) {
    outputContainer.innerHTML = hyp.toLowerCase();
  }
};

// This adds words (from wordList.js) to the recognizer. When it calls back, we add grammars
var feedWords = function(words) {
  postRecognizerJob(
    {command: 'addWords', data: words}, function() {
      feedGrammar();
  });
};

// This initializes the recognizer. When it calls back, we add words
var initRecognizer = function() {
    // You can pass parameters to the recognizer, such as : {command: 'initialize', data: [["-hmm", "my_model"], ["-fwdflat", "no"]]}
    postRecognizerJob({command: 'initialize', data: [["-remove_noise", "yes"]]}, function() {
      if (recorder) recorder.consumers = [recognizer];
      // feed words from the wordList.js file
      feedWords(wordList);
    });
};

// get a gif of the last word spoken
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
window.onload = function() {
  outputContainer = document.getElementById("output");
  updateStatus("Please wait, I'll tell you when you can speak.");
  updateStatus("Recogniser init, asking for microphone access...");
  callbackManager = new CallbackManager();
  spawnWorker("js/recognizer.js", function(worker) {
    // This is the onmessage function, once the worker is fully loaded
    worker.onmessage = function(e) {
      var workerData = e.data;
      // This is the case when we have a callback id to be called
      if (workerData.hasOwnProperty('id')) {
        var clb = callbackManager.get(workerData['id']),
            data = {};

        if (workerData.hasOwnProperty('data')) {
          data = workerData.data;
        } 

        if (clb) {
          clb(data);
        }
      }
      // This is a case when the recognizer has a new hypothesis
      if (workerData.hasOwnProperty('hyp')) {
        var newHyp = workerData.hyp,
            // put all words in hypothesis string into an array for use
            lastsp = newHyp.split(' '),
            lastspLen = lastsp.length,
            // this gets the last word spoken in the concatenated hypothesis
            lastword = lastsp.pop(),
            // was the last word garbage, or background noise?
            garbage = (lastword.substr(0,4) === "GARB") ? true : false;

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

      }
      // This is the case when we have an error
      if (workerData.hasOwnProperty('status') && (workerData.status == "error")) {
        updateStatus("Error in " + workerData.command + " with code " + workerData.code);
      }

    };
    // Once the worker is fully loaded, we can call the initialize function
    initRecognizer();
  });

  // The following is to initialize Web Audio
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    audioContext = new AudioContext();
  } catch (e) {
    updateStatus("Error initializing Web Audio browser");
    console.log(e);
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      updateStatus("No live audio input in this browser");
    });
  } else {
    updateStatus("No web audio support in this browser");
  }

  // Wiring JavaScript to the UI
  var startBtn = document.getElementById('startBtn'),
      stopBtn = document.getElementById('stopBtn');

    startBtn.disabled = true;
    stopBtn.disabled = true;
    startBtn.onclick = startRecording;
    stopBtn.onclick = stopRecording;

}; //end onload