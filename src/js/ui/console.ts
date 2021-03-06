import * as PIXI from 'pixi.js'

class Message {
  id: number
  time: Date
  level: number
  removeAt: number
  text: string
}

export default class Console extends PIXI.Container {
  counter: number
  PADDING: number
  MAX_WIDTH: number
  levels: { LOW: number; URGENT: number; }
  messages: Message[]
  msgContainer: PIXI.Container
  consoleBg: PIXI.Graphics

  constructor() {
    super()

    this.counter = 0
    this.PADDING = 8
    this.MAX_WIDTH = 200

    this.levels = {
      LOW: 5000,
      URGENT: 60000,
    }

    this.messages = []

    this.msgContainer = new PIXI.Container()

    this.consoleBg = new PIXI.Graphics()

    this.addChild(this.consoleBg)
    this.addChild(this.msgContainer)
    this.updateConsoleBg()
  }

  updateConsoleBg() {
    this.consoleBg.clear()
    if (this.messages.length === 0) {
      this.consoleBg.drawRect(0, 0, this.MAX_WIDTH, 1)
      return
    }
    this.consoleBg
      .beginFill(0x253B45, 0.75)
      .drawRect(0, 0, this.MAX_WIDTH, this.msgContainer.height + this.PADDING)
      .endFill()
  }

  refreshMessages() { // TODO: remove messages and realign
    this.msgContainer.removeChildren()
    this.messages.forEach(msg => {
      const msgName = `msg_${msg.id}`

      if (this.msgContainer.getChildByName(msgName)) return

      const text = `${msg.time.toLocaleString()}\n${msg.text}`
      const message = new PIXI.Text(text, {
        fill: 0xffffff,
        fontSize: 12,
        padding: 4,
        wordWrapWidth: this.MAX_WIDTH - this.PADDING * 2,
        wordWrap: true,
      })

      message.name = msgName
      message.position.x = this.PADDING
      message.position.y = this.msgContainer.height + this.PADDING
      this.msgContainer.addChild(message)
    })
    this.updateConsoleBg()
  }

  addMessage(text: any, level: number) {
    const id = this.counter++
    level = level || this.levels.LOW
    const time = new Date()
    this.messages.push({
      id, text, level, time, removeAt: +time + level,
    })
    this.refreshMessages()
  }

  update(dt: number) {
    const nowTimestamp = +new Date()
    const removedMessages = []

    let i = this.messages.length

    while (i--) {
      if (this.messages[i].removeAt < nowTimestamp) {
        removedMessages.push(this.messages.splice(i, 1))
      }
    }

    if (removedMessages.length) this.refreshMessages()
  };

}