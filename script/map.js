let map;
let markers = [];
let infoWindow;

// Load locations from localStorage, or initialize as empty array
let locations = JSON.parse(localStorage.getItem("locations")) || [];

// Location Detail Modal elements
const locationDetailModal = document.getElementById("locationDetailModal");
const detailCloseBtn = document.querySelector(".detail-close");
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

let currentImages = [];
let currentImageIndex = 0;
let editingLocationIndex = -1; // -1 for new location, otherwise index in locations array
let currentLat = null;
let currentLng = null;

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

  // Add event listener for delete button (assuming it exists in HTML for later)
  const deleteLocationBtn = document.querySelector(".btn.danger");
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
    if (day && month && year) {
      return `${year}-${month}-${day.padStart(2, "0")}`;
    }
  }
  // Fallback to default if parsing fails
  const date = new Date(dateString);
  if (!isNaN(date)) {
    return date.toISOString().split("T")[0];
  }
  return "";
}

function initMap() {
  map = L.map("map", {
    zoomControl: false,
  }).setView([16.0544, 108.2022], 12); // Default center for Vietnam (Da Nang)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const zoomControlContainer = L.DomUtil.create("div", "leaflet-control-zoom");
  zoomControlContainer.innerHTML = `
    <a class="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
    <a class="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">-</a>
  `;
  L.DomEvent.disableClickPropagation(zoomControlContainer);
  L.DomEvent.on(zoomControlContainer, "click", function (e) {
    if (L.DomUtil.hasClass(e.target, "leaflet-control-zoom-in")) {
      map.zoomIn();
    } else if (L.DomUtil.hasClass(e.target, "leaflet-control-zoom-out")) {
      map.zoomOut();
    }
  });
  const customZoomControl = L.control({ position: "topright" });
  customZoomControl.onAdd = function (map) {
    return zoomControlContainer;
  };
  customZoomControl.addTo(map);

  infoWindow = L.popup();
  renderLocations();

  map.on("click", async function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      let locationName = "Vị trí chưa xác định";

      if (data.address) {
        const addr = data.address;
        const street = addr.road || addr.footway || addr.path || "";
        const suburb = addr.suburb || addr.quarter || "";
        const city =
          addr.city || addr.town || addr.village || addr.county || "";
        const state = addr.state || "";
        const country = addr.country || "";

        let fullAddressParts = [];
        if (street) fullAddressParts.push(street);
        if (suburb && !street.includes(suburb)) fullAddressParts.push(suburb);
        if (city && !street.includes(city) && !suburb.includes(city))
          fullAddressParts.push(city);
        if (state && !city.includes(state)) fullAddressParts.push(state);
        if (country && !state.includes(country)) fullAddressParts.push(country);

        if (fullAddressParts.length > 0) {
          locationName = fullAddressParts.join(", ");
        }
      }

      showLocationDetailModal({
        id: `loc${Date.now()}`,
        name: locationName,
        address:
          data.display_name || `Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        date: new Date().toLocaleDateString("vi-VN"),
        note: "",
        images: [],
        tags: [],
        lat: lat,
        lng: lng,
        icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png", // Default marker for new locations
      });
    } catch (error) {
      console.error("Lỗi khi reverse geocoding:", error);
      showLocationDetailModal({
        id: `loc${Date.now()}`,
        name: "Vị trí chưa xác định",
        address: `Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        date: new Date().toLocaleDateString("vi-VN"),
        note: "",
        images: [],
        tags: [],
        lat: lat,
        lng: lng,
      });
    }
  });

  const searchInput = document.querySelector(".search-input");
  let searchTimeout;

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    clearTimeout(searchTimeout);

    if (searchTerm.length > 2) {
      searchTimeout = setTimeout(() => {
        searchLocationByArea(searchTerm);
      }, 500);
    } else if (searchTerm.length === 0) {
      renderLocations(locations);
    } else {
      filterLocations(searchTerm);
    }
  });
}

function renderLocations(filteredLocations = locations) {
  const locationList = document.getElementById("locationList");
  locationList.innerHTML = "";
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];

  // Check if locations array is empty, and if so, add a placeholder message
  if (filteredLocations.length === 0) {
    locationList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #888;">
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828905.png" alt="empty" style="width: 50px; opacity: 0.5; margin-bottom: 10px;"/>
        <p>Chưa có địa điểm nào được lưu. Hãy click vào bản đồ hoặc nút "+ Thêm Địa Điểm" để bắt đầu!</p>
      </div>
    `;
    return;
  }

  filteredLocations.forEach((loc) => {
    // Create a custom icon
    const customIcon = L.icon({
      iconUrl:
        loc.icon || "https://cdn-icons-png.flaticon.com/512/1828/1828905.png",
      iconSize: [38, 38], // size of the icon
      iconAnchor: [19, 38], // point from which the icon will be centered
      popupAnchor: [0, -38], // point from which the popup should open relative to the iconAnchor
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(
      map
    );
    markers.push(marker);

    marker.on("click", function () {
      showLocationDetailModal(loc);
    });

    const locationItem = document.createElement("div");
    locationItem.classList.add("location-item");
    locationItem.innerHTML = `
      <div class="location-icon"><img src="${
        loc.icon || "https://cdn-icons-png.flaticon.com/512/1828/1828905.png"
      }" alt="icon"/></div>
      <div class="location-details">
        <div class="location-name">${loc.name}</div>
        <div class="location-info">${loc.address}</div>
        <div class="location-tags">
          ${loc.tags
            .map((tag) => `<span class="location-tag">${tag}</span>`)
            .join("")}
        </div>
      </div>
    `;
    locationItem.addEventListener("click", () => {
      map.setView([loc.lat, loc.lng], 15); // Zoom to location on map
      showLocationDetailModal(loc);
    });
    locationList.appendChild(locationItem);
  });

  // Set map view to the first location if any, otherwise default to Vietnam
  if (filteredLocations.length > 0) {
    map.setView(
      [filteredLocations[0].lat, filteredLocations[0].lng],
      map.getZoom()
    );
  }
}

function filterLocations(searchTerm) {
  const filtered = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm) ||
      loc.address.toLowerCase().includes(searchTerm) ||
      loc.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
  renderLocations(filtered);
}

async function searchLocationByArea(searchTerm) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&addressdetails=1&limit=1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      map.setView([lat, lng], 13); // Zoom to the searched area
      // After searching an area, filter local locations by name/tag
      filterLocations(searchTerm);
    } else {
      alert("Không tìm thấy khu vực nào phù hợp.");
      renderLocations(locations); // Show all locations if no area found
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khu vực:", error);
    alert("Có lỗi xảy ra khi tìm kiếm khu vực.");
    renderLocations(locations);
  }
}

// Call initMap and setupLocationDetailModal when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initMap();
  setupLocationDetailModal();
});
