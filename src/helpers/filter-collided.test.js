import filterCollided from './filter-collided'

const thing = { x: 0, y: 0, size: 2 }
const closeThing = { x: 1, y: 0, size: 2 }
const distantThing = { x: 3, y: 3, size: 1 }
const things = [thing, closeThing, distantThing]

describe('filter-collided', () => {
  it('should export a function', () =>
    expect(typeof filterCollided)
      .toBe('function'))
  it('should return a function', () =>
    expect(typeof filterCollided(things))
      .toBe('function'))
  it('curried function should return a boolean', () => {
    expect(typeof filterCollided(things)(things[0]))
      .toBe('boolean')
  })
  it('should filter an array', () => {
    expect([ thing ]
      .filter(filterCollided([ closeThing ])).length)
      .toBe(0)
  })
  it('should not filter distant objects', () => {
    expect([ thing ]
      .filter(filterCollided([ distantThing ])).length)
        .toBe(1)
  })
})