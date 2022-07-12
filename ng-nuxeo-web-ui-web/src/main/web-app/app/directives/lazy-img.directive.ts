import { Directive, AfterViewInit, HostBinding, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';

@Directive({
  selector: '[nxLazyImg]'
})
export class LazyImgDirective implements AfterViewInit
{
  @HostBinding('attr.src')
  srcAttr: string | undefined;

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
  constructor(private readonly el: ElementRef)
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

    this.srcAttr = this.src;

    this.didLoadMedia.emit();
  }

  //---------------------------------------------------------------------------------------
  ngAfterViewInit()
  {
    this.el.nativeElement.onerror = () => 
    {
      this.srcAttr = `https://via.placeholder.com/50/CFCFCF/333$?text=${this.altAttr || 'Image+Not+Found'}`;

      this.loadError.emit();
    }

    this.canLazyLoad ? this.lazyLoadImage() : this.loadImage();
  }
}