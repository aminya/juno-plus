"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeToolBar = exports.deactivate = exports.activate = exports.consumeJuliaClient = exports.config = void 0;
let juliaClient = null;
let JunoOn = true;
let allFolded = false;
exports.config = {
    enableToolbarPlus: {
        type: "boolean",
        default: true,
        title: "Enable Juno Toolbar Plus",
        description: "Replaces Julia Client Toolbar (changing requires 2 restarts!).",
        order: 1,
    },
    StartJuliaProcessButtons: {
        type: "boolean",
        default: false,
        title: "Start Julia Process Buttons",
        description: "Adds buttons to Start Julia Process (changing requires restart).",
        order: 2,
    },
    layoutAdjustmentButtons: {
        type: "boolean",
        default: false,
        title: "Layout Adjustment Buttons",
        description: "Adds buttons to adjust the layout (changing requires restart).",
        order: 3,
    },
    WeaveButtons: {
        type: "boolean",
        default: false,
        title: "Weave Buttons",
        description: "Adds buttons to perform weave functions (changing requires restart).",
        order: 4,
    },
    ColorfulIcons: {
        type: "boolean",
        default: true,
        title: "Colorful Icons",
        description: "Colors the icons (changing requires restart).",
        order: 7,
    },
    JunoPackages: {
        type: "array",
        default: ["julia-client", "ink", "language-julia", "language-weave", "uber-juno"],
        items: {
            type: "string",
        },
        title: "Juno Packages for Enabling/Disabling",
        description: "Write the name of packages that you want to be enabled/disabled using plug button",
        order: 8,
    },
};
function consumeJuliaClient(client) {
    juliaClient = client;
}
exports.consumeJuliaClient = consumeJuliaClient;
function activate() {
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-atom"() {
            const target = atom.workspace.getElement();
            atom.commands.dispatch(target, "windows:reload");
            atom.commands.dispatch(target, "dev-live-reload:reload-all");
        },
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:restart-julia"() {
            var _a;
            const target = atom.workspace.getElement();
            if (target) {
                (_a = atom.commands
                    .dispatch(target, "julia-client:kill-julia")) === null || _a === void 0 ? void 0 : _a.then(() => atom.commands.dispatch(target, "julia-client:start-julia"));
            }
            else {
                return;
            }
        },
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:Revise"() {
            atom.notifications.addSuccess("Starting Revise");
            if (juliaClient) {
                juliaClient.boot();
                const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] });
                const command = 'using Revise; println("Revise is ready");';
                evalsimple(command);
            }
        },
    });
    atom.commands.add("atom-workspace", {
        "juno-plus:ClearConsole"() {
            if (juliaClient) {
                juliaClient.boot();
                const { evalsimple } = juliaClient.import({ rpc: ["evalsimple"] });
                let command = 'println("\\33[2J");';
                command += "Juno.clearconsole();";
                evalsimple(command);
            }
        },
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
        },
    });
    atom.commands.add("atom-text-editor", "juno-plus:toggle-folding", (commandEvent) => {
        const editor = commandEvent.currentTarget.getModel();
        if (editor) {
            if (allFolded) {
                editor.unfoldAll();
                allFolded = false;
            }
            else {
                editor.foldAll();
                allFolded = true;
            }
        }
    });
    atom.config.set("julia-client.uiOptions.enableToolBar", !atom.config.get("juno-plus.enableToolbarPlus"));
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
                color: "purple",
            });
        }
        else {
            toolbar.addButton({
                icon: "file-code",
                iconset: "fa",
                tooltip: "New File",
                callback: "application:new-file",
                color: "khaki",
            });
        }
        toolbar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save",
        });
        toolbar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file",
            color: "khaki",
        });
        toolbar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder",
            color: "khaki",
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "file-symlink-directory",
                tooltip: "Select Working Directory...",
                callback: "julia-client:select-working-folder",
                color: "khaki",
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
                    color: "mediumvioletred",
                });
                toolbar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia",
                    color: "mediumvioletred",
                });
            }
            toolbar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise",
            });
            toolbar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia",
                color: "yellow",
            });
            toolbar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia",
                color: "crimson",
            });
            toolbar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia",
                color: "dodgerblue",
            });
            toolbar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL",
                color: "yellow",
            });
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all",
                color: "springgreen",
            });
            toolbar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move",
                color: "springgreen",
            });
            toolbar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move",
                color: "springgreen",
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
                color: "brown",
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
                color: "brown",
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
                color: "brown",
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
                color: "brown",
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
                color: "aqua",
            });
        }
        toolbar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark",
            color: "steelblue",
        });
        toolbar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all",
            color: "steelblue",
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code",
                color: "peachpuff",
            });
        }
        if (BeautifyLoaded) {
            toolbar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa",
                color: "peachpuff",
            });
        }
        toolbar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa",
            color: "moccasin",
        });
        toolbar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding",
        });
        if (JunoLoaded && layoutAdjustmentButtons) {
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL",
            });
            toolbar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace",
            });
            toolbar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane",
            });
            toolbar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser",
            });
            toolbar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane",
            });
            toolbar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane",
                color: "brown",
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
                color: "indigo",
            });
            toolbar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF",
                color: "indigo",
            });
        }
        toolbar.addSpacer();
        toolbar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View",
            color: "slategray",
        });
        toolbar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen",
            color: "slategray",
        });
        toolbar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa",
            color: "slategray",
        });
        toolbar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno",
        });
    }
    else {
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
        toolbar.addButton({
            icon: "save",
            iconset: "fa",
            tooltip: "Save",
            callback: "core:save",
        });
        toolbar.addButton({
            icon: "folder-open",
            iconset: "fa",
            tooltip: "Open File...",
            callback: "application:open-file",
        });
        toolbar.addButton({
            icon: "file-submodule",
            tooltip: "Open Folder...",
            callback: "application:open-folder",
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
                    callback: "julia-client:start-remote-julia-process",
                });
                toolbar.addButton({
                    icon: "alpha-j",
                    iconset: "mdi",
                    tooltip: "Start Local Julia Process",
                    callback: "julia-client:start-julia",
                });
            }
            toolbar.addButton({
                icon: "md-infinite",
                iconset: "ion",
                tooltip: "Revise Julia",
                callback: "juno-plus:Revise",
            });
            toolbar.addButton({
                icon: "md-pause",
                iconset: "ion",
                tooltip: "Interrupt Julia (Stop Running)",
                callback: "julia-client:interrupt-julia",
            });
            toolbar.addButton({
                icon: "md-square",
                iconset: "ion",
                tooltip: "Stop Julia",
                callback: "julia-client:kill-julia",
            });
            toolbar.addButton({
                icon: "sync",
                tooltip: "Restart Julia",
                callback: "juno-plus:restart-julia",
            });
            toolbar.addButton({
                icon: "eraser",
                iconset: "fa",
                tooltip: "Clear Julia Console",
                callback: "julia-client:clear-REPL",
            });
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "md-play",
                iconset: "ion",
                tooltip: "Run All",
                callback: "julia-client:run-all",
            });
            toolbar.addButton({
                icon: "ios-skip-forward",
                iconset: "ion",
                tooltip: "Run Cell (between ##)",
                callback: "julia-client:run-cell-and-move",
            });
            toolbar.addButton({
                icon: "paragraph",
                iconset: "fa",
                tooltip: "Run Block",
                callback: "julia-client:run-and-move",
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
            });
        }
        toolbar.addButton({
            icon: "md-bookmark",
            iconset: "ion",
            tooltip: "Add Bookmar Here",
            callback: "bookmarks:toggle-bookmark",
        });
        toolbar.addButton({
            icon: "md-bookmarks",
            iconset: "ion",
            tooltip: "View Bookmarks",
            callback: "bookmarks:view-all",
        });
        if (JunoLoaded) {
            toolbar.addButton({
                icon: "format-float-none",
                iconset: "mdi",
                tooltip: "Format Code",
                callback: "julia-client:format-code",
            });
        }
        if (BeautifyLoaded) {
            toolbar.addButton({
                icon: "star",
                callback: "atom-beautify:beautify-editor",
                tooltip: "Beautify",
                iconset: "fa",
            });
        }
        toolbar.addButton({
            icon: "indent",
            callback: "editor:auto-indent",
            tooltip: "Auto indent (selection)",
            iconset: "fa",
        });
        toolbar.addButton({
            text: '<i class="fa fa-chevron-right fa-sm"></i><i class="fa fa-chevron-down fa-sm"></i>',
            html: true,
            tooltip: "Toggle Folding",
            callback: "juno-plus:toggle-folding",
        });
        if (JunoLoaded && layoutAdjustmentButtons) {
            toolbar.addSpacer();
            toolbar.addButton({
                icon: "terminal",
                tooltip: "Show REPL",
                callback: "julia-client:open-REPL",
            });
            toolbar.addButton({
                icon: "book",
                tooltip: "Show Workspace",
                callback: "julia-client:open-workspace",
            });
            toolbar.addButton({
                icon: "list-unordered",
                tooltip: "Show Outline",
                callback: "julia-client:open-outline-pane",
            });
            toolbar.addButton({
                icon: "info",
                tooltip: "Show Documentation Browser",
                callback: "julia-client:open-documentation-browser",
            });
            toolbar.addButton({
                icon: "graph",
                tooltip: "Show Plot Pane",
                callback: "julia-client:open-plot-pane",
            });
            toolbar.addButton({
                icon: "bug",
                tooltip: "Show Debugger Pane",
                callback: "julia-debug:open-debugger-pane",
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
            });
            toolbar.addButton({
                icon: "file-pdf",
                iconset: "fa",
                callback: "weave:weave-to-pdf",
                tooltip: "Weave PDF",
            });
        }
        toolbar.addSpacer();
        toolbar.addButton({
            icon: "gear",
            callback: "settings-view:open",
            tooltip: "Open Settings View",
        });
        toolbar.addButton({
            iconset: "fa",
            icon: "arrows-alt",
            tooltip: "Toggle Fullscreen",
            callback: "window:toggle-full-screen",
        });
        toolbar.addButton({
            icon: "grip-lines",
            callback: "command-palette:toggle",
            tooltip: "Toggle Command Palette",
            iconset: "fa",
        });
        toolbar.addButton({
            icon: "plug",
            callback: "juno-plus:enable-disable-juno",
            tooltip: "Enable/Disable Juno",
        });
    }
}
exports.consumeToolBar = consumeToolBar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuby1wbHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2p1bm8tcGx1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFBO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNqQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7QUFFUixRQUFBLE1BQU0sR0FBRztJQUNwQixpQkFBaUIsRUFBRTtRQUNqQixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLDBCQUEwQjtRQUNqQyxXQUFXLEVBQUUsZ0VBQWdFO1FBQzdFLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCx3QkFBd0IsRUFBRTtRQUN4QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLDZCQUE2QjtRQUNwQyxXQUFXLEVBQUUsa0VBQWtFO1FBQy9FLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCx1QkFBdUIsRUFBRTtRQUN2QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLDJCQUEyQjtRQUNsQyxXQUFXLEVBQUUsZ0VBQWdFO1FBQzdFLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLGVBQWU7UUFDdEIsV0FBVyxFQUFFLHNFQUFzRTtRQUNuRixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBRUQsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsV0FBVyxFQUFFLCtDQUErQztRQUM1RCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBRUQsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLE9BQU87UUFD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OUIsT0FBTyxFQUFFLG9CQUFvQjtTQUM5QixDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixRQUFRLEVBQUUsMkJBQTJCO1NBQ3RDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFLHdCQUF3QjtZQUNsQyxPQUFPLEVBQUUsd0JBQXdCO1lBQ2pDLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUNoQixJQUFJLEVBQUUsTUFBTTtZQUNaLFFBQVEsRUFBRSwrQkFBK0I7WUFDekMsT0FBTyxFQUFFLHFCQUFxQjtTQUMvQixDQUFDLENBQUE7S0FRSDtBQUNILENBQUM7QUF4MEJELHdDQXcwQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFRvb2xCYXJNYW5hZ2VyLCBnZXRUb29sQmFyTWFuYWdlciB9IGZyb20gXCJhdG9tL3Rvb2wtYmFyXCJcblxudHlwZSBKdWxpYUNsaWVudCA9IHsgYm9vdDogKCkgPT4gdm9pZDsgaW1wb3J0OiAoYXJnMDogeyBycGM6IHN0cmluZ1tdIH0pID0+IHsgZXZhbHNpbXBsZTogYW55IH0gfSB8IG51bGxcblxubGV0IGp1bGlhQ2xpZW50OiBKdWxpYUNsaWVudCA9IG51bGxcbmxldCBKdW5vT24gPSB0cnVlXG5sZXQgYWxsRm9sZGVkID0gZmFsc2VcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgZW5hYmxlVG9vbGJhclBsdXM6IHtcbiAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRpdGxlOiBcIkVuYWJsZSBKdW5vIFRvb2xiYXIgUGx1c1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcGxhY2VzIEp1bGlhIENsaWVudCBUb29sYmFyIChjaGFuZ2luZyByZXF1aXJlcyAyIHJlc3RhcnRzISkuXCIsXG4gICAgb3JkZXI6IDEsXG4gIH0sXG5cbiAgU3RhcnRKdWxpYVByb2Nlc3NCdXR0b25zOiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6IFwiU3RhcnQgSnVsaWEgUHJvY2VzcyBCdXR0b25zXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQWRkcyBidXR0b25zIHRvIFN0YXJ0IEp1bGlhIFByb2Nlc3MgKGNoYW5naW5nIHJlcXVpcmVzIHJlc3RhcnQpLlwiLFxuICAgIG9yZGVyOiAyLFxuICB9LFxuXG4gIGxheW91dEFkanVzdG1lbnRCdXR0b25zOiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6IFwiTGF5b3V0IEFkanVzdG1lbnQgQnV0dG9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFkZHMgYnV0dG9ucyB0byBhZGp1c3QgdGhlIGxheW91dCAoY2hhbmdpbmcgcmVxdWlyZXMgcmVzdGFydCkuXCIsXG4gICAgb3JkZXI6IDMsXG4gIH0sXG5cbiAgV2VhdmVCdXR0b25zOiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6IFwiV2VhdmUgQnV0dG9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFkZHMgYnV0dG9ucyB0byBwZXJmb3JtIHdlYXZlIGZ1bmN0aW9ucyAoY2hhbmdpbmcgcmVxdWlyZXMgcmVzdGFydCkuXCIsXG4gICAgb3JkZXI6IDQsXG4gIH0sXG5cbiAgQ29sb3JmdWxJY29uczoge1xuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGl0bGU6IFwiQ29sb3JmdWwgSWNvbnNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJDb2xvcnMgdGhlIGljb25zIChjaGFuZ2luZyByZXF1aXJlcyByZXN0YXJ0KS5cIixcbiAgICBvcmRlcjogNyxcbiAgfSxcblxuICBKdW5vUGFja2FnZXM6IHtcbiAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgZGVmYXVsdDogW1wianVsaWEtY2xpZW50XCIsIFwiaW5rXCIsIFwibGFuZ3VhZ2UtanVsaWFcIiwgXCJsYW5ndWFnZS13ZWF2ZVwiLCBcInViZXItanVub1wiXSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICB9LFxuICAgIHRpdGxlOiBcIkp1bm8gUGFja2FnZXMgZm9yIEVuYWJsaW5nL0Rpc2FibGluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIldyaXRlIHRoZSBuYW1lIG9mIHBhY2thZ2VzIHRoYXQgeW91IHdhbnQgdG8gYmUgZW5hYmxlZC9kaXNhYmxlZCB1c2luZyBwbHVnIGJ1dHRvblwiLFxuICAgIG9yZGVyOiA4LFxuICB9LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUp1bGlhQ2xpZW50KGNsaWVudDogSnVsaWFDbGllbnQpIHtcbiAgLy8gZ2V0dGluZyBjbGllbnQgb2JqZWN0XG4gIGp1bGlhQ2xpZW50ID0gY2xpZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgLy8gRm9yY2UgUmVzdGFydCBBdG9tXG4gIC8vIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgLy8gICAgICdqdW5vLXBsdXM6Zm9yY2UtcmVzdGFydC1hdG9tJygpIHtcbiAgLy8gICAgICAgICBhdG9tLnJlc3RhcnRBcHBsaWNhdGlvbigpO1xuICAvLyAgICAgfVxuICAvLyB9KTtcblxuICAvLyBSZXN0YXJ0IEF0b21cbiAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XG4gICAgXCJqdW5vLXBsdXM6cmVzdGFydC1hdG9tXCIoKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCB0YXJnZXQgPSBhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KClcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCBcIndpbmRvd3M6cmVsb2FkXCIpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgXCJkZXYtbGl2ZS1yZWxvYWQ6cmVsb2FkLWFsbFwiKVxuICAgIH0sXG4gIH0pXG5cbiAgLy8gUmVzdGFydCBKdWxpYVxuICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICBcImp1bm8tcGx1czpyZXN0YXJ0LWp1bGlhXCIoKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCB0YXJnZXQgPSBhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KClcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kc1xuICAgICAgICAgIC5kaXNwYXRjaCh0YXJnZXQsIFwianVsaWEtY2xpZW50OmtpbGwtanVsaWFcIilcbiAgICAgICAgICA/LnRoZW4oKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsIFwianVsaWEtY2xpZW50OnN0YXJ0LWp1bGlhXCIpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICAgICB7XG4gICAgICAvLyAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnanVsaWEtY2xpZW50OnN0YXJ0LWp1bGlhJylcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyB9LCAyNTApO1xuICAgIH0sXG4gIH0pXG5cbiAgLy8gUmV2aXNlXG4gIC8vIERTMTAyOiBSZW1vdmUgdW5uZWNlc3NhcnkgY29kZSBjcmVhdGVkIGJlY2F1c2Ugb2YgaW1wbGljaXQgcmV0dXJuc1xuICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICBcImp1bm8tcGx1czpSZXZpc2VcIigpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiU3RhcnRpbmcgUmV2aXNlXCIpXG4gICAgICBpZiAoanVsaWFDbGllbnQpIHtcbiAgICAgICAganVsaWFDbGllbnQuYm9vdCgpXG4gICAgICAgIGNvbnN0IHsgZXZhbHNpbXBsZSB9ID0ganVsaWFDbGllbnQuaW1wb3J0KHsgcnBjOiBbXCJldmFsc2ltcGxlXCJdIH0pXG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSAndXNpbmcgUmV2aXNlOyBwcmludGxuKFwiUmV2aXNlIGlzIHJlYWR5XCIpOydcbiAgICAgICAgZXZhbHNpbXBsZShjb21tYW5kKVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgLy8gQ2xlYXIgQ29uc29sZVxuICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICBcImp1bm8tcGx1czpDbGVhckNvbnNvbGVcIigpIHtcbiAgICAgIGlmIChqdWxpYUNsaWVudCkge1xuICAgICAgICBqdWxpYUNsaWVudC5ib290KClcbiAgICAgICAgY29uc3QgeyBldmFsc2ltcGxlIH0gPSBqdWxpYUNsaWVudC5pbXBvcnQoeyBycGM6IFtcImV2YWxzaW1wbGVcIl0gfSkgLy8gaW1wb3J0IGZ1bmN0aW9uXG4gICAgICAgIGxldCBjb21tYW5kID0gJ3ByaW50bG4oXCJcXFxcMzNbMkpcIik7J1xuICAgICAgICBjb21tYW5kICs9IFwiSnVuby5jbGVhcmNvbnNvbGUoKTtcIlxuICAgICAgICBldmFsc2ltcGxlKGNvbW1hbmQpXG4gICAgICB9XG4gICAgfSxcbiAgfSlcblxuICAvLyBEaXNhYmxlIEp1bm9cbiAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XG4gICAgXCJqdW5vLXBsdXM6ZW5hYmxlLWRpc2FibGUtanVub1wiKCkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc3QgdGFyZ2V0ID0gYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwYWNrYWdlcyA9IGF0b20uY29uZmlnLmdldChcImp1bm8tcGx1cy5KdW5vUGFja2FnZXNcIilcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsIFwianVuby1wbHVzOnJlc3RhcnRcIilcbiAgICAgICAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKFwianVsaWEtY2xpZW50XCIpICYmIEp1bm9Pbikge1xuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCBcImp1bGlhLWNsaWVudDpjbG9zZS1qdW5vLXBhbmVzXCIpXG4gICAgICAgICAgZm9yIChjb25zdCBwIG9mIHBhY2thZ2VzKSB7XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKHApXG4gICAgICAgICAgfVxuICAgICAgICAgIEp1bm9PbiA9IGZhbHNlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChjb25zdCBwIG9mIHBhY2thZ2VzKSB7XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UocClcbiAgICAgICAgICB9XG4gICAgICAgICAgSnVub09uID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCBcImp1bm8tcGx1czpyZXN0YXJ0LWF0b21cIilcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAgICAgJ1Jlc2V0IGRvbmUuIElmIHlvdSB3YW50IHRvIHVwZGF0ZSBUb29sYmFyIG9yIGluIGNhc2Ugb2YgYW4gZXJyb3IsIHJlbG9hZCBBdG9tIHVzaW5nIChDdHJsK1NoaWZ0K1ApK1wicmVsb2FkXCIrRW50ZXInXG4gICAgICAgIClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoZSlcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3JvbmcsIEF0b20gd2lsbCByZWxvYWRcIilcbiAgICAgICAgYXRvbS5yZXN0YXJ0QXBwbGljYXRpb24oKVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgLy8gRm9sZGluZyBUb2dnbGVcbiAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXRleHQtZWRpdG9yXCIsIFwianVuby1wbHVzOnRvZ2dsZS1mb2xkaW5nXCIsIChjb21tYW5kRXZlbnQpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBjb21tYW5kRXZlbnQuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgaWYgKGFsbEZvbGRlZCkge1xuICAgICAgICBlZGl0b3IudW5mb2xkQWxsKClcbiAgICAgICAgYWxsRm9sZGVkID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVkaXRvci5mb2xkQWxsKClcbiAgICAgICAgYWxsRm9sZGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAvLyBFbmFibGluZyBUb29sYmFyXG4gIGF0b20uY29uZmlnLnNldChcImp1bGlhLWNsaWVudC51aU9wdGlvbnMuZW5hYmxlVG9vbEJhclwiLCAhYXRvbS5jb25maWcuZ2V0KFwianVuby1wbHVzLmVuYWJsZVRvb2xiYXJQbHVzXCIpKVxufVxuXG5sZXQgdG9vbGJhcjogVG9vbEJhck1hbmFnZXIgfCBudWxsXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAodG9vbGJhcikge1xuICAgIHRvb2xiYXIucmVtb3ZlSXRlbXMoKVxuICAgIHRvb2xiYXIgPSBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IGdldFRvb2xCYXJNYW5hZ2VyKSB7XG4gIC8vIGdldHRpbmcgdG9vbGJhciBvYmplY3RcbiAgdG9vbGJhciA9IGdldFRvb2xCYXIoXCJqdW5vLXBsdXNcIilcblxuICAvLyBMb2FkZWQgUGFja2FnZXNcbiAgY29uc3QgSnVub0xvYWRlZCA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKFwianVsaWEtY2xpZW50XCIpICYmIEp1bm9PblxuICBjb25zdCBXZWF2ZUxvYWRlZCA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKFwianVsaWEtY2xpZW50XCIpXG4gIGNvbnN0IE1hcmtEb3duUHJldmlld0xvYWRlZCA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKFwibWFya2Rvd24tcHJldmlld1wiKVxuICBjb25zdCBCZWF1dGlmeUxvYWRlZCA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKFwiYXRvbS1iZWF1dGlmeVwiKVxuXG4gIC8vIEJ1dHRvbnMgQ29uZmlnXG4gIGNvbnN0IGxheW91dEFkanVzdG1lbnRCdXR0b25zID0gYXRvbS5jb25maWcuZ2V0KFwianVuby1wbHVzLmxheW91dEFkanVzdG1lbnRCdXR0b25zXCIpXG4gIGNvbnN0IFN0YXJ0SnVsaWFQcm9jZXNzQnV0dG9ucyA9IGF0b20uY29uZmlnLmdldChcImp1bm8tcGx1cy5TdGFydEp1bGlhUHJvY2Vzc0J1dHRvbnNcIilcbiAgY29uc3QgV2VhdmVCdXR0b25zID0gYXRvbS5jb25maWcuZ2V0KFwianVuby1wbHVzLldlYXZlQnV0dG9uc1wiKVxuXG4gIGNvbnN0IENvbG9yZnVsSWNvbnMgPSBhdG9tLmNvbmZpZy5nZXQoXCJqdW5vLXBsdXMuQ29sb3JmdWxJY29uc1wiKVxuICAvLyBCdXR0b25zOlxuXG4gIGlmIChDb2xvcmZ1bEljb25zKSB7XG4gICAgLy8gRmlsZXMgJiBGb2xkZXJzXG5cbiAgICBpZiAoSnVub0xvYWRlZCkge1xuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcImZpbGUtY29kZVwiLFxuICAgICAgICBpY29uc2V0OiBcImZhXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiTmV3IEp1bGlhIEZpbGVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWE6bmV3LWp1bGlhLWZpbGVcIixcbiAgICAgICAgY29sb3I6IFwicHVycGxlXCIsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZmlsZS1jb2RlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgICAgdG9vbHRpcDogXCJOZXcgRmlsZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJhcHBsaWNhdGlvbjpuZXctZmlsZVwiLFxuICAgICAgICBjb2xvcjogXCJraGFraVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcInNhdmVcIixcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIHRvb2x0aXA6IFwiU2F2ZVwiLFxuICAgICAgY2FsbGJhY2s6IFwiY29yZTpzYXZlXCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwiZm9sZGVyLW9wZW5cIixcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIHRvb2x0aXA6IFwiT3BlbiBGaWxlLi4uXCIsXG4gICAgICBjYWxsYmFjazogXCJhcHBsaWNhdGlvbjpvcGVuLWZpbGVcIixcbiAgICAgIGNvbG9yOiBcImtoYWtpXCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwiZmlsZS1zdWJtb2R1bGVcIixcbiAgICAgIHRvb2x0aXA6IFwiT3BlbiBGb2xkZXIuLi5cIixcbiAgICAgIGNhbGxiYWNrOiBcImFwcGxpY2F0aW9uOm9wZW4tZm9sZGVyXCIsXG4gICAgICBjb2xvcjogXCJraGFraVwiLFxuICAgIH0pXG5cbiAgICBpZiAoSnVub0xvYWRlZCkge1xuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcImZpbGUtc3ltbGluay1kaXJlY3RvcnlcIixcbiAgICAgICAgdG9vbHRpcDogXCJTZWxlY3QgV29ya2luZyBEaXJlY3RvcnkuLi5cIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50OnNlbGVjdC13b3JraW5nLWZvbGRlclwiLFxuICAgICAgICBjb2xvcjogXCJraGFraVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBKdWxpYSBwcm9jZXNzXG5cbiAgICB0b29sYmFyLmFkZFNwYWNlcigpXG5cbiAgICBpZiAoSnVub0xvYWRlZCkge1xuICAgICAgaWYgKFN0YXJ0SnVsaWFQcm9jZXNzQnV0dG9ucykge1xuICAgICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgICAgaWNvbjogXCJtZC1wbGFuZXRcIixcbiAgICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICAgIHRvb2x0aXA6IFwiU3RhcnQgUmVtb3RlIEp1bGlhIFByb2Nlc3NcIixcbiAgICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6c3RhcnQtcmVtb3RlLWp1bGlhLXByb2Nlc3NcIixcbiAgICAgICAgICBjb2xvcjogXCJtZWRpdW12aW9sZXRyZWRcIixcbiAgICAgICAgfSlcblxuICAgICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgICAgaWNvbjogXCJhbHBoYS1qXCIsXG4gICAgICAgICAgaWNvbnNldDogXCJtZGlcIixcbiAgICAgICAgICB0b29sdGlwOiBcIlN0YXJ0IExvY2FsIEp1bGlhIFByb2Nlc3NcIixcbiAgICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6c3RhcnQtanVsaWFcIixcbiAgICAgICAgICBjb2xvcjogXCJtZWRpdW12aW9sZXRyZWRcIixcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcIm1kLWluZmluaXRlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiaW9uXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiUmV2aXNlIEp1bGlhXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bm8tcGx1czpSZXZpc2VcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJtZC1wYXVzZVwiLFxuICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICB0b29sdGlwOiBcIkludGVycnVwdCBKdWxpYSAoU3RvcCBSdW5uaW5nKVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6aW50ZXJydXB0LWp1bGlhXCIsXG4gICAgICAgIGNvbG9yOiBcInllbGxvd1wiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcIm1kLXNxdWFyZVwiLFxuICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICB0b29sdGlwOiBcIlN0b3AgSnVsaWFcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50OmtpbGwtanVsaWFcIixcbiAgICAgICAgY29sb3I6IFwiY3JpbXNvblwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcInN5bmNcIixcbiAgICAgICAgdG9vbHRpcDogXCJSZXN0YXJ0IEp1bGlhXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bm8tcGx1czpyZXN0YXJ0LWp1bGlhXCIsXG4gICAgICAgIGNvbG9yOiBcImRvZGdlcmJsdWVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJlcmFzZXJcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICB0b29sdGlwOiBcIkNsZWFyIEp1bGlhIENvbnNvbGVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50OmNsZWFyLVJFUExcIixcbiAgICAgICAgY29sb3I6IFwieWVsbG93XCIsXG4gICAgICB9KVxuXG4gICAgICAvLyBFdmFsdWF0aW9uXG5cbiAgICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcIm1kLXBsYXlcIixcbiAgICAgICAgaWNvbnNldDogXCJpb25cIixcbiAgICAgICAgdG9vbHRpcDogXCJSdW4gQWxsXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpydW4tYWxsXCIsXG4gICAgICAgIGNvbG9yOiBcInNwcmluZ2dyZWVuXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiaW9zLXNraXAtZm9yd2FyZFwiLFxuICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICB0b29sdGlwOiBcIlJ1biBDZWxsIChiZXR3ZWVuICMjKVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6cnVuLWNlbGwtYW5kLW1vdmVcIixcbiAgICAgICAgY29sb3I6IFwic3ByaW5nZ3JlZW5cIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJwYXJhZ3JhcGhcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICB0b29sdGlwOiBcIlJ1biBCbG9ja1wiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6cnVuLWFuZC1tb3ZlXCIsXG4gICAgICAgIGNvbG9yOiBcInNwcmluZ2dyZWVuXCIsXG4gICAgICB9KVxuXG4gICAgICAvLyBEZWJ1Z2dpbmdcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgdGV4dDogYFxuICAgICAgICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgICAgICAuanVub3BfY29udGFpbmVyIHtcbiAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuanVub3BfY29sdW1uIHtcbiAgICAgICAgICAgICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgICAgICAgPCEtLSB3cml0ZSBzdHlsZSBvbmx5IG9uY2UgLS0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyIGp1bm9wX2NvbHVtblwiPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1idWdcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1wbGF5XCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgLFxuICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICB0b29sdGlwOiBcIkRlYnVnOiBSdW4gRmlsZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1kZWJ1ZzpydW4tZmlsZVwiLFxuICAgICAgICBjb2xvcjogXCJicm93blwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICB0ZXh0OiBgXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyIGp1bm9wX2NvbHVtblwiPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1idWdcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1zaGFyZVwiIHN0eWxlPVwiZm9udC1zaXplOiA3MCVcIj48L2k+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCxcbiAgICAgICAgaHRtbDogdHJ1ZSxcbiAgICAgICAgdG9vbHRpcDogXCJEZWJ1ZzogU3RlcCBJbnRvIEZpbGVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6c3RlcC10aHJvdWdoLWZpbGVcIixcbiAgICAgICAgY29sb3I6IFwiYnJvd25cIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgdGV4dDogYFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bm9wX2NvbnRhaW5lciBqdW5vcF9jb2x1bW5cIj5cbiAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtYnVnXCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtcGFyYWdyYXBoXCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgLFxuICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICB0b29sdGlwOiBcIkRlYnVnOiBSdW4gQmxvY2tcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6cnVuLWJsb2NrXCIsXG4gICAgICAgIGNvbG9yOiBcImJyb3duXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIHRleHQ6IGBcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW5vcF9jb250YWluZXIganVub3BfY29sdW1uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLWJ1Z1wiIHN0eWxlPVwiZm9udC1zaXplOiA3MCVcIj48L2k+XG4gICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1wYXJhZ3JhcGhcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2hhcmVcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCxcbiAgICAgICAgaHRtbDogdHJ1ZSxcbiAgICAgICAgdG9vbHRpcDogXCJEZWJ1ZzogU3RlcCBJbnRvIEJsb2NrXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWRlYnVnOnN0ZXAtdGhyb3VnaC1ibG9ja1wiLFxuICAgICAgICBjb2xvcjogXCJicm93blwiLFxuICAgICAgfSlcblxuICAgICAgLy8vLyBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9ob3ctdG8tdXNlL29uLXRoZS13ZWIvc3R5bGluZy9zdGFja2luZy1pY29uc1xuICAgICAgLy8vLyBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS92NC43LjAvaWNvbnMvXG4gICAgICAvLyB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAvLyAgIHRleHQ6IGBcbiAgICAgIC8vICAgPGhlYWQ+XG4gICAgICAvLyAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCJodHRwczovL3VzZS5mb250YXdlc29tZS5jb20vcmVsZWFzZXMvdjUuMTIuMS9jc3MvYWxsLmNzc1wiPlxuICAgICAgLy8gICA8L2hlYWQ+XG4gICAgICAvLyAgIDxzdHlsZT5cbiAgICAgIC8vICAgICAuZmEtc3RhY2sgeyBmb250LXNpemU6IDAuNWVtOyB9XG4gICAgICAvLyAgICAgaSB7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IH1cbiAgICAgIC8vICAgPC9zdHlsZT5cbiAgICAgIC8vICAgPHNwYW4gY2xhc3M9XCJmYS1zdGFjayBmYVwiPlxuICAgICAgLy8gICAgIDxpIGNsYXNzPVwiZmEgZmEtYnVnIGZhLXN0YWNrLTJ4XCIgZGF0YS1mYS10cmFuc2Zvcm09XCJ1cC02XCI+PC9pPlxuICAgICAgLy8gICAgIDxpIGNsYXNzPVwiZmEgZmEtcGxheSBmYS1zdGFjay0xeCBmYS1pbnZlcnNlXCIgZGF0YS1mYS10cmFuc2Zvcm09XCJkb3duLTZcIlwiPjwvaT5cbiAgICAgIC8vICAgPC9zcGFuPlxcXG4gICAgICAvLyAgIGAsXG4gICAgICAvLyAgICBodG1sOiB0cnVlLFxuICAgICAgLy8gICAgdG9vbHRpcDogJ0RlYnVnOiBSdW4gRmlsZScsXG4gICAgICAvLyAgICBjYWxsYmFjazogJ2p1bGlhLWRlYnVnOnJ1bi1maWxlJ1xuICAgICAgLy8gIH0pO1xuXG4gICAgICAvLyBDb2RlIFRvb2xzXG5cbiAgICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgICAgLy8gRG9jdW1lbnRhdGlvblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcInF1ZXN0aW9uXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiU2hvdyBEb2N1bWVudGF0aW9uIFtTZWxlY3Rpb25dXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpzaG93LWRvY3VtZW50YXRpb25cIixcbiAgICAgIH0pXG5cbiAgICAgIC8vIEdvIHRvIGRlZmluaXRpb25cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJkaWZmLXJlbmFtZWRcIixcbiAgICAgICAgdG9vbHRpcDogXCJHbyB0byBkZWZpbml0aW9uIFtTZWxlY3Rpb25dXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpnb3RvLXN5bWJvbFwiLFxuICAgICAgICBjb2xvcjogXCJhcXVhXCIsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIEJvb2ttYXJrc1xuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwibWQtYm9va21hcmtcIixcbiAgICAgIGljb25zZXQ6IFwiaW9uXCIsXG4gICAgICB0b29sdGlwOiBcIkFkZCBCb29rbWFyIEhlcmVcIixcbiAgICAgIGNhbGxiYWNrOiBcImJvb2ttYXJrczp0b2dnbGUtYm9va21hcmtcIixcbiAgICAgIGNvbG9yOiBcInN0ZWVsYmx1ZVwiLFxuICAgIH0pXG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcIm1kLWJvb2ttYXJrc1wiLFxuICAgICAgaWNvbnNldDogXCJpb25cIixcbiAgICAgIHRvb2x0aXA6IFwiVmlldyBCb29rbWFya3NcIixcbiAgICAgIGNhbGxiYWNrOiBcImJvb2ttYXJrczp2aWV3LWFsbFwiLFxuICAgICAgY29sb3I6IFwic3RlZWxibHVlXCIsXG4gICAgfSlcblxuICAgIGlmIChKdW5vTG9hZGVkKSB7XG4gICAgICAvLyBDb2RlIEZvcm1hdHRlcnNcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJmb3JtYXQtZmxvYXQtbm9uZVwiLFxuICAgICAgICBpY29uc2V0OiBcIm1kaVwiLFxuICAgICAgICB0b29sdGlwOiBcIkZvcm1hdCBDb2RlXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpmb3JtYXQtY29kZVwiLFxuICAgICAgICBjb2xvcjogXCJwZWFjaHB1ZmZcIixcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKEJlYXV0aWZ5TG9hZGVkKSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwic3RhclwiLFxuICAgICAgICBjYWxsYmFjazogXCJhdG9tLWJlYXV0aWZ5OmJlYXV0aWZ5LWVkaXRvclwiLFxuICAgICAgICB0b29sdGlwOiBcIkJlYXV0aWZ5XCIsXG4gICAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgICAgY29sb3I6IFwicGVhY2hwdWZmXCIsXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwiaW5kZW50XCIsXG4gICAgICBjYWxsYmFjazogXCJlZGl0b3I6YXV0by1pbmRlbnRcIixcbiAgICAgIHRvb2x0aXA6IFwiQXV0byBpbmRlbnQgKHNlbGVjdGlvbilcIixcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIGNvbG9yOiBcIm1vY2Nhc2luXCIsXG4gICAgfSlcblxuICAgIC8vIEZvbGRcbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICB0ZXh0OiAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLXJpZ2h0IGZhLXNtXCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duIGZhLXNtXCI+PC9pPicsXG4gICAgICBodG1sOiB0cnVlLFxuICAgICAgdG9vbHRpcDogXCJUb2dnbGUgRm9sZGluZ1wiLFxuICAgICAgY2FsbGJhY2s6IFwianVuby1wbHVzOnRvZ2dsZS1mb2xkaW5nXCIsXG4gICAgfSlcblxuICAgIC8vIExheW91dCBBZGp1c3RtZW50XG5cbiAgICBpZiAoSnVub0xvYWRlZCAmJiBsYXlvdXRBZGp1c3RtZW50QnV0dG9ucykge1xuICAgICAgdG9vbGJhci5hZGRTcGFjZXIoKVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwidGVybWluYWxcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFJFUExcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50Om9wZW4tUkVQTFwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcImJvb2tcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFdvcmtzcGFjZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi13b3Jrc3BhY2VcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJsaXN0LXVub3JkZXJlZFwiLFxuICAgICAgICB0b29sdGlwOiBcIlNob3cgT3V0bGluZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi1vdXRsaW5lLXBhbmVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJpbmZvXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiU2hvdyBEb2N1bWVudGF0aW9uIEJyb3dzZXJcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50Om9wZW4tZG9jdW1lbnRhdGlvbi1icm93c2VyXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZ3JhcGhcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFBsb3QgUGFuZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi1wbG90LXBhbmVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJidWdcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IERlYnVnZ2VyIFBhbmVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6b3Blbi1kZWJ1Z2dlci1wYW5lXCIsXG4gICAgICAgIGNvbG9yOiBcImJyb3duXCIsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFZpZXdlcnNcblxuICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgIGlmIChNYXJrRG93blByZXZpZXdMb2FkZWQpIHtcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJtYXJrZG93blwiLFxuICAgICAgICBjYWxsYmFjazogXCJtYXJrZG93bi1wcmV2aWV3OnRvZ2dsZVwiLFxuICAgICAgICB0b29sdGlwOiBcIk1hcmtkb3duIFByZXZpZXdcIixcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKEp1bm9Mb2FkZWQgJiYgV2VhdmVCdXR0b25zICYmIFdlYXZlTG9hZGVkKSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwibGFuZ3VhZ2UtaHRtbDVcIixcbiAgICAgICAgaWNvbnNldDogXCJtZGlcIixcbiAgICAgICAgY2FsbGJhY2s6IFwid2VhdmU6d2VhdmUtdG8taHRtbFwiLFxuICAgICAgICB0b29sdGlwOiBcIldlYXZlIEhUTUxcIixcbiAgICAgICAgY29sb3I6IFwiaW5kaWdvXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZmlsZS1wZGZcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICBjYWxsYmFjazogXCJ3ZWF2ZTp3ZWF2ZS10by1wZGZcIixcbiAgICAgICAgdG9vbHRpcDogXCJXZWF2ZSBQREZcIixcbiAgICAgICAgY29sb3I6IFwiaW5kaWdvXCIsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIEF0b21cblxuICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgIC8vIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAvLyAgICBpY29uOiAndG9vbHMnLFxuICAgIC8vICAgIGljb25zZXQ6ICdmYScsXG4gICAgLy8gICAgdG9vbHRpcDogJ0p1bGlhIENsaWVudCBTZXR0aW5ncy4uLicsXG4gICAgLy8gICAgY2FsbGJhY2s6ICdqdWxpYS1jbGllbnQ6c2V0dGluZ3MnXG4gICAgLy8gfSk7XG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcImdlYXJcIixcbiAgICAgIGNhbGxiYWNrOiBcInNldHRpbmdzLXZpZXc6b3BlblwiLFxuICAgICAgdG9vbHRpcDogXCJPcGVuIFNldHRpbmdzIFZpZXdcIixcbiAgICAgIGNvbG9yOiBcInNsYXRlZ3JheVwiLFxuICAgIH0pXG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uc2V0OiBcImZhXCIsXG4gICAgICBpY29uOiBcImFycm93cy1hbHRcIixcbiAgICAgIHRvb2x0aXA6IFwiVG9nZ2xlIEZ1bGxzY3JlZW5cIixcbiAgICAgIGNhbGxiYWNrOiBcIndpbmRvdzp0b2dnbGUtZnVsbC1zY3JlZW5cIixcbiAgICAgIGNvbG9yOiBcInNsYXRlZ3JheVwiLFxuICAgIH0pXG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcImdyaXAtbGluZXNcIixcbiAgICAgIGNhbGxiYWNrOiBcImNvbW1hbmQtcGFsZXR0ZTp0b2dnbGVcIixcbiAgICAgIHRvb2x0aXA6IFwiVG9nZ2xlIENvbW1hbmQgUGFsZXR0ZVwiLFxuICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgY29sb3I6IFwic2xhdGVncmF5XCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwicGx1Z1wiLFxuICAgICAgY2FsbGJhY2s6IFwianVuby1wbHVzOmVuYWJsZS1kaXNhYmxlLWp1bm9cIixcbiAgICAgIHRvb2x0aXA6IFwiRW5hYmxlL0Rpc2FibGUgSnVub1wiLFxuICAgIH0pXG5cbiAgICAvLyB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgLy8gICAgICBpY29uOiAneCcsXG4gICAgLy8gICAgICBjYWxsYmFjazogJ3Rvb2wtYmFyOnRvZ2dsZScsXG4gICAgLy8gICAgICB0b29sdGlwOiAnQ2xvc2UgVG9vbC1CYXInLFxuICAgIC8vICAgICAgaWNvbnNldDogJydcbiAgICAvLyAgfSk7XG4gIH0gLy8gQ29sb3JsZXNzIGJ1dHRvbnM6XG4gIGVsc2Uge1xuICAgIC8vIEZpbGVzICYgRm9sZGVyc1xuXG4gICAgaWYgKEp1bm9Mb2FkZWQpIHtcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJmaWxlLWNvZGVcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICB0b29sdGlwOiBcIk5ldyBKdWxpYSBGaWxlXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhOm5ldy1qdWxpYS1maWxlXCIsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZmlsZS1jb2RlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgICAgdG9vbHRpcDogXCJOZXcgRmlsZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJhcHBsaWNhdGlvbjpuZXctZmlsZVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcInNhdmVcIixcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIHRvb2x0aXA6IFwiU2F2ZVwiLFxuICAgICAgY2FsbGJhY2s6IFwiY29yZTpzYXZlXCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwiZm9sZGVyLW9wZW5cIixcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIHRvb2x0aXA6IFwiT3BlbiBGaWxlLi4uXCIsXG4gICAgICBjYWxsYmFjazogXCJhcHBsaWNhdGlvbjpvcGVuLWZpbGVcIixcbiAgICB9KVxuXG4gICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogXCJmaWxlLXN1Ym1vZHVsZVwiLFxuICAgICAgdG9vbHRpcDogXCJPcGVuIEZvbGRlci4uLlwiLFxuICAgICAgY2FsbGJhY2s6IFwiYXBwbGljYXRpb246b3Blbi1mb2xkZXJcIixcbiAgICB9KVxuXG4gICAgaWYgKEp1bm9Mb2FkZWQpIHtcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJmaWxlLWNvZGVcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICB0b29sdGlwOiBcIk5ldyBKdWxpYSBGaWxlXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhOm5ldy1qdWxpYS1maWxlXCIsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZmlsZS1jb2RlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgICAgdG9vbHRpcDogXCJOZXcgRmlsZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJhcHBsaWNhdGlvbjpuZXctZmlsZVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBKdWxpYSBwcm9jZXNzXG5cbiAgICB0b29sYmFyLmFkZFNwYWNlcigpXG5cbiAgICBpZiAoSnVub0xvYWRlZCkge1xuICAgICAgaWYgKFN0YXJ0SnVsaWFQcm9jZXNzQnV0dG9ucykge1xuICAgICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgICAgaWNvbjogXCJtZC1wbGFuZXRcIixcbiAgICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICAgIHRvb2x0aXA6IFwiU3RhcnQgUmVtb3RlIEp1bGlhIFByb2Nlc3NcIixcbiAgICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6c3RhcnQtcmVtb3RlLWp1bGlhLXByb2Nlc3NcIixcbiAgICAgICAgfSlcblxuICAgICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgICAgaWNvbjogXCJhbHBoYS1qXCIsXG4gICAgICAgICAgaWNvbnNldDogXCJtZGlcIixcbiAgICAgICAgICB0b29sdGlwOiBcIlN0YXJ0IExvY2FsIEp1bGlhIFByb2Nlc3NcIixcbiAgICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6c3RhcnQtanVsaWFcIixcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcIm1kLWluZmluaXRlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiaW9uXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiUmV2aXNlIEp1bGlhXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bm8tcGx1czpSZXZpc2VcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJtZC1wYXVzZVwiLFxuICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICB0b29sdGlwOiBcIkludGVycnVwdCBKdWxpYSAoU3RvcCBSdW5uaW5nKVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6aW50ZXJydXB0LWp1bGlhXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwibWQtc3F1YXJlXCIsXG4gICAgICAgIGljb25zZXQ6IFwiaW9uXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiU3RvcCBKdWxpYVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6a2lsbC1qdWxpYVwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcInN5bmNcIixcbiAgICAgICAgdG9vbHRpcDogXCJSZXN0YXJ0IEp1bGlhXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bm8tcGx1czpyZXN0YXJ0LWp1bGlhXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZXJhc2VyXCIsXG4gICAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgICAgdG9vbHRpcDogXCJDbGVhciBKdWxpYSBDb25zb2xlXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpjbGVhci1SRVBMXCIsXG4gICAgICB9KVxuXG4gICAgICAvLyBFdmFsdWF0aW9uXG5cbiAgICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcIm1kLXBsYXlcIixcbiAgICAgICAgaWNvbnNldDogXCJpb25cIixcbiAgICAgICAgdG9vbHRpcDogXCJSdW4gQWxsXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpydW4tYWxsXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiaW9zLXNraXAtZm9yd2FyZFwiLFxuICAgICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgICB0b29sdGlwOiBcIlJ1biBDZWxsIChiZXR3ZWVuICMjKVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6cnVuLWNlbGwtYW5kLW1vdmVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJwYXJhZ3JhcGhcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgICB0b29sdGlwOiBcIlJ1biBCbG9ja1wiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6cnVuLWFuZC1tb3ZlXCIsXG4gICAgICB9KVxuXG4gICAgICAvLyBEZWJ1Z2dpbmdcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgdGV4dDogYFxuICAgICAgICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgICAgICAuanVub3BfY29udGFpbmVyIHtcbiAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuanVub3BfY29sdW1uIHtcbiAgICAgICAgICAgICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgICAgICAgPCEtLSB3cml0ZSBzdHlsZSBvbmx5IG9uY2UgLS0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyIGp1bm9wX2NvbHVtblwiPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1idWdcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1wbGF5XCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgLFxuICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICB0b29sdGlwOiBcIkRlYnVnOiBSdW4gRmlsZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1kZWJ1ZzpydW4tZmlsZVwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICB0ZXh0OiBgXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyIGp1bm9wX2NvbHVtblwiPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1idWdcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1zaGFyZVwiIHN0eWxlPVwiZm9udC1zaXplOiA3MCVcIj48L2k+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCxcbiAgICAgICAgaHRtbDogdHJ1ZSxcbiAgICAgICAgdG9vbHRpcDogXCJEZWJ1ZzogU3RlcCBJbnRvIEZpbGVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6c3RlcC10aHJvdWdoLWZpbGVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgdGV4dDogYFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImp1bm9wX2NvbnRhaW5lciBqdW5vcF9jb2x1bW5cIj5cbiAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtYnVnXCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtcGFyYWdyYXBoXCIgc3R5bGU9XCJmb250LXNpemU6IDcwJVwiPjwvaT5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBgLFxuICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICB0b29sdGlwOiBcIkRlYnVnOiBSdW4gQmxvY2tcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6cnVuLWJsb2NrXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIHRleHQ6IGBcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJqdW5vcF9jb250YWluZXIganVub3BfY29sdW1uXCI+XG4gICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLWJ1Z1wiIHN0eWxlPVwiZm9udC1zaXplOiA3MCVcIj48L2k+XG4gICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwianVub3BfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1wYXJhZ3JhcGhcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2hhcmVcIiBzdHlsZT1cImZvbnQtc2l6ZTogNzAlXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgYCxcbiAgICAgICAgaHRtbDogdHJ1ZSxcbiAgICAgICAgdG9vbHRpcDogXCJEZWJ1ZzogU3RlcCBJbnRvIEJsb2NrXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWRlYnVnOnN0ZXAtdGhyb3VnaC1ibG9ja1wiLFxuICAgICAgfSlcblxuICAgICAgLy8vLyBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9ob3ctdG8tdXNlL29uLXRoZS13ZWIvc3R5bGluZy9zdGFja2luZy1pY29uc1xuICAgICAgLy8vLyBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS92NC43LjAvaWNvbnMvXG4gICAgICAvLyB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAvLyAgIHRleHQ6IGBcbiAgICAgIC8vICAgPGhlYWQ+XG4gICAgICAvLyAgICAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCJodHRwczovL3VzZS5mb250YXdlc29tZS5jb20vcmVsZWFzZXMvdjUuMTIuMS9jc3MvYWxsLmNzc1wiPlxuICAgICAgLy8gICA8L2hlYWQ+XG4gICAgICAvLyAgIDxzdHlsZT5cbiAgICAgIC8vICAgICAuZmEtc3RhY2sgeyBmb250LXNpemU6IDAuNWVtOyB9XG4gICAgICAvLyAgICAgaSB7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IH1cbiAgICAgIC8vICAgPC9zdHlsZT5cbiAgICAgIC8vICAgPHNwYW4gY2xhc3M9XCJmYS1zdGFjayBmYVwiPlxuICAgICAgLy8gICAgIDxpIGNsYXNzPVwiZmEgZmEtYnVnIGZhLXN0YWNrLTJ4XCIgZGF0YS1mYS10cmFuc2Zvcm09XCJ1cC02XCI+PC9pPlxuICAgICAgLy8gICAgIDxpIGNsYXNzPVwiZmEgZmEtcGxheSBmYS1zdGFjay0xeCBmYS1pbnZlcnNlXCIgZGF0YS1mYS10cmFuc2Zvcm09XCJkb3duLTZcIlwiPjwvaT5cbiAgICAgIC8vICAgPC9zcGFuPlxcXG4gICAgICAvLyAgIGAsXG4gICAgICAvLyAgICBodG1sOiB0cnVlLFxuICAgICAgLy8gICAgdG9vbHRpcDogJ0RlYnVnOiBSdW4gRmlsZScsXG4gICAgICAvLyAgICBjYWxsYmFjazogJ2p1bGlhLWRlYnVnOnJ1bi1maWxlJ1xuICAgICAgLy8gIH0pO1xuXG4gICAgICAvLyBDb2RlIFRvb2xzXG5cbiAgICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgICAgLy8gRG9jdW1lbnRhdGlvblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcInF1ZXN0aW9uXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiU2hvdyBEb2N1bWVudGF0aW9uIFtTZWxlY3Rpb25dXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpzaG93LWRvY3VtZW50YXRpb25cIixcbiAgICAgIH0pXG5cbiAgICAgIC8vIEdvIHRvIGRlZmluaXRpb25cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJkaWZmLXJlbmFtZWRcIixcbiAgICAgICAgdG9vbHRpcDogXCJHbyB0byBkZWZpbml0aW9uIFtTZWxlY3Rpb25dXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpnb3RvLXN5bWJvbFwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBCb29rbWFya3NcbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcIm1kLWJvb2ttYXJrXCIsXG4gICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgdG9vbHRpcDogXCJBZGQgQm9va21hciBIZXJlXCIsXG4gICAgICBjYWxsYmFjazogXCJib29rbWFya3M6dG9nZ2xlLWJvb2ttYXJrXCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246IFwibWQtYm9va21hcmtzXCIsXG4gICAgICBpY29uc2V0OiBcImlvblwiLFxuICAgICAgdG9vbHRpcDogXCJWaWV3IEJvb2ttYXJrc1wiLFxuICAgICAgY2FsbGJhY2s6IFwiYm9va21hcmtzOnZpZXctYWxsXCIsXG4gICAgfSlcblxuICAgIGlmIChKdW5vTG9hZGVkKSB7XG4gICAgICAvLyBDb2RlIEZvcm1hdHRlcnNcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJmb3JtYXQtZmxvYXQtbm9uZVwiLFxuICAgICAgICBpY29uc2V0OiBcIm1kaVwiLFxuICAgICAgICB0b29sdGlwOiBcIkZvcm1hdCBDb2RlXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImp1bGlhLWNsaWVudDpmb3JtYXQtY29kZVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoQmVhdXRpZnlMb2FkZWQpIHtcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJzdGFyXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktZWRpdG9yXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiQmVhdXRpZnlcIixcbiAgICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcImluZGVudFwiLFxuICAgICAgY2FsbGJhY2s6IFwiZWRpdG9yOmF1dG8taW5kZW50XCIsXG4gICAgICB0b29sdGlwOiBcIkF1dG8gaW5kZW50IChzZWxlY3Rpb24pXCIsXG4gICAgICBpY29uc2V0OiBcImZhXCIsXG4gICAgfSlcblxuICAgIC8vIEZvbGRcbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICB0ZXh0OiAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLXJpZ2h0IGZhLXNtXCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1kb3duIGZhLXNtXCI+PC9pPicsXG4gICAgICBodG1sOiB0cnVlLFxuICAgICAgdG9vbHRpcDogXCJUb2dnbGUgRm9sZGluZ1wiLFxuICAgICAgY2FsbGJhY2s6IFwianVuby1wbHVzOnRvZ2dsZS1mb2xkaW5nXCIsXG4gICAgfSlcblxuICAgIC8vIExheW91dCBBZGp1c3RtZW50XG5cbiAgICBpZiAoSnVub0xvYWRlZCAmJiBsYXlvdXRBZGp1c3RtZW50QnV0dG9ucykge1xuICAgICAgdG9vbGJhci5hZGRTcGFjZXIoKVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwidGVybWluYWxcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFJFUExcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50Om9wZW4tUkVQTFwiLFxuICAgICAgfSlcblxuICAgICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgICBpY29uOiBcImJvb2tcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFdvcmtzcGFjZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi13b3Jrc3BhY2VcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJsaXN0LXVub3JkZXJlZFwiLFxuICAgICAgICB0b29sdGlwOiBcIlNob3cgT3V0bGluZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi1vdXRsaW5lLXBhbmVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJpbmZvXCIsXG4gICAgICAgIHRvb2x0aXA6IFwiU2hvdyBEb2N1bWVudGF0aW9uIEJyb3dzZXJcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtY2xpZW50Om9wZW4tZG9jdW1lbnRhdGlvbi1icm93c2VyXCIsXG4gICAgICB9KVxuXG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwiZ3JhcGhcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IFBsb3QgUGFuZVwiLFxuICAgICAgICBjYWxsYmFjazogXCJqdWxpYS1jbGllbnQ6b3Blbi1wbG90LXBhbmVcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJidWdcIixcbiAgICAgICAgdG9vbHRpcDogXCJTaG93IERlYnVnZ2VyIFBhbmVcIixcbiAgICAgICAgY2FsbGJhY2s6IFwianVsaWEtZGVidWc6b3Blbi1kZWJ1Z2dlci1wYW5lXCIsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFZpZXdlcnNcblxuICAgIHRvb2xiYXIuYWRkU3BhY2VyKClcblxuICAgIGlmIChNYXJrRG93blByZXZpZXdMb2FkZWQpIHtcbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJtYXJrZG93blwiLFxuICAgICAgICBjYWxsYmFjazogXCJtYXJrZG93bi1wcmV2aWV3OnRvZ2dsZVwiLFxuICAgICAgICB0b29sdGlwOiBcIk1hcmtkb3duIFByZXZpZXdcIixcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKEp1bm9Mb2FkZWQgJiYgV2VhdmVCdXR0b25zICYmIFdlYXZlTG9hZGVkKSB7XG4gICAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICAgIGljb246IFwibGFuZ3VhZ2UtaHRtbDVcIixcbiAgICAgICAgaWNvbnNldDogXCJtZGlcIixcbiAgICAgICAgY2FsbGJhY2s6IFwid2VhdmU6d2VhdmUtdG8taHRtbFwiLFxuICAgICAgICB0b29sdGlwOiBcIldlYXZlIEhUTUxcIixcbiAgICAgIH0pXG5cbiAgICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgICAgaWNvbjogXCJmaWxlLXBkZlwiLFxuICAgICAgICBpY29uc2V0OiBcImZhXCIsXG4gICAgICAgIGNhbGxiYWNrOiBcIndlYXZlOndlYXZlLXRvLXBkZlwiLFxuICAgICAgICB0b29sdGlwOiBcIldlYXZlIFBERlwiLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBBdG9tXG5cbiAgICB0b29sYmFyLmFkZFNwYWNlcigpXG5cbiAgICAvLyB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgLy8gICAgaWNvbjogJ3Rvb2xzJyxcbiAgICAvLyAgICBpY29uc2V0OiAnZmEnLFxuICAgIC8vICAgIHRvb2x0aXA6ICdKdWxpYSBDbGllbnQgU2V0dGluZ3MuLi4nLFxuICAgIC8vICAgIGNhbGxiYWNrOiAnanVsaWEtY2xpZW50OnNldHRpbmdzJ1xuICAgIC8vIH0pO1xuXG4gICAgdG9vbGJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogXCJnZWFyXCIsXG4gICAgICBjYWxsYmFjazogXCJzZXR0aW5ncy12aWV3Om9wZW5cIixcbiAgICAgIHRvb2x0aXA6IFwiT3BlbiBTZXR0aW5ncyBWaWV3XCIsXG4gICAgfSlcblxuICAgIHRvb2xiYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb25zZXQ6IFwiZmFcIixcbiAgICAgIGljb246IFwiYXJyb3dzLWFsdFwiLFxuICAgICAgdG9vbHRpcDogXCJUb2dnbGUgRnVsbHNjcmVlblwiLFxuICAgICAgY2FsbGJhY2s6IFwid2luZG93OnRvZ2dsZS1mdWxsLXNjcmVlblwiLFxuICAgIH0pXG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcImdyaXAtbGluZXNcIixcbiAgICAgIGNhbGxiYWNrOiBcImNvbW1hbmQtcGFsZXR0ZTp0b2dnbGVcIixcbiAgICAgIHRvb2x0aXA6IFwiVG9nZ2xlIENvbW1hbmQgUGFsZXR0ZVwiLFxuICAgICAgaWNvbnNldDogXCJmYVwiLFxuICAgIH0pXG5cbiAgICB0b29sYmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiBcInBsdWdcIixcbiAgICAgIGNhbGxiYWNrOiBcImp1bm8tcGx1czplbmFibGUtZGlzYWJsZS1qdW5vXCIsXG4gICAgICB0b29sdGlwOiBcIkVuYWJsZS9EaXNhYmxlIEp1bm9cIixcbiAgICB9KVxuXG4gICAgLy8gdG9vbGJhci5hZGRCdXR0b24oe1xuICAgIC8vICAgICAgaWNvbjogJ3gnLFxuICAgIC8vICAgICAgY2FsbGJhY2s6ICd0b29sLWJhcjp0b2dnbGUnLFxuICAgIC8vICAgICAgdG9vbHRpcDogJ0Nsb3NlIFRvb2wtQmFyJyxcbiAgICAvLyAgICAgIGljb25zZXQ6ICcnXG4gICAgLy8gIH0pO1xuICB9XG59XG4iXX0=