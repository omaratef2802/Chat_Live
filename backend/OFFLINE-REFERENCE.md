# Chat Live — Offline Reference Pack

This branch is intended as a learning/reference backend. Before going offline:

1. Pull or download the complete `refrence-chatpgt` branch while you still have internet.
2. In `backend/`, run `npm install` once while online. This downloads dependencies; the source and Postman collection alone cannot replace `node_modules`.
3. Configure `.env` from `.env.example`. MongoDB must be reachable locally or through a network connection; SMTP and Cloudinary require internet. Health, local MongoDB and most API flows can work offline if MongoDB is local and dependencies are already installed. Email OTP and Cloudinary uploads need their services reachable.
4. Start MongoDB, then run `npm start`.
5. Import both files in `postman/` into Postman: the collection and the Local environment. Set the test email, password, unique username and phone. Select the Local environment.
6. Run Health check, Register, read the OTP from the configured email inbox, enter it in `otpCode`, Verify email, then Login. Copy the returned login `token` into `accessToken` manually if it is not saved by your Postman version.
7. Create two accounts before testing contacts, private chats and groups. Paste the second user's MongoDB ID into `otherUserId`; after creating a conversation/group/story, paste its returned ID into the matching environment variable.
8. For QR pairing, run Start QR pairing on the secondary device, copy `pairToken`, call Confirm QR pairing while authenticated as the primary user, then Poll QR pairing from the secondary client. The poll returns access and refresh tokens; save them in the environment.

## What works offline and what does not

- Postman collection, documentation, schema checks and local API calls can be used offline once the repo, Node dependencies and Postman app are already installed.
- Email verification/reset require SMTP reachability. Cloudinary media upload requires internet and valid credentials.
- Socket.IO can run on a local network; remote devices must be able to reach the host.
- Do not commit your real `.env` or Postman secrets.

## Test evidence

The Postman collection contains reusable requests for the API surface. Importing a collection is not the same as running it. Live API assertions must be executed against a running backend with a configured MongoDB instance and credentials. See the branch README for implementation caveats and test scope.
