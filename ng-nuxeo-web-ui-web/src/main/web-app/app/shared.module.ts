import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

// https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/upgrading/0.4.0-0.5.0.md
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fab, faFacebookSquare, faFacebookMessenger, faWhatsapp, faFirstdraft } from '@fortawesome/free-brands-svg-icons';
import { fas, faHomeAlt, faFolderClosed, faRecycle, faSearch, faFolderBlank, faCircleInfo, faSliders, 
          faBookmark, faBookBookmark, faClockRotateLeft, faPencil, faListCheck, faCopy, faClipboard, faPaste,
          faFileArrowUp, faEraser, faTrash, faCircleMinus, faArrowRotateLeft, faFileZipper, faSpinner,
          faPrint, faEnvelope, faTable, faBorderAll, faList, faEllipsisH, faCirclePlus, faScissors,
          faFile, faFolder, faSave, faFileExport, faCheckDouble, faArrowDownShortWide, faArrowDownWideShort, 
          faCalendarAlt, faExclamation, faEnvelopesBulk, faArrowRightFromBracket, faUserGear, faGear, faTrashArrowUp
        } from '@fortawesome/free-solid-svg-icons';
import { far, faStar } from '@fortawesome/free-regular-svg-icons';
import { HttpInterceptorService } from './helpers/http-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    TranslateModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    TranslateModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }    
  ]
})
export class SharedModule {
  constructor(library: FaIconLibrary)
  {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas, far, fab);

    library.addIcons(
      faHomeAlt, faFolderClosed, faRecycle, faSearch, faFolderBlank, faBookmark, faBookBookmark,
      faClockRotateLeft, faSliders, faPencil, faListCheck, faCopy, faClipboard, faPaste, faFileArrowUp,
      faEraser, faTrash, faCircleMinus, faArrowRotateLeft, faFileZipper, faSpinner, faPrint, faEnvelope,
      faTable, faBorderAll, faList, faEllipsisH, faCirclePlus, faScissors, faFile, faFolder, faSave,
      faCircleInfo, faFacebookSquare, faFacebookMessenger, faWhatsapp, faFirstdraft, faStar, faFileExport, 
      faCheckDouble, faArrowDownShortWide, faArrowDownWideShort, faCalendarAlt, faExclamation,
      faEnvelopesBulk, faArrowRightFromBracket, faUserGear, faGear, faTrashArrowUp
    );
  }
 }
