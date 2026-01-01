/**
 * WhatsApp Click-to-Chat Integration
 * Sends memory backup to user's WhatsApp number
 */

export const sendMemoryToWhatsApp = (memory, userName, phoneNumber) => {
  if (!phoneNumber) {
    return { success: false, error: 'Please add your WhatsApp number in settings first!' };
  }

  // Format phone number (only allow + at the beginning, remove all non-digits elsewhere)
  const hasPlus = phoneNumber.trim().startsWith('+');
  const cleanPhone = (hasPlus ? '+' : '') + phoneNumber.replace(/[^\d]/g, '');
  
  // Format the date nicely
  const date = new Date(memory.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Create formatted message
  const message = `🤞 *Habit Tracker Memory*

📅 Date: ${formattedDate}
⏰ Time: ${memory.timestamp}
👤 User: ${userName}

💭 *Memory:*
${memory.text}

━━━━━━━━━━━━━━━
✨ Sent from Habit Tracker App`;

  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp in new window/tab
  window.open(whatsappUrl, '_blank');
  
  return { success: true };
};

export const getWhatsAppSettings = () => {
  return {
    enabled: localStorage.getItem('whatsappEnabled') === 'true',
    phoneNumber: localStorage.getItem('whatsappNumber') || '',
  };
};

export const updateWhatsAppSettings = (phoneNumber, enabled) => {
  if (enabled && phoneNumber) {
    localStorage.setItem('whatsappNumber', phoneNumber);
    localStorage.setItem('whatsappEnabled', 'true');
  } else {
    localStorage.setItem('whatsappEnabled', 'false');
    // Clear the stored number when disabled
    localStorage.removeItem('whatsappNumber');
  }
};
