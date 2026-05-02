document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('check-form');
    const usernameInput = document.getElementById('username');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const errorMessage = document.getElementById('error-message');
    
    const resultsSection = document.getElementById('results');
    const displayNameEl = document.getElementById('display-name');
    const handleEl = document.getElementById('handle');
    const avatarEl = document.getElementById('avatar');
    const tweetCountEl = document.getElementById('tweet-count');
    const tierBadgeEl = document.getElementById('tier-badge');
    const tierIconEl = document.getElementById('tier-icon');
    const tierNameEl = document.getElementById('tier-name');
    const shareBtn = document.getElementById('share-btn');

    const tiers = [
        { name: 'Stone', icon: '🧱', min: 1, max: 3 },
        { name: 'Iron', icon: '🔩', min: 4, max: 10 },
        { name: 'Steel', icon: '⚙️', min: 11, max: 25 },
        { name: 'Architect', icon: '🏗️', min: 26, max: 50 },
        { name: 'Concrete OG', icon: '🏆', min: 51, max: Infinity }
    ];

    // Mock Database for specific responses to show different tiers
    const mockDb = {
        'founder': 120,
        'dev': 35,
        'user': 15,
        'newbie': 2,
        'ghost': 0,
        'nnthanhthanh96': 150,
        'ducanhxm': 200,
        'mongralinweb3': 180,
        'nomiie143': 250,
        'rage_degen': 175,
        'mrnhannguyen': 190,
        'phuocthino': 300,
        '0xtusher_': 42,
        'dill_sl': 500,
        'gustavorssilva': 500,
        'lukehajduk04': 500,
        'andonpv': 500,
        'crypttoji': 500,
        'nic_builds': 500,
        'concrete_intern': 500
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim().replace(/^@/, '');
        if (!username) return;

        // Reset state
        hideError();
        setLoading(true);
        resultsSection.classList.add('hidden');
        resultsSection.classList.remove('animate-fade-in');
        tierBadgeEl.classList.remove('animate-pulse');

        try {
            // Simulate API Call
            const data = await mockScanTwitter(username);
            
            if (data.count === 0) {
                showError("We couldn't find any tweets mentioning @ConcreteXYZ for this user. Try another!");
                setLoading(false);
                return;
            }

            // Calculate Tier
            const tier = calculateTier(data.count);

            // Populate Results
            populateResults(username, data.count, tier);

            // Show Results
            setLoading(false);
            resultsSection.classList.remove('hidden');
            
            // Trigger reflow for animation
            void resultsSection.offsetWidth;
            resultsSection.classList.add('animate-fade-in');
            
            // Add pulse after fade in
            setTimeout(() => {
                tierBadgeEl.classList.add('animate-pulse');
            }, 800);

        } catch (err) {
            showError("An error occurred while scanning. Are they a private account?");
            setLoading(false);
        }
    });

    function getSeededRandom(seedString) {
        let h = 0xdeadbeef;
        for(let i = 0; i < seedString.length; i++)
            h = Math.imul(h ^ seedString.charCodeAt(i), 2654435761);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }

    function mockScanTwitter(username) {
        return new Promise((resolve, reject) => {
            const delay = 1000 + Math.random() * 1000; // Keep delay random for realism
            
            setTimeout(() => {
                const lowerUsername = username.toLowerCase();
                
                let count;
                if (mockDb[lowerUsername] !== undefined) {
                    count = mockDb[lowerUsername];
                } else {
                    const rand1 = getSeededRandom(lowerUsername + "_tier");
                    const rand2 = getSeededRandom(lowerUsername + "_count");
                    
                    // Deterministic distribution heavily skewed towards lower numbers
                    if (rand1 < 0.4) count = Math.floor(rand2 * 4); // 0-3
                    else if (rand1 < 0.7) count = Math.floor(rand2 * 7) + 4; // 4-10
                    else if (rand1 < 0.9) count = Math.floor(rand2 * 15) + 11; // 11-25
                    else if (rand1 < 0.97) count = Math.floor(rand2 * 25) + 26; // 26-50
                    else count = Math.floor(rand2 * 150) + 51; // 51+
                }

                resolve({ count });
            }, delay);
        });
    }

    function calculateTier(count) {
        for (let i = tiers.length - 1; i >= 0; i--) {
            if (count >= tiers[i].min) {
                return tiers[i];
            }
        }
        return tiers[0]; // fallback
    }

    function populateResults(username, count, tier) {
        // Mock profile info
        displayNameEl.textContent = username;
        handleEl.textContent = `@${username}`;
        avatarEl.textContent = username.charAt(0).toUpperCase();
        
        // Stats
        animateCounter(tweetCountEl, count);
        
        // Tier
        tierIconEl.textContent = tier.icon;
        tierNameEl.textContent = tier.name;
        
        // Setup Share
        setupShareButton(tier.name);
    }

    function animateCounter(element, target) {
        let current = 0;
        const duration = 1000; // ms
        const stepTime = 20; // ms
        const steps = duration / stepTime;
        const increment = target / steps;
        
        element.textContent = '0';
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    function setupShareButton(tierName) {
        shareBtn.onclick = () => {
            const text = encodeURIComponent(`I'm a ${tierName} supporter of @ConcreteXYZ! Check your tier 👉\n\n🏗️ #Concrete #DeFi`);
            const url = encodeURIComponent(window.location.href);
            const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            window.open(shareUrl, '_blank', 'width=550,height=420');
        };
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
        } else {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
