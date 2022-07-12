import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from 'app/helpers/auth.service';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { DocumentInfoComponent } from '../document-info/document-info.component';
import { DocumentEntriesService } from 'app/helpers/document-entries.service';
import { DocumentService } from 'app/helpers/document.service';
import { DocumentHistoryService } from 'app/helpers/document-history.service';
import { filter, merge } from 'rxjs';
import { DocumentTrashService } from 'app/helpers/document-trash.service';
import { HistoryComponent } from '../history/history.component';
import { CollectionsComponent } from '../collections/collections.component';
import { DisplaySettingsComponent } from '../display-settings/display-settings.component';
import { DocumentSearchService } from 'app/helpers/document-search.service';
import { animations } from 'app/shared.constants';

@Component({
  selector: 'nx-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
  animations: [animations.horizontalInOutAnimation, animations.itemsAnimation, animations.listAnimation]
})
export class NavigationBarComponent implements OnInit
{
  historyComponent = HistoryComponent;
  collectionsComponent = CollectionsComponent;
  displaySettingsComponent = DisplaySettingsComponent;
  collectionsPopover = false;
  displaySettingsPopover = false;
  historyPopover = false;
  isAuthenticated = false;
  breadcrumbs: any[] = [];
  showDetails = false;
  isFolder = false;
  documentHistory: any[] = [];
  uid: string | null = null;
  mainRoute = false;
  searchPaneOpen = false;

  private bsModalRef?: BsModalRef;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modalService: BsModalService,
    private readonly documentEntriesService: DocumentEntriesService,
    private readonly documentService: DocumentService,
    private readonly documentHistoryService: DocumentHistoryService,
    private readonly documentTrashService: DocumentTrashService,
    private readonly documentSearchService: DocumentSearchService)
  {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
      )
      .subscribe(() => this.mainRoute = !this.router.url.startsWith('/trash'))

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationStart),
      )
      .subscribe(() => 
      {
        this.collectionsPopover = false;
        this.historyPopover = false;
      })

    this.authService.userInfoUpdated$.subscribe(userInfo => this.isAuthenticated = !!userInfo);

    documentService.documentFetched$
      .subscribe(uid => 
      {
        this.uid = uid;

        this.isFolder = documentService.documentInfo?.isFolder;

        this.breadcrumbs = documentService.documentInfo?.contextParameters.breadcrumb.entries
          .map((x: any) => ({
            title: x.title,
            uid: x.uid
          }));
      });

    this.documentHistoryService.documentHistoryUpdated$
      .subscribe(x => 
      {
        this.documentHistory = x;

        this.historyPopover = false;
      });

    documentEntriesService.displayModeChanged$
      .subscribe(x => this.displaySettingsPopover = false);

    merge(
      documentSearchService.searchPaneVisibilityChanged$,
      documentSearchService.globalSearchChanged$
    )
      .subscribe(x => this.searchPaneOpen = x && documentSearchService.globalSearch);
  }

  // --------------------------------------------------------------------------------------------------
  showDocumentInfo()
  {
    const initialState: ModalOptions = {
      initialState: {
        title: 'Modal with component'
      }
    };
    this.bsModalRef = this.modalService.show(DocumentInfoComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  // --------------------------------------------------------------------------------------------------
  clearHistory()
  {
    this.documentHistoryService.clear();
    this.historyPopover = false;
  }

  // --------------------------------------------------------------------------------------------------
  showCollections()
  {
    this.collectionsPopover = true;
  }

  // --------------------------------------------------------------------------------------------------
  hideCollections = () => this.collectionsPopover = false;

  // --------------------------------------------------------------------------------------------------
  showHistory()
  {
    this.historyPopover = !this.historyPopover;
  }

  // --------------------------------------------------------------------------------------------------
  ngOnInit(): void
  {
  }
}
