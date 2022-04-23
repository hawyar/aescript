#!/usr/bin/env node
import arg from 'arg'
import pc from 'picocolors'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const usage = `
${pc.bold('Usage:')}
    aescript [command] [arg] [flags]

${pc.bold('Commands:')}
    ls        List all installed scripts
    run       Run a script

${pc.bold('Arguments:')}
    [script]  Path to script to run (example: /path/to/script.jsx)

${pc.bold('Flags:')}
    -v    --version       Print version
    -h    --help          Print help (what you are reading now)
  
${pc.bold('Example:')} 
    aescript ls
    aescript run /path/to/script.jsx
`

async function run () {
  const args = arg({
    '--help': Boolean,
    '--version': Boolean,
    '-h': '--help',
    '-v': '--version'
  })

  if (args['--help']) {
    print(usage)
    process.exit(0)
  }

  if (args['--version']) {
    print('v1.0.0')
    process.exit(0)
  }

  if (args._.length === 0) {
    print(usage)
    process.exit(0)
  }

  const command = args._[0]
  const apps = fs.readdirSync('/Applications')

  const ae = apps.filter(app => app.includes('Adobe After Effects'))[0]

  if (command === 'ls') {
    const scriptsPath = path.join('/Applications', ae, 'Scripts')

    const scripts = fs.readdirSync(scriptsPath)

    print(pc.bold('Installed Scripts:'))

    scripts.filter(script => isJsx(script)).forEach(script => print(`  - ${stripExtension(script)}`))

    // also check ScriptUI Panel scripts
    const scriptUI = fs.readdirSync(scriptsPath + '/ScriptUI Panels')

    if (scriptUI.length > 0) {
      print('\n')
      print(pc.bold('ScriptUI Panels:'))
      scriptUI.filter(script => isJsx(script)).forEach(script => print(`  - ${stripExtension(script)}`))
    }
    process.exit(0)
  }

  if (command === 'run') {
    if (args._.length === 1) {
      print(`${pc.bold('Error:')} You must specify a script to run`)
      process.exit(1)
    }

    const raw = fs.readFileSync(args._[1], 'utf8')

    const escaped = raw.replace(/"/g, '\\"')

    const child = await exec(`osascript bin/launch.scpt "${ae}.app" "${escaped}"`)

    print(pc.magenta('Running script in After Effects...'))

    let chunk = ''

    child.stdout.on('data', data => {
      chunk += data
    })

    child.stderr.on('data', data => {
      print(data)
    })

    child.on('close', code => {
      if (code !== 0) {
        print(pc.red('Error:' + chunk))
        process.exit(1)
      }
      print(pc.green('Success:') + chunk)
      process.exit(0)
    })

    return
  }
  print(usage)
}

function print (msg) {
  typeof msg === 'string'
    ? process.stdout.write(`${msg} \n`)
    : process.stdout.write(`${JSON.stringify(msg, null, 2)} \n`)
}

function isJsx (path) {
  return path.endsWith('.jsx') || path.endsWith('.jsxbin')
}

function stripExtension (path) {
  return path.replace(/\.[^/.]+$/, '')
}

process.on('unhandledRejection', (reason) => {
  print(reason)
  process.exit(1)
})

run().catch(err => {
  if (err.code === 'ARG_UNKNOWN_OPTION') {
    const errMsg = err.message.split('\n')
    print(errMsg)
    process.exit(1)
  }
  print(err)
  process.exit(1)
})
