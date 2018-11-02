import { Component, Input, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter, Inject, forwardRef, OnInit } from "@angular/core";
import { ISpecification } from "../specification";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Observable } from "rxjs/observable";
import { IArtifact, ArtifactClientService } from "../../artifact";
import { IConfiguration } from "../../configuration/iconfiguration";
import { ApplicationState } from "../../_shared";
import { SelectionArgs } from "../event-args";
import { ApplicationSettingService } from "../../application-setting/services/application-setting.service";

interface AttributeData {
    attributeNumber: number,
    artifact$: Observable<IArtifact>,
    selectedArtifact: IArtifact
}

interface ConfiguredAttributeData {
    attributeNumber: number,
    valueArtifactId: number,
    displayName: string,
    color: string
}

@Component({
    selector: 'cwd-specification-item-attribute-feature',
    templateUrl: 'specification-item-attribute-feature.component.html',
    providers: [ ArtifactClientService ]
})
export class SpecificationItemAttributeFeatureComponent implements OnChanges, OnInit {
    @Input()
    specification: ISpecification

    @Input()
    configuration: IConfiguration

    @Output()
    specificationSelected = new EventEmitter<SelectionArgs>()

    @ViewChild('attributeFeatureModal')
    attributeFeatureModal: ModalDirective

    isoCurrencyCode$: Observable<string>

    attributes: AttributeData[] = []

    attributeSummary = () => this.attributes.filter(attr => attr.selectedArtifact).map(attr => `(${attr.selectedArtifact.DisplayName})`).join(' ')

    showAttributes(specification: ISpecification) {
        if (specification.Selected) {
            this.specificationSelected.emit(new SelectionArgs(specification))
            return
        }
        const artifactId1 = +this.specification.Metadata['ui.designer.feature.attribute.1.attribute.id']
        const artifactId2 = +this.specification.Metadata['ui.designer.feature.attribute.2.attribute.id']
        const artifactIds: number[] = []

        if (artifactId1) { artifactIds.push(artifactId1) }
        if (artifactId2) { artifactIds.push(artifactId2) }

        this.attributes = artifactIds
            .map(id => <AttributeData>{
                attributeNumber: id,
                artifact$: this.artifactService.getArtifact(id)
            })

        this.attributeFeatureModal.show()
    }

    selectAttribute(attribute: AttributeData, artifact: IArtifact) {
        attribute.selectedArtifact = artifact
    }

    canSubmit = () => this.attributes.every(attr => !!attr.selectedArtifact)

    constructor(
        public settingService: ApplicationSettingService,
        private artifactService: ArtifactClientService,
        @Inject(forwardRef(() => ApplicationState)) public appState: ApplicationState
    ) { }

    ngOnInit() {
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['configuration'] && changes['configuration'].currentValue) {
            this.specification.Selected =
                this.configuration.Items.some(c => c.ValueSpecificationID === this.specification.ID)
        }
    }

    selectSpecification(specification: ISpecification) {
        const data = this
            .attributes
            .map(attr => <ConfiguredAttributeData>({
                attributeNumber: attr.attributeNumber,
                valueArtifactId: attr.selectedArtifact.ID,
                displayName: attr.selectedArtifact.DisplayName
            }))
        this.specificationSelected.emit(new SelectionArgs(specification, data))
        this.attributeFeatureModal.hide()
    }
}