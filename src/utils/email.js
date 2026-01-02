/**
 * EmailJS Integration for Memory Backup
 * Automatically sends memory to user's email address
 */

import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_xxxxxxx';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_xxxxxxx';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'xxxxxxxxxxxxxxx';

// Email subject constant
const EMAIL_SUBJECT_PREFIX = '🤞 Habit Tracker Memory';

export const sendMemoryToEmail = async (memory, userName, recipientEmail) => {
  if (!recipientEmail) {
    return { 
      success: false, 
      error: 'Please add your email address in settings first!' 
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return { 
      success: false, 
      error: 'Please enter a valid email address!' 
    };
  }

  try {
    // Format the date nicely
    const date = new Date(memory.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Prepare email parameters
    const templateParams = {
      to_email: recipientEmail,
      to_name: userName,
      user_name: userName,
      memory_date: formattedDate,
      memory_time: memory.timestamp,
      memory_text: memory.text,
      subject: `${EMAIL_SUBJECT_PREFIX} - ${formattedDate}`,
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Failed to send email. Please try again.' 
      };
    }
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { 
      success: false, 
      error: 'Failed to send email. Please check your settings.' 
    };
  }
};

export const getEmailSettings = () => {
  return {
    enabled: localStorage.getItem('emailEnabled') === 'true',
    emailAddress: localStorage.getItem('emailAddress') || '',
  };
};

export const updateEmailSettings = (emailAddress, enabled) => {
  if (enabled && emailAddress) {
    localStorage.setItem('emailAddress', emailAddress);
    localStorage.setItem('emailEnabled', 'true');
  } else {
    localStorage.setItem('emailEnabled', 'false');
    localStorage.removeItem('emailAddress');
  }
};
