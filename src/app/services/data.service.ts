import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private data: any[] = [
    {
      name: 'Luke',
      surname: '333',
      number: '0820000000',
      signupDate: '2020/01/21',
      subscribed: true,
      money: {
        netWorth: 2313
      }
    }, {
      name: 'Piet',
      surname: 'Aaa',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
      money: {
        netWorth: 23554
      }
    }, {
      name: '1 X',
      surname: 'BBB bbb',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
      money: {
        netWorth: 2433
      }
    }, {
      name: 'XX aa',
      surname: 'F2',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
      money: {
        netWorth: 123
      }
    }, {
      name: '1 X',
      surname: 'F1',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
      money: {
        netWorth: 32321
      }
    }, {
      name: '1 X',
      surname: 'F10',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
      money: {
        netWorth: 222
      }
    }
  ]

  constructor() { }

  getObservableClass(): Observable<User[]> {
    return of(this.data).pipe(
      map(u => u.map(user => new User(user))),
      delay(500)
    );
  }

  getObservableObjects(): Observable<User[]> {
    return of(this.data).pipe(
      delay(500)
    );
  }
}
