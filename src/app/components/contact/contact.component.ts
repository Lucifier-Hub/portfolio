import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
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
      }
    });
  }

  async onSubmit() {
    if (this.isLoading) return; // Prevent multiple submissions
    
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
          to_email: 'abhijith.venu199@gmail.com'
        }
      );

      // Only mark as success if we get a successful response
      if (response.status === 200) {
        this.isSuccess = true;
        this.formData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error: any) {
      this.isError = true;
      this.errorMessage = error.message || 'Failed to send message. Please try again later.';
      console.error('Error sending email:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
