import { trigger, transition, style, animate, animateChild, query, stagger } from "@angular/animations";

export const animations = {
    inOutAnimation: trigger('inOutAnimation',
        [
            transition(
                ':enter',
                [
                    style({ maxWidth: 0, opacity: 0, overflow: 'hidden' }),
                    animate('.4s ease-out',
                        style({ maxWidth: 300, opacity: 1 })
                    )
                ]
            ),
            transition(
                ':leave',
                [
                    style({ maxWidth: 300, opacity: 1, overflow: 'hidden' }),
                    animate('.25s ease-in',
                        style({ maxWidth: 0, opacity: 0 })
                    )
                ]
            )
        ]
    ),
    horizontalInOutAnimation: trigger('horizontalInOutAnimation',
        [
            transition(':enter',
                [
                    style({ maxWidth: 0, opacity: 0, overflow: 'hidden' }),
                    animate('.4s ease-out',
                        style({ maxWidth: 300, opacity: 1 })
                    )
                ]
            ),
            transition(':leave',
                [
                    style({ maxWidth: 300, opacity: 1, overflow: 'hidden' }),
                    animate('.25s ease-in',
                        style({ maxWidth: 0, opacity: 0 })
                    )
                ]
            )
        ]
    ),
    itemsAnimation: trigger('itemsAnimation',
        [
            // transition(':enter', [
            //     style({ transform: 'scale(.5)', opacity: 0, overflow: 'hidden', maxHeight: 0 }),  // initial
            //     animate('.6s cubic-bezier(.8, -.6, .2, 1.5)',
            //         style({ transform: 'scale(1)', opacity: 1, overflow: 'visible', maxHeight: '1000px' }))  // final
            // ]),
            // transition(':leave', [
            //     style({ transform: 'scale(1)', opacity: 1, height: '*' }),  // initial
            //     animate('.6s cubic-bezier(.8, -.6, .2, 1.5)',
            //         style({
            //             transform: 'scale(.5)', opacity: 0,                // final
            //             height: '0px', margin: '0px', padding: '0px',
            //             borderWidth: '0px', overflow: 'hidden'
            //         }))
            // ])
        ]
    ),
    listAnimation: trigger('listAnimation',
        [
            // transition('* => *', [
            //     query('@itemsAnimation', stagger(50, animateChild()), { optional: true })
            // ])
        ]
    )
}