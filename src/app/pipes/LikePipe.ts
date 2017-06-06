import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'likefilter',
    pure: false
})

export class LikePipe implements PipeTransform {
    transform(items: any[], filter: Object): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be kept, false will be filtered out

        return items.filter(item => {
            const valString = Object.keys(item).map(key=>item[key]).join(' ');
            return valString.toLowerCase().indexOf(filter.toString().toLowerCase()) !== -1;
        });
    }
}
