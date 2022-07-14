import { Component, DoCheck, EventEmitter, Injector, Input, IterableDiffer, IterableDiffers, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { DocumentBrowserService } from 'app/helpers/document-browser.service';
import { DocumentClipboardService } from 'app/helpers/document-clipboard.service';
import { DocumentCollectionsService } from 'app/helpers/document-collections.service';
import { DisplayMode, DocumentEntriesService } from 'app/helpers/document-entries.service';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { DocumentService } from 'app/helpers/document.service';
import { DocumentsService } from 'app/helpers/documents.service';
import { LayoutService } from 'app/helpers/layout.service';
import { animations } from 'app/shared.constants';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CollectionsAggregatorComponent } from '../collections-aggregator/collections-aggregator.component';

@Component({
  selector: 'nx-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.scss'],
  animations: [animations.inOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class FolderViewComponent implements OnDestroy, DoCheck
{
  @Output() entryAddedToCollection = new EventEmitter<string>();
  @Output() itemSelected = new EventEmitter<string>();
  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective> | undefined;
  collectionsAggregatorComponent = CollectionsAggregatorComponent;
  displayMode: DisplayMode = DisplayMode.List;
  documents: any[] | undefined;
  documentsHash = 0;
  totalCount = 0;
  canLoadMore = false;
  showDetails = false;
  loading = true;
  documentsDisplayed = false;
  bookmarksPopover = false;

  private readonly iterableDiffer: IterableDiffer<any>;
  private animationEventDebouncer$ = new Subject<boolean>();
  private destroy$ = new Subject();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly documentBrowserService: DocumentBrowserService,
    private readonly documentsService: DocumentsService,
    private readonly layoutService: LayoutService,
    private readonly iterableDiffers: IterableDiffers,
    private readonly documentClipboardService: DocumentClipboardService,
    private readonly documentTrashService: DocumentTrashService,
    private readonly documentCollectionsService: DocumentCollectionsService,
    private readonly documentService: DocumentService,
    public injector: Injector) 
  {
    this.iterableDiffer = iterableDiffers.find([]).create();

    documentsService.clearDocuments();
    layoutService.clearFilters();
    layoutService.sortFields = [];

    router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(e => e instanceof NavigationStart)
      )
      .subscribe(() =>
      {
        this.canLoadMore = false;
        this.loading = true;
        this.documents = [];
        this.documentsDisplayed = false;
      });

    layoutService.displayModeUpdated$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(displayMode => this.displayMode = parseInt(displayMode.toString()));

    // Use this trick to avoid firing the animation.done event too often, for every item
    this.animationEventDebouncer$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        debounceTime(300)
      )
      .subscribe(x => this.documentsDisplayed = x);

    documentCollectionsService.documentAddedToCollection$
      .subscribe(() => this.popovers?.forEach(x => x.hide()));

    documentsService.documentsUpdated$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(documents =>
      {
        this.documents = documents;

        this.canLoadMore = documentsService.canLoadMore;
        this.totalCount = documentsService.totalCount;

        this.loading = false;
      });

    documentService.documentFetched$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() =>
        {
          documentsService.clearDocuments({ emitEvent: false });
          layoutService.clearFilters();
          layoutService.sortFields = [];
        }),
        switchMap(uid => uid ? documentBrowserService.loadMore(uid) : of(null))
      )
      .subscribe();
  }

  // --------------------------------------------------------------------------------------------------
  toggleLoadMore = (show: boolean) => this.animationEventDebouncer$.next(show);

  // --------------------------------------------------------------------------------------------------
  loadMore()
  {
    this.loading = true;

    this.documentBrowserService.loadMore(this.documentService.documentInfo.uid)
      .pipe(
        catchError(error => 
        {
          this.loading = false;
          return of(error);
        })
      )
      .subscribe();
  }

  // --------------------------------------------------------------------------------------------------
  toggleFavoriteDocument(document: any)
  {
    if (!document)
      return;

    const addToFavorites = !document.contextParameters?.favorites?.isFavorite;

    this.documentCollectionsService.toggleFavoriteDocument(document.uid, addToFavorites)
      .subscribe(() => document.contextParameters.favorites.isFavorite = addToFavorites);

    this.entryAddedToCollection.emit(document.uid);
  }

  // --------------------------------------------------------------------------------------------------
  addToCollection(document: any)
  {
    this.injector = Injector.create({
      providers: [{ provide: 'documents', useValue: [document] }],
      parent: this.injector
    });

    this.entryAddedToCollection.emit(document.uid);
  }

  // --------------------------------------------------------------------------------------------------
  toggleSelection(documentUid: string)
  {
    this.documentsService.toggleSelection(documentUid)
    this.itemSelected.emit(documentUid);
  }

  // --------------------------------------------------------------------------------------------------
  trackByFn = (index: number, entry: any) => entry.uid;

  // --------------------------------------------------------------------------------------------------
  addToClipboard = (document: any) => this.documentClipboardService.addToClipboard(document);

  // --------------------------------------------------------------------------------------------------
  moveDocumentToTrash(document: any)
  {
    this.documentTrashService.moveDocumentToTrash(document.uid)
      .subscribe(() => this.documentsService.removeDocument(document));
  }

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
  ngDoCheck()
  {
    let changes = this.iterableDiffer.diff(this.documents);

    // Every time the entries array changes, compute its unique hash to use it for animations
    if (changes && this.documents)
      this.documentsHash = this.computeHash(this.documents.map(x => x.uid).join(','));
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
