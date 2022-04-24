#!/usr/bin/env node
import arg from 'arg'
import pc from 'picocolors'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { rename } from 'fs'

const usage = `
${pc.bold('Usage:')}
    aescript [command] [arg] [flags]

${pc.bold('Commands:')}
    ls        List all installed scripts
    install   Install a script
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

  const apps = await readdir('/Applications').catch(err => {
    print(err)
    process.exit(1)
  })

  const ae = apps.filter(app => app.includes('Adobe After Effects'))[0]

  if (command === 'ls') {
    const scriptsPath = path.join('/Applications', ae, 'Scripts')

    const installedScripts = []

    const scripts = await readdir(scriptsPath).catch(err => {
      print(err)
      process.exit(1)
    })

    installedScripts.push(...scripts.filter(isJsx))

    const scriptUIPanel = await readdir(scriptsPath + '/ScriptUI Panels')

    if (scriptUIPanel.length > 0) {
      installedScripts.push(...scriptUIPanel.filter(isJsx))
    }

    print(pc.bold('Installed Scripts:'))

    installedScripts.forEach(script => {
      print('- ' + stripExtension(script))
    })
    process.exit(0)
  }

  if (command === 'run') {
    if (args._.length === 1) {
      print(`${pc.bold('Error:')} You must specify a script to run`)
      process.exit(1)
    }

    const raw = await readFile(args._[1], 'utf8')

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
      print(pc.green('Success: ') + chunk)
      process.exit(0)
    })

    child.on('error', err => {
      print(err)
      process.exit(1)
    })
  }

  if (command === 'install') {
    if (!args._[1]) {
      print(`${pc.bold('Error:')} You must specify a script to install`)
      process.exit(1)
    }
    const script = args._[1]

    print(script)

    const installed = await readdir(`/Applications/${ae}/Scripts/ScriptUI Panels`).catch(err => {
      print(22)
      print(err)
      process.exit(1)
    })

    if (installed.includes(script)) {
      print(`${pc.bold('Error:')} ${script} is already installed`)
      process.exit(1)
    }
    print(path.join('/Applications', ae, 'Scripts', 'Script UI Panels', path.basename(script)))
    rename(script, path.join('/Applications', ae, 'Scripts', 'Script UI Panels', path.basename(script)), err => {
      if (err) {
        print(err)
        process.exit(1)
      }
    })

    print(pc.green('Success: ') + script + ' installed')
    process.exit(0)
  }

  print(`${pc.bold('Error:')} Unknown command ${command}`)
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
  const errMsg = err.message.split('\n')
  print(pc.red('Error: ') + errMsg[0])
  process.exit(1)
})
