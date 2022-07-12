import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentClipboardService } from 'app/helpers/document-clipboard.service';
import { DocumentEntriesService } from 'app/helpers/document-entries.service';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { DocumentService } from 'app/helpers/document.service';
import { animations } from 'app/shared.constants';

@Component({
  selector: 'nx-clipboard',
  templateUrl: './clipboard.component.html',
  styleUrls: ['./clipboard.component.scss'],
  animations: [animations.itemsAnimation, animations.listAnimation]
})
export class ClipboardComponent implements OnInit
{
  documentClipboard: any[] = [];
  destinationUid: string | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly documentService: DocumentService,
    private readonly documentEntriesService: DocumentEntriesService,
    private readonly documentClipboardService: DocumentClipboardService,
    private readonly documentTrashService: DocumentTrashService) 
  {
    documentService.documentFetched$
      .subscribe(x => 
      {
        this.destinationUid = documentService.documentInfo.uid
      });

    documentClipboardService.documentClipboardUpdated$
      .subscribe(x =>
      {
        x.forEach(y => 
        {
          y.canPaste = documentService.documentInfo.isFolder &&
            !documentEntriesService.entries.find((entry: any) => entry.uid === y.uid) &&
            documentService.documentInfo.contextParameters.subtypes?.find((subType: any) => subType.type === y.type);
        });

        this.documentClipboard = x;
      });

    documentTrashService.documentMovedToTrash$
      .subscribe(uid => this.documentClipboardService.removeFromClipboard(uid));
  }

  // --------------------------------------------------------------------------------------------------
  copy(source: any)
  {
    if (!source || !this.destinationUid || this.documentEntriesService.entries.some((x: any) => x.uid === source.uid))
      return;

    this.documentClipboardService.copyTo(source.uid, this.destinationUid)
      .subscribe(() => this.documentEntriesService.addEntries([source]));
  }

  // --------------------------------------------------------------------------------------------------
  move(source: any)
  {
    if (!source || !this.destinationUid || this.documentEntriesService.entries.some((x: any) => x.uid === source.uid))
      return;

    this.documentClipboardService.moveTo(source.uid, this.destinationUid)
      .subscribe(() => this.documentEntriesService.addEntries([source]));
  }

  // --------------------------------------------------------------------------------------------------
  clearClipboard = () => this.documentClipboardService.clearClipboard();

  // --------------------------------------------------------------------------------------------------
  openDocument(documentUid: string)
  {
    this.router.navigate(['./', documentUid]);
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
  }
}
