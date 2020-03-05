juliaClient = null
JunoOn = true
allFolded = false

import {AtomEnvironment as atom} from "atom"

module.exports =
  config:
    enableToolbarPlus:
      type: 'boolean'
      default: true
      title: 'Enable Juno Toolbar Plus'
      description: 'Replaces Julia Client Toolbar (changing requires 2 restarts!).'
      order: 1

    StartJuliaProcessButtons:
      type: 'boolean'
      default: false
      title: 'Start Julia Process Buttons'
      description: 'Adds buttons to Start Julia Process (changing requires restart).'
      order: 2

    layoutAdjustmentButtons:
      type: 'boolean'
      default: false
      title: 'Layout Adjustment Buttons'
      description: 'Adds buttons to adjust the layout (changing requires restart).'
      order: 3

    WeaveButtons:
      type: 'boolean'
      default: false
      title: 'Weave Buttons'
      description: 'Adds buttons to perform weave functions (changing requires restart).'
      order: 4

    topPosition:
      type: 'boolean'
      default: true
      title: 'Toolbar Position'
      description: 'Puts toolbar at top (changing requires restart).'
      order: 5

    JunoPackages:
      type: 'array'
      default:  [ "julia-client", "ink", "language-julia", "language-weave", "uber-juno"]
      items:
        type: 'string'
      title: 'Juno Packages for Enabling/Disabling'
      description: 'Write the name of packages that you want to be enabled/disabled using plug button'
      order: 6

  consumeJuliaClient: (client) ->
    # getting client object
    juliaClient = client

  activate: ->

    # Force Restart Atom
    atom.commands.add 'atom-workspace', 'juno-plus:force-restart-atom', ->
      atom.restartApplication()

    # Restart Atom
    atom.commands.add 'atom-workspace', 'juno-plus:restart-atom', ->
      atom.commands.dispatch('windows:reload')
      atom.commands.dispatch('dev-live-reload:reload-all')

    # Restart Julia
    atom.commands.add 'atom-workspace', 'juno-plus:restart-julia': (event) ->
      element = atom.workspace.getElement()
      try
        atom.commands.dispatch(element, 'julia-client:kill-julia')
        .then () -> atom.commands.dispatch(element, 'julia-client:start-julia')     # comment!!!!!!!!
        setTimeout ( ->
          atom.commands.dispatch(element, 'julia-client:start-julia')
        ), 500
      catch e
        atom.notifications.addError("Juno failed to reset, reload Atom using (Ctrl+Shift+P)+\"reload\"+Enter")
        atom.commands.dispatch(element, 'juno-plus:force-restart-atom')    # comment!!!!!!!!

    # Revise
    atom.commands.add 'atom-workspace', 'juno-plus:Revise': (event) ->
      juliaClient.boot()
      evalsimple = juliaClient.import(rpc: [ 'evalsimple' ]).evalsimple
      command = 'using Revise;'
      evalsimple(command)
      atom.notifications.addSuccess("Revise Started")

    # Clear Console
    atom.commands.add 'atom-workspace', 'juno-plus:ClearConsole': (event) ->
      juliaClient.boot()
      evalsimple = juliaClient.import(rpc: [ 'evalsimple' ]).evalsimple
      command = """println("\\33[2J");"""
      command += "Juno.clearconsole();"
      evalsimple(command)

    # Disable Juno
    atom.commands.add 'atom-workspace', 'juno-plus:enable-disable-juno': (event) ->
      try
        packages = atom.config.get('juno-plus.JunoPackages')
        element = atom.workspace.getElement()
        atom.commands.dispatch(element, 'juno-plus:restart')
        if atom.packages.loadedPackages['julia-client'] && JunoOn
          atom.commands.dispatch(element, 'julia-client:close-juno-panes')
          for p in packages
            atom.packages.disablePackage(p)
          JunoOn = false
        else
          for p in packages
            atom.packages.enablePackage(p)
          JunoOn = true
        atom.commands.dispatch(element, 'juno-plus:restart-atom')
        atom.notifications.addInfo("Reset done. If you want to update Toolbar or in case of an error, reload Atom using (Ctrl+Shift+P)+\"reload\"+Enter")
      catch e
        atom.notifications.addWarning(e)
        atom.notifications.addError("Something went wrong, Atom will reload")
        atom.commands.dispatch(element, 'juno-plus:force-restart-atom')

    # Folding Toggle
    atom.commands.add 'atom-text-editor',
      'juno-plus:toggle-folding': (event) ->
        editor = @getModel()
        bufferRow = editor.bufferPositionForScreenPosition(editor.getCursorScreenPosition()).row
        if allFolded
          editor.unfoldAll()
          allFolded = false
        else
          editor.foldAll()
          allFolded = true

  deactivate: ->
    @bar?.removeItems()

  consumeToolBar: (bar) ->

    if atom.packages.loadedPackages['julia-client'] && JunoOn
      enableJunoButtons = true

    # Enabling Toolbar
    if atom.config.get('juno-plus.enableToolbarPlus')
      atom.config.set('julia-client.uiOptions.enableToolBar', false)
    else
      atom.config.set('julia-client.uiOptions.enableToolBar', true)

    # Toolbar Position
    if atom.config.get('juno-plus.topPosition')
      atom.config.set('tool-bar:position', 'Top')

    # getting toolbar object
    @bar = bar 'juno-plus'

    if atom.config.get('juno-plus.layoutAdjustmentButtons')
      layoutAdjustmentButtons = true
    else
      layoutAdjustmentButtons = false

    if atom.config.get('juno-plus.StartJuliaProcessButtons')
      StartJuliaProcessButtons = true
    else
      StartJuliaProcessButtons = false

    if atom.config.get('juno-plus.WeaveButtons')
      WeaveButtons = true
    else
      WeaveButtons = false

    # Buttons:

    # Files & Folders

    @bar.addButton
      icon: 'file-code'
      iconset: 'fa'
      tooltip: 'New Julia File'
      callback: ->
        atom.workspace.open().then (ed) ->
          ed.setGrammar(atom.grammars.grammarForScopeName('source.julia'))

    @bar.addButton
      icon: 'save'
      iconset: 'fa'
      tooltip: 'Save'
      callback: 'core:save'

    @bar.addButton
      icon: 'folder-open'
      iconset: 'fa'
      tooltip: 'Open File...'
      callback: 'application:open-file'

    @bar.addButton
      icon: 'file-submodule'
      tooltip: 'Open Folder...'
      callback: 'application:open-folder'

    @bar.addButton
      icon: 'file-symlink-directory'
      tooltip: 'Select Working Directory...'
      callback: 'julia-client:select-working-folder'

    # Julia process

    @bar.addSpacer()

    if enableJunoButtons
      if StartJuliaProcessButtons
        @bar.addButton
          icon: 'md-planet'
          iconset: 'ion'
          tooltip: 'Start Remote Julia Process'
          callback: 'julia-client:start-remote-julia-process'

        @bar.addButton
          icon: 'alpha-j'
          iconset: 'mdi'
          tooltip: 'Start Local Julia Process'
          callback: 'julia-client:start-julia'

      @bar.addButton
        icon: 'md-infinite'
        iconset: 'ion'
        tooltip: 'Revise Julia'
        callback: 'juno-plus:Revise'

      @bar.addButton
        icon: 'md-pause'
        iconset: 'ion'
        tooltip: 'Interrupt Julia (Stop Running)'
        callback: 'julia-client:interrupt-julia'

      @bar.addButton
        icon: 'md-square'
        iconset: 'ion'
        tooltip: 'Stop Julia'
        callback: 'julia-client:kill-julia'

      @bar.addButton
        icon: 'sync'
        tooltip: 'Restart Julia'
        callback:'juno-plus:restart-julia'

      @bar.addButton
        icon: 'eraser'
        iconset: 'fa'
        tooltip: 'Clear Julia Console'
        callback: 'julia-client:clear-REPL'

      # Evaluation

      @bar.addSpacer()

      @bar.addButton
        icon: 'md-play'
        iconset: 'ion'
        tooltip: 'Run All'
        callback: 'julia-client:run-all'

      @bar.addButton
        icon: 'ios-skip-forward'
        iconset: 'ion'
        tooltip: 'Run Cell (between \#\#)'
        callback: 'julia-client:run-cell-and-move'

      @bar.addButton
        icon: 'paragraph'
        iconset: 'fa'
        tooltip: 'Run Block'
        callback: 'julia-client:run-and-move'

      # Debugging
      @bar.addButton
        text: '<i class="fa fa-bug"></i><i class="fa fa-play"></i>'
        html: true
        tooltip: 'Debug: Run File'
        callback: 'julia-debug:run-file'

      @bar.addButton
        text: '<i class="fa fa-bug"></i><i class="fa fa-share"></i>'
        html: true
        tooltip: 'Debug: Step Into File'
        callback: 'julia-debug:step-through-file'

      @bar.addButton
        text: '<i class="fa fa-bug"></i><i class="fa fa-paragraph"></i>'
        html: true
        tooltip: 'Debug: Run Block'
        callback: 'julia-debug:run-block'

      @bar.addButton
        text: '<i class="fa fa-bug"></i><i class="fa fa-paragraph"></i><i class="fa fa-share"></i>'
        html: true
        tooltip: 'Debug: Step Into Block'
        callback: 'julia-debug:step-through-block'

    # comment
    ## https://fontawesome.com/how-to-use/on-the-web/styling/stacking-icons
       ## https://fontawesome.com/v4.7.0/icons/
       @bar.addButton
         text: '''
         <style>
           .fa-stack { font-size: 0.5em; }
           i { vertical-align: middle; }
         </style>
         <span class="fa-stack fa">
           <i class="fa fa-bug fa-stack-2x" data-fa-transform="up-6"></i>
           <i class="fa fa-play fa-stack-1x fa-inverse" data-fa-transform="down-6""></i>
         </span>
         '''
         html: true
         tooltip: 'Debug: Run File'
         callback: 'julia-debug:run-file'

      # Code Tools

      @bar.addSpacer()

      # Documentation
      @bar.addButton
        icon: 'question'
        tooltip: 'Show Documentation [Selection]'
        callback: 'julia-client:show-documentation'

      # Go to definition
      @bar.addButton
        icon: 'diff-renamed'
        tooltip: 'Go to definition [Selection]'
        callback: 'julia-client:goto-symbol'

    # Bookmarks
    @bar.addButton
      icon: 'md-bookmark'
      iconset: 'ion'
      tooltip: 'Add Bookmar Here'
      callback: 'bookmarks:toggle-bookmark'

    @bar.addButton
      icon: 'md-bookmarks'
      iconset: 'ion'
      tooltip: 'View Bookmarks'
      callback: 'bookmarks:view-all'

    if enableJunoButtons
      # Code Formatters
      @bar.addButton
        icon: 'format-float-none'
        iconset: 'mdi'
        tooltip: 'Format Code'
        callback: 'julia-client:format-code'

    if atom.packages.loadedPackages['atom-beautify']
      @bar.addButton
        'icon': 'star'
        'callback': 'atom-beautify:beautify-editor'
        'tooltip': 'Beautify'
        'iconset': 'fa'

    @bar.addButton
      icon: 'indent'
      callback: 'editor:auto-indent'
      tooltip: 'Auto indent (selection)'
      iconset: 'fa'

    # Fold
    @bar.addButton
      text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>'
      html: true
      tooltip: 'Toggle Folding'
      callback: 'juno-plus:toggle-folding'

    # Layout Adjustment

    if enableJunoButtons && layoutAdjustmentButtons
      @bar.addSpacer()

      @bar.addButton
        icon: 'terminal'
        tooltip: 'Show REPL'
        callback: 'julia-client:open-REPL'

      @bar.addButton
        icon: 'book'
        tooltip: 'Show Workspace'
        callback: 'julia-client:open-workspace'

      @bar.addButton
        icon: 'list-unordered'
        tooltip: 'Show Outline'
        callback: 'julia-client:open-outline-pane'

      @bar.addButton
        icon: 'info'
        tooltip: 'Show Documentation Browser'
        callback: 'julia-client:open-documentation-browser'

      @bar.addButton
        icon: 'graph'
        tooltip: 'Show Plot Pane'
        callback: 'julia-client:open-plot-pane'

      @bar.addButton
        icon: 'bug'
        tooltip: 'Show Debugger Pane'
        callback: 'julia-debug:open-debugger-pane'


    # Viewers

    @bar.addSpacer()

    if atom.packages.loadedPackages['markdown-preview']
      @bar.addButton
        icon: 'markdown'
        callback: 'markdown-preview:toggle'
        tooltip: 'Markdown Preview'

    if enableJunoButtons && atom.packages.loadedPackages['language-weave'] && WeaveButtons
      @bar.addButton
        icon: 'language-html5',
        iconset: 'mdi',
        callback: 'weave:weave-to-html',
        tooltip: 'Weave HTML'

      @bar.addButton
        icon: 'file-pdf',
        iconset: 'fa',
        callback: 'weave:weave-to-pdf',
        tooltip: 'Weave PDF'

    # Atom

    @bar.addSpacer()

    # comment
    @bar.addButton
       icon: 'tools'
       iconset: 'fa'
       tooltip: 'Julia Client Settings...'
       callback: 'julia-client:settings'

    @bar.addButton
      icon: 'gear'
      callback: 'settings-view:open'
      tooltip: 'Open Settings View'

    @bar.addButton
      iconset: 'fa'
      icon: 'arrows-alt'
      tooltip: 'Toggle Fullscreen'
      callback: 'window:toggle-full-screen'

    @bar.addButton
      icon: 'grip-lines'
      callback: 'command-palette:toggle'
      tooltip: 'Toggle Command Palette'
      iconset: 'fa'

    @bar.addButton
      icon: 'plug'
      callback: 'juno-plus:enable-disable-juno'
      tooltip: 'Enable/Disable Juno'

     # comment
     @bar.addButton
         icon: 'x'
         callback: 'tool-bar:toggle'
         tooltip: 'Close Tool-Bar'
         iconset: ''
