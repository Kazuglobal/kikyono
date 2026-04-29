import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { IntroAnimationComponent } from './components/intro-animation/intro-animation.component';

interface TeamValue {
  icon: string;
  title: string;
  description: string;
}

interface Achievement {
  title: string;
  result: string;
}

interface ScheduleItem {
  day: string;
  time: string;
  location: string;
  note: string;
}

interface AnnualEvent {
  month: string;
  event: string;
}

interface Testimonial {
  quote: string;
  name: string;
}

interface PhotoSlot {
  label: string;
  note: string;
}

interface StatTile {
  label: string;
  value: string;
  note: string;
}

interface CalendarDay {
  day: string;
  type?: 'practice' | 'game' | 'event';
  label?: string;
}

interface GameResult {
  date: string;
  opponent: string;
  score: string;
  result: string;
}

interface JoinStep {
  number: string;
  title: string;
  text: string;
}

interface PlayerIntroItem {
  src: string;
  alt: string;
  position: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, IntroAnimationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('teamAudio') private readonly teamAudio?: ElementRef<HTMLAudioElement>;
  @ViewChild('aboutVisual') private readonly aboutVisual?: ElementRef<HTMLElement>;
  @ViewChild('joinVisualImage') private readonly joinVisualImage?: ElementRef<HTMLElement>;

  showIntro = signal(true);
  pageReady = signal(false);
  showPlayerIntro = signal(false);
  playerIntroClosing = signal(false);
  currentPlayerIndex = signal(0);
  audioBlocked = signal(false);
  activeSectionId = signal('home');
  heroParallaxOffset = signal(0);
  heroQuickVisible = signal(false);
  aboutVisualVisible = signal(false);
  joinVisualVisible = signal(false);
  reducedMotion = signal(false);

  private observer?: IntersectionObserver;
  private revealObserver?: IntersectionObserver;
  private playerIntroTimer?: ReturnType<typeof setTimeout>;
  private playerIntroStarted = false;
  private scrollAnimationFrame?: number;
  private motionMediaQuery?: MediaQueryList;
  private readonly playerFrameDelayMs = 980;
  private readonly heroParallaxLimit = 24;

  readonly playerIntroPlayers: PlayerIntroItem[] = [
    { src: '/assets/images/player-intro/player-01.png', alt: '投球フォームの選手', position: 'Pitcher' },
    { src: '/assets/images/player-intro/player-02.png', alt: 'バッターボックスに立つ選手', position: 'Batter' },
    { src: '/assets/images/player-intro/player-03.png', alt: '投球後のフォームの選手', position: 'Pitcher' },
    { src: '/assets/images/player-intro/player-04.png', alt: 'バットを構える選手', position: 'Batter' },
    { src: '/assets/images/player-intro/player-05.png', alt: '低い姿勢で投げる選手', position: 'Pitcher' },
    { src: '/assets/images/player-intro/player-06.png', alt: 'ボールを投げる選手', position: 'Pitcher' },
    { src: '/assets/images/player-intro/player-07.png', alt: '緑のバットを構える選手', position: 'Batter' },
    { src: '/assets/images/player-intro/player-08.png', alt: '赤いバットを構える選手', position: 'Batter' },
    { src: '/assets/images/player-intro/player-09.png', alt: '青いバットを構える選手', position: 'Batter' },
    { src: '/assets/images/player-intro/player-10.png', alt: 'キャッチャー防具をつけた選手', position: 'Catcher' },
    { src: '/assets/images/player-intro/player-11.png', alt: '黒いバットを構える選手', position: 'Batter' },
  ];

  readonly heroPhotoSlot: PhotoSlot = {
    label: '集合写真',
    note: '差し替え用',
  };

  readonly joinPhotoSlots = signal<PhotoSlot[]>([
    { label: '打者写真', note: '差し替え用' },
    { label: '投手写真', note: '差し替え用' },
  ]);

