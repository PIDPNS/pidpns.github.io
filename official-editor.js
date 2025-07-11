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
    // Add global edit mode toggle
    const officialPage = document.querySelector('.official-backdrop-page');
    if (!officialPage) return;

    const editButton = document.createElement('button');
    editButton.className = 'official-edit-toggle';
    editButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <span>Edit Mode</span>
    `;
    editButton.onclick = () => this.toggleEditMode();

    officialPage.appendChild(editButton);

    // Setup inline editing for each editable element
    this.setupInlineEditing();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    const officialPage = document.querySelector('.official-backdrop-page');
    const editButton = document.querySelector('.official-edit-toggle');
    
    if (this.isEditMode) {
      // Enable edit mode
      officialPage.classList.add('edit-mode');
      editButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>Save All</span>
      `;
      editButton.classList.add('save-mode');
      this.showNotification('Edit mode enabled. Hover over text to edit.', 'info');
    } else {
      // Save all changes and exit edit mode
      this.saveAllChanges();
      officialPage.classList.remove('edit-mode');
      editButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Edit Mode</span>
      `;
      editButton.classList.remove('save-mode');
    }
  }

  setupInlineEditing() {
    // Define editable elements with their field mappings
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
      { selector: '.event-logo', field: 'logo_url', type: 'url' }
    ];

    editableElements.forEach(config => {
      const element = document.querySelector(config.selector);
      if (element) {
        this.makeElementEditable(element, config);
      }
    });
  }

  makeElementEditable(element, config) {
    // Create edit wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'inline-edit-wrapper';
    wrapper.setAttribute('data-field', config.field);
    
    // Wrap the original element
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'inline-edit-btn';
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    `;
    
    editBtn.onclick = (e) => {
      e.stopPropagation();
      this.startInlineEdit(wrapper, element, config);
    };

    wrapper.appendChild(editBtn);

    // Store original value
    wrapper.setAttribute('data-original-value', this.getElementValue(element, config));
  }

  getElementValue(element, config) {
    if (config.type === 'url' && element.tagName === 'IMG') {
      return element.src;
    } else if (config.field === 'event_name' && config.hasSubElement) {
      // For event name, get only the text content without the sub element
      const clone = element.cloneNode(true);
      const subElement = clone.querySelector('.official-event-sub');
      if (subElement) subElement.remove();
      return clone.textContent.trim();
    } else if (config.field === 'event_location') {
      return element.innerHTML.replace(/<br>/g, '\n');
    } else {
      return element.textContent || element.innerText || '';
    }
  }

  startInlineEdit(wrapper, element, config) {
    if (wrapper.classList.contains('editing')) return;

    wrapper.classList.add('editing');
    const originalValue = this.getElementValue(element, config);

    // Create input element
    let input;
    if (config.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = config.type === 'url' ? 'text' : 'text';
    }

    input.className = 'inline-edit-input';
    input.value = originalValue;
    
    // Style the input to match the original element
    const computedStyle = window.getComputedStyle(element);
    input.style.fontSize = computedStyle.fontSize;
    input.style.fontFamily = computedStyle.fontFamily;
    input.style.fontWeight = computedStyle.fontWeight;
    input.style.color = computedStyle.color;
    input.style.textAlign = computedStyle.textAlign;

    // Create action buttons
    const actions = document.createElement('div');
    actions.className = 'inline-edit-actions';
    actions.innerHTML = `
      <button class="inline-edit-save" title="Save">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </button>
      <button class="inline-edit-cancel" title="Cancel">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    // Hide original element and show input
    element.style.display = 'none';
    wrapper.appendChild(input);
    wrapper.appendChild(actions);

    // Focus and select input
    input.focus();
    input.select();

    // Event handlers
    const saveBtn = actions.querySelector('.inline-edit-save');
    const cancelBtn = actions.querySelector('.inline-edit-cancel');

    const save = () => {
      const newValue = input.value.trim();
      this.updateElementValue(element, config, newValue);
      this.endInlineEdit(wrapper, element, input, actions);
      // Store the change for later saving
      wrapper.setAttribute('data-changed', 'true');
      wrapper.setAttribute('data-new-value', newValue);
    };

    const cancel = () => {
      this.endInlineEdit(wrapper, element, input, actions);
    };

    saveBtn.onclick = save;
    cancelBtn.onclick = cancel;

    // Save on Enter (except for textarea)
    if (config.type !== 'textarea') {
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          save();
        } else if (e.key === 'Escape') {
          cancel();
        }
      };
    } else {
      input.onkeydown = (e) => {
        if (e.key === 'Escape') {
          cancel();
        }
      };
    }

    // Save on blur
    input.onblur = (e) => {
      // Delay to allow button clicks
      setTimeout(() => {
        if (wrapper.classList.contains('editing')) {
          save();
        }
      }, 100);
    };
  }

  updateElementValue(element, config, newValue) {
    if (config.type === 'url' && element.tagName === 'IMG') {
      element.src = newValue;
    } else if (config.field === 'event_name' && config.hasSubElement) {
      // For event name, preserve the sub element
      const subElement = element.querySelector('.official-event-sub');
      const subHtml = subElement ? ` ${subElement.outerHTML}` : '';
      element.innerHTML = newValue + subHtml;
    } else if (config.field === 'event_location') {
      element.innerHTML = newValue.replace(/\n/g, '<br>');
    } else {
      element.textContent = newValue;
    }
  }

  endInlineEdit(wrapper, element, input, actions) {
    wrapper.classList.remove('editing');
    element.style.display = '';
    input.remove();
    actions.remove();
  }

  async saveAllChanges() {
    const changedElements = document.querySelectorAll('.inline-edit-wrapper[data-changed="true"]');
    
    if (changedElements.length === 0) {
      this.showNotification('No changes to save.', 'info');
      return;
    }

    try {
      // Collect all changes
      const formData = { ...this.originalContent };
      
      changedElements.forEach(wrapper => {
        const field = wrapper.getAttribute('data-field');
        const newValue = wrapper.getAttribute('data-new-value');
        formData[field] = newValue;
      });

      formData.updated_at = new Date().toISOString();

      // Show saving state
      this.showNotification('Saving changes...', 'info');

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

      // Update stored content
      this.originalContent = data;

      // Clear change markers
      changedElements.forEach(wrapper => {
        wrapper.removeAttribute('data-changed');
        wrapper.removeAttribute('data-new-value');
      });

      this.showNotification('All changes saved successfully!', 'success');

    } catch (error) {
      console.error('Error saving changes:', error);
      this.showNotification('Failed to save changes. Please try again.', 'error');
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
