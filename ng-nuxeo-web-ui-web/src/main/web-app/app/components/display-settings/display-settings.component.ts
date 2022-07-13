import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DisplayMode, DocumentEntriesService } from 'app/helpers/document-entries.service';

@Component({
  selector: 'nx-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit
{
  displaySettingsForm?: UntypedFormGroup | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly fb: UntypedFormBuilder,
    private readonly documentEntriesService: DocumentEntriesService) 
  {
    documentEntriesService.displayModeChanged$
      .subscribe(x => this.displaySettingsForm?.setValue({ 'displayMode': x }, { emitEvent: false }));
  }

  // --------------------------------------------------------------------------------------------------
  applyDisplaySettings()
  {
    this.documentEntriesService.displayMode = this.displaySettingsForm?.get('displayMode')?.value as DisplayMode;

    this.displaySettingsForm?.markAsPristine();
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
    this.displaySettingsForm = this.fb.group(
      {
        displayMode: [this.documentEntriesService.displayMode.toString()]
      });
  }
}
