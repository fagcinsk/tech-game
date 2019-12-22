import State from './state'
import * as PIXI from 'pixi.js'
import TestState from './test'

const spriteSheetJson = '/ss.json'
const spriteSheet2Json = '/swss.json'

export default class SplashState extends State {
  constructor() {
    super()

    this.progressbar = new PIXI.Container()

    this.progressbarText = new PIXI.Text('Loading...', {fill: 0})

    this.progressBarWidth = app.screen.width - 64
    this.progressbarText.position.y = -32

    this.progressbarGraphics = new PIXI.Graphics()

    const progressbarRect = new PIXI.Graphics()
      .lineStyle(1, 0xffffff, 1, 1)
      .beginFill(0x223344)
      .drawRect(0, 0, this.progressBarWidth, 16)
      .endFill()


    this.progressbar.addChild(this.progressbarText)
    this.progressbar.addChild(progressbarRect)
    this.progressbar.addChild(this.progressbarGraphics)

    this.progressbar.pivot.set((this.progressbar.width / 2) | 0, (this.progressbar.height / 2) | 0)

    this.addChild(this.progressbar)
    this.progressbar.position.set((app.screen.width / 2) | 0, (app.screen.height / 2) | 0)

    this.loader.add('ss', spriteSheetJson)
    this.loader.add('ss2', spriteSheet2Json)
    this.loader.load()
  }

  drawProgress(percent) {
    this.progressbarGraphics
      .clear()
      .beginFill(0x882222)
      .drawRect(0, 0, app.screen.width - 64, 16)
      .endFill()

    if(percent<100) {
      this.progressbarText.text = `Loading... ${percent}%`
    } else {
      this.progressbarText.text = 'Ready.'
    }
  }

  init(loader, resources) {
    app.textures = {...resources.ss.textures, ...resources.ss2.textures}
    this.removeChildren()
    app.stateManager.push(new TestState(app))
  }

  progress(loader, resources) {
    this.drawProgress(loader.progress)
  }
}