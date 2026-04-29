import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'site-header',
  },
})
export class HeaderComponent {
  readonly activeSectionId = input<string>('home');
  readonly isMobileMenuOpen = signal(false);

  readonly navLinks = [
    { path: '#home', label: 'ホーム', sublabel: 'HOME' },
    { path: '#about', label: 'チーム紹介', sublabel: 'ABOUT' },
    { path: '#achievements', label: '大会実績', sublabel: 'RESULTS' },
    { path: '#schedule', label: 'スケジュール', sublabel: 'SCHEDULE' },
    { path: '#join', label: '入団案内', sublabel: 'JOIN' },
    { path: '#contact', label: 'お問い合わせ', sublabel: 'CONTACT' },
  ];

  isActive(path: string): boolean {
    if (path === '#home') {
      return this.activeSectionId() === 'home' || !this.activeSectionId();
    }

    return path === `#${this.activeSectionId()}`;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
