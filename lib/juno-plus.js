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
        order: 7
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
    // Buttons:
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
exports.consumeToolBar = consumeToolBar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuby1wbHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliX3NyYy9qdW5vLXBsdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUE7QUFDdEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUVSLFFBQUEsTUFBTSxHQUFHO0lBQ2xCLGlCQUFpQixFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsd0JBQXdCLEVBQUU7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsV0FBVyxFQUNQLGtFQUFrRTtRQUN0RSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsdUJBQXVCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsWUFBWSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFdBQVcsRUFDUCxzRUFBc0U7UUFDMUUsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELGVBQWUsRUFBRTtRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELFNBQVMsRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FB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