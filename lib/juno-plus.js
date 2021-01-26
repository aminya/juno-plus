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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuby1wbHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2p1bm8tcGx1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFBO0FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNqQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7QUFFUixRQUFBLE1BQU0sR0FBRztJQUNwQixpQkFBaUIsRUFBRTtRQUNqQixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLDBCQUEwQjtRQUNqQyxXQUFXLEVBQUUsZ0VBQWdFO1FBQzdFLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCx3QkFBd0IsRUFBRTtRQUN4QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLDZCQUE2QjtRQUNwQyxXQUFXLEVBQUUsa0VBQWtFO1FBQy9FLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCx1QkFBdUIsRUFBRTtRQUN2QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLDJCQUEyQjtRQUNsQyxXQUFXLEVBQUUsZ0VBQWdFO1FBQzdFLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFFRCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLGVBQWU7UUFDdEIsV0FBVyxFQUFFLHNFQUFzRTtRQUNuRixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBRUQsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsV0FBVyxFQUFFLCtDQUErQztRQUM1RCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBRUQsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLE9BQU87UUFD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