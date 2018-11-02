import { Injectable, EventEmitter, Output } from '@angular/core'
import { IConfiguration, createConfiguration, createConfigurationItem, createTrimedConfiguration } from '../configuration'
import { ISpecification }  from '../specification'
import { DataEntityState } from './data-entity-state'
import { DiagnosticService } from './services/diagnostic.service'
import { ApplicationSettingService, IApplicationSetting } from '../application-setting'
import { IDiscount } from '../discount'
import { IOrder } from '../order'
import { flattenArray } from './util'
import { IUserInfo } from '../auth'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Injectable()
export class ApplicationState {
    private _configuration: IConfiguration
    private _sessionKey: string = 'configuration_session_key'
    private _userKey: string = 'logged_in_user_key'
    private _selectedProgramKey: string = 'selected_program_key'
    private _orderEditKey: string = "order_edit_key"
    private _authKey = 'authorization_token_key'
    private _choiceSysNames: string[] = ["ChoiceGroup", "ReferenceChoiceGroup"]
    private _configuration$ = new BehaviorSubject(this.configuration)
    private _rootSpecification: ISpecification
    @Output() onResetConfiguration: EventEmitter<any> = new EventEmitter<any>()
    @Output() onResetChildrenConfiguration: EventEmitter<any> = new EventEmitter<any>()
    @Output() onConfigurationChanged: EventEmitter<IConfiguration> = new EventEmitter<IConfiguration>()
    configuration$ = this._configuration$.asObservable()
    CurrentRouteData: { name: string, description: string, icon: string, path: string, url: string }
    public settings: IApplicationSetting = {}
    public appSettings$ = this.applicationSettingService.getApplicationSettings$().publishLast().refCount();

    private anonymousUser: IUserInfo // = {
    private _currentUser: IUserInfo
    set CurrentUser(user: IUserInfo) {
        this._currentUser = user
        sessionStorage.setItem(this._userKey, JSON.stringify(this._currentUser))
    }
    get CurrentUser(): IUserInfo {
        return this._currentUser
    }
    public resetCurrentUser() {
        this.CurrentUser = this.anonymousUser
        this.selectedProgram = null
        this.editOrder = null
    }
    public setImpersonation(priceLevel: number, dealerID: number, impersonationName: string): void {
        var currentUser = this.CurrentUser
        currentUser.PriceLevel = priceLevel
        currentUser.DealerID = dealerID
        currentUser.ImpersonationName = impersonationName
        this.selectedProgram = null;
        this.CurrentUser = currentUser
        // must reset configuration pricing
        this.udpateConfigurationPricing(this._rootSpecification)
    }
    public resetImpersonation() {
        if (this.anonymousUser) {
            this.setImpersonation(this.CurrentUser.DefaultPriceLevel, this.CurrentUser.DefaultDealerID, null)
        }
    }
    public get selectedProgram(): IDiscount {
        let program = sessionStorage.getItem(this._selectedProgramKey)
        return program ? <IDiscount>JSON.parse(program) : null
    }
    public set selectedProgram(program: IDiscount) {
        if (program) {
            sessionStorage.setItem(this._selectedProgramKey, JSON.stringify(program))
        } else {
            sessionStorage.removeItem(this._selectedProgramKey)
        }
    }

    constructor(
        private diag: DiagnosticService,
        private applicationSettingService: ApplicationSettingService
    ) {
        let sessionUser = <IUserInfo>JSON.parse(sessionStorage.getItem(this._userKey))


        const setAnonymousUser = !sessionUser
        this._currentUser = !setAnonymousUser ? sessionUser :
            {   // this will be replaced once the settings has returned
                // this is a bit of a workaround.
                UserName: 'anonymous',
                Email: '',
                IsAdmin: false,
                Roles: ['guest'],
                PriceLevel: -1,
                DefaultPriceLevel: -1,
                DealerID: null,
                DefaultDealerID: null,
                Dealer: null,
                DealerCodes: []
            }

        this.applicationSettingService
            .applicationSetting$
            .filter(setting => setting !== null)
            .subscribe(setting => {
                this.anonymousUser = {
                    UserName: 'anonymous',
                    Email: '',
                    IsAdmin: false,
                    Roles: ['guest'],
                    PriceLevel: +setting['DefaultPriceLevel'],
                    DefaultPriceLevel: +setting['DefaultPriceLevel'],
                    DealerID: null,
                    DefaultDealerID: null,
                    Dealer: null,
                    DealerCodes: []
                }

                if (!!setting['profile']) {
                    this._currentUser = JSON.parse(setting['profile']);
                    sessionStorage.setItem(this._userKey, setting['profile']);
                    sessionStorage.setItem(this._authKey, setting['access_token'])
                    sessionStorage.setItem('expire_in', setting['expire_in'])
                } else if (setAnonymousUser) {
                    this._currentUser = this.anonymousUser;
                }
            })
        this.applicationSettingService.getApplicationSettings()
        this.configuration = this.configuration || createConfiguration()
    }

