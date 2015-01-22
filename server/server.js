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
    console.log(message + " : " + deltaTime);
  }
  input.on('message', Meteor.bindEnvironment(callback));
  input.openPort(1);
}

function musicToDNA(newNote) {
  // Random conversion
  var i = Math.floor(Math.random() * 4);
  return ["A", "T", "G", "C"][i];
}
