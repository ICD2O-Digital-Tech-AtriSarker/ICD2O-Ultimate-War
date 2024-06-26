/* global Phaser */

import enemyHandler from "./enemyHandler.js"
import UIhandler from "./UIhandler.js"

// GAME SCENE
class GameScene extends Phaser.Scene {
  // Constructor, called upon "new"
  constructor() {
    super({ key: "gameScene" })
  }

  // INITIALIZE
  init(data) {
    // Get restart data
    this.restarted = data.restart

    // SET BACKGROUND COLOR TO BLACK
    this.cameras.main.setBackgroundColor("#575757")

    // CONTROL LAYOUT
    this.controls = {}
    this.controls["LEFT"] = this.input.keyboard.addKey("LEFT")
    this.controls["RIGHT"] = this.input.keyboard.addKey("RIGHT")
    this.controls["UP"] = this.input.keyboard.addKey("UP")
    this.controls["DOWN"] = this.input.keyboard.addKey("DOWN")

    this.controls2 = {}
    this.controls2["LEFT"] = this.input.keyboard.addKey("A")
    this.controls2["RIGHT"] = this.input.keyboard.addKey("D")
    this.controls2["UP"] = this.input.keyboard.addKey("W")
    this.controls2["DOWN"] = this.input.keyboard.addKey("S")

    // HELPER FUNCTION FOR CONTROL
    this.isKeyDown = (inputKey) => {
      if (this.controls[inputKey].isDown || this.controls2[inputKey].isDown) {
        return 1
      } else {
        return 0
      }
    }

    // FUNCTION THAT RETURNS NORMALIZED DIRECTION VECTOR
    // FOR PLAYER MOVEMENT
    this.getDir = () => {
      let planeX = this.isKeyDown("RIGHT") - this.isKeyDown("LEFT")
      let planeY = this.isKeyDown("DOWN") - this.isKeyDown("UP")

      // PYTHAGORAS THEOREM
      let planeLength = Math.sqrt(planeX * planeX + planeY * planeY)

      // Edge case: if the length is 0, then the vector is 0
      if (planeLength === 0) {
        return { x: 0, y: 0 }
      }

      // NORMALIZED DIRECTION VECTOR
      planeX *= 1 / planeLength
      planeY *= 1 / planeLength

      // RETURN DIRECTION VECTOR
      return { x: planeX, y: planeY }
    }

    // PLAYER STATS
    this.plrStats = this.registry.get("playerStats")

    this.plrSpeed = this.plrStats.speed
    this.plrAttackSpeed = this.plrStats.attackSpeed
    this.plrMaxHealth = this.plrStats.maxHealth
    this.plrDamage = this.plrStats.damage
    this.plrXp = this.plrStats.xp
    this.plrLevel = this.plrStats.level

    // MAX LEVEL
    this.maxLevel = 40

    // SET HP TO MAX HP
    this.plrHealth = this.plrMaxHealth

    // GROUP FOR PLAYER PROJECTILES
    this.plrProjectiles = this.physics.add.group()
    // DEBOUNCE FOR ATTACK COOLDOWN
    this.plrProjDebounce = true

    // DEFAULT CHOSEN WEAPON
    this.plrWeapon = "rocket"

    // VARAIBLE TO STORE CURRENT WEAPON SPRITE BOTTOM-LEFT
    this.selectedWeaponImg = null

    this.enemyHandler = new enemyHandler(this)
    this.UI = new UIhandler(this)

    this.wallGroup = null
  }

  // Preload, for loading assets
  preload() {
    console.log("Game Scene")

    // ARENA
    this.load.image("gameBackground", "./assets/gameBackground.png")
    // PLAYER
    this.load.image("player", "./assets/player.png")
    // ROCKET
    this.load.image("rocket", "./assets/projectiles/rocket.png")
    // AXE
    this.load.image("axe", "./assets/projectiles/axe.png")

    // Load enemy assets
    this.enemyHandler.loadAssets()

    // LOAD BACKGROUND MUSIC
    // Attribution :
    // EpicBattle J by PeriTune | https://peritune.com/
    // Music promoted by https://www.chosic.com/free-music/all/
    // Creative Commons CC BY 4.0
    // https://creativecommons.org/licenses/by/4.0/
    this.load.audio("gameMusic", "./sounds/gameMusic.mp3")
  }

