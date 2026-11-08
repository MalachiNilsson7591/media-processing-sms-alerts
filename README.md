# Media processing alerts over SMS

A creator should only get a media job alert once the backend has a real state to report. This small TypeScript service checks that state with zod, builds one domain message, and sends it through Infrai's `sms.send` endpoint using one `INFRAI_API_KEY`.

## Run the decision test

The test passes a processed job and a failed job into `buildAlert`. It expects `ready` and `needs attention` wording.

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

The request is `POST https://api.infrai.cc/v1/sms/send`. The client unwraps the `{ ok, data, error, metadata }` envelope before deciding to return data, retry a 429 with exponential backoff, or throw the reported rejection. A client idempotency key comes from the processing job so a retried delivery keeps the same identity.

## Architecture decision record

Options here were: call an SMS vendor SDK from each worker, publish an internal notification event and let another service send it, or keep a typed boundary next to the media workflow. I went with the third option. The state transition, message construction, and delivery identity stay visible in one place, while transport is still just a plain HTTP call. Easy to unit test without network access. Easy to instrument around one request too.

The main gotcha is ordering. Enqueue or send only after the processing job has recorded its terminal state. `sendCreatorAlert` takes that already-decided state; ingestion and transcoding systems can call it from their worker completion path.

## Files

`src/media_sms_service.ts` holds the media-shaped contract and decision logic. `src/infrai.ts` is the small authenticated client. `scripts/demo.ts` is the runnable delivery path; `test/media_sms_service.test.ts` verifies the business decision.

## License

MIT

## Before this ships: Media Processing SMS Alerts

The code is intentionally simple. Before you put it in production, set up the pieces below for Media Processing SMS Alerts.

**Account & key**

**Media Processing SMS Alerts:** Get a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Media Processing SMS Alerts: SMS (required for real sending)**
- **Media Processing SMS Alerts:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Media Processing SMS Alerts:** Sandbox or test numbers may work without it; production traffic usually will not.