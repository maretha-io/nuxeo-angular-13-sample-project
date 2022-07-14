import { Component, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LayoutService, LayoutDisplayMode } from 'app/helpers/layout.service';

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
    private readonly layoutService: LayoutService) 
  {
    layoutService.displayModeUpdated$
      .subscribe(x => this.displaySettingsForm?.get('displayMode')?.setValue(x, { emitEvent: false }));

    layoutService.filtersUpdated$
      .subscribe(x => 
      {
        const formArray = this.fb.array([]);

        for (const filter of x)
          formArray.push(this.fb.group({ [filter.fieldName]: [filter.fieldValue] }));

        this.displaySettingsForm?.get('filters')?.setValue(formArray, { emitEvent: false })
      });

    layoutService.sortFieldsUpdated$
      .subscribe(x => 
      {
        this.displaySettingsForm?.get('sortFieldAscending')?.setValue(layoutService.sortAscending, { emitEvent: false });

        const formArray = this.fb.array([]);

        for (const sortField of x)
          formArray.push(this.fb.group({ [sortField]: [] }));

        this.displaySettingsForm?.get('sortFields')?.setValue(formArray, { emitEvent: false })
      });
  }

  // --------------------------------------------------------------------------------------------------
  applyDisplaySettings()
  {
    this.layoutService.displayMode = this.displaySettingsForm?.get('displayMode')?.value as LayoutDisplayMode;

    this.displaySettingsForm?.markAsPristine();
  }

  // --------------------------------------------------------------------------------------------------
  get filters(): FormArray
  {
    return this.displaySettingsForm?.get('filters') as FormArray;
  }

  // --------------------------------------------------------------------------------------------------
  get sortFields(): FormArray
  {
    return this.displaySettingsForm?.get('sortFields') as FormArray;
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
    this.displaySettingsForm = this.fb.group(
      {
        displayMode: [this.layoutService.displayMode.toString()],
        sortFields: this.fb.array([]),
        sortFieldAscending: [true],
        filters: this.fb.array([]),
        pageSize: [this.layoutService.pageSize]
      });
  }
}
