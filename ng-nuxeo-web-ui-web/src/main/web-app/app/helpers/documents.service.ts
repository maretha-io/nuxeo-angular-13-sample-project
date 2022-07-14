import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService
{
  private _currentPage: number = 0;
  private _totalCount: number = 0;
  private _documents: any[] = [];
  private _canLoadMore = true;
  private _selectionCount = 0;

  documentsUpdated$ = new Subject<any[]>();
  selectedDocumentsUpdated$ = new Subject();
  canLoadMore = this._canLoadMore;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly documentService: DocumentService) 
  {

  }

  // --------------------------------------------------------------------------------------------------
  set currentPage(currentPage: number)
  {
    this._currentPage = currentPage > 0 ? currentPage : 0;
  }

  // --------------------------------------------------------------------------------------------------
  get currentPage()
  {
    return this._currentPage;
  }

  // --------------------------------------------------------------------------------------------------
  private setTotalCount(totalCount: number)
  {
    this._totalCount = totalCount > 0 ? totalCount : 0;
  }

  // --------------------------------------------------------------------------------------------------
  get totalCount()
  {
    return this._totalCount;
  }

  // --------------------------------------------------------------------------------------------------
  addDocuments(currentPage: number, documents: any[], totalCount: number, canLoadMore: boolean)
  {
    documents.forEach(x => this.setDocumentCommonProperties(x));

    this.currentPage = currentPage;
    this._documents = this.currentPage === 0 ? documents : [...this._documents, ...documents];
    this.setTotalCount(totalCount);
    this._canLoadMore = canLoadMore;

    this.documentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  removeDocument(document: any)
  {
    if (!document)
      return;

    const raiseSelectionChangedEvent = document.isSelected;

    this._documents = this._documents.filter(x => x.uid !== document.uid);

    this.documentsUpdated$.next(this._documents);

    if (raiseSelectionChangedEvent)
    {
      this._selectionCount--;
      this.selectedDocumentsUpdated$.next(this._documents);
    }
  }

  // --------------------------------------------------------------------------------------------------
  removeSelectedDocuments()
  {
    this._documents = this._documents.filter(x => !x.isSelected);

    this._selectionCount = 0;

    this.documentsUpdated$.next(this._documents);
    this.selectedDocumentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  clearDocuments(options?: { emitEvent: boolean } | undefined)
  {
    this.currentPage = 0;
    this._documents = [];
    this.setTotalCount(0);

    if (!options || options.emitEvent)
      this.documentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  get documents()
  {
    return this._documents;
  }

  // --------------------------------------------------------------------------------------------------
  private setDocumentCommonProperties(document: any)
  {
    if (!document)
      return;

    document.isSelected = false;

    this.documentService.setDocumentCustomProperties(document);
  }

  // --------------------------------------------------------------------------------------------------
  toggleSelection(uid: string)
  {
    const document = this._documents.find(x => x.uid === uid);

    if (!document)
      return;

    document.isSelected = !document.isSelected;

    this.selectedDocumentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  selectAll()
  {
    this._documents.forEach(x => x.isSelected = true);

    this._selectionCount = this._documents.length;

    this.selectedDocumentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  invertSelection()
  {
    let selectionCount = 0;

    this._documents.forEach(x => 
    {
      x.isSelected = !x.isSelected;

      if (x.isSelected)
        selectionCount++;
    });

    this._selectionCount = selectionCount;

    this.selectedDocumentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  clearSelection()
  {
    this._documents.forEach(x => x.isSelected = false);

    this._selectionCount = 0;

    this.selectedDocumentsUpdated$.next(this._documents);
  }

  // --------------------------------------------------------------------------------------------------
  get selectionCount()
  {
    return this._selectionCount;
  }
}
