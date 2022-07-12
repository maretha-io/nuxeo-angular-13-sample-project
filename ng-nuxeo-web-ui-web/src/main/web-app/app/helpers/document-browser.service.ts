import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of, Subject, switchMap, tap } from 'rxjs';
import { DocumentService } from './document.service';
import { DocumentsService } from './documents.service';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentBrowserService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;

  fetchingDocuments$ = new Subject<boolean>();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentService: DocumentService,
    private readonly documentsService: DocumentsService,
    private readonly layoutService: LayoutService,
    private readonly httpClient: HttpClient)
  {
    documentService.documentFetched$
      .pipe(
        tap(() => documentsService.currentPage = 0),
        switchMap(uid => uid ? this.loadMore(uid) : of(null))
      )
      .subscribe(x => 
      {
        if (!x)
          documentsService.clearDocuments();

        layoutService.clearFilters();
        layoutService.sortField = undefined;
      });
  }

  // --------------------------------------------------------------------------------------------------
  loadMore(uid: string): Observable<any>
  {
    this.fetchingDocuments$.next(true);

    const pageSize = this.layoutService.pageSize;
    let currentPage = this.documentsService.currentPage;
    
    let query = `?currentPageIndex=${currentPage++}&pageSize=${pageSize}&ecm_parentId=${uid}&ecm_trashed=false`;

    const sortFieldName = this.layoutService.sortField?.fieldName;
    if (sortFieldName)
      query += `&sortBy=${sortFieldName}&sortOrder=${this.layoutService.sortField?.ascending ? 'asc' : 'desc'}`;

    const url = `${this.apiUrl}/search/pp/advanced_document_content/execute${query}`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'thumbnail,documentURL,preview',
        'properties': 'dublincore,common,uid,fscommon,links,licensing,fab,trend,stock,file,picture'
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
