// Official Page Editor functionality
class OfficialPageEditor {
  constructor(supabase) {
    this.supabase = supabase;
    this.isEditMode = false;
    this.originalContent = {};
    this.initializeEditor();
  }

  async initializeEditor() {
    // Load current content from database
    await this.loadOfficialContent();
    this.setupEditToggle();
    this.setupSaveFunction();
  }

  async loadOfficialContent() {
    try {
      const { data, error } = await this.supabase
        .from('official_page_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.updatePageContent(data);
      } else {
        // Create default content if none exists
        await this.createDefaultContent();
      }
    } catch (error) {
      console.error('Error loading official content:', error);
      // Use current HTML content as fallback
      this.extractCurrentContent();
    }
  }

  async createDefaultContent() {
    const defaultData = {
      title: "MAJLIS PERASMIAN",
      event_name: "MINGGU PERPUSTAKAAN DAN STORYWALK®",
      event_subtitle: "(Walk With The Library)",
      officiated_text: "Dirasmikan oleh,",
      vip_name: "YB. Datuk Dr. Haji Mohd Arifin Bin Datuk Haji Mohd. Arif, JP",
      vip_position: "Menteri Sains, Teknologi dan Inovasi Sabah",
      event_date: "24 Jun 2023 (Sabtu)",
      event_time: "08:00 Pagi",
      event_location: "Taman Ujana Rimba Tropika & Dewan Mataking,\nIbu Pejabat Perpustakaan Negeri Sabah",
      slogan: "SABAH MAJU JAYA",
      logo_url: "assets/2.png",
      is_active: true
    };

    try {
      const { data, error } = await this.supabase
        .from('official_page_content')
        .insert([defaultData])
        .select()
        .single();

      if (error) throw error;
      this.updatePageContent(data);
    } catch (error) {
      console.error('Error creating default content:', error);
    }
  }

  extractCurrentContent() {
    // Extract current content from HTML elements
    this.originalContent = {
      title: document.querySelector('.official-title')?.textContent || '',
      event_name: document.querySelector('.official-event')?.childNodes[0]?.textContent || '',
      event_subtitle: document.querySelector('.official-event-sub')?.textContent || '',
      officiated_text: document.querySelector('.official-officiated p:first-child')?.textContent || '',
      vip_name: document.querySelector('.official-vip')?.textContent || '',
      vip_position: document.querySelector('.official-position')?.textContent || '',
      event_date: document.querySelector('.meta-item:first-child .meta-text:first-of-type')?.textContent || '',
      event_time: document.querySelector('.meta-item:first-child .meta-text:last-of-type')?.textContent || '',
      event_location: document.querySelector('.meta-item:last-child .meta-text')?.textContent || '',
      slogan: document.querySelector('.official-slogan')?.textContent || '',
      logo_url: document.querySelector('.event-logo')?.src || document.querySelector('.event-logo')?.getAttribute('src') || ''
    };
  }

  updatePageContent(data) {
    // Update HTML elements with data
    const titleEl = document.querySelector('.official-title');
    const eventEl = document.querySelector('.official-event');
    const eventSubEl = document.querySelector('.official-event-sub');
    const officiatedEl = document.querySelector('.official-officiated p:first-child');
    const vipEl = document.querySelector('.official-vip');
    const positionEl = document.querySelector('.official-position');
    const dateEl = document.querySelector('.meta-item:first-child .meta-text:first-of-type');
    const timeEl = document.querySelector('.meta-item:first-child .meta-text:last-of-type');
    const locationEl = document.querySelector('.meta-item:last-child .meta-text');
    const sloganEl = document.querySelector('.official-slogan');
    const logoEl = document.querySelector('.event-logo');

    if (titleEl) titleEl.textContent = data.title;
    if (eventEl && eventSubEl) {
      eventEl.innerHTML = `${data.event_name} <span class="official-event-sub">${data.event_subtitle}</span>`;
    }
    if (officiatedEl) officiatedEl.textContent = data.officiated_text;
    if (vipEl) vipEl.textContent = data.vip_name;
    if (positionEl) positionEl.textContent = data.vip_position;
    if (dateEl) dateEl.textContent = data.event_date;
    if (timeEl) timeEl.textContent = data.event_time;
    if (locationEl) locationEl.innerHTML = data.event_location.replace(/\n/g, '<br>');
    if (sloganEl) sloganEl.textContent = data.slogan;
    if (logoEl && data.logo_url) logoEl.src = data.logo_url;

    this.originalContent = data;
  }

  setupEditToggle() {
    // Add inline edit functionality to each editable element
    this.setupInlineEditing();
    
    // Add save button that appears when in edit mode
    this.createSaveButton();
  }

  toggleEditMode() {
    // This method is no longer needed with inline editing
    // Content is edited directly in place
  }

  showEditForm() {
    // This method is no longer needed with inline editing
    // Individual elements are edited inline
  }

  hideEditForm() {
    // This method is no longer needed with inline editing
    // No form overlay to hide
  }

