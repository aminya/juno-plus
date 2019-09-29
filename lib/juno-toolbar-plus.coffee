# Restart Julia
atom.commands.add 'atom-workspace', 'juno-toolbar-plus:juliaRestart': (event) ->
  view = atom.views.getView(atom.workspace.getActiveTextEditor())
  atom.commands.dispatch(view, 'julia-client:kill-julia')
  .then () -> atom.commands.dispatch(view, 'julia-client:start-julia')


module.exports =

  config:
    enableToolbarPlus:
      type: 'boolean'
      default: true
      title: 'Enable Juno Toolbar Plus'
      description: 'Replaces Julia Client Toolbar (changing requires 2 restarts!).'

    layoutAdjustmentButtons:
      type: 'boolean'
      default: false
      title: 'Layout Adjustment Buttons'
      description: 'Adds buttons to adjust the layout (changing requires restart).'

    extraButtons:
      type: 'boolean'
      default: true
      title: 'Extra Buttons'
      description: 'Adds some extra toolbar buttons (changing requires restart).'

    topPosition:
      type: 'boolean'
      default: true
      title: 'Toolbar Position'
      description: 'Puts toolbar at top (changing requires restart).'

    # position:
    #   type: 'string',
    #   default: 'Top',
    #   enum: ['Top', 'Right', 'Bottom', 'Left'],
    #   order: 3

  deactivate: ->
    @bar?.removeItems()

  consumeToolBar: (bar) ->

    if atom.config.get('juno-toolbar-plus.enableToolbarPlus') then atom.config.set('julia-client.uiOptions.enableToolBar', false) else atom.config.set('julia-client.uiOptions.enableToolBar', true)
    if atom.config.get('juno-toolbar-plus.topPosition') then atom.config.set('tool-bar:position', 'Top')

    # getting toolbar object
    @bar = bar 'juno-toolbar-plus'

    if atom.config.get('juno-toolbar-plus.layoutAdjustmentButtons') then layoutAdjustmentButtons = true else layoutAdjustmentButtons = false
    if atom.config.get('juno-toolbar-plus.extraButtons') then extraButtons = true else extraButtons = false

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

    @bar.addButton
      iconset: 'ion'
      icon: 'planet'
      tooltip: 'Start Remote Julia Process'
      callback: 'julia-client:start-remote-julia-process'

    @bar.addButton
      iconset: 'mdi'
      icon: 'alpha-j'
      tooltip: 'Start Local Julia Process'
      callback: 'julia-client:start-julia'

    @bar.addButton
      icon: 'pause'
      iconset: 'ion'
      tooltip: 'Interrupt Julia'
      callback: 'julia-client:interrupt-julia'

    @bar.addButton
      icon: 'stop'
      iconset: 'ion'
      tooltip: 'Stop Julia'
      callback: 'julia-client:kill-julia'

    @bar.addButton
      icon: 'sync'
      tooltip: 'Restart Julia'
      callback:'juno-toolbar-plus:juliaRestart'


    @bar.addButton
      icon: 'eraser'
      iconset: 'fa'
      tooltip: 'Clear Julia Console'
      callback: 'julia-client:clear-console'

    # Evaluation

    @bar.addSpacer()

    @bar.addButton
      icon: 'zap'
      tooltip: 'Run Block'
      callback: 'julia-client:run-and-move'

    @bar.addButton
      icon: 'play'
      iconset: 'ion'
      tooltip: 'Run All'
      callback: 'julia-client:run-all'

    # Code Tools

    @bar.addSpacer()

    @bar.addButton
      icon: 'format-float-none'
      iconset: 'mdi'
      tooltip: 'Format Code'
      callback: 'julia-client:format-code'

    @bar.addButton
      icon: 'chevron-right'
      callback: 'editor:fold-all'
      tooltip: 'Fold all'
      iconset: 'fa'

    @bar.addButton
      icon: 'chevron-down'
      callback: 'editor:unfold-all'
      tooltip: 'Unfold all'
      iconset: 'fa'

    @bar.addButton
      icon: 'question'
      tooltip: 'Show Documentation [Selection]'
      callback: 'julia-client:show-documentation'

    if extraButtons
      @bar.addButton
        icon: 'indent'
        callback: 'editor:auto-indent'
        tooltip: 'Auto indent (selection)'
        iconset: 'fa'

    if extraButtons
      if atom.packages.loadedPackages['atom-beautify']
        @bar.addButton
          'icon': 'star'
          'callback': 'atom-beautify:beautify-editor'
          'tooltip': 'Beautify'
          'iconset': 'fa'

    # Layout Adjustment

    if layoutAdjustmentButtons
      @bar.addSpacer()

      @bar.addButton
        icon: 'terminal'
        tooltip: 'Show Console'
        callback: 'julia-client:open-console'

      @bar.addButton
        icon: 'book'
        tooltip: 'Show Workspace'
        callback: 'julia-client:open-workspace'

      @bar.addButton
        icon: 'info'
        tooltip: 'Show Documentation Browser'
        callback: 'julia-client:open-documentation-browser'

      @bar.addButton
        icon: 'graph'
        tooltip: 'Show Plots'
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

    if atom.packages.loadedPackages['language-weave']
      @bar.addButton
        icon: 'social-html5',
        iconset: 'ion',
        callback: 'weave:weave-to-html',
        tooltip: 'Weave HTML'

      @bar.addButton
        icon: 'file-pdf',
        iconset: 'fa',
        callback: 'weave:weave-to-pdf',
        tooltip: 'Weave PDF'

    # Atom

    @bar.addSpacer()

    # @bar.addButton
    #   icon: 'tools'
    #   iconset: 'fa'
    #   tooltip: 'Julia Client Settings...'
    #   callback: 'julia-client:settings'

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
      icon: 'navicon-round'
      callback: 'command-palette:toggle'
      tooltip: 'Toggle Command Palette'
      iconset: 'ion'