  // Create, happens after preload() is complete
  create(data) {
    // ARENA
    this.gameBackground = this.physics.add.sprite(400, 300, "gameBackground")

    // GAME AREA, WHERE PLAYERS AND ENEMIES ARE SITUATED
    // PLAYER CANNOT EXIT GAME AREA
    this.gameArea = this.add.rectangle(400, 260, 650, 330, 0xff0000, 0)

    // WALL GROUP
    this.wallGroup = this.physics.add.group()
    // WALLS
    this.wall1 = this.physics.add.sprite(400, 470)
    this.wall1.body.setSize(800, 40)
    this.wall2 = this.physics.add.sprite(400, 40)
    this.wall2.body.setSize(800, 40)
    this.wall3 = this.physics.add.sprite(745, 260)
    this.wall3.body.setSize(40, 600)
    this.wall4 = this.physics.add.sprite(55, 260)
    this.wall4.body.setSize(40, 600)

    // ADD WALLS TO GROUP
    this.wallGroup.add(this.wall1)
    this.wallGroup.add(this.wall2)
    this.wallGroup.add(this.wall3)
    this.wallGroup.add(this.wall4)

    this.wallGroup.children.each((wall) => {
      wall.body.immovable = true
    })

    // COLLISION BETWEEN ENEMY AND WALL
    this.physics.add.collider(
      this.enemyHandler.Enemies,
      this.wallGroup,
      function (enemy, wall) {
        enemy.x = Phaser.Math.Clamp(
          enemy.x,
          this.gameArea.x - (this.gameArea.width - enemy.width) / 2,
          this.gameArea.x + (this.gameArea.width - enemy.width) / 2
        )
        enemy.y = Phaser.Math.Clamp(
          enemy.y,
          this.gameArea.y - (this.gameArea.height - enemy.height) / 2,
          this.gameArea.y + (this.gameArea.height - enemy.height) / 2
        )

        enemy.setVelocity(
          (Math.random() * 2 - 1) * 200,
          (Math.random() * 2 - 1) * 200
        )
      }.bind(this)
    )

    // ADD THE PLAYER SPRITE TO THE GAME
    this.player = this.physics.add.sprite(400, 300, "player").setScale(0.8)
    this.player.body.setSize(40, 40)
    this.player.setPushable(false)

    // CONNECT LMB TO SWITCHING PLAYER WEAPON
    this.input.on(
      "pointerdown",
      function (pointer) {
        this.switchWeapon()
      },
      this
    )

    // CROSSHAIR STYLE FOR CURSOR
    this.sys.canvas.style.cursor = "crosshair"

    // this.enemyHandler.spawnEnemy("goose", 500, 350)
    // this.enemyHandler.spawnEnemy("bulk", 100, 200)
    // this.enemyHandler.spawnEnemy("warrior", 500, 150)

    // Create Music Toggle Button
    this.musicButton = this.UI.createButton(
      400,
      500,
      "MUSIC : ON",
      function () {
        this.sound.mute = !this.sound.mute
        if (this.sound.mute) {
          this.musicButton.setText("MUSIC : OFF")
        } else {
          this.musicButton.setText("MUSIC : ON")
        }
      }.bind(this)
    )
    // Initial
    this.sound.mute = false
    if (this.sound.mute) {
      this.musicButton.setText("MUSIC : OFF")
    } else {
      this.musicButton.setText("MUSIC : ON")
    }

    // Create DEBUG Toggle button
    this.debugButton = this.UI.createButton(
      400,
      550,
      "DEBUG : OFF",
      function () {
        this.physics.world.drawDebug = !this.physics.world.drawDebug
        if (this.physics.world.drawDebug) {
          this.debugButton.setText("DEBUG : ON")
        } else {
          this.debugButton.setText("DEBUG : OFF")
          this.physics.world.debugGraphic.clear()
        }
      }.bind(this)
    )
    this.physics.world.drawDebug = false
    this.physics.world.debugGraphic.clear()

    // Create Pause Button
    this.pauseButton = this.UI.createButton(
      650,
      525,
      "PAUSE",
      function () {
        this.scene.launch("pauseScene")
        this.scene.pause("gameScene")
      }.bind(this)
    )

    // HP BAR
    this.plrHpBar = this.UI.createBar(160, 500, 200, 32, "HP")
    this.plrHpBar.setFillStyle(0x00ff00)
    // XP BAR
    this.plrXpBar = this.UI.createBar(160, 540, 200, 32, "XP")
    this.plrXpBar.setFillStyle(0x0000ff)

    // ADD COLLIDERS
    this.enemyHandler.addColliders()

    this.enemyHandler.addText()

    // WEAPON CIRCLE AT BOTTOM
    this.switchWeapon()
    this.switchWeapon()

    // Text for Level at top-right corner
    this.levelText = this.add.text(575, 10, `LEVEL: ${this.plrLevel + 1}`, {
      fontFamily: "Oswald",
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "normal",
      strokeThickness: 3,
      shadow: {
        color: "#000000",
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 3,
        stroke: true,
      },
      padding: { left: 4, right: 16, top: 4, bottom: 4 },
      maxLines: 1,
    })

    // PLAY MUSIC
    this.gameMusic = this.sound.add("gameMusic")
    this.gameMusic.loop = true
    this.gameMusic.setRate(1)
    this.gameMusic.play({ volume: 0.7 })
  }

