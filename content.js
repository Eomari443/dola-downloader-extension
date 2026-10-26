// Eomari443 Dola Content Script

(function () {
  'use strict';

  // Inject page-interceptor.js into Main World
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('page-interceptor.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);

  const capturedMediaMap = new Map();

  function registerMedia(media) {
    if (media && media.url) {
      const key = media.vid || media.url;
      capturedMediaMap.set(key, media);
      attachDownloadButtons();
    }
  }

  // Initial fetch of captured videos from background
  chrome.runtime.sendMessage({ type: 'GET_CAPTURED_VIDEOS' }, (res) => {
    if (res && res.videos) {
      res.videos.forEach(v => registerMedia(v));
    }
  });

  // Listen for window messages from page-interceptor
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'EOMARI443_NEW_UNWATERMARKED_MEDIA') {
      const media = event.data.media;
      if (media && media.url) {
        registerMedia(media);
        chrome.runtime.sendMessage({ type: 'NEW_MEDIA_DETECTED', media });
      }
    }

    if (event.data.type === 'EOMARI443_RESOLVE_FALLBACK') {
      chrome.runtime.sendMessage({
        type: 'FETCH_AND_RESOLVE_FALLBACK',
        fallbackUrl: event.data.fallbackUrl,
        keySeed: event.data.keySeed,
        meta: event.data.meta
      }, (res) => {
        if (res && res.ok && res.media) {
          registerMedia(res.media);
        }
      });
    }
  });

  // Listen for messages from background service worker or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NEW_MEDIA_RESOLVED') {
      registerMedia(message.media);
    }

    if (message.type === 'GET_PAGE_ORDERED_VIDEOS') {
      const cards = getVideoCards();
      const list = [];
      cards.forEach((card, idx) => {
        const matched = findMatchingMediaForCard(card, cards);
        const domPrompt = extractDomPrompt(card, idx);
        const imgEl = card.querySelector('img');
        const videoEl = card.querySelector('video');
        const poster = (imgEl && (imgEl.src || imgEl.getAttribute('src'))) || (matched && matched.poster) || '';
        const url = (matched && matched.url) || (videoEl && (videoEl.currentSrc || videoEl.src)) || '';

        list.push({
          ...(matched || {}),
          url: url || (matched && matched.url) || '',
          poster: poster,
          prompt: domPrompt || (matched && matched.prompt) || `Scene ${idx + 1}`,
          sceneIndex: idx + 1,
          width: (matched && matched.width) || 1080,
          height: (matched && matched.height) || 1920
        });
      });
      sendResponse({ videos: list });
      return true;
    }
  });

  // Extract core unique TOS key hash from image/video URL
  function extractTOSKey(url) {
    if (!url) return '';
    try {
      const u = new URL(url, window.location.href);
      const path = u.pathname;
      const tosMatch = path.match(/tos-[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/i);
      if (tosMatch && tosMatch[1]) {
        return tosMatch[1].split('~')[0].split('.')[0];
      }
      const parts = path.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';
      return last.split('~')[0].split('.')[0];
    } catch {
      const clean = String(url).split('?')[0];
      const match = clean.match(/tos-[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/i);
      return match ? match[1].split('~')[0].split('.')[0] : '';
    }
  }

  // Extract prompt or scene title from DOM context
  function extractDomPrompt(card, cardIndex = 0) {
    try {
      // 1. Check if there is a table or scene breakdown in the chat
      const tableRows = document.querySelectorAll('table tbody tr');
      if (tableRows.length > cardIndex) {
        const row = tableRows[cardIndex];
        const titleEl = row.querySelector('td:nth-child(2)');
        if (titleEl) {
          const titleText = (titleEl.innerText || titleEl.textContent || '').trim();
          if (titleText) return `Scene_${cardIndex + 1}_${titleText}`;
        }
      }

      // 2. Check closest card container
      const container = card.closest('[data-container-type], [data-message-id], [class*="message"]') || card.parentElement;
      if (container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, strong');
        for (const h of headings) {
          const txt = (h.innerText || h.textContent || '').trim();
          if (txt.length >= 4 && txt.length <= 80 && !txt.includes('1080P') && !txt.includes('Eomari443')) {
            return txt;
          }
        }
      }
    } catch (e) {}
    return `Dola_Scene_${cardIndex + 1}`;
  }

  // Get top-level video card containers without nested duplicates
  function getVideoCards() {
    const rawCards = document.querySelectorAll('[class*="block-video"], [class*="block_video"], .image-box-grid-item-FTeESI, [class*="image-box-grid-item"]');
    const cards = [];

    rawCards.forEach((el) => {
      // If it's a grid item, use its inner block-video or the item itself
      const block = el.querySelector('[class*="block-video"]') || el;
      if (!cards.includes(block)) {
        cards.push(block);
      }
    });

    // Also look for standalone video players not in any block
    const standalonePlayers = document.querySelectorAll('.video-player-wrapper, [class*="video-player-wrapper"]');
    standalonePlayers.forEach((el) => {
      if (!el.closest('[class*="block-video"], [class*="block_video"], [class*="image-box-grid-item"]')) {
        if (!cards.includes(el)) {
          cards.push(el);
        }
      }
    });

    return cards;
  }

  // Find exact matching 1080P media for a specific video card
  function findMatchingMediaForCard(card, allCards) {
    const allMedia = Array.from(capturedMediaMap.values());
    if (allMedia.length === 0) return null;

    const cardIndex = allCards.indexOf(card);
    const imgEls = card.querySelectorAll('img');
    const videoEl = card.querySelector('video');

    const domImgSrcs = Array.from(imgEls).map(img => img.src || img.getAttribute('src') || '').filter(Boolean);
    const domVideoSrc = videoEl ? (videoEl.currentSrc || videoEl.src || videoEl.getAttribute('src') || '') : '';

    // Collect all TOS keys from this card's images and video
    const cardKeys = [];
    domImgSrcs.forEach(src => {
      const k = extractTOSKey(src);
      if (k && k.length > 8) cardKeys.push(k);
    });
    if (domVideoSrc) {
      const vk = extractTOSKey(domVideoSrc);
      if (vk && vk.length > 8) cardKeys.push(vk);
    }

    // Tier 1: Match by Image / Poster TOS Key (100% exact unique hash match)
    for (const key of cardKeys) {
      for (const media of allMedia) {
        const mediaPosterKey = extractTOSKey(media.poster);
        const mediaVidKey = extractTOSKey(media.vid);
        const mediaUrlKey = extractTOSKey(media.url);
        if ((mediaPosterKey && mediaPosterKey === key) ||
            (mediaVidKey && mediaVidKey === key) ||
            (mediaUrlKey && mediaUrlKey === key)) {
          return media;
        }
      }
    }

    // Tier 2: Substring key in full URLs
    for (const key of cardKeys) {
      for (const media of allMedia) {
        if ((media.poster && media.poster.includes(key)) ||
            (media.url && media.url.includes(key)) ||
            (media.vid && String(media.vid).includes(key))) {
          return media;
        }
      }
    }

    // Tier 3: Positional Order Alignment (Card 0 -> allMedia[0], Card 1 -> allMedia[1], etc.)
    if (cardIndex >= 0 && cardIndex < allMedia.length) {
      return allMedia[cardIndex];
    }

    // Fallback: Return corresponding item
    return allMedia[cardIndex % allMedia.length] || allMedia[0];
  }

  // Attach visual download button to each video card
  function attachDownloadButtons() {
    const cards = getVideoCards();

    cards.forEach((card, index) => {
      // Clean up any nested/duplicate download buttons inside this card
      const existingBtns = card.querySelectorAll('.eomari443-download-btn');
      if (existingBtns.length > 1) {
        for (let i = 1; i < existingBtns.length; i++) {
          existingBtns[i].remove();
        }
      }

      if (card.querySelector(':scope > .eomari443-download-btn') || (card.querySelector('.eomari443-download-btn') && existingBtns.length === 1)) {
        return;
      }

      const btn = document.createElement('button');
      btn.className = 'eomari443-download-btn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>1080P Master</span>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        btn.classList.add('loading');
        btn.querySelector('span').textContent = 'Downloading...';

        const allCurrentCards = getVideoCards();
        const currentCardIndex = allCurrentCards.indexOf(card);
        const targetMedia = findMatchingMediaForCard(card, allCurrentCards);
        const domPrompt = extractDomPrompt(card, currentCardIndex >= 0 ? currentCardIndex : index);

        if (targetMedia && targetMedia.url) {
          const finalMedia = {
            ...targetMedia,
            prompt: (targetMedia.prompt && !targetMedia.prompt.includes('Dola 1080P'))
              ? targetMedia.prompt
              : domPrompt
          };

          chrome.runtime.sendMessage({ type: 'TRIGGER_DOWNLOAD', media: finalMedia }, (res) => {
            btn.classList.remove('loading');
            if (res && res.ok) {
              btn.classList.add('success');
              btn.querySelector('span').textContent = 'Saved!';
              setTimeout(() => {
                btn.classList.remove('success');
                btn.querySelector('span').textContent = '1080P Master';
              }, 2500);
            } else {
              btn.querySelector('span').textContent = 'Failed';
              setTimeout(() => {
                btn.querySelector('span').textContent = '1080P Master';
              }, 2000);
            }
          });
        } else {
          // Check if active <video> tag is present in the card
          const videoEl = card.querySelector('video');
          const fallbackSrc = videoEl ? (videoEl.currentSrc || videoEl.src) : '';

          if (fallbackSrc) {
            chrome.runtime.sendMessage({
              type: 'TRIGGER_DOWNLOAD',
              media: { url: fallbackSrc, prompt: domPrompt }
            }, (res) => {
              btn.classList.remove('loading');
              if (res && res.ok) {
                btn.classList.add('success');
                btn.querySelector('span').textContent = 'Saved!';
                setTimeout(() => {
                  btn.classList.remove('success');
                  btn.querySelector('span').textContent = '1080P Master';
                }, 2500);
              } else {
                btn.querySelector('span').textContent = 'Downloaded';
              }
            });
          } else {
            // Ask background to scan document for unwatermarked streams
            btn.querySelector('span').textContent = 'Resolving 1080P...';
            setTimeout(() => {
              const retryMedia = findMatchingMediaForCard(card, allCurrentCards);
              if (retryMedia) {
                chrome.runtime.sendMessage({
                  type: 'TRIGGER_DOWNLOAD',
                  media: { ...retryMedia, prompt: domPrompt }
                }, () => {
                  btn.classList.remove('loading');
                  btn.classList.add('success');
                  btn.querySelector('span').textContent = 'Saved!';
                });
              } else {
                btn.classList.remove('loading');
                btn.querySelector('span').textContent = 'Click Video to Load';
                setTimeout(() => {
                  btn.querySelector('span').textContent = '1080P Master';
                }, 2500);
              }
            }, 1000);
          }
        }
      });

      card.style.position = 'relative';
      card.appendChild(btn);
    });
  }

  // Observe DOM changes for new videos
  const observer = new MutationObserver(() => {
    attachDownloadButtons();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  // Periodic scan
  setInterval(attachDownloadButtons, 2000);
})();
