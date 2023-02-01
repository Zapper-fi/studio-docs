---
sidebar_position: 2
---

# Getting an API Key & Testing The Endpoints

The Zapper API uses [API keys](https://swagger.io/docs/specification/authentication/api-keys/) to authenticate requests.

We authenticate your private API key using **HTTP authorization request headers**. To learn more about how authorization headers work, check out [this documentation on the topic from Mozilla foundation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#basic_authentication).

## Requesting a private key

You will need a private API key to use the Zapper API. To request an API key, please file a [ZenDesk ticket](https://zapperfi.zendesk.com/hc/en-us/requests/new). You will be issued a private API key in 24-48 hours.

These private API keys still have a rate limit of 30 requests per minute (RPM) on the `v2/balances`
endpoints and 1,000RPM on ALL endpoints collectively.

If these rate limits are not sufficient, we allow for higher RPMs on paid plans

### Testing endpoints using the API key on Swagger

You can test the available endpoints on Swagger by entering your API key **into the Authorize section in Swagger**. This will then allow you
to see the responses for various endpoints based on parameters you specify.

![Enter API key into the authorize section](../../static/img/assets/swagger-auth.png)

:::info
For any API related inquiries, please reach out in the
[#api-buildooorrs channel](https://discord.com/channels/647279669388771329/650654989202489354)
in the [Zapper Discord](https://zapper.xyz/discord).
:::
