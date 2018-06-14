export enum MessageEvent {
    Update,
    Create,
    Remove,
    Load,
    Copy,
    Distribute,
    Upload
}

export enum MessageStatus {
    InProgress,
    Complete,
    Failed,
    Custom
}