  cancelEdit() {
    // Cancel all active inline edits
    const editingElements = document.querySelectorAll('.editing');
    editingElements.forEach(element => {
      this.cancelInlineEdit(element);
    });
  }

  setupSaveFunction() {
    // Make functions globally available for inline editing
    window.officialEditor = this;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button onclick="this.parentNode.parentNode.remove()" class="notification-close">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  setupInlineEditing() {
    // Define editable elements and their corresponding database fields
    const editableElements = [
      { selector: '.official-title', field: 'title', type: 'text' },
      { selector: '.official-event', field: 'event_name', type: 'text', hasSubElement: true },
      { selector: '.official-event-sub', field: 'event_subtitle', type: 'text' },
      { selector: '.official-officiated p:first-child', field: 'officiated_text', type: 'text' },
      { selector: '.official-vip', field: 'vip_name', type: 'text' },
      { selector: '.official-position', field: 'vip_position', type: 'text' },
      { selector: '.meta-item:first-child .meta-text:first-of-type', field: 'event_date', type: 'text' },
      { selector: '.meta-item:first-child .meta-text:last-of-type', field: 'event_time', type: 'text' },
      { selector: '.meta-item:last-child .meta-text', field: 'event_location', type: 'textarea' },
      { selector: '.official-slogan', field: 'slogan', type: 'text' },
      { selector: '.event-logo', field: 'logo_url', type: 'image' }
    ];

    editableElements.forEach(config => {
      const element = document.querySelector(config.selector);
      if (!element) return;

      // Create edit container
      const container = document.createElement('div');
      container.className = 'editable-container';
      
      // Wrap the element
      element.parentNode.insertBefore(container, element);
      container.appendChild(element);

      // Add edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'inline-edit-btn';
      
      // Different icon for image editing
      if (config.type === 'image') {
        editBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        `;
      } else {
        editBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        `;
      }
      
      container.appendChild(editBtn);

      // Add click event to edit button
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startInlineEdit(element, config);
      });

      // Add hover effects
      container.addEventListener('mouseenter', () => {
        if (!element.classList.contains('editing')) {
          editBtn.style.opacity = '1';
        }
      });

      container.addEventListener('mouseleave', () => {
        if (!element.classList.contains('editing')) {
          editBtn.style.opacity = '0';
        }
      });
    });
  }

  startInlineEdit(element, config) {
    if (element.classList.contains('editing')) return;

    element.classList.add('editing');
    const container = element.parentNode;
    const editBtn = container.querySelector('.inline-edit-btn');
    
    // Hide edit button
    editBtn.style.opacity = '0';

    // Get current text or image URL
    let currentText = '';
    if (config.type === 'image') {
      currentText = element.src || element.getAttribute('src') || '';
    } else if (config.hasSubElement && config.field === 'event_name') {
      // For event name, get only the main text (excluding subtitle)
      currentText = element.childNodes[0].textContent;
    } else {
      currentText = element.textContent.replace(/[""]/g, '').trim();
    }

    // Create input element
    let input;
    if (config.type === 'image') {
      // Create a container for image editing
      const imageEditContainer = document.createElement('div');
      imageEditContainer.className = 'image-edit-container';
      
      // URL input for direct URL entry
      input = document.createElement('input');
      input.type = 'url';
      input.placeholder = 'Enter image URL (e.g., assets/logo.png)';
      input.value = currentText;
      input.className = 'inline-edit-input';
      
      // File input for local file upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'inline-file-input';
      fileInput.style.display = 'none';
      
      // Upload button
      const uploadBtn = document.createElement('button');
      uploadBtn.type = 'button';
      uploadBtn.className = 'upload-btn';
      uploadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Choose File
      `;
      
      // Image preview
      const preview = document.createElement('img');
      preview.className = 'image-preview';
      preview.src = currentText;
      preview.style.maxWidth = '100px';
      preview.style.maxHeight = '60px';
      preview.style.objectFit = 'contain';
      preview.style.border = '1px solid var(--glass-border)';
      preview.style.borderRadius = '4px';
      preview.style.marginTop = '0.5rem';
      
      // Handle file upload
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          // For now, we'll use local file path - in production, you'd upload to Supabase Storage
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            input.value = dataUrl;
            preview.src = dataUrl;
          };
          reader.readAsDataURL(file);
        }
      });
      
      // Handle URL input changes
      input.addEventListener('input', () => {
        if (input.value) {
          preview.src = input.value;
        }
      });
      
      imageEditContainer.appendChild(input);
      imageEditContainer.appendChild(uploadBtn);
      imageEditContainer.appendChild(fileInput);
      imageEditContainer.appendChild(preview);
      
      input = imageEditContainer;
    } else if (config.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 2;
      input.value = currentText.replace(/<br>/g, '\n');
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.value = currentText;
    }

    if (config.type !== 'image') {
      input.className = 'inline-edit-input';
      
      // Style the input to match the original element
      const computedStyle = window.getComputedStyle(element);
      input.style.fontSize = computedStyle.fontSize;
      input.style.fontFamily = computedStyle.fontFamily;
      input.style.fontWeight = computedStyle.fontWeight;
      input.style.color = computedStyle.color;
      input.style.textAlign = computedStyle.textAlign;
      input.style.width = '100%';
      input.style.background = 'rgba(255, 255, 255, 0.1)';
      input.style.border = '2px solid var(--primary)';
      input.style.borderRadius = '4px';
      input.style.padding = '0.25rem 0.5rem';
      input.style.outline = 'none';
    }

    // Create action buttons
    const actionContainer = document.createElement('div');
    actionContainer.className = 'inline-edit-actions';
    actionContainer.innerHTML = `
      <button class="inline-save-btn" title="Save">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </button>
      <button class="inline-cancel-btn" title="Cancel">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    // Hide original element and show input
    element.style.display = 'none';
    container.appendChild(input);
    container.appendChild(actionContainer);

    // Focus input and select text
    input.focus();
    input.select();

    // Handle save
    actionContainer.querySelector('.inline-save-btn').addEventListener('click', () => {
      const newValue = config.type === 'image' ? input.querySelector('input').value : input.value;
      this.saveInlineEdit(element, config, newValue, currentText);
    });

    // Handle cancel
    actionContainer.querySelector('.inline-cancel-btn').addEventListener('click', () => {
      this.cancelInlineEdit(element);
    });

    // Handle Enter key (save) and Escape key (cancel) - only for non-image inputs
    if (config.type !== 'image') {
      const inputElement = config.type === 'textarea' ? input : input;
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const newValue = inputElement.value;
          this.saveInlineEdit(element, config, newValue, currentText);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelInlineEdit(element);
        }
      });
    }

    // Handle click outside to cancel
    const handleClickOutside = (e) => {
      if (!container.contains(e.target)) {
        this.cancelInlineEdit(element);
        document.removeEventListener('click', handleClickOutside);
      }
    };
    setTimeout(() => document.addEventListener('click', handleClickOutside), 100);
  }

  async saveInlineEdit(element, config, newValue, oldValue) {
    if (newValue.trim() === oldValue.trim()) {
      this.cancelInlineEdit(element);
      return;
    }

    const container = element.parentNode;
    const saveBtn = container.querySelector('.inline-save-btn');
    
    // Show loading state
    if (saveBtn) {
      saveBtn.innerHTML = `
        <div style="width: 12px; height: 12px; border: 2px solid transparent; border-top: 2px solid currentColor; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      `;
    }

    try {
      // Update the content in database
      const updateData = {
        [config.field]: newValue.trim(),
        updated_at: new Date().toISOString()
      };

      // Deactivate old content
      await this.supabase
        .from('official_page_content')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new content with updated field
      const newContent = { ...this.originalContent, ...updateData, is_active: true };
      delete newContent.id; // Remove id so it creates a new record

      const { data, error } = await this.supabase
        .from('official_page_content')
        .insert([newContent])
        .select()
        .single();

      if (error) throw error;

      // Update local content
      this.originalContent = data;

      // Update the display
      this.updateElementContent(element, config, newValue);
      this.cancelInlineEdit(element);

      // Show success notification
      this.showNotification('Content updated successfully!', 'success');

    } catch (error) {
      console.error('Error saving content:', error);
      this.showNotification('Failed to save changes. Please try again.', 'error');
      this.cancelInlineEdit(element);
    }
  }

  updateElementContent(element, config, newValue) {
    if (config.type === 'image') {
      element.src = newValue;
    } else if (config.hasSubElement && config.field === 'event_name') {
      // For event name, preserve the subtitle
      const subtitle = element.querySelector('.official-event-sub');
      element.innerHTML = `${newValue} `;
      if (subtitle) {
        element.appendChild(subtitle);
      }
    } else if (config.field === 'event_location') {
      element.innerHTML = newValue.replace(/\n/g, '<br>');
    } else if (config.field === 'slogan') {
      element.textContent = `"${newValue}"`;
    } else {
      element.textContent = newValue;
    }
  }

  cancelInlineEdit(element) {
    const container = element.parentNode;
    const input = container.querySelector('.inline-edit-input');
    const actions = container.querySelector('.inline-edit-actions');
    const editBtn = container.querySelector('.inline-edit-btn');

    // Remove input and actions
    if (input) input.remove();
    if (actions) actions.remove();

    // Show original element
    element.style.display = '';
    element.classList.remove('editing');

    // Reset edit button
    if (editBtn) {
      editBtn.style.opacity = '0';
    }
  }

  createSaveButton() {
    // Add a main save button that appears when content has been edited
    const officialPage = document.querySelector('.official-backdrop-page');
    if (!officialPage) return;

    const saveAllButton = document.createElement('button');
    saveAllButton.className = 'save-all-btn';
    saveAllButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
      <span>All Changes Saved</span>
    `;
    saveAllButton.style.display = 'none'; // Initially hidden

    officialPage.appendChild(saveAllButton);
  }
}

// Initialize when DOM is loaded
let officialPageEditor = null;

// Function to initialize the editor (called from main script)
function initializeOfficialEditor(supabase) {
  officialPageEditor = new OfficialPageEditor(supabase);
  return officialPageEditor;
}
