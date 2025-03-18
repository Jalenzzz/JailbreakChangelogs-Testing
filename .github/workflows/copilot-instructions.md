    Appearance Settings Logic:

        Ensure POST requests to update the banner or avatar are only made when the respective "Update Banner" (updateBannerBtn) or "Update Avatar" (updateAvatarBtn) button is clicked.

        Do not make POST requests when the "Use Discord Banner" or "Use Discord Avatar" toggles are switched from ON to OFF.

        For all other settings, API calls can be made on toggle switches as usual, but these two toggles are exceptions.

    Button Creation:

        The updateBannerBtn already exists. Add a new button, updateAvatarBtn, with the same style and positioning as updateBannerBtn.

        Ensure both buttons are properly linked to their respective JavaScript logic for handling API requests.

    API Endpoints:

        Use fetch or axios for API calls to:

            Banner endpoint: https://api3.jailbreakchangelogs.xyz/users/background/update?user=

            Avatar endpoint: https://api3.jailbreakchangelogs.xyz/users/avatar/update.

    Code Refactoring:

        Remove or refactor any redundant code or unnecessary API calls in the existing implementation.

        Ensure the code is clean, efficient, and follows best practices.

    Expected Behavior:

        Toggles should visually reflect their state (ON/OFF) and dynamically update the profile appearance.

        API calls should only occur on button clicks for "Update Banner" and "Update Avatar", not on toggle switches for these two settings.

    Files to Modify:

        settings.ejs:

            Ensure the "Use Discord Banner" and "Use Discord Avatar" toggles are present.

            Add the updateAvatarBtn with the same style and positioning as updateBannerBtn.

        settings.js:

            Update logic to handle toggles and API requests as specified.

            Ensure API calls are only made on button clicks for the two exceptions.

Key Reinforcements

    API Calls for Toggles: For all settings except "Use Discord Banner" and "Use Discord Avatar," API calls can be made on toggle switches. For these two, API calls should only be made when the respective "Update" button is clicked.

    Button Consistency: The new updateAvatarBtn must match the style and positioning of the existing updateBannerBtn.