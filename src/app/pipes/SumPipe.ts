import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sum'
})
export class SumPipe implements PipeTransform {
    transform(items: any[], price: string, qt: string): any {
        return items.reduce((a, b) => a + b[price] * b[qt], 0);
    }
}