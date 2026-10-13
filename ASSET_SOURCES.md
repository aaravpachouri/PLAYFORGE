# PLAYFORGE image sources and attribution notes

## Original realm/world artwork

- `public/playforge-world.png` — from the supplied PLAYFORGE UI concept bundle (`assets/playforge-world.png`); used as the world motif and the restored Habit Lab backdrop.
- `public/playforge-world.svg` — pre-existing project asset.

## Restored original photography

The Training Arena and Nutrition Station hero images have been restored to the Unsplash URLs used in the earlier React version, before the custom realm artwork was introduced. Individual exercise and meal thumbnails also use Unsplash-hosted URLs.

- Workout / active lifestyle: `photo-1518611012118-696072aa579a`, `photo-1534438327276-14e5300c3a48`, `photo-1552674605-db6ffd4facb5`, `photo-1583454110551-21f2fa2afe61`.
- Food / balanced meal inspiration: `photo-1490645935967-10de6ba17061`, `photo-1512058564366-18510be2db19`, `photo-1512621776951-a57141f2eefd`, `photo-1546069901-ba9599a7e63c`.
- Source discovery: [exercise & gym](https://unsplash.com/s/photos/exercise-gym), [dumbbell workouts](https://unsplash.com/s/photos/dumbbell-workout), [healthy bowls](https://unsplash.com/s/photos/healthy-bowl), [Indian food](https://unsplash.com/s/photos/indian-food), [healthy breakfast](https://unsplash.com/s/photos/healthy-breakfast).
- License information: [Unsplash License](https://unsplash.com/license).

These pictures are visual references only and may not depict the exact exercise or ingredients described. They require internet access; if any host URL stops working, replace it with an appropriately licensed image. Recheck each asset's availability and licence before a commercial launch.
## Meal-specific photography added in PLAYFORGE 2.8

- The application now asks the server to search Wikimedia Commons for a photograph matching each selected AI-generated meal and each offered alternative. When a matching usable file is returned, the image links to the Commons file description page; the creator and reported licence are displayed with the source link. Check the linked file page for full attribution terms.
- If no suitable Commons photograph is found or the upstream lookup is unavailable, the app displays a labelled Unsplash food-inspiration photograph and links to an Unsplash search for the dish. A fallback is explicitly labelled as inspiration, not as a photo of the exact dish.
- Photo lookup results are cached server-side for 12 hours. The server only accepts image thumbnails hosted on `upload.wikimedia.org`.
- Wikimedia Commons content may be reused subject to each file's licence and other applicable terms. See [Wikimedia Commons reuse guide](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) and [Unsplash License](https://unsplash.com/license).