  readonly voicePhotoSlots = signal<PhotoSlot[]>([
    { label: '道具写真', note: '差し替え用' },
    { label: '集合写真', note: '差し替え用' },
  ]);

  readonly joinBadges = signal([
    '初心者歓迎',
    '見学OK',
    '女の子も歓迎',
    '保護者同伴',
  ]);

  readonly stats = signal<StatTile[]>([
    { label: '部員数', value: '11名', note: '4年生中心で活動中' },
    { label: '練習日', value: '週3日', note: '火・木・金（土日練習試合あり）' },
    { label: '活動場所', value: '八戸市', note: '桔梗野エリア周辺' },
  ]);

  readonly gallerySlots = signal<PhotoSlot[]>([
    { label: '円陣写真', note: '差し替え用' },
    { label: '投球写真', note: '差し替え用' },
    { label: '打撃写真', note: '差し替え用' },
  ]);

  readonly teamValues = signal<TeamValue[]>([
    {
      icon: '01',
      title: 'チームワーク',
      description:
        '仲間を信じ、助け合い、共に勝利を目指す。一人ひとりの力が合わさることで、チームはもっと強くなる。',
    },
    {
      icon: '02',
      title: '挑戦する心',
      description:
        '失敗を恐れず、新しいことにチャレンジする勇気を持つ。すべての経験が君を成長させる。',
    },
    {
      icon: '03',
      title: '感謝と尊重',
      description:
        '野球ができる環境、支えてくれる家族、指導者、そして仲間たち。すべてに感謝の気持ちを忘れない。',
    },
  ]);

  readonly members = signal([
    { grade: '6年生', count: 0 },
    { grade: '5年生', count: 0 },
    { grade: '4年生', count: 11 },
    { grade: '3年生', count: 0 },
    { grade: '2年生', count: 0 },
    { grade: '1年生', count: 0 },
  ]);

  readonly totalMembers = computed(() =>
    this.members().reduce((sum, member) => sum + member.count, 0),
  );
  readonly heroQuickActive = computed(() =>
    this.pageReady() && (this.heroQuickVisible() || this.reducedMotion()),
  );
  readonly aboutVisualActive = computed(() =>
    this.aboutVisualVisible() || this.reducedMotion(),
  );
  readonly joinVisualActive = computed(() =>
    this.joinVisualVisible() || this.reducedMotion(),
  );

  readonly achievements = signal<Achievement[]>([
    { title: 'スポ少大会', result: '【県大会出場】' },
    { title: '県少年大会', result: '【八戸市ベスト８】' },
    { title: '市川地区親善試合', result: '【優勝】' },
    { title: '新人戦', result: '【１回戦突破】' },
    { title: 'Tボールフェスタ', result: '【１位】' },
  ]);

  readonly gameResults = signal<GameResult[]>([
    { date: '10.14', opponent: '市川クラブ', score: '7 - 4', result: 'WIN' },
    { date: '09.28', opponent: '湊高台ベースボール', score: '3 - 5', result: 'NEXT' },
    { date: '09.07', opponent: '根城ファイターズ', score: '8 - 2', result: 'WIN' },
  ]);

  readonly weeklySchedule = signal<ScheduleItem[]>([
    {
      day: '火・木・金（平日）',
      time: '16:00 - 18:00',
      location: 'グラウンド',
      note: '※冬季期間は体育館で練習します',
    },
    {
      day: '土・日',
      time: '09:00 - 12:00',
      location: 'グラウンド',
      note: '※練習試合で遠征する場合があります',
    },
  ]);

