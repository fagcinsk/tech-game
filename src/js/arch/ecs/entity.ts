import Component, {ComponentType} from './component'
import * as Components from '../components/components'
import {Health, RenderObject, Slots} from '../components/components'
import * as PIXI from 'pixi.js'
import World from './world'

export default class Entity {

  static __uid: number = 0
  _uid: number
  _name: string
  world: World

  [key: string]: any

  constructor(name: string, world: World) {
    if(!world) throw `World required for entity`
    this.world = world
    this._uid = ++Entity.__uid
    this._name = name
  }

  _components: { [name: string]: any } = {}

  get components() {
    return this._components
  }

  get componentNames(): string[] {
    return Object.keys(this._components)
  }

  addComponent<T extends Component>(component: T): Entity {
    const name = component.constructor.name

    Object.defineProperty(this, name, {
      configurable: true,
      enumerable: true,
      get: () => this.getComponent(name),
    })

    this.setComponent(name, component)
    this.world.addEntityComponent(this, name)
    return this
  }

  removeComponent<T extends Component>(component: ComponentType<T>): Entity {
    const name = component.constructor.name

    this.world.removeEntityComponent(this, name)

    delete this[name]
    delete this._components[name]
    return this
  }

  removeComponents() {
    for (const c in this.components) {
      if (this.components[c].destroy) this.components[c].destroy()
      this.removeComponent(this.components[c])
    }
  }

  toString() {
    return `<${this._name}#${this._uid}: ${this.componentNames}>`
  }

  private setComponent(name: string, component: any): Entity {
    this._components[name] = component
    return this
  }

  private getComponent(name: string) {
    return this._components[name]
  }

  static create(entityDefinition: { [x: string]: {}; } | string, parentRenderContainer: PIXI.Container, world: World) {
    let entityName: string
    let entityOptions: { [key: string]: {} } = {}


    if (typeof entityDefinition === 'object') {
      entityName = Object.keys(entityDefinition)[0]
      entityOptions = entityDefinition[entityName]
    } else if (typeof entityDefinition === 'string') {
      entityName = entityDefinition
    }

    const entity = new Entity(entityName, world)
    const defaultEntityOptions = window.app.entities[entityName] || {}

    const componentNames = [...Object.keys(defaultEntityOptions), ...Object.keys(entityOptions)]

    for (let componentName of componentNames) {
      const componentOptions = {...defaultEntityOptions[componentName], ...entityOptions[componentName] || {}}
// TODO: implement component aliases
      const Component: ComponentType<Component> = (<any>Components)[componentName]
      if (Component === undefined) {
        console.warn(`Component <${componentName}> not defined.`)
        continue
      }

      if (componentName === 'Debug') componentOptions.entity = entity

      const component: ComponentType<Component> = new (<any>Component)(componentOptions)
      entity.addComponent(component)
    }

    let Position: Position, Slots: Slots, Health: Health, RenderObject: RenderObject, Debug: Components.Debug,
      EnergyGenerator: Components.EnergyGenerator, EnergyTransponder: Components.EnergyTransponder, Solid: Components.Solid
    ({Position, Slots, Health, RenderObject, Debug, EnergyGenerator, EnergyTransponder, Solid} = entity)

    if (RenderObject) {
      RenderObject.parentGroup = window.app.foreGroup
      parentRenderContainer.addChild(RenderObject)
      if(Solid) {
        RenderObject.sprite.getLocalBounds(Solid) 
      }
    }

    if (Slots) {
      Slots.places?.forEach((item: any, key: number) => {
        let slotItem = Entity.create(item, entity.RenderObject, world)
        let {Team} = entity
        if(Team) slotItem.addComponent(new Components.Team({value: Team.value}))
        Slots.items[key] = slotItem
      })
    }

    if (Health && RenderObject) {
      Health.enableIndication()
      Health.lifeIndicator.position.y = -(RenderObject.getBounds().height / 2 + Health.lifeIndicator.height)
      RenderObject.addChild(Health.lifeIndicator)
    }

    if (EnergyGenerator || EnergyTransponder) {
      const energyCircle = new PIXI.Graphics()
      energyCircle
        .lineStyle(1, 0x0000ff, 0.24, 1)
        .beginFill(0x0000ff, 0.1)
        .drawCircle(0, 0, EnergyGenerator ? EnergyGenerator.range : EnergyTransponder.range)
        .endFill()
      energyCircle.parentGroup = window.app.energyGroup

      RenderObject.addChild(energyCircle)
    }

    if (Debug && RenderObject) {
      const debugBounds = new PIXI.Graphics()
      const b = RenderObject.sprite.getLocalBounds()
      RenderObject.sortableChildren = true

      debugBounds
        .lineStyle(1, 0xff0000, 1, 1)
        .beginFill(0xff0000, 0.24)
        .drawRect(b.x, b.y, b.width, b.height)
        .endFill()
      debugBounds.zIndex = -1

      if (Debug.debugInfo) {
        RenderObject.addChild(Debug.debugInfo)
        Debug.debugInfo.position.set(b.x, b.y + b.height)
      }


      RenderObject.addChild(debugBounds)
    }

    return entity
  }

  destroy() {
    this.removeComponents()
  }

}