import { sendCreatorAlert } from "../src/media_sms_service.js";

const phone = process.env.DEMO_CREATOR_PHONE;
if (!phone) throw new Error("DEMO_CREATOR_PHONE is required");
const result = await sendCreatorAlert({ creatorPhone: phone, assetId: "asset-204", jobId: "job-881", state: "processed", detail: "1080p rendition stored" });
console.log("creator alert accepted", result);
