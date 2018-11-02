import { Pipe, PipeTransform } from '@angular/core'
import { ISpecification } from '../specification'

@Pipe({ name: 'specificationMetadataFilter' })
export class SpecificationMetadataFilter implements PipeTransform {
    transform(specifications: ISpecification[], metaKey: string, metaVal: string): ISpecification[] {
        if (metaKey && metaVal) {
            return specifications.filter(specification => specification.Metadata[metaKey] === metaVal)
        }

        return specifications;
    }
}