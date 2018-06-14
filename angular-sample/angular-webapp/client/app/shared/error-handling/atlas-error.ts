
import { BaseError } from "make-error";

export class AtlasError extends BaseError {
    /**
     *
     */
    constructor(message: string) {
        super(message);
    }
}
