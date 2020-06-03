import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  getObservableClass(): Observable<User[]> {
    return of(this.generateData()).pipe(
      map(u => u.map(user => new User(user))),
      delay(500)
    );
  }

  getObservableObjects(): Observable<User[]> {
    return of(this.generateData()).pipe(
      delay(500)
    );
  }

  generateData(): User[] {
    let data: User[] = [{
      name: 'Luke',
      surname: 'Kroon',
      number: '+27827022334',
      signupDate: new Date('2019/01/22'),
      subscribed: true,
      money: {
        netWorth: 50000
      }
    }];
    for (var i = 0; i < 1000; i++) {
      data.push({
        name: Math.random().toString(36).substr(2, 10),
        surname: Math.random().toString(36).substr(2, 10),
        number: `+27${(Math.floor(Math.random() * 90000000) + 10000000).toString()}`,
        signupDate: new Date(+(new Date()) - Math.floor(Math.random() * 1000000000000)),
        subscribed: Math.random() >= 0.5,
        money: {
          netWorth: Math.floor(Math.random() * 50000)
        }
      })
    }
    return data;
  }
}
