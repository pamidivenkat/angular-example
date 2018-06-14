export declare class SimpleBar {
    static removeObserver(): void;

    constructor(element: HTMLElement, options?: SimpleBar.Options);

    recalculate(): void;
    getScrollElement(): Element;
    getContentElement(): Element;
}

export declare namespace SimpleBar {
    interface Options {
        wrapContent?: boolean;
        autoHide?: boolean;
        scrollbarMinSize?: number;
        classNames?: ClassNamesOptions;
    }

    interface ClassNamesOptions {
        content?: string;
        scrollContent?: string;
        scrollbar?: string;
        track?: string;
    }
}