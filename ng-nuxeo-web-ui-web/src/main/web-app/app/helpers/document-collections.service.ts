import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, defaultIfEmpty, forkJoin, map, of, reduce, Subject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentCollectionsService
{
  documentAddedToCollection$ = new Subject<any>();
  documentRemovedFromCollection$ = new Subject<any>();
  documentCollections: any[] = [];

  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private readonly automationUrl = `${this.apiUrl}/automation`;
  private favoritesUid: string | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly httpClient: HttpClient) 
  {
  }

  // --------------------------------------------------------------------------------------------------
  // Get the "Favorites" collection along with some of its documents
  private getFavorites()
  {
    const currentPage = 0, pageSize = 40, sortColumn = 'dc:title';
    const url = `${this.apiUrl}/search/pp/default_content_collection/execute?currentPageIndex=${currentPage}&pageSize=${pageSize}&sortBy=${sortColumn}&sortOrder=asc&queryParams=`;
    const headers = {
      headers: new HttpHeaders({})
    };
    const body = {
      params: {},
      context: {}
    };

    return this.httpClient.post(`${this.automationUrl}/Favorite.Fetch`, body, headers)
      .pipe(
        tap((x: any) => this.favoritesUid = x.uid),
        switchMap((x: any) => this.httpClient.get(`${url}${x.uid}`)
          .pipe(
            map((y: any) => ([{
              uid: x.uid,
              title: x.title,
              type: x.type,
              currentPage: y.pageIndex,
              canLoadMore: y.isNextPageAvailable,
              totalCount: y.totalSize,
              documents: y.entries,
              order: 0 // So that it's always at the top of the list
            }]))
          )
        )
      );
  }

  // --------------------------------------------------------------------------------------------------
  // Get paged documents from the "Favorites" collection
  getFavoritesDocuments(currentPage = 0, pageSize = 40, sortColumn = 'dc:title')
  {
    const url = `${this.apiUrl}/search/pp/default_content_collection/execute?currentPageIndex=${currentPage}&pageSize=${pageSize}&sortBy=${sortColumn}&sortOrder=asc&queryParams=`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'hasContent,firstAccessibleAncestor,permissions,preview,favorites,subscribedNotifications,thumbnail,renditions,pendingTasks,runnableWorkflows,runningWorkflows,collections,audit,subtypes,tags,publications,breadcrumb',
        'properties': 'dublincore,common',
      })
    };
    const body = {
      params: {},
      context: {}
    };

    return this.httpClient.get(`${url}${this.favoritesUid}`)
      .pipe(
        map((y: any) => ({
          canLoadMore: y.isNextPageAvailable,
          totalCount: y.totalSize,
          documents: y.entries
        }))
      );
  }

  // --------------------------------------------------------------------------------------------------
  // Get all collections (max 100) along with some of their documents
  private getCollections()
  {
    const user = encodeURIComponent('$currentUser');
    const searchTerm = encodeURIComponent('%');
    const sortColumn = 'dc:title'
    const collectionsUrl = `${this.apiUrl}/search/pp/user_collections/execute?currentPageIndex=0&pageSize=100&sortBy=${sortColumn}&sortOrder=asc&searchTerm=${searchTerm}&user=${user}`
    const headers = {
      headers: new HttpHeaders({})
    };

    return this.httpClient.get(collectionsUrl, headers)
      .pipe(
        switchMap((x: any) =>
          forkJoin(x.entries.map((collection: any, index: number) => this.getCollectionDocuments(collection.uid)
            .pipe(
              map((y: any) => ({
                uid: collection.uid,
                title: collection.title,
                type: collection.type,
                currentPage: y.pageIndex,
                canLoadMore: y.isNextPageAvailable,
                totalCount: y.totalSize,
                documents: y.entries,
                order: index + 1
              }))
            )
          ))
            .pipe(defaultIfEmpty([]))
        )
      );
  }

  // --------------------------------------------------------------------------------------------------
  getCollectionDocuments(collectionUid: string, currentPage = 0, pageSize = 40)
  {
    const url = `${this.apiUrl}/search/pp/default_content_collection/execute?currentPageIndex=${currentPage}&pageSize=${pageSize}&queryParams=${collectionUid}`;
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'hasContent,firstAccessibleAncestor,permissions,preview,favorites,subscribedNotifications,thumbnail,renditions,pendingTasks,runnableWorkflows,runningWorkflows,collections,audit,subtypes,tags,publications,breadcrumb',
        'properties': 'dublincore,common',
      })
    };

    return this.httpClient.get(url/*,
      {
        params: {
          currentPageIndex: currentPage,
          pageSize: pageSize,
          queryParams: collectionUid,
          namedParameters: {},
          providerName: "pp_content_collection"
        },
        context: {}
      }/**/).pipe(
      map((y: any) => ({
        canLoadMore: y.isNextPageAvailable,
        totalCount: y.totalSize,
        entries: y.entries
      }))
    );
  }

  // --------------------------------------------------------------------------------------------------
  getAllCollections()
  {
    return forkJoin({
      favorites: this.getFavorites().pipe(catchError(() => of([]))),
      collections: this.getCollections().pipe(catchError(() => of([])))
    })
      .pipe(
        map((x: any) => 
        {
          return [...x.favorites, ...x.collections].sort((a, b) => a.order - b.order)
        }),
        tap(x => this.documentCollections = x)
      );
  }

  // --------------------------------------------------------------------------------------------------
  createCollection(collectionName: string)
  {
    const url = `${this.automationUrl}/Collection.CreateCollection`;

    return this.httpClient.post(url,
      {
        params:
        {
          name: collectionName
        },
        context: {}
      });
  }

  // --------------------------------------------------------------------------------------------------
  addToCollection(documentUid: string, collectionUid: string)
  {
    const url = `${this.automationUrl}/Document.AddToCollection`;

    return this.httpClient.post(url,
      {
        params:
        {
          collection: collectionUid
        },
        context: {},
        input: documentUid
      })
      .pipe(
        tap(() => this.documentAddedToCollection$.next({ documentUid, collectionUid }))
      );
  }

  // --------------------------------------------------------------------------------------------------
  removeFromCollection(documentUid: string, collectionUid: string)
  {
    const url = `${this.automationUrl}/Collection.RemoveFromCollection`;

    return this.httpClient.post(url,
      {
        params:
        {
          collection: collectionUid
        },
        context: {},
        input: documentUid
      })
      .pipe(
        tap(() => this.documentRemovedFromCollection$.next({ documentUid, collectionUid }))
      );
  }

  // --------------------------------------------------------------------------------------------------
  removeFromAllCollections(documentUid: string)
  {
    const url = `${this.automationUrl}/Collection.RemoveFromCollection`;

    return forkJoin(this.documentCollections.map(x =>
      this.httpClient.post(url,
        {
          params:
          {
            collection: x.uid
          },
          context: {},
          input: documentUid
        })
        .pipe(
          tap(() => this.documentRemovedFromCollection$.next({ documentUid, collectionUid: x.uid }))
        )
    ));
  }

  // --------------------------------------------------------------------------------------------------
  toggleFavoriteDocument(documentUid: string, addToFavorites: boolean)
  {
    const url = `${this.automationUrl}/${addToFavorites ? 'Document.AddToFavorites' : 'Document.RemoveFromFavorites'}`;

    return this.httpClient.post(url,
      {
        params: {},
        context: {},
        input: documentUid
      })
      .pipe(
        tap(() => 
        {
          if (addToFavorites)
            this.documentAddedToCollection$.next({ documentUid, collectionUid: this.favoritesUid });
          else
            this.documentRemovedFromCollection$.next({ documentUid, collectionUid: this.favoritesUid });
        })
      );
  }
}
