class TikTokHookGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('openRouterApiKey') || '';
        this.init();
    }

    init() {
        // Initialize DOM elements
        this.elements = {
            apiKeyInput: document.getElementById('apiKey'),
            saveApiKeyBtn: document.getElementById('saveApiKey'),
            languageSelect: document.getElementById('language'),
            topicInput: document.getElementById('topic'),
            hookCategorySelect: document.getElementById('hookCategory'),
            toneSelect: document.getElementById('tone'),
            generateBtn: document.getElementById('generate'),
            hookText: document.getElementById('hookText'),
            copyBtn: document.getElementById('copyHook'),
            loadingSpinner: document.querySelector('.loading-spinner'),
            hookResult: document.querySelector('.hook-result'),
            themeToggle: document.querySelector('.theme-toggle')
        };

        // Set initial API key value
        this.elements.apiKeyInput.value = this.apiKey;

        // Event listeners
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.generateBtn.addEventListener('click', () => this.generateHook());
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Initialize theme
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    saveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openRouterApiKey', apiKey);
            this.apiKey = apiKey;
            alert('API key saved successfully!');
        }
    }

    async generateHook() {
        if (!this.apiKey) {
            alert('Please enter your OpenRouter API key first!');
            return;
        }

        const topic = this.elements.topicInput.value.trim();
        const category = this.elements.hookCategorySelect.value;
        const language = this.elements.languageSelect.value;
        const tone = this.elements.toneSelect.value;

        if (!topic || !category) {
            alert('Please fill in all required fields!');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'google/learnlm-1.5-pro-experimental:free',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt(language)
                        },
                        {
                            role: 'user',
                            content: this.generatePrompt(topic, category, language, tone)
                        }
                    ]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            const hook = data.choices[0].message.content.trim();
            this.displayHook(hook);
        } catch (error) {
            alert(`Error generating hook: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    getSystemPrompt(language) {
        return language === 'ms' 
            ? 'Anda adalah pakar dalam menghasilkan hook TikTok yang menarik dalam Bahasa Malaysia mengikut garis panduan DBP.'
            : 'You are an expert at creating engaging TikTok hooks in English.';
    }

    generatePrompt(topic, category, language, tone) {
        const prompts = {
            en: `Create a ${tone} TikTok hook about "${topic}" using the ${category} style. Make it engaging and concise.`,
            ms: `Hasilkan hook TikTok yang ${tone} mengenai "${topic}" menggunakan gaya ${category}. Pastikan ia menarik dan ringkas mengikut garis panduan DBP.`
        };
        return prompts[language];
    }

    displayHook(hook) {
        // Format the hook text with proper spacing and line breaks
        const formattedHook = hook
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n');
        
        this.elements.hookText.textContent = formattedHook;
        this.elements.hookResult.classList.remove('hidden');
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.elements.hookText.textContent);
            this.elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.elements.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } catch (error) {
            alert('Failed to copy to clipboard');
        }
    }

    showLoading(show) {
        this.elements.loadingSpinner.classList.toggle('hidden', !show);
        this.elements.hookResult.classList.toggle('hidden', show);
        this.elements.generateBtn.disabled = show;
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TikTokHookGenerator();
}); 