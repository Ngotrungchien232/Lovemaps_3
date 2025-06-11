document.addEventListener("DOMContentLoaded", function () {
  let map;
  let markers = [];
  let infoWindow;

  // Load locations from localStorage, or initialize as empty array
  let locations = JSON.parse(localStorage.getItem("locations")) || [];

  // Location Detail Modal elements
  const locationDetailModal = document.getElementById("locationDetailModal");
  const detailCloseBtn = document.getElementById("closeLocationDetailModal");
  const detailCarouselImg = document.getElementById("detailCarouselImg");
  const detailCarouselPrev = document.getElementById("detailCarouselPrev");
  const detailCarouselNext = document.getElementById("detailCarouselNext");
  const detailImageCounter = document.getElementById("detailImageCounter");
  const detailLocationName = document.getElementById("detailLocationName");
  const detailAddressText = document.getElementById("detailAddressText");
  const detailDateText = document.getElementById("detailDateText");
  const detailLocationTags = document.getElementById("detailLocationTags");
  const detailMemoryNote = document.getElementById("detailMemoryNote"); // This is now a textarea
  const addLocationBtn = document.querySelector(".add-location-btn");

  // New elements for editing/uploading
  const detailImageUpload = document.getElementById("detailImageUpload");
  const uploadImageBtn = document.getElementById("uploadImageBtn");
  const saveLocationBtn = document.getElementById("saveLocationBtn");
  const deleteLocationBtn = document.getElementById("deleteLocationBtn"); // Get delete button by ID

  let currentImages = [];
  let currentImageIndex = 0;
  let editingLocationIndex = -1; // -1 for new location, otherwise index in locations array
  let currentLat = null;
  let currentLng = null;

  // Initialize Map
  initMap();
  renderLocations(); // Initial render of locations on the map

  // Setup event listeners for the location detail modal
  setupLocationDetailModal();

  function setupLocationDetailModal() {
    if (detailCarouselPrev) {
      detailCarouselPrev.addEventListener("click", () => {
        currentImageIndex =
          (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateCarousel();
      });
    }

    if (detailCarouselNext) {
      detailCarouselNext.addEventListener("click", () => {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateCarousel();
      });
    }

    if (detailCloseBtn) {
      detailCloseBtn.addEventListener("click", hideLocationDetailModal);
    }
    if (locationDetailModal) {
      locationDetailModal.addEventListener("click", (e) => {
        if (e.target === locationDetailModal) {
          hideLocationDetailModal();
        }
      });
    }

    if (addLocationBtn) {
      addLocationBtn.addEventListener("click", () => {
        // Open modal for a new, empty location
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
      });
    }

    if (uploadImageBtn) {
      uploadImageBtn.addEventListener("click", () => {
        detailImageUpload.click(); // Trigger file input click
      });
    }

    if (detailImageUpload) {
      detailImageUpload.addEventListener("change", handleImageUpload);
    }

    if (saveLocationBtn) {
      saveLocationBtn.addEventListener("click", saveLocationDetails);
    }

    if (deleteLocationBtn) {
      deleteLocationBtn.addEventListener("click", deleteLocation);
    }
  }

  function showLocationDetailModal(locationData) {
    // Determine if we are editing an existing location or adding a new one
    editingLocationIndex = locations.findIndex(
      (loc) => loc.id === locationData.id
    );

    // Populate modal with data, and make fields editable
    detailLocationName.innerHTML = `<input type="text" class="modal-editable-input" id="editLocationName" value="${
      locationData.name || ""
    }" placeholder="Tên địa điểm"/>`;
    detailAddressText.innerHTML = `<input type="text" class="modal-editable-input" id="editLocationAddress" value="${
      locationData.address || ""
    }" placeholder="Địa chỉ"/>
      <span class="location-coords" style="font-size: 0.9em; color: #888;">Lat: ${locationData.lat.toFixed(
        4
      )}, Lng: ${locationData.lng.toFixed(4)}</span>
    `;
    detailDateText.innerHTML = `<input type="date" class="modal-editable-input" id="editLocationDate" value="${formatDateForInput(
      locationData.date
    )}"/>`;
    detailMemoryNote.value = locationData.note || "";

    // Handle tags (can be done with a separate input or editable div if complex)
    // For simplicity, for now, tags will be displayed as static, but saving will handle a single input for tags
    detailLocationTags.innerHTML = `<input type="text" class="modal-editable-input" id="editLocationTags" value="${(
      locationData.tags || []
    ).join(", ")}" placeholder="Tags (phân cách bằng dấu phẩy)"/>`;

    // Store current lat/lng for saving
    currentLat = locationData.lat;
    currentLng = locationData.lng;

    // Handle images carousel
    currentImages = locationData.images || [];
    currentImageIndex = 0;
    updateCarousel();

    locationDetailModal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function hideLocationDetailModal() {
    locationDetailModal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function updateCarousel() {
    if (currentImages.length > 0) {
      detailCarouselImg.src = currentImages[currentImageIndex];
      detailImageCounter.textContent = `${currentImageIndex + 1}/${
        currentImages.length
      }`;
      detailCarouselPrev.style.display =
        currentImages.length > 1 ? "block" : "none";
      detailCarouselNext.style.display =
        currentImages.length > 1 ? "block" : "none";
    } else {
      detailCarouselImg.src =
        "https://placehold.co/600x400/EFEFEF/AAAAAA/png?text=Không+có+ảnh";
      detailImageCounter.textContent = "0/0";
      detailCarouselPrev.style.display = "none";
      detailCarouselNext.style.display = "none";
    }
  }

  function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let filesProcessed = 0;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        newImages.push(e.target.result); // Base64 string
        filesProcessed++;
        if (filesProcessed === files.length) {
          currentImages = [...currentImages, ...newImages];
          updateCarousel();
          // Clear file input so same file can be uploaded again
          detailImageUpload.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function saveLocationDetails() {
    const name = document.getElementById("editLocationName").value.trim();
    const address = document.getElementById("editLocationAddress").value.trim();
    const date = document.getElementById("editLocationDate").value;
    const note = detailMemoryNote.value.trim();
    const tags = document
      .getElementById("editLocationTags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Basic validation
    if (!name || !address || !date) {
      alert("Vui lòng điền đầy đủ Tên Địa Điểm, Địa Chỉ và Ngày Kỷ Niệm.");
      return;
    }

    let locationToSave = {
      name: name,
      address: address,
      date: date,
      note: note,
      images: currentImages,
      tags: tags,
      lat: currentLat,
      lng: currentLng,
      icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png", // Default icon
    };

    if (editingLocationIndex === -1) {
      // Add new location
      locationToSave.id = `loc${Date.now()}`; // Unique ID for new location
      locations.push(locationToSave);
    } else {
      // Update existing location
      locationToSave.id = locations[editingLocationIndex].id; // Keep existing ID
      locations[editingLocationIndex] = locationToSave;
    }

    // Save to localStorage
    localStorage.setItem("locations", JSON.stringify(locations));

    // Re-render map and location list
    renderLocations();
    hideLocationDetailModal();
  }

  function deleteLocation() {
    if (editingLocationIndex !== -1) {
      // Use the custom confirmation modal instead of browser's confirm()
      // showConfirmationModal is defined in dashboard.js, ensure dashboard.js is loaded BEFORE map.js or make showConfirmationModal globally accessible.
      // For this context, assuming it's accessible (e.g., through window.showConfirmationModal if explicitly attached).
      // If not, it needs to be properly imported or made globally available.
      // Since both files are loaded in dashboard.html, I'll assume showConfirmationModal is accessible.
      if (typeof showConfirmationModal !== "undefined") {
        showConfirmationModal(
          "Bạn có chắc chắn muốn xóa địa điểm này không?",
          () => {
            locations.splice(editingLocationIndex, 1);
            localStorage.setItem("locations", JSON.stringify(locations));
            renderLocations();
            hideLocationDetailModal();
          }
        );
      } else {
        // Fallback to original confirm if for some reason custom modal function isn't available
        if (confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) {
          locations.splice(editingLocationIndex, 1);
          localStorage.setItem("locations", JSON.stringify(locations));
          renderLocations();
          hideLocationDetailModal();
        }
      }
    }
  }

  // Helper to format date for input[type="date"]
  function formatDateForInput(dateString) {
    if (!dateString) return "";
    // Assuming dateString is in 'DD tháng MM, YYYY' or 'DD/MM/YYYY' format
    const parts = dateString.split(/[-\/,\s]/);
    if (parts.length === 3) {
      // Simple split for DD/MM/YYYY
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (parts.length >= 3 && dateString.includes("tháng")) {
      // For 'DD tháng MM, YYYY' format
      const day = parts[0];
      const monthMap = {
        "tháng 1": "01",
        "tháng 2": "02",
        "tháng 3": "03",
        "tháng 4": "04",
        "tháng 5": "05",
        "tháng 6": "06",
        "tháng 7": "07",
        "tháng 8": "08",
        "tháng 9": "09",
        "tháng 10": "10",
        "tháng 11": "11",
        "tháng 12": "12",
      };
      const month = monthMap[parts[1].trim()];
      const year = parts[2].replace(",", "").trim();
      return `${year}-${month}-${day.padStart(2, "0")}`;
    }
    return dateString; // Return original if format is not recognized
  }

  function initMap() {
    // Check if map is already initialized to prevent re-initialization
    if (map) {
      map.remove();
    }

    map = L.map("map").setView([10.8231, 106.6297], 13); // Default to Ho Chi Minh City

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a click listener to the map to allow adding new locations
    map.on("click", function (e) {
      // Show location detail modal with clicked coordinates
      showLocationDetailModal({
        id: `loc${Date.now()}`,
        name: "Địa điểm mới",
        address: "",
        date: new Date().toLocaleDateString("vi-VN"),
        note: "",
        images: [],
        tags: [],
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png", // Default marker
      });
    });
  }

  function renderLocations(filteredLocations = locations) {
    // Clear existing markers
    markers.forEach((marker) => {
      map.removeLayer(marker);
    });
    markers = [];

    // Add new markers for each location
    filteredLocations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup(`<b>${location.name}</b><br>${location.address}`);

      marker.on("click", () => showLocationDetailModal(location)); // Pass location data to modal
      markers.push(marker);
    });

    // Update location list in sidebar
    const locationList = document.getElementById("locationList");
    if (locationList) {
      locationList.innerHTML = ""; // Clear existing list
      filteredLocations.forEach((location) => {
        const listItem = document.createElement("div");
        listItem.className = "location-list-item";
        listItem.innerHTML = `
          <img src="${location.icon}" alt="icon" class="location-icon"/>
          <div class="location-info">
            <h4 class="location-name">${location.name}</h4>
            <p class="location-address">${location.address}</p>
            <p class="location-date">${location.date}</p>
          </div>
        `;
        listItem.addEventListener("click", () => {
          showLocationDetailModal(location);
          map.setView([location.lat, location.lng], map.getZoom()); // Center map on clicked location
        });
        locationList.appendChild(listItem);
      });
    }
  }

  function filterLocations(searchTerm) {
    const filtered = locations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    renderLocations(filtered);
  }

  // Search functionality (assuming a search input exists)
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value;
      searchTimeout = setTimeout(() => {
        if (searchTerm) {
          searchLocationByArea(searchTerm);
        } else {
          renderLocations(); // Show all if search is cleared
        }
      }, 500); // Debounce search input
    });
  }

  async function searchLocationByArea(searchTerm) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchTerm
    )}`;

    try {
      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.length > 0) {
        // For simplicity, take the first result and add it as a new location
        const firstResult = data[0];
        const newLocation = {
          id: `loc${Date.now()}`,
          name: firstResult.display_name.split(",")[0], // Take first part of name
          address: firstResult.display_name, // Full address
          date: new Date().toLocaleDateString("vi-VN"),
          note: `Tìm kiếm từ: ${searchTerm}`,
          images: [],
          tags: ["tìm kiếm"],
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon),
          icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png",
        };

        // Instead of directly adding, let's just center the map to this search result
        map.setView([newLocation.lat, newLocation.lng], 13); // Zoom to result
        // Optionally, you could show a temporary marker or open the modal for this new location

        // If you want to show the modal for this searched location right away:
        // showLocationDetailModal(newLocation);
        // locations.push(newLocation); // Add to local locations array
        // renderLocations();
      } else {
        alert("Không tìm thấy địa điểm nào với từ khóa này.");
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa điểm:", error);
      alert("Đã xảy ra lỗi khi tìm kiếm địa điểm. Vui lòng thử lại.");
    }
  }
});
