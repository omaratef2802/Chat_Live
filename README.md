# Chat Live — Backend Reference

> This document describes the backend as it exists on the `refrence-chatpgt` branch, separates implemented database foundations from planned application features, and records the intended environment configuration. It is a project reference, not a claim that every feature is already implemented.

## 1. Project overview

Chat Live is a real-time messaging web application inspired by WhatsApp Web.

- **Frontend:** Angular
- **Backend:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **Real-time layer:** Socket.IO is part of the planned architecture; it is not currently listed in `backend/package.json` and must be added when the real-time layer is implemented.
- **Current backend module style:** CommonJS (`require` / `module.exports`).

The product scope includes private conversations, groups, messages, media, contacts, stories, notifications, privacy settings, and linked devices. AI features are intentionally out of scope.

## 2. Repository and backend structure

Current backend paths:

```text
backend/
├── .gitignore
├── .env.example          # Safe environment-variable template
├── README.md             # This reference
├── package.json
├── package-lock.json
├── server.js             # Loads dotenv, connects MongoDB, starts Express
└── src/
    ├── app.js             # Express app setup (currently a minimal scaffold)
    ├── config/
    │   └── connectDb.js   # Mongoose connection
    └── modules/           # Mongoose models
        ├── dbUsers.js
        ├── dbOTP.js
        ├── dbLinkedDevice.js
        ├── dbContact.js
        ├── dbBlock.js
        ├── dbConversation.js
        ├── dbConversationMember.js
        ├── dbConversion.js
        ├── dbMessages.js
        ├── dbStory.js
        ├── dbStoryView.js
        └── dbNotification.js
```

The current codebase is at the database-foundation stage. Controllers, services, API routes, authentication middleware, upload handling, Socket.IO event handlers, and complete request validation still need to be implemented and tested. Keep the existing file paths stable until imports are migrated deliberately.

## 3. Technology and packages

Dependencies currently declared in `backend/package.json`:

| Package | Purpose |
| --- | --- |
| `express` | HTTP server and API routing |
| `mongoose` | MongoDB object modeling |
| `dotenv` | Load environment variables |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT authentication tokens |
| `nodemailer` | Email delivery, including OTP messages |
| `multer` | Multipart file upload parsing |
| `cloudinary` | Media storage integration |
| `nodemon` | Development server restart |

The project uses CommonJS. Socket.IO, a validation library, security/rate-limit middleware, and automated test tooling are not currently declared as dependencies; add only what is needed when implementing those layers.

## 4. Database models and responsibilities

All models currently live in `backend/src/modules/`.

| Model file | Responsibility |
| --- | --- |
| `dbUsers.js` | Account identity, credentials, profile, online state, and privacy preferences |
| `dbOTP.js` | Hashed one-time codes for email verification and password reset |
| `dbLinkedDevice.js` | Devices linked to an account, device metadata, hashed refresh-token storage, and revocation state |
| `dbContact.js` | A user's contacts, optional nickname, and favorite state |
| `dbBlock.js` | Directional user blocking relationship |
| `dbConversation.js` | Private or group conversation metadata and last activity |
| `dbConversationMember.js` | Conversation membership, role, mute state, join/leave state, and per-user read position |
| `dbConversion.js` | Compatibility alias that re-exports `dbConversation.js`; retain until old imports are migrated |
| `dbMessages.js` | Text/media messages, replies, forwards, edits, deletion metadata, reactions, and private-message status |
| `dbStory.js` | Text/image/video stories, audience settings, and expiration |
| `dbStoryView.js` | Unique story-view record per story and viewer |
| `dbNotification.js` | User notifications and their related resource metadata |

### Important model notes

- User registration requires first name, last name, email, phone number, password, and a unique username.
- Email and phone are unique. Phone visibility is controlled by privacy settings; the phone is not intended to be publicly exposed by default.
- Passwords are hashed with bcrypt in the user model's save hook. Because query updates do not run save hooks, password changes must hash the new password explicitly in the service before updating.
- OTP records store a hash, not the raw code. The application must enforce expiration, attempt limits, and resend throttling; MongoDB TTL cleanup is not immediate.
- Linked-device records store a refresh-token hash, never the raw refresh token.
- Contacts and blocks are separate relationships. Blocking is directional.
- Private conversations use a deterministic unique `directKey` generated from the two sorted participant IDs. The service must enforce exactly two active members.
- The conversation model is named `conversations` but currently writes to the legacy collection name `conversions`. Mongoose references use the model name, not the collection name.
- `dbConversion.js` is a compatibility alias, not a separate conversation collection.
- A conversation-member record is unique per conversation/user pair. Rejoining should update the existing record rather than insert a duplicate.
- Group read receipts are not part of the agreed scope. The member's last-read message field is for per-user unread position, not a group read-receipt feature.
- Story lifetime defaults to 24 hours. The application must still check expiration when reading stories.
- Message status/read receipts are intended for private conversations only.

