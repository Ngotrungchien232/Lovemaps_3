// Xử lý modal thông báo
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("notificationModal");
  const closeBtn = document.querySelector(".close-modal");
  const navLinks = document.querySelectorAll(".nav-links a");
  const tryBtn = document.querySelector(".try-btn");
  const loginBtn = document.querySelector(".login-btn");

  // Hàm hiển thị modal
  function showModal() {
    modal.classList.add("show");
    document.body.style.overflow = "hidden"; // Ngăn scroll khi modal hiển thị
  }

  // Hàm ẩn modal
  function hideModal() {
    modal.classList.remove("show");
    document.body.style.overflow = ""; // Cho phép scroll lại
  }

  // Xử lý click vào các thẻ nav
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Kiểm tra trạng thái đăng nhập trước khi hiển thị modal
      if (localStorage.getItem("isLoggedIn") === "true") {
        // Nếu đã đăng nhập, không ngăn chặn hành vi mặc định (cho phép điều hướng)
        // Tuy nhiên, nếu bạn muốn xử lý hành vi khác (ví dụ: mở modal khác), bạn sẽ cần thêm logic ở đây.
        // Trong trường hợp này, chúng ta chỉ cần loại bỏ showModal() khi đã đăng nhập.
        // Đối với các liên kết trên navbar, nếu đã đăng nhập thì chúng sẽ được xử lý bởi map.js hoặc dashboard.js
        // và có thể có các modal hoặc chức năng riêng.
        // Do đó, chúng ta sẽ không ngăn chặn `e.preventDefault()` để cho phép hành vi mặc định.
        // Nhưng để đảm bảo các modal khác không hiển thị nếu đã đăng nhập, chúng ta sẽ ẩn chúng nếu có.
        hideModal(); // Ẩn modal thông báo nếu nó vô tình hiển thị
        // Cho phép hành vi mặc định của liên kết (điều hướng).
        // Lưu ý: Nếu các liên kết này có hành vi JS riêng (ví dụ: mở modal kỷ niệm), chúng sẽ tự xử lý.
        // Chúng ta chỉ cần đảm bảo modal thông báo không bật lên.
      } else {
        e.preventDefault(); // Ngăn chặn hành vi mặc định chỉ khi chưa đăng nhập
        showModal(); // Hiển thị modal thông báo
      }
    });
  });

  // Xử lý click vào nút đóng modal
  closeBtn.addEventListener("click", hideModal);

  // Xử lý click bên ngoài modal để đóng
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      hideModal();
    }
  });

  // Xử lý phím ESC để đóng modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      hideModal();
    }
  });

  // Không hiển thị modal khi click vào nút Dùng Thử và Đăng Nhập
  tryBtn.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  loginBtn.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Hiển thị Goodbye Modal nếu có cờ
  const goodbyeModal = document.getElementById("goodbyeModal");
  if (localStorage.getItem("showGoodbyeModal") === "true") {
    if (goodbyeModal) {
      goodbyeModal.classList.add("show");
      document.body.style.overflow = "hidden";
      localStorage.removeItem("showGoodbyeModal");
      setTimeout(() => {
        goodbyeModal.classList.remove("show");
        document.body.style.overflow = "";
      }, 2000);
    }
  }
});

