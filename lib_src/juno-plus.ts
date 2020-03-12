    IconSizes: {
        type: "boolean",
        default: true,
        title: "Icons Sizes",
        description: "Makes the size of Icons 21px (changing requires restart).",
        order:6
    },
    // IconSizes
    if (atom.config.get("juno-plus.IconSizes")) {
        atom.config.set("tool-bar.iconSize", '21px')
    }

