import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, OnDestroy, output, signal, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';

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
  private hasPlayedSound = false;
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
    try {
      // 音声ファイルのパスを指定
      this.audio = new Audio('assets/sounds/yakyu-shoyouze.mp3');
      this.audio.volume = 0.7; // 音量を70%に設定
      this.audio.preload = 'auto'; // 事前読み込みを有効化
      
      // 音声の読み込みエラーを処理
      this.audio.addEventListener('error', (e) => {
        console.error('音声ファイルの読み込みエラー:', e);
        console.error('音声ファイルのパス:', this.audio?.src);
      });
      
      // 音声の読み込みが完了したら自動再生を試みる
      this.audio.addEventListener('canplaythrough', () => {
        console.log('音声ファイルの読み込み完了');
        this.attemptAutoPlay();
      });
      
      // 音声の再生が開始されたとき
      this.audio.addEventListener('play', () => {
        console.log('音声が再生されました');
      });
      
      // 音声の読み込みを開始
      this.audio.load();
    } catch (error) {
      console.error('音声ファイルの初期化に失敗しました:', error);
    }
  }

  private attemptAutoPlay(): void {
    if (!this.audio || this.hasPlayedSound) {
      return;
    }
    
    // 音声が読み込まれているか確認
    if (this.audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      console.log('自動再生を試みます...');
      this.playSound().catch((error) => {
        console.log('自動再生がブロックされました（これは正常な動作です）:', error.message);
      });
    } else {
      console.log('音声ファイルの読み込み待機中...');
      // 読み込み完了を待つ
      this.audio.addEventListener('canplaythrough', () => {
        this.playSound().catch((error) => {
          console.log('自動再生がブロックされました（これは正常な動作です）:', error.message);
        });
      }, { once: true });
    }
  }

  private async playSound(): Promise<void> {
    if (!this.audio) {
      console.error('音声オブジェクトが初期化されていません');
      return;
    }
    
    if (this.hasPlayedSound) {
      console.log('音声は既に再生されています');
      return;
    }
    
    try {
      // 音声を最初から再生
      this.audio.currentTime = 0;
      await this.audio.play();
      this.hasPlayedSound = true;
      console.log('音声の再生に成功しました');
    } catch (error: any) {
      console.error('音声の再生に失敗しました:', error.message);
      throw error;
    }
  }

  onScreenClick(event: MouseEvent | TouchEvent): void {
    // イントロアニメーション画面がクリックされたときに音声を再生
    console.log('🎯 Angularテンプレートイベント: 画面がクリックされました', event.type);
    this.playSoundOnUserInteraction();
  }

  private playSoundOnUserInteraction(): void {
    if (!this.audio) {
      console.error('❌ 音声オブジェクトが存在しません');
      return;
    }
    
    if (this.hasPlayedSound) {
      console.log('ℹ️ 音声は既に再生済みです');
      return;
    }
    
    try {
      console.log('🎵 ユーザー操作後の音声再生を試みます...');
      console.log('音声の詳細:', {
        readyState: this.audio.readyState,
        paused: this.audio.paused,
        src: this.audio.src,
        duration: this.audio.duration,
        volume: this.audio.volume
      });
      
      // 音声を最初から再生
      this.audio.currentTime = 0;
      
      // 再生を試みる
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.hasPlayedSound = true;
            console.log('🎉 音声の再生に成功しました！');
            console.log('再生状態:', {
              paused: this.audio?.paused,
              currentTime: this.audio?.currentTime,
              duration: this.audio?.duration
            });
          })
          .catch((error: any) => {
            console.error('❌ 音声の再生に失敗しました:', error);
            console.error('エラー詳細:', {
              name: error?.name,
              message: error?.message,
              code: (error as any)?.code,
              stack: error?.stack
            });
            
            // エラーが NotAllowedError の場合は、ユーザー操作が必要
            if (error?.name === 'NotAllowedError') {
              console.warn('⚠️ ブラウザが自動再生をブロックしています。ユーザーが画面をクリックしてください。');
            }
          });
      } else {
        // play()がPromiseを返さない古いブラウザの場合
        this.hasPlayedSound = true;
        console.log('✅ 音声の再生を開始しました（Promise非対応ブラウザ）');
      }
    } catch (error: any) {
      console.error('❌ 音声再生の例外:', error);
      console.error('例外詳細:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
    }
  }

  ngOnDestroy(): void {
    // イベントリスナーを削除
    if (this.introContainer?.nativeElement) {
      if (this.domClickHandler) {
        this.introContainer.nativeElement.removeEventListener('click', this.domClickHandler);
        this.introContainer.nativeElement.removeEventListener('mousedown', this.domClickHandler);
      }
      if (this.domTouchHandler) {
        this.introContainer.nativeElement.removeEventListener('touchstart', this.domTouchHandler);
      }
    }
    
    // セレクターで取得した要素のイベントリスナーも削除
    const containerElement = document.querySelector('app-intro-animation div.fixed') as HTMLElement;
    if (containerElement && this.domClickHandler) {
      containerElement.removeEventListener('click', this.domClickHandler);
      containerElement.removeEventListener('mousedown', this.domClickHandler);
    }
    if (containerElement && this.domTouchHandler) {
      containerElement.removeEventListener('touchstart', this.domTouchHandler);
    }
    
    // コンポーネント破棄時に音声リソースをクリーンアップ
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = undefined;
    }
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