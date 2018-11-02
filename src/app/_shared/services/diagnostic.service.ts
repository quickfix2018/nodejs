import { Injectable } from '@angular/core'
import { IDiagnosticInformation, DiagnosticLevel, DiagnosticSeverity } from '../diagnostic-information'

@Injectable()
export class DiagnosticService {
    eventLog: IDiagnosticInformation[] = []

    logError(detail: string, scope: string = "", severity: DiagnosticSeverity = DiagnosticSeverity.Normal) {
        console.error(detail + ` /n scope: ${scope}`);

        this.eventLog.push({
            detail: detail,
            level: DiagnosticLevel.Error,
            severity: severity,
            date: new Date(),
            scope: scope
        });
    }
    logInformation(detail: string, scope: string = "", severity: DiagnosticSeverity = DiagnosticSeverity.Normal) {
        console.info(detail + ` /n scope: ${scope}`);

        this.eventLog.push({
            detail: detail,
            level: DiagnosticLevel.Informational,
            severity: severity,
            date: new Date(),
            scope: scope
        });    }
    logWarning(detail: string, scope: string = "", severity: DiagnosticSeverity = DiagnosticSeverity.Normal) {
        console.warn(detail + ` /n scope: ${scope}`);

        this.eventLog.push({
            detail: detail,
            level: DiagnosticLevel.Warning,
            severity: severity,
            date: new Date(),
            scope: scope
        });    }
    logVerbose(detail: string, scope: string = "", severity: DiagnosticSeverity = DiagnosticSeverity.Normal) {
        console.log(detail + ` /n scope: ${scope}`);

        this.eventLog.push({
            detail: detail,
            level: DiagnosticLevel.Verbose,
            severity: severity,
            date: new Date(),
            scope: scope
        });
    }
}