## 5. Product requirements currently agreed

### Accounts and authentication
- Register with email, phone number, password, and a unique username.
- Verify accounts using **email OTP only**. No SMS/phone OTP.
- Login using email and password.
- Hash passwords; never return password hashes from API responses.
- Forgot/reset password through email OTP.
- JWT-based authenticated API access.
- Phone number is required and unique, but users can control whether it is shown.

### Contacts and privacy
- Contacts, favorites, and blocking.
- Profile and privacy settings, including phone visibility, last-seen visibility, profile-photo visibility, and story audience.
- Blocking must be checked before allowing relevant contact/conversation actions.

### Conversations, messages, and groups
- Private one-to-one conversations and group conversations.
- Text messages and media messages (image, video, audio, and files).
- Reply, forward, edit text, delete, and reactions.
- Private conversation delivery/read status.
- Group membership and roles; group admin controls group deletion, while a member can leave.
- Do not add group read receipts.

### Stories, notifications, and linked devices
- Stories expire after 24 hours and support audience controls: everyone, contacts, or selected viewers.
- Story view tracking.
- In-app notifications for relevant activity.
- Linked devices through a QR-based linking flow; tokens must be stored as hashes and devices must be revocable.

## 6. Environment variables

Copy `.env.example` to `.env` inside the `backend/` directory and fill in your own values.

### Used by the current scaffold

| Variable | Required now? | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port; current default is `3000` |
| `MONGODB_URI` | No for local default | MongoDB connection string; current fallback is `mongodb://127.0.0.1:27017/chat_live` |

### Reserved for the planned implementation

The template also documents configuration expected when the corresponding services are implemented:

- `JWT_SECRET`, `JWT_EXPIRES_IN`: access-token signing configuration.
- `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN`: refresh-token configuration for sessions/linked devices, if implemented as separate JWTs.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: SMTP configuration for Nodemailer. For Gmail, use an app password where required; do not use your normal account password.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials for media uploads.
- `CLIENT_URL`, `CORS_ORIGIN`: frontend origin(s) for redirects and CORS when those integrations are added.
- `NODE_ENV`: runtime environment, typically `development` or `production`.

Do not commit `.env`, real credentials, JWT secrets, SMTP passwords, or Cloudinary secrets. The `.gitignore` already excludes `.env`.

## 7. Running the current backend scaffold

From the `backend/` directory:

```bash
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI if you are not using the local default
npm start
```

The current `start` script runs `nodemon server.js`. The server loads dotenv, connects to MongoDB, and then starts Express.

**Current limitation:** `src/app.js` is still a minimal scaffold and currently contains placeholder middleware. The API is not ready for normal client use yet. Do not interpret a successful database connection/server start as proof that the messaging features are implemented.

## 8. Recommended implementation order

1. Finish Express app setup, centralized error handling, and configuration validation.
2. Implement request validation and authentication (register, email OTP verification, login, forgot/reset password).
3. Implement user profile, contacts, blocking, and privacy services.
4. Implement private conversations and message CRUD/actions.
5. Implement groups and membership permissions.
6. Implement media upload integration with Multer and Cloudinary.
7. Implement Socket.IO authentication, presence, and real-time message events.
8. Implement stories, views, and notifications.
9. Implement linked-device QR flow and token revocation.
10. Add automated tests and API documentation.

Build one feature end-to-end at a time: model → validation → service → controller → route → tests. Keep authorization and ownership checks in the backend; never rely on frontend checks alone.

## 9. Security checklist

- Keep all secrets in environment variables and out of Git.
- Hash passwords and OTP codes.
- Rate-limit login, OTP send/verify, and password-reset endpoints.
- Validate and normalize all user input.
- Check conversation membership and message ownership on every protected action.
- Enforce upload type and size limits; do not trust the client-provided MIME type alone.
- Never expose password hashes, OTP hashes, refresh-token hashes, or private provider credentials in API responses/logs.
- Use HTTPS in production and configure CORS for known frontend origins.
- Revoke linked-device sessions when a device is unlinked or the account security flow requires it.

## 10. Scope discipline

Do not add AI, microservices, Redis, Kafka, GraphQL, or group read receipts at this stage. They are not required for the agreed first version. Prefer a straightforward Express + MongoDB architecture and introduce infrastructure only when a demonstrated requirement justifies it.
