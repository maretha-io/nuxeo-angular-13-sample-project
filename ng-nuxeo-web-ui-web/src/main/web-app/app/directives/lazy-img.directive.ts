import { HttpClient } from '@angular/common/http';
import { Directive, AfterViewInit, HostBinding, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { url } from 'inspector';
import { of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

@Directive({
  selector: '[nxLazyImg]'
})
export class LazyImgDirective implements AfterViewInit
{
  @HostBinding('attr.src')
  srcAttr: SafeResourceUrl | undefined;

  @HostBinding('attr.alt')
  altAttr: string | undefined;

  @Input()
  src: string | undefined;

  @Output()
  willLoadMedia = new EventEmitter();

  @Output()
  didLoadMedia = new EventEmitter();

  @Output()
  loadError = new EventEmitter();

  //---------------------------------------------------------------------------------------
  constructor(private readonly el: ElementRef,
    private readonly httpClient: HttpClient,
    private readonly sanitizer: DomSanitizer)
  {
  }

  //---------------------------------------------------------------------------------------
  private get canLazyLoad()
  {
    return window && 'IntersectionObserver' in window;
  }

  //---------------------------------------------------------------------------------------
  private lazyLoadImage()
  {
    const obs = new IntersectionObserver(entries =>
    {
      entries.forEach(({ isIntersecting }) =>
      {
        if (isIntersecting)
        {
          this.loadImage();
          obs.unobserve(this.el.nativeElement);
        }
      });
    });

    obs.observe(this.el.nativeElement);
  }

  //---------------------------------------------------------------------------------------
  private loadImage()
  {
    if (!this.src) return;

    //if (this.el.nativeElement.onloadedmetadata)
    //	this.el.nativeElement.onloadedmetadata(x => console.log(x, this.el));

    this.willLoadMedia.emit();

    this.httpClient
      .get(this.src, { responseType: 'blob' })
      .pipe(
        catchError(() => of('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==')),
        map(x => typeof x === 'string'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(x)
          : this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(x))
        )
      )
      .subscribe(x => this.srcAttr = x);

    this.didLoadMedia.emit();
  }

  //---------------------------------------------------------------------------------------
  ngAfterViewInit()
  {
    this.el.nativeElement.onerror = () => 
    {
      this.srcAttr = `https://via.placeholder.com/50/CFCFCF/333$?text=${this.altAttr || 'Not+Found'}`;

      this.loadError.emit();
    }

    this.canLazyLoad ? this.lazyLoadImage() : this.loadImage();
  }
}
