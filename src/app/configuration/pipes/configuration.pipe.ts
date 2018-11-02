import { Pipe, PipeTransform } from '@angular/core'
import { IConfigurationItem } from '../iconfiguration'

@Pipe({ name: 'configurationSort' })
export class ConfigurationSort implements PipeTransform {
    transform(configurations: IConfigurationItem[]): IConfigurationItem[] {
        return configurations.sort(
            (a, b) => {
                return a.SortOrder > b.SortOrder ? 1
                    : a.SortOrder < b.SortOrder ? -1
                        : 0
            })
    }
}