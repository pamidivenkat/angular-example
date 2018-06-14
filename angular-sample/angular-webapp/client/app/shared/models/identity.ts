export class Identity {
    token: string | null;
    idToken: string | null;
    nonce: string | null;
    state: string | null;
    url: string;
    isRefreshing: boolean = false;

    constructor(token = null, idToken = null, nonce = null, state = null, url = '') {
        this.token = token;
        this.idToken = idToken;
        this.nonce = nonce;
        this.state = state;
        this.url = url;
        this.isRefreshing = false;
    }
}