/* global Phaser */

import UIhandler from "./UIhandler.js"
// TITLE SCENE
class TitleScene extends Phaser.Scene {

  // Constructor, called upon "new"
  constructor() {
    super({ key: 'titleScene' });
  }

  // Initializer, called upon "start"
  init(data) {
    // SET BACKGROUND COLOR TO BLACK
    this.cameras.main.setBackgroundColor('#000000');
    
    // PLAYER STATS
    let playerStats = {}
    playerStats.speed = 200
    playerStats.attackSpeed = 1
    playerStats.maxHealth = 100
    playerStats.damage = 10
    playerStats.xp = 0
    playerStats.level = 0

    // MAKE PLAYER STATS GLOBAL
    this.registry.set('playerStats', Object.assign({},playerStats))

    // UI
    this.UI = new UIhandler(this)
  }

  // Preload, for loading assets
  preload() {
    console.log('Title Scene');
    // LOAD ASSETS FOR TITLE SCREEN

    // TITLE SCREEN VIDEO
    this.load.video("titleVideo", "./assets/titleScreen.mp4");
    // TITLE SCREEN MUSIC
    this.load.audio("titleMusic", "./sounds/titleMusic.mp3");

    // PLAY BUTTON
    this.load.image("playButton", "./assets/playButton.png");
  }

  // Create, happens after preload() is complete
  create(data) {
    
    // This line of code makes it so 
    // that sound isn't muted when game is out of input focus
    this.sound.pauseOnBlur = false;

    // DRAW VIDEO ONTO SCREEN
    this.titleVideo = this.add.video(0, 0, "titleVideo")
    // VIDEO IS CENTERED
    this.titleVideo.x = this.cameras.main.width / 2
    this.titleVideo.y = this.cameras.main.height / 2
    // RESIZE TO MAKE VIDEO FIT SCREEN
    this.titleVideo.scaleY = 1.3;

    // MAKES THE VIDEO LOOP
    // WHENEVER VIDEO ENDS, VIDEO PLAYS AGAIN
    this.titleVideo.on('complete', () => {
      this.titleVideo.play();
    });

    // INITIALIZE sound object for TITLE MUSIC
    this.titleMusic = this.sound.add("titleMusic", {volume: 0.1})

    // MAKES THE MUSIC LOOP
    this.titleMusic.on("complete", () => {
      this.titleMusic.play();
    })

    // PLAY BUTTON
    this.playButton = this.add.sprite(400,450,"playButton");
    this.playButton.setScale(2);

    // CONNECT PLAY BUTTON CLICK TO STARTING THE GAME
    this.playButton.setInteractive({useHandCursor : true});
    this.playButton.on( "pointerdown", () => {
      // STOP MUSIC
      this.titleMusic.stop()
      // SWITCH TO GAME SCENE
      this.scene.switch("gameScene");
    } );

    // PLAY TITLE SCREEN VIDEO AND MUSIC
    this.titleMusic.play();
    this.titleVideo.play();

    this.UI.createButton(400, 550, "INSTRUCTIONS", function() {
      console.log("CLICKED")
      this.scene.switch("instructionsScene");
    }.bind(this))
  }
  
  // Delta update loop, loops whilst the scene is active
  update(time, delta) {
    // pass
  }
}

export default TitleScene