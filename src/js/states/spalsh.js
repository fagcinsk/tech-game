import State from "./state"

import checkers from '../../assets/checkers.png'
import spriteSheetPng from '../../assets/ss.png'
import spriteSheetJson from '../../assets/ss.json'
import * as PIXI from "pixi.js"
import TestState from "./test"

export default class SplashState extends State {
  constructor(app) {
    super(app)

    this.progressbar = new PIXI.Container()

    this.progressbarText = new PIXI.Text('Loading...', {fill:0xffffff})

    this.progressbarText.position.y = -32

    this.progressbarGraphics = new PIXI.Graphics()
    const progressbarRect = new PIXI.Graphics()
    progressbarRect.lineStyle(1, 0xffffff, 1, 1)
    progressbarRect.beginFill(0x223344)
    this.progressBarWidth = this.app.screen.width - 64
    progressbarRect.drawRect(0, 0, this.progressBarWidth, 16)
    progressbarRect.endFill()


    this.progressbar.addChild(this.progressbarText)
    this.progressbar.addChild(progressbarRect)
    this.progressbar.addChild(this.progressbarGraphics)

    this.progressbar.pivot.set((this.progressbar.width / 2) | 0, (this.progressbar.height / 2) | 0)

    this.addChild(this.progressbar)
    this.progressbar.position.set((this.app.screen.width / 2) | 0, (this.app.screen.height / 2) | 0)

    this.loader.add('ss', spriteSheetPng)
    this.loader.load()
  }

  drawProgress(percent) {
    this.progressbarGraphics.clear()
    this.progressbarGraphics.beginFill(0x882222)
    this.progressbarGraphics.drawRect(0, 0, this.app.screen.width - 64, 16)
    this.progressbarGraphics.endFill()

    this.progressbarText.text = `Loading... ${percent}%`
  }

  init(loader, resources) {
    const spriteSheetTexture = resources.ss.texture
    const spriteSheet = new PIXI.Spritesheet(spriteSheetTexture, spriteSheetJson)
    spriteSheet.parse(textures => {
      this.app.textures = textures
      this.app.stateManager.push(new TestState(this.app))
    })
  }

  progress(loader, resources) {
    this.drawProgress(loader.progress)
  }
}