import { Component, OnDestroy } from '@angular/core';
import { distinctUntilChanged, merge, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/helpers/auth.service';
import { DocumentService } from 'app/helpers/document.service';
import { Router } from '@angular/router';
import { animations } from 'app/shared.constants';

@Component({
  selector: 'nx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [animations.inOutAnimation]
})
export class HomeComponent implements OnDestroy
{
  private readonly destroy$ = new Subject();

  userName: string | undefined;
  isFolder = false;
  documentUid: string | null = null;
  loading = false;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly router: Router,
    private readonly authService: AuthService,
    private readonly documentService: DocumentService)
  {
    authService.userInfoUpdated$
      .subscribe(x => this.userName = x?.firstName ? `${x.firstName} {userInfo.lastName}` : x?.userName);

    documentService.documentFetched$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(uid =>
      {
        if (uid)
          this.isFolder = documentService.documentInfo?.isFolder;

        this.documentUid = uid;
      });

    documentService.fetchingDocument$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(x =>
      {
        if (x)
          this.loading = true;
      });

    documentService.documentFetched$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(() => this.loading = false);
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy(): void
  {
    this.destroy$.next(0);
  }
}
