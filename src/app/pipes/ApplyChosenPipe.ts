import { Pipe, PipeTransform } from '@angular/core';
declare var jQuery:any;
declare var $: any;
@Pipe({
    name: 'applychosen',
    pure: false
})

export class ApplyChosenPipe implements PipeTransform {
    transform(items: any[], filter: Object): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items;
    }
}