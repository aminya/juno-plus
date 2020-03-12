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
    ToolbarPosition: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        order: number;
    };
    IconSizes: {
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
export declare function consumeJuliaClient(client: any): void;
export declare function activate(): void;
export declare function deactivate(): any;
export declare function consumeToolBar(bar: any): void;
