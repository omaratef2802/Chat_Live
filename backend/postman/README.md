# Postman setup and test order

1. Import `Chat-Live-Backend.postman_collection.json` and `Chat-Live-Local.postman_environment.json`.
2. Select the environment named **Chat Live - Local**.
3. Set `email`, `password`, `phone` and a unique `username` before Register.
4. Run Register. Retrieve the email OTP from the configured inbox, set `otpCode`, then run Verify email and Login. Do not run the whole collection in one click: resend/forgot/reset and destructive requests are alternate flows and require the right state/IDs.
5. Login stores the bearer token. Run My profile to confirm auth.
6. Register and verify a second account separately. Paste its MongoDB user ID into `otherUserId` before testing contacts, private chat and groups.
7. Requests named Create private conversation, Create group, Send text message, Create text story and Add contact store returned IDs for later requests.
8. Upload media requires selecting a file in the Body tab. Email OTP requires SMTP access. Cloudinary upload requires network access.
9. For QR pairing, run Start QR pairing from the secondary device. Pass its `pairToken` to the authenticated Confirm QR pairing request from the primary device. Then run Poll QR pairing from the secondary device; it stores the returned access/refresh tokens and device ID.
10. Run selected requests or a folder after the API is running; avoid running destructive requests or alternate auth flows as part of one full collection run. The assertions require a 2xx response; a failure may mean the request needs a prerequisite ID or the relevant external service is not configured.

This collection is a saved test suite, not proof that the API has already passed it. The backend host is local to your machine; a remote Postman runner cannot reach your localhost unless you expose it through a secure tunnel. Run it from the Postman desktop app on the same machine as the API.
