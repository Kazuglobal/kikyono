import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly submissionStatus = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly submissionMessage = signal('');
  readonly requestId = signal('');
  readonly submittedAt = signal('');
  private readonly sanitizer = inject(DomSanitizer);
  readonly mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=%E5%85%AB%E6%88%B8%E5%B8%82%E7%AB%8B%E6%A1%94%E6%A2%97%E9%87%8E%E5%B0%8F%E5%AD%A6%E6%A0%A1&z=16&output=embed',
  );
  readonly gasEndpoint = 'https://script.google.com/macros/s/AKfycbwYaUAVaHD5QXCG-Wd10RGr6f5yvKrKGBDP4BtXDvFbc0Ak38up3UBi4TZqLnN_FFTeDA/exec';
  private awaitingFrameResponse = false;

  handleContactSubmit(event: Event): void {
    event.preventDefault();

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (!this.gasEndpoint.startsWith('https://script.google.com/macros/s/')) {
      this.submissionStatus.set('error');
      this.submissionMessage.set('送信先の設定が未完了です。Google Apps ScriptのウェブアプリURLを設定してください。');
      return;
    }

    this.submissionStatus.set('submitting');
    this.submissionMessage.set('送信中です...');

    if (!form.reportValidity()) {
      return;
    }

    const requestId = `violets-${Date.now().toString(36)}`;
    this.requestId.set(requestId);
    this.submittedAt.set(new Date().toISOString());
    this.awaitingFrameResponse = true;
    this.submissionStatus.set('submitting');
    this.submissionMessage.set('送信中です...');

    queueMicrotask(() => form.submit());
  }

  handleSubmissionFrameLoad(): void {
    if (!this.awaitingFrameResponse) {
      return;
    }

    this.awaitingFrameResponse = false;
    this.submissionStatus.set('success');
    this.submissionMessage.set(`送信しました。受付ID: ${this.requestId()}`);
  }
}
