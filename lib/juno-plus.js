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
    juliaClient = client;
}
exports.consumeJuliaClient = consumeJuliaClient;
function activate() {
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-atom"() {
            let target = atom.workspace.getElement();
            atom.commands.dispatch(target, "windows:reload");
            atom.commands.dispatch(target, "dev-live-reload:reload-all");
        }
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-julia"() {
            const target = atom.workspace.getElement();
            if (target) {
                atom.commands.dispatch(target, "julia-client:kill-julia")
                    .then(() => atom.commands.dispatch(target, "julia-client:start-julia"));
            }
            else {
                return;
            }
        }
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:Revise"() {
            atom.notifications.addSuccess("Starting Revise");
            juliaClient.boot();
            const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] });
            const command = 'using Revise; println("Revise is ready");';
            evalsimple(command);
        }
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:ClearConsole"() {
            juliaClient.boot();
            const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] });
            let command = 'println("\\33[2J");';
            command += "Juno.clearconsole();";
            evalsimple(command);
        }
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:enable-disable-juno"() {
            const target = atom.workspace.getElement();
            try {
                const packages = atom.config.get("juno-plus.JunoPackages");
                atom.commands.dispatch(target, "juno-plus:restart");
                if (atom.packages.isPackageLoaded("julia-client") && JunoOn) {
                    atom.commands.dispatch(target, "julia-client:close-juno-panes");
                    for (const p of packages) {
                        atom.packages.disablePackage(p);
                    }
                    JunoOn = false;
                }
                else {
                    for (const p of packages) {
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
    atom.config.set("julia-client.uiOptions.enableToolBar", !atom.config.get("juno-plus.enableToolbarPlus"));
    if (atom.config.get("juno-plus.ToolbarPosition")) {
        atom.config.set("tool-bar.position", "Top");
    }
    if (atom.config.get("juno-plus.IconSizes")) {
        atom.config.set("tool-bar.iconSize", '21px');
    }
}
exports.activate = activate;
let toolbar;
function deactivate() {
    if (toolbar) {
        toolbar.removeItems();
        toolbar = null;
    }
}
exports.deactivate = deactivate;
function consumeToolBar(getToolBar) {
    toolbar = getToolBar("juno-plus");
    const JunoLoaded = atom.packages.isPackageLoaded("julia-client") && JunoOn;
    const WeaveLoaded = atom.packages.isPackageLoaded("julia-client");
    const MarkDownPreviewLoaded = atom.packages.isPackageLoaded("markdown-preview");
    const BeautifyLoaded = atom.packages.isPackageLoaded("atom-beautify");
    const layoutAdjustmentButtons = atom.config.get("juno-plus.layoutAdjustmentButtons");
    const StartJuliaProcessButtons = atom.config.get("juno-plus.StartJuliaProcessButtons");
    const WeaveButtons = atom.config.get("juno-plus.WeaveButtons");
    const ColorfulIcons = atom.config.get("juno-plus.ColorfulIcons");
    if (ColorfulIcons) {
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New Julia File",
                callback: "julia:new-julia-file",
                color: "purple"
            });
        }
        else {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file",
                color: "khaki"
            });
        }
        toolbar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save"
        });
        toolbar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file",
            color: "khaki"
        });
        toolbar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder",
            color: "khaki"
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "file-symlink-directory",
                tooltip: "Select Working Directory...",
                callback: "julia-client:select-working-folder",
                color: "khaki"
            });
        }
        toolbar.addSpacer();
        if (JunoLoaded) {
            if (StartJuliaProcessButtons) {
                toolbar.addButton({
                    icon: "md-planet",
                    iconset: "ion",
                    tooltip: "Start Remote Julia Process",
                    callback: "julia-client:start-remote-julia-process",
                    color: "mediumvioletred"
                });
                toolbar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia",
                    color: "mediumvioletred"
                });
            }
            toolbar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise"
            });
            toolbar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia",
                color: "yellow"
            });
            toolbar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia",
                color: "crimson"
            });
            toolbar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia",
                color: "dodgerblue"
            });
            toolbar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL",
                color: "yellow"
            });
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all",
                color: "springgreen"
            });
            toolbar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move",
                color: "springgreen"
            });
            toolbar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move",
                color: "springgreen"
            });
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "question",
                tooltip: "Show Documentation [Selection]",
                callback: "julia-client:show-documentation",
            });
            toolbar.addButton({
                icon: "diff-renamed",
                tooltip: "Go to definition [Selection]",
                callback: "julia-client:goto-symbol",
                color: "aqua"
            });
        }
        toolbar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark",
            color: "steelblue"
        });
        toolbar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all",
            color: "steelblue"
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code",
                color: "peachpuff"
            });
        }
        if (BeautifyLoaded) {
            toolbar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa",
                color: "peachpuff"
            });
        }
        toolbar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa",
            color: "moccasin"
        });
        toolbar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding"
        });
        if (JunoLoaded && layoutAdjustmentButtons) {
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL"
            });
            toolbar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace"
            });
            toolbar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane"
            });
            toolbar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser",
            });
            toolbar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane"
            });
            toolbar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane",
                color: "brown"
            });
        }
        toolbar.addSpacer();
        if (MarkDownPreviewLoaded) {
            toolbar.addButton({
                icon: "markdown",
                callback: "markdown-preview:toggle",
                tooltip: "Markdown Preview",
            });
        }
        if (JunoLoaded && WeaveButtons && WeaveLoaded) {
            toolbar.addButton({
                icon: "language-html5",
                iconset: "mdi",
                callback: "weave:weave-to-html",
                tooltip: "Weave HTML",
                color: "indigo"
            });
            toolbar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF",
                color: "indigo"
            });
        }
        toolbar.addSpacer();
        toolbar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View",
            color: "slategray"
        });
        toolbar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen",
            color: "slategray"
        });
        toolbar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa",
            color: "slategray"
        });
        toolbar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno"
        });
    }
    else {
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New Julia File",
                callback: "julia:new-julia-file"
            });
        }
        else {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file"
            });
        }
        toolbar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save"
        });
        toolbar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file"
        });
        toolbar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder"
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New Julia File",
                callback: "julia:new-julia-file",
            });
        }
        else {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file",
            });
        }
        toolbar.addSpacer();
        if (JunoLoaded) {
            if (StartJuliaProcessButtons) {
                toolbar.addButton({
                    icon: "md-planet",
                    iconset: "ion",
                    tooltip: "Start Remote Julia Process",
                    callback: "julia-client:start-remote-julia-process"
                });
                toolbar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia"
                });
            }
            toolbar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise"
            });
            toolbar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia"
            });
            toolbar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia"
            });
            toolbar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia"
            });
            toolbar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL"
            });
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all"
            });
            toolbar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move"
            });
            toolbar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move"
            });
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addButton({
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
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "question",
                tooltip: "Show Documentation [Selection]",
                callback: "julia-client:show-documentation"
            });
            toolbar.addButton({
                icon: "diff-renamed",
                tooltip: "Go to definition [Selection]",
                callback: "julia-client:goto-symbol"
            });
        }
        toolbar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark"
        });
        toolbar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all"
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code"
            });
        }
        if (BeautifyLoaded) {
            toolbar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa"
            });
        }
        toolbar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa"
        });
        toolbar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding"
        });
        if (JunoLoaded && layoutAdjustmentButtons) {
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL"
            });
            toolbar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace"
            });
            toolbar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane"
            });
            toolbar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser"
            });
            toolbar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane"
            });
            toolbar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane"
            });
        }
        toolbar.addSpacer();
        if (MarkDownPreviewLoaded) {
            toolbar.addButton({
                icon: "markdown",
                callback: "markdown-preview:toggle",
                tooltip: "Markdown Preview"
            });
        }
        if (JunoLoaded && WeaveButtons && WeaveLoaded) {
            toolbar.addButton({
                icon: "language-html5",
                iconset: "mdi",
                callback: "weave:weave-to-html",
                tooltip: "Weave HTML"
            });
            toolbar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF"
            });
        }
        toolbar.addSpacer();
        toolbar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View"
        });
        toolbar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen"
        });
        toolbar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa"
        });
        toolbar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno"
        });
    }
}
exports.consumeToolBar = consumeToolBar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuby1wbHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2p1bm8tcGx1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLElBQUksV0FBVyxHQUFnQixJQUFJLENBQUE7QUFDbkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUVSLFFBQUEsTUFBTSxHQUFHO0lBQ2xCLGlCQUFpQixFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsd0JBQXdCLEVBQUU7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSw2QkFBNkI7UUFDcEMsV0FBVyxFQUNQLGtFQUFrRTtRQUN0RSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsdUJBQXVCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsV0FBVyxFQUNQLGdFQUFnRTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsWUFBWSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFdBQVcsRUFDUCxzRUFBc0U7UUFDMUUsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELGVBQWUsRUFBRTtRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsS0FBSyxFQUFFLENBQUM7S0FDWDtJQUVELFNBQVMsRUFBRTtRQUNQLElBQUksRUFBRSxTQUFTO1FBQ2Ys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