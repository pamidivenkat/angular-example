export class AeDragVm<T> {
    public dragEffect: string;
    public dragHandle: string;
    public identifier: string;
    public canDragHandleContainer: boolean;
    public canChildrenDraggableIndependently: boolean;
    public canDrag: (context) => boolean;
    public model: T
}
