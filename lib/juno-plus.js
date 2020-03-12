"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let juliaClient = null;
let JunoOn = true;
let allFolded = false;
exports.config = {
    enableToolbarPlus: {
        type: "boolean",
        default: true,
        title: "Enable Juno Toolbar Plus",
        description: "Replaces Julia Client Toolbar (changing requires 2 restarts!).",
        order: 1
    },
    StartJuliaProcessButtons: {
        type: "boolean",
        default: false,
        title: "Start Julia Process Buttons",
        description: "Adds buttons to Start Julia Process (changing requires restart).",
        order: 2
    },
    layoutAdjustmentButtons: {
        type: "boolean",
        default: false,
        title: "Layout Adjustment Buttons",
        description: "Adds buttons to adjust the layout (changing requires restart).",
        order: 3
    },
    WeaveButtons: {
        type: "boolean",
        default: false,
        title: "Weave Buttons",
        description: "Adds buttons to perform weave functions (changing requires restart).",
        order: 4
    },
    ToolbarPosition: {
        type: "boolean",
        default: true,
        title: "Toolbar Position",
        description: "Puts toolbar at top (changing requires restart).",
        order: 5
    },
    IconSizes: {
        type: "boolean",
        default: true,
        title: "Icons Sizes",
        description: "Makes the size of Icons 21px (changing requires restart).",
        order: 6
    },
    ColorfulIcons: {
        type: "boolean",
        default: true,
        title: "Colorful Icons",
        description: "Colors the icons (changing requires restart).",
        order: 7
    },
    JunoPackages: {
        type: "array",
        default: [
            "julia-client",
            "ink",
            "language-julia",
            "language-weave",
            "uber-juno"
        ],
        items: {
            type: "string"
        },
        title: "Juno Packages for Enabling/Disabling",
        description: "Write the name of packages that you want to be enabled/disabled using plug button",
        order: 8
    }
};
function consumeJuliaClient(client) {
    // getting client object
    juliaClient = client;
}
exports.consumeJuliaClient = consumeJuliaClient;
function activate() {
    // Force Restart Atom
    // atom.commands.add('atom-workspace', {
    //     'juno-plus:force-restart-atom'() {
    //         atom.restartApplication();
    //     }
    // });
    // Restart Atom
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-atom"() {
            // @ts-ignore
            let target = atom.workspace.getElement();
            atom.commands.dispatch(target, "windows:reload");
            atom.commands.dispatch(target, "dev-live-reload:reload-all");
        }
    });
    // Restart Julia
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-julia"() {
            // TODO: getElement replacement
            let target = atom.workspace.getElement();
            if (target) {
                atom.commands.dispatch(target, "julia-client:kill-julia")
                    .then(() => atom.commands.dispatch(target, "julia-client:start-julia"));
            }
            else {
                return;
            }
            // setTimeout(function () {
            //     {
            //         atom.commands.dispatch(target, 'julia-client:start-julia')
            //     }
            // }, 250);
        }
    });
    // Revise
    // DS102: Remove unnecessary code created because of implicit returns
    atom.commands.add("atom-workspace", {
        "juno-plus:Revise"() {
            atom.notifications.addSuccess("Starting Revise");
            juliaClient.boot();
            const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] });
            const command = 'using Revise; println("Revise is ready");';
            evalsimple(command);
        }
    });
    // Clear Console
    atom.commands.add("atom-workspace", {
        "juno-plus:ClearConsole"() {
            juliaClient.boot();
            const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] }); // import function
            let command = 'println("\\33[2J");';
            command += "Juno.clearconsole();";
            evalsimple(command);
        }
    });
    // Disable Juno
    atom.commands.add("atom-workspace", {
        "juno-plus:enable-disable-juno"() {
            // @ts-ignore
            const target = atom.workspace.getElement();
            try {
                const packages = atom.config.get("juno-plus.JunoPackages");
                atom.commands.dispatch(target, "juno-plus:restart");
                if (atom.packages.isPackageLoaded("julia-client") && JunoOn) {
                    atom.commands.dispatch(target, "julia-client:close-juno-panes");
                    for (let p of packages) {
                        atom.packages.disablePackage(p);
                    }
                    JunoOn = false;
                }
                else {
                    for (let p of packages) {
                        atom.packages.enablePackage(p);
                    }
                    JunoOn = true;
                }
                atom.commands.dispatch(target, "juno-plus:restart-atom");
                atom.notifications.addInfo('Reset done. If you want to update Toolbar or in case of an error, reload Atom using (Ctrl+Shift+P)+"reload"+Enter');
            }
            catch (e) {
                atom.notifications.addWarning(e);
                atom.notifications.addError("Something went wrong, Atom will reload");
                atom.restartApplication();
            }
        }
    });
    // Folding Toggle
    // @ts-ignore TODO: what is happening here?
    atom.commands.add("atom-text-editor", {
        "juno-plus:toggle-folding"() {
            const editor = this.getModel();
            if (allFolded) {
                editor.unfoldAll();
                return (allFolded = false);
            }
            else {
                editor.foldAll();
                return (allFolded = true);
            }
        }
    });
    // Enabling Toolbar
    atom.config.set("julia-client.uiOptions.enableToolBar", !atom.config.get("juno-plus.enableToolbarPlus"));
    // Toolbar Position
    if (atom.config.get("juno-plus.ToolbarPosition")) {
        atom.config.set("tool-bar.position", "Top");
    }
    // IconSizes
    if (atom.config.get("juno-plus.IconSizes")) {
        atom.config.set("tool-bar.iconSize", '21px');
    }
}
exports.activate = activate;
function deactivate() {
    return this.bar != null ? this.bar.removeItems() : undefined;
}
exports.deactivate = deactivate;
function consumeToolBar(bar) {
    // getting toolbar object
    this.bar = bar("juno-plus");
    // Loaded Packages
    const JunoLoaded = atom.packages.isPackageLoaded("julia-client") && JunoOn;
    const WeaveLoaded = atom.packages.isPackageLoaded("julia-client");
    const MarkDownPreviewLoaded = atom.packages.isPackageLoaded("markdown-preview");
    const BeautifyLoaded = atom.packages.isPackageLoaded("atom-beautify");
    // Buttons Config
    const layoutAdjustmentButtons = atom.config.get("juno-plus.layoutAdjustmentButtons");
    const StartJuliaProcessButtons = atom.config.get("juno-plus.StartJuliaProcessButtons");
    const WeaveButtons = atom.config.get("juno-plus.WeaveButtons");
    const ColorfulIcons = atom.config.get("juno-plus.ColorfulIcons");
    // Buttons:
    if (ColorfulIcons) {
        // Files & Folders
        if (JunoLoaded) {
            this.bar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New Julia File",
                callback: "julia:new-julia-file",
                color: "purple"
            });
        }
        else {
            this.bar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file",
                color: "khaki"
            });
        }
        this.bar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save"
        });
        this.bar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file",
            color: "khaki"
        });
        this.bar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder",
            color: "khaki"
        });
        this.bar.addButton({
            icon: "file-symlink-directory",
            tooltip: "Select Working Directory...",
            callback: "julia-client:select-working-folder",
            color: "khaki"
        });
        // Julia process
        this.bar.addSpacer();
        if (JunoLoaded) {
            if (StartJuliaProcessButtons) {
                this.bar.addButton({
                    icon: "md-planet",
                    iconset: "ion",
                    tooltip: "Start Remote Julia Process",
                    callback: "julia-client:start-remote-julia-process",
                    color: "mediumvioletred"
                });
                this.bar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia",
                    color: "mediumvioletred"
                });
            }
            this.bar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise"
            });
            this.bar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia",
                color: "yellow"
            });
            this.bar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia",
                color: "crimson"
            });
            this.bar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia",
                color: "dodgerblue"
            });
            this.bar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL",
                color: "yellow"
            });
            // Evaluation
            this.bar.addSpacer();
            this.bar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all",
                color: "springgreen"
            });
            this.bar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move",
                color: "springgreen"
            });
            this.bar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move",
                color: "springgreen"
            });
            // Debugging
            this.bar.addButton({
                text: `
                  <style> 
                    .junop_container {
                      display: flex;
                      justify-content: space-between;
                    }                         
                    .junop_column {
                      flex-direction: column;
                    }
                  </style>
                  <!-- write style only once -->
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-play" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Run File",
                callback: "julia-debug:run-file",
                color: "brown"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-share" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Step Into File",
                callback: "julia-debug:step-through-file",
                color: "brown"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-paragraph" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Run Block",
                callback: "julia-debug:run-block",
                color: "brown"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <div class="junop_container">
                         <i class="fa fa-paragraph" style="font-size: 70%"></i>
                         <i class="fa fa-share" style="font-size: 70%"></i>
                     </div>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Step Into Block",
                callback: "julia-debug:step-through-block",
                color: "brown"
            });
            //# https://fontawesome.com/how-to-use/on-the-web/styling/stacking-icons
            //# https://fontawesome.com/v4.7.0/icons/
            // this.bar.addButton({
            //   text: `
            //   <head>
            //     <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.1/css/all.css">
            //   </head>
            //   <style>
            //     .fa-stack { font-size: 0.5em; }
            //     i { vertical-align: middle; }
            //   </style>
            //   <span class="fa-stack fa">
            //     <i class="fa fa-bug fa-stack-2x" data-fa-transform="up-6"></i>
            //     <i class="fa fa-play fa-stack-1x fa-inverse" data-fa-transform="down-6""></i>
            //   </span>\
            //   `,
            //    html: true,
            //    tooltip: 'Debug: Run File',
            //    callback: 'julia-debug:run-file'
            //  });
            // Code Tools
            this.bar.addSpacer();
            // Documentation
            this.bar.addButton({
                icon: "question",
                tooltip: "Show Documentation [Selection]",
                callback: "julia-client:show-documentation",
            });
            // Go to definition
            this.bar.addButton({
                icon: "diff-renamed",
                tooltip: "Go to definition [Selection]",
                callback: "julia-client:goto-symbol",
                color: "aqua"
            });
        }
        // Bookmarks
        this.bar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark",
            color: "steelblue"
        });
        this.bar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all",
            color: "steelblue"
        });
        if (JunoLoaded) {
            // Code Formatters
            this.bar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code",
                color: "peachpuff"
            });
        }
        if (BeautifyLoaded) {
            this.bar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa",
                color: "peachpuff"
            });
        }
        this.bar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa",
            color: "moccasin"
        });
        // Fold
        this.bar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding"
        });
        // Layout Adjustment
        if (JunoLoaded && layoutAdjustmentButtons) {
            this.bar.addSpacer();
            this.bar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL"
            });
            this.bar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace"
            });
            this.bar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane"
            });
            this.bar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser",
            });
            this.bar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane"
            });
            this.bar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane",
                color: "brown"
            });
        }
        // Viewers
        this.bar.addSpacer();
        if (MarkDownPreviewLoaded) {
            this.bar.addButton({
                icon: "markdown",
                callback: "markdown-preview:toggle",
                tooltip: "Markdown Preview",
            });
        }
        if (JunoLoaded && WeaveButtons && WeaveLoaded) {
            this.bar.addButton({
                icon: "language-html5",
                iconset: "mdi",
                callback: "weave:weave-to-html",
                tooltip: "Weave HTML",
                color: "indigo"
            });
            this.bar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF",
                color: "indigo"
            });
        }
        // Atom
        this.bar.addSpacer();
        // this.bar.addButton({
        //    icon: 'tools',
        //    iconset: 'fa',
        //    tooltip: 'Julia Client Settings...',
        //    callback: 'julia-client:settings'
        // });
        this.bar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View",
            color: "slategray"
        });
        this.bar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen",
            color: "slategray"
        });
        this.bar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa",
            color: "slategray"
        });
        this.bar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno"
        });
        // this.bar.addButton({
        //      icon: 'x',
        //      callback: 'tool-bar:toggle',
        //      tooltip: 'Close Tool-Bar',
        //      iconset: ''
        //  });
    } // Colorless buttons:
    else {
        // Files & Folders
        if (JunoLoaded) {
            this.bar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New Julia File",
                callback: "julia:new-julia-file"
            });
        }
        else {
            this.bar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file"
            });
        }
        this.bar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save"
        });
        this.bar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file"
        });
        this.bar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder"
        });
        this.bar.addButton({
            icon: "file-symlink-directory",
            tooltip: "Select Working Directory...",
            callback: "julia-client:select-working-folder"
        });
        // Julia process
        this.bar.addSpacer();
        if (JunoLoaded) {
            if (StartJuliaProcessButtons) {
                this.bar.addButton({
                    icon: "md-planet",
                    iconset: "ion",
                    tooltip: "Start Remote Julia Process",
                    callback: "julia-client:start-remote-julia-process"
                });
                this.bar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia"
                });
            }
            this.bar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise"
            });
            this.bar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia"
            });
            this.bar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia"
            });
            this.bar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia"
            });
            this.bar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL"
            });
            // Evaluation
            this.bar.addSpacer();
            this.bar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all"
            });
            this.bar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move"
            });
            this.bar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move"
            });
            // Debugging
            this.bar.addButton({
                text: `
                  <style> 
                    .junop_container {
                      display: flex;
                      justify-content: space-between;
                    }                         
                    .junop_column {
                      flex-direction: column;
                    }
                  </style>
                  <!-- write style only once -->
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-play" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Run File",
                callback: "julia-debug:run-file"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-share" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Step Into File",
                callback: "julia-debug:step-through-file"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <i class="fa fa-paragraph" style="font-size: 70%"></i>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Run Block",
                callback: "julia-debug:run-block"
            });
            this.bar.addButton({
                text: `
                  <div class="junop_container junop_column">
                     <i class="fa fa-bug" style="font-size: 70%"></i>
                     <div class="junop_container">
                         <i class="fa fa-paragraph" style="font-size: 70%"></i>
                         <i class="fa fa-share" style="font-size: 70%"></i>
                     </div>
                  </div>
              `,
                html: true,
                tooltip: "Debug: Step Into Block",
                callback: "julia-debug:step-through-block"
            });
            //# https://fontawesome.com/how-to-use/on-the-web/styling/stacking-icons
            //# https://fontawesome.com/v4.7.0/icons/
            // this.bar.addButton({
            //   text: `
            //   <head>
            //     <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.1/css/all.css">
            //   </head>
            //   <style>
            //     .fa-stack { font-size: 0.5em; }
            //     i { vertical-align: middle; }
            //   </style>
            //   <span class="fa-stack fa">
            //     <i class="fa fa-bug fa-stack-2x" data-fa-transform="up-6"></i>
            //     <i class="fa fa-play fa-stack-1x fa-inverse" data-fa-transform="down-6""></i>
            //   </span>\
            //   `,
            //    html: true,
            //    tooltip: 'Debug: Run File',
            //    callback: 'julia-debug:run-file'
            //  });
            // Code Tools
            this.bar.addSpacer();
            // Documentation
            this.bar.addButton({
                icon: "question",
                tooltip: "Show Documentation [Selection]",
                callback: "julia-client:show-documentation"
            });
            // Go to definition
            this.bar.addButton({
                icon: "diff-renamed",
                tooltip: "Go to definition [Selection]",
                callback: "julia-client:goto-symbol"
            });
        }
        // Bookmarks
        this.bar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark"
        });
        this.bar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all"
        });
        if (JunoLoaded) {
            // Code Formatters
            this.bar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code"
            });
        }
        if (BeautifyLoaded) {
            this.bar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa"
            });
        }
        this.bar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa"
        });
        // Fold
        this.bar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding"
        });
        // Layout Adjustment
        if (JunoLoaded && layoutAdjustmentButtons) {
            this.bar.addSpacer();
            this.bar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL"
            });
            this.bar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace"
            });
            this.bar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane"
            });
            this.bar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser"
            });
            this.bar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane"
            });
            this.bar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane"
            });
        }
        // Viewers
        this.bar.addSpacer();
        if (MarkDownPreviewLoaded) {
            this.bar.addButton({
                icon: "markdown",
                callback: "markdown-preview:toggle",
                tooltip: "Markdown Preview"
            });
        }
        if (JunoLoaded && WeaveButtons && WeaveLoaded) {
            this.bar.addButton({
                icon: "language-html5",
                iconset: "mdi",
                callback: "weave:weave-to-html",
                tooltip: "Weave HTML"
            });
            this.bar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF"
            });
        }
        // Atom
        this.bar.addSpacer();
        // this.bar.addButton({
        //    icon: 'tools',
        //    iconset: 'fa',
        //    tooltip: 'Julia Client Settings...',
        //    callback: 'julia-client:settings'
        // });
        this.bar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View"
        });
        this.bar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen"
        });
        this.bar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa"
        });
        this.bar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno"
        });
        // this.bar.addButton({
        //      icon: 'x',
        //      callback: 'tool-bar:toggle',
        //      tooltip: 'Close Tool-Bar',
        //      iconset: ''
        //  });
    }
}
exports.consumeToolBar = consumeToolBar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuby1wbHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliX3NyYy9qdW5vLXBsdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUE7QUFDdEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUVSLFFBQUEsTUFBTSxHQUFHO0lBQ2xCLGlCQUFpQixFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsd0JBQXdCLEVBQUU7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsV0FBVyxFQUNQLGtFQUFrRTtRQUN0RSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsdUJBQXVCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsWUFBWSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFdBQVcsRUFDUCxzRUFBc0U7UUFDMUUsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELGVBQWUsRUFBRTtRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELFNBQVMsRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FB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