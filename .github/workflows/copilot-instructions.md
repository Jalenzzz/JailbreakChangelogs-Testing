    User Avatar Logic:

        Fetch user settings from the endpoint: https://api3.jailbreakchangelogs.xyz/users/settings?user= (where user is the user's ID).

        Use the following logic to determine the user's profile picture:

            If "avatar_discord": 0, use the avatar from custom_avatar.

            If "avatar_discord": 1, construct the profile picture URL using:
            javascript
            Copy

            const baseUrl = `https://cdn.discordapp.com/avatars/${udata.id}/${udata.avatar}`;

        If any error occurs (e.g., CORS or custom_avatar cannot be shown), fall back to fallbackUrl, which is already assigned to assets/default-avatar.png.

    Integration with nav.ejs:

        Check and modify nav.ejs in the api/views/partials folder to ensure the avatar is correctly set in the navigation bar.

        Use the same logic as above to determine whether to display the custom avatar or the Discord avatar.

    Integration with main.js:

        Reference main.js to understand how the avatar is currently set.

        Ensure the logic in main.js aligns with the avatar settings:

            If "avatar_discord": 0, use custom_avatar.

            If "avatar_discord": 1, use the constructed Discord avatar URL.

            Fall back to fallbackUrl if errors occur.

    Integration with comments.js:

        Modify comments.js to ensure the correct avatar is set for comments.

        Use the same logic as above to determine whether to display the custom avatar or the Discord avatar for each user in the comments section.

    Error Handling:

        Ensure proper error handling for:

            Failed API requests.

            Invalid or missing custom_avatar.

            CORS issues.

        Always fall back to fallbackUrl if the primary avatar source fails.

    Files to Modify:

        users.js: Implement the avatar logic as described.

        nav.ejs (in api/views/partials): Ensure the avatar is correctly set in the navigation bar.

        main.js: Align the avatar-setting logic with the user's settings.

        comments.js: Ensure the correct avatar is set for each user in the comments section.

    Expected Behavior:

        The correct avatar is displayed across the application (navigation bar, comments, etc.) based on the avatar_discord setting.

        Errors are gracefully handled, and the fallback avatar is shown if necessary.