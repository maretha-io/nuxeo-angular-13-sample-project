import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, of, Subject, switchMap, tap } from 'rxjs';
import { DocumentsService } from './documents.service';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentSearchService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private readonly automationUrl = `${this.apiUrl}/automation`;

  searchPaneVisibilityChanged$ = new BehaviorSubject<boolean>(false);
  globalSearchChanged$ = new BehaviorSubject<boolean>(false);
  fetchingDocuments$ = new Subject<boolean>();

  private _globalSearch = false;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentsService: DocumentsService,
    private readonly layoutService: LayoutService,
    private readonly httpClient: HttpClient)
  {

  }

  // --------------------------------------------------------------------------------------------------
  showSearchPaneVisibility = () => this.searchPaneVisibilityChanged$.next(true);

  // --------------------------------------------------------------------------------------------------
  hideSearchPaneVisibility = () => this.searchPaneVisibilityChanged$.next(false);

  // --------------------------------------------------------------------------------------------------
  toggleSearchPaneVisibility = () => this.searchPaneVisibilityChanged$.next(!this.searchPaneVisibilityChanged$.value);

  // --------------------------------------------------------------------------------------------------
  set globalSearch(value: boolean)
  {
    this._globalSearch = value;
    this.globalSearchChanged$.next(value);
  }

  // --------------------------------------------------------------------------------------------------
  get globalSearch()
  {
    return this._globalSearch;
  }

  // --------------------------------------------------------------------------------------------------
  findDocuments()
  {
    this.documentsService.currentPage = 0;

    this.loadMore()
      .subscribe(x => 
      {
        this.layoutService.clearFilters();
        this.layoutService.sortField = undefined;
      });
  }

  // --------------------------------------------------------------------------------------------------
  loadMore()
  {
    this.fetchingDocuments$.next(true);

    const pageSize = this.layoutService.pageSize;
    let currentPage = this.documentsService.currentPage;

    const query = `?currentPageIndex=${currentPage++}&pageSize=${pageSize}`;

    const url = `${this.apiUrl}/search/pp/default_trash_search/execute${query}`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'thumbnail, permissions, highlight',
        'properties': 'dublincore,common,uid',
        'fetch-aggregate': 'key',
        'fetch-document': 'properties'
      })
    };

    return this.httpClient.get(url, headers)
      .pipe(
        tap((x: any) => 
        {
          this.fetchingDocuments$.next(false);

          this.documentsService.addDocuments(x.pageIndex, x.entries, x.totalSize, x.isNextPageAvailable);
        })
      );
  }
}
