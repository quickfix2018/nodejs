import { PolicyStatus } from './policy-status'

export interface IPolicyResult {
    Status: PolicyStatus,
    FailureMessage: string,
    Correctable: boolean,
    CorrectableAction: string
}
