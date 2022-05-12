import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate
{
  constructor(private readonly router: Router, private readonly tokenService: TokenService) { }

  // ----------------------------------------------------------------------------------------------------------------
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
  {
    if (route.queryParams['code'])
      return true;

    if (this.tokenService.isAccessTokenValid)
      return true;

    sessionStorage.setItem('redirectUrl', state.url);

    return false;
  }
}
