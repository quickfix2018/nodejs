export interface IDiagnosticInformation {
    detail: string
    scope: string
    date: Date
    level: DiagnosticLevel
    severity: DiagnosticSeverity
}

export enum DiagnosticLevel {
    Verbose       = 1,
    Informational = 2,
    Warning       = 3,
    Error         = 4
}

export enum DiagnosticSeverity {
    Low    = 1,
    Normal = 2,
    High   = 3
}