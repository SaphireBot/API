# Saphire-API

## Credits by Developers

- Rody#1000 - 451619591320371213 - Reviewer and Refatoring
- NewLayer#0333 - 732954224090021920 - Login System, Routers Designer and Database Login Documents
- Gorniaky#2023 - 395669252121821227 - Initing and Maintenence

> Base URL: `https://ways.discloud.app`

# Routes and Methods
GET - `/commands`

> returns an object array containing all Saphire Bot's Commands with name, category and description

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
*A field at header with name "authorization" is required*
