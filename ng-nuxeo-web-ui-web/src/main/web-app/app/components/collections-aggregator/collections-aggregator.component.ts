import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentCollectionsService } from 'app/helpers/document-collections.service';
import { animations } from 'app/shared.constants';
import { catchError, first, forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'nx-collections-aggregator',
  templateUrl: './collections-aggregator.component.html',
  styleUrls: ['./collections-aggregator.component.scss'],
  animations: [animations.horizontalInOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class CollectionsAggregatorComponent implements OnInit
{
  documentCollections: any[] = [];
  isFolder = false;
  loadingCollections = true;
  form?: FormGroup | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(@Inject('documents') public documents: any[],
    private readonly fb: FormBuilder,
    private readonly documentCollectionsService: DocumentCollectionsService) 
  {
    documentCollectionsService.getAllCollections()
      .pipe(
        first(),
        catchError((error: any) => 
        {
          this.loadingCollections = false;

          return of(error);
        })
      )
      .subscribe(x => 
      {
        this.documentCollections = x;

        this.loadingCollections = false;
      });

    this.form = this.fb.group(
      {
        title: [null, [Validators.required, Validators.minLength(2)]]
      });
  }

  // --------------------------------------------------------------------------------------------------
  addToCollection(collection?: any)
  {
    (collection
      ? of(collection.uid)
      : this.documentCollectionsService.createCollection(this.form?.get('title')?.value).pipe(map((x: any) => x.uid))
    )
      .pipe(
        switchMap((collectionUid: string) => 
        {
          const httpCalls: Observable<any>[] = [];

          for (const document of this.documents) 
          {
            if (collection?.type === 'Favorites')
              httpCalls.push(this.documentCollectionsService.toggleFavoriteDocument(document.uid, true));
            else
              httpCalls.push(this.documentCollectionsService.addToCollection(document.uid, collectionUid));
          }

          return forkJoin(httpCalls);
        })
      )
      .subscribe();
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
  }
}
