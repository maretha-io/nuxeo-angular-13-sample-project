import { Component } from '@angular/core';
import { DocumentService } from 'app/helpers/document.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'nx-document-info',
  templateUrl: './document-info.component.html',
  styleUrls: ['./document-info.component.scss']
})
export class DocumentInfoComponent
{
  document: any | null;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly bsModalRef: BsModalRef,
    private readonly documentService: DocumentService) 
  {
    this.document = this.documentService.documentInfo;
  }

  // --------------------------------------------------------------------------------------------------
  close()
  {
    this.bsModalRef.hide();
  }
}
