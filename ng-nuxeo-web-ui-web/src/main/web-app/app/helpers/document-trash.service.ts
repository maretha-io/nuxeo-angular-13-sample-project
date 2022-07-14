import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of, Subject, tap } from 'rxjs';
import { DocumentsService } from './documents.service';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentTrashService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private readonly automationUrl = `${this.apiUrl}/automation`;

  documentMovedToTrash$ = new Subject<string>();
  documentTakenOutOfTrash$ = new Subject<string>();
  fetchingDocuments$ = new Subject<boolean>();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentsService: DocumentsService,
    private readonly layoutService: LayoutService,
    private readonly httpClient: HttpClient)
  {
  }

  // --------------------------------------------------------------------------------------------------
  loadMore(): Observable<any>
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

  // --------------------------------------------------------------------------------------------------
  moveDocumentToTrash(documentUid: string)
  {
    const url = `${this.automationUrl}/Document.Trash`;

    return this.httpClient.post(url,
      {
        params: {},
        context: {},
        input: documentUid
      })
      .pipe(
        tap(() => this.documentMovedToTrash$.next(documentUid))
      );
  }

  // --------------------------------------------------------------------------------------------------
  takeDocumentOutOfTrash(documentUid: string)
  {
    const url = `${this.automationUrl}/Document.Untrash`;

    return this.httpClient.post(url,
      {
        params: {},
        context: {},
        input: documentUid
      })
      .pipe(
        tap(() => this.documentTakenOutOfTrash$.next(documentUid))
      );
  }

  // --------------------------------------------------------------------------------------------------
  purgeDocument(documentUid: string)
  {

  }
}
