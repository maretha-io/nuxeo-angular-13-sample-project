import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

// https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/upgrading/0.4.0-0.5.0.md
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fab, faFacebookSquare, faFacebookMessenger, faWhatsapp, faFirstdraft } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
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
    library.addIconPacks(fas, fab);

    library.addIcons(
      faFacebookSquare, faFacebookMessenger, faWhatsapp, faFirstdraft
    );
  }
 }
