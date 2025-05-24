import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    grecaptcha?: any;
    onRecaptchaSuccess?: (token: string) => void;
  }
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  recaptchaToken = '';

  isLoading = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  ngOnInit() {
    // Initialize EmailJS with your public key
    emailjs.init({
      publicKey: environment.emailjs.publicKey,
      // Add rate limiting for security
      limitRate: {
        throttle: 1000, // 1 request per second
      },
    });
  }


ngAfterViewInit() {
  (window as any).onRecaptchaSuccess = (token: string) => {
    this.recaptchaToken = token;
  };
}

async onSubmit() {
  if (this.isLoading || !this.recaptchaToken) return; // Prevent multiple submissions and require captcha

  this.isLoading = true;
  this.isSuccess = false;
  this.isError = false;

  try {
    const response = await emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      {
        from_name: this.formData.name,
        from_email: this.formData.email,
        subject: this.formData.subject,
        message: this.formData.message,
        to_email: 'abhijith.venu199@gmail.com',
        'g-recaptcha-response': this.recaptchaToken, // Optional: pass to backend if needed
      }
    );

    if (response.status === 200) {
      this.isSuccess = true;
      this.formData = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };
      // Reset reCAPTCHA
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
      this.recaptchaToken = '';
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error: any) {
    this.isError = true;
    this.errorMessage =
      error.message || 'Failed to send message. Please try again later.';
    console.error('Error sending email:', error);
  } finally {
    this.isLoading = false;
  }
}
}
