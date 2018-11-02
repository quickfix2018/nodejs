import { Component, Input } from '@angular/core'
import { IPolicyResult } from '../../order/services/ipolicy-result'

@Component({
    moduleId: module.id,
    selector: 'policy-summary',
    templateUrl: './policy-summary.component.html'
})
export class PolicySummaryComponent {
    @Input()
    public policyResult: IPolicyResult

    @Input()
    public successMessage: string

    @Input()
    public successRoute: string

    @Input()
    public successRouteName = 'Go'
}