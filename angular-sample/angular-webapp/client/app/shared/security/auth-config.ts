
export interface IAuthConfig {
    globalHeaders: Array<Object>;
    headerName: string;
    headerPrefix: string;
    noJwtError: boolean;
    noClientCheck: boolean;
    noTokenScheme?: boolean;
    tokenName: string;
    refreshEndPoint: string;
    refreshpayload?: any;
    refreshBeforeSeconds: number;
    refreshTokenName?: string;
}

export interface IAuthConfigOptional {
    headerName?: string;
    headerPrefix?: string;
    tokenName?: string;
    noJwtError?: boolean;
    noClientCheck?: boolean;
    globalHeaders?: Array<Object>;
    noTokenScheme?: boolean;
    refreshEndPoint?: string;
    refreshpayload?: any;
    refreshBeforeSeconds?: number;
    refreshTokenName?: string;
}

export class AuthConfigConsts {
    public static DEFAULT_TOKEN_NAME = 'id_token';
    public static DEFAULT_HEADER_NAME = 'Authorization';
    public static HEADER_PREFIX_BEARER = 'Bearer ';
    public static REFRESH_TOKEN_ENDPOINT = 'refresh';
    public static REFRESH_TOKEN_NAME = 'refresh_token';
}

const AuthConfigDefaults: IAuthConfig = {
    headerName: AuthConfigConsts.DEFAULT_HEADER_NAME,
    headerPrefix: null,
    tokenName: AuthConfigConsts.DEFAULT_TOKEN_NAME,
    noJwtError: false,
    noClientCheck: false,
    globalHeaders: [],
    noTokenScheme: false,
    refreshEndPoint: AuthConfigConsts.REFRESH_TOKEN_ENDPOINT,
    refreshpayload: { refresh: true },
    refreshBeforeSeconds: 0,
    refreshTokenName: AuthConfigConsts.REFRESH_TOKEN_NAME
};


export class AuthConfig {

    private _config: IAuthConfig;

    constructor(config?: IAuthConfigOptional) {
        config = config || {};
        this._config = Object.assign({}, AuthConfigDefaults, config);
        if (this._config.headerPrefix) {
            this._config.headerPrefix += ' ';
        } else if (this._config.noTokenScheme) {
            this._config.headerPrefix = '';
        } else {
            this._config.headerPrefix = AuthConfigConsts.HEADER_PREFIX_BEARER;
        }
    }

    public getConfig(): IAuthConfig {
        return this._config;
    }
}

export function authConfigServiceFactory() {
    return new AuthConfig({
        tokenName: 'token',
        noJwtError: true,
        globalHeaders: [{ 'Content-Type': 'application/json' }, { 'Accept': 'application/json' }],
        refreshBeforeSeconds: 300
    })
}