import { Directive, ElementRef, Renderer2, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

@Directive({
  selector: '[nxClickOutside]'
})
export class ClickOutsideDirective implements OnChanges, OnDestroy
{
  @Input() nxClickOutside: any;

  @Input() nxClickOutsideActive: boolean = false;

  @Input() nxClickOutsidePreventActivation: boolean = false;

  @Input() nxClickOutsideExludeSelector: string | undefined;

  private removeListener: (() => void) | undefined;

  // --------------------------------------------------------------------------------------------------
  constructor(private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2)
  {
  }

  // --------------------------------------------------------------------------------------------------
  private elementContains(parent: any, target: any): boolean
  {
    let result = false;

    if (!parent)
      return result;

    for (let i = 0; i < parent.childNodes.length; i++)
    {
      const child = parent.childNodes[i];

      if (child === target)
        return true;

      if (parent.childNodes.length)
        result = result || this.elementContains(child, target);

      if (result)
        break;
    }

    return result;
  }

  // --------------------------------------------------------------------------------------------------
  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['nxClickOutsideActive']?.currentValue)
    {
      setTimeout(() =>
      {
        this.removeListener = this.renderer.listen('window', 'click', (e: PointerEvent) =>
        {
          if (this.nxClickOutsidePreventActivation ||
            !this.nxClickOutside || !(this.nxClickOutside instanceof Function))
            return;

          if (this.elementRef.nativeElement !== e.target &&
            !this.elementContains(this.elementRef.nativeElement, e.target) &&
            (!this.nxClickOutsideExludeSelector ||
              !this.elementContains(document.querySelector(this.nxClickOutsideExludeSelector), e.target))
          )
            this.nxClickOutside();
        });
      }); // We need a small delay to avoid reacting too fast
    }
    else
    {
      if (this.removeListener)
        this.removeListener();
    }
  }

  // --------------------------------------------------------------------------------------------------
  ngOnDestroy()
  {
    if (this.removeListener)
      this.removeListener();
  }
}
