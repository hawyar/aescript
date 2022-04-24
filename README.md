## aescript

> CLI utility for After Effects Scripts

- Run Adobe ExtendScript script (.jsx)
- Install scripts


### Usage

List all installed packages

```bash
aescript ls
```

Run a script file

```bash
aescript run /path/to/script.jsx
```

### CLI
```
Usage:
    aescript [command] [arg] [flags]

Commands:
    ls        List all installed scripts
    install   Install a script
    run       Run a script

Arguments:
    [script]  Path to script to run (example: /path/to/script.jsx)

Flags:
    -v    --version       Print version
    -h    --help          Print help (what you are reading now)
  
Example: 
    aescript ls
    aescript install /path/to/script.jsx
    aescript run /path/to/script.jsx
```