import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeField',
  standalone: true
})
export class SafeFieldPipe implements PipeTransform {
  transform(value: any, fieldPath: string): any {
    if (!value || !fieldPath) return '';
    
    const fields = fieldPath.split('.');
    let result = value;
    
    for (const field of fields) {
      if (result && typeof result === 'object') {
        result = result[field];
      } else {
        return '';
      }
    }
    
    return result || '';
  }
}
