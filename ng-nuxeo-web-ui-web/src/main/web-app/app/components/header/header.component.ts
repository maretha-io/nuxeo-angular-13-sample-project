import { Component } from '@angular/core';
import { AuthService } from 'app/helpers/auth.service';
import { NuxeoService } from 'app/helpers/nuxeo.service';

@Component({
  selector: 'nx-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent
{
  isAuthenticated = false;
  menu: Tree = {
    root: {
      uid: '00000000-0000-0000-0000-000000000000',
      label: '',
      children: []
    }
  };

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly authService: AuthService,
    private readonly nuxeoService: NuxeoService)
  {
    this.authService.userInfoUpdated$.subscribe(userInfo =>
    {
      this.isAuthenticated = !!userInfo;

      if (this.isAuthenticated)
        this.buildMenu();
    });
  }

  // --------------------------------------------------------------------------------------------------
  private buildMenu()
  {
    this.nuxeoService.getMenuItems()
      .subscribe((x: any) =>
      {
        // Turn the key-value object into our tree structure
        for (const key of Object.keys(x)) 
        {
          let node: TreeNode | null = this.lookupTreeNode(this.menu.root, x[key].parentUid);

          if (node)
            node.children.push({
              uid: key,
              label: x[key].title,
              children: []
            });
          else
          {
            console.error('uh oh, menu parent node not found!', x[key].parentUid);

            this.menu = {
              root: {
                uid: '00000000-0000-0000-0000-000000000000',
                label: '',
                children: []
              }
            };

            return;
          }
        }
      });
  }

  // --------------------------------------------------------------------------------------------------
  private lookupTreeNode(root: TreeNode, uid: string): TreeNode | null
  {
    const stack = [root];

    while (stack.length)
    {
      const node = stack.pop();

      if (node?.uid === uid)
        return node;
      else if (node?.children.length)
        for (let index = 0; index < node?.children.length; index++)
          stack.push(node.children[index])
    }

    return null;
  }

  // --------------------------------------------------------------------------------------------------
  logOff() 
  {
    this.authService.logOff();
  }
}

export interface Tree
{
  root: TreeNode;
}

export interface TreeNode
{
  uid: string;
  label: string;
  children: TreeNode[];
}