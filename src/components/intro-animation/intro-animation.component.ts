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
    'assets/images/intro-team-1.jpg', // 円陣を組んでいる少年野球チーム
    'assets/images/intro-team-2.jpg', // トロフィーと賞状を持った集合写真
    'assets/images/intro-team-3.jpg', // 一列に並んだ少年たち
    'assets/images/intro-team-4.jpg', // 後ろ姿の整列（黄色い壁の前）
    'assets/images/intro-team-5.jpg', // 屋外の集合写真（コーチ中心）
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