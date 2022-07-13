import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TokenService } from 'app/helpers/token.service';
import { catchError, map, Observable, of } from 'rxjs';

// Gets image as blob and creates an object url of that blob that can be used in the src attribute
// Usage: <img [attr.src]="'image_url' | secure | async" />
@Pipe({
  name: 'secure'
})
export class SecurePipe implements PipeTransform
{
  // --------------------------------------------------------------------------------------------------
  constructor(private readonly httpClient: HttpClient,
    private readonly tokenService: TokenService,
    private readonly sanitizer: DomSanitizer) { }

  // --------------------------------------------------------------------------------------------------
  transform(url: string): Observable<SafeUrl>
  {
    return this.httpClient
      .get(url, { responseType: 'blob' })
      .pipe(
        catchError(() => of('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==')),
        map(x => typeof x === 'string'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(x)
          : this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(x))
        )
      )
  }
}
