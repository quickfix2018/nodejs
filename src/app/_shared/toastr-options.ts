import { ToastOptions } from "ng2-toastr";

export class CustomOptions extends ToastOptions {
    positionClass = 'toast-bottom-right'
    showCloseButton = true
}