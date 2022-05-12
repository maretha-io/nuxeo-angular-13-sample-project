import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserInfo } from 'app/models/user-info';
import { environment } from 'environments/environment';
import { Subject, filter } from 'rxjs';
import { NuxeoService } from './nuxeo.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService
{
  private readonly authUrl = `${environment.nuxeoUrl}/oauth2`;

  readonly userInfoUpdated$ = new Subject<UserInfo | null>();

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly httpClient: HttpClient,
    private readonly tokenService: TokenService,
    private readonly nuxeoService: NuxeoService)
  {
    if (tokenService.isAccessTokenValid)
    {
      this.nuxeoService.getUserInfo().subscribe(x => this.userInfoUpdated$.next(x));

      return;
    }

    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd)
      )
      .subscribe(() =>
      {
        if (tokenService.isAccessTokenValid)
          return;

        let route = this.activatedRoute.firstChild;
        while (route?.firstChild)
          route = route.firstChild;

        if (route?.snapshot.queryParams['code'])
          this.getAccessToken(route.snapshot.queryParams['code'], route.snapshot.queryParams['state']);
        else
          this.logIn();
      });
  }

  // --------------------------------------------------------------------------------------------------
  logOff()
  {
    // Create a hidden IFrame
    const iframe = document.createElement('iframe');

    iframe.style.display = 'none';

    // And point it to the /logout endpoint
    iframe.src = `${environment.nuxeoUrl}/logout`;

    iframe.setAttribute('sandbox', '');

    // Allowing us to tap into its "onload" event
    iframe.onload = () => 
    {
      this.tokenService.accessToken = null;

      this.logIn();
    }

    document.body.appendChild(iframe);
  }

  // --------------------------------------------------------------------------------------------------
  private logIn()
  {
    const params = {
      client_id: environment.authClientId,
      response_type: 'code',
      redirect_uri: environment.webAppUrl,
      state: encodeURI(new URL(document.getElementsByTagName('base')[0].href).pathname !== location.pathname ? location.pathname : '/')
    };

    location.href = `${this.authUrl}/authorize?${new URLSearchParams(params)}`;
  }

  // --------------------------------------------------------------------------------------------------
  private getAccessToken(code: string, previousUrl: string | null = null)
  {
    const payload = new HttpParams({
      fromObject: {
        grant_type: 'authorization_code',
        code,
        client_id: environment.authClientId,
        redirect_uri: environment.webAppUrl
      }
    });

    const headers = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*'
      })
    };

      this.getToken(payload, headers, previousUrl || '/');
    }

  // --------------------------------------------------------------------------------------------------
  private getRefreshToken()
  {
    const token = sessionStorage.getItem('refreshToken');

    if (!token)
      return this.logOff();

    const payload = new HttpParams({
      fromObject: {
        grant_type: 'refresh_token',
        refresh_token: token,
        client_id: environment.authClientId
      }
    });

    const headers = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*'
      })
    };

    this.getToken(payload, headers);
  }

  // --------------------------------------------------------------------------------------------------
  getToken(payload: HttpParams, headers: {}, previousUrl: string | null = null)
  {
    this.httpClient.post(`${this.authUrl}/token`, payload, headers)
      .subscribe((result: any) =>
      {
        this.tokenService.accessToken = result;

        this.nuxeoService.getUserInfo().subscribe(x => this.userInfoUpdated$.next(x));

        if (result.refresh_token)
        {
          sessionStorage.setItem('refreshToken', result.refresh_token);

          setTimeout(() => this.getRefreshToken(), result.expires_in * 1000);
        }

        if (previousUrl)
          this.router.navigateByUrl(previousUrl);
      });
  }
}