  // Delta update loop, loops whilst the scene is active
  update(time, delta) {
    if (this.resetScene) {
      this.gameMusic.stop()
      this.gameMusic.destroy()
      this.scene.restart()
      this.resetScene = false
      return
    }

    // GET DIRECTION VECTOR
    let dir = this.getDir()
    // MOVE PLAYER FORWARD WITH DIRECTION VECTOR
    this.player.body.setVelocityX(dir.x * this.plrSpeed + 0.1)
    this.player.body.setVelocityY(dir.y * this.plrSpeed + 0.1)

    // PREVENT PLAYER FROM EXITING GAME AREA
    // CLAMPS PLAYER POSITION TO ONLY BE WITHIN GAME AREA
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      this.gameArea.x - this.gameArea.width / 2,
      this.gameArea.x + this.gameArea.width / 2
    )
    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      this.gameArea.y - this.gameArea.height / 2,
      this.gameArea.y + this.gameArea.height / 2
    )

    // CODE FOR SHOOTING PROJECTILE
    // USES DEBOUNCE TO PREVENT PLAYER FROM SHOOTING TOO MUCH
    if (this.plrProjDebounce) {
      // TURN ON DEBOUNCE
      this.plrProjDebounce = false
      // Create projectile at player
      let newProjectile = this.physics.add.sprite(
        this.player.x,
        this.player.y,
        this.plrWeapon
      )

      // MAKE PROJECTILE THE CHOSEN WEAPON TYPE
      newProjectile.weaponType = this.plrWeapon

      // Make projectile face mouse
      // 1.57 is precalculated estimate of Math.PI / 2,
      // which is 180 degrees
      // which is added due to the orientation of the image
      let cursor = this.input.activePointer
      newProjectile.rotation =
        Phaser.Math.Angle.Between(
          newProjectile.x,
          newProjectile.y,
          cursor.worldX,
          cursor.worldY
        ) + 1.57

      // PROJECTILE IS INSTANTLY PUSHED A BIT
      // FOR BETTER EFFECT, ( NOT ON TOP OF PLAYER )
      newProjectile.x += Math.sin(newProjectile.rotation) * 27
      newProjectile.y -= Math.cos(newProjectile.rotation) * 27

      // axe
      if (newProjectile.weaponType === "axe") {
        newProjectile.setScale(0.5)
      }
      // rocket
      else {
        newProjectile.body.setSize(20, 20)
      }

      // unique id, for enemy collision
      newProjectile.id = Math.random()

      newProjectile.setPushable(false)

      // ADD PROJECTILE TO POOL/GROUP
      this.plrProjectiles.add(newProjectile)

      // TURN OFF DEBOUNCE AFTER 500ms
      // FOR NEXT SHOT
      this.time.addEvent({
        delay: 1000 / this.plrAttackSpeed,
        callback: () => {
          this.plrProjDebounce = true
        },
      })
    }

    this.enemyHandler.handleAction(time, delta)

    // Go through each player projectile
    // and apply movement
    this.plrProjectiles.children.each((proj) => {
      // ROCKETS
      if (proj.weaponType === "rocket") {
        let rocket = proj
        // MOVE ROCKET FORWARD
        rocket.x += Math.sin(rocket.rotation) * 0.3 * delta
        rocket.y -= Math.cos(rocket.rotation) * 0.3 * delta

        // if rocket completely leaves gameArea, delete it
        if (
          rocket.x < this.gameArea.x - this.gameArea.width / 1.6 ||
          rocket.x > this.gameArea.x + this.gameArea.width / 1.6 ||
          rocket.y < this.gameArea.y - this.gameArea.height / 1.6 ||
          rocket.y > this.gameArea.y + this.gameArea.height / 1.6
        ) {
          // Delete rocket
          rocket.destroy()
        }
      }
      // AXES
      else if (proj.weaponType === "axe") {
        let axe = proj
        // MOVE AXE FORWARD
        axe.x += Math.sin(axe.rotation) * 0.05 * delta
        axe.y -= Math.cos(axe.rotation) * 0.05 * delta

        axe.lifespan -= delta
        if (axe.lifespan) {
          // if axe existed for longer than 700ms delete it
          if (axe.lifespan < 0) {
            axe.destroy()
          }
        } else {
          // Initialize 700ms lifespan for axe
          axe.lifespan = 700
        }
      }
    })

    // UPDATE HP BAR
    this.plrHpBar.update(this.plrMaxHealth, this.plrHealth)

    // XP, LEVEL AND XP BAR
    if (this.plrXp >= this.xpAmountForLevel(this.plrLevel + 1)) {
      this.levelUp()
    }

    this.plrXpBar.update(
      this.xpAmountForLevel(this.plrLevel + 1) -
        this.xpAmountForLevel(this.plrLevel),
      this.plrXp - this.xpAmountForLevel(this.plrLevel)
    )

    if (this.plrHealth <= 0) {
      // GAMEOVER
      // os.delete("system32")
      this.gameOver()
    }
  }

  // Function to switch player weapon between rocket and axe
  switchWeapon() {
    // IF current weapon is rocket, switch to axe
    // vice versa
    if (this.selectedWeaponImg != null) {
      this.selectedWeaponImg.destroy()
    }

    if (this.plrWeapon == "rocket") {
      this.plrWeapon = "axe"
      // DRAW AXE ON BOTTOM LEFT CIRCLE
      this.selectedWeaponImg = this.add.sprite(75, 525, "axe").setScale(0.7)
    } else {
      this.plrWeapon = "rocket"
      // DRAW ROCKET ON BOTTOM LEFT CIRCLE
      this.selectedWeaponImg = this.add.sprite(75, 525, "rocket").setScale(1.8)
    }
  }

  gameOver() {
    // STOP MUSIC
    this.gameMusic.stop()
    this.gameMusic.destroy()

    // SAVE STATS
    let savedStats = {}
    savedStats.speed = this.plrSpeed
    savedStats.attackSpeed = this.plrAttackSpeed
    savedStats.maxHealth = this.plrMaxHealth
    savedStats.damage = this.plrDamage
    savedStats.xp = this.plrXp
    savedStats.level = this.plrLevel

    // ADD STATS TO DATA REGISTRY
    this.registry.set("playerStats", Object.assign({}, savedStats))

    this.cameras.main.setBackgroundColor("#ff0000")
    this.player.setTint(0x000000)
    this.gameBackground.setTint(0xff0000)
    this.enemyHandler.Enemies.children.each((enemy) => {
      enemy.setTint(0x000000)
    })

    this.scene.launch("gameOverScene")
    this.scene.pause("gameScene")
    this.resetScene = true
  }

  victory() {
    if (this.resetScene) {
      this.scene.restart()
      this.resetScene = false
      return
    }

    // STOP MUSIC
    this.gameMusic.stop()
    this.gameMusic.destroy()

    // SAVE STATS
    let savedStats = {}
    savedStats.speed = this.plrSpeed
    savedStats.attackSpeed = this.plrAttackSpeed
    savedStats.maxHealth = this.plrMaxHealth
    savedStats.damage = this.plrDamage
    savedStats.xp = this.plrXp
    savedStats.level = this.plrLevel

    // ADD STATS TO DATA REGISTRY
    this.registry.set("playerStats", Object.assign({}, savedStats))

    this.cameras.main.setBackgroundColor("#00ff00")
    this.player.setTint(0x000000)
    this.gameBackground.setTint(0x00ff00)

    this.scene.launch("victoryScene")
    this.scene.pause("gameScene")
    this.resetScene = true
  }

  // Function for amount of xp needed for a level
  xpAmountForLevel(levelNum) {
    if (levelNum <= 0) {
      return 0
    }
    if (levelNum >= this.maxLevel) {
      return Infinity
    }
    return 50 * (levelNum * (levelNum + 1))
  }

  // Function that is called on levelUp
  levelUp() {
    this.plrLevel += 1
    if (this.plrLevel >= this.maxLevel - 1) {
      this.levelText.setText(`LEVEL: ${this.maxLevel} (MAX)`)
      this.levelText.x -= 150
    } else {
      this.levelText.setText(`LEVEL: ${this.plrLevel + 1}`)
    }

    // FULL HP
    this.plrHealth = this.plrMaxHealth

    // Pause Game and add upgrade scene
    this.scene.launch("upgradeScene")
    this.scene.pause("gameScene")
  }
}

export default GameScene
