import { Injectable } from '@angular/core'
import { BaseRequestOptions, Headers } from '@angular/http'

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
    private _headers: Headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    })
    set headers(val: Headers) {
        this._headers = val
    }
    get headers(): Headers {
        if (sessionStorage.getItem("authorization_token_key") && !this._headers.has("Authorization")) {
            this._headers.append('Authorization', `Bearer ${sessionStorage.getItem("authorization_token_key")}`)
        } else if (!sessionStorage.getItem("authorization_token_key")) {
            this._headers.delete("Authorization")
        }

        return this._headers
    }
}
