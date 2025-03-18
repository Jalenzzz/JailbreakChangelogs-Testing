document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("userid");
  if (!userId) {
    window.location.href = "/login";
    return;
  }

  // Show loading overlay immediately when page loads
  showLoadingOverlay();

  function showLoadingOverlay() {
    document.querySelector("#loading-overlay").classList.add("show");
  }

  function hideLoadingOverlay() {
    document.querySelector("#loading-overlay").classList.remove("show");
  }

  // Helper function to create toggle button
  function createToggleButton(value) {
    const icon = document.createElement("i");
    icon.innerHTML =
      value === 1
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <rect width="16" height="16" fill="none" />
                <path fill="currentColor" d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06a.733.733 0 0 1 1.047 0l3.052 3.093l5.4-6.425z" />
               </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <rect width="16" height="16" fill="none" />
                <path fill="currentColor" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
               </svg>`;
    return icon.innerHTML;
  }

  // Load settings and update switches
  async function loadSettings() {
    try {
      const response = await fetch(
        `https://api3.jailbreakchangelogs.xyz/users/settings?user=${userId}`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to load settings");
      const settings = await response.json();

      // Update all switches
      document
        .querySelectorAll(".form-check-input[data-setting]")
        .forEach((input) => {
          const setting = input.dataset.setting;
          if (setting in settings) {
           
            input.checked = settings[setting] === 1;

            // Handle visibility of custom input fields
            if (setting === "banner_discord") {
              const customBannerInput = document.getElementById(
                "custom_banner_input"
              );
              if (customBannerInput) {
                customBannerInput.style.display =
                  settings[setting] === 1 ? "none" : "block";
              }
            }
            if (setting === "avatar_discord") {
              const customAvatarInput = document.getElementById("custom_avatar_input");
              if (customAvatarInput) {
                customAvatarInput.style.display = settings[setting] === 1 ? "none" : "block";
              }
            }
          }
        });

      // Load custom banner URL if discord banner is disabled
      if (settings.banner_discord === 0) {
        const bannerResponse = await fetch(
          `https://api3.jailbreakchangelogs.xyz/users/background/get?user=${userId}`
        );
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          if (bannerData.image_url && bannerData.image_url !== "NONE") {
            document.getElementById("bannerInput").value = bannerData.image_url;
          }
        }
      }

      // Load custom avatar URL if discord avatar is disabled
      if (settings.avatar_discord === 0) {
        const userResponse = await fetch(
          `https://api3.jailbreakchangelogs.xyz/users/get/?id=${userId}`
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.custom_avatar) {
            document.getElementById("avatarInput").value = userData.custom_avatar;
          }
        }
      }

      // Hide loading overlay once everything is loaded
      hideLoadingOverlay();
    } catch (error) {
      console.error("Error loading settings:", error);
      notyf.error("Failed to load settings");
      hideLoadingOverlay(); // Hide overlay even on error
    }
  }

  // Initialize Notyf
  const notyf = new Notyf({
    duration: 2000,
    position: { x: "right", y: "bottom" },
    types: [
      {
        type: "success",
        background: "#124e66",
        icon: false,
      },
      {
        type: "error",
        background: "#dc3545",
        icon: false,
      },
    ],
  });

  // Helper function to refresh page after settings update
  function refreshPage() {
    showLoadingOverlay();
    window.location.reload();
  }

  // Add click handlers for all toggle buttons
  document.querySelectorAll('.btn[id$="_button"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const settingKey = button.id.replace("_button", "");
      const currentValue = button.classList.contains("btn-success") ? 1 : 0;
      const newValue = currentValue === 1 ? 0 : 1;

      try {
        const token = getCookie("token");
        const response = await fetch(
          `https://api3.jailbreakchangelogs.xyz/users/settings/update?user=${token}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify({
              [settingKey]: newValue,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update setting");

        notyf.success("Setting updated successfully");
        refreshPage(); // Refresh page after successful update
      } catch (error) {
        console.error("Error updating setting:", error);
        notyf.error("Failed to update setting");
      }
    });
  });

  // Update settings immediately when a switch changes
  document
    .querySelectorAll(".form-check-input[data-setting]")
    .forEach((input) => {
      input.addEventListener("change", async function () {
        const setting = this.dataset.setting;
        const newValue = this.checked ? 1 : 0;
        const token = getCookie("token");
        
        // Handle visibility for banner_discord and avatar_discord
        if (setting === "banner_discord" || setting === "avatar_discord") {
          const inputId = setting === "banner_discord" ? "custom_banner_input" : "custom_avatar_input";
          document.getElementById(inputId).style.display = this.checked ? "none" : "block";
          
          // Only make API call when toggling ON (1)
          if (newValue === 1) {
            try {
              // Get current state of all settings
              const currentSettings = {
                profile_public: document.querySelector('[data-setting="profile_public"]').checked ? 1 : 0,
                show_recent_comments: document.querySelector('[data-setting="show_recent_comments"]').checked ? 1 : 0,
                hide_following: document.querySelector('[data-setting="hide_following"]').checked ? 1 : 0,
                hide_followers: document.querySelector('[data-setting="hide_followers"]').checked ? 1 : 0,
                hide_favorites: document.querySelector('[data-setting="hide_favorites"]').checked ? 1 : 0,
                banner_discord: document.querySelector('[data-setting="banner_discord"]').checked ? 1 : 0,
                avatar_discord: document.querySelector('[data-setting="avatar_discord"]').checked ? 1 : 0,
                hide_connections: document.querySelector('[data-setting="hide_connections"]').checked ? 1 : 0,
                hide_presence: document.querySelector('[data-setting="hide_presence"]').checked ? 1 : 0,
              };

              const response = await fetch(
                `https://api3.jailbreakchangelogs.xyz/users/settings/update?user=${token}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                  },
                  body: JSON.stringify(currentSettings),
                }
              );
              if (!response.ok) throw new Error("Failed to update setting");
              notyf.success("Setting updated successfully");
              refreshPage(); // Refresh page after successful update
            } catch (error) {
              console.error("Error updating setting:", error);
              notyf.error("Failed to update setting");
              // Revert the toggle state
              this.checked = !this.checked;
              document.getElementById(inputId).style.display = this.checked ? "none" : "block";
            }
          }
          return;
        }

        // For all other settings
        try {
          const currentSettings = {
            profile_public: document.querySelector('[data-setting="profile_public"]').checked ? 1 : 0,
            show_recent_comments: document.querySelector('[data-setting="show_recent_comments"]').checked ? 1 : 0,
            hide_following: document.querySelector('[data-setting="hide_following"]').checked ? 1 : 0,
            hide_followers: document.querySelector('[data-setting="hide_followers"]').checked ? 1 : 0,
            hide_favorites: document.querySelector('[data-setting="hide_favorites"]').checked ? 1 : 0,
            banner_discord: document.querySelector('[data-setting="banner_discord"]').checked ? 1 : 0,
            avatar_discord: document.querySelector('[data-setting="avatar_discord"]').checked ? 1 : 0,
            hide_connections: document.querySelector('[data-setting="hide_connections"]').checked ? 1 : 0,
            hide_presence: document.querySelector('[data-setting="hide_presence"]').checked ? 1 : 0,
          };

          const response = await fetch(
            `https://api3.jailbreakchangelogs.xyz/users/settings/update?user=${token}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
              body: JSON.stringify(currentSettings),
            }
          );
          const responseData = await response.json();
          if (!response.ok || responseData.error) {
            throw new Error(responseData.error || "Failed to update settings");
          }
          notyf.success("Setting updated successfully");
          refreshPage(); // Refresh page after successful update
        } catch (error) {
          console.error("Error updating settings:", error);
          notyf.error("Failed to update settings");
          this.checked = !this.checked;
        }
      });
    });

  // Handle banner update button
  document.getElementById("updateBannerBtn").addEventListener("click", async () => {
    const imageUrl = document.getElementById("bannerInput").value.trim();
    const token = getCookie("token");
    const bannerDiscordToggle = document.querySelector('[data-setting="banner_discord"]');

    try {
      // First update the banner URL
      const bannerResponse = await fetch(
        `https://api3.jailbreakchangelogs.xyz/users/background/update?user=${token}&image=${encodeURIComponent(
          imageUrl || "NONE"
        )}`,
        {
          method: "POST",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!bannerResponse.ok) throw new Error("Failed to update banner URL");

      // Then ensure the setting is set to use custom banner
      const currentSettings = {
        profile_public: document.querySelector('[data-setting="profile_public"]').checked ? 1 : 0,
        show_recent_comments: document.querySelector('[data-setting="show_recent_comments"]').checked ? 1 : 0,
        hide_following: document.querySelector('[data-setting="hide_following"]').checked ? 1 : 0,
        hide_followers: document.querySelector('[data-setting="hide_followers"]').checked ? 1 : 0,
        hide_favorites: document.querySelector('[data-setting="hide_favorites"]').checked ? 1 : 0,
        banner_discord: 0, // Force to use custom banner
        avatar_discord: document.querySelector('[data-setting="avatar_discord"]').checked ? 1 : 0,
        hide_connections: document.querySelector('[data-setting="hide_connections"]').checked ? 1 : 0,
        hide_presence: document.querySelector('[data-setting="hide_presence"]').checked ? 1 : 0,
      };

      const settingsResponse = await fetch(
        `https://api3.jailbreakchangelogs.xyz/users/settings/update?user=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify(currentSettings),
        }
      );
      if (!settingsResponse.ok) throw new Error("Failed to update banner settings");

      // Update UI to reflect changes
      if (bannerDiscordToggle) {
        bannerDiscordToggle.checked = false;
      }
      document.getElementById("custom_banner_input").style.display = "block";

      notyf.success("Banner updated successfully");
      refreshPage(); // Refresh page after successful update
    } catch (error) {
      console.error("Error updating banner:", error);
      notyf.error("Failed to update banner");
    }
  });

  // Handle avatar update button
  document.getElementById("updateAvatarBtn").addEventListener("click", async () => {
    const imageUrl = document.getElementById("avatarInput").value.trim();
    const token = getCookie("token");
    const avatarDiscordToggle = document.querySelector('[data-setting="avatar_discord"]');

    try {
      // First update the avatar URL
      const avatarResponse = await fetch(
        "https://api3.jailbreakchangelogs.xyz/users/avatar/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            owner: token,
            url: imageUrl
          })
        }
      );
      if (!avatarResponse.ok) throw new Error("Failed to update avatar URL");

      // Then ensure the setting is set to use custom avatar
      const currentSettings = {
        profile_public: document.querySelector('[data-setting="profile_public"]').checked ? 1 : 0,
        show_recent_comments: document.querySelector('[data-setting="show_recent_comments"]').checked ? 1 : 0,
        hide_following: document.querySelector('[data-setting="hide_following"]').checked ? 1 : 0,
        hide_followers: document.querySelector('[data-setting="hide_followers"]').checked ? 1 : 0,
        hide_favorites: document.querySelector('[data-setting="hide_favorites"]').checked ? 1 : 0,
        banner_discord: document.querySelector('[data-setting="banner_discord"]').checked ? 1 : 0,
        avatar_discord: 0, // Force to use custom avatar
        hide_connections: document.querySelector('[data-setting="hide_connections"]').checked ? 1 : 0,
        hide_presence: document.querySelector('[data-setting="hide_presence"]').checked ? 1 : 0,
      };

      const settingsResponse = await fetch(
        `https://api3.jailbreakchangelogs.xyz/users/settings/update?user=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify(currentSettings),
        }
      );
      if (!settingsResponse.ok) throw new Error("Failed to update avatar settings");

      // Update UI to reflect changes
      if (avatarDiscordToggle) {
        avatarDiscordToggle.checked = false;
      }
      document.getElementById("custom_avatar_input").style.display = "block";

      notyf.success("Avatar updated successfully");
      refreshPage(); // Refresh page after successful update
    } catch (error) {
      console.error("Error updating avatar:", error);
      notyf.error("Failed to update avatar");
    }
  });

  // Handle account deletion
  const deleteAccountButton = document.getElementById("delete-account-button");
  const deleteConfirmation = document.getElementById("delete-confirmation");
  const confirmDeleteButton = document.getElementById("confirm-delete");
  const cancelDeleteButton = document.getElementById("cancel-delete");
  const deletionCountdown = document.getElementById("deletion-countdown");
  let countdownInterval;
  let deleteTimeout;

  deleteAccountButton.addEventListener("click", () => {
    deleteConfirmation.style.display = "block";
    deleteAccountButton.style.display = "none";

    // Start countdown from 10
    let secondsLeft = 10;
    confirmDeleteButton.disabled = true;

    // Clear any existing intervals/timeouts
    clearInterval(countdownInterval);
    clearTimeout(deleteTimeout);

    countdownInterval = setInterval(() => {
      secondsLeft--;
      deletionCountdown.textContent = secondsLeft;

      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        confirmDeleteButton.disabled = false;
        deletionCountdown.parentElement.innerHTML =
          "<strong>Warning:</strong> You can now proceed with account deletion";
      }
    }, 1000);
  });

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmation.style.display = "none";
    deleteAccountButton.style.display = "block";
    clearInterval(countdownInterval);
    clearTimeout(deleteTimeout);
    deletionCountdown.textContent = "10"; // Reset to 10 seconds
  });

  confirmDeleteButton.addEventListener("click", async () => {
    if (confirmDeleteButton.disabled) {
      return;
    }

    try {
      const token = getCookie("token");
      if (!token) {
        notyf.error("You must be logged in to delete your account");
        return;
      }

      confirmDeleteButton.disabled = true;
      confirmDeleteButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Deleting...
      `;
      cancelDeleteButton.style.display = "none";

      const response = await fetch(
        `https://api3.jailbreakchangelogs.xyz/users/delete?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "DELETE",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete account");

      notyf.success("Account deleted successfully. Redirecting...");

      // Clear cookies and local storage
      Cookies.remove("token");
      localStorage.clear();

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      notyf.error("Failed to delete account");
      confirmDeleteButton.disabled = false;
      confirmDeleteButton.innerHTML = "Yes, Delete My Account";
      cancelDeleteButton.style.display = "inline-block";
    }
  });

  // Add listeners for banner_discord and avatar_discord toggles
  document.getElementById("banner_discord").addEventListener("change", function (e) {
    const customBannerInput = document.getElementById("custom_banner_input");
    customBannerInput.style.display = e.target.checked ? "none" : "block";
  });

  document.getElementById("avatar_discord").addEventListener("change", function (e) {
    const customAvatarInput = document.getElementById("custom_avatar_input");
    customAvatarInput.style.display = e.target.checked ? "none" : "block";
  });

  // Initialize settings
  loadSettings();
});
