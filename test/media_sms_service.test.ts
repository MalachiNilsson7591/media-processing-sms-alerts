import assert from "node:assert/strict";
import { buildAlert } from "../src/media_sms_service.js";

const ready = buildAlert({ creatorPhone: "+15551234567", assetId: "asset-1", jobId: "job-1", state: "processed", detail: "rendition stored" });
assert.equal(ready.to, "+15551234567");
assert.match(ready.body, /is ready/);
const failed = buildAlert({ creatorPhone: "+15551234567", assetId: "asset-1", jobId: "job-2", state: "failed", detail: "transcode rejected" });
assert.match(failed.body, /needs attention/);
console.log("media alert decision test passed");
