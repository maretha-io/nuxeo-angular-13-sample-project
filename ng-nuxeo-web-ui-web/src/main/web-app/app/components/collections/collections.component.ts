import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentCollectionsService } from 'app/helpers/document-collections.service';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { DocumentService } from 'app/helpers/document.service';
import { animations } from 'app/shared.constants';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'nx-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  animations: [animations.horizontalInOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class CollectionsComponent implements OnDestroy
{
  loadingCollections = true;
  documentCollections: any[] = [];
  uid: string | null = null;

  private destroy$ = new Subject();
  private showCollectionsDebouncer$ = new Subject();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly documentCollectionsService: DocumentCollectionsService,
    private readonly documentTrashService: DocumentTrashService,
    private readonly documentService: DocumentService)
  {
    documentTrashService.documentMovedToTrash$
      .pipe(
        switchMap(uid => this.documentCollectionsService.removeFromAllCollections(uid)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    documentService.documentFetched$
      .pipe(takeUntil(this.destroy$))
      .subscribe(uid => this.uid = uid);

    // // Make sure we don't call the server too often if the user presses the button many times in a small time frame
    // this.showCollectionsDebouncer$
    //   .pipe(
    //     throttleTime(1000)
    //   )
    //   .subscribe(() => 
    //   {
    //     this.loadingCollections = true;

    //     this.getAllCollection();
    //   });

    this.getAllCollection();
  }

  // --------------------------------------------------------------------------------------------------
  openDocument(documentUid: string)
  {
    this.router.navigate(['./', documentUid]);
  }

  // --------------------------------------------------------------------------------------------------
  clearCollection(collectionUid: string)
  {
    const index = this.documentCollections.findIndex(x => x.uid === collectionUid);
    if (index < 0)
      return;

    forkJoin(
      this.documentCollections[index].documents.map((document: any) =>
        this.documentCollectionsService.removeFromCollection(document.uid, collectionUid)
      ))
      .subscribe(() => this.documentCollections[index].documents = []);
  }

  // --------------------------------------------------------------------------------------------------
  removeFromCollection(documentUid: string, collectionUid: string)
  {
    const index = this.documentCollections.findIndex(x => x.uid === collectionUid);
    if (index < 0)
      return;

    this.documentCollectionsService.removeFromCollection(documentUid, collectionUid)
      .subscribe(() => 
      {
        this.documentCollections[index].documents =
          this.documentCollections[index].documents.filter((x: any) => x.uid !== documentUid)
      });
  }

  // --------------------------------------------------------------------------------------------------
  private getAllCollection()
  {
    this.documentCollectionsService.getAllCollections()
      .pipe(
        catchError(() => 
        {
          this.loadingCollections = false;

          return of([]);
        })
      )
      .subscribe(x => 
      {
        this.loadingCollections = false;

        x.forEach((collection: any) =>
          collection.documents?.forEach((document: any) => document.isFolder = document.facets.includes('Folderish'))
        );

        this.documentCollections = x;
      });
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
