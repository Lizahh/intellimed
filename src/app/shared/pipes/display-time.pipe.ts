import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayTime',
  standalone: true,
  pure: false
})
export class DisplayTimePipe implements PipeTransform {
  transform(value: string | null): string {
    return value || '00:00:00';
  }
}