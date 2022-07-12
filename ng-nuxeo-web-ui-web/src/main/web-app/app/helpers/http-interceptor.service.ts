import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor
{
  constructor(private readonly tokenService: TokenService) { }

  // --------------------------------------------------------------------------------------------------
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${this.tokenService.accessToken}`)
    });

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
  logIn()
  {
    const params = {
      client_id: environment.authClientId,
      response_type: 'code',
      redirect_uri: environment.webAppUrl,
      state: encodeURI(new URL(document.getElementsByTagName('base')[0].href).pathname !== location.pathname ? location.pathname : '/')
    };

    location.href = `${environment.nuxeoUrl}/oauth2/authorize?${new URLSearchParams(params)}`;
  }
}
