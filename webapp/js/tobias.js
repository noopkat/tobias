(function(global) {
  'use strict';

  function Tobias() {
    if (Tobias.prototype._singletonInstance) {
        return Tobias.prototype._singletonInstance;
    }
    Tobias.prototype._singletonInstance = this;

    var nounsList = 'Contest,Arguing,Lost,Escaping,Sleeping,Found,Fighting,Love,Journey,Mischief,Alive,Hurt,Meeting,Storm,Imprisoned,Planning,Time,Breaks,Parting,Transforming,Rescued,Revealed,Dying,Food,Axe,Returned,Ring,Clothes,Book,Sword,Door,Cauldron,Trap,Stairs,Fire,Key,Tree,Spell,Crown,Wall,Well,Treasure,Window,Gift,Beautiful,Foolish,Cursed,Brave,Frightened,Poisoned,Disguised,Happy,Fly,Hidden,Lucky,Talk,Healed,Sad,Tiny,Stolen,Ugly,Wicked,Wise,Strong,Faraway,Secret,Blind,lost,City,Crazy,Cave,Dungeon,Cottage,Sky,Garden,Forest,Mountain,Palace,Kitchen,Night,Road,River,Swamp,Tower,Village,Kingdom,Church,Home,Ruin,King,Beggar,Fairy,Prince,Brother,Sister,Giant,Princess,Child,Wolf,Page,Queen,Stepmother,Frog,Guard,Parent,Horse,Cook,Husband,Wife,Monster,Enemy,Old,Dragon,Thief,Orphan,Witch',
        nouns = nounsList.split(','),
        outputContainer = document.getElementById('output'),
        statusBox = document.getElementById('current-status'),
        commands = {},
        dombody = $('body');

    function getGif(match) {
      var url = 'http://api.giphy.com/v1/gifs/search?q=',
          key = 'dc6zaTOxFJmzC';

      $.getJSON(url + match + '&api_key=' + key, function(data) {
        chooseAndDisplayGif(data);
      });
    };

    function chooseAndDisplayGif(data) {
      var imgList = data.data,
          ill = imgList.length - 1,
          // generate a random number to select a different gif each time from the bag
          rand = Math.floor(Math.random() * ill) + 1,
          // animated image for realzies internet
          gifType = 'fixed_width_downsampled',
          gifFile = imgList[rand].images[gifType].url;

      dombody.append('<img class="giphy" src="' + gifFile + '"/>');
    }

    function displayMatch(match) {
      outputContainer.innerHTML = match.toLowerCase();
    }

    function commandHandler() {
      var args = Array.prototype.slice.call(arguments),
          meta = args[args.length - 1];

      if (typeof meta === 'object' && meta.hasOwnProperty('recognisedPhrase')) {
        var match = meta.recognisedPhrase;
        getGif(match);
        displayMatch(match);
      }
    };

    function setUpAnnyang(annyang) {
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
      annyang.addCallback('start', function(){console.log('restarted')});
      annyang.addCallback('error', function(){console.log('error')});

      // start listening
      annyang.start();
    }

    return setUpAnnyang;
  }

  if (annyang) {
    var tobias = new Tobias();
    tobias(annyang);
  } else {
    console.log('couldn\'t find annyang');
  };

}(window));