/**
 * Official Backdrop Content Editor
 * Handles hover-based inline editing functionality for the official digital backdrop
 * Professional version - no visible edit mode buttons for live streaming
 */

class OfficialBackdropEditor {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentContent = {};
    this.saveTimeout = null;
    this.currentEditingElement = null;
    
    this.init();
  }

  async init() {
    try {
      // Load current content from database
      await this.loadContent();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('Official Backdrop Editor initialized (hover-based editing)');
    } catch (error) {
      console.error('Failed to initialize Official Backdrop Editor:', error);
    }
  }

  async loadContent() {
    try {
      const { data, error } = await this.supabase
        .from('official_page_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading official page content:', error);
        return;
      }

      if (data && data.length > 0) {
        this.currentContent = data[0];
        this.updateContentDisplay();
      } else {
        console.log('No official page content found, using default');
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }

  updateContentDisplay() {
    const content = this.currentContent;
    
    // Update each field if content exists
    if (content.title) {
      document.getElementById('officialTitle').textContent = content.title;
    }
    if (content.event_name) {
      document.getElementById('officialEventName').textContent = content.event_name;
    }
    if (content.event_subtitle) {
      document.getElementById('officialEventSubtitle').textContent = content.event_subtitle;
    }
    if (content.officiated_text) {
      document.getElementById('officialOfficiatedText').textContent = content.officiated_text;
    }
    if (content.vip_name) {
      document.getElementById('officialVipName').textContent = content.vip_name;
    }
    if (content.vip_position) {
      document.getElementById('officialVipPosition').textContent = content.vip_position;
    }
    if (content.event_date) {
      document.getElementById('officialEventDate').textContent = content.event_date;
    }
    if (content.event_time) {
      document.getElementById('officialEventTime').textContent = content.event_time;
    }
    if (content.event_location) {
      document.getElementById('officialEventLocation').innerHTML = content.event_location;
    }
    if (content.slogan) {
      document.getElementById('officialSlogan').textContent = content.slogan;
    }
    if (content.logo_url) {
      document.getElementById('officialLogo').src = content.logo_url;
    }
    if (content.minister_photo_url) {
      this.updateMinisterPhoto(content.minister_photo_url);
    }
  }

  updateMinisterPhoto(photoUrl) {
    const ministerPhoto = document.getElementById('ministerPhoto');
    const ministerPhotoSection = document.querySelector('.minister-photo-section');
    const officialContent = document.querySelector('.official-content');
    
    if (photoUrl) {
      ministerPhoto.src = photoUrl;
      ministerPhoto.style.display = 'block';
      ministerPhotoSection.classList.add('has-photo');
      officialContent.classList.add('has-minister-photo'); // Trigger content shift
    } else {
      ministerPhoto.style.display = 'none';
      ministerPhotoSection.classList.remove('has-photo');
      officialContent.classList.remove('has-minister-photo'); // Remove content shift
    }
  }

  setupEventListeners() {
    // Logo file input
    const logoFileInput = document.getElementById('logoFileInput');
    if (logoFileInput) {
      logoFileInput.addEventListener('change', (e) => this.handleLogoUpload(e));
    }

    // Minister photo file input
    const ministerFileInput = document.getElementById('ministerFileInput');
    if (ministerFileInput) {
      ministerFileInput.addEventListener('change', (e) => this.handleMinisterPhotoUpload(e));
    }

    // Setup editable fields
    this.setupEditableFields();
  }

  setupEditableFields() {
    const editableFields = document.querySelectorAll('.editable-field');
    
    editableFields.forEach(field => {
      // Double-click to edit (main interaction)
      field.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startEditing(field);
      });

      // Single click for quick access (when hovering)
      field.addEventListener('click', (e) => {
        // Only start editing if user hovers for a moment first
        if (field.matches(':hover')) {
          e.stopPropagation();
          this.startEditing(field);
        }
      });
    });

    // Click outside to save
    document.addEventListener('click', (e) => {
      if (this.currentEditingElement && !this.currentEditingElement.contains(e.target)) {
        this.finishEditing();
      }
    });

    // Escape key to cancel editing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentEditingElement) {
        this.cancelEditing();
      }
    });
  }

  startEditing(element) {
    if (this.currentEditingElement) {
      this.finishEditing();
    }

    this.currentEditingElement = element;
    element.classList.add('editing');

    const currentText = element.textContent || element.innerHTML;
    const fieldType = element.getAttribute('data-field');

    // Create appropriate input element
    let input;
    if (fieldType === 'event_location' || currentText.length > 50) {
      input = document.createElement('textarea');
      input.className = 'editable-textarea';
      input.value = element.innerHTML;
    } else {
      input = document.createElement('input');
      input.className = 'editable-input';
      input.value = currentText;
    }

    // Store original content for cancel functionality
    element.setAttribute('data-original', currentText);

    // Replace element content with input
    element.innerHTML = '';
    element.appendChild(input);

    // Focus and select all text
    input.focus();
    input.select();

    // Auto-resize textarea
    if (input.tagName === 'TEXTAREA') {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
      
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      });
    }

    // Save on Enter (except for textarea with Shift+Enter)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (input.tagName === 'TEXTAREA' && e.shiftKey) {
          // Allow new line in textarea with Shift+Enter
          return;
        }
        e.preventDefault();
        this.finishEditing();
      }
    });
  }

  finishEditing() {
    if (!this.currentEditingElement) return;

    const element = this.currentEditingElement;
    const input = element.querySelector('input, textarea');
    
    if (input) {
      const newValue = input.value.trim();
      const fieldName = element.getAttribute('data-field');

      // Update display
      if (fieldName === 'event_location') {
        element.innerHTML = newValue;
      } else {
        element.textContent = newValue;
      }

      // Save to database
      this.saveField(fieldName, newValue);
    }

    element.classList.remove('editing');
    element.removeAttribute('data-original');
    this.currentEditingElement = null;
  }

  cancelEditing() {
    if (!this.currentEditingElement) return;

    const element = this.currentEditingElement;
    const originalContent = element.getAttribute('data-original');

    // Restore original content
    if (element.getAttribute('data-field') === 'event_location') {
      element.innerHTML = originalContent;
    } else {
      element.textContent = originalContent;
    }

    element.classList.remove('editing');
    element.removeAttribute('data-original');
    this.currentEditingElement = null;
  }

  async saveField(fieldName, value) {
    if (!fieldName || value === undefined) return;

    try {
      this.showSaveIndicator('saving');

      // Get current user for updated_by field
      const user = authManager ? authManager.getCurrentUser() : null;
      const updatedBy = user ? user.email : 'unknown';

      const updateData = {
        [fieldName]: value,
        updated_at: new Date().toISOString()
      };

      // Only add updated_by if the column exists in the table
      if (this.currentContent && 'updated_by' in this.currentContent) {
        updateData.updated_by = updatedBy;
      }

      console.log('Saving field:', fieldName, 'with value:', value);
      console.log('Update data:', updateData);

      const { data, error } = await this.supabase
        .from('official_page_content')
        .update(updateData)
        .eq('is_active', true)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        this.showSaveIndicator('error', `Failed: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No rows updated - check if record exists with is_active=true');
        this.showSaveIndicator('error', 'No active record found');
        return;
      }

      console.log('Save successful, updated rows:', data.length);

      // Update local content
      this.currentContent[fieldName] = value;
      if (updatedBy && 'updated_by' in this.currentContent) {
        this.currentContent.updated_by = updatedBy;
      }

      this.showSaveIndicator('success', 'Saved');

    } catch (error) {
      console.error('Failed to save field:', error);
      this.showSaveIndicator('error', `Save failed: ${error.message}`);
    }
  }

  async handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.showSaveIndicator('saving', 'Uploading...');

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        this.showSaveIndicator('error', 'Invalid file type');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showSaveIndicator('error', 'File too large');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `official-logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        this.showSaveIndicator('error', 'Upload failed');
        return;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;

      // Update logo in UI
      document.getElementById('officialLogo').src = logoUrl;

      // Save to database
      await this.saveField('logo_url', logoUrl);

    } catch (error) {
      console.error('Failed to upload logo:', error);
      this.showSaveIndicator('error', 'Upload failed');
    }

    // Clear file input
    event.target.value = '';
  }

  async handleMinisterPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.showSaveIndicator('saving', 'Uploading minister photo...');

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        this.showSaveIndicator('error', 'Invalid file type');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit for photos
        this.showSaveIndicator('error', 'File too large (max 10MB)');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `minister-photo-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        this.showSaveIndicator('error', 'Upload failed');
        return;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Update photo in UI and show minister section
      this.updateMinisterPhoto(photoUrl);

      // Save to database
      await this.saveField('minister_photo_url', photoUrl);

    } catch (error) {
      console.error('Failed to upload minister photo:', error);
      this.showSaveIndicator('error', 'Upload failed');
    }

    // Clear file input
    event.target.value = '';
  }

  showSaveIndicator(type, message = null) {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;

    // Clear any existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    indicator.className = 'save-indicator show';
    
    if (type === 'error') {
      indicator.classList.add('error');
    } else {
      indicator.classList.remove('error');
    }

    const spinner = indicator.querySelector('.save-spinner');
    const text = indicator.querySelector('span');

    if (type === 'saving') {
      spinner.style.display = 'block';
      text.textContent = message || 'Saving...';
    } else if (type === 'success') {
      spinner.style.display = 'none';
      text.textContent = message || 'Saved';
    } else if (type === 'error') {
      spinner.style.display = 'none';
      text.textContent = message || 'Error';
    }

    // Auto-hide after delay
    const hideDelay = type === 'error' ? 3000 : 1500;
    this.saveTimeout = setTimeout(() => {
      indicator.classList.remove('show');
    }, hideDelay);
  }

  // Public method to get current content
  getCurrentContent() {
    return this.currentContent;
  }

  // Public method to refresh content from database
  async refreshContent() {
    await this.loadContent();
  }
}

// Global variable for the editor instance
let officialBackdropEditor = null;

// Initialize when DOM is ready and Supabase is available
function initializeOfficialBackdropEditor(supabaseClient) {
  if (!supabaseClient) {
    console.error('Supabase client is required for Official Backdrop Editor');
    return;
  }

  officialBackdropEditor = new OfficialBackdropEditor(supabaseClient);
  return officialBackdropEditor;
}
