import { isNullOrUndefined } from 'util';
export class StringHelper {
    static isNullOrUndefined(data: string): boolean {
        return isNullOrUndefined(data);
    }
    static isNullOrUndefinedOrEmpty(data: string): boolean {
        return isNullOrUndefined(data) || (data.trim && data.trim().length <= 0);
    }
    static coerceNumberProperty(value: any, fallbackValue = 0) {
        // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
        // and other non-number values as NaN, where Number just uses 0) but it considers the string
        // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
        return isNaN(parseFloat(value as any)) || isNaN(Number(value)) ? fallbackValue : Number(value);
    }

    /** Coerces a data-bound value (typically a string) to a boolean. */
    static coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false' && `${value}` !== '0';
    }

    static getPlainText(text: string) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

    static snackbarMessage(objectType: string, objectIdentifier: string) {
        if (isNullOrUndefined(objectIdentifier)) {
            return `${objectType.toLowerCase()}`;
        }
        return `${objectType.toLowerCase()} <b>${objectIdentifier.slice(0, 40)} ${(objectIdentifier.length > 40) ? '...' : ''}</b>`;
    }
    static snackbarCustomMessage(customMessage: string) {
        if (isNullOrUndefined(customMessage)) {
            return `${customMessage.toLowerCase()}`;
        }
        return `<b>${customMessage.slice(0, 40)} ${(customMessage.length > 40) ? '...' : ''}</b>`;
    }

    static stringToHTML(text) : any {
        return new DOMParser().parseFromString(text, "text/html").documentElement.textContent;
    }
}
