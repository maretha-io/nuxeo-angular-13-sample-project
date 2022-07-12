import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentHistoryService } from 'app/helpers/document-history.service';
import { DocumentService } from 'app/helpers/document.service';
import { animations } from 'app/shared.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'nx-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations: [animations.itemsAnimation, animations.listAnimation]
})
export class HistoryComponent implements OnDestroy
{
  documentHistory: any[] = [];
  uid: string | null = null;

  private destroy$ = new Subject();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly documentHistoryService: DocumentHistoryService,
    private readonly documentService: DocumentService)
  {
    this.documentHistoryService.documentHistoryUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(x => this.documentHistory = x);

    documentService.documentFetched$
      .pipe(takeUntil(this.destroy$))
      .subscribe(uid => this.uid = uid);
  }

  // --------------------------------------------------------------------------------------------------
  openDocument(documentUid: string)
  {
    this.router.navigate(['./', documentUid]);
  }

  // --------------------------------------------------------------------------------------------------
  clearHistory()
  {
    this.documentHistoryService.clear();
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
