import type { getToolBarManager } from "atom/tool-bar";
declare type JuliaClient = {
    boot: () => void;
    import: (arg0: {
        rpc: string[];
    }) => {
        evalsimple: any;
    };
} | null;
export declare const config: {
    enableToolbarPlus: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    StartJuliaProcessButtons: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    layoutAdjustmentButtons: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    WeaveButtons: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    ColorfulIcons: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    JunoPackages: {
        type: string;
        default: string[];
        items: {
            type: string;
        };
        title: string;
        description: string;
        order: number;
    };
};
export declare function consumeJuliaClient(client: JuliaClient): void;
export declare function activate(): void;
export declare function deactivate(): void;
export declare function consumeToolBar(getToolBar: getToolBarManager): void;
export {};
