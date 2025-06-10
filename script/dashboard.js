document.addEventListener("DOMContentLoaded", function () {
  const welcomeModal = document.getElementById("welcomeModal");
  const welcomeClose = document.getElementById("welcomeClose");
  const welcomeTitle = document.getElementById("welcomeTitle");

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const navbarTryBtn = document.querySelector(".navbar .try-btn");
  const navbarLoginBtn = document.querySelector(".navbar .login-btn");
  const userAvatar = document.getElementById("userAvatar");
  const heroPrimaryBtn = document.querySelector(".hero .btn.primary");

  const avatarDropdown = document.getElementById("avatarDropdown");
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");

  // Handle element visibility based on login status
  if (isLoggedIn) {
    if (navbarTryBtn) navbarTryBtn.classList.add("hidden");
    if (navbarLoginBtn) navbarLoginBtn.classList.add("hidden");
    if (userAvatar) userAvatar.classList.remove("hidden"); // Show avatar by removing hidden class
    if (heroPrimaryBtn) heroPrimaryBtn.classList.add("hidden");
  } else {
    if (navbarTryBtn) navbarTryBtn.classList.remove("hidden");
    if (navbarLoginBtn) navbarLoginBtn.classList.remove("hidden");
    if (userAvatar) userAvatar.classList.add("hidden"); // Hide avatar by adding hidden class
    if (heroPrimaryBtn) heroPrimaryBtn.classList.remove("hidden");
  }

  // Handle avatar dropdown
  if (userAvatar) {
    userAvatar.addEventListener("click", function (e) {
      e.stopPropagation(); // Ngăn sự kiện click lan ra body
      if (avatarDropdown) avatarDropdown.classList.toggle("show");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (avatarDropdown && !userAvatar.contains(e.target)) {
      avatarDropdown.classList.remove("show");
    }
  });

  // Profile Modal Elements
  const profileModal = document.getElementById("profileModal");
  const closeProfileModalBtn = document.getElementById("closeProfileModal");
  const profileEmail = document.getElementById("profileEmail");
  const profileServicesList = document.getElementById("profileServicesList");
  const editProfileBtn = document.getElementById("editProfileBtn");

  // New Profile Elements
  const profileAvatarImg = document.getElementById("profileAvatar");
  const avatarUploadInput = document.getElementById("avatarUploadInput");
  const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
  const profileUsernameInput = document.getElementById("profileUsername");
  const profileLoveDateInput = document.getElementById("profileLoveDate");
  const profileBioInput = document.getElementById("profileBio");
  const saveProfileBtn = document.getElementById("saveProfileBtn");

  const statsLocationsCheckedIn = document.getElementById(
    "statsLocationsCheckedIn"
  );
  const statsFirstLocation = document.getElementById("statsFirstLocation");
  const statsLatestLocation = document.getElementById("statsLatestLocation");
  const statsFavoriteLocation = document.getElementById(
    "statsFavoriteLocation"
  );
  const statsDaysTogether = document.getElementById("statsDaysTogether");

  // Profile Success Modal Elements
  const profileSuccessModal = document.getElementById("profileSuccessModal");
  const closeProfileSuccessModalBtn = document.getElementById(
    "closeProfileSuccessModal"
  );

  let userProfile = JSON.parse(localStorage.getItem("userProfile")) || {
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    username: "Cặp đôi của tôi",
    loveDate: "",
    bio: "Cùng nhau đi khắp thế gian!",
  };

  function saveUserProfile() {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }

  function showProfileSuccessModal() {
    if (profileSuccessModal) {
      profileSuccessModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideProfileSuccessModal() {
    if (profileSuccessModal) {
      profileSuccessModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  if (closeProfileSuccessModalBtn) {
    closeProfileSuccessModalBtn.addEventListener(
      "click",
      hideProfileSuccessModal
    );
  }

  function populateProfileModal() {
    profileAvatarImg.src = userProfile.avatar;
    profileEmail.textContent =
      (JSON.parse(localStorage.getItem("user")) || {}).email || "N/A";
    profileUsernameInput.value = userProfile.username;
    profileLoveDateInput.value = userProfile.loveDate;
    profileBioInput.value = userProfile.bio;

    // Render stats - This part will be updated in a later step
    updateProfileStats();

    setProfileEditMode(false); // Start in view mode
  }

  function setProfileEditMode(isEditing) {
    const editableInputs = profileModal.querySelectorAll(
      ".info-editable-input"
    );
    editableInputs.forEach((input) => {
      input.disabled = !isEditing;
      if (isEditing) {
        input.style.border = "1px solid #ff7e9b"; // Highlight editable fields
        input.style.backgroundColor = "#fff";
      } else {
        input.style.border = "1px solid transparent";
        input.style.backgroundColor = "transparent";
      }
    });

    // Email is always read-only
    profileEmail
      .closest(".profile-info-item")
      .querySelector(".info-value").disabled = true;

    uploadAvatarBtn.style.display = isEditing ? "block" : "none";
    saveProfileBtn.style.display = isEditing ? "block" : "none";
    editProfileBtn.style.display = isEditing ? "none" : "block";
  }

  function updateProfileStats() {
    // Assuming 'locations' is globally accessible from map.js
    if (typeof locations === "undefined" || locations.length === 0) {
      statsLocationsCheckedIn.textContent = "0";
      statsFirstLocation.textContent = "N/A";
      statsLatestLocation.textContent = "N/A";
      statsFavoriteLocation.textContent = "N/A";
      statsDaysTogether.textContent = "0";
      return;
    }

    statsLocationsCheckedIn.textContent = locations.length;

    // Sort locations by date
    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    statsFirstLocation.textContent = sortedLocations[0].name || "N/A";
    statsFirstLocation
      .closest(".stat-item")
      .querySelector(
        ".stat-label"
      ).innerHTML = `Nơi đầu tiên<br/>(<span style="font-size: 0.7em;">${sortedLocations[0].date}</span>)`;

    statsLatestLocation.textContent =
      sortedLocations[sortedLocations.length - 1].name || "N/A";
    statsLatestLocation
      .closest(".stat-item")
      .querySelector(
        ".stat-label"
      ).innerHTML = `Địa điểm gần nhất<br/>(<span style="font-size: 0.7em;">${
      sortedLocations[sortedLocations.length - 1].date
    }</span>)`;

    // Favorite location: for now, just a placeholder as we don't have a "like" system
    statsFavoriteLocation.textContent = "Chưa xác định";

    // Days together
    if (userProfile.loveDate) {
      const startDate = new Date(userProfile.loveDate);
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      statsDaysTogether.textContent = diffDays;
      statsDaysTogether
        .closest(".stat-item")
        .querySelector(".stat-label").textContent = "Ngày bên nhau";
    } else {
      statsDaysTogether.textContent = "0";
      statsDaysTogether
        .closest(".stat-item")
        .querySelector(".stat-label").textContent = "Ngày bên nhau";
    }
  }

  // Handle profile link click
  if (profileLink) {
    profileLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (avatarDropdown) avatarDropdown.classList.remove("show");
      showProfileModal();
    });
  }

  function showProfileModal() {
    if (profileModal) {
      populateProfileModal(); // Populate and set initial mode
      profileModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideProfileModal() {
    if (profileModal) {
      profileModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener("click", hideProfileModal);
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {
      setProfileEditMode(true);
    });
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
      userProfile.username = profileUsernameInput.value.trim();
      userProfile.loveDate = profileLoveDateInput.value;
      userProfile.bio = profileBioInput.value.trim();
      saveUserProfile();
      populateProfileModal(); // Re-populate to show updated values and switch to view mode
      showProfileSuccessModal(); // Show success modal instead of alert
    });
  }

  // Handle avatar upload
  if (uploadAvatarBtn) {
    uploadAvatarBtn.addEventListener("click", () => {
      avatarUploadInput.click();
    });
  }

  if (avatarUploadInput) {
    avatarUploadInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          userProfile.avatar = e.target.result;
          saveUserProfile();
          profileAvatarImg.src = userProfile.avatar;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle logout link click
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user"); // Clear user data as well if needed
      localStorage.removeItem("isShowWelcome"); // Clear welcome flag
      localStorage.setItem("showGoodbyeModal", "true"); // Set flag to show goodbye modal on index.html
      window.location.href = "index.html"; // Redirect to homepage
    });
  }

  // Function to hide the welcome modal
  function hideWelcomeModal() {
    if (welcomeModal) {
      welcomeModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  // Attach event listeners to all navbar links to hide welcome modal
  const navLinks = document.querySelectorAll(".nav-links a");
  if (navLinks) {
    navLinks.forEach((link, index) => {
      link.addEventListener("click", function (e) {
        hideWelcomeModal();

        // Handle scroll to map if "Bản Đồ" link is clicked (first link)
        if (index === 0) {
          e.preventDefault(); // Prevent default link behavior
          const mapSection = document.querySelector(
            ".love-map-preview-section"
          );
          if (mapSection) {
            mapSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        } else if (index === 6) {
          // "Về Chúng Tôi" is the seventh link (index 6)
          e.preventDefault(); // Prevent default link behavior
          const footerSection = document.querySelector("footer");
          if (footerSection) {
            footerSection.scrollIntoView({
              behavior: "smooth",
              block: "end", // Cuộn đến cuối phần footer
            });
          }
        } else if (index === 4) {
          // "Chia Sẻ" is the fifth link (index 4)
          e.preventDefault();
          const discoverFeaturesSection = document.getElementById(
            "discoverFeaturesSection"
          );
          if (discoverFeaturesSection) {
            discoverFeaturesSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    });
  }

  // Memory Collection Modal logic
  const memoryCollectionModal = document.getElementById(
    "memoryCollectionModal"
  );
  const closeCollectionModalBtn = document.getElementById(
    "closeCollectionModal"
  );
  const memoryCardsGrid = document.getElementById("memoryCardsGrid");
  const addMemoryBtn = document.getElementById("addMemoryBtn");

  // Assuming 'locations' is accessible globally from map.js, or passed around.
  // For this context, we'll assume it's global or map.js is loaded first.
  // If not, a mechanism to pass locations would be needed.

  function showMemoryCollectionModal() {
    if (memoryCollectionModal) {
      memoryCollectionModal.classList.add("show");
      document.body.style.overflow = "hidden";
      renderMemoryCards(); // Render cards when modal is shown
    }
  }

  function hideMemoryCollectionModal() {
    if (memoryCollectionModal) {
      memoryCollectionModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  function renderMemoryCards() {
    if (!memoryCardsGrid) return;
    memoryCardsGrid.innerHTML = ""; // Clear existing cards

    // Access locations from map.js. Ensure map.js is loaded before dashboard.js
    if (typeof locations !== "undefined" && locations.length > 0) {
      locations.forEach((loc) => {
        const memoryCard = document.createElement("div");
        memoryCard.classList.add("memory-card");
        memoryCard.innerHTML = `
          <div class="memory-card-image-wrapper">
            <img
              src="${
                loc.images && loc.images.length > 0
                  ? loc.images[0]
                  : "https://placehold.co/600x400/EFEFEF/AAAAAA/png?text=Không+có+ảnh"
              }"
              alt="${loc.name}"
              class="memory-card-image"
            />
            <span class="memory-card-favorite"><img src="https://cdn-icons-png.flaticon.com/512/1077/1077035.png" alt="favorite"/></span>
          </div>
          <div class="memory-card-info">
            <h4 class="memory-card-title">${loc.name}</h4>
            <p class="memory-card-date">Ngày ${loc.date}</p>
            <div class="memory-card-tags">
              ${loc.tags
                .map((tag) => `<span class="location-tag">${tag}</span>`)
                .join("")}
            </div>
          </div>
        `;
        memoryCard.addEventListener("click", () => {
          // When a memory card is clicked, open the detail modal with its data
          // Assuming showLocationDetailModal is accessible from map.js
          if (typeof showLocationDetailModal !== "undefined") {
            hideMemoryCollectionModal(); // Hide collection modal first
            showLocationDetailModal(loc);
          }
        });
        memoryCardsGrid.appendChild(memoryCard);
      });
    } else {
      // Display a message if no memories are saved
      memoryCardsGrid.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888; grid-column: 1 / -1;">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828905.png" alt="empty" style="width: 50px; opacity: 0.5; margin-bottom: 10px;"/>
          <p>Bạn chưa có kỷ niệm nào. Hãy thêm một kỷ niệm mới nhé!</p>
        </div>
      `;
    }
  }

  // Attach event listeners for opening memory collection modal
  const collectionNavLink = document.querySelector(
    ".nav-links li:nth-child(2) a"
  ); // Assuming "Kỷ Niệm" is the second link
  const featureCollectionCard = document.querySelector(
    ".discover-feature-list .feature-card:nth-child(2)"
  ); // "Bộ Sưu Tập" feature card

  if (collectionNavLink) {
    collectionNavLink.addEventListener("click", function (e) {
      e.preventDefault();
      showMemoryCollectionModal();
    });
  }
  if (featureCollectionCard) {
    featureCollectionCard.addEventListener("click", function () {
      showMemoryCollectionModal();
    });
  }

  // Attach event listener for closing memory collection modal
  if (closeCollectionModalBtn) {
    closeCollectionModalBtn.addEventListener(
      "click",
      hideMemoryCollectionModal
    );
  }

  // Attach event listener for "Thêm Kỷ Niệm Mới" button inside collection modal
  if (addMemoryBtn) {
    addMemoryBtn.addEventListener("click", () => {
      hideMemoryCollectionModal(); // Hide collection modal
      // Open location detail modal for new entry
      if (typeof showLocationDetailModal !== "undefined") {
        showLocationDetailModal({
          id: `loc${Date.now()}`,
          name: "Địa điểm mới",
          address: "",
          date: new Date().toLocaleDateString("vi-VN"),
          note: "",
          images: [],
          tags: [],
          lat: map.getCenter().lat, // Use current map center as initial lat/lng
          lng: map.getCenter().lng,
          icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png", // Default marker
        });
      }
    });
  }

  // Kiểm tra cờ hiển thị modal chào mừng
  if (localStorage.getItem("isShowWelcome") === "true") {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      // Lấy tên từ email (trước @)
      const name = user.email.split("@")[0];
      welcomeTitle.textContent = `Chào mừng, ${name}!`;
    }
    if (welcomeModal) welcomeModal.classList.add("show");
    document.body.style.overflow = "hidden";
    // Xóa cờ để chỉ hiển thị 1 lần
    localStorage.removeItem("isShowWelcome");
    // Tự động đóng sau 3.5 giây
    setTimeout(function () {
      if (welcomeModal) welcomeModal.classList.remove("show");
      document.body.style.overflow = "";
    }, 3500);
  }
  if (welcomeClose) {
    welcomeClose.addEventListener("click", function () {
      if (welcomeModal) welcomeModal.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
  if (welcomeModal) {
    welcomeModal.addEventListener("click", function (e) {
      if (e.target === welcomeModal) {
        welcomeModal.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }

  // Journal Modal Logic
  const journalModal = document.getElementById("journalModal");
  const closeJournalModalBtn = document.getElementById("closeJournalModal");
  const journalDateInput = document.getElementById("journalDate");
  const journalLocationInput = document.getElementById("journalLocation");
  const journalImageUploadInput = document.getElementById("journalImageUpload");
  const uploadJournalImageBtn = document.getElementById(
    "uploadJournalImageBtn"
  );
  const journalImagePreview = document.getElementById("journalImagePreview");
  const journalContentInput = document.getElementById("journalContent");
  const saveJournalBtn = document.getElementById("saveJournalBtn");
  const deleteJournalBtn = document.getElementById("deleteJournalBtn");

  // Success Modal for Journal
  const journalSuccessModal = document.getElementById("journalSuccessModal");
  const closeJournalSuccessModalBtn = document.getElementById(
    "closeJournalSuccessModal"
  );

  // Journal List Modal Elements
  const journalListModal = document.getElementById("journalListModal");
  const closeJournalListModalBtn = document.getElementById(
    "closeJournalListModal"
  );
  const journalCardsGrid = document.getElementById("journalCardsGrid");
  const addNewJournalBtn = document.getElementById("addNewJournalBtn");

  // Confirmation Modal Elements
  const deleteConfirmationModal = document.getElementById(
    "deleteConfirmationModal"
  );
  const closeConfirmationModalBtn = document.getElementById(
    "closeConfirmationModal"
  );
  const confirmationMessage = deleteConfirmationModal.querySelector(
    ".confirmation-message"
  );
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  let deleteCallback = null; // To store the function to execute on confirmation

  function showConfirmationModal(message, callback) {
    if (deleteConfirmationModal) {
      confirmationMessage.textContent = message;
      deleteCallback = callback;
      deleteConfirmationModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideConfirmationModal() {
    if (deleteConfirmationModal) {
      deleteConfirmationModal.classList.remove("show");
      document.body.style.overflow = "";
      deleteCallback = null; // Clear callback
    }
  }

  // Attach event listeners for confirmation modal buttons
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (deleteCallback) {
        deleteCallback();
      }
      hideConfirmationModal();
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", hideConfirmationModal);
  }

  if (closeConfirmationModalBtn) {
    closeConfirmationModalBtn.addEventListener("click", hideConfirmationModal);
  }

  function showJournalSuccessModal() {
    if (journalSuccessModal) {
      journalSuccessModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideJournalSuccessModal() {
    if (journalSuccessModal) {
      journalSuccessModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  function showJournalListModal() {
    if (journalListModal) {
      journalListModal.classList.add("show");
      document.body.style.overflow = "hidden";
      renderJournalCards(); // Render cards when modal is shown
    }
  }

  function hideJournalListModal() {
    if (journalListModal) {
      journalListModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  function renderJournalCards() {
    if (!journalCardsGrid) return;
    journalCardsGrid.innerHTML = ""; // Clear existing cards

    if (journalEntries.length > 0) {
      journalEntries.forEach((entry, index) => {
        const journalCard = document.createElement("div");
        journalCard.classList.add("journal-card");
        journalCard.innerHTML = `
          <div class="journal-card-image-wrapper">
            <img
              src="${
                entry.images && entry.images.length > 0
                  ? entry.images[0]
                  : "https://placehold.co/600x400/EFEFEF/AAAAAA/png?text=Không+có+ảnh"
              }"
              alt="${entry.location || "Nhật ký"}"
              class="journal-card-image"
            />
          </div>
          <div class="journal-card-info">
            <h4 class="journal-card-title">${entry.date} - ${
          entry.location || "Không có địa điểm"
        }</h4>
            <p class="journal-card-content">${entry.content.substring(
              0,
              100
            )}...</p>
          </div>
        `;
        journalCard.addEventListener("click", () => {
          hideJournalListModal(); // Hide list modal first
          showJournalModal(entry, index);
        });
        journalCardsGrid.appendChild(journalCard);
      });
    } else {
      // Display a message if no entries are saved
      journalCardsGrid.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888; grid-column: 1 / -1;">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828905.png" alt="empty" style="width: 50px; opacity: 0.5; margin-bottom: 10px;"/>
          <p>Bạn chưa có mục nhật ký nào. Hãy thêm một mục nhật ký mới nhé!</p>
        </div>
      `;
    }
  }

  let journalEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  let editingJournalIndex = -1; // -1 for new entry, otherwise index of entry being edited

  function saveJournalEntries() {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }

  function showJournalModal(entry = null, index = -1) {
    if (journalModal) {
      editingJournalIndex = index;
      if (entry) {
        journalDateInput.value = entry.date || "";
        journalLocationInput.value = entry.location || "";
        journalContentInput.value = entry.content || "";
        displayJournalImages(entry.images || []);
        deleteJournalBtn.style.display = "inline-block"; // Show delete button for existing entries
      } else {
        // Default for new entry
        journalDateInput.valueAsDate = new Date(); // Set current date
        journalLocationInput.value = "";
        journalContentInput.value = "";
        displayJournalImages([]);
        deleteJournalBtn.style.display = "none"; // Hide delete button for new entries
      }
      journalModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideJournalModal() {
    if (journalModal) {
      journalModal.classList.remove("show");
      document.body.style.overflow = "";
      // Clear inputs
      journalDateInput.value = "";
      journalLocationInput.value = "";
      journalContentInput.value = "";
      journalImagePreview.innerHTML = "";
      editingJournalIndex = -1;
    }
  }

  function displayJournalImages(images) {
    journalImagePreview.innerHTML = "";
    if (images && images.length > 0) {
      images.forEach((imgSrc) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        journalImagePreview.appendChild(img);
      });
    }
  }

  // Attach event listener for opening journal modal from navbar
  const journalNavLink = document.querySelector(".nav-links li:nth-child(3) a"); // Assuming "Nhật Ký" is the third link

  if (journalNavLink) {
    journalNavLink.addEventListener("click", function (e) {
      e.preventDefault();
      showJournalListModal(); // Open for a new entry
    });
  }

  // Attach event listener for closing journal modal
  if (closeJournalModalBtn) {
    closeJournalModalBtn.addEventListener("click", hideJournalModal);
  }

  // Attach event listener for saving journal entry
  if (saveJournalBtn) {
    saveJournalBtn.addEventListener("click", function () {
      // Clear previous errors
      document.getElementById("journalDateError").textContent = "";
      document.getElementById("journalContentError").textContent = "";

      const date = journalDateInput.value;
      const location = journalLocationInput.value.trim();
      const content = journalContentInput.value.trim();
      const images = Array.from(journalImagePreview.children).map(
        (img) => img.src
      );

      let hasError = false;

      if (!date) {
        document.getElementById("journalDateError").textContent =
          "Vui lòng chọn ngày!";
        hasError = true;
      }

      if (!content) {
        document.getElementById("journalContentError").textContent =
          "Vui lòng nhập nội dung nhật ký!";
        hasError = true;
      }

      if (hasError) {
        return; // Stop if there are validation errors
      }

      const newEntry = {
        id:
          editingJournalIndex === -1
            ? `journal${Date.now()}`
            : journalEntries[editingJournalIndex].id,
        date: date,
        location: location,
        content: content,
        images: images,
      };

      if (editingJournalIndex === -1) {
        journalEntries.push(newEntry);
      } else {
        journalEntries[editingJournalIndex] = newEntry;
      }

      saveJournalEntries();
      alert("Nhật ký đã được lưu!");
      hideJournalModal();
      showJournalSuccessModal(); // Show success modal
      // In a real app, you might want to re-render a list of journal entries here
    });
  }

  // Attach event listener for deleting journal entry
  if (deleteJournalBtn) {
    deleteJournalBtn.addEventListener("click", function () {
      if (editingJournalIndex !== -1) {
        showConfirmationModal(
          "Bạn có chắc chắn muốn xóa nhật ký này không?",
          () => {
            journalEntries.splice(editingJournalIndex, 1);
            saveJournalEntries();
            hideJournalModal();
            // In a real app, re-render list
          }
        );
      }
    });
  }

  // Handle image upload for journal
  if (uploadJournalImageBtn) {
    uploadJournalImageBtn.addEventListener("click", function () {
      journalImageUploadInput.click(); // Trigger the hidden file input
    });
  }

  if (journalImageUploadInput) {
    journalImageUploadInput.addEventListener("change", function (event) {
      const files = event.target.files;
      if (files.length > 0) {
        const currentImages = Array.from(journalImagePreview.children).map(
          (img) => img.src
        );
        const newImages = [];
        let filesProcessed = 0;

        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            newImages.push(e.target.result);
            filesProcessed++;
            if (filesProcessed === files.length) {
              // All files processed, update and display
              displayJournalImages(currentImages.concat(newImages));
            }
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  // Attach event listener for closing journal success modal
  if (closeJournalSuccessModalBtn) {
    closeJournalSuccessModalBtn.addEventListener(
      "click",
      hideJournalSuccessModal
    );
  }

  // Attach event listener for opening journal list modal from feature card
  const featureJournalCard = document.querySelector(
    ".feature-list .feature-card:nth-child(4)"
  ); // "Nhật Ký Tình Yêu" feature card

  if (featureJournalCard) {
    featureJournalCard.addEventListener("click", function () {
      showJournalListModal();
    });
  }

  // Attach event listener for closing journal list modal
  if (closeJournalListModalBtn) {
    closeJournalListModalBtn.addEventListener("click", hideJournalListModal);
  }

  // Attach event listener for "Thêm Nhật Ký Mới" button inside journal list modal
  if (addNewJournalBtn) {
    addNewJournalBtn.addEventListener("click", () => {
      hideJournalListModal(); // Hide list modal first
      showJournalModal(); // Open for a new entry
    });
  }

  // Attach event listener for opening Itinerary Modal from feature card
  const featureItineraryCard = document.querySelector(
    ".feature-list .feature-card:nth-child(8)"
  ); // "Lộ Trình Hẹn Hò" feature card

  if (featureItineraryCard) {
    featureItineraryCard.addEventListener("click", function () {
      showItineraryModal(); // Open for a new itinerary
    });
  }

  // Attach event listener for opening Share Modal from feature card
  const featureShareCard = document.getElementById("featureShareCard");

  if (featureShareCard) {
    featureShareCard.addEventListener("click", function () {
      showShareModal({
        id: "general-share", // ID chung cho chia sẻ tính năng
        title: "Khám Phá Love Map!",
        description:
          "Cùng chúng mình lưu giữ những khoảnh khắc đáng nhớ nhất của tình yêu.",
        image: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png", // Icon chia sẻ hoặc hình ảnh chung
      });
    });
  }

  // Itinerary Modal Elements
  const itineraryModal = document.getElementById("itineraryModal");
  const closeItineraryModalBtn = document.getElementById("closeItineraryModal");
  const itineraryTitleInput = document.getElementById("itineraryTitle");
  const itineraryDateInput = document.getElementById("itineraryDate");
  const itineraryLocationInput = document.getElementById("itineraryLocation");
  const itineraryDescriptionInput = document.getElementById(
    "itineraryDescription"
  );
  const saveItineraryBtn = document.getElementById("saveItineraryBtn");
  const deleteItineraryBtn = document.getElementById("deleteItineraryBtn");

  let itineraries = JSON.parse(localStorage.getItem("itineraries")) || [];
  let editingItineraryIndex = -1; // -1 for new, otherwise index of itinerary being edited

  function saveItineraries() {
    localStorage.setItem("itineraries", JSON.stringify(itineraries));
  }

  function showItineraryModal(itinerary = null, index = -1) {
    if (itineraryModal) {
      editingItineraryIndex = index;
      if (itinerary) {
        itineraryTitleInput.value = itinerary.title || "";
        itineraryDateInput.value = itinerary.date || "";
        itineraryLocationInput.value = itinerary.location || "";
        itineraryDescriptionInput.value = itinerary.description || "";
        deleteItineraryBtn.style.display = "inline-block"; // Show delete button for existing
      } else {
        // Default for new entry
        itineraryTitleInput.value = "";
        itineraryDateInput.valueAsDate = new Date(); // Set current date
        itineraryLocationInput.value = "";
        itineraryDescriptionInput.value = "";
        deleteItineraryBtn.style.display = "none"; // Hide delete button for new
      }
      itineraryModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideItineraryModal() {
    if (itineraryModal) {
      itineraryModal.classList.remove("show");
      document.body.style.overflow = "";
      // Clear inputs
      itineraryTitleInput.value = "";
      itineraryDateInput.value = "";
      itineraryLocationInput.value = "";
      itineraryDescriptionInput.value = "";
      editingItineraryIndex = -1;
    }
  }

  // Attach event listener for closing itinerary modal
  if (closeItineraryModalBtn) {
    closeItineraryModalBtn.addEventListener("click", hideItineraryModal);
  }

  // Attach event listener for saving itinerary
  if (saveItineraryBtn) {
    saveItineraryBtn.addEventListener("click", function () {
      const title = itineraryTitleInput.value.trim();
      const date = itineraryDateInput.value;
      const location = itineraryLocationInput.value.trim();
      const description = itineraryDescriptionInput.value.trim();

      if (!title || !date || !location) {
        alert("Vui lòng điền đầy đủ Tiêu đề, Ngày và Địa điểm cho lộ trình."); // Consider replacing with a custom modal later
        return;
      }

      const newItinerary = {
        id:
          editingItineraryIndex === -1
            ? `itinerary${Date.now()}`
            : itineraries[editingItineraryIndex].id,
        title: title,
        date: date,
        location: location,
        description: description,
      };

      if (editingItineraryIndex === -1) {
        itineraries.push(newItinerary);
      } else {
        itineraries[editingItineraryIndex] = newItinerary;
      }

      saveItineraries();
      hideItineraryModal();
      showItinerarySuccessModal(); // Show success modal instead of alert
      // In a real app, you might want to re-render a list of itineraries here
    });
  }

  // Attach event listener for deleting itinerary
  if (deleteItineraryBtn) {
    deleteItineraryBtn.addEventListener("click", function () {
      if (editingItineraryIndex !== -1) {
        showConfirmationModal(
          "Bạn có chắc chắn muốn xóa lộ trình này không?",
          () => {
            itineraries.splice(editingItineraryIndex, 1);
            saveItineraries();
            hideItineraryModal();
            // In a real app, re-render list
          }
        );
      }
    });
  }

  // Itinerary Success Modal Elements
  const itinerarySuccessModal = document.getElementById(
    "itinerarySuccessModal"
  );
  const closeItinerarySuccessModalBtn = document.getElementById(
    "closeItinerarySuccessModal"
  );

  function showItinerarySuccessModal() {
    if (itinerarySuccessModal) {
      itinerarySuccessModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function hideItinerarySuccessModal() {
    if (itinerarySuccessModal) {
      itinerarySuccessModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  if (closeItinerarySuccessModalBtn) {
    closeItinerarySuccessModalBtn.addEventListener(
      "click",
      hideItinerarySuccessModal
    );
  }

  // Share Modal Functions
  window.onload = function () {
    console.log("Window loaded - Initializing share functionality");

    // Khởi tạo các biến DOM
    const shareModal = document.getElementById("shareModal");
    const closeShareModalBtn = document.getElementById("closeShareModal");
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    const socialShareBtns = document.querySelectorAll(".social-share-btn");
    const shareButtons = document.querySelectorAll(".btn.share-btn");

    console.log("Share modal element:", shareModal);
    console.log("Share buttons found:", shareButtons.length);

    // Hàm hiển thị modal chia sẻ
    window.showShareModal = function (data) {
      console.log("Showing share modal with data:", data);
      if (!shareModal) {
        console.error("Share modal element not found!");
        return;
      }

      const sharePreviewImage = document.getElementById("sharePreviewImage");
      const sharePreviewTitle = document.getElementById("sharePreviewTitle");
      const sharePreviewDesc = document.getElementById("sharePreviewDesc");
      const shareLink = document.getElementById("shareLink");

      // Cập nhật nội dung preview
      if (sharePreviewImage)
        sharePreviewImage.src =
          data.image ||
          "https://cdn-icons-png.flaticon.com/512/1828/1828974.png";
      if (sharePreviewTitle)
        sharePreviewTitle.textContent = data.title || "Kỷ niệm của chúng ta";
      if (sharePreviewDesc)
        sharePreviewDesc.textContent =
          data.description ||
          "Chia sẻ kỷ niệm đặc biệt này với bạn bè và người thân";

      // Tạo link chia sẻ
      const shareUrl = `${window.location.origin}/share/${data.id}`;
      if (shareLink) shareLink.value = shareUrl;

      // Hiển thị modal
      shareModal.classList.add("show");
      document.body.style.overflow = "hidden";
      console.log("Share modal should be visible now");
    };

    // Hàm ẩn modal chia sẻ
    window.hideShareModal = function () {
      console.log("Hiding share modal");
      if (shareModal) {
        shareModal.classList.remove("show");
        document.body.style.overflow = "";
      }
    };

    // Gắn sự kiện cho nút đóng modal
    if (closeShareModalBtn) {
      closeShareModalBtn.addEventListener("click", hideShareModal);
    }

    // Gắn sự kiện cho nút sao chép link
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", function () {
        const shareLink = document.getElementById("shareLink");
        if (shareLink) {
          shareLink.select();
          document.execCommand("copy");

          // Hiển thị thông báo đã sao chép
          const originalText = copyLinkBtn.querySelector("span").textContent;
          copyLinkBtn.querySelector("span").textContent = "Đã sao chép!";
          setTimeout(() => {
            copyLinkBtn.querySelector("span").textContent = originalText;
          }, 2000);
        }
      });
    }

    // Gắn sự kiện cho các nút chia sẻ mạng xã hội
    socialShareBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const platform = this.dataset.platform;
        const shareUrl = document.getElementById("shareLink")?.value || "";
        const shareTitle =
          document.getElementById("sharePreviewTitle")?.textContent || "";
        const shareDesc =
          document.getElementById("sharePreviewDesc")?.textContent || "";

        let shareLink = "";
        switch (platform) {
          case "facebook":
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`;
            break;
          case "messenger":
            shareLink = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
              shareUrl
            )}&app_id=YOUR_APP_ID`;
            break;
          case "zalo":
            shareLink = `https://zalo.me/share?u=${encodeURIComponent(
              shareUrl
            )}&t=${encodeURIComponent(shareTitle)}`;
            break;
          case "whatsapp":
            shareLink = `https://wa.me/?text=${encodeURIComponent(
              `${shareTitle} - ${shareDesc} ${shareUrl}`
            )}`;
            break;
        }

        if (shareLink) {
          window.open(shareLink, "_blank", "width=600,height=400");
        }
      });
    });

    // Gắn sự kiện cho các nút chia sẻ trong các modal khác
    shareButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        console.log("Share button clicked");
        const data = {
          id: this.dataset.id,
          title: this.dataset.title,
          description: this.dataset.description,
          image: this.dataset.image,
        };
        console.log("Share data:", data);
        showShareModal(data);
      });
    });
  };
});
