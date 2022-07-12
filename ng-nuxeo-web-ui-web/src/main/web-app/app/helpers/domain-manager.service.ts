import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map, expand, forkJoin, takeWhile, reduce, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DomainManagerService
{
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private domainPathMap: { [key: string]: string } = {};
  private domainUidMap: { [key: string]: string } = {};
  domainsReady$ = new BehaviorSubject<{ [key: string]: IDomain } | undefined>(undefined);
  domainsTree: TreeNode | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly httpClient: HttpClient) { }

  // --------------------------------------------------------------------------------------------------
  getDomains(force = false)
  {
    if (this.domainsReady$.value && !force)
      return;

    const url = `${this.apiUrl}/search/pp/tree_children/execute?currentPageIndex=0&offset=0&pageSize=50&queryParams=`
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'hasFolderishChild',
        // 'properties': 'dublincore,common'
      })
    };

    this.httpClient.get(`${url}${'00000000-0000-0000-0000-000000000000'}`, headers)
      .subscribe((x: any) => 
      {
        const domains = x.entries.map((y: any) => ({
          uid: y.uid,
          parentUid: '00000000-0000-0000-0000-000000000000',
          title: y.title,
          path: y.path,
          hasChildren: y.contextParameters?.hasFolderishChild
        }));

        this.domainsReady$.next(domains);
      });
  }

  // --------------------------------------------------------------------------------------------------
  getAllDomains(force = false)
  {
    if (this.domainsReady$.value && !force)
      return;

    const url = `${this.apiUrl}/search/pp/tree_children/execute?currentPageIndex=0&offset=0&pageSize=50&queryParams=`
    const headers = {
      headers: new HttpHeaders({
        'enrichers-document': 'hasFolderishChild',
        // 'properties': 'dublincore,common'
      })
    };

    this.httpClient.get(`${this.apiUrl}/path/`, headers)
      .pipe(
        map((x: any) => ({ entries: [{ uid: x.uid }], menu: { [x.uid]: {} } })),
        // Recursively grab the domains
        expand(x =>
        {
          return forkJoin(x.entries.map((parentEntry: any) =>
            this.httpClient.get(`${url}${parentEntry.uid}`, headers)
              .pipe(
                map((x: any) =>
                {
                  const result: { entries: any[]; domains: { [key: string]: IDomain } } = {
                    entries: x.entries,
                    domains: {}
                  };

                  for (const entry of x.entries)
                  {
                    const path = this.toKebabCase(entry.title);

                    result.domains[entry.uid] = {
                      uid: entry.uid,
                      parentUid: parentEntry.uid,
                      title: entry.title,
                      path,
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
              let result: { entries: any[]; domains: { [key: string]: IDomain } } = {
                entries: [],
                domains: {}
              };

              for (const item of x)
              {
                result.entries = [...result.entries, ...item.entries];
                result.domains = { ...result.domains, ...item.domains };
              }

              return result;
            })
          )
        }),
        takeWhile(x => x.entries.length > 0, true),
        map(x => x.domains),
        reduce((acc: { [key: string]: IDomain }, domains) => acc ? { ...acc, ...domains } : domains, {})
      )
      .subscribe(domains => 
      {
        this.domainsTree = {
          uid: '00000000-0000-0000-0000-000000000000',
          label: '',
          children: [],
          path: ''
        };

        this.buildDomainTree(this.domainsTree, domains);

        this.domainsReady$.next(domains);
      });
  }

  // --------------------------------------------------------------------------------------------------
  getDomainIdByPath = (path: string): string => this.domainPathMap[path];

  // --------------------------------------------------------------------------------------------------
  getDomainPathById = (uid: string): string => this.domainUidMap[uid];

  // --------------------------------------------------------------------------------------------------
  getDomainParentsByPath = (path: string) => this.getDomainParentsById(this.getDomainIdByPath(path));

  // --------------------------------------------------------------------------------------------------
  getDomainParentsById(uid: string)
  {
    let result: {}[] = [];

    if (!this.domainsReady$.value || !this.domainsReady$.value[uid])
      return result;

    result.push({
      path: this.domainUidMap[uid],
      title: this.domainsReady$.value[uid].title
    });

    let parentUid = this.domainsReady$.value[uid].parentUid;
    while (parentUid !== '00000000-0000-0000-0000-000000000000')
    {
      result.push({
        path: this.domainUidMap[parentUid],
        title: this.domainsReady$.value[parentUid].title
      });

      parentUid = this.domainsReady$.value[parentUid].parentUid;
    }

    return result.reverse();
  }

  // --------------------------------------------------------------------------------------------------
  private buildDomainTree(root: TreeNode, domains: { [key: string]: IDomain })
  {
    // Turn the key-value object into our tree structure
    for (const key of Object.keys(domains)) 
    {
      let node: TreeNode | null = this.lookupTreeNode(root, domains[key].parentUid);

      if (!node)
        throw 'Uh oh, something went wrong when building the domains tree';

      const path = `${node.path}/${domains[key].path}`;

      node.children.push({
        uid: key,
        label: domains[key].title,
        children: [],
        path
      });

      this.domainPathMap[path] = key;
      this.domainUidMap[key] = path;
    }
  }

  // --------------------------------------------------------------------------------------------------
  private toKebabCase = (input = '') => input.split(' ').reduce((acc: string[], val: string) => acc.concat(val.toLocaleLowerCase()), []).join('-');

  // --------------------------------------------------------------------------------------------------
  private lookupTreeNode(root: TreeNode, uid: string): TreeNode | null
  {
    const stack = [root];

    while (stack.length)
    {
      const node = stack.pop();

      if (node?.uid === uid)
        return node;
      else if (node?.children.length)
        for (let index = 0; index < node?.children.length; index++)
          stack.push(node.children[index])
    }

    return null;
  }
}

export interface IDomain
{
  uid: string;
  parentUid: string;
  title: string;
  path: string;
  hasChildren: boolean;
}

export interface TreeNode
{
  uid: string;
  label: string;
  path?: string;
  children: TreeNode[];
  open?: boolean;
}