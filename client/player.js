function renderDNA() {
  var scene = new THREE.Scene();
  var dnaEl = $('.dna');
  var camera = new THREE.PerspectiveCamera(75, dnaEl.width()/dnaEl.height(), 0.1, 1000);

  var renderer = Detector.webgl? new THREE.WebGLRenderer( { antialias: true } ): new THREE.CanvasRenderer();

  renderer.setSize(dnaEl.width(), dnaEl.height());
  dnaEl.append(renderer.domElement);

  camera.position.z = 50;

  dna = new THREE.Object3D();
  holder = new THREE.Object3D();

  dna.position.y = -40;
  holder.add(dna)
  scene.add(holder);


  var render = function () {

    requestAnimationFrame(render);

    holder.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  render();
}

function moveUp() {
  holder.position.y += 2;
}

function addNucleotide(i, nucleotide) {
  var row = nucleotideFor(nucleotide);

  row.position.y = -i*2;
  row.rotation.y = 30*i * Math.PI/180;

  dna.add(row);
}

function nucleotideFor(nucleotide) {
  var purple = 0x9C27B0;
  var purpleMaterial = new THREE.MeshBasicMaterial( { color: purple } );
  var indigo = 0x3F51B5;
  var indigoMaterial = new THREE.MeshBasicMaterial( { color: indigo } );
  

  var tubeGeometry = new THREE.CylinderGeometry(0.3,0.3,6,32);
  var ballGeometry = new THREE.SphereGeometry(0.8,32,32);

  var purpleTube = new THREE.Mesh(tubeGeometry, purpleMaterial);
  purpleTube.rotation.z = 90 * Math.PI/180; 
  purpleTube.position.x = -3;

  var indigoTube = new THREE.Mesh(tubeGeometry, indigoMaterial );
  indigoTube.rotation.z = 90 * Math.PI/180;
  indigoTube.position.x = 3;

  switch(nucleotide) {
  case "A":
  case "T":
    var blue = 0x2196F3; // A
    var yellow = 0xFFEB3B; // T
    var blueMaterial = new THREE.MeshBasicMaterial( { color: blue } );
    var yellowMaterial = new THREE.MeshBasicMaterial( { color: yellow } );
    if (nucleotide === "A") {
      rightMaterial = blueMaterial;
      leftMaterial = yellowMaterial;
    } else {
      rightMaterial = yellowMaterial;
      leftMaterial = blueMaterial;
    }
    break;
  case "G":
  case "C":
    var red = 0xF44336; // C
    var green = 0x4CAF50; // G
    var redMaterial = new THREE.MeshBasicMaterial( { color: red } );
    var greenMaterial = new THREE.MeshBasicMaterial( { color: green } );
    if (nucleotide === "C") {
      var rightMaterial = redMaterial;
      var leftMaterial = greenMaterial;
    } else {
      var rightMaterial = greenMaterial;
      var leftMaterial = redMaterial;
    }
    break;
  default:
    console.log("Default: "+nucleotide);
  }

  var ballRight = new THREE.Mesh( ballGeometry, rightMaterial );
  ballRight.position.x = 6;

  var ballLeft = new THREE.Mesh( ballGeometry, leftMaterial );
  ballLeft.position.x = -6;

  var row = new THREE.Object3D();
  row.add(purpleTube);
  row.add(indigoTube);
  row.add(ballRight);
  row.add(ballLeft);
  return row;
}

Template.player.rendered = function() {
  renderDNA();
  // renderSequence();
  // Observe changes
  Meteor.call("job", function(error, id) {
    if (!!error) {
      return;
    }
    Session.set('job', id);
    
    var query = Jobs.find({_id: id});
    var queryLength = 10;
    holder.position.y = queryLength*2.1;

    query.observeChanges({
      changed: function(id, fields) {
        var lastDNA = fields.dna[fields.dna.length-1];
        var lastNote = fields.music[fields.music.length-1];
        moveUp();
        addNucleotide(fields.dna.length-1, lastDNA);
        // addSequence(fields.dna.join(''));
      }
    });
  });
}

Template.layout.events({
  'click #new-job': function() {
    location.reload();
  }
});

Template.player.helpers({
  dnaText: function() {
    // console.log(Jobs.findOne({_id: Session.get('job')}));
    var j = Jobs.findOne({_id: Session.get('job')})
    if (j) return j.dna.join('');
  },

  notesText: function() {
    var j = Jobs.findOne({_id: Session.get('job')});
    var notes = "";
    if (j) {
      for (var i = 0; i < j.music.length; i++) {
        var n = j.music[i].message[1];
        notes += " " + midimap[n];
      }
    }
    return notes;
  }
})