    get configuration(): IConfiguration {
        //let configuration = sessionStorage.getItem(this._sessionKey)
        //return configuration ? JSON.parse(configuration) : null
        return this._configuration
    }
    set configuration(configuration: IConfiguration) {
        //let val = !!configuration ? JSON.stringify(createTrimedConfiguration(configuration)) : JSON.stringify(createTrimedConfiguration(createConfiguration()))
        //sessionStorage.removeItem(this._sessionKey)
        //sessionStorage.setItem(this._sessionKey, val)
        //this._configurationChangedSource.next(this.configuration)
        this._configuration = configuration
        this._configuration$.next(this.configuration)
        this.onConfigurationChanged.emit(configuration)
    }

    public cacheConfiguration() {
        let val = !!this.configuration ? JSON.stringify(createTrimedConfiguration(this.configuration)) : JSON.stringify(createTrimedConfiguration(createConfiguration()))
        sessionStorage.removeItem(this._sessionKey)
        sessionStorage.setItem(this._sessionKey, val)
    }

    public getCacheConfiguration() {
        let configuration = sessionStorage.getItem(this._sessionKey)
        return configuration ? JSON.parse(configuration) : null
    }

    public get editOrder(): IOrder {
        let program = sessionStorage.getItem(this._orderEditKey)
        return program ? <IOrder>JSON.parse(program) : null
    }
    public set editOrder(order: IOrder) {
        if (order) {
            sessionStorage.setItem(this._orderEditKey, JSON.stringify(order))
        } else {
            sessionStorage.removeItem(this._orderEditKey)
        }
    }
    resetConfiguration() {
        sessionStorage.removeItem(this._sessionKey)
        this.onResetConfiguration.emit(null)
    }
    addRootConfiguration(specification: ISpecification) {
        this.diag.logVerbose('Adding root Configuration', `${ApplicationState.name}.addRootConfiguration()`)
        //this.configuration = this.createConfiguration(specification.ID, specification.DisplayName, specification.ID, specification.DisplayName, null)
        this._rootSpecification = specification
        this.configuration = this.createConfigWithDefaults(specification)
        this.configuration.RootSpecificationPrice = specification ? specification.Pricing[this.CurrentUser.PriceLevel] : this.configuration.RootSpecificationPrice
        // set default configurations
    }
    updateChoice(parentSpecification: ISpecification, choice: ISpecification, selected: ISpecification): IConfiguration {
        let rootConfig = this.configuration

        let choiceConfig = rootConfig.Items.find(c => c.KeySpecificationID === choice.ID)

        if (!choiceConfig) {
            choiceConfig = createConfigurationItem(choice, selected, rootConfig, this.CurrentUser.UserName, this.CurrentUser.UserName)
            choiceConfig.SortOrder = choice.Order

            rootConfig.Items.push(choiceConfig)
        }

        if (choice.Selected) {
            choiceConfig.State = DataEntityState.Modified
            choiceConfig.ValueSpecificationID = selected.ID
            choiceConfig.ValueDisplayName = selected.DisplayName
            choiceConfig.ValueSpecification = selected;
            choiceConfig.SortOrder = choice.Order
            choiceConfig.Price = selected.Pricing ? selected.Pricing[this.CurrentUser.PriceLevel] : 0
        } else {
            // instead of filtering the choice item out first look for any children of he choice and find the default
            // and set it, if not then perform the filter.
            let defaultChild = choice.Children.find(c => !!c.Metadata["ui.designer.default"])
            if (defaultChild && defaultChild.Metadata["ui.designer.default"].toLowerCase() === "true") {
                choiceConfig.State = DataEntityState.Modified
                choiceConfig.ValueSpecificationID = defaultChild.ID
                choiceConfig.ValueDisplayName = defaultChild.DisplayName
                choiceConfig.SortOrder = choice.Order
                choiceConfig.Price = defaultChild.Pricing[this.CurrentUser.PriceLevel] || 0
            } else {
                rootConfig.Items = rootConfig.Items.filter(c => c !== choiceConfig)
            }
        }
        choiceConfig.ValueData = selected.Metadata

        this.sortChildren(rootConfig)
        this.configuration = rootConfig
        return rootConfig
    }
    updateMultiChoice(parentSpecification: ISpecification, choice: ISpecification, selection: ISpecification, attributeData: any): IConfiguration {
        let rootConfig = this.configuration
        this.diag.logInformation(`${selection.Selected ? 'Added' : 'Removed'} '${selection.DisplayName}' ${selection.Selected ? 'to' : 'from'} '${choice.DisplayName}'`, ApplicationState.name)

        let childConfig = rootConfig.Items.find(child => child.KeySpecificationID === selection.ID)

        if (selection.Selected) {
            if (!childConfig) {
                childConfig = createConfigurationItem(choice, selection, rootConfig, this.CurrentUser.UserName, this.CurrentUser.UserName)

                childConfig.InputValue = JSON.stringify(attributeData)
                childConfig.State = DataEntityState.Added
                childConfig.SortOrder = choice.Order
                rootConfig.Items.push(childConfig)
            } else {
                childConfig.State = DataEntityState.Unchanged
            }
            childConfig.ValueData = selection.Metadata
            childConfig.Price = selection.Pricing ? selection.Pricing[this.CurrentUser.PriceLevel] : 0
        } else {
            if (childConfig && childConfig.ID > 0) {
                childConfig.State = DataEntityState.Deleted
            } else {
                rootConfig.Items = rootConfig.Items.filter(child => child.ValueSpecificationID !== selection.ID)
            }
        }

        this.sortChildren(rootConfig)
        this.configuration = rootConfig
        return rootConfig
    }
    resetConfigurationChildren(keySpecificationID: number) {
        if (this._rootSpecification) {
            const flatSpec = flattenArray(this._rootSpecification, s => s.Children)
            const keySpec = flatSpec.find(s => s.ID === keySpecificationID)
            if (keySpec && keySpec.Children) {
                keySpec.Children.forEach(child => {
                    const matchingConfigItem = this.configuration.Items.find(ci => ci.KeySpecificationID === child.ID)
                    if (matchingConfigItem) {
                        this.configuration.Items.splice(this.configuration.Items.indexOf(matchingConfigItem), 1)
                    }
                })
            }
        }
        this._configuration$.next(this.configuration)
        this.onConfigurationChanged.emit(this.configuration)
        this.onResetChildrenConfiguration.emit(null)
    }
    udpateConfigurationPricing(rootSpecification: ISpecification) {
        if (!this.configuration) {
            return
        }
        var rootConfiguration = this.configuration
        var specifications = flattenArray(rootSpecification, s => s.Children)
        var configurations = rootConfiguration.Items
        if (rootSpecification) {
            rootConfiguration.RootSpecificationPrice = rootSpecification.Pricing[this.CurrentUser.PriceLevel]
        }
        configurations.forEach(c => {
            var foundSpec = specifications.find(s => s.ID === c.ValueSpecificationID)
            c.Price = foundSpec ? foundSpec.Pricing[this.CurrentUser.PriceLevel] : c.ValueSpecification.Pricing[this.CurrentUser.PriceLevel]
        })
        if (rootSpecification !== this._rootSpecification) {
            this._rootSpecification = rootSpecification
        }
        this.configuration = rootConfiguration
    }
    private recursiveAction<T>(item: T, childSelector: (item: T) => T[], condition: (item: T) => boolean, action: (item: T) => void): T {
        childSelector(item)
            .filter(condition)
            .forEach(child => {
                action(child)
                this.recursiveAction(child, childSelector, condition, action)
            })

        return item
    }
    private recursiveFunc<T>(item: T, childSelector: (item: T) => T[], condition: (item: T) => boolean, action: (item: T) => void): void {
        if (condition(item)) {
            action(item)
        }
        childSelector(item)
            .forEach(child => {
                this.recursiveFunc(child, childSelector, condition, action)
            })
    }
    private sortChildren(config: IConfiguration) {
        config.Items.sort((a, b) => {
            return a.SortOrder > b.SortOrder ? 1
                : a.SortOrder < b.SortOrder ? -1
                    : 0
        })
    }
    private createConfigWithDefaults(rootSpecification: ISpecification) {
        var rootConfig = createConfiguration(rootSpecification, this.CurrentUser.UserName, this.CurrentUser.UserName)
        rootConfig.RootSpecificationPrice = rootSpecification.Pricing ? rootSpecification.Pricing[this.CurrentUser.PriceLevel] : 0
        var children = flattenArray(rootSpecification, fc => fc.Children)
        this.recursiveFunc(
            rootSpecification,
            s => s.Children,
            s => !!s.Metadata["ui.designer.default"] && s.Metadata["ui.designer.default"].toLowerCase() === "true",
            s => {
                var parentSpec = children.find(p => p.ID === s.ParentID)
                var defaultConfig = createConfigurationItem(parentSpec, s, rootConfig, this.CurrentUser.UserName, this.CurrentUser.UserName)
                defaultConfig.ValueData = s.Metadata
                rootConfig.Items.push(defaultConfig)
            })

        return rootConfig
    }

}
