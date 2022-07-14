import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { filter, map, merge, Observable, of, ReplaySubject, Subject, switchMap, tap } from 'rxjs';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentEntriesService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private _entries: any[] = [];
  private itemsCount = 0;
  private _totalCount = 0;
  private selectedItemsCount = 0;
  private currentPage = 0;
  private pageCount = 0;
  private _canLoadMore = false;
  private _displayMode = DisplayMode.List;

  entriesUpdated$ = new ReplaySubject<any[]>(1);
  fetchingEntries$ = new Subject<boolean>();
  entriesFetched$ = new Subject();
  displayModeChanged$ = new ReplaySubject<DisplayMode>(1);
  selectionChanged$ = new ReplaySubject<IItemSelection>(1);

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentService: DocumentService,
    private readonly httpClient: HttpClient)
  {
    this.displayMode = parseInt(localStorage.getItem('displayMode') || DisplayMode.List.toString());

    // documentService.documentFetched$
    //   .pipe(
    //     switchMap(uid => uid ? this.getDocumentEntries(uid) : of(null))
    //   )
    //   .subscribe(x => 
    //   {
    //     if (x)
    //     {
    //       if (x.entries)
    //         x.entries.forEach(this.setCustomProperties);

    //       this._entries = x.entries || [];

    //       this.itemsCount = this._entries?.length || 0;
    //       this.pageCount = x.pageCount;
    //       this.currentPage = x.pageIndex;
    //       this._totalCount = x.totalSize;
    //       this._canLoadMore = x.isNextPageAvailable;
    //     }
    //     else
    //     {
    //       this._entries = [];
    //       this.itemsCount = 0;
    //       this.pageCount = 0;
    //       this.currentPage = 0;
    //       this._totalCount = 0;
    //       this._canLoadMore = false;
    //     }

    //     this.selectedItemsCount = 0;

    //     this.raiseEntriesUpdatedEvent();

    //     this.raiseSelectionChangedEvent();
    //   });
  }

  // --------------------------------------------------------------------------------------------------
  loadMore(): Observable<any[] | null>
  {
    if (!this.canLoadMore)
      return of(null);

    return this.getDocumentEntries(this.documentService.documentInfo.uid, this.currentPage + 1)
      .pipe(
        tap(x => 
        {
          this.pageCount = x.pageCount;
          this.currentPage = x.pageIndex;
          this._totalCount = x.totalSize;
          this._canLoadMore = x.isNextPageAvailable;

          this.addEntries(x.entries);
        }),
        map(() => this._entries)
      );
  }

  // --------------------------------------------------------------------------------------------------
  get selectedEntries()
  {
    return this._entries.filter(x => x._selected);
  }

  // --------------------------------------------------------------------------------------------------
  addEntries(entries: any[])
  {
    if (!entries)
      return;

    let raiseSelectionChangedEvent = false;
    let selectedItemsCount = this.selectedItemsCount;
    for (const entry of entries)
    {
      this.setCustomProperties(entry);

      this._entries.push(entry);

      if (entry._selected)
      {
        selectedItemsCount++;
        raiseSelectionChangedEvent = true;
      }
    }

    this.itemsCount = this._entries.length;
    this.selectedItemsCount = selectedItemsCount;

    this.raiseEntriesUpdatedEvent();

    if (raiseSelectionChangedEvent)
      this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  removeSelectedEntries()
  {
    this._entries = this._entries.filter(x => !x._selected);

    this.itemsCount = this._entries.length;
    this.selectedItemsCount = 0;

    this.raiseEntriesUpdatedEvent();

    this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  removeEntry(entry: any)
  {
    if (!entry)
      return;

    let raiseSelectionChangedEvent = false;
    if (entry._selected)
    {
      this.selectedItemsCount--;
      raiseSelectionChangedEvent = true;
    }

    this._entries = this._entries.filter(x => x.uid !== entry.uid);
    this.itemsCount = this._entries.length;

    this.raiseEntriesUpdatedEvent();

    if (raiseSelectionChangedEvent)
      this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  toggleSelection(entryUid: string)
  {
    const entry = this._entries.find(x => x.uid === entryUid)

    if (!entry)
      return;

    entry._selected = !entry._selected;

    this.selectedItemsCount = entry._selected ? this.selectedItemsCount + 1 : this.selectedItemsCount - 1;

    this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  selectAll()
  {
    for (const entry of this._entries)
      entry._selected = true;

    this.selectedItemsCount = this.itemsCount;

    this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  deselectAll()
  {
    for (const entry of this._entries)
      entry._selected = false;

    this.selectedItemsCount = 0;

    this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  invertSelection()
  {
    let selectedItemsCount = 0;

    for (const entry of this._entries)
    {
      entry._selected = !entry._selected;

      if (entry._selected)
        selectedItemsCount++;
    }

    this.selectedItemsCount = selectedItemsCount;

    this.raiseSelectionChangedEvent();
  }

  // --------------------------------------------------------------------------------------------------
  public get displayMode(): DisplayMode
  {
    return this._displayMode;
  }

  // --------------------------------------------------------------------------------------------------
  public set displayMode(mode: DisplayMode)
  {
    this._displayMode = mode;

    this.displayModeChanged$.next(mode);

    localStorage.setItem('displayMode', mode.toString());
  }

  // --------------------------------------------------------------------------------------------------
  public get canLoadMore(): boolean
  {
    return this._canLoadMore;
  }

  // --------------------------------------------------------------------------------------------------
  public get totalCount(): number
  {
    return this._totalCount;
  }

  // --------------------------------------------------------------------------------------------------
  public get entries(): any[]
  {
    return this._entries;
  }

  // --------------------------------------------------------------------------------------------------
  private setCustomProperties(document: any)
  {
    if (!document)
      return;

    document.canBrowse = document.contextParameters?.permissions
      ? document.contextParameters?.permissions?.includes('Browse')
      : true;

    document.isFolder = document.facets?.includes('Folderish');

    document.canPublish = document.facets?.includes('Publishable');

    document.canWrite = document.contextParameters?.permissions?.includes('Write') ||
      document.contextParameters?.permissions?.includes('ReadWrite');
  }

  // --------------------------------------------------------------------------------------------------
  private raiseSelectionChangedEvent()
  {
    this.selectionChanged$.next({
      itemsCount: this.itemsCount,
      selectedItemsCount: this.selectedItemsCount
    });
  }

  // --------------------------------------------------------------------------------------------------
  private raiseEntriesUpdatedEvent()
  {
    this.entriesUpdated$.next(this._entries);
  }

  // --------------------------------------------------------------------------------------------------
  private getDocumentEntries(uid: string, currentPage = 0, pageSize = 4, sortColumn = 'dc:title'): Observable<any>
  {
    this.fetchingEntries$.next(true);

    const url = `${this.apiUrl}/search/pp/advanced_document_content/execute?currentPageIndex=${currentPage}&pageSize=${pageSize}&ecm_parentId=${uid}&ecm_trashed=false&sortBy=${sortColumn}&sortOrder=asc`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'thumbnail,documentURL,preview',
        'properties': 'dublincore,common,uid,fscommon,links,licensing,fab,trend,stock,file,picture'
      })
    };

    return this.httpClient.get(url, headers)
      .pipe(
        tap(x => this.entriesFetched$.next(x))
      );
  }
}

export interface IItemSelection
{
  itemsCount: number;
  selectedItemsCount: number;
}

export enum DisplayMode
{
  List = 1,
  Grid = 2,
  Table = 3
}