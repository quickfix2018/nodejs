import { ISpecification } from './specification'

export type SpecificationEventArgs = SelectionArgs | ChoiceArgs | MultiSelectArgs

export class ChoiceArgs {
    kind: string = 'ChoiceArgs'
    choiceSpecification: ISpecification
    selectionSpecification: ISpecification

    constructor(choice: ISpecification, selection: ISpecification) {
        this.choiceSpecification = choice
        this.selectionSpecification = selection
    }
}

export class MultiSelectArgs {
    kind: string = 'MultiSelectArgs'
    choiceSpecification: ISpecification
    selectionSpecification: ISpecification
    systemTypeName: string
    attributeData: any

    constructor(choice: ISpecification, selections: ISpecification, systemTypeName:string = "", attrData = undefined) {
        this.choiceSpecification = choice
        this.selectionSpecification = selections
        this.systemTypeName = systemTypeName
        this.attributeData = attrData
    }
}

export class SelectionArgs {
    kind: string = 'SelectionArgs'
    specification: ISpecification
    attributeData: any

    constructor(selection: ISpecification, selectionAttributeData: any = undefined) {
        this.specification = selection
        this.attributeData = selectionAttributeData
    }
}