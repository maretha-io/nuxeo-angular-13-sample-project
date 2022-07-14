import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { ReplaySubject, Subject, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentClipboardService
{
  documentClipboardUpdated$ = new ReplaySubject<any[]>(1);
  documentCopied$ = new Subject<any>();
  documentMoved$ = new Subject<any>();

  private readonly maxDocuments = 10;
  private clipboard: any[] = [];
  private localStorageKey = '';
  private readonly apiUrl = `${environment.nuxeoUrl}/api/v1`;
  private readonly automationUrl = `${this.apiUrl}/automation`;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService,
    private readonly httpClient: HttpClient) 
  {
    authService.userInfoUpdated$
      .subscribe(x => 
      {
        if (!x)
          return;

        this.localStorageKey = `${x.userName}-default-nuxeo-clipboard`;

        const clipboard = localStorage.getItem(this.localStorageKey);

        if (!clipboard)
          return;

        try 
        {
          const array = JSON.parse(clipboard);

          if (!Array.isArray(array))
            return;

          this.clipboard = array;
          this.documentClipboardUpdated$.next(this.clipboard);
        }
        catch (error) { }
      });
  }

  // --------------------------------------------------------------------------------------------------
  addToClipboard(input: any[])
  {
    for (const entry of input)
    {
      let index = this.clipboard.findIndex(x => x.uid === entry.uid);

      if (index < 0)
        this.clipboard = [entry, ...this.clipboard.slice(0, this.maxDocuments - 1)];
      else
      {
        // If the item's already in the history, move it to the top
        this.clipboard.splice(index, 1);
        this.clipboard.unshift(entry);
      }
    }

    this.documentClipboardUpdated$.next(this.clipboard);

    if (this.localStorageKey)
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.clipboard));
  }

  // --------------------------------------------------------------------------------------------------
  removeFromClipboard(uid: string)
  {
    this.clipboard = this.clipboard.filter(x => x.uid !== uid);

    this.documentClipboardUpdated$.next(this.clipboard);

    if (this.localStorageKey)
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.clipboard));
  }

  // --------------------------------------------------------------------------------------------------
  clearClipboard()
  {
    this.clipboard = [];

    this.documentClipboardUpdated$.next(this.clipboard);

    if (this.localStorageKey)
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.clipboard));
  }

  // --------------------------------------------------------------------------------------------------
  copyTo(sourceUid: string, destinationUid: string)
  {
    const url = `${this.automationUrl}/Document.Copy`;

    return this.httpClient.post(url,
      {
        params: {
          target: destinationUid
        },
        context: {},
        input: sourceUid
      })
      .pipe(
        tap(() =>
        {
          this.documentCopied$.next({
            sourceUid,
            destinationUid
          });
        })
      );
  }

  // --------------------------------------------------------------------------------------------------
  moveTo(sourceUid: string, destinationUid: string)
  {
    const url = `${this.automationUrl}/Document.Move`;

    return this.httpClient.post(url,
      {
        params: {
          target: destinationUid
        },
        context: {},
        input: sourceUid
      })
      .pipe(
        tap(() =>
        {
          this.removeFromClipboard(sourceUid);

          this.documentMoved$.next({
            sourceUid,
            destinationUid
          });
        })
      );
  }
}
