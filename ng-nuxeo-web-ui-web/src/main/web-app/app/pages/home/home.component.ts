import { Component } from '@angular/core';
import { AuthService } from 'app/helpers/auth.service';

@Component({
  selector: 'nx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent
{
  userName: string | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService)
  {
    authService.userInfoUpdated$.subscribe(userInfo => 
    {
      this.userName = userInfo?.firstName ? `${userInfo.firstName} {userInfo.lastName}` : userInfo?.userName;
    });
  }
}
