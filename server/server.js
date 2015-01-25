Meteor.startup(function () {
  // Setup MIDI
  setupMIDI();
});

Meteor.methods({
  job: function() {
    // Complete all uncomplete jobs
    Jobs.update({}, {$set: {completed: true}});
    return setupNewJob();
  }
})

function setupNewJob() {
  // Create a brand new job
  return Jobs.insert({
    music: [],
    dna: [],
    completed: false
  }, function(error, id) {
    if (error) {
      console.log("An error occured - Try refreshing", error);
    } else {
      job = Jobs.findOne({_id: id});
    }
  });
}

function setupMIDI() {
  var MIDI = Meteor.npmRequire('midi');
  // Set up a new input.
  var input = new MIDI.input();
  // Configure a callback.
  var callback = function(deltaTime, message) {
    if (message[2] == 0) { return; }
    var newNote = { message: message, deltaTime: deltaTime };
    var newDNA = musicToDNA(newNote);
    Jobs.update({_id: job._id}, {$push: {music: newNote, dna: newDNA}});
  }
  input.on('message', Meteor.bindEnvironment(callback));
  input.openPort(1);
}

function musicToDNA(newNote) {
  var codon = {
    "C5": function() {
      var i = Math.floor(Math.random() * 4);
      return ["GCT", "GCC", "GCA", "GCG"][i];
    },
    "E4": function() {
      var i = Math.floor(Math.random() * 2);
      return ["AGG", "AGA"][i];
    },
    "B3": function() {
      var i = Math.floor(Math.random() * 2);
      return ["AAT", "AAC"][i];
    },
    "A#3": function() {
      var i = Math.floor(Math.random() * 2);
      return ["GAT", "GAC"][i];
    },
    "D#4": function() {
      var i = Math.floor(Math.random() * 2);
      return ["TGT", "TGC"][i];
    },
    "A#4": function() {
      var i = Math.floor(Math.random() * 2);
      return ["GAA", "GAG"][i];
    },
    "B4": function() {
      var i = Math.floor(Math.random() * 2);
      return ["CAA", "CAG"][i];
    },
    "C3": function() {
      var i = Math.floor(Math.random() * 4);
      return ["GGT", "GGC", "GGA", "GGG"][i];
    },
    "D3": function() {
      var i = Math.floor(Math.random() * 2);
      return ["CAT", "CAC"][i];
    },
    "F4": function() {
      var i = Math.floor(Math.random() * 3);
      return ["ATT", "ATC", "ATA"][i];
    },
    "C4": function() {
      var i = Math.floor(Math.random() * 4);
      return ["CTT", "CTC", "CTA", "CTG"][i];
    },
    "F3": function() {
      var i = Math.floor(Math.random() * 2);
      return ["AAA", "AAG"][i];
    },
    "F#3": function() {
      return "ATG";
    },
    "A3": function() {
      var i = Math.floor(Math.random() * 2);
      return ["TTT", "TTC"][i];
    },
    "E3": function() {
      var i = Math.floor(Math.random() * 4);
      return ["CCT", "CCC", "CCA", "CCG"][i];
    },
    "G4": function() {
      var i = Math.floor(Math.random() * 6);
      return ["TCT", "TCC", "TCA", "TCG", "AGT", "AGC"][i];
    },
    "D4": function() {
      var i = Math.floor(Math.random() * 4);
      return ["ACT", "ACC", "ACA", "ACG"][i];
    },
    "F#4": function() {
      return "TGG";
    }
  };
  var result = codon[midimap[newNote.message[1]]]
  if (result) {
    return result();
  } else {
    var i = Math.floor(Math.random() * 4);
    return ["A", "T", "G", "C"][i];
  }
}
