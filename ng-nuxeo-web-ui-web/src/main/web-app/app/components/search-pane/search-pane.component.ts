import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentSearchService } from 'app/helpers/document-search.service';
import { animations } from 'app/shared.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'nx-search',
  templateUrl: './search-pane.component.html',
  styleUrls: ['./search-pane.component.scss'],
  animations: [animations.horizontalInOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class SearchComponent implements OnInit, OnDestroy
{
  searchPaneOpen = false;
  readonly searchFormNames = ['defaultSearchForm'];
  readonly savedSearchesForm: FormGroup;
  parentSearchForm?: FormGroup | undefined;
  currentSearchFormName = this.searchFormNames[0];
  loadingSavedSearches = false;
  savedSearches: any[] = [];
  savedSearchesPopover = false;

  private readonly destroy$ = new Subject();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly documentSearchService: DocumentSearchService) 
  {
    documentSearchService.globalSearch = false;

    documentSearchService.searchPaneVisibilityChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(x => 
      {
        this.searchPaneOpen = x;

        // Always have the local search set to true when opening the search pane
        if (x)
          this.parentSearchForm?.get('local')?.setValue(true);
      });

    this.savedSearchesForm = this.fb.group({
      title: []
    });
  }

  // --------------------------------------------------------------------------------------------------
  setupForm()
  {
    this.parentSearchForm = this.fb.group({
      local: [true],
      [this.searchFormNames[0]]: this.fb.group({
        field1: [],
        field2: [],
        field3: [],
        field4: [],
        field5: [],
        check1: [true],
        check2: [false],
        check3: [{ value: true, disabled: true }],
      })
    });

    this.parentSearchForm.get('local')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(x => this.documentSearchService.globalSearch = !x);

    this.parentSearchForm.get(this.searchFormNames[0])?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(x =>
      {
        // TODO
      });
  }

  // --------------------------------------------------------------------------------------------------
  saveSearch()
  {
    // TODO

    this.savedSearchesForm.reset();
    this.savedSearchesPopover = false;
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
    this.setupForm();
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
