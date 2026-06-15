# Property Map Template

A reusable Next.js template for visualizing a property portfolio on an interactive map. Color-coded markers summarize property status at a glance.

The repository ships with fictional sample records only. It is not affiliated with or configured for any property management company.

| Color | Default meaning |
|-------|-----------------|
| Green | Vacancy available now |
| Yellow | Upcoming availability |
| Red | Fully occupied |

## Features

- Interactive Leaflet map with automatic bounds
- Status counts and color-coded markers
- Property popups with unit totals
- Static JSON data source that can be replaced by an API or database
- Optional Nominatim geocoding script
- Docker configuration for self-hosting

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Provide Your Own Data

The demo reads `public/data/properties.json`. Replace the fictional records with data matching the interfaces in `src/types/property.ts`.

Anything under `public/` is downloadable by visitors. Do not commit or deploy confidential addresses, tenant information, credentials, internal identifiers, or operational data unless the application is appropriately protected and disclosure is intentional.

For geocoding, create `data/properties.input.json` as either a property array or an object containing a `properties` array. This file is ignored by Git:

```json
[
  {
    "id": 1,
    "code": "sample-1",
    "name": "Sample Property",
    "address": "Your address",
    "city": "Your city",
    "state": "Your state",
    "zip": "Your postal code",
    "total_units": 12,
    "occupied_units": 10,
    "vacant_units": 1,
    "notice_units": 1,
    "status": "green"
  }
]
```

Then run:

```bash
NOMINATIM_CONTACT="you@example.com" python scripts/geocode.py
```

The script writes geocoded records to `public/data/properties.json`. Review the output before committing or deploying it.

## Docker

```bash
docker compose up -d --build
```

The app is exposed on `http://localhost:3001`.

## Customize

- Change status labels and colors in `src/components/PropertyMap.tsx`.
- Replace the static JSON fetch with your API or database.
- Put non-public deployments behind an access-control layer.

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Leaflet and OpenStreetMap
