import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { environment } from 'environments/environment';
import { filter, switchMap, of, forkJoin, distinctUntilChanged, map, tap, Subject, Observable, catchError, skipWhile, combineLatest, ReplaySubject } from 'rxjs';
import { DocumentHistoryService } from './document-history.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;

  documentInfo: any;
  documentFetched$ = new ReplaySubject<string | null>(1);
  fetchingDocument$ = new Subject<string | null>();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly tokenService: TokenService,
    private readonly httpClient: HttpClient,
    private readonly documentHistoryService: DocumentHistoryService)
  {
    // When user navigates to a dynamic route, load the document
    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        map((e: any) => 
        {
          switch (e.url)
          {
            case '/trash':
              return null;

            case '/not-found':
              return null;

            default:
              return e.url === '/' || e.url.startsWith('/?code=')
                ? '00000000-0000-0000-0000-000000000000'
                : e.url.substring('/browse'.length + 1);
          }
        }),
        distinctUntilChanged(),
        tap((uid) => this.fetchingDocument$.next(uid)),
        switchMap(uid => uid
          ? forkJoin({
            uid: of(uid),
            documentInfo: this.getDocumentInfo(uid)
          }).pipe(catchError(() => of(null))) // Return null if can't find document
          : of(null)
        )
      )
      .subscribe(x =>
      {
        if (x)
        {
          this.setDocumentCustomProperties(x.documentInfo);

          this.documentInfo = x.documentInfo;

          this.documentFetched$.next(x.uid);

          if (x.uid !== '00000000-0000-0000-0000-000000000000')
            this.documentHistoryService.push(x.documentInfo);
        }
        else
        {
          this.documentFetched$.next(null);

          if (router.url !== '/' && !router.url.startsWith('/browse') && router.url !== '/trash' && router.url !== '/not-found')
            router.navigate(['not-found']);
        }
      });
  }

  // --------------------------------------------------------------------------------------------------
  private getDocumentInfo(uid: string): Observable<any>
  {
    if (!uid)
      return of(null);

    const url = `${this.apiUrl}/id/${uid}`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-blob': 'appLinks,preview',
        'enrichers-document': 'hasContent,firstAccessibleAncestor,permissions,preview,favorites,subscribedNotifications,thumbnail,renditions,pendingTasks,runnableWorkflows,runningWorkflows,collections,audit,subtypes,tags,publications,breadcrumb',
        'properties': 'dublincore,common',
        'fetch-directoryEntry': 'parent',
        'fetch-document': 'properties,lock'
      })
    };

    return this.httpClient.get(url, headers);
  }

  // --------------------------------------------------------------------------------------------------
  setDocumentCustomProperties(document: any)
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
}
