import { ChangeDetectionStrategy, Component, OnInit, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-intro-animation',
  templateUrl: './intro-animation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IntroAnimationComponent implements OnInit {
  animationFinished = output<void>();

  animationState = signal<'logo' | 'images' | 'done'>('logo');
  activeImageIndex = signal(0);
  isComponentVisible = signal(true);

  images = signal([
    'https://picsum.photos/seed/bball1/1920/1080',
    'https://picsum.photos/seed/bball2/1920/1080',
    'https://picsum.photos/seed/bball3/1920/1080',
    'https://picsum.photos/seed/bball4/1920/1080',
    'https://picsum.photos/seed/bball5/1920/1080',
    'https://picsum.photos/seed/bball6/1920/1080',
    'https://picsum.photos/seed/bball7/1920/1080',
    'https://picsum.photos/seed/bball8/1920/1080',
  ]);

  ngOnInit(): void {
    setTimeout(() => {
      this.animationState.set('images');
      this.startImageLoop();
    }, 2800);
  }

  startImageLoop(): void {
    const imageInterval = 300;
    const totalImages = this.images().length;

    const intervalId = setInterval(() => {
      this.activeImageIndex.update(index => {
        if (index < totalImages - 1) {
          return index + 1;
        } else {
          clearInterval(intervalId);
          this.endAnimation();
          return index;
        }
      });
    }, imageInterval);
  }

  endAnimation(): void {
    setTimeout(() => {
      this.animationState.set('done');
      this.isComponentVisible.set(false);
      
      setTimeout(() => {
        this.animationFinished.emit();
      }, 500); 
    }, 300);
  }
}