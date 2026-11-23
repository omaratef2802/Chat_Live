# Chat Live Backend — Reference Implementation

A modular REST API and real-time chat backend built with Node.js, Express 5, MongoDB/Mongoose and Socket.IO. CommonJS is used throughout. This branch is a learning/reference implementation; do not treat it as production-certified until the integration test checklist below has been run.

## 1. Requirements and setup

- Node.js 20.19+ (the project has been developed against Node 24).
- MongoDB local or Atlas.
- SMTP account for email OTP.
- Cloudinary account for uploads.
- Postman for API requests.

```bash
cd backend
npm install
cp .env.example .env
# Fill in the values in .env
npm run dev
```

The API starts only after MongoDB connects and `JWT_SECRET` is present. Default port: 3000.

## 2. Environment variables

See `.env.example`. Required for normal startup: `MONGODB_URI`, `JWT_SECRET`. Email endpoints need `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`; uploads need the three Cloudinary values. Set `CORS_ORIGIN` to the Angular origin (comma-separated when there are multiple). Never commit `.env`.

## 3. Postman reference

Import these two files into Postman:
- `postman/Chat-Live-Backend.postman_collection.json`
- `postman/Chat-Live-Local.postman_environment.json`

Select **Chat Live - Local**, set `email`, `password`, `username`, and `phone`, then run requests in order. After Register, read the OTP from the configured email inbox and put it in `otpCode`; run Verify email, then Login. Login and selected create requests save returned IDs/tokens into environment variables automatically. Create a second user and set `otherUserId` before testing contacts, chats and groups. The media request requires choosing a local file manually.

The collection's assertions check for successful 2xx responses. A passing collection run against a real running API is required to claim live behavior is verified. Importing or linting the collection alone is not an API test.

## 4. API routes

Base URL: `http://localhost:3000/api/v1`. Protected routes accept `Authorization: Bearer <accessToken>`.

### Health
- `GET /health` — API and MongoDB state.

### Authentication
- `POST /auth/register` — requires firstName, lastName, email, phone, password, username.
- `POST /auth/verify-email` — email + six-digit code.
- `POST /auth/resend-verification` — email.
- `POST /auth/login` — email + password.
- `POST /auth/forgot-password` — email.
- `POST /auth/reset-password` — email + code + new password.
- `POST /auth/refresh` — linked deviceId + refreshToken; rotates the refresh token.
- `POST /auth/logout` — revokes the current linked-device session when token has a deviceId.

OTP codes are hashed in MongoDB, expire in 10 minutes, have up to five attempts, and resend is throttled for one minute. Email is the only OTP channel; phone is collected as a unique account field, not used for SMS verification.

### Users, contacts and blocks
- `GET /users/me`, `GET /users/search?q=`, `PATCH /users/me`, `PATCH /users/me/privacy`.
- `GET /contacts`, `POST /contacts {userId,nickname?}`, `PATCH /contacts/:id`, `DELETE /contacts/:id`.
- `GET /blocks`, `POST /blocks {userId}`, `DELETE /blocks/:userId`.

Username, email and phone are unique. Phone is omitted from user responses unless the user's privacy setting allows it.

### Conversations, messages and groups
- `GET /conversations`; `POST /conversations/private {userId}`.
- `GET /conversations/:id/messages?page=1&limit=30`; `POST /conversations/:id/messages`.
- `PATCH /conversations/:id/messages/:messageId` edits text messages.
- `DELETE /conversations/:id/messages/:messageId` with `{forEveryone:true}` deletes for everyone (sender only); otherwise it deletes for the current user.
- `POST /conversations/:id/messages/:messageId/reactions {emoji}`; `POST /conversations/:id/read {messageId}`.
- `POST /groups {name,description?,memberIds}`; `GET /groups/:id/members`; `POST /groups/:id/members {memberIds}`; `PATCH /groups/:id`; `PATCH /groups/:id/members/:userId/role {role}`; `DELETE /groups/:id/members/:userId`; `POST /groups/:id/leave`; `DELETE /groups/:id` (admin only).

