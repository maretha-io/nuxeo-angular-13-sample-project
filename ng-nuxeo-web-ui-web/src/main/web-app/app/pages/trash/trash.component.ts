import { Component, OnDestroy } from '@angular/core';
import { DisplayMode } from 'app/helpers/document-entries.service';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { DocumentsService } from 'app/helpers/documents.service';
import { LayoutService } from 'app/helpers/layout.service';
import { animations } from 'app/shared.constants';
import { catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'nx-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss'],
  animations: [animations.inOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class TrashComponent implements OnDestroy
{
  private animationEventDebouncer$ = new Subject<boolean>();
  private destroy$ = new Subject();

  displayMode: DisplayMode = DisplayMode.List;
  documents: any[] = [];
  documentsHash = 0;
  totalCount = 0;
  canLoadMore = false;
  showDetails = false;
  documentsDisplayed = false;
  loading = true;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentTrashService: DocumentTrashService,
    private readonly documentsService: DocumentsService,
    private readonly layoutService: LayoutService) 
  {
    documentTrashService.fetchingDocuments$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    documentsService.clearDocuments();
    layoutService.clearFilters();
    layoutService.sortField = undefined;

    this.loadMore();
  }

  // --------------------------------------------------------------------------------------------------
  toggleLoadMore = (show: boolean) => this.animationEventDebouncer$.next(show);

  // --------------------------------------------------------------------------------------------------
  loadMore()
  {
    this.documentTrashService.loadMore()
      .pipe(catchError(() => of([])))
      .subscribe(() => 
      {
        this.documents = this.documentsService.documents;

        // Compute the unique hash of the documents array to use it in animations
        this.documentsHash = this.computeHash(this.documents.map(x => x.uid).join(','))
      });
  }

  // --------------------------------------------------------------------------------------------------
  toggleSelection(documentUid: string)
  {
    this.documentsService.toggleSelection(documentUid)
  }

  // --------------------------------------------------------------------------------------------------
  takeDocumentOutOfTrash(uid: string)
  {
    this.documentTrashService.takeDocumentOutOfTrash(uid);
  }

  // --------------------------------------------------------------------------------------------------
  purgeDocument(uid: string)
  {

  }

  // --------------------------------------------------------------------------------------------------
  trackByFn = (index: number, entry: any) => entry.uid;

  // --------------------------------------------------------------------------------------------------
  private computeHash(input: string)
  {
    let hash = 0, i, chr;
    if (input.length === 0)
      return hash;

    for (i = 0; i < input.length; i++) 
    {
      chr = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
