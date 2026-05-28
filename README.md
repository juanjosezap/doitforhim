# Do It For Him

A web page inspired by the famous Simpsons scene where Homer covers his workplace motivational poster with photos of Maggie. Drop your own photos and videos into the `media/` folder and they rotate across the poster every 3 minutes.

## Usage

1. Clone the repo
2. Add your photos and videos to the `media/` folder (jpg, png, gif, webp, mp4, webm, mov)
3. Replace `public/poster.png` with your own poster template if you want

## Run with Docker

```bash
docker compose up --build -d
```

Then open [http://localhost:3000](http://localhost:3000).

## Run with Node.js

```bash
npm install
npm start
```

## Frame positioning

If your poster template has different photo slot positions, open `public/app.js`, set `EDIT_MODE = true`, reload the page, and drag the red frames into place. The updated coordinates are logged to the browser console — paste them back into the `FRAMES` array and set `EDIT_MODE = false`.
