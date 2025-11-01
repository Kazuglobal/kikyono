import { ChangeDetectionStrategy, Component, computed, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // Social Sharing Logic
  siteUrl = signal('');
  shareText = signal('最高の仲間と最高の瞬間を！桔梗野バイオレッツで野球しようぜ！ #桔梗野バイオレッツ');

  constructor() {
    // Safely access window object only in browser environment
    if (typeof window !== 'undefined') {
      this.siteUrl.set(window.location.href);
    }
  }

  encodedUrl = computed(() => encodeURIComponent(this.siteUrl()));
  encodedText = computed(() => encodeURIComponent(this.shareText()));

  twitterShareUrl = computed(() => `https://twitter.com/intent/tweet?url=${this.encodedUrl()}&text=${this.encodedText()}`);
  facebookShareUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${this.encodedUrl()}`);
  lineShareUrl = computed(() => `https://social-plugins.line.me/lineit/share?url=${this.encodedUrl()}&text=${this.encodedText()}`);
}