  readonly calendarDays = signal<CalendarDay[]>([
    { day: '1', type: 'practice', label: '練習' },
    { day: '2', type: 'game', label: '練習試合' },
    { day: '3' },
    { day: '4' },
    { day: '5', type: 'practice', label: '練習' },
    { day: '6' },
    { day: '7', type: 'practice', label: '練習' },
    { day: '8', type: 'practice', label: '練習' },
    { day: '9', type: 'game', label: '練習試合' },
    { day: '10' },
    { day: '11' },
    { day: '12', type: 'practice', label: '練習' },
    { day: '13' },
    { day: '14', type: 'practice', label: '練習' },
    { day: '15', type: 'practice', label: '練習' },
    { day: '16', type: 'game', label: '練習試合' },
    { day: '17' },
    { day: '18' },
    { day: '19', type: 'practice', label: '練習' },
    { day: '20' },
    { day: '21', type: 'practice', label: '練習' },
    { day: '22', type: 'practice', label: '練習' },
    { day: '23', type: 'game', label: '練習試合' },
    { day: '24' },
    { day: '25' },
    { day: '26', type: 'practice', label: '練習' },
    { day: '27' },
    { day: '28', type: 'practice', label: '練習' },
    { day: '29', type: 'practice', label: '練習' },
    { day: '30', type: 'game', label: '練習試合' },
    { day: '31' },
  ]);

  readonly annualEvents = signal<AnnualEvent[]>([
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

  readonly joinSteps = signal<JoinStep[]>([
    { number: '01', title: '体験申込', text: 'メールまたはフォームから希望日を送ってください。' },
    { number: '02', title: '見学', text: '練習の雰囲気やチームの様子を親子で確認できます。' },
    { number: '03', title: '練習参加', text: 'グローブがなくても大丈夫。道具は相談できます。' },
    { number: '04', title: '入団', text: '無理なく続けられるペースで仲間入りします。' },
  ]);

  readonly gearChecklist = signal(['動きやすい服', '飲み物', '帽子', 'タオル']);

  readonly testimonials = signal<Testimonial[]>([
    {
      quote:
        '息子は野球を通じて、仲間を思いやる心や努力することの大切さを学んでいます。コーチの皆さんの熱心な指導のおかげで、毎日楽しく成長しています。',
      name: '4年生保護者',
    },
    {
      quote:
        '最初は不安でしたが、チームの温かい雰囲気と丁寧な指導のおかげで、子どもが毎日笑顔で練習に通っています。親子ともに良い仲間に出会えました。',
      name: '4年生保護者',
    },
  ]);

  private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion.set(event.matches);

    if (event.matches) {
      this.heroQuickVisible.set(this.pageReady());
      this.aboutVisualVisible.set(true);
      this.joinVisualVisible.set(true);
      this.revealObserver?.disconnect();
      this.revealObserver = undefined;
    } else {
      this.setupRevealObserver();
    }

    this.syncScrollMotion();
  };

  private readonly handleScroll = (): void => {
    if (this.scrollAnimationFrame !== undefined) {
      return;
    }

    this.scrollAnimationFrame = window.requestAnimationFrame(() => {
      this.scrollAnimationFrame = undefined;
      this.syncScrollMotion();
    });
  };

  ngAfterViewInit(): void {
    this.setupReducedMotionPreference();
    this.observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target instanceof HTMLElement) {
          this.activeSectionId.set(visibleEntry.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.15, 0.4, 0.7],
      },
    );

    const sections = document.querySelectorAll('main section[id], footer[id]');
    sections.forEach((section) => this.observer?.observe(section));

