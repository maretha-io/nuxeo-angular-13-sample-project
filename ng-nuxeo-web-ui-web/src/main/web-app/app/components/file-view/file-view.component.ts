import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { DocumentClipboardService } from 'app/helpers/document-clipboard.service';
import { DocumentService } from 'app/helpers/document.service';
import { animations } from 'app/shared.constants';
import { Subject, takeUntil } from 'rxjs';
import { CollectionsAggregatorComponent } from '../collections-aggregator/collections-aggregator.component';

@Component({
  selector: 'nx-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.scss'],
  animations: [animations.itemsAnimation]
})
export class FileViewComponent implements OnDestroy
{
  @Output() entryAddedToCollection = new EventEmitter<string>();

  collectionsAggregatorComponent = CollectionsAggregatorComponent;
  document: any | undefined;

  private destroy$ = new Subject();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentService: DocumentService,
    private readonly documentClipboardService: DocumentClipboardService) 
  {
    documentService.documentFetched$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.document = this.documentService.documentInfo);
  }

  // --------------------------------------------------------------------------------------------------
  addToClipboard = (document: any) => this.documentClipboardService.addToClipboard(document);

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
