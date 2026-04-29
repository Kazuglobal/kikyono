import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-intro-animation',
  templateUrl: './intro-animation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IntroAnimationComponent implements OnInit, OnDestroy {
  readonly animationFinished = output<void>();
  readonly phase = signal<'brand' | 'accent' | 'out'>('brand');
  readonly isVisible = signal(true);

  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.timers.push(
      setTimeout(() => this.phase.set('accent'), 1400),
      setTimeout(() => this.phase.set('out'), 2200),
      setTimeout(() => {
        this.isVisible.set(false);
        this.animationFinished.emit();
      }, 2650),
    );
  }

  ngOnDestroy(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
  }
}
