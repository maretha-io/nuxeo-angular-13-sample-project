import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[nxDynamic]'
})
export class DynamicDirective
{
  constructor(public viewContainerRef: ViewContainerRef) { }
}
