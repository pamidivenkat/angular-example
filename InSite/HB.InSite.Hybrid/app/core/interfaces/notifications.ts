/**
 * Abstracts remote notifications components that can be used
 * to listen for messages like push notifications and can then
 * pass them along to other components of NativeScript or AngularJS.
 */
export interface RemoteNotifications {
    /**
     * Gets the push token received by the notifications service provider.
     */
    getToken(): Promise<string>;

    /**
     * Flag that determines if the component is ready to be used. BEWARE:
     * this will most likely return false in a emulator.
     */
    isReady(): boolean;

    /**
     * Begins listening to remote messages.
     */
    startListening(listener: RemoteNotificationsConsumer): void;

    /**
     * Subscribes to a topic to be able to consume a remote message
     * that has been publish for the topic.
     * @param topic: A string value with the name of the topic.
     */
    subscribe(topic: string): void;

    /**
     * Unsubscribes from a topic to stop consuming remote message
     * being publish for the topic.
     * @param topic: A string value with the name of the topic.
     */
    unsubscribe(topic: string): void;
}

/**
 * Abstracts a consumer of remote messages.
 */
export interface RemoteNotificationsConsumer {
    /**
     * Invoked by the RemoteNotifications concrete type when it receives a message.
     * @param message: The message as JSON.
     */
    messageReceived(message: string): void;
}