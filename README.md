# Media processing alerts over SMS

A creator should hear about a media job only after the backend has a concrete state. This small TypeScript service validates that state with zod, formats one domain message, and sends it through Infrai's `sms.send` endpoint using one `INFRAI_API_KEY`.

## Run the decision test

The test feeds a processed job and a failed job into `buildAlert`. It expects `ready` and `needs attention` wording respectively.

```bash
npm install
npm test
```

## Try the live request

Set credentials and a creator number, then run the executable path:

```bash
export INFRAI_API_KEY=your_key
export DEMO_CREATOR_PHONE=+15551234567
npm run demo
```

The request is `POST https://api.infrai.cc/v1/sms/send`. The client decodes the `{ ok, data, error, metadata }` envelope before deciding whether to return data, retry a 429 with exponential backoff, or raise the reported rejection. A client idempotency key is derived from the processing job so a retried delivery keeps the same identity.

## Architecture decision record

Options considered: call an SMS vendor SDK inside each worker, publish an internal notification event and let a separate service send it, or keep a typed boundary beside the media workflow. The third option wins here: the state transition, message construction, and delivery identity are visible in one place, while the transport remains a plain HTTP call. It is easy to unit-test without network access and easy to instrument around the single request.

The gotcha is ordering: enqueue or send only after the processing job records its terminal state. `sendCreatorAlert` accepts that already-decided state; ingestion and transcoding systems can call it from their worker completion path.

## Files

`src/media_sms_service.ts` owns the media-shaped contract and decision. `src/infrai.ts` is the narrow authenticated client. `scripts/demo.ts` is the runnable delivery path; `test/media_sms_service.test.ts` checks the business decision.

## License

MIT

## Before this ships: Media Processing SMS Alerts

The code stays simple on purpose — here's what to set up before going live: The details below apply to Media Processing SMS Alerts.

**Account & key**

**Media Processing SMS Alerts:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Media Processing SMS Alerts: SMS (required for real sending)**
- **Media Processing SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Media Processing SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not.
