import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'nx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent
{
  languages: any[] = [
    // {
    //   key: 'ro-RO',
    //   label: 'Română'
    // },
    {
      key: 'en-US',
      label: 'English',
      tooltip: 'English'
    },
    {
      key: 'ar-SA',
      label: 'عربي',
      tooltip: 'Arabic'
    }
  ];
  currentLanguage = localStorage.getItem('lang') || 'en-US';

  // --------------------------------------------------------------------------------------------------
  constructor(readonly translate: TranslateService)
  {
    this.translate.onLangChange.subscribe(x => this.currentLanguage = x.lang);
  }

  // --------------------------------------------------------------------------------------------------
  changeLanguage(language: string)
  {
    this.translate.use(language || 'en-US');
  }
}
