import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInfo } from 'app/models/user-info';
import { environment } from 'environments/environment';
import { combineLatest, EMPTY, expand, forkJoin, map, mergeMap, Observable, of, reduce, takeWhile, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NuxeoService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly httpClient: HttpClient)
  {

  }

  // --------------------------------------------------------------------------------------------------
  getUserInfo(): Observable<UserInfo>
  {
    return this.httpClient.get(`${this.apiUrl}/me/`)
      .pipe(map((x: any) => (
        {
          id: x.id,
          firstName: x.properties?.firstName,
          lastName: x.properties?.lastName,
          userName: x.properties?.username,
          company: x.properties?.company,
          email: x.properties?.email,
          phoneNumber: x.contextParameters?.userprofile?.phonenumber,
          avatar: x.contextParameters?.userprofile?.avatar,
          locale: x.contextParameters?.userprofile?.locale,
          groups: x.properties?.groups,
          isAdministrator: x.properties?.isAdministrator
        })
      ));
  }

  // --------------------------------------------------------------------------------------------------
  getMenuItems()
  {
    const url = `${this.apiUrl}/search/pp/tree_children/execute?currentPageIndex=0&offset=0&pageSize=50&queryParams=`
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'hasFolderishChild',
        'properties': 'dublincore,common'
      })
    };

    return this.httpClient.get(`${this.apiUrl}/path/`, headers)
      .pipe(
        map((x: any) => ({ entries: [{ uid: x.uid }], menu: { [x.uid]: {} } })),
        // Recursively grab the menu items
        expand(x =>
        {
          return forkJoin(x.entries.map((parentEntry: any) =>
            this.httpClient.get(`${url}${parentEntry.uid}`, headers)
              .pipe(
                map((x: any) =>
                {
                  const result: any = {
                    entries: x.entries,
                    menuItems: {}
                  };

                  for (const entry of x.entries)
                  {
                    result.menuItems[entry.uid] = {
                      parentUid: parentEntry.uid,
                      title: entry.title,
                      path: entry.path,
                      hasChildren: entry.contextParameters?.hasFolderishChild
                    }
                  }

                  return result;
                })
              )
          )).pipe(
            // Combine the results returned by forkJoin into a single object
            map((x: any) => 
            {
              let result: any = {
                entries: [],
                menuItems: {}
              };

              for (const item of x)
              {
                result.entries = [...result.entries, ...item.entries];
                result.menuItems = {...result.menuItems, ...item.menuItems};
              }

              return result;
            })
          )
        }
        ),
        takeWhile(x => x.entries.length, true),
        map((x: any) => x.menuItems),
        reduce((acc, menuItems: any) => acc ? {...acc, ...menuItems} : menuItems, {})
      );
  }
}
