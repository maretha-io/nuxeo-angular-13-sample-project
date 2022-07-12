import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentHistoryService
{
  documentHistoryUpdated$ = new ReplaySubject<any[]>(1);

  private readonly maxDocuments = 10;
  private documentHistory: any[] = [];
  private localStorageKey = '';

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService) 
  {
    authService.userInfoUpdated$
      .subscribe(x => 
      {
        if (!x)
          return;

        this.localStorageKey = `${x.userName}-default-nuxeo-recent-documents`;

        const documentHistory = localStorage.getItem(this.localStorageKey);

        if (!documentHistory)
          return;

        try 
        {
          const array = JSON.parse(documentHistory);

          if (!Array.isArray(array))
            return;

            this.documentHistory = array;
            this.documentHistoryUpdated$.next(this.documentHistory);
        }
        catch (error) { }
      });
  }

  // --------------------------------------------------------------------------------------------------
  push(entry: any)
  {
    let index = this.documentHistory.findIndex(x => x.uid === entry.uid);

    if (index < 0)
      this.documentHistory = [entry, ...this.documentHistory.slice(0, this.maxDocuments - 1)];
    else
    {
      // If the item's already in the history, move it to the top
      this.documentHistory.splice(index, 1);
      this.documentHistory.unshift(entry);
    }

    this.documentHistoryUpdated$.next(this.documentHistory);

    if (this.localStorageKey)
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.documentHistory));
  }

  // --------------------------------------------------------------------------------------------------
  clear()
  {
    this.documentHistory = [];

    this.documentHistoryUpdated$.next(this.documentHistory);

    if (this.localStorageKey)
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.documentHistory));
  }
}
