import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { catchError, Observable, skipWhile, switchMap } from 'rxjs';
import { from } from 'rxjs';

export class WebpackTranslateLoaderService implements TranslateLoader
{
  private readonly moduleName?: string;

  constructor(private readonly httpClient: HttpClient,
    moduleName?: string)
  {
    this.moduleName = moduleName;
  }

  getTranslation(lang: string): Observable<any>
  {
    // const moduleName = this.moduleName ? `/${this.moduleName}` : '';
    // return from(import(`../../assets/i18n${moduleName}/${lang}.json`));

    const url = `${environment.nuxeoUrl}/ui/i18n/messages-${lang}.json`;
    const fallbackUrl = `${environment.nuxeoUrl}/ui/i18n/messages.json`;

    return this.httpClient.get(url)
    .pipe(
      catchError(() => this.httpClient.get(fallbackUrl))
    );
  }
}
