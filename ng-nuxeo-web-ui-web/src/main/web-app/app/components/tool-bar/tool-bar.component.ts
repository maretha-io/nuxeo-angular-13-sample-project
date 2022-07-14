import { Component, Injector } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DocumentClipboardService } from 'app/helpers/document-clipboard.service';
import { DocumentCollectionsService } from 'app/helpers/document-collections.service';
import { DocumentSearchService } from 'app/helpers/document-search.service';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { DocumentService } from 'app/helpers/document.service';
import { DocumentsService } from 'app/helpers/documents.service';
import { animations } from 'app/shared.constants';
import { filter, forkJoin, merge } from 'rxjs';
import { ClipboardComponent } from '../clipboard/clipboard.component';
import { CollectionsAggregatorComponent } from '../collections-aggregator/collections-aggregator.component';

@Component({
  selector: 'nx-toolbar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
  animations: [animations.inOutAnimation]
})
export class ToolbarComponent
{
  clipboardComponent = ClipboardComponent;
  collectionsAggregatorComponent = CollectionsAggregatorComponent;
  clipboardPopover = false;
  collectionsPopover = false;
  itemsCount = 0;
  selectedItemsCount = 0;
  subTypes: any[] = [];
  documentClipboard: any[] = [];
  document: any | undefined;
  searchPaneOpen = false;
  documentBrowserRouteActive = false;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly documentService: DocumentService,
    private readonly documentsService: DocumentsService,
    private readonly documentClipboardService: DocumentClipboardService,
    private readonly documentTrashService: DocumentTrashService,
    private readonly documentCollectionsService: DocumentCollectionsService,
    private readonly documentSearchService: DocumentSearchService,
    public injector: Injector) 
  {
    this.router.events
      .subscribe(e => 
      {
        if (e instanceof NavigationStart)
        {
          this.collectionsPopover = false;
          this.clipboardPopover = false;
        }
        else if (e instanceof NavigationEnd)
          this.documentBrowserRouteActive = !this.router.url.startsWith('/trash')
      });

    documentService.fetchingDocument$
      .subscribe(x => 
      {
        if (!x)
          return;

        this.itemsCount = 0;
        this.selectedItemsCount = 0;
        this.document = undefined;
      });

    documentService.documentFetched$
      .subscribe(x => 
      {
        this.document = documentService.documentInfo;

        if (!this.document)
          return;

        this.document.canExportAsZip = this.document.contextParameters?.renditions.find((x: any) => x.name === 'zipTreeExport');

        this.subTypes = this.document.contextParameters.subtypes?.map((y: any) => 
        {
          return {
            label: y.type,
            isFolder: y.isFolder,
            canPublish: y.canPublish,
            canWrite: y.canWrite
          };
        }).sort((a: any, b: any) => a.label.localeCompare(b.label));
      });

    documentsService.selectedDocumentsUpdated$
      .subscribe((documents: any) => 
      {
        this.selectedItemsCount = documents.filter((x: any) => x.isSelected).length;
      });

    documentsService.documentsUpdated$
      .subscribe(x => this.itemsCount = x.length);

    documentClipboardService.documentClipboardUpdated$
      .subscribe(x => this.documentClipboard = x);

    documentClipboardService.documentCopied$
      .subscribe(() => this.clipboardPopover = false);

    documentClipboardService.documentMoved$
      .subscribe(() => this.clipboardPopover = false);

    documentCollectionsService.documentAddedToCollection$
      .subscribe(() => this.collectionsPopover = false);

    merge(documentSearchService.searchPaneVisibilityChanged$,
      documentSearchService.globalSearchChanged$
    )
      .subscribe(x => this.searchPaneOpen = x && documentSearchService.globalSearch);
  }

  // --------------------------------------------------------------------------------------------------
  toggleSelectAll = () =>
    this.documentsService.documents.filter((x: any) => x.isSelected).length !==
      this.documentsService.documents.length
      ? this.documentsService.selectAll()
      : this.documentsService.clearSelection();

  // --------------------------------------------------------------------------------------------------
  selectAll = () => this.documentsService.selectAll();

  // --------------------------------------------------------------------------------------------------
  deselectAll = () => this.documentsService.clearSelection();

  // --------------------------------------------------------------------------------------------------
  invertSelection = () => this.documentsService.invertSelection();

  // --------------------------------------------------------------------------------------------------
  addSelectedDocumentsToCollection()
  {
    const documents = this.document.isFolder
      ? this.documentsService.documents.filter(x => x.isSelected)
      : [this.document];

    this.injector = Injector.create({
      providers: [{ provide: 'documents', useValue: [...documents] }],
      parent: this.injector
    });
  }

  // --------------------------------------------------------------------------------------------------
  clearClipboard = () => this.documentClipboardService.clearClipboard()

  // --------------------------------------------------------------------------------------------------
  deleteSelectedDocuments()
  {
    const documents = this.selectedItemsCount
      ? this.documentsService.documents.filter(x => x.isSelected)
      : [this.document];

    forkJoin(
      documents.map((x => this.documentTrashService.moveDocumentToTrash(x.uid)))
    )
      .subscribe(() => 
      {
        if (this.selectedItemsCount)
          this.documentsService.removeSelectedDocuments();
        else
          this.documentsService.removeDocument(this.document);
      });
  }

  // --------------------------------------------------------------------------------------------------
  addSelectedDocumentsToClipboard()
  {
    const documents = this.selectedItemsCount
      ? this.documentsService.documents.filter(x => x.isSelected)
      : [this.document];

    this.documentClipboardService.addToClipboard(documents);
  }

  // --------------------------------------------------------------------------------------------------
  renderDocument(documentUid: string, renditionUrl: string)
  {

  }

  // --------------------------------------------------------------------------------------------------
  takeDocumentOutOfTrash(documentUid: string)
  {

  }

  // --------------------------------------------------------------------------------------------------
  purgeDocument(documentUid: string)
  {

  }
}
