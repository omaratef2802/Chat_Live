const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/modules/dbUsers");
const OTP = require("../src/modules/dbOTP");
const Device = require("../src/modules/dbLinkedDevice");
const Conversation = require("../src/modules/dbConversation");
const Message = require("../src/modules/dbMessages");
const Story = require("../src/modules/dbStory");

test("user schema requires unique email, phone and username and hides password", () => {
  for (const field of ["email","phone","username"]) assert.equal(User.schema.path(field).options.unique,true);
  assert.equal(User.schema.path("password").options.select,false);
  assert.equal(User.schema.path("isEmailVerified").defaultValue,false);
});
test("OTP schema has a TTL index and bounded attempts", () => {
  assert.ok(OTP.schema.indexes().some(([keys,options])=>keys.expiresAt===1&&options.expireAfterSeconds===0));
  assert.equal(OTP.schema.path("attempts").options.max,5);
});
test("linked device schema supports pending pairing and token rotation", () => {
  for (const field of ["pairingTokenHash","pairingExpiresAt","refreshTokenHash","encryptedRefreshToken"]) assert.ok(Device.schema.path(field));
});
test("private conversation validation requires directKey", async () => {
  const doc = new Conversation({type:"private",createdBy:"507f1f77bcf86cd799439011"});
  await assert.rejects(doc.validate());
});
test("group conversation validation requires a name", async () => {
  const doc = new Conversation({type:"group",createdBy:"507f1f77bcf86cd799439011"});
  await assert.rejects(doc.validate());
});
test("message types and story expiration defaults are configured", () => {
  assert.deepEqual(Message.schema.path("type").enumValues,["text","image","video","audio","file"]);
  const story = new Story({userId:"507f1f77bcf86cd799439011"});
  assert.ok(story.expiresAt instanceof Date);
});
