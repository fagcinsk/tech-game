import System from '../ecs/system'
import {limitVector} from '../../utils/geometry'
import {Moving, Position} from '../components/components'

export default class Physics extends System {

  update(dt: number) {
    this.world.entities.forEach(entity => {
      let Position: Position, Moving: Moving
      ({Position, Moving} = entity.components)
      if (Position && Moving) { // TODO: if is static, pass or remove entire Velocity component
        Moving.velocity.x += Moving.force.x * dt / Moving.mass
        Moving.velocity.y += Moving.force.y * dt / Moving.mass

        Moving.velocity = limitVector(Moving.velocity, Moving.maxVelocity)

        Position.x += Moving.velocity.x
        Position.y += Moving.velocity.y
      }
    })
  }
}