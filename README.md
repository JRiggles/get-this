<img src="https://raw.githubusercontent.com/JRiggles/get-this/main/icons/icon-512.png">

### What does this extension do?

**Get This!** watches for changes to your active editor tab and will set an environment variable named `THIS` (in the integrated terminal) to the path of the active file.

### Why?

Now whenever you switch editor tabs, you'll have access to the active file's path in the integrated terminal without having to...

- right-click on the file in the sidebar and select "Open in Integrated Terminal"
- right-click on the file in the sidebar and select "Copy Path" or "Copy Relative Path"
- cd out of your current working directory to work with a different file path
- open another terminal

Instead, you can simply use the environment variable: `THIS`

### How?

Once installed, **Get This!** starts up automatically with VS Code.

To use it, simply open a new integrated terminal window and use `THIS` like any other environment variable, e.g.:

***Mac OS, Linux***
```bash
echo $THIS
```

***Windows***
```cmd
echo %THIS%
```

### How, specifically?

Specifically, **Get This!** sets the following configuration in your global `settings.json` file:

***Mac OS***
```JSON
"terminal.integrated.env.osx": {
    "THIS": "<path to most recently active editor>"
}
```

***Windows***
```JSON
"terminal.integrated.env.windows": {
    "THIS": "<path to most recently active editor>"
}
```

***Linux***
```JSON
"terminal.integrated.env.linux": {
    "THIS": "<path to most recently active editor>"
}
```
This configuration is updated whenver you change your active editor to a tab with a valid file in it.
> Don't worry, if you happen to have any other evnironment variables already set in `terminal.integrated.env`, **Get This!** will leave them alone (unless you happen to have one named `THIS`)

## Tips and Tricks

- `THIS` is **case-sensitive**, so remember to use all caps! `$this` won't work, but `$THIS` will
- If `THIS` seems like it's stuck on a previous file path, close the integrated terminal and reopen it
<br/>(looking for a better solution for this...)
- `THIS` only exists in VS Code's integrated terminal, so you won't be able to access it from an external terminal, i.e. your OS's terminal
- The value of `THIS` is updated as soon as an editor tab with a valid file path is selected, so if you're opening VS Code it will update to the path of any restored editor tab as well
- The most recent value of `THIS` is stored in your global `settings.json`
- **Get This!** only updates `THIS` if the file in the active editor has been saved - it doesn't work on new "Untitled" files

## Requirements

**Get This!** has been developed and tested on...
> Visual Studio Code
<br/> Version: 1.87.2 (Universal)
<br/> Commit: 863d2581ecda6849923a2118d93a088b0745d9d6
<br/> Date: 2024-03-08T15:21:31.043Z
<br/> Electron: 27.3.2
<br/> ElectronBuildId: 26836302
<br/> Chromium: 118.0.5993.159
<br/> Node.js: 18.17.1
<br/> V8: 11.8.172.18-electron.0
<br/> OS: Darwin arm64 23.3.0

but is designed to run on Mac OS, Windows and Linux and should work with most versions of VS Code

## Extension Settings

None...yet?

## Known Issues

None so far!

## Release Notes

### 0.0.1

Initial development of **Get This!**