    this.setupRevealObserver();

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      this.syncScrollMotion();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.revealObserver?.disconnect();
    this.clearPlayerIntroTimer();

    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll);
    }

    if (this.scrollAnimationFrame !== undefined && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.scrollAnimationFrame);
    }

    if (this.motionMediaQuery) {
      if ('removeEventListener' in this.motionMediaQuery) {
        this.motionMediaQuery.removeEventListener('change', this.handleReducedMotionChange);
      } else {
        (this.motionMediaQuery as MediaQueryList & {
          removeListener(listener: (event: MediaQueryListEvent) => void): void;
        }).removeListener(this.handleReducedMotionChange);
      }
    }
  }

  handleAnimationFinish(): void {
    this.showIntro.set(false);
    this.returnToFirstView('auto');
    if (this.playerIntroStarted) {
      return;
    }

    this.playerIntroStarted = true;
    this.playerIntroTimer = setTimeout(() => this.startPlayerIntro(), 320);
  }

  finishPlayerIntro(): void {
    if (this.playerIntroClosing()) {
      return;
    }

    this.clearPlayerIntroTimer();
    this.playerIntroClosing.set(true);

    this.playerIntroTimer = setTimeout(() => {
      this.returnToFirstView('auto');
      this.showPlayerIntro.set(false);
      this.playerIntroClosing.set(false);
      this.pageReady.set(true);
      this.syncScrollMotion();
      this.playTeamAudio();
    }, 460);
  }

  playTeamAudio(): void {
    const audio = this.teamAudio?.nativeElement;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    audio.volume = 0.9;

    void audio.play()
      .then(() => this.audioBlocked.set(false))
      .catch(() => this.audioBlocked.set(true));
  }

  private startPlayerIntro(): void {
    if (!this.playerIntroPlayers.length) {
      this.playTeamAudio();
      return;
    }

    this.currentPlayerIndex.set(0);
    this.playerIntroClosing.set(false);
    this.audioBlocked.set(false);
    this.showPlayerIntro.set(true);
    this.scheduleNextPlayer();
  }

  private scheduleNextPlayer(): void {
    this.clearPlayerIntroTimer();
    this.playerIntroTimer = setTimeout(() => {
      const nextIndex = this.currentPlayerIndex() + 1;
      if (nextIndex < this.playerIntroPlayers.length) {
        this.currentPlayerIndex.set(nextIndex);
        this.scheduleNextPlayer();
        return;
      }

      this.finishPlayerIntro();
    }, this.playerFrameDelayMs);
  }

  private clearPlayerIntroTimer(): void {
    if (!this.playerIntroTimer) {
      return;
    }

    clearTimeout(this.playerIntroTimer);
    this.playerIntroTimer = undefined;
  }

  private setupReducedMotionPreference(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion.set(this.motionMediaQuery.matches);

    if ('addEventListener' in this.motionMediaQuery) {
      this.motionMediaQuery.addEventListener('change', this.handleReducedMotionChange);
    } else {
      (this.motionMediaQuery as MediaQueryList & {
        addListener(listener: (event: MediaQueryListEvent) => void): void;
      }).addListener(this.handleReducedMotionChange);
    }
  }

  private setupRevealObserver(): void {
    this.revealObserver?.disconnect();
    this.revealObserver = undefined;

    if (typeof window === 'undefined') {
      return;
    }

    if (this.reducedMotion()) {
      this.aboutVisualVisible.set(true);
      this.joinVisualVisible.set(true);
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (entry.target === this.aboutVisual?.nativeElement) {
            this.aboutVisualVisible.set(true);
          }

          if (entry.target === this.joinVisualImage?.nativeElement) {
            this.joinVisualVisible.set(true);
          }

          this.revealObserver?.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.28,
      },
    );

    if (this.aboutVisual?.nativeElement) {
      this.revealObserver.observe(this.aboutVisual.nativeElement);
    }

    if (this.joinVisualImage?.nativeElement) {
      this.revealObserver.observe(this.joinVisualImage.nativeElement);
    }
  }

  private syncScrollMotion(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.reducedMotion()) {
      this.heroParallaxOffset.set(0);
      this.heroQuickVisible.set(this.pageReady());
      return;
    }

    const scrollY = Math.max(window.scrollY, 0);
    this.heroParallaxOffset.set(
      Math.min(scrollY * 0.085, this.heroParallaxLimit),
    );
    this.heroQuickVisible.set(this.pageReady() && scrollY > 18);
  }

  private returnToFirstView(behavior: ScrollBehavior): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo({ top: 0, left: 0, behavior });
    this.activeSectionId.set('home');
    this.syncScrollMotion();
  }
}
