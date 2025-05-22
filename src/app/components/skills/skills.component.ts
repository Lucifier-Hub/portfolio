import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-skills',
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SkillsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize progress bars with animation
    this.initializeProgressBars();
  }

  private initializeProgressBars(): void {
    const progressBars = document.querySelectorAll('.progress-bar');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target as HTMLElement;
          const width = progressBar.style.width;
          progressBar.style.width = '0%';
          setTimeout(() => {
            progressBar.style.width = width;
          }, 100);
          observer.unobserve(progressBar);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(progressBar => {
      observer.observe(progressBar);
    });
  }
}
