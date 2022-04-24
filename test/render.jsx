function run () {
  const queue = app.project.renderQueue

  if (queue.numItems === 0) {
    writeLn('No items in render queue')
    const comp = app.project.items.addComp('test_comp', 1920, 1080, 1, 10, 10)
    const layer = comp.layers.addSolid([1, 1, 1], 'test_layer', 1920, 1080, 1, comp.duration)

    queue.items.add(comp)
    // queue.render()
  } else {
    const current = queue.item(1)
    current.duplicate()

    writeLn('Duplicated: ' + current.toSource())
  // queue.render()
  }
}

run()
