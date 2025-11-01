import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, OnDestroy, output, signal, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';


const INTRO_AUDIO_SRC = 'assets/sounds/yakyu-shoyouze.mp3';
const INTRO_AUDIO_TARGET_VOLUME = 0.7;
const INTRO_AUDIO_FADE_DURATION_MS = 1200;
const INTRO_AUDIO_FADE_STEP_MS = 100;


@Component({
  selector: 'app-intro-animation',
  templateUrl: './intro-animation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IntroAnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  animationFinished = output<void>();

  @ViewChild('introContainer', { static: false }) introContainer?: ElementRef<HTMLDivElement>;
  
  animationState = signal<'logo' | 'images' | 'done'>('logo');
  activeImageIndex = signal(0);
  isComponentVisible = signal(true);
  private audio?: HTMLAudioElement;
  private audioFadeIntervalId?: ReturnType<typeof setInterval>;
  private autoplayAttemptInProgress = false;
  private hasPlayedSound = false;
  private isComponentDestroyed = false;
  private audioBlobUrl?: string;
  private audioFallbackAttempted = false;
  private readonly handleAudioCanPlay = () => {
    if (this.isComponentDestroyed) {
      return;
    }

    this.attemptAutoPlay();
  };

  private readonly handleAudioPlay = () => {
    if (this.isComponentDestroyed) {
      return;
    }

    this.hasPlayedSound = true;
    this.autoplayAttemptInProgress = false;
  };

  private readonly handleAudioError = (event: Event) => {
    console.error('Intro audio load error event:', event);

    if (this.audio) {
      console.error('Intro audio current src:', this.audio.src);
    }

    this.autoplayAttemptInProgress = false;

    if (!this.audioFallbackAttempted && !this.isComponentDestroyed) {
      this.audioFallbackAttempted = true;
      void this.resolveAudioBlobSource();
    }
  };


  private cdr = inject(ChangeDetectorRef);
  private domClickHandler?: (e: Event) => void;
  private domTouchHandler?: (e: Event) => void;

  images = signal([
    'assets/images/intro-team-1.jpg', // 円陣を組んでいる少年野球チーム
    'assets/images/intro-team-2.jpg', // トロフィーと賞状を持った集合写真
    'assets/images/intro-team-3.jpg', // 一列に並んだ少年たち
    'assets/images/intro-team-4.jpg', // 後ろ姿の整列（黄色い壁の前）
    'assets/images/intro-team-5.jpg', // 屋外の集合写真（コーチ中心）
  ]);

  ngOnInit(): void {
    // 音声ファイルを初期化
    this.initAudio();
    
    setTimeout(() => {
      this.animationState.set('images');
      this.startImageLoop();
    }, 2800);
  }

  ngAfterViewInit(): void {
    console.log('🔧 ngAfterViewInit 実行');
    console.log('introContainer:', this.introContainer);
    
    // 少し遅延させてから自動再生を試みる（DOMが完全に読み込まれた後）
    setTimeout(() => {
      this.attemptAutoPlay();
    }, 100);
    
    // クリックイベントを複数のタイミングで設定
    this.setupClickHandlers();
    
    // 少し遅延させて再試行（ViewChildがまだ取得できていない場合）
    setTimeout(() => {
      this.setupClickHandlers();
    }, 200);
    
    // さらに遅延させて再試行
    setTimeout(() => {
      this.setupClickHandlers();
    }, 500);
    
    // グローバルなクリックイベントも監視（フォールバック）
    this.setupGlobalClickHandler();
  }

  private setupClickHandlers(): void {
    console.log('🔧 setupClickHandlers 実行開始');
    
    // ViewChildで取得した要素を使用
    const container = this.introContainer?.nativeElement;
    console.log('ViewChild container:', container);
    
    if (container) {
      console.log('✅ ViewChildでコンテナ要素を取得しました');
      
      // 既にイベントリスナーが追加されている場合は削除
      if (this.domClickHandler) {
        container.removeEventListener('click', this.domClickHandler);
        container.removeEventListener('mousedown', this.domClickHandler);
      }
      if (this.domTouchHandler) {
        container.removeEventListener('touchstart', this.domTouchHandler);
      }
      
      // イベントハンドラーを作成
      this.domClickHandler = (e: Event) => {
        console.log('🖱️ ViewChild DOMイベント: クリック検出', e.type, e.target);
        this.playSoundOnUserInteraction();
      };
      
      this.domTouchHandler = (e: Event) => {
        console.log('👆 ViewChild DOMイベント: タッチ検出', e.type, e.target);
        this.playSoundOnUserInteraction();
      };
      
      // イベントリスナーを追加
      container.addEventListener('click', this.domClickHandler, { passive: false, capture: true });
      container.addEventListener('touchstart', this.domTouchHandler, { passive: false, capture: true });
      container.addEventListener('mousedown', this.domClickHandler, { passive: false, capture: true });
      
      console.log('✅ ViewChildクリックイベントリスナーを追加しました');
      return;
    }
    
    // フォールバック: セレクターで検索
    console.log('⚠️ ViewChildで要素が見つかりません。セレクターで検索します...');
    const containerElement = document.querySelector('app-intro-animation div.fixed') as HTMLElement;
    console.log('セレクター containerElement:', containerElement);
    
    if (containerElement) {
      console.log('✅ セレクターでコンテナ要素を取得しました');
      
      // 既にイベントリスナーが追加されている場合は削除
      if (this.domClickHandler) {
        containerElement.removeEventListener('click', this.domClickHandler);
        containerElement.removeEventListener('mousedown', this.domClickHandler);
      }
      if (this.domTouchHandler) {
        containerElement.removeEventListener('touchstart', this.domTouchHandler);
      }
      
      this.domClickHandler = (e: Event) => {
        console.log('🖱️ セレクターDOMイベント: クリック検出', e.type, e.target);
        this.playSoundOnUserInteraction();
      };
      
      this.domTouchHandler = (e: Event) => {
        console.log('👆 セレクターDOMイベント: タッチ検出', e.type, e.target);
        this.playSoundOnUserInteraction();
      };
      
      containerElement.addEventListener('click', this.domClickHandler, { passive: false, capture: true });
      containerElement.addEventListener('touchstart', this.domTouchHandler, { passive: false, capture: true });
      containerElement.addEventListener('mousedown', this.domClickHandler, { passive: false, capture: true });
      
      console.log('✅ セレクタークリックイベントリスナーを追加しました');
    } else {
      console.error('❌ コンテナ要素が見つかりませんでした');
    }
  }

  private setupGlobalClickHandler(): void {
    console.log('🔧 グローバルクリックハンドラーを設定');
    
    // ドキュメント全体でクリックを監視（フォールバック）
    const globalHandler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const isIntroElement = target.closest('app-intro-animation');
      
      if (isIntroElement && this.animationState() === 'logo' && !this.hasPlayedSound) {
        console.log('🌐 グローバルイベント: イントロ要素内でクリック検出', e.type);
        this.playSoundOnUserInteraction();
      }
    };
    
    document.addEventListener('click', globalHandler as EventListener, { passive: false, capture: true });
    document.addEventListener('touchstart', globalHandler as EventListener, { passive: false, capture: true });
    
    console.log('✅ グローバルクリックイベントリスナーを追加しました');
  }

  private initAudio(): void {
    if (this.isComponentDestroyed) {
      return;
    }

    this.teardownAudioElement();

    const audio = new Audio(INTRO_AUDIO_SRC);
    audio.preload = 'auto';
    audio.muted = true;
    audio.volume = 0;

    this.audio = audio;
    this.autoplayAttemptInProgress = false;
    this.hasPlayedSound = false;

    audio.addEventListener('canplaythrough', this.handleAudioCanPlay);
    audio.addEventListener('play', this.handleAudioPlay);
    audio.addEventListener('error', this.handleAudioError);

    audio.load();
  }


  private fadeInAudio(): void {
    const audio = this.audio;
    if (!audio) {
      return;
    }

    this.clearAudioFadeInterval();

    const steps = Math.max(1, Math.round(INTRO_AUDIO_FADE_DURATION_MS / INTRO_AUDIO_FADE_STEP_MS));
    const volumeIncrement = INTRO_AUDIO_TARGET_VOLUME / steps;

    audio.muted = false;
    audio.volume = 0;

    let currentStep = 0;
    this.audioFadeIntervalId = setInterval(() => {
      if (!this.audio) {
        this.clearAudioFadeInterval();
        return;
      }

      currentStep += 1;
      const nextVolume = Math.min(INTRO_AUDIO_TARGET_VOLUME, this.audio.volume + volumeIncrement);
      this.audio.volume = nextVolume;

      if (currentStep >= steps || nextVolume >= INTRO_AUDIO_TARGET_VOLUME) {
        this.clearAudioFadeInterval();
        this.audio.volume = INTRO_AUDIO_TARGET_VOLUME;
      }
    }, INTRO_AUDIO_FADE_STEP_MS);
  }

  private clearAudioFadeInterval(): void {
    if (this.audioFadeIntervalId) {
      clearInterval(this.audioFadeIntervalId);
      this.audioFadeIntervalId = undefined;
    }
  }

  private teardownAudioElement(): void {
    if (!this.audio) {
      this.clearAudioFadeInterval();
      this.autoplayAttemptInProgress = false;
      this.hasPlayedSound = false;
      this.revokeAudioBlobUrl();
      return;
    }

    this.audio.removeEventListener('canplaythrough', this.handleAudioCanPlay);
    this.audio.removeEventListener('play', this.handleAudioPlay);
    this.audio.removeEventListener('error', this.handleAudioError);
    this.audio.pause();
    this.audio.src = '';

    this.audio = undefined;
    this.clearAudioFadeInterval();
    this.autoplayAttemptInProgress = false;
    this.hasPlayedSound = false;
    this.revokeAudioBlobUrl();
  }

  private async resolveAudioBlobSource(): Promise<void> {
    if (!this.audio || typeof fetch === 'undefined') {
      return;
    }

    try {
      const response = await fetch(INTRO_AUDIO_SRC, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      if (!this.audio || this.isComponentDestroyed) {
        return;
      }

      const mimeType = this.detectAudioMimeType(response.headers.get('content-type'), arrayBuffer);

      this.revokeAudioBlobUrl();

      const blob = new Blob([arrayBuffer], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      this.audioBlobUrl = objectUrl;
      this.audio.src = objectUrl;
      this.audio.load();
    } catch (error) {
      console.error('Intro audio fallback load failed:', error);
    }
  }

  private detectAudioMimeType(serverType: string | null, buffer: ArrayBuffer): string {
    if (serverType && serverType !== 'application/octet-stream') {
      return serverType;
    }

    if (buffer.byteLength >= 12) {
      const headerBytes = new Uint8Array(buffer.slice(0, 12));
      const headerText = String.fromCharCode(...headerBytes);
      if (headerText.includes('ftyp')) {
        return 'audio/mp4';
      }
    }

    return 'audio/mpeg';
  }

  private revokeAudioBlobUrl(): void {
    if (this.audioBlobUrl) {
      URL.revokeObjectURL(this.audioBlobUrl);
      this.audioBlobUrl = undefined;
    }
  }
  private attemptAutoPlay(): void {
    if (!this.audio || this.autoplayAttemptInProgress || this.hasPlayedSound) {
      return;
    }

    const audio = this.audio;
    this.autoplayAttemptInProgress = true;

    audio.currentTime = 0;
    audio.muted = true;
    audio.volume = 0;
    this.clearAudioFadeInterval();

    const playResult = audio.play();

    if (playResult !== undefined) {
      playResult
        .then(() => {
          this.autoplayAttemptInProgress = false;
          this.fadeInAudio();
        })
        .catch((error: any) => {
          this.autoplayAttemptInProgress = false;
          console.warn('Intro audio autoplay was blocked; waiting for user interaction.', error?.message ?? error);
        });
    } else {
      this.autoplayAttemptInProgress = false;
      this.fadeInAudio();
    }
  }

  private async playSound(): Promise<void> {
    if (!this.audio) {
      console.error('音声オブジェクトが利用できません');
      return;
    }

    const audio = this.audio;
    this.clearAudioFadeInterval();

    audio.currentTime = 0;
    audio.volume = 0;

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      this.fadeInAudio();
      this.hasPlayedSound = true;
    } catch (error: any) {
      console.error('音声の再生に失敗しました:', error?.message ?? error);
      throw error;
    }
  }

  public onScreenClick(event: MouseEvent | TouchEvent): void {
    // イントロアニメーション画面がクリックされたときに音声を再生
    console.log('🎯 Angularテンプレートイベント: 画面がクリックされました', event.type);
    this.playSoundOnUserInteraction();
  }

  private playSoundOnUserInteraction(): void {
    if (!this.audio) {
      console.error('音声オブジェクトが利用できません');
      return;
    }

    this.autoplayAttemptInProgress = false;

    this.playSound().catch((error) => {
      console.error('ユーザー操作による音声再生に失敗しました:', error);
    });
  }

  ngOnDestroy(): void {
    this.isComponentDestroyed = true;

    // イベントリスナーの解除
    if (this.introContainer?.nativeElement) {
      if (this.domClickHandler) {
        this.introContainer.nativeElement.removeEventListener('click', this.domClickHandler);
        this.introContainer.nativeElement.removeEventListener('mousedown', this.domClickHandler);
      }
      if (this.domTouchHandler) {
        this.introContainer.nativeElement.removeEventListener('touchstart', this.domTouchHandler);
      }
    }

    const containerElement = document.querySelector('app-intro-animation div.fixed') as HTMLElement;
    if (containerElement && this.domClickHandler) {
      containerElement.removeEventListener('click', this.domClickHandler);
      containerElement.removeEventListener('mousedown', this.domClickHandler);
    }
    if (containerElement && this.domTouchHandler) {
      containerElement.removeEventListener('touchstart', this.domTouchHandler);
    }

    this.teardownAudioElement();
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
