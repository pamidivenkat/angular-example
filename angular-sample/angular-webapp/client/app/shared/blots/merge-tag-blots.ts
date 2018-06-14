import * as Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
export class MergeTag extends BlockEmbed {
    static blotName: string = 'merge';
    static tagName: string = 'merge';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class MergeEmpty extends BlockEmbed {
    static blotName: string = 'merge-empty';
    static tagName: string = 'merge-empty';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}
export class MergeField extends BlockEmbed {
    static blotName: string = 'merge-field';
    static tagName: string = 'merge-field';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class SpanTag extends BlockEmbed {
    static blotName: string = 'span';
    static tagName: string = 'span';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class BreakTag extends BlockEmbed {
    static blotName: string = 'br';
    static tagName: string = 'br';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class DivTag extends BlockEmbed {
    static blotName: string = 'div';
    static tagName: string = 'div';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class ParagraphTag extends BlockEmbed {
    static blotName: string = 'p';
    static tagName: string = 'p';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}