Membership is checked for message operations. Group admin can add/remove members, update details and promote/demote members; the last admin cannot be removed or demoted. Group read receipts are intentionally not implemented. Member last-read position is stored for unread tracking.

### Media
- `POST /media` with multipart field `file`; 20 MB limit; Cloudinary stores supported image/video/audio/PDF/plain-text content.

### Stories
- `GET /stories`, `POST /stories`, `POST /stories/:id/view`, `GET /stories/:id/views` (owner only), `DELETE /stories/:id`.
- Story types: text/image/video; visibility: everyone/contacts/selected; stories expire after 24 hours. The API checks expiry even while MongoDB TTL cleanup is pending.

### Notifications
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`.
- Private-message notifications are created by both REST and Socket.IO message paths.

### Linked devices and QR pairing
1. Secondary client calls `POST /devices/pair/start {deviceName,deviceType}`; it receives `pairToken` and `qrPayload`. Render the payload as a QR code in the client.
2. Primary authenticated client scans the QR payload and calls `POST /devices/pair/confirm {pairToken}`.
3. Secondary client polls `POST /devices/pair/status {pairToken}`; once confirmed, it receives accessToken, refreshToken and deviceId.
4. Refresh with `POST /auth/refresh {deviceId,refreshToken}`. Refresh tokens rotate on every successful use.
5. Authenticated primary clients can list `GET /devices` and revoke `DELETE /devices/:deviceId`. Access tokens issued for a linked device are rejected after revocation.

Pair tokens expire after two minutes. Refresh tokens are hashed at rest; the temporary handoff value is encrypted with a key derived from JWT_SECRET and removed after the secondary client retrieves it. The QR rendering/scanning UI belongs to the Angular client; this API provides the pairing payload and handshake.

### Socket.IO
Connect to the same host with `auth: { token: accessToken }`. Events:
- Client → server: `conversation:join {conversationId}`, `message:send {conversationId,type,content,media?,replyTo?}` (ack callback), `typing:start {conversationId}`, `typing:stop {conversationId}`.
- Server → room: `message:new`, `typing:start`, `typing:stop`.

Sockets authenticate access tokens and linked-device status, verify active conversation membership before joining/sending, and update online presence without marking a user offline while another socket remains connected. For horizontal multi-instance deployment, configure a shared Socket.IO adapter; it is not included.

## 5. Data models

Existing models are retained in `src/modules`: users, OTPs, linked devices, contacts, blocks, conversations, conversation members, messages, stories, story views and notifications. `dbConversion.js` remains a compatibility alias; conversations intentionally use the legacy MongoDB collection name `conversions`.

## 6. Security and important limits

- Passwords and OTPs are hashed; refresh tokens are hashed at rest.
- Linked-device refresh tokens rotate; revoked linked-device access tokens are rejected.
- Ownership and active membership are checked for protected resources.
- CORS is configured from environment; security response headers are added.\n- In-memory rate limits protect authentication and QR-pair start endpoints. Use a shared/distributed limiter for multi-instance production.
- Uploads use in-memory buffering with a 20 MB cap.
- Configure HTTPS and an explicit CORS allowlist before deployment.

Still required before production: run the complete Postman collection against a real MongoDB/SMTP/Cloudinary setup; test QR pairing with two real clients; review race conditions and authorization edge cases; replace the in-memory rate limiter with a shared/distributed limiter for multi-instance production; validate file content beyond MIME headers; test presence with multiple devices and disconnect/reconnect cases. Group read receipts and SMS OTP are intentionally out of scope.

## 7. Offline preparation

See `OFFLINE-REFERENCE.md`. Download/pull this branch and run `npm install` while you still have internet. Email OTP and Cloudinary uploads require internet access even if the API and local MongoDB are running offline.
