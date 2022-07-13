import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { catchError, mergeMap, Observable, of, skipWhile, switchMap, tap, throwError } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor
{
  private readonly allowedUrls = {
    [`${environment.nuxeoUrl}/api/v1/me/`]: true,
    [`${environment.nuxeoUrl}/oauth2/token`]: true,
  };

  constructor(private readonly tokenService: TokenService,
    private readonly route: ActivatedRoute) { }

  // --------------------------------------------------------------------------------------------------
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
    if (this.allowedUrls[req.url] || this.tokenService.accessToken)
      return this.request(req.clone({
        headers: req.headers.set('Authorization', `Bearer ${this.tokenService.accessToken}`)
      }), next);

    return this.tokenService.tokenUpdated$
      .pipe(
        skipWhile(token => !token),
        mergeMap(() => this.request(req.clone({
          headers: req.headers.set('Authorization', `Bearer ${this.tokenService.accessToken}`)
        }), next))
      )
  }

  // --------------------------------------------------------------------------------------------------
  private request(req: HttpRequest<any>, next: HttpHandler)
  {
    return next.handle(req)
      .pipe(
        catchError(err =>
        {
          if (err instanceof HttpErrorResponse && err.status === 401)
            this.logIn();

          // Return the error back to the caller
          return throwError(() => new Error(err));
        })
      );
  }

  // --------------------------------------------------------------------------------------------------
  private logIn()
  {
    this.tokenService.accessToken = null;

    const params = {
      client_id: environment.authClientId,
      response_type: 'code',
      redirect_uri: environment.webAppUrl,
      state: encodeURI(new URL(document.getElementsByTagName('base')[0].href).pathname !== location.pathname ? location.pathname : '/')
    };

    location.href = `${environment.nuxeoUrl}/oauth2/authorize?${new URLSearchParams(params)}`;
  }
}
