import * as Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
export class TableBlock extends BlockEmbed {
    static blotName: string = 'table';
    static tagName: string = 'table';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class TableRowBlock extends BlockEmbed {
    static blotName: string = 'tr';
    static tagName: string = 'tr';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class TablecolumnBlock extends BlockEmbed {
    static blotName: string = 'td';
    static tagName: string = 'td';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}
export class TableHeaderBlock extends BlockEmbed {
    static blotName: string = 'thead';
    static tagName: string = 'thead';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.text;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class TableHeadBlock extends BlockEmbed {
    static blotName: string = 'th';
    static tagName: string = 'th';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}
export class TableBodyBlock extends BlockEmbed {
    static blotName: string = 'tbody';
    static tagName: string = 'tbody';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

export class TableFooterBlock extends BlockEmbed {
    static blotName: string = 'tfoot';
    static tagName: string = 'tfoot';
    static create(value) {
        let node = super.create(value);
        node.innerHTML = value.innerHTML;
        return node;
    }
    static value(node) {
        return node;
    }
}

