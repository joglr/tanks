import React, { Component } from 'react';
import Mousetrap from 'mousetrap'
import filterCollided from './helpers/filter-collided'

const degreeMod = angle => angle % (2 * Math.PI)
const px = value => `${value}px`

const unit = 50
const vUnit = 0.01
const playerSize = 1
const projectileSize = 0.2
const targetSize = 0.4
const cannonWidth = 0.2
const firePower = 0.1
const degIncrement = (2 * Math.PI) / Math.pow(2, 8)
const sceneBounds = [15, 10]
const vBounds = [0.5, 0.5]

const collisionTypes = {
  BOUNCE: 'BOUNCE',
  TELEPORT: 'STOP',
  STOP: 'STOP'
}

const entityDefaults = {
  collisionType: collisionTypes.BOUNCE,
  size: 1
}

const directions = {
  up: [0, 1],
  down: [0, -1],
  left: [-1, 0],
  right: [1, 0]
}

const actions = {
  init: () => ({
    ...entityDefaults,
    x: playerSize / 2,
    y: sceneBounds[1] / 2,
    vx: 0,
    vy: 0,
    size: playerSize,
    direction: 0,
    score: 0,
    targets:
    // [
    //   {
    //     ...entityDefaults,
    //     x: 14.5,
    //     y: 5.5,
    //     vx: 0,
    //     vy: 0,
    //   }
    // ]
      [...Array(sceneBounds[1])].map((_, index) => ({
      ...entityDefaults,
      x: sceneBounds[0] - 0.5,
      y: index + 0.5,
      size: targetSize
    })),
    projectiles: [
      // {
      //   x: 14.5,
      //   y: 5.5,
      //   vx: 0,
      //   vy: 0,
      //   size: projectileSize
      // }
    ]
  }),
  changePosition: (dx, dy) => state => ({
    ...state,
    x:
      state.x + dx < state.size / 2 ||
      state.x + dx >= sceneBounds[0] - state.size / 2
        ? state.x + dx < state.size / 2
          ? state.size / 2
          : sceneBounds[0] - state.size / 2
        : state.x + dx,
    y:
      state.y + dy < state.size / 2 ||
      state.y + dy >= sceneBounds[1] - state.size / 2
        ? state.y + dy < state.size / 2
          ? state.size / 2
          : sceneBounds[1] - state.size / 2
        : state.y + dy,
    vx: state.x + dx < state.size / 2 ||
      state.x + dx >= sceneBounds[0] - state.size / 2
        ? state.vx * -1
        : state.vx,
    vy: state.y + dy < state.size / 2 ||
      state.y + dy >= sceneBounds[1] - state.size / 2
        ? state.vy * -1
        : state.vy
  }),
  changeVelocity: (dvx, dvy) => state => ({
    ...state,
    vx:
      state.vx + dvx * vUnit < -vBounds[0] ||
      state.vx + dvx * vUnit >= vBounds[0]
        ? state.vx
        : state.vx + dvx * vUnit,
    vy:
      state.vy + dvy * vUnit < -vBounds[1] ||
      state.vy + dvy * vUnit >= vBounds[1]
        ? state.vy
        : state.vy + dvy * vUnit
  }),
  increment: state => ({
    ...state,
    direction: degreeMod(state.direction + degIncrement)
  }),
  decrement: state => ({
    ...state,
    direction: degreeMod(state.direction - degIncrement)
  }),
  fire: state => ({
    projectiles: [
      ...state.projectiles,
      {
        ...entityDefaults,
        x: state.x + 1 * Math.cos(state.direction),
        y: state.y + 1 * Math.sin(state.direction),
        vx: firePower * Math.cos(state.direction),
        vy: firePower * Math.sin(state.direction),
        size: projectileSize
      }
    ]
  }),
  update: state => {
    const filteredTargets = state.targets.filter(filterCollided(state.projectiles))
    const filteredProjectiles = state.projectiles.filter(filterCollided(state.targets))
    const scored = state.targets.length - filteredTargets.length
    return {
      ...actions.changePosition(state.vx, state.vy)(state),
      score: state.score + scored,
      targets: filteredTargets,
      projectiles: filteredProjectiles.map(projectile => ({
        ...projectile,
        ...actions.changePosition(projectile.vx, projectile.vy)(projectile)
      }))
    }
  }
}

