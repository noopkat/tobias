var nounsList = "Contest,Arguing,Lost,Escaping,Sleeping,Found,Fighting,Love,Journey,Mischief,Alive,Hurt,Meeting,Storm,Imprisoned,Planning,Time,Breaks,Parting,Transforming,Rescued,Revealed,Dying,Food,Axe,Returned,Ring,Clothes,Book,Sword,Door,Cauldron,Trap,Stairs,Fire,Key,Tree,Spell,Crown,Wall,Well,Treasure,Window,Gift,Beautiful,Foolish,Cursed,Brave,Frightened,Poisoned,Disguised,Happy,Fly,Hidden,Lucky,Talk,Healed,Sad,Tiny,Stolen,Ugly,Wicked,Wise,Strong,Faraway,Secret,Blind,lost,City,Crazy,Cave,Dungeon,Cottage,Sky,Garden,Forest,Mountain,Palace,Kitchen,Night,Road,River,Swamp,Tower,Village,Kingdom,Church,Home,Ruin,King,Beggar,Fairy,Prince,Brother,Sister,Giant,Princess,Child,Wolf,Page,Queen,Stepmother,Frog,Guard,Parent,Horse,Cook,Husband,Wife,Monster,Enemy,Old,Dragon,Thief,Orphan,Witch";
var nouns = nounsList.split(",");
var outputContainer = document.getElementById('output');
var statusBox = document.getElementById('current-status');
var commands = {};

function getGif(lastword) {
  $.getJSON("http://api.giphy.com/v1/gifs/search?q=" + lastword + "&api_key=dc6zaTOxFJmzC", function(data) {
    var imgList = data.data,
        // generate a random number to select a different gif each time from the bag
        rand = Math.floor(Math.random(0, imgList.length-1)),
        // animated image for realzies internet
        gifType = "fixed_width_downsampled",
        gifFile = imgList[rand].images[gifType].url;

    $('body').append("<img class='giphy' src='" + gifFile + "'/>");
    outputContainer.innerHTML = lastword.toLowerCase();
  });
};

// This is just a logging window where we display the status
function updateStatus(newStatus) {
  statusBox.innerHTML += "<br/>" + newStatus;
};

function commandHandler() {
    var args = Array.prototype.slice.call(arguments);
    var meta = args[args.length-1];
    if (typeof meta === 'object' && meta.hasOwnProperty('recognisedPhrase')) {
      getGif(meta.recognisedPhrase);
    }
};

if (annyang) {

  // load up commands object
  for (var i = 0; i < nouns.length; i += 1) {
    var noun = nouns[i];
    commands[noun] = commandHandler;
  };

  // add commands to annyang
  annyang.addCommands(commands);

  // debug on
  annyang.debug();

  // update status when annyang is ready to go
  annyang.addCallback('start', updateStatus('you may now speak'));

  // start listening
  annyang.start();
};