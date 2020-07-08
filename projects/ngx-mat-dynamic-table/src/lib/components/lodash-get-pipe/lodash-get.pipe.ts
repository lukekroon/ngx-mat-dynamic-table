import { Pipe, PipeTransform } from '@angular/core';
import { get as _get, set as _set } from 'lodash';

@Pipe({
  name: 'lodashGet'
})
export class LodashGetPipe implements PipeTransform {

  transform(value: any, key: string): any {
    if (!key)
      return '';

    return _get(value, key);
  }

}
