import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private data: any[] = [
    {
      name: 'Luke',
      surname: 'Luke',
      number: '0820000000',
      signupDate: '2020/01/21',
      subscribed: true,
    }, {
      name: 'Piet',
      surname: 'van Tonder',
      number: '0820000000',
      signupDate: '2020/01/22',
      subscribed: false,
    }
  ]

  constructor() { }

  getObservable(): Observable<any[]> {
    return of(this.data);
  }
}