// Modal Đăng Nhập/Đăng Ký
(function () {
  const authModal = document.getElementById("authModal");
  const authClose = document.getElementById("authClose");
  const tryBtn = document.querySelector(".try-btn");
  const loginBtn = document.querySelector(".login-btn");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tryNowBtn = document.querySelector(".btn.primary");
  const exploreBtn = document.querySelector(".btn.secondary");

  function showAuthModal(tab = "login") {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden";
    if (tab === "login") {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      loginForm.style.display = "";
      registerForm.style.display = "none";
    } else {
      loginTab.classList.remove("active");
      registerTab.classList.add("active");
      loginForm.style.display = "none";
      registerForm.style.display = "";
    }
  }
  function hideAuthModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "";
  }
  if (tryBtn)
    tryBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showAuthModal("register");
    });
  if (loginBtn)
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showAuthModal("login");
    });
  if (tryNowBtn)
    tryNowBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showAuthModal("register");
    });
  if (exploreBtn)
    exploreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showAuthModal("register");
    });
  if (authClose) authClose.addEventListener("click", hideAuthModal);
  if (authModal)
    authModal.addEventListener("click", function (e) {
      if (e.target === authModal) hideAuthModal();
    });
  if (loginTab)
    loginTab.addEventListener("click", function () {
      showAuthModal("login");
    });
  if (registerTab)
    registerTab.addEventListener("click", function () {
      showAuthModal("register");
    });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show"))
      hideAuthModal();
  });

  // Validate email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Xử lý Đăng Ký
  if (registerForm)
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Xóa lỗi cũ
      document.getElementById("registerEmailError").textContent = "";
      document.getElementById("registerPasswordError").textContent = "";
      document.getElementById("registerConfirmError").textContent = "";
      const email = registerForm
        .querySelector('input[type="email"]')
        .value.trim();
      const password = registerForm
        .querySelectorAll('input[type="password"]')[0]
        .value.trim();
      const confirm = registerForm
        .querySelectorAll('input[type="password"]')[1]
        .value.trim();
      let hasError = false;
      if (!email) {
        document.getElementById("registerEmailError").textContent =
          "Vui lòng nhập email!";
        hasError = true;
      } else if (!isValidEmail(email)) {
        document.getElementById("registerEmailError").textContent =
          "Email không hợp lệ!";
        hasError = true;
      }
      if (!password) {
        document.getElementById("registerPasswordError").textContent =
          "Vui lòng nhập mật khẩu!";
        hasError = true;
      } else if (password.length < 6) {
        document.getElementById("registerPasswordError").textContent =
          "Mật khẩu phải có ít nhất 6 ký tự!";
        hasError = true;
      }
      if (!confirm) {
        document.getElementById("registerConfirmError").textContent =
          "Vui lòng xác nhận mật khẩu!";
        hasError = true;
      } else if (password !== confirm) {
        document.getElementById("registerConfirmError").textContent =
          "Mật khẩu xác nhận không khớp!";
        hasError = true;
      }
      // Kiểm tra email đã tồn tại
      const user = JSON.parse(localStorage.getItem("user"));
      if (!hasError && user && user.email === email) {
        document.getElementById("registerEmailError").textContent =
          "Email này đã được đăng ký!";
        hasError = true;
      }
      if (hasError) return;
      // Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify({ email, password }));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isShowWelcome", "true");
      window.location.href = "dashboard.html";
    });

  // Xử lý Đăng Nhập
  if (loginForm)
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Xóa lỗi cũ
      document.getElementById("loginEmailError").textContent = "";
      document.getElementById("loginPasswordError").textContent = "";
      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm
        .querySelector('input[type="password"]')
        .value.trim();
      let hasError = false;
      if (!email) {
        document.getElementById("loginEmailError").textContent =
          "Vui lòng nhập email!";
        hasError = true;
      } else if (!isValidEmail(email)) {
        document.getElementById("loginEmailError").textContent =
          "Email không hợp lệ!";
        hasError = true;
      }
      if (!password) {
        document.getElementById("loginPasswordError").textContent =
          "Vui lòng nhập mật khẩu!";
        hasError = true;
      }
      const user = JSON.parse(localStorage.getItem("user"));
      if (
        !hasError &&
        (!user || user.email !== email || user.password !== password)
      ) {
        document.getElementById("loginPasswordError").textContent =
          "Email hoặc mật khẩu không đúng!";
        hasError = true;
      }
      if (hasError) return;
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isShowWelcome", "true");
      window.location.href = "dashboard.html";
    });

  // Forgot Password Modal
  const forgotModal = document.getElementById("forgotModal");
  const forgotClose = document.getElementById("forgotClose");
  const forgotBtn = document.getElementById("forgotSubmit");
  const forgotInput = document.getElementById("loverNameInput");
  const forgotError = document.getElementById("forgotError");
  const forgotResult = document.getElementById("forgotResult");
  const forgotLink = document.querySelector(".auth-link");

  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (authModal) authModal.classList.remove("show");
      if (forgotModal) forgotModal.classList.add("show");
      document.body.style.overflow = "hidden";
      forgotInput.value = "";
      forgotError.textContent = "";
      forgotResult.textContent = "";
    });
  }
  if (forgotClose) {
    forgotClose.addEventListener("click", function () {
      forgotModal.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
  if (forgotModal) {
    forgotModal.addEventListener("click", function (e) {
      if (e.target === forgotModal) {
        forgotModal.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }
  if (forgotBtn) {
    forgotBtn.addEventListener("click", function () {
      forgotError.textContent = "";
      forgotResult.textContent = "";
      const loverName = forgotInput.value.trim();
      if (!loverName) {
        forgotError.textContent = "Vui lòng nhập tên người yêu!";
        return;
      }
      if (
        loverName.toLowerCase() === "lê thuỳ trang" ||
        loverName.toLowerCase() === "le thuy trang"
      ) {
        // Lấy mật khẩu từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.password) {
          forgotResult.textContent = "Mật khẩu của bạn là: " + user.password;
        } else {
          forgotError.textContent = "Không tìm thấy tài khoản!";
        }
      } else {
        forgotError.textContent = "Tên người yêu không đúng!";
      }
    });
  }
})();
