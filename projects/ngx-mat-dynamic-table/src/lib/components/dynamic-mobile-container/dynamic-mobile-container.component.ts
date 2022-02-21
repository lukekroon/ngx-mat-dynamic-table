import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-mat-dynamic-mobile-container',
  templateUrl: './dynamic-mobile-container.component.html',
  styleUrls: ['./dynamic-mobile-container.component.css']
})
export class DynamicMobileContainerComponent<T> implements OnInit {

  @Input() tableData$: Observable<T[]>;

  constructor() { }

  ngOnInit(): void {
    console.log(this.tableData$)
  }
  
  

}
