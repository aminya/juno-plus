# juno-plus Atom package
This is a simple Atom's package that enhances Julia Client Toolbar by adding some useful buttons. It also, provides some code snippets for Julia and Weave,

![image](https://user-images.githubusercontent.com/16418197/68539924-ece5bc00-034f-11ea-9fa4-da30d12135e3.png)

### Installation
https://atom.io/packages/juno-plus

## Buttons

### Files and Folders
* Open Folder - useful for opening and developing a project/package
* Select Julia working directory

### Process:
* Restart Julia (which removes workspace)
* Erase console
* Show documentation of selection
* using Revise

### Code Tools:
* Bookmarks
* Fold all - Unfold all: useful for code overview
* Auto Indent Selection (faster than Julia-Client formatting button)

### Viewers:
* Markdown preview: for previewing Readme.md if the package is already installed

### Atom utilities:
* Open Settings
* Fullscreen
* Command Palette

## Snippets

Julia:

* Documented Function with Examples: `functionde`
* Triple \": `q3`
* Docstring: `doc`
* Docstring with Examples: `doce`
* Julia Example block: `example`
* Union{Nothing,type}: `UN`
* Separator: `sep`

Weave:
* Hidden Output for Julia code chunk: `outJuliaFalse`
* Non-Echoed Julia code chunk: `echoJuliaFalse`
* Evaluated Julia code chunk: `evalJuliaTrue`
* Non-evaluated Julia code chunk: `evalJuliaFalse`
* Terminal Julia code chunk: `termJulia`
* Hold the output for a Block of Julia code chunk: `holdJulia`
* Inline Julia Code: `inline`
* Latex: `latex`
* Separator: `sep`

### Installation Tip:
After installation, if the Julia Client icons are still present, you might need to reload/restart Atom 2 times! (because this package adjusts Julia Client and Tool-bar config settings).

Repo: https://github.com/aminya/juno-plus

If you have any suggestions, I would be happy to include.
