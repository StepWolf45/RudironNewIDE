export default class Queue<T = any> {
    private items: T[];

    constructor() {
        this.items = [];
    }

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | string {
        if (this.isEmpty()) {
            return 'Queue is empty';
        }
        return this.items.shift() as T;
    }

    front(): T | string {
        if (this.isEmpty()) {
            return 'Queue is empty';
        }
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    print(): void {
        console.log(this.items.join(', '));
    }
}
