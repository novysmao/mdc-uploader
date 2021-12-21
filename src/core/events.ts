interface EventsMap {
    [topic: string]: Function[];
}
export class Events {
    eventsMap: EventsMap = {};
    constructor() {}

    once(topic: string, callback: Function) {
        this.on(topic, () => {
            callback();
            this.off(topic)
        })
    }

    emit(topic: string, data: any) {
        if (this.eventsMap.hasOwnProperty(topic)) {
            this.eventsMap[topic].map(v => typeof v === 'function' && v(data));
        }
    }

    on(topic: string, callback: Function) {
        if (this.eventsMap.hasOwnProperty(topic)) {
            this.eventsMap[topic].push(callback);
        } else {
            this.eventsMap[topic] = [callback];
        }
    }

    off(topic: string) {
        if (this.eventsMap.hasOwnProperty(topic)) {
            delete this.eventsMap[topic]
        }
    }
}