import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { IArtifact } from '../artifact'
import { BaseProxy } from '../../_shared/services/base-proxy.service'
import { DiagnosticService } from '../../_shared/services/diagnostic.service'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import { AuthService } from '../../auth'

@Injectable()
export class ArtifactClientService extends BaseProxy {
    constructor(
        http: Http,
        diag: DiagnosticService,
        auth: AuthService
    ) { super(http, diag, '/', "api/customwise/artifact") }

    getArtifact = (id: number): Observable<IArtifact> =>
        this.httpGet(
            `/${id}`,
            res => <IArtifact>(res.json() || { }))

    getRootArtifacts = (specType: string) =>
        this.httpGet(
                `/${specType}/Roots?depth=-1`,
                res => <IArtifact[]>(res.json() || [])
            )

    create = (artifact: IArtifact) =>
        this.httpPut("", artifact, res => <IArtifact>(res.json() || { }))

    update = (artifact: IArtifact, force: boolean = false) =>
        this.httpPost(
                `/${force}`,
                artifact,
                res => +res.text())

    stamp = (parentArtifact: IArtifact | number, refChild: IArtifact | number, order: number) => {
        let parentID = (typeof parentArtifact === "number") ? parentArtifact : parentArtifact.ID

        if (parentID === 0) {
            throw new Error(`Parameter 'parentArtifact', expected a 'IArtifact' or 'number', got '${typeof parentArtifact}'.`);
        }

        let childRefID = (typeof refChild === "number") ? refChild : refChild.ID

        if (childRefID === 0) {
            throw new Error(`Parameter 'refChild', expected a 'IArtifact' or 'number', got '${typeof refChild}'.`);
        }

        return this
            .httpPost(`/${parentID}/${childRefID}/${order}`, '', r => <IArtifact>(r.json() || { }))
    }
    getChildren = (id: number, page: number, pageSize: number = 10, filterExpr: string = '') =>
        this.httpGet(
            `/${id}?currentPageIndex=${page}&pageSize=${pageSize}&filter=${filterExpr}`,
            res => <IArtifact>(res.json() || [])
        )
}
