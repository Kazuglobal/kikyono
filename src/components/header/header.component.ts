import { ChangeDetectionStrategy, Component, signal, input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '[class.bg-white/80]': 'isScrolled()',
    '[class.shadow-md]': 'isScrolled()',
    '[class.backdrop-blur-lg]': 'isScrolled()',
    '[class.text-slate-800]': 'isScrolled()',
    '[class.text-white]': '!isScrolled()',
    'class': 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
  }
})
export class HeaderComponent {
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  activeSectionId = input<string>('');

  navLinks = [
    { path: '#about', label: 'チーム紹介' },
    { path: '#members', label: '部員数' },
    { path: '#achievements', label: '実績' },
    { path: '#schedule', label: 'スケジュール' },
    { path: '#testimonials', label: 'メンバーの声' },
    { path: '#contact', label: 'お問い合わせ' },
  ];

  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}