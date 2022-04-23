import * as tap from 'tap'
import { exec } from 'child_process'

tap.test('test script lang', (t) => {
  exec('node bin/cli.js run "./test/lang.jsx"', (err, stdout, stderr) => {
    if (err) {
      t.fail(err)
    }

    if (stderr) {
      t.fail(stderr)
    }
    t.end()
  })
})

tap.test('test script duplicate', (t) => {
  exec('node bin/cli.js run "./test/duplicate.jsx"', (err, stdout, stderr) => {
    if (err) {
      t.fail(err)
    }

    if (stderr) {
      t.fail(stderr)
    }
    t.end()
  })
})
