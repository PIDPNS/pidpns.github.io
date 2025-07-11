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
      // Show professional loading state
      this.showLoadingState();
      
      // Load current content from database
      await this.loadContent();
      
      // Hide loading and show content
      this.hideLoadingState();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('Official Backdrop Editor initialized (hover-based editing)');
    } catch (error) {
      console.error('Failed to initialize Official Backdrop Editor:', error);
      this.hideLoadingState();
    }
  }

  showLoadingState() {
    const officialContent = document.getElementById('officialContent');
    const loadingIndicator = document.getElementById('officialBackdropLoading');
    
    if (officialContent && loadingIndicator) {
      // Add loading class to content for skeleton effect
      officialContent.classList.add('loading');
      
      // Show loading indicator
      loadingIndicator.classList.add('show');
      
      // Hide any upload overlays and interaction elements
      officialContent.style.pointerEvents = 'none';
    }
  }

  hideLoadingState() {
    const officialContent = document.getElementById('officialContent');
    const loadingIndicator = document.getElementById('officialBackdropLoading');
    
    if (officialContent && loadingIndicator) {
      // Remove loading class to show real content
      officialContent.classList.remove('loading');
      
      // Hide loading indicator
      loadingIndicator.classList.remove('show');
      
      // Restore interactions
      officialContent.style.pointerEvents = 'auto';
    }
  }

  async loadContent() {
    try {
      // Update loading message
      this.updateLoadingMessage('Connecting to database...');
      
      const { data, error } = await this.supabase
        .from('official_page_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading official page content:', error);
        this.updateLoadingMessage('Error loading content', true);
        return;
      }

      // Update loading message
      this.updateLoadingMessage('Formatting content...');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data && data.length > 0) {
        this.currentContent = data[0];
        this.updateContentDisplay();
      } else {
        console.log('No official page content found, using default');
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      this.updateLoadingMessage('Failed to load content', true);
    }
  }

  updateLoadingMessage(message, isError = false) {
    const loadingText = document.querySelector('.official-loading-text');
    const loadingSubtext = document.querySelector('.official-loading-subtext');
    
    if (loadingText) {
      loadingText.textContent = isError ? 'Loading Error' : 'Loading Official Backdrop';
    }
    
    if (loadingSubtext) {
      loadingSubtext.textContent = message;
      loadingSubtext.style.color = isError ? '#FF3B30' : 'var(--muted)';
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
    if (content.event_description) {
      document.getElementById('officialEventDescription').textContent = content.event_description;
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
    
    // Load additional logos if they exist
    if (content.additional_logos && Array.isArray(content.additional_logos)) {
      console.log('Loading additional logos:', content.additional_logos);
      this.loadAdditionalLogos(content.additional_logos);
    } else {
      console.log('No additional logos found in content:', content.additional_logos);
    }

    // Load bottom logos if they exist
    if (content.bottom_logos && Array.isArray(content.bottom_logos)) {
      console.log('Loading bottom logos:', content.bottom_logos);
      this.loadBottomLogos(content.bottom_logos);
    } else {
      console.log('No bottom logos found in content:', content.bottom_logos);
    }
  }

  updateMinisterPhoto(photoUrl) {
    const ministerPhoto = document.getElementById('ministerPhoto');
    const ministerPhotoSection = document.querySelector('.minister-photo-section');
    
    if (photoUrl) {
      ministerPhoto.src = photoUrl;
      ministerPhoto.style.display = 'block';
      ministerPhotoSection.classList.add('has-photo');
    } else {
      ministerPhoto.style.display = 'none';
      ministerPhotoSection.classList.remove('has-photo');
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

    // Setup multi-logo functionality
    this.setupMultiLogoFunctionality();

    // Setup editable fields
    this.setupEditableFields();

    // Setup presentation mode (double-click navigation hide/show)
    this.setupPresentationMode();
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

  setupMultiLogoFunctionality() {
    // Setup top logo add zones
    const logoAddZones = document.querySelectorAll('.logo-add-zone:not(.bottom-left-zone):not(.bottom-right-zone)');
    console.log('Found top logo add zones:', logoAddZones.length);
    
    logoAddZones.forEach((zone, index) => {
      const input = zone.querySelector('.logo-add-input');
      const position = zone.dataset.position;
      console.log(`Top Zone ${index + 1}: position="${position}", input found:`, !!input);
      
      if (input) {
        input.addEventListener('change', (e) => {
          console.log(`Top logo upload triggered for position: ${position}`);
          this.handleLogoAdd(e, position);
        });
      }
    });

    // Setup bottom logo add zones
    const bottomLogoAddZones = document.querySelectorAll('.bottom-left-zone, .bottom-right-zone');
    
    bottomLogoAddZones.forEach((zone, index) => {
      const input = zone.querySelector('.logo-add-input');
      const position = zone.dataset.position;
      
      if (input) {
        input.addEventListener('change', (e) => {
          this.handleBottomLogoAdd(e, position);
        });
      }
    });
  }

  async handleLogoAdd(event, position) {
    const file = event.target.files[0];
    console.log(`handleLogoAdd called for position: ${position}, file:`, file?.name);
    
    if (!file) return;

    // Check for duplicate file names
    const existingLogos = document.querySelectorAll('.editable-logo-container.additional-logo img');
    const existingFileNames = Array.from(existingLogos).map(img => {
      const url = img.src;
      return url.substring(url.lastIndexOf('/') + 1);
    });
    
    if (existingFileNames.some(name => name.includes(file.name.replace(/\.[^/.]+$/, "")))) {
      alert('A logo with the same name already exists. Please choose a different logo.');
      event.target.value = '';
      return;
    }

    try {
      this.showSaveIndicator();

      // Upload to Supabase Storage
      const fileName = `logo_${Date.now()}_${file.name}`;
      console.log(`Uploading file: ${fileName} for position: ${position}`);
      
      const { data, error } = await this.supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      console.log(`File uploaded successfully, public URL: ${publicUrl}`);

      // Check if this URL already exists
      const existingUrls = Array.from(existingLogos).map(img => img.src);
      if (existingUrls.includes(publicUrl)) {
        alert('This logo is already added.');
        event.target.value = '';
        this.hideSaveIndicator();
        return;
      }

      // Add logo to the container at the specified position
      this.addLogoToContainer(publicUrl, position);

      // Save to database (extend current content with additional logos)
      await this.saveAdditionalLogos();

      this.hideSaveIndicator();
      
      // Clear the input
      event.target.value = '';

    } catch (error) {
      console.error('Error adding logo:', error);
      this.hideSaveIndicator();
      alert('Failed to add logo. Please try again.');
    }
  }

  addLogoToContainer(logoUrl, position) {
    console.log('Adding logo to container:', logoUrl, position);
    const logosContainer = document.getElementById('logosContainer');
    console.log('Logos container found:', logosContainer);
    
    if (!logosContainer) {
      console.error('Logos container not found!');
      return;
    }

    const logoId = `logo_${Date.now()}`;
    
    // Create new logo element
    const logoElement = document.createElement('div');
    logoElement.className = 'editable-logo-container additional-logo';
    logoElement.dataset.logoId = logoId;
    logoElement.innerHTML = `
      <img src="${logoUrl}" alt="Additional Logo" class="event-logo">
      <div class="logo-upload-overlay">
        <div class="logo-upload-text">Click to change</div>
        <input type="file" class="logo-file-input" accept="image/*">
      </div>
      <button class="logo-remove-btn" title="Remove logo">&times;</button>
    `;

    // Add event listeners for the new logo
    const fileInput = logoElement.querySelector('.logo-file-input');
    fileInput.addEventListener('change', (e) => this.handleLogoReplace(e, logoElement));
    
    const removeBtn = logoElement.querySelector('.logo-remove-btn');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeLogo(logoElement);
    });

    // Insert based on position
    if (position === 'left') {
      console.log('Inserting logo at left position (beginning of container)');
      logosContainer.insertBefore(logoElement, logosContainer.firstChild);
    } else {
      console.log('Inserting logo at right position (end of container)');
      logosContainer.appendChild(logoElement);
    }

    console.log('Logo element added to container, current logo count:', logosContainer.children.length);

    // Trigger entrance animation by adding the show class
    setTimeout(() => {
      logoElement.classList.add('show');
      console.log('Logo show class added');
    }, 10);
  }

  async handleLogoReplace(event, logoElement) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.showSaveIndicator();

      // Upload new logo
      const fileName = `logo_${Date.now()}_${file.name}`;
      const { data, error } = await this.supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update the logo image
      const img = logoElement.querySelector('.event-logo');
      img.src = publicUrl;

      // Save to database
      await this.saveAdditionalLogos();

      this.hideSaveIndicator();
      event.target.value = '';

    } catch (error) {
      console.error('Error replacing logo:', error);
      this.hideSaveIndicator();
      alert('Failed to replace logo. Please try again.');
    }
  }

  removeLogo(logoElement) {
    // Animate out
    logoElement.style.opacity = '0';
    logoElement.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      logoElement.remove();
      this.saveAdditionalLogos();
    }, 300);
  }

  async saveAdditionalLogos() {
    // Get only additional logos (exclude the main logo) with position information
    const logosContainer = document.getElementById('logosContainer');
    const mainLogo = logosContainer.querySelector('.main-logo');
    const additionalLogoElements = logosContainer.querySelectorAll('.editable-logo-container.additional-logo');
    
    const additionalLogos = Array.from(additionalLogoElements)
      .filter(element => {
        const img = element.querySelector('img');
        return img && img.src && img.src.includes('supabase.co');
      })
      .map(element => {
        const img = element.querySelector('img');
        // Determine position based on DOM order relative to main logo
        const allLogos = Array.from(logosContainer.children);
        const mainLogoIndex = allLogos.indexOf(mainLogo);
        const currentLogoIndex = allLogos.indexOf(element);
        const position = currentLogoIndex < mainLogoIndex ? 'left' : 'right';
        
        return {
          url: img.src,
          position: position
        };
      });

    console.log('Saving additional logos with positions:', additionalLogos);

    // Remove duplicates based on URL
    const uniqueAdditionalLogos = additionalLogos.filter((logo, index, self) => 
      index === self.findIndex(l => l.url === logo.url)
    );
    
    console.log('Unique additional logos:', uniqueAdditionalLogos);

    // Update current content with additional logos
    this.currentContent.additional_logos = uniqueAdditionalLogos;

    console.log('Additional logos to save:', this.currentContent.additional_logos);

    try {
      // Save to database using the same pattern as saveField
      const { data, error } = await this.supabase
        .from('official_page_content')
        .update({ 
          additional_logos: this.currentContent.additional_logos,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .select();

      if (error) {
        console.error('Error saving additional logos to database:', error);
        this.showSaveIndicator('error', `Failed: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No rows updated when saving additional logos');
        this.showSaveIndicator('error', 'No active record found');
        return;
      }

      console.log('Additional logos saved successfully to database');
      this.showSaveIndicator('success', 'Logos saved');
    } catch (error) {
      console.error('Error saving additional logos:', error);
      this.showSaveIndicator('error', 'Failed to save logos');
    }
  }

  async handleBottomLogoAdd(event, position) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for bottom logos
      alert('File too large (max 5MB).');
      event.target.value = '';
      return;
    }

    // Check for duplicate file names in bottom logos
    const existingBottomLogos = document.querySelectorAll('.bottom-logo-container img');
    const existingFileNames = Array.from(existingBottomLogos).map(img => {
      const url = img.src;
      return url.substring(url.lastIndexOf('/') + 1);
    });
    
    if (existingFileNames.some(name => name.includes(file.name.replace(/\.[^/.]+$/, "")))) {
      alert('A bottom logo with the same name already exists. Please choose a different logo.');
      event.target.value = '';
      return;
    }

    try {
      this.showSaveIndicator('saving', 'Uploading bottom logo...');

      // Upload to Supabase Storage
      const fileName = `bottom_logo_${Date.now()}_${file.name}`;
      
      const { data, error } = await this.supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Check if this URL already exists in bottom logos
      const existingUrls = Array.from(existingBottomLogos).map(img => img.src);
      if (existingUrls.includes(publicUrl)) {
        alert('This bottom logo is already added.');
        event.target.value = '';
        return;
      }

      // Add logo to the bottom container at the specified position
      this.addBottomLogoToContainer(publicUrl, position);

      // Save to database
      await this.saveBottomLogos();

      this.showSaveIndicator('success', 'Bottom logo added');
      
      // Clear the input
      event.target.value = '';

    } catch (error) {
      console.error('Error adding bottom logo:', error);
      this.showSaveIndicator('error', `Failed: ${error.message || 'Unknown error'}`);
    }
  }

  addBottomLogoToContainer(logoUrl, position) {
    const bottomLogosContainer = document.getElementById('bottomLogosContainer');
    
    if (!bottomLogosContainer) {
      console.error('Bottom logos container not found!');
      return;
    }

    const logoId = `bottom_logo_${Date.now()}`;
    
    // Create new bottom logo element
    const logoElement = document.createElement('div');
    logoElement.className = 'bottom-logo-container additional-logo';
    logoElement.dataset.logoId = logoId;
    logoElement.innerHTML = `
      <img src="${logoUrl}" alt="Bottom Logo" class="bottom-logo">
      <div class="bottom-logo-upload-overlay">
        <div class="logo-upload-text">Change</div>
        <input type="file" class="logo-file-input" accept="image/*">
      </div>
      <button class="bottom-logo-remove-btn" title="Remove logo">&times;</button>
    `;

    // Add event listeners for the new bottom logo
    const fileInput = logoElement.querySelector('.logo-file-input');
    fileInput.addEventListener('change', (e) => this.handleBottomLogoReplace(e, logoElement));
    
    const removeBtn = logoElement.querySelector('.bottom-logo-remove-btn');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeBottomLogo(logoElement);
    });

    // Insert based on position
    if (position === 'bottom-left') {
      bottomLogosContainer.insertBefore(logoElement, bottomLogosContainer.firstChild);
    } else {
      bottomLogosContainer.appendChild(logoElement);
    }

    // Trigger entrance animation by adding the show class
    setTimeout(() => {
      logoElement.classList.add('show');
    }, 10);
  }

  async handleBottomLogoReplace(event, logoElement) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.showSaveIndicator();

      // Upload new file
      const fileName = `bottom_logo_${Date.now()}_${file.name}`;
      const { data, error } = await this.supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update the image source
      const img = logoElement.querySelector('img');
      img.src = publicUrl;

      // Save to database
      await this.saveBottomLogos();

      this.hideSaveIndicator();
      event.target.value = '';

    } catch (error) {
      console.error('Error replacing bottom logo:', error);
      this.hideSaveIndicator();
      alert('Failed to replace bottom logo. Please try again.');
    }
  }

  async removeBottomLogo(logoElement) {
    try {
      // Get the logo URL before removing the element
      const img = logoElement.querySelector('img');
      const logoUrl = img ? img.src : null;
      
      // Extract filename from URL for storage deletion
      let fileName = null;
      if (logoUrl && logoUrl.includes('supabase.co')) {
        fileName = logoUrl.substring(logoUrl.lastIndexOf('/') + 1);
      }

      // Animate out
      logoElement.style.opacity = '0';
      logoElement.style.transform = 'scale(0.8)';
      
      setTimeout(async () => {
        // Remove from DOM
        logoElement.remove();
        
        // Save updated logos to database
        await this.saveBottomLogos();
        
        // Delete file from Supabase Storage
        if (fileName) {
          try {
            const { error } = await this.supabase.storage
              .from('logos')
              .remove([fileName]);
              
            if (error) {
              console.error('Error deleting logo file from storage:', error);
            } else {
              console.log('Logo file deleted from storage:', fileName);
            }
          } catch (storageError) {
            console.error('Failed to delete from storage:', storageError);
          }
        }
        
        this.showSaveIndicator('success', 'Bottom logo removed');
      }, 300);
      
    } catch (error) {
      console.error('Error removing bottom logo:', error);
      this.showSaveIndicator('error', 'Failed to remove logo');
    }
  }

  async saveBottomLogos() {
    // Get only bottom logos with position information
    const bottomLogosContainer = document.getElementById('bottomLogosContainer');
    const bottomLogoElements = bottomLogosContainer.querySelectorAll('.bottom-logo-container');
    
    const bottomLogos = Array.from(bottomLogoElements)
      .filter(element => {
        const img = element.querySelector('img');
        return img && img.src && img.src.includes('supabase.co');
      })
      .map(element => {
        const img = element.querySelector('img');
        // Determine position based on DOM order in bottom container
        const allBottomLogos = Array.from(bottomLogosContainer.children);
        const currentLogoIndex = allBottomLogos.indexOf(element);
        const position = currentLogoIndex === 0 ? 'bottom-left' : 'bottom-right';
        
        return {
          url: img.src,
          position: position
        };
      });

    console.log('Saving bottom logos with positions:', bottomLogos);

    // Remove duplicates based on URL
    const uniqueBottomLogos = bottomLogos.filter((logo, index, self) => 
      index === self.findIndex(l => l.url === logo.url)
    );
    
    console.log('Unique bottom logos:', uniqueBottomLogos);

    // Update current content with bottom logos
    this.currentContent.bottom_logos = uniqueBottomLogos;

    console.log('Bottom logos to save:', this.currentContent.bottom_logos);

    try {
      // First, let's try to see if the column exists by checking the current content
      console.log('Current content before saving bottom logos:', this.currentContent);
      
      // Save to database
      const { data, error } = await this.supabase
        .from('official_page_content')
        .update({ 
          bottom_logos: this.currentContent.bottom_logos,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .select();

      if (error) {
        console.error('Error saving bottom logos to database:', error);
        console.error('Error details:', error.details, error.hint, error.message);
        
        // If column doesn't exist, let's try to save without it for now
        if (error.message.includes('column "bottom_logos" does not exist')) {
          console.log('bottom_logos column does not exist, need to run database migration');
          alert('Database needs to be updated with bottom_logos column. Please run the database setup script.');
          throw new Error('Database column missing: bottom_logos');
        } else {
          console.error('Database save error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      }

      if (!data || data.length === 0) {
        console.warn('No rows updated when saving bottom logos');
        this.showSaveIndicator('error', 'No active record found');
        return;
      }

      console.log('Bottom logos saved successfully to database');
      this.showSaveIndicator('success', 'Bottom logos saved');
    } catch (error) {
      console.error('Error saving bottom logos:', error);
      this.showSaveIndicator('error', 'Failed to save bottom logos');
    }
  }

  loadBottomLogos(bottomLogos) {
    const bottomLogosContainer = document.getElementById('bottomLogosContainer');
    if (!bottomLogosContainer || !bottomLogos || bottomLogos.length === 0) {
      return;
    }

    // Clear existing bottom logos
    const existingBottomLogos = bottomLogosContainer.querySelectorAll('.bottom-logo-container');
    existingBottomLogos.forEach(logo => logo.remove());

    // Handle both old format (array of strings) and new format (array of objects)
    bottomLogos.forEach((logoData, index) => {
      let logoUrl, position;
      
      if (typeof logoData === 'string') {
        // Old format - just URL, default to right
        logoUrl = logoData;
        position = 'bottom-right';
      } else if (typeof logoData === 'object' && logoData.url) {
        // New format - object with url and position
        logoUrl = logoData.url;
        position = logoData.position || 'bottom-right';
      } else {
        console.warn('Invalid bottom logo data:', logoData);
        return;
      }
      
      // Check if the image URL is accessible before adding
      this.checkImageAndLoad(logoUrl, position);
    });
  }

  // Helper function to check if image exists before loading
  checkImageAndLoad(logoUrl, position) {
    const img = new Image();
    img.onload = () => {
      // Image loaded successfully, add to container
      this.addBottomLogoToContainer(logoUrl, position);
    };
    img.onerror = () => {
      // Image failed to load, skip it and clean from database
      console.warn(`Bottom logo image failed to load: ${logoUrl}`);
      this.cleanupBrokenBottomLogos();
    };
    img.src = logoUrl;
    
    // Set a timeout to avoid hanging on slow/broken images
    setTimeout(() => {
      if (!img.complete) {
        console.warn(`Bottom logo image timeout: ${logoUrl}`);
        this.cleanupBrokenBottomLogos();
      }
    }, 5000); // 5 second timeout
  }

  // Clean up broken logos from database
  async cleanupBrokenBottomLogos() {
    try {
      // Get current working logos
      const bottomLogosContainer = document.getElementById('bottomLogosContainer');
      const workingLogos = Array.from(bottomLogosContainer.querySelectorAll('.bottom-logo-container img'))
        .map(img => ({
          url: img.src,
          position: 'bottom-right' // Default position for cleanup
        }));
      
      // Update database with only working logos
      if (this.currentContent.bottom_logos !== workingLogos) {
        this.currentContent.bottom_logos = workingLogos;
        await this.saveBottomLogos();
      }
    } catch (error) {
      console.error('Error cleaning up broken bottom logos:', error);
    }
  }

  // Presentation Mode - Double-click to hide/show navigation
  setupPresentationMode() {
    const officialBackdropPage = document.querySelector('.official-backdrop-page');
    const footer = document.querySelector('.footer');
    const presentationHint = document.getElementById('presentationHint');
    let isHidden = false;
    let hintTimeout = null;

    if (!officialBackdropPage || !footer || !presentationHint) return;

    // Double-click event listener for presentation mode
    officialBackdropPage.addEventListener('dblclick', (e) => {
      // Prevent double-click on editable elements from triggering presentation mode
      if (e.target.classList.contains('editable-field') || 
          e.target.closest('.editable-field') ||
          e.target.closest('.minister-photo-container') ||
          e.target.closest('.logo-container')) {
        return;
      }

      isHidden = !isHidden;
      
      if (isHidden) {
        footer.classList.add('presentation-mode');
        officialBackdropPage.classList.add('nav-hidden');
        this.showPresentationHint('Navigation hidden - Double-click to show');
      } else {
        footer.classList.remove('presentation-mode');
        officialBackdropPage.classList.remove('nav-hidden');
        this.showPresentationHint('Navigation visible - Double-click to hide');
      }
    });

    // Show hint on first hover for guidance
    let hintShown = false;
    officialBackdropPage.addEventListener('mouseenter', () => {
      if (!hintShown && !isHidden) {
        this.showPresentationHint('Double-click anywhere to enter presentation mode', 3000);
        hintShown = true;
      }
    });
  }

  showPresentationHint(message, duration = 2000) {
    const presentationHint = document.getElementById('presentationHint');
    if (!presentationHint) return;

    presentationHint.textContent = message;
    presentationHint.classList.add('show');

    // Clear any existing timeout
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
    }

    // Hide hint after duration
    this.hintTimeout = setTimeout(() => {
      presentationHint.classList.remove('show');
    }, duration);
  }

  // Public method to get current content
  getCurrentContent() {
    return this.currentContent;
  }

  // Public method to refresh content from database
  async refreshContent() {
    await this.loadContent();
  }

  loadAdditionalLogos(additionalLogos) {
    const logosContainer = document.getElementById('logosContainer');
    if (!logosContainer || !additionalLogos || additionalLogos.length === 0) {
      return;
    }

    // Clear existing additional logos (keep the main logo)
    const existingAdditionalLogos = logosContainer.querySelectorAll('.editable-logo-container.additional-logo');
    existingAdditionalLogos.forEach(logo => logo.remove());

    // Handle both old format (array of strings) and new format (array of objects)
    additionalLogos.forEach((logoData, index) => {
      let logoUrl, position;
      
      if (typeof logoData === 'string') {
        // Old format - just URL, default to right
        logoUrl = logoData;
        position = 'right';
      } else if (typeof logoData === 'object' && logoData.url) {
        // New format - object with url and position
        logoUrl = logoData.url;
        position = logoData.position || 'right';
      } else {
        console.warn('Invalid logo data:', logoData);
        return;
      }
      
      console.log(`Loading logo: ${logoUrl} at position: ${position}`);
      this.addLogoToContainer(logoUrl, position);
    });
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

  hideSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;

    // Clear any existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    indicator.classList.remove('show');
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
