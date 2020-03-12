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

