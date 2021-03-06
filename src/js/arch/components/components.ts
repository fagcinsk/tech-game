import * as PIXI from 'pixi.js'
import Component from '../ecs/component'
import Entity from '../ecs/entity'
import ProgressBar from '../../ui/progressbar'
import {limit} from '../../utils/geometry'


export class Health implements Component {
  max: number = 100
  value: number = 100
  lifeIndicator: ProgressBar

  constructor(options: { max?: number, health?: number }) {
    if (options) {
      Object.assign(this, options)
      if (options.health === undefined) this.value = this.max
    }
  }

  take(damage: Damage) {
    this.value -= damage.value
    if (this.value < 0) this.value = 0
    if (this.lifeIndicator) this.lifeIndicator.setProgress(this.value)
  }

  enableIndication() {
    this.lifeIndicator = new ProgressBar(32, 4, this.max, this.value)
  }

  disableIndication() {
    this.lifeIndicator.destroy()
    this.lifeIndicator = null
  }

  destroy() {
    this.lifeIndicator && this.lifeIndicator.destroy()
  }
}

export class Position extends PIXI.Point implements Component {

  constructor(options?: {}) {
    super()
    if (options) Object.assign(this, options)
  }
}

export class Damage implements Component {
  value: number
  from: Entity
  to: Entity

  constructor(options?: { from: Entity; to: Entity; value: number }) {
    if (options) Object.assign(this, options)
  }
}

export class DamageSource implements Component {
  value: number
  from: Entity

  constructor(options?: { from: Entity; value: number }) {
    if (options) Object.assign(this, options)
  }
}

export class Moving implements Component {
  mass: number = 1
  force: PIXI.IPoint = new PIXI.Point(0, 0)
  velocity: PIXI.IPoint = new PIXI.Point(0, 0)
  direction: number = 0
  maxVelocity: number = 12 // TODO: needed?

  constructor(options?: {}) {
    if (options) Object.assign(this, options)
  }
}

export class Destroy implements Component {
}

export class Solid extends PIXI.Rectangle implements Component {
  collisions: {[entityId: number]: Entity} = {}
}

export class Dead implements Component {
}

export class Dissolve implements Component {
  value: number
  max: any

  constructor(options?: { value?: number, max: number }) {
    if (options) Object.assign(this, options)
    if (options.value === undefined) this.value = this.max
  }
}

export class RenderObject extends PIXI.Container implements Component {
  texture: string | Array<string>
  sprite: PIXI.AnimatedSprite | PIXI.Sprite
  animationSpeed: number = 0.25

  constructor(options?: {}) {
    super()

    if (options) Object.assign(this, options)


    if (this.texture instanceof Array) {
      const textures = this.texture.map(texture => {
        const t = window.app.textures[texture]
        if (!t) console.warn(`Texture "${texture}" not exists`)
        return t
      })
      this.sprite = new PIXI.AnimatedSprite(textures)
      this.sprite.animationSpeed = this.animationSpeed
      this.sprite.play()
    } else {
      const texture = window.app.textures[this.texture]
      if (!texture) console.warn(`Texture "${this.texture}" not exists`)
      this.sprite = new PIXI.Sprite(texture)
    }

    this.addChild(this.sprite)
    this.sprite.anchor.set(0.5, 0.5)
  }
}

const PowerSource = {
  AIR: {current: 0.05},
  THERMAL: {current: 0.01},
  MECHANICAL: {current: 1},
  FUEL: {current: 3.9},
}

export class Energy implements Component {
  totalCapacity: number = 100
  capacity: number = 0

  constructor(options: { totalCapacity?: number, capacity?: number }) {
    if (options) Object.assign(this, options)
  }
}

export class EnergyGenerator extends Energy implements Component {
  powerSource: {} = PowerSource.THERMAL
  range: number = 64

  constructor(options: { type?: string, maxPowerStorage?: number, powerStorageLevel?: number }) {
    super(options)
    if (options.type) this.powerSource = PowerSource[options.type]
  }

  generate() {
    this.capacity += this.powerSource.current
  }
}

export class EnergyTransponder extends Energy implements Component {
  source: Entity
  range: number = 128
  current: number = 3

  constructor(options: { source: Entity }) {
    super(options)
    if (options) Object.assign(this, options)
  }

  takeFrom(source: Energy) {
    if (this.capacity >= this.totalCapacity) return
    const taken = limit(this.current, source.capacity)
    this.capacity += taken
    source.capacity -= taken
    return taken
  }
}

export class EnergyConsumer extends Energy implements Component {
  source: Entity
  load: number = 1

  constructor(options: { source: Entity }) {
    super(options)
    if (options) Object.assign(this, options)
  }

  takeFrom(source: Energy) {
    if (this.capacity >= this.totalCapacity) return
    const taken = limit(this.load, source.capacity)
    this.capacity += taken
    source.capacity -= taken
  }

  consume() {
    if (this.capacity >= this.load) {
      this.capacity -= this.load
      return this.load
    }
    return 0
  }
}

export class Slots {
  items: Array<Entity> = []
  places: Array<string> = []

  constructor(options: { items: [] }) {
    if (options) Object.assign(this, options)
  }
}

export class Team implements Component {
  value: string

  constructor(options: { value: string }) {
    if (options) Object.assign(this, options)
  }
}

const Weapons = {
  MACHINE_GUN: {
    roundCapacity: 50,
    initialCapacity: 2500,
    reloadTime: 5000,
    damage: 12,
    fireDelay: 25,
    spreadAngle: 15,
  },
}

export class Weapon implements Component {
  capacity: number = 0
  lastFire: number = 0

  roundCapacity: number
  initialCapacity: number
  reloadTime: number
  damage: number
  fireDelay: number
  spreadAngle: number

  constructor(options: {}) {
    if (options) Object.assign(this, options)
    this.capacity = this.initialCapacity || 0
  }
}

export class Armed implements Component {
  type: string = 'NONE'
  weapon: Weapon

  constructor(options: {}) {
    if (options) Object.assign(this, options)
    this.weapon = new Weapon(Weapons[this.type])
  }
}

export class LifeTime implements Component {
  value: number = 10000

  constructor(options: {}) {
    if (options) Object.assign(this, options)
  }
}

export class Factory implements Component {

  constructor(options: {}) {
    if (options) Object.assign(this, options)
  }
}

export class Selectable implements Component {
  selected: boolean = false
  color: number = 0xff0000

  constructor(options: {}) {
    if (options) Object.assign(this, options)
  }
}


export class Debug implements Component {
  attributes: Array<string> = null
  entity: Entity
  debugInfo: PIXI.Container
  debugText: PIXI.Text
  debugTextTemplate: string

  constructor(options: {}) {

    if (options) Object.assign(this, options)

    if (this.attributes || this.debugTextTemplate) {
      this.debugInfo = new PIXI.Container()

      this.debugText = new PIXI.Text('', {fontSize: 11, fontFamily: 'monospace'})
      this.debugText.roundPixels = true

      this.debugInfo.addChild(this.debugText)
    }

    if (this.attributes) {
      // TODO compose text template string
      this.debugTextTemplate = ''
      this.attributes.forEach((attributeName) => {
        this.debugTextTemplate += attributeName + ': ${JSON.stringify(this.entity.' + attributeName + ',null,2)}\n'
      })
    }
  }

  static interpolate(templateString: string, templateVars: {}) {
    return new Function('return `' + templateString + '`;').call(templateVars)
  }

  update(dt: number) {
    this.debugText.rotation = -this.entity.RenderObject.rotation
    this.debugText.text = Debug.interpolate(this.debugTextTemplate, this)
  }
}