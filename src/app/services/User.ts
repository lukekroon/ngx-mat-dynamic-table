export class User {

    name: string;
    surname: string;
    number?: string;
    signupDate: Date;
    subscribed: boolean;
    money: Money;
    description?: string;

    netWorthClass?: string;

    constructor(object) {
        Object.assign(this, object);
        // cant assign nested objets
        this.money = new Money(object.money);
    }

    get fullName(): string {
        return `${this.name} ${this.surname}`;
    }
}

export class Money {
    netWorth: number;
    currency: string;

    constructor(object) {
        Object.assign(this, object);
    }
}
