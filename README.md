# UniSport Pro (ProArena)

Project scaffold generated from the supplied application structure.

Install dependencies such as React, React Router and Tailwind CSS, then connect the Base44 SDK/client and complete the UI components.

## Gemini chatbot

The backend uses Gemini 2.0 Flash for open-ended questions when `GEMINI_API_KEY` is configured. Set the key only in the server environment before starting the API:

```powershell
$env:GEMINI_API_KEY = "your-key"
npm run server
```

Without the key, the chatbot uses its local sports responses. The key must not be added to frontend files or committed to the repository.

## Tournament data sources

The Tournament Hub combines admin-entered tournaments with optional external sources. Google does not provide one universal tournament feed, so each source must be configured separately on the backend:

```powershell
$env:GOOGLE_CALENDAR_ID = "public-calendar-id"
$env:GOOGLE_CALENDAR_API_KEY = "google-api-key"
$env:GOOGLE_CUSTOM_SEARCH_API_KEY = "google-api-key"
$env:GOOGLE_CUSTOM_SEARCH_ENGINE_ID = "programmable-search-engine-id"
$env:SPORTS_PROVIDER_URL = "https://provider.example/api/tournaments"
```

Use `/admin/tournaments` to add tournaments directly. External results are cached for one minute and labeled by source. Do not place API keys in React files or commit them.
