import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './helpers/auth.service';
import { DocumentSearchService } from './helpers/document-search.service';

@Component({
  selector: 'nx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
{
  searchPaneOpen = false;

  constructor(private readonly authService: AuthService,
    readonly translate: TranslateService,
    private readonly documentSearchService: DocumentSearchService)
  {
    this.configureLocale();

    documentSearchService.searchPaneVisibilityChanged$
      .subscribe(x => this.searchPaneOpen = x);
  }

  // --------------------------------------------------------------------------------------------------
  private configureLocale()
  {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang(localStorage.getItem('lang') || 'en-US');

    this.translate.onLangChange.subscribe(x => localStorage.setItem('lang', x.lang));
  }
}
