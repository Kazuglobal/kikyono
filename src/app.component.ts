import { ChangeDetectionStrategy, Component, signal, OnInit, inject, computed, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { IntroAnimationComponent } from './components/intro-animation/intro-animation.component';

interface Achievement {
  title: string;
  result: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

interface TeamValue {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, IntroAnimationComponent, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  showIntro = signal(true);
  private fb = inject(FormBuilder);
  contactForm!: FormGroup;
  formStatus = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  heroBgTransform = signal('translateY(0)');

  heroTitleLetters = signal('KIKYONO VIOLETS'.split(''));
  
  // Hero image paths - optimized for different screen sizes
  // Using absolute paths that work with Angular dev server
  heroImagePaths = {
    mobile: 'assets/images/hero-team-mobile.jpg', // 640px width
    tablet: 'assets/images/hero-team-desktop.jpg', // 1024px width (using desktop image)
    desktop: 'assets/images/hero-team-desktop.jpg', // 1920px width
    fallback: 'assets/images/hero-team.jpg' // Fallback image
  };
  
  activeSectionId = signal<string>('');
  private observer?: IntersectionObserver;

  onWindowScroll(): void {
    // Disable parallax effect to keep image fully visible
    // Parallax can cause image to move out of view
    // this.heroBgTransform.set(`translateY(0)`);
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }
  
  ngAfterViewInit(): void {
    const options = {
      rootMargin: '0px 0px -70% 0px', // Highlights when section is in upper 30% of viewport
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSectionId.set(entry.target.id);
        }
      });
    }, options);

    const sections = document.querySelectorAll('main section[id]');
    sections.forEach(section => this.observer!.observe(section));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.formStatus.set('submitting');

    // Google Apps Script のウェブアプリURL
    // TODO: Google Apps Scriptをデプロイ後、このURLを更新してください
    const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzRvp_PuGr-AfuL2boqq5sqfbzSXgOCnWHJ6mhLl30kuim-P27ujbd06lLEi0w-1yJlqg/exec';

    // フォームデータを準備
    const formData = this.contactForm.value;

    // Google Apps Script にPOSTリクエスト送信
    fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script用
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      // no-corsモードでは詳細なレスポンスが取得できないため、成功と見なす
      this.formStatus.set('success');
      this.contactForm.reset();
    })
    .catch((error) => {
      console.error('送信エラー:', error);
      this.formStatus.set('error');
    });
  }

  achievements = signal<Achievement[]>([
    { title: 'スポ少大会', result: '【県大会出場】' },
    { title: '県少年大会', result: '【八戸市ベスト８】' },
    { title: '市川地区親善試合', result: '【優勝】' },
    { title: '新人戦', result: '【１回戦突破】' },
    { title: 'Tボールフェスタ', result: '【１位】' },
  ]);

  weeklySchedule = signal([
    { title: '平日練習 (火・木・金)', time: '16:00 - 18:00', location: 'グラウンド', note: '冬季期間は体育館で練習します。' },
    { title: '土日練習 (土・日)', time: '09:00 - 12:00', location: 'グラウンド', note: '練習試合で遠征することもあります。' },
  ]);

  annualEvents = signal([
    { month: '1月', event: '体力強化期間' },
    { month: '2月', event: '体力強化期間' },
    { month: '3月', event: '体力強化期間' },
    { month: '4月', event: 'グランド開き' },
    { month: '5月', event: '学童大会' },
    { month: '6月', event: 'スポ少大会' },
    { month: '7月', event: '県少年大会' },
    { month: '8月', event: '桔梗野祭り参加' },
    { month: '9月', event: '新人戦' },
    { month: '10月', event: 'SG杯' },
    { month: '11月', event: '６年生を送る会' },
    { month: '12月', event: 'クリスマス会' },
  ]);

  testimonials = signal<Testimonial[]>([
    {
      quote: '息子は野球を通じて、仲間を思いやる心や努力することの大切さを学んでいます。コーチの皆様の熱心な指導のおかげで、毎日楽しく成長しています。',
      name: '6年生保護者',
      role: '保護者',
      avatar: 'https://i.pravatar.cc/150?u=parent_1',
    },
    {
      quote: '最初は不安でしたが、チームの温かい雰囲気と丁寧な指導のおかげで、子供が毎日笑顔で練習に通っています。親子共々、良い仲間に出会えて感謝しています。',
      name: '3年生保護者',
      role: '保護者',
      avatar: 'https://i.pravatar.cc/150?u=parent_2',
    },
  ]);

  memberCount = signal([
    { grade: '6年生', count: 10 },
    { grade: '5年生', count: 0 },
    { grade: '4年生', count: 0 },
    { grade: '3年生', count: 11 },
    { grade: '2年生', count: 0 },
    { grade: '1年生', count: 0 },
  ]);

  totalMembers = computed(() => this.memberCount().reduce((sum, item) => sum + item.count, 0));
  
  teamValues = signal<TeamValue[]>([
    { 
      icon: 'people-outline', 
      title: 'チームワーク', 
      description: '仲間を信じ、助け合い、共に勝利を目指す。一人ひとりの力が合わさることで、チームはもっと強くなる。'
    },
    { 
      icon: 'flame-outline', 
      title: '挑戦する心', 
      description: '失敗を恐れず、常に新しいことにチャレンジする勇気を持つ。すべての経験が君を成長させる。'
    },
    { 
      icon: 'heart-outline', 
      title: '感謝と尊重', 
      description: '野球ができる環境、支えてくれる家族、指導者、そして仲間たち。すべてに感謝の気持ちを忘れない。'
    }
  ]);

  handleAnimationFinish() {
    this.showIntro.set(false);
  }
}