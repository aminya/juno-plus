    IconSizes: {
        type: "boolean",
        default: true,
        title: "Icons Sizes",
        description: "Makes the size of Icons 21px (changing requires restart).",
        order:6
    },
    // Toolbar Position
    if (atom.config.get("juno-plus.ToolbarPosition")) {
        atom.config.set("tool-bar.position", "Top")
    }
    // IconSizes
    if (atom.config.get("juno-plus.IconSizes")) {
        atom.config.set("tool-bar.iconSize", '21px')
    }

    // Loaded Packages
    const JunoLoaded = atom.packages.isPackageLoaded("julia-client") && JunoOn
    const WeaveLoaded = atom.packages.isPackageLoaded("julia-client")
    const MarkDownPreviewLoaded = atom.packages.isPackageLoaded("markdown-preview")
    const BeautifyLoaded = atom.packages.isPackageLoaded("atom-beautify")
    if (JunoLoaded) {
        this.bar.addButton({
            icon: "file-code",
            iconset: "fa",
            tooltip: "New Julia File",
            callback: "julia:new-julia-file"
        })
    } else {
        this.bar.addButton({
            icon: "file-code",
            iconset: "fa",
            tooltip: "New File",
            callback: "application:new-file"
        })
    }