const styles = {
  controls: {
    position: 'absolute',
    bottom: px(unit / 8),
    left: px(unit / 8)
  },
  entry: {
    display: 'block'
  },
  scene: {
    width: px(sceneBounds[0] * unit),
    height: px(sceneBounds[1] * unit),
    display: 'block',
    position: 'relative',
    boxShadow: '0 0 0 1px black inset',
  },
  player: {
    width: px(playerSize * unit),
    height: px(playerSize * unit),
    transform: `translate(-${(playerSize * unit) / 2}px, ${(playerSize * unit) / 2}px)`,
    backgroundColor: 'hsl(0, 0%, 10%)',
    position: 'absolute'
  },
  cannon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: px(2 * cannonWidth * unit),
    transformOrigin: `${cannonWidth * unit}px 50%`,
    transform: `translate(-${cannonWidth * unit}px, -${cannonWidth * unit}px)`,
    backgroundColor: 'red',
    borderRadius: `${4 * cannonWidth * unit}px 0 0 ${4 * cannonWidth * unit}px`
  },
  projectile: {
    width: px(projectileSize * unit),
    height: px(projectileSize * unit),
    position: 'absolute',
    transform: `translate(-${px((projectileSize * unit) / 2)}, ${px((projectileSize * unit) / 2)})`,
    borderRadius: px(2 * projectileSize * unit),
    backgroundColor: 'black',
  },
  target: {
    width: px(targetSize * unit),
    height: px(targetSize * unit),
    position: 'absolute',
    transform: `translate(-${px((targetSize * unit) / 2)}, ${px((targetSize * unit) / 2)})`,
    borderRadius: px(2 * targetSize * unit),
    // backgroundColor: 'black',
    boxShadow: '0 0 0 1px black'
  }
}

class App extends Component {
  state = actions.init()
  componentDidMount() {
    this.stopInterval = false
    Mousetrap.bind('w', this.handleChangeVelocity(...directions.up))
    Mousetrap.bind('s', this.handleChangeVelocity(...directions.down))
    Mousetrap.bind('a', this.handleChangeVelocity(...directions.left))
    Mousetrap.bind('d', this.handleChangeVelocity(...directions.right))
    Mousetrap.bind(['left', 'up'], this.handleIncrement)
    Mousetrap.bind(['right', 'down'], this.handleDecrement)
    Mousetrap.bind('space', this.handleFire)
    const loop = () => {
      this.setState(actions.update)
      this.stopInterval || requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
  componentWillUnmount() {
    this.stopInterval = true
    Mousetrap.unbind('w')
    Mousetrap.unbind('s')
    Mousetrap.unbind('a')
    Mousetrap.unbind('d')
    Mousetrap.unbind('up')
    Mousetrap.unbind('down')
    Mousetrap.unbind('left')
    Mousetrap.unbind('right')
    Mousetrap.unbind('space')
    clearInterval(this.updateInterval)
  }
  handleMove = (dx, dy) => () => {
    this.setState(actions.changePosition(dx, dy))
  }
  handleChangeVelocity = (dvx, dvy) => () => {
    this.setState(actions.changeVelocity(dvx, dvy))
  }
  handleIncrement = () => this.setState(actions.increment)
  handleDecrement = () => this.setState(actions.decrement)
  handleFire = () => this.setState(actions.fire)
  render() {
    return (
      <div className="App">
        <scene style={styles.scene}>
          <debug style={styles.controls}>
            { Object.entries(this.state)
              .filter(([key, value]) => typeof value === 'number')
              .map(([key, value]) =>
            <entry key={key} style={styles.entry}>{key}: {typeof value === 'number' ? value.toFixed(2) : value}</entry>) }
          </debug>
          <player style={{
            ...styles.player,
            left: `${this.state.x * unit}px`,
            bottom: `${this.state.y * unit}px`,
          }}>
            <cannon style={{
              ...styles.cannon,
              transform: `${styles.cannon.transform} rotate(${-this.state.direction}rad)`
            }} />
          </player>
          <projectiles>
          { this.state.projectiles.map(({ x, y }) =>
            <projectile style={{
              ...styles.projectile,
              left: `${x * unit}px`,
              bottom: `${y * unit}px`,
            }} />
          )}
          </projectiles>
          <targets>
          { this.state.targets.map(({ x, y }) =>
            <target style={{
              ...styles.target,
              left: `${x * unit}px`,
              bottom: `${y * unit}px`,
            }} />
          )}
          </targets>
        </scene>
      </div>
    )
  }
}

export default App;
