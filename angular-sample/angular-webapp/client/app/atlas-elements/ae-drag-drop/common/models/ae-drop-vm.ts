import { AeDataTransfer } from "./data-transfer";

export class AeDropVm<T> {
    public identifiers: Array<string>;
    public canDrop: (context: AeDataTransfer<T>) => boolean;
    public dropEffect: string;
}
