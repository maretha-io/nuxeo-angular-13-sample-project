import { Component, HostBinding } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'app/helpers/auth.service';
import { DocumentSearchService } from 'app/helpers/document-search.service';
import { TreeNode } from 'app/helpers/domain-manager.service';
import { animations } from 'app/shared.constants';
import { filter } from 'rxjs';
import { SearchComponent } from '../search-pane/search-pane.component';

@Component({
  selector: 'nx-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [animations.inOutAnimation]
})
export class HeaderComponent
{
  searchComponent = SearchComponent;
  userInfo: any | undefined;
  // root: TreeNode | undefined;
  notFoundRouteActive = false;

  @HostBinding('class.search-box-open') searchPane = false;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService,
    private readonly router: Router,
    private readonly documentSearchService: DocumentSearchService)
  {
    documentSearchService.searchPaneVisibilityChanged$
      .subscribe(x => this.searchPane = x);

    this.authService.userInfoUpdated$.subscribe(userInfo => this.userInfo = userInfo);

    this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd),
      // takeWhile(() => this.searchPane = true)
    )
    .subscribe((e: any) => 
    {
      // this.searchPane = false;
      this.notFoundRouteActive = e.url === '/not-found';
    })
  }

  // --------------------------------------------------------------------------------------------------
  toggleSearchPaneVisibility = () => this.documentSearchService.toggleSearchPaneVisibility();

  // // --------------------------------------------------------------------------------------------------
  // openPage(root: TreeNode, node: TreeNode)
  // {
  //   if (root)
  //     root.open = false;

  //   if (node.path)
  //     this.router.navigate([node.path]);
  // }

  // --------------------------------------------------------------------------------------------------
  logOff() 
  {
    this.authService.logOff();
  }
}
