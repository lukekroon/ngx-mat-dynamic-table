export class User {
    
    name: string;
    surname: string;
    number: string;
    signupDate: string;
    subscribed: boolean;
    money: Money;

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
