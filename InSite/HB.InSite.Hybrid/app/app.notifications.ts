import { RemoteNotifications, RemoteNotificationsConsumer } from "~/core/interfaces/notifications";
import { Injectable } from "@angular/core";

const firebase = require("nativescript-plugin-firebase");

@Injectable()
export class FirebaseRemoteNotifications implements RemoteNotifications {
    // noinspection TypeScriptFieldCanBeMadeReadonly
    private _initialized: boolean;
    // noinspection TypeScriptFieldCanBeMadeReadonly
    private _tokenReceived: boolean;

    constructor() {
        this._initialized = false;
        this._tokenReceived = false;
        // noinspection JSUnusedGlobalSymbols
        firebase.init({
            showNotifications: true,
            showNotificationsWhenInForeground: true,
        }).then(() => {
            this._initialized = true;
        }).catch(err => {
            console.log(err);
        });
    }

    public getToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            firebase.getCurrentPushToken().then((token: string) => {
                resolve(token);
            }).catch(err => {
                reject(err);
            });
        });
    }

    public isReady(): boolean {
        return this._initialized && this._tokenReceived;
    }

    public startListening(listener: RemoteNotificationsConsumer) {
        firebase.addOnPushTokenReceivedCallback(
            function() {
                // NO NEED TO DO ANYTHING HERE; TO GET THE CORRECT TOKEN FOR THE
                // DEVICE YOU NEED TO INVOKE THE getToken() method.
            }
        ).then(() => {
            this._tokenReceived = true;
        }).catch(err => {
            console.log(err);
        });

        firebase.addOnMessageReceivedCallback(
            function(message) {
                listener.messageReceived(message);
            }
        ).catch(err => {
            console.log(err);
        });
    }

    public subscribe(topic: string) {
        return new Promise((resolve, reject) => {
            firebase.subscribeToTopic(topic)
                .then(() => {
                    resolve();
                }).catch(err => {
                reject(err);
            });
        });
    }

    public unsubscribe(topic: string) {
        return new Promise((resolve, reject) => {
            firebase.unsubscribeFromTopic(topic)
                .then(() => {
                    resolve();
                }).catch(err => {
                reject(err);
            });
        });
    }
}