﻿import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

export function flattenArray<T>(entity: T, childSelector: (entity: T) => T[]): T[] {
    let result: T[] = [];
    if (!entity) {
        return result;
    }

    let children = childSelector(entity);

    if (children.length > 0) {
        result = result.concat(children);
        let manyArr = children.map(c => flattenArray(c, childSelector));
        result = result.concat(manyArr.reduce((p, c) => p.concat(c)));
    }

    return result;
}

export const GLOBAL_INPUTS = {
    BOOTSTRAP: ['xs', 'sm', 'md', 'lg', 'xl'],
    DEVICES: ['mobile', 'tablet', 'smarttv', 'desktop'],
    STANDARD: ['iphone', 'ipad', 'android mobile', 'android tablet', 'windows phone'],
    ORIENTATION: ['portrait', 'landscape'],
    BROWSERS: ['chrome', 'firefox', 'ie', 'safari', 'opera'],
    PIXEL_RATIO: ['1x', 'retina', '4k'],
    IE_VERSIONS: ['ie 9', 'ie 10', 'ie 11', 'ie +12']
}

//WEARABLES :: USER AGENTS
export const REG_WEARABLES = {
    IWATCH: ''
}

export const REG_MOBILES = {
    ANDROID: /(android);?[\s\/]+([\d.]+)?/,
    IPHONE: /(iphone\sos)\s([\d_]+)/,
    WINDOWS_PHONE: /windows phone ([\d.]+)/,
    BLACKBERRY: /(blackBerry).*version\/([\d.]+)/,
    BB10: /(bb10).*version\/([\d.]+)/,
    WEB_OS: /(webos|hpwos)[\s\/]([\d.]+)/,
    IPOD: /(ipod)(.*os\s([\d_]+))?/,
    FIREFOX_OS: /\((?:mobile|tablet); rv:([\d.]+)\).*firefox\/[\d.]+/,
    MOBI: /[^-]mobi/i,
    GENERIC_REG: [/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i, /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i]
}

export const REG_TABLETS = {
    IPAD: /(ipad).*os\s([\d_]+)/,
    KINDLE: /kindle|silk|kfapw|kfarwi|kfaswi|kffowi|kfjw|kfmewi|kfot|kfsaw|kfsowi|kftbw|kfthw|kftt|wffowi/i,
    TABLET: /tablet/i,
    PLAYBOOK: [/rim\stablet/i, /playbook/i]
}

export const REG_SMARTS_TV = {
    CHROMECAST: /crkey/i,
    APPLE_TV: /appletv/i,
    GOOGLE_TV: /(large screen)|googletv/i,
    PS4: /playstation 4/i,
    XBOX_ONE: /xbox one/i,
    GENERIC_TV: /tv|smarttv|googletv|crkey|Sharp|THOMSON|THOM|Panasonic|Philips|NETTV|Maple_2011|appletv|Humax|Ikea|Loewe|Medion|hbbtv|pov_tv|Airties|netcast.tv|OWB|Grundig|Arcelik/i
}

export const REG_GAME_DEVICES = {
    PS4: /playstation 4/i,
    PS3: /playstation 3/i,
    XBOX: /xbox one/i,
    XBOX_ONE: /xbox/i,
    WII_U: /nintendo wiiu/i,
    WII: /nintendo wii/i,
    PS_VITA: /playstation vita/i,
    NINTENDO_3DS: /nintendo 3ds/i,
    PSP: /psp/i,
}

export const REG_BROWSERS = {
    CHROME: [/chrome\/([\d.]+)/, /crios\/([\d.]+)/],
    FIREFOX: /firefox|iceweasel|fxios/i,
    WEB_VIEW: /(iphone|ipod|ipad).*applewebkit(?!.*safari)/,
    SAFARI: /version\/([\d.]+)([^s](safari)|[^m]*(mobile)[^S]*(safari))/,
    OPERA: /opera|opr|opios/i,
    IE: [/msie/, /trident/, /edge/],
    MS_EDGE: /edge/,
    SILK: /silk/i,
    YANDEX: /yabrowser/i
}

export const REG_OS = {
    WINDOWS: /win\d{2}|windows/,
    IOS: /(ipod|iphone|ipad)/i,
    MAC_OS: /macintosh/i,
    ANDROID: /android/i,
    LINUX: /linux/i,
    FIREFOX_OS: /\((?:mobile|tablet); rv:([\d.]+)\).*firefox\/[\d.]+/,
    CHROME_OS: /cros/,
    WINDOWS_PHONE: /windows phone/i
}

export const REG_SORT_NAMES = {
    MOZILLA: /mozilla/,
    CHROME: /chrome/,
    WEBKIT: [/webkit/, /applewebkit/],
    SAFARI: /safari/
}

export const WINDOWS_OS_VERSION = {
    WINDOWS_3_11: /win16/,
    WINDOWS_95: /(windows 95|win95|windows_95)/,
    WINDOWS_ME: /(win 9x 4.90|windows ME)/,
    WINDOWS_98: /(windows 98|win98)/,
    WINDOWS_CE: /windows ce/,
    WINDOWS_2000: /(windows nt 5.0|windows 2000)/,
    WINDOWS_XP: /(windows nt 5.1|windows xp)/,
    WINDOWS_SERVER_2003: /windows nt 5.2/,
    WINDOWS_VISTA: /windows nt 6.0|Windows Vista/,
    WINDOWS_7: /(windows 7|windows nt 6.1)/,
    WINDOWS_8_1: /(windows 8.1|windows nt 6.3)/,
    WINDOWS_8: /(windows 8|windows nt 6.2)/,
    WINDOWS_10: /(windows nt 10.0)/,
    WINDOWS_PHONE_7_5: /(windows phone os 7.5)/,
    WINDOWS_PHONE_8_1: /(windows phone 8.1)/,
    WINDOWS_PHONE_10: /(windows phone 10)/,
    WINDOWS_NT_4_0: /(windows nt 4.0|winnt4.0|winnt|windows nt)/
}

//MAC OS VERSION :: USER AGENTS
export const MAC_OS_VERSION = {
    MAC_OS: '',
}

export const LINUX_OS = {
    DEBIAN: /Debian/i,
    KNOPPIX: /Knoppix/i,
    MINT: /Mint/i,
    UBUNTU: /Ubuntu/i,
    KUBUNTU: /Kubuntu/i,
    XUBUNTU: /Xubuntu/i,
    LUBUNTU: /Lubuntu/i,
    FEDORA: /Fedora/i,
    RED_HAT: /Red Hat/i,
    MANDRIVA: /Mandriva/i,
    GENTOO: /Gentoo/i,
    SABAYON: /Sabayon/i,
    SLACKWARE: /Slackware/i,
    SUSE: /SUSE/i,
    CENT_OS: /CentOS/i,
    BACKTRACK: /BackTrack/i
}

export const REG_BOTS = {

    GENERIC_BOT: /bot|googlebot|crawler|spider|robot|crawling/i

}

export interface BootstrapObj {
    Size: string,
    Orientation: string
}

export class ResponsiveHelper {
    private _width: number;
    private elementoObservar: Observable<string>;
    private orientationObserver: Observable<any>;
    private _userAgent: any = window.navigator.userAgent.toLowerCase();
    private _currBootStrapObj: BootstrapObj

    public bootStrapObj$ = new BehaviorSubject<BootstrapObj>(this._currBootStrapObj)

    constructor() {
        this._currBootStrapObj = { Size: '', Orientation: '' }
        let resize_observer = Observable
            .fromEvent(window, 'resize')
            .debounceTime(100)
            .defaultIfEmpty()
            .startWith(this.getWidth('window'))

        let orientation_observer = Observable
            .fromEvent(window, 'orientationchange')
            .defaultIfEmpty()
            .startWith(this.getOrientation());

        this.orientationObserver = orientation_observer.map(this.orientation_device);
        this.elementoObservar = resize_observer.map(this.sizeOperations)
        this.elementoObservar.subscribe(size => {
            this._currBootStrapObj.Size = size
            this.bootStrapObj$.next(this._currBootStrapObj)
            //callback(this._currBootStrapObj)
        })
        this.orientationObserver.subscribe(orientation => {
            this._currBootStrapObj.Orientation = orientation
            this.bootStrapObj$.next(this._currBootStrapObj)
            //callback(this._currBootStrapObj)
        })
    }

    getWidth(windowName: string): number {
        return window.screen.width
    }

    sizeOperations = (): string => {
        this._width = this.getWidth('window');
        try {
            let breakpoints = {
                xs: { max: 767 },
                sm: { min: 768, max: 991 },
                md: { min: 992, max: 1199 },
                lg: { min: 1200, max: 1599 },
                xl: { min: 1600 }
            };
            if (breakpoints.xl.min <= this._width) {
                return 'xl';
            } else if (breakpoints.lg.max >= this._width && breakpoints.lg.min <= this._width) {
                return 'lg';
            } else if (breakpoints.md.max >= this._width && breakpoints.md.min <= this._width) {
                return 'md';
            } else if (breakpoints.sm.max >= this._width && breakpoints.sm.min <= this._width) {
                return 'sm';
            } else if (breakpoints.xs.max >= this._width) {
                return 'xs';
            }
        } catch (error) {
            //console.error('size operations error :', error);
        }
        return null;
    };

    private getOrientation(): any {
        return window.orientation;
    }

    private orientation_device = (): string => {
        try {
            if (this.isMobile() || this.isTablet()) {
                if (window.innerHeight > window.innerWidth) {
                    return 'portrait';
                } else {
                    return 'landscape';
                }
            } else if (this.isSMART() || this.isDesktop()) {
                return 'landscape';
            } else {
                return null;
            }
        } catch (error) {
            //console.error('pixel ratio :', error);
        }
        return null;
    }

    private isMobile(): boolean {
        if (REG_MOBILES.GENERIC_REG[0].test(this._userAgent) && this.isTablet() == false ||
            REG_MOBILES.GENERIC_REG[1].test(this._userAgent.substr(0, 4)) && this.isTablet() == false
        ) {
            return true;
        } else {
            return false;
        }
    }

    private isTablet(): boolean {
        if (REG_TABLETS.IPAD.test(this._userAgent) || REG_TABLETS.KINDLE.test(this._userAgent) || REG_TABLETS.PLAYBOOK[0].test(this._userAgent) || REG_TABLETS.PLAYBOOK[1].test(this._userAgent) || REG_TABLETS.TABLET.test(this._userAgent)) {
            return true;
        } else {
            return false;
        }
    }

    private isSMART(): boolean {
        if (REG_SMARTS_TV.GENERIC_TV.test(this._userAgent) || REG_SMARTS_TV.PS4.test(this._userAgent) || REG_SMARTS_TV.XBOX_ONE.test(this._userAgent)) {
            return true;
        } else {
            return false;
        }
    }

    private isDesktop(): boolean {
        if (!this.isMobile() || !this.isTablet() || !this.isSMART()) {
            return true;
        } else {
            return false;
        }
    }
}