import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService 
{
  readonly tokenUpdated$ = new ReplaySubject<string | null>(1);

  // --------------------------------------------------------------------------------------------------
  get accessToken(): string | null
  {
    if (this.isAccessTokenValid)
      return sessionStorage.getItem('accessToken');

    return null;
  }

  // --------------------------------------------------------------------------------------------------
  set accessToken(token: any)
  {
    if (token)
    {
      sessionStorage.setItem('accessToken', token['access_token']);

      let accessTokenValidity = new Date();
      accessTokenValidity.setSeconds(accessTokenValidity.getSeconds() + parseInt(token['expires_in']));
      
      sessionStorage.setItem('accessTokenValidity', accessTokenValidity.toString());
    }
    else
      sessionStorage.clear();

    this.tokenUpdated$.next(token);
  }

  // --------------------------------------------------------------------------------------------------
  get isAccessTokenValid(): boolean
  {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken)
      return false;

    const accessTokenValidity = sessionStorage.getItem('accessTokenValidity');
    if (!accessTokenValidity)
      return false;

    return new Date(accessTokenValidity) > new Date()
  }
}
