import { z } from "zod";
import { infrai } from "./infrai.js";

export const alertRequest = z.object({
  creatorPhone: z.string().min(7),
  assetId: z.string().min(1),
  jobId: z.string().min(1),
  state: z.enum(["processed", "failed"]),
  detail: z.string().min(1)
});
export type AlertRequest = z.infer<typeof alertRequest>;

export function buildAlert(input: AlertRequest) {
  const parsed = alertRequest.parse(input);
  const prefix = parsed.state === "processed" ? "ready" : "needs attention";
  return { to: parsed.creatorPhone, body: `Media ${parsed.assetId} processing job ${parsed.jobId} is ${prefix}: ${parsed.detail}` };
}

export async function sendCreatorAlert(input: AlertRequest) {
  const body = buildAlert(input);
  return infrai.sms.send(body, `media-job:${input.jobId}`);
}
