import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService
{
  displayModeUpdated$ = new Subject<LayoutDisplayMode>();
  filtersUpdated$ = new Subject<ILayoutFilter[]>();
  sortFieldsUpdated$ = new Subject<string[]>();

  private readonly _defaultPageSize = 40;
  private _pageSize = this._defaultPageSize;
  private _displayMode = LayoutDisplayMode.List;
  private _filters: ILayoutFilter[] = [];
  private _sortFields: string[]  = [];
  private _sortField: string | undefined;
  private _sortAscending = true;

  // --------------------------------------------------------------------------------------------------
  constructor() 
  {
    // Get pageSize from localStorage
    try
    {
      this.pageSize = parseInt(localStorage.getItem('pageSize') || '') || this._defaultPageSize;
    }
    catch { }
  }

  // --------------------------------------------------------------------------------------------------
  set displayMode(displayMode: LayoutDisplayMode)
  {
    this._displayMode = displayMode;

    this.displayModeUpdated$.next(displayMode);
  }

  // --------------------------------------------------------------------------------------------------
  get displayMode()
  {
    return this._displayMode;
  }

  // --------------------------------------------------------------------------------------------------
  addFilter(filter: ILayoutFilter)
  {
    if (this._filters.filter(x => x.fieldName === filter.fieldName))
      return;

    this._filters.push(filter);

    this.filtersUpdated$.next(this._filters);
    // --------------------------------------------------------------------------------------------------
  }

  // --------------------------------------------------------------------------------------------------
  removeFilter(fieldName: string)
  {
    if (!fieldName)
      return;

    this._filters = this._filters.filter(x => x.fieldName !== fieldName);

    this.filtersUpdated$.next(this._filters);
  }

  // --------------------------------------------------------------------------------------------------
  clearFilters(options?: { emitEvent: boolean } | undefined)
  {
    this._filters = [];

    if (!options || options.emitEvent)
      this.filtersUpdated$.next(this._filters);
  }

  // --------------------------------------------------------------------------------------------------
  get filters()
  {
    return this._filters;
  }

  // --------------------------------------------------------------------------------------------------
  set sortFields(sortFields: string[])
  {
    this._sortFields = sortFields;

    this.sortFieldsUpdated$.next(this.sortFields);
  }

  // --------------------------------------------------------------------------------------------------
  get sortFields(): string[]
  {
    return this._sortFields;
  }

  // --------------------------------------------------------------------------------------------------
  set sortField(value: string | undefined)
  {
    this._sortField = value;
  }

  // --------------------------------------------------------------------------------------------------
  get sortField()
  {
    return this._sortField;
  }

  // --------------------------------------------------------------------------------------------------
  set sortAscending(value: boolean)
  {
    this._sortAscending = value;
  }

  // --------------------------------------------------------------------------------------------------
  get sortAscending()
  {
    return this._sortAscending;
  }

  // --------------------------------------------------------------------------------------------------
  set pageSize(pageSize: number)
  {
    this._pageSize = pageSize > 0 ? pageSize : this._defaultPageSize;
  }

  // --------------------------------------------------------------------------------------------------
  get pageSize()
  {
    return this._pageSize;
  }
}

export enum LayoutDisplayMode
{
  List = 1,
  Grid = 2,
  Table = 3
}

export interface ILayoutFilter
{
  fieldName: string;
  fieldValue: any;
  fieldType: string;
}
