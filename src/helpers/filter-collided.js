const filterCollided = obstacles => victim =>  {
  let collisionDetected = false
  for (const collider of obstacles) {
    const distX = (victim.x - collider.x)
    const distY = (victim.y - collider.y)
    const distSquared = distX ** 2 + distY ** 2
    const radiiSquared = ((collider.size + victim.size) / 2) ** 2

    if (radiiSquared > distSquared) {
      console.log(radiiSquared > distSquared)
      collisionDetected = true
      break
    }
  }
  return !collisionDetected
}

export default filterCollided
