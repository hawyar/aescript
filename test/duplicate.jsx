function run () {
  var queue = app.project.renderQueue

  if (queue.numItems === 0) {
    alert('No items in the render queue.')
    return
  }
  
  var current = queue.item(1)
  current.duplicate()
}

run()
