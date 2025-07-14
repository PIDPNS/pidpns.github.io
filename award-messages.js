// ===============================================
// AWARD MESSAGES FUNCTIONALITY
// Handles form submission, photo upload, and Supabase integration
// ===============================================

class AwardMessagesManager {
  constructor(supabaseClient) {
    console.log('AwardMessagesManager constructor - supabase client:', !!supabaseClient, 'auth available:', !!(supabaseClient && supabaseClient.auth));
    this.supabase = supabaseClient;
    this.currentPhotoFile = null;
    this.isProcessingPhoto = false;
    this.isSubmitting = false;
    this.lastSubmissionTime = 0; // Add timestamp tracking
    
    if (!this.supabase) {
      console.error('No Supabase client provided to AwardMessagesManager');
      return;
    }
    
    if (!this.supabase.auth) {
      console.error('Supabase client missing auth property');
      return;
    }
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPhotoUpload();
    this.setupCharacterCounter();
    console.log('Award Messages Manager initialized');
  }

  setupEventListeners() {
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
      // Remove existing listeners first to prevent duplicates
      messageForm.removeEventListener('submit', this.boundFormSubmit);
      
      // Create bound method for proper removal
      this.boundFormSubmit = (e) => this.handleFormSubmit(e);
      messageForm.addEventListener('submit', this.boundFormSubmit);
    }
  }

  setupPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');

    if (!photoInput || !photoUploadArea) {
      console.error('Photo upload elements not found!');
      return;
    }

    // COMPLETELY CLEAR ALL EXISTING EVENT LISTENERS
    // Clone elements to remove all event listeners
    const newPhotoInput = photoInput.cloneNode(true);
    const newPhotoUploadArea = photoUploadArea.cloneNode(true);
    
    // Replace old elements with new ones (this removes ALL event listeners)
    photoInput.parentNode.replaceChild(newPhotoInput, photoInput);
    photoUploadArea.parentNode.replaceChild(newPhotoUploadArea, photoUploadArea);
    
    // Update references to new elements
    const freshPhotoInput = document.getElementById('photoInput');
    const freshPhotoUploadArea = document.getElementById('photoUploadArea');
    
    if (!freshPhotoInput || !freshPhotoUploadArea) {
      console.error('Failed to create fresh photo upload elements!');
      return;
    }

    // Create a custom file selection method that bypasses the input click
    this.openFileDialog = () => {
      // Prevent multiple dialogs
      if (this.isProcessingPhoto) {
        console.log('Photo processing in progress, ignoring file dialog request');
        return;
      }
      
      // Create a completely new file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      // Add to body temporarily
      document.body.appendChild(fileInput);
      
      // Handle file selection
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          // Store file in our instance AND update the original input for form validation
          this.handlePhotoSelection(file);
          
          // Also update the original HTML input element for form validation
          const originalInput = document.getElementById('photoInput');
          if (originalInput) {
            // Create a new FileList with our selected file
            const dt = new DataTransfer();
            dt.items.add(file);
            originalInput.files = dt.files;
            
            // Dispatch change event to trigger any other listeners
            originalInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        // Remove the temporary input
        document.body.removeChild(fileInput);
      }, { once: true }); // Use once: true to ensure it only fires once
      
      // Trigger file dialog
      fileInput.click();
    };

    // Add single click listener to upload area using our custom method
    freshPhotoUploadArea.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.openFileDialog();
    }, { once: false });

    // Add drag and drop support
    freshPhotoUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      freshPhotoUploadArea.classList.add('drag-over');
    });

    freshPhotoUploadArea.addEventListener('dragleave', () => {
      freshPhotoUploadArea.classList.remove('drag-over');
    });

    freshPhotoUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      freshPhotoUploadArea.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.handlePhotoSelection(file);
        }
      }
    });

    console.log('Photo upload system initialized with fresh elements and custom file dialog');
  }

  handlePhotoSelection(file) {
    // Prevent duplicate processing
    if (this.isProcessingPhoto) {
      return;
    }
    
    this.isProcessingPhoto = true;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please select an image file');
      this.isProcessingPhoto = false;
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('File size must be less than 5MB');
      this.isProcessingPhoto = false;
      return;
    }

    this.currentPhotoFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoPreview = document.getElementById('photoPreview');
      const photoPreviewContainer = document.getElementById('photoPreviewContainer');
      
      if (photoPreview && photoPreviewContainer) {
        photoPreview.src = e.target.result;
        photoPreviewContainer.style.display = 'block';
        
        // Hide upload placeholder
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        if (uploadPlaceholder) {
          uploadPlaceholder.style.display = 'none';
        }
      }
      
      // Reset processing flag
      this.isProcessingPhoto = false;
    };
    
    reader.onerror = () => {
      this.showError('Failed to read image file');
      this.isProcessingPhoto = false;
    };
    
    reader.readAsDataURL(file);
  }

  setupCharacterCounter() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');

    if (messageInput && charCount) {
      messageInput.addEventListener('input', () => {
        const count = messageInput.value.length;
        charCount.textContent = count;
        
        // Change color when approaching limit
        if (count > 180) {
          charCount.style.color = '#FF3B30';
        } else if (count > 150) {
          charCount.style.color = '#FF9500';
        } else {
          charCount.style.color = 'var(--muted)';
        }
      });
    }
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    event.stopImmediatePropagation(); // Stop all event propagation immediately
    
    // Additional protection against rapid multiple submissions
    const now = Date.now();
    if (now - this.lastSubmissionTime < 2000) { // Prevent submissions within 2 seconds
      console.log('Submission blocked - too soon after last attempt');
      return false;
    }
    
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      console.log('Form submission already in progress, ignoring...');
      return false;
    }
    
    this.isSubmitting = true;
    this.lastSubmissionTime = now;
    console.log('Starting form submission process at:', new Date(now).toISOString());
    
    try {
      this.showLoadingState();

      // Use multiple fallbacks to ensure we get a working supabase client
      let supabaseClient = this.supabase;
      
      // If instance client doesn't have auth, try global clients
      if (!supabaseClient || !supabaseClient.auth) {
        supabaseClient = window.supabaseClient;
      }
      
      if (!supabaseClient || !supabaseClient.auth) {
        supabaseClient = window.supabase;
      }
      
      // Last resort: try to create a new client
      if (!supabaseClient || !supabaseClient.auth) {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
          const SUPABASE_URL = 'https://amxvmnzhwehxmnwzzaoy.supabase.co';
          const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteHZtbnpod2VoeG1ud3p6YW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTc5NDksImV4cCI6MjA2NzUzMzk0OX0.Vedmvf0QnCEh5TdgarY48BW2vrBgmYayQ2c-fcKFHlo';
          supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
      }
      
      if (!supabaseClient || !supabaseClient.auth) {
        throw new Error('Supabase client is not available or not properly initialized. Please refresh the page.');
      }

      console.log('Using supabase client for submission:', !!supabaseClient, 'with auth:', !!supabaseClient.auth);

      // Get form data
      const recipientNameInput = document.getElementById('recipientName');
      const messageInput = document.getElementById('messageInput');
      
      const recipientName = recipientNameInput.value.trim();
      const message = messageInput.value.trim();

      // Validate required fields
      if (!recipientName) {
        throw new Error('Please enter a recipient name');
      }

      if (!message) {
        throw new Error('Please enter a message');
      }

      if (!this.currentPhotoFile) {
        throw new Error('Please upload a photo');
      }

      // Get current user from Supabase auth ONCE
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        console.error('Auth error:', userError);
        throw new Error('You must be logged in to send a message');
      }

      console.log('Authenticated user for message:', user.id, user.email);

      // Upload photo to Supabase Storage
      const photoUrl = await this.uploadPhoto(this.currentPhotoFile, supabaseClient);
      console.log('Photo uploaded successfully:', photoUrl);

      // Save message to database using your existing 'messages' table
      const messageData = {
        author: recipientName,
        content: message,
        image_url: photoUrl,
        user_id: user.id // Always use the authenticated user's ID
      };

      console.log('Inserting single message record:', messageData);

      const { data, error } = await supabaseClient
        .from('messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Message inserted successfully - single record:', data);

      // Success
      this.showSuccess('Message sent successfully! It will be reviewed before display.');
      this.resetForm();

    } catch (error) {
      console.error('Error sending message:', error);
      this.showError(error.message || 'Failed to send message. Please try again.');
    } finally {
      this.hideLoadingState();
      this.isSubmitting = false; // Reset submission flag
      console.log('Form submission process completed');
    }
    
    return false; // Prevent any further form processing
  }

  async uploadPhoto(file, supabaseClient = null) {
    try {
      const client = supabaseClient || this.supabase || window.supabaseClient || window.supabase;
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `message_photo_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to message-photos bucket only
      const uploadResult = await client.storage
        .from('message-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadResult.error) {
        console.error('Storage upload error to message-photos bucket:', uploadResult.error);
        if (uploadResult.error.message?.includes('row-level security') || uploadResult.error.statusCode === '403') {
          throw new Error('Storage access denied to message-photos bucket. Please ensure the bucket is set up correctly and publicly accessible.');
        }
        throw new Error(`Failed to upload to message-photos bucket: ${uploadResult.error.message}`);
      }

      console.log('Successfully uploaded to message-photos bucket:', fileName);

      // Get URL from message-photos bucket
      const bucketName = 'message-photos';
      
      // Try to get a signed URL first (works better with CORS and access issues)
      try {
        const { data: signedUrlData, error: signedUrlError } = await client.storage
          .from(bucketName)
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry
        
        if (!signedUrlError && signedUrlData?.signedUrl) {
          console.log('Generated signed URL from message-photos:', signedUrlData.signedUrl);
          return signedUrlData.signedUrl;
        }
      } catch (signedUrlErr) {
        console.log('Signed URL failed, falling back to public URL:', signedUrlErr);
      }
      
      // Fallback to public URL
      const { data: urlData } = client.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log('Generated photo URL from message-photos:', urlData.publicUrl);
      console.log('Using bucket:', bucketName);
      console.log('File name:', fileName);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo: ' + (error.message || 'Unknown error'));
    }
  }

  resetForm() {
    const form = document.getElementById('messageForm');
    if (form) {
      form.reset();
    }

    // Reset photo preview
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    
    if (photoPreviewContainer) {
      photoPreviewContainer.style.display = 'none';
    }
    
    if (uploadPlaceholder) {
      uploadPlaceholder.style.display = 'flex';
    }

    this.currentPhotoFile = null;
    this.isProcessingPhoto = false;
    this.isSubmitting = false;
    this.lastSubmissionTime = 0; // Reset submission timestamp

    // Reset character counter
    const charCount = document.getElementById('charCount');
    if (charCount) {
      charCount.textContent = '0';
      charCount.style.color = 'var(--muted)';
    }
  }

  showLoadingState() {
    const submitButton = document.querySelector('.award-submit');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Sending...</span>
      `;
    }
  }

  hideLoadingState() {
    const submitButton = document.querySelector('.award-submit');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `
        <svg class="submit-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
        <span>Send Award Message</span>
      `;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </div>
        <div class="notification-message">${message}</div>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // Public method to get all messages (for admin panel)
  async getAllMessages(status = null) {
    try {
      let query = this.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Note: Your messages table doesn't have a status field
      // If you want filtering, you can add it to your table structure

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Public method to update message status (for admin panel)
  // Note: Your messages table doesn't have status/approval fields
  // This method is for future use if you add status management
  async updateMessageStatus(messageId, status, approvedBy = null) {
    try {
      // Since your messages table doesn't have status fields,
      // this method would need to be updated based on your table structure
      console.log('Message status update requested for ID:', messageId);
      console.log('Note: Your messages table structure doesn\'t include status fields');
      
      // If you want to add status management, you would need to:
      // ALTER TABLE messages ADD COLUMN status text DEFAULT 'pending';
      // ALTER TABLE messages ADD COLUMN approved_at timestamp;
      // ALTER TABLE messages ADD COLUMN approved_by text;
      
      return { message: 'Status update not implemented for current table structure' };
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }
}

// Global variable for the messages manager
let awardMessagesManager = null;

// Initialize when DOM is ready and Supabase is available
function initializeAwardMessagesManager(supabaseClient) {
  if (!supabaseClient) {
    console.error('Supabase client is required for Award Messages Manager');
    return;
  }

  // Prevent multiple initializations
  if (awardMessagesManager) {
    console.log('Award Messages Manager already initialized, skipping...');
    return awardMessagesManager;
  }

  // Validate that the supabase client has the auth property
  if (!supabaseClient.auth) {
    console.error('Invalid Supabase client - missing auth property');
    return;
  }

  awardMessagesManager = new AwardMessagesManager(supabaseClient);
  console.log('Award Messages Manager initialized successfully');
  return awardMessagesManager;
}

// Don't auto-initialize to prevent conflicts - let the main script handle it
// Auto-initialize if Supabase is already available (but only once)
// if (typeof supabase !== 'undefined' && !awardMessagesManager) {
//   initializeAwardMessagesManager(supabase);
// }
