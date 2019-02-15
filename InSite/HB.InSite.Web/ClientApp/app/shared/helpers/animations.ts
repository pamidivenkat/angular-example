import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";

export const accordionAnimation = trigger("fade", [
  state("void", style({ height: 0, opacity: 0 })),
  transition("void => *", [animate(".2s ease-in")]),

  transition("* => void", [animate(".2s ease-out")])
]);
