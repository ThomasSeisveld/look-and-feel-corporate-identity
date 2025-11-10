// Sidebar groepen -> thema's -> fotos functies

document.addEventListener('DOMContentLoaded', () => {

  const photoSets = {
    nature_forest: [
      { url: 'https://picsum.photos/400/250?random=101', likes: 3 },
      { url: 'https://picsum.photos/400/250?random=102', likes: 1 },
      { url: 'https://picsum.photos/400/250?random=103', likes: 2 }
    ],
    nature_water: [
      { url: 'https://picsum.photos/400/250?random=111', likes: 0 },
      { url: 'https://picsum.photos/400/250?random=112', likes: 4 }
    ],
    city_modern: [
      { url: 'https://picsum.photos/400/250?random=121', likes: 5 },
      { url: 'https://picsum.photos/400/250?random=122', likes: 2 }
    ],
    city_old: [
      { url: 'https://picsum.photos/400/250?random=131', likes: 0 }
    ],
    sport_ball: [
      { url: 'https://picsum.photos/400/250?random=141', likes: 1 }
    ],
    reizen_beach: [
      { url: 'https://picsum.photos/400/250?random=151', likes: 3 }
    ],
    muziek_live: [
      { url: 'https://picsum.photos/400/250?random=161', likes: 2 }
    ],
    design_graphic: [
      { url: 'https://picsum.photos/400/250?random=171', likes: 0 }
    ]
  };

  const LS_KEY = 'snappthis_photo_likes_v1';
  function loadPersistedLikes() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      Object.keys(saved).forEach(themeId => {
        if (photoSets[themeId]) {
          saved[themeId].forEach((likes, idx) => {
            if (photoSets[themeId][idx]) photoSets[themeId][idx].likes = likes;
          });
        }
      });
    } catch (e) { console.warn('Failed to load likes', e); }
  }

  function persistLikes() {
    try {
      const out = {};
      Object.keys(photoSets).forEach(themeId => {
        out[themeId] = photoSets[themeId].map(p => p.likes || 0);
      });
      localStorage.setItem(LS_KEY, JSON.stringify(out));
    } catch (e) { console.warn('Failed to persist likes', e); }
  }

  loadPersistedLikes();

  const yourGroups = [
    { name: 'Groep 1a', id: 'Groep 1a', likes: 5, themes: [{ id: 'nature_forest', name: 'Forest' }, { id: 'nature_water', name: 'Water' }] },
    { name: 'Groep 1b', id: 'Groep 1b', likes: 5, themes: [{ id: 'city_modern', name: 'Modern' }, { id: 'city_old', name: 'Old city' }] },
    { name: 'Groep 1c', id: 'Groep 1c', likes: 5, themes: [{ id: 'sport_ball', name: 'Ball sports' }] },
    { name: 'Groep 1d', id: 'Groep 1d', likes: 5, themes: [{ id: 'reizen_beach', name: 'Beach' }] }
  ];

  const publicGroups = [
    { name: 'Muziek', id: 'muziek', likes: 2, themes: [{ id: 'muziek_live', name: 'Live' }, { id: 'muziek_studio', name: 'Studio' }] },
    { name: 'Design', id: 'design', likes: 2, themes: [{ id: 'design_graphic', name: 'Graphic' }] }
  ];

  // sidebar button 
  function createSidebarBtn({ img, title, subtitle, dataAttrs = {} }) {
    const btn = document.createElement('a');
    btn.className = 'sidebar-btn';
    btn.innerHTML = `
      <img src="${img}" alt="">
      <div>
        <p>${title}</p>
        <small>${subtitle || ''}</small>
      </div>
    `;
    Object.keys(dataAttrs).forEach(k => btn.dataset[k] = dataAttrs[k]);
    return btn;
  }

  // Photo detail popup helpers
  const photoDetailPopup = document.getElementById('photoDetailPopup');
  const photoDetailImg = document.getElementById('photoDetailImg');
  const photoDetailTitle = document.getElementById('photoDetailTitle');
  const photoDetailLikes = document.getElementById('photoDetailLikes');
  const photoDetailLikeBtn = document.getElementById('photoDetailLike');
  const closePhotoDetailBtn = document.getElementById('closePhotoDetail');

  function openPhotoDetail(themeId, index) {
    const photo = (photoSets[themeId] || [])[index];
    if (!photo) return;
    if (photoDetailImg) photoDetailImg.src = photo.url;
    if (photoDetailImg) photoDetailImg.alt = `${themeId} photo`;
    if (photoDetailTitle) photoDetailTitle.textContent = themeId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (photoDetailLikes) photoDetailLikes.textContent = `${photo.likes || 0} Likes`;
    if (photoDetailPopup) photoDetailPopup.style.display = 'flex';

    const prevFocus = document.activeElement;

    function updateLikeDisplays() {

      if (photoDetailLikes) photoDetailLikes.textContent = `${photoSets[themeId][index].likes} Likes`;
      const gallery = document.getElementById('gallery');
      if (gallery) {
        const selector = `img.gallery-photo[data-theme="${themeId}"][data-index="${index}"]`;
        const imgEl = gallery.querySelector(selector);
        if (imgEl) {
          const likesEl = imgEl.parentElement.querySelector('.photo-likes');
          if (likesEl) likesEl.textContent = `${photoSets[themeId][index].likes} Likes`;
        }
        const themeLikesEl = gallery.querySelector('.theme-likes');
        if (themeLikesEl) {
          const newTotal = photoSets[themeId].reduce((s, p) => s + (p.likes || 0), 0);
          themeLikesEl.textContent = `Total likes: ${newTotal}`;
        }
      }
    }

    if (photoDetailLikeBtn) {
      photoDetailLikeBtn.onclick = () => {
        photoSets[themeId][index].likes = (photoSets[themeId][index].likes || 0) + 1;
        updateLikeDisplays();
        persistLikes();
      };
    }

    if (photoDetailPopup) {
      photoDetailPopup.style.display = 'flex';
      photoDetailPopup.classList.add('open');
    }
// close met space en escape
    function trapFocus(e) {
      const focusable = photoDetailPopup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
      if (e.key === 'Escape' || e.key === 'Esc') {
        closePhotoDetail();
      }
    }

    setTimeout(() => {
      try {
        const focusable = photoDetailPopup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable && focusable.length) focusable[0].focus();
      } catch (e) { }
    }, 50);

    document.addEventListener('keydown', trapFocus);
    const removeTrap = () => document.removeEventListener('keydown', trapFocus);

    const originalClose = closePhotoDetail;
    closePhotoDetail = function () {
      if (photoDetailPopup) {
        photoDetailPopup.style.display = 'none';
        photoDetailPopup.classList.remove('open');
      }
      removeTrap();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      persistLikes();
    };
  }

  function closePhotoDetail() {
    if (photoDetailPopup) photoDetailPopup.style.display = 'none';
  }

  if (closePhotoDetailBtn) closePhotoDetailBtn.addEventListener('click', closePhotoDetail);

  // Render groups
  function renderGroups(groups, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    groups.forEach(g => {
      const firstTheme = g.themes && g.themes[0];
      const thumb = firstTheme && photoSets[firstTheme.id] && photoSets[firstTheme.id][0] ? photoSets[firstTheme.id][0].url : 'image.png';
      const subtitle = `${g.themes ? g.themes.length : 0} Themes`;
      const btn = createSidebarBtn({ img: thumb, title: g.name, subtitle: subtitle, dataAttrs: { groupId: g.id } });
      container.appendChild(btn);
    });
  }

  // Render themes voor de geselecteerde groep
  function renderThemesForGroup(group) {
    const themesPanel = document.getElementById('themesPanel');
    if (!themesPanel) return;
    themesPanel.innerHTML = '';

    if (!group || !group.themes || group.themes.length === 0) {
      themesPanel.style.display = 'none';
      return;
    }
    themesPanel.style.display = 'block';

    //  mobile nieuwe functies:
    if (window.innerWidth <= 768) {
      const yourGroupsEl = document.getElementById('yourGroups');
      const publicGroupsEl = document.getElementById('publicGroups');
      if (yourGroupsEl) yourGroupsEl.style.display = 'none';
      if (publicGroupsEl) publicGroupsEl.style.display = 'none';
      let back = themesPanel.querySelector('.mobile-back-btn');
      if (!back) {
        back = document.createElement('button');
        back.className = 'mobile-back-btn';
        back.textContent = '← Back to groups';
        back.addEventListener('click', () => {
          if (yourGroupsEl) yourGroupsEl.style.display = 'block';
          if (publicGroupsEl) publicGroupsEl.style.display = 'block';
          themesPanel.style.display = 'none';
        });
        themesPanel.insertBefore(back, themesPanel.firstChild);
      }
    }
    group.themes.forEach(t => {
      const thumb = photoSets[t.id] && photoSets[t.id][0] ? photoSets[t.id][0].url : 'image.png';
      const btn = createSidebarBtn({ img: thumb, title: t.name, subtitle: '', dataAttrs: { themeId: t.id } });
      themesPanel.appendChild(btn);
    });
    themesPanel.querySelectorAll('.sidebar-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const themeId = btn.dataset.themeId;
        showPhotosForTheme(themeId);
      });
    });
  }

  // laat foto's zien voor de geselecteerde thema's met like-knoppen
  function showPhotosForTheme(themeId) {
    const container = document.getElementById('gallery');
    if (!container) return;
    container.innerHTML = '';

    const themesPanel = document.getElementById('themesPanel');
    if (window.innerWidth <= 768 && themesPanel) {
      themesPanel.style.display = 'none';

      let topBack = document.getElementById('galleryMobileBack');
      if (!topBack) {
        topBack = document.createElement('button');
        topBack.id = 'galleryMobileBack';
        topBack.className = 'mobile-back-btn gallery-back';
        topBack.textContent = '← Back to themes';
        topBack.addEventListener('click', () => {

          if (themesPanel) themesPanel.style.display = 'block';
          const gallery = document.getElementById('gallery');
          if (gallery) {
            gallery.innerHTML = '<article class="gallery-title"><h1>Gallery</h1><p>Click your group to see photos</p></article>';
          }
          // remove back button
          const existing = document.getElementById('galleryMobileBack');
          if (existing) existing.remove();
        });
        const mainSection = document.querySelector('.main-section');
        if (mainSection) mainSection.insertBefore(topBack, mainSection.firstChild);
      }
    }
    const titleArticle = document.createElement('article');
    titleArticle.className = 'gallery-title';
    const prettyTitle = themeId ? themeId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Gallery';

    // total likes
    const photos = photoSets[themeId] || [];
    const totalLikes = photos.reduce((s, p) => s + (p.likes || 0), 0);

    titleArticle.innerHTML = `<h2>${prettyTitle}</h2><div class="theme-likes">Total likes: ${totalLikes}</div>`;
    container.appendChild(titleArticle);

    if (photos.length === 0) {
      const empty = document.createElement('article');
      empty.className = 'gallery-card';
      empty.innerHTML = '<p style="padding:16px;">No photos yet.</p>';
      container.appendChild(empty);
      return;
    }

    photos.forEach((p, index) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${p.url}" alt="${prettyTitle} photo" class="gallery-photo" data-theme="${themeId}" data-index="${index}">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;">
          <button class="like-btn" data-theme="${themeId}" data-index="${index}">♥ Like</button>
          <div class="photo-likes">${p.likes} Likes</div>
        </div>
      `;
      container.appendChild(card);

      // image detail popup
      const imgEl = card.querySelector('.gallery-photo');
      imgEl.addEventListener('click', () => openPhotoDetail(themeId, index));

      // like button
      const likeBtn = card.querySelector('.like-btn');
      const likesDisplay = card.querySelector('.photo-likes');
      likeBtn.addEventListener('click', () => {
        photoSets[themeId][index].likes = (photoSets[themeId][index].likes || 0) + 1;
        likesDisplay.textContent = `${photoSets[themeId][index].likes} Likes`;
        const themeLikesEl = container.querySelector('.theme-likes');
        const newTotal = photoSets[themeId].reduce((s, p) => s + (p.likes || 0), 0);
        if (themeLikesEl) themeLikesEl.textContent = `Total likes: ${newTotal}`;
        persistLikes();
      });
    });
  }

  renderGroups(yourGroups, 'yourGroups');
  renderGroups(publicGroups, 'publicGroups');

  function wireGroupClicks() {
    document.querySelectorAll('#yourGroups .sidebar-btn, #publicGroups .sidebar-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const groupId = btn.dataset.groupId;
        const group = yourGroups.concat(publicGroups).find(g => g.id === groupId);
        renderThemesForGroup(group);
      });
    });
  }

  wireGroupClicks();

  //opslaan desktop layout bij window resize (werkt niet goed)
  function restoreDesktopLayout() {
    // const yourGroupsEl = document.getElementById('yourGroups');
    // const publicGroupsEl = document.getElementById('publicGroups');
    const themesPanel = document.getElementById('themesPanel');
    const galleryBack = document.getElementById('galleryMobileBack');
    if (window.innerWidth > 768) {
      // if (yourGroupsEl) yourGroupsEl.style.display = 'none';
      // if (publicGroupsEl) publicGroupsEl.style.display = 'block';
      // if (themesPanel) themesPanel.style.display = 'none';
      if (galleryBack) galleryBack.remove();
      // remove mobile back button
      if (themesPanel) {
        const mobileBack = themesPanel.querySelector('.mobile-back-btn');
        if (mobileBack) mobileBack.remove();
      }
    }
     else {
      try {
        closeAllTabs();
      } catch (e) {
      }
      const mobileGroupsBtn = document.getElementById('mobileNavGroupsBtn');
      if (mobileGroupsBtn) mobileGroupsBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // MARK: window resize event

  window.addEventListener('resize', () => {
    restoreDesktopLayout();
  });
  restoreDesktopLayout();

  // toggle groepen tabs
  const yourGroupsEl = document.getElementById('yourGroups');
  const publicGroupsEl = document.getElementById('publicGroups');
  const themesPanel = document.getElementById('themesPanel');
  const showGroupsBtn = document.getElementById('showGroupsBtn');
  const showPublicGroupsBtn = document.getElementById('showPublicGroupsBtn');
  const groupsArrow = document.getElementById('groupsArrow');
  const publicGroupsArrow = document.getElementById('publicGroupsArrow');

  let yourGroupsOpen = false;
  let publicGroupsOpen = false;

  function closeAllTabs() {
    if (yourGroupsEl) yourGroupsEl.style.display = 'none';
    if (groupsArrow) groupsArrow.style.transform = 'rotate(0deg)';
    if (publicGroupsEl) publicGroupsEl.style.display = 'none';
    if (publicGroupsArrow) publicGroupsArrow.style.transform = 'rotate(0deg)';
    if (themesPanel) themesPanel.style.display = 'none';
    yourGroupsOpen = false;
    publicGroupsOpen = false;
  }

  if (showGroupsBtn) {
    showGroupsBtn.addEventListener('click', () => {
      if (!yourGroupsOpen) {
        closeAllTabs();
        yourGroupsEl.style.display = 'block';
        groupsArrow.style.transform = 'rotate(180deg)';
        yourGroupsOpen = true;
      } else {
        closeAllTabs();
      }
    });
  }

  if (showPublicGroupsBtn) {
    showPublicGroupsBtn.addEventListener('click', () => {
      if (!publicGroupsOpen) {
        closeAllTabs();
        publicGroupsEl.style.display = 'block';
        publicGroupsArrow.style.transform = 'rotate(180deg)';
        publicGroupsOpen = true;
      } else {
        closeAllTabs();
      }
    });
  }

});

// Profiel menu met Inloggen popup
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");
const popup = document.getElementById("popup");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    profileMenu.style.display = profileMenu.style.display === "flex" ? "none" : "flex";
  });
}

function openPopup() {
  if (popup) popup.style.display = "flex";
  if (profileMenu) profileMenu.style.display = "none";
}

function closePopup() {
  if (popup) popup.style.display = "none";
}

function switchTab(type) {
  const isLogin = type === "login";
  if (loginTab) loginTab.classList.toggle("active", isLogin);
  if (signupTab) signupTab.classList.toggle("active", !isLogin);
  if (loginForm) loginForm.classList.toggle("active", isLogin);
  if (signupForm) signupForm.classList.toggle("active", !isLogin);
}

// --- Mobile bottom nav---
document.addEventListener('DOMContentLoaded', () => {
  const mobileGroupsBtn = document.getElementById('mobileNavGroupsBtn');
  const mobileSearchBtn = document.getElementById('mobileNavSearchBtn');
  const mobileUserBtn = document.getElementById('mobileNavUserBtn');

  if (mobileGroupsBtn) {
    mobileGroupsBtn.addEventListener('click', () => {

      const yourEl = document.getElementById('yourGroups');
      const pubEl = document.getElementById('publicGroups');
      const groupsBtn = document.getElementById('showGroupsBtn');
      const pubBtn = document.getElementById('showPublicGroupsBtn');

      const themes = document.getElementById('themesPanel');
      if (themes && themes.style.display === 'block') {
        if (yourEl) yourEl.style.display = 'block';
        if (pubEl) pubEl.style.display = 'block';
        mobileGroupsBtn.setAttribute('aria-expanded', 'true');
        return;
      }

      const yourVisible = yourEl && yourEl.style.display === 'block';
      if (!yourVisible) {
        // open your groups
        if (groupsBtn) groupsBtn.click();
        else {
          if (yourEl) yourEl.style.display = 'block';
        }
        mobileGroupsBtn.setAttribute('aria-expanded', 'true');
      } else {
        // close
        if (groupsBtn) groupsBtn.click();
        else {
          if (yourEl) yourEl.style.display = 'none';
          if (pubEl) pubEl.style.display = 'none';
        }
        mobileGroupsBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', () => {
      mobileSearchBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 160 });
    });
  }

  if (mobileUserBtn) {
    mobileUserBtn.addEventListener('click', () => {
      const profileMenu = document.getElementById('profileMenu');
      const popup = document.getElementById('popup');
      if (profileMenu) {
        profileMenu.style.display = profileMenu.style.display === 'flex' ? 'none' : 'flex';
      } else if (popup) {
        popup.style.display = 'flex';
      }
    });
  }
});
