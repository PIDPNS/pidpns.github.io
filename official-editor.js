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
      logo_url: document.querySelector('.event-logo')?.src || ''
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
    if (logoEl) logoEl.src = data.logo_url;

    this.originalContent = data;
  }

  setupEditToggle() {
    // Add edit button to official page
    const officialPage = document.querySelector('.official-backdrop-page');
    if (!officialPage) return;

    const editButton = document.createElement('button');
    editButton.className = 'official-edit-btn';
    editButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <span>Edit Page</span>
    `;
    editButton.onclick = () => this.toggleEditMode();

    officialPage.appendChild(editButton);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      this.showEditForm();
    } else {
      this.hideEditForm();
    }
  }

  showEditForm() {
    const officialContent = document.querySelector('.official-content');
    if (!officialContent) return;

    // Hide original content
    const originalElements = officialContent.children;
    Array.from(originalElements).forEach(el => {
      if (!el.classList.contains('edit-form-container')) {
        el.style.display = 'none';
      }
    });

    // Create edit form
    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form-container scroll-to-view';
    formContainer.innerHTML = `
      <div class="edit-form">
        <h2 class="edit-form-title">Edit Official Page Content</h2>
        
        <div class="edit-form-grid">
          <div class="form-group">
            <label for="edit-title">Page Title</label>
            <input type="text" id="edit-title" value="${this.originalContent.title || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-event-name">Event Name</label>
            <input type="text" id="edit-event-name" value="${this.originalContent.event_name || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-event-subtitle">Event Subtitle</label>
            <input type="text" id="edit-event-subtitle" value="${this.originalContent.event_subtitle || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-officiated-text">Officiated Text</label>
            <input type="text" id="edit-officiated-text" value="${this.originalContent.officiated_text || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-vip-name">VIP Name</label>
            <input type="text" id="edit-vip-name" value="${this.originalContent.vip_name || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-vip-position">VIP Position</label>
            <input type="text" id="edit-vip-position" value="${this.originalContent.vip_position || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-event-date">Event Date</label>
            <input type="text" id="edit-event-date" value="${this.originalContent.event_date || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-event-time">Event Time</label>
            <input type="text" id="edit-event-time" value="${this.originalContent.event_time || ''}" />
          </div>

          <div class="form-group full-width">
            <label for="edit-event-location">Event Location</label>
            <textarea id="edit-event-location" rows="3">${this.originalContent.event_location || ''}</textarea>
          </div>

          <div class="form-group">
            <label for="edit-slogan">Slogan</label>
            <input type="text" id="edit-slogan" value="${this.originalContent.slogan || ''}" />
          </div>

          <div class="form-group">
            <label for="edit-logo-url">Logo URL</label>
            <input type="text" id="edit-logo-url" value="${this.originalContent.logo_url || ''}" />
          </div>
        </div>

        <div class="edit-form-actions">
          <button type="button" class="btn-cancel" onclick="officialEditor.cancelEdit()">Cancel</button>
          <button type="button" class="btn-save" onclick="officialEditor.saveChanges()">Save Changes</button>
        </div>
      </div>
    `;

    officialContent.appendChild(formContainer);

    // Scroll to the edit form smoothly
    setTimeout(() => {
      const officialPage = document.querySelector('.official-backdrop-page');
      if (officialPage) {
        officialPage.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100);

    // Update edit button
    const editBtn = document.querySelector('.official-edit-btn');
    if (editBtn) {
      editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span>Cancel</span>
      `;
    }
  }

  hideEditForm() {
    const formContainer = document.querySelector('.edit-form-container');
    if (formContainer) {
      formContainer.remove();
    }

    // Show original content
    const officialContent = document.querySelector('.official-content');
    if (officialContent) {
      Array.from(officialContent.children).forEach(el => {
        el.style.display = '';
      });
    }

    // Scroll back to top to center the content
    setTimeout(() => {
      const officialPage = document.querySelector('.official-backdrop-page');
      if (officialPage) {
        officialPage.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100);

    // Update edit button
    const editBtn = document.querySelector('.official-edit-btn');
    if (editBtn) {
      editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Edit Page</span>
      `;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.hideEditForm();
  }

  async saveChanges() {
    const formData = {
      title: document.getElementById('edit-title').value,
      event_name: document.getElementById('edit-event-name').value,
      event_subtitle: document.getElementById('edit-event-subtitle').value,
      officiated_text: document.getElementById('edit-officiated-text').value,
      vip_name: document.getElementById('edit-vip-name').value,
      vip_position: document.getElementById('edit-vip-position').value,
      event_date: document.getElementById('edit-event-date').value,
      event_time: document.getElementById('edit-event-time').value,
      event_location: document.getElementById('edit-event-location').value,
      slogan: document.getElementById('edit-slogan').value,
      logo_url: document.getElementById('edit-logo-url').value,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    try {
      // Show saving state
      const saveBtn = document.querySelector('.btn-save');
      if (saveBtn) {
        saveBtn.innerHTML = 'Saving...';
        saveBtn.disabled = true;
      }

      // Deactivate old content
      await this.supabase
        .from('official_page_content')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new content
      const { data, error } = await this.supabase
        .from('official_page_content')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      // Update page content
      this.updatePageContent(data);
      
      // Exit edit mode
      this.isEditMode = false;
      this.hideEditForm();

      // Show success message
      this.showNotification('Official page content updated successfully!', 'success');

    } catch (error) {
      console.error('Error saving content:', error);
      this.showNotification('Failed to save content. Please try again.', 'error');
      
      // Reset save button
      const saveBtn = document.querySelector('.btn-save');
      if (saveBtn) {
        saveBtn.innerHTML = 'Save Changes';
        saveBtn.disabled = false;
      }
    }
  }

  setupSaveFunction() {
    // Make save function globally available
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
}

// Initialize when DOM is loaded
let officialPageEditor = null;

// Function to initialize the editor (called from main script)
function initializeOfficialEditor(supabase) {
  officialPageEditor = new OfficialPageEditor(supabase);
  return officialPageEditor;
}
