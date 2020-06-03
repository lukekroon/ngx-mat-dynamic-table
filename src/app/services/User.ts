export class User {

    name: string;
    surname: string;
    number: string;
    signupDate: Date;
    subscribed: boolean;
    money: Money;

    netWorthClass?: string;

    constructor(object) {
        Object.assign(this, object);
        // cant assign nested objets
        this.money = new Money(object.money);
    }
}

export class Money {
    netWorth: number;
    constructor(object) {
        Object.assign(this, object);
    }
}
