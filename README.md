# Saphire-API

## Credits by Developers

- Rody#1000 - 451619591320371213 - Reviewer and Refatoring
- NewLayer#0333 - 732954224090021920 - Login System, Routers Designer and Database Login Documents
- Gorniaky#2023 - 395669252121821227 - Initing and Maintenence

# Routes and Methods
> Base URL: `https://ways.discloud.app`
### **GET - `/commands`**
> Return an object array containing all Saphire Bot's Commands with name, category and description.

> @returns _[{}] Object Array_

```json
[
  {
    "name": "admin",
    "category": "admin",
    "description": "[admin] Comandos administrativos"
  },
  {
    "name": "invite",
    "category": "bot",
    "description": "[bot] Um link rápido para me colocar no seu servidor"
  }
]
```
_The key called "authorization" in **headers** is required_

### **GET - `/phrases`**
>  Return a random phrase to show at site's home page.

> @returns String
```json
"O brilho de uma lua"
```
_The key called "authorization" in **headers** is required_

### **POST - `/sender`**
>  Send a webhook message request to Discord API by URL

> @returns "OK" - String | Status 200 "OK"
```json
{
  "status": 200,
  "message": "OK"
}
```
_The key called "authorization" in **headers** is required_

_Body Constructor: webhookUrl: string, content: string, embeds: DiscordApiEmbed array, avatarURL: string, files: DiscordApiFiles, username: string_
```js
async function sendWebhook() {
    return await axios.post(
        "https://ways.discloud.app/sender",
        {
            webhookUrl,
            ...BodyConstructorShowAbove
        },
        {
            headers: {
                authorization: process.env.WEBHOOK_SENDER_AUTHORIZATION
            }
        }
    )
}
```
