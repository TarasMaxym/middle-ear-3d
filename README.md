# Middle Ear 3D Room Diorama

Interactive 3D anatomical diorama of the **Middle Ear (Tympanic Cavity & Epitympanic Recess)** modeled as a 6-walled architectural room (aligned with USMLE Step 1 & Dr. G. Bhanu Prakash's 6-walled box model), sculpted with **61 granular, specimen-accurate 3D sub-regions** (individual ossicle parts, processes, joints & ligaments; separated muscle bellies vs. tendons; Tympanic Membrane zones; wall micro-landmarks; cranial nerve branches; and separated inner/outer ear organs) using **Minecraft Creative Mode** flight controls.

---

## Quick Launch (Local Mac)

Double-click **`Launch Middle Ear 3D.command`** in Finder, or run from Terminal:

```bash
./start.sh
```

Then open http://127.0.0.1:8765 in your browser (press `Cmd + Shift + R` to hard-refresh after updates).

---

## Four Learning & Testing Modes (`Tab` to cycle)

1. **Explore & Memorize**: Free-fly through the 6-walled room and surrounding anatomy, inspect all **61 structures & sub-parts** with parent-component badges and USMLE clinical pearls, toggle X-Ray walls (`X`), swing open the eardrum door (`G`), and watch live sound conduction & acoustic reflex biomechanics (`P`).
2. **Guided Lesson (7 Chapters, 19 Steps)**: Structured 3D tour with automatic camera choreography, X-Ray/cutaway transitions, live wave demonstrations, high-yield memory hooks, and **6 hands-on 3D Active-Recall Checkpoints**. You can still fly freely with `WASD` at any point during a lesson step (`F` to re-center).
3. **Fly & Pick Quiz**: Spatial localization quiz where a structure or USMLE clue is prompted and you fly through the 3D scene to aim and click it (`H` for hint, `B` for 3D beacon).
4. **Type-It Quiz (Hard) — Free-Recall Spotlight Mode**:
   - Spotlights a mystery 3D structure or specific sub-part (pulsing magenta-violet mesh + 3D reticle) while hiding all labels and hover names.
   - **Smart Anatomical Fuzzy Matching**: Handles minor spelling typos, flexible word order (`"malleus neck"` = `"neck of malleus"`), English/Latin/eponym synonyms (`"handle of hammer"` = `"manubrium"`, `"Shrapnell's membrane"` = `"pars flaccida"`, `"CN 8"` = `"vestibulocochlear nerve"`), and strict directional/part guards (`anterior` vs `posterior`, `short` vs `long`, `oval` vs `round`, `tendon` vs `belly`).
   - **Specificity Coaching**: If a specific sub-part (e.g., *Neck of Malleus* or *Tendon of Stapedius*) is highlighted and you type only `"Malleus"` or `"Stapedius"`, it coaches you to name the specific part without penalizing your score or breaking your streak.
   - **Seamless Fly + Type Workflow**: Click the 3D scene anytime to fly around the glowing target with `WASD + Mouse`, then press `Enter` or `/` to jump straight back to the answer box! Includes progressive 2-stage hints (`H`: USMLE clue &rarr; first-letter pattern), a **Review Missed** deck, and an optional **Multiple Choice (4 Options)** toggle.

---

## Sharing Across Devices & Hosting Online

Because this app has **zero external server requirements** (pure static HTML/CSS/ES modules + procedural textures), you have **3 effortless ways** to share it or host it online:

### Option A: Permanent Online URL + Easy 1-Command Updates (GitHub Pages — Recommended)
Best when you want a permanent link for phones, tablets, and friends **that updates anytime we edit your local files**:

1. Create a free public repository on https://github.com/new (e.g., named `middle-ear-3d`, leave *"Add a README"* unchecked).
2. Link this folder once in Terminal:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/middle-ear-3d.git
   ./publish.sh
   ```
3. On GitHub, go to **Settings &rarr; Pages**, set **Source** to **Deploy from a branch**, and select **`main`** / **`/ (root)`**.
4. Your live app will be hosted at `https://<YOUR-USERNAME>.github.io/middle-ear-3d/`. Whenever we make future edits locally, just run `./publish.sh` to push updates live in ~20 seconds!

### Option B: Single Self-Contained Offline File or 5-Second Drag-and-Drop Web Link
Run `python3 bundle_standalone.py` (already pre-built for you!) to generate:
- **`dist/Middle-Ear-3D-Standalone.html`** — The entire 3D program packed into **one standalone HTML file** (~790 KB).
  - **Send directly to friends** via AirDrop, iMessage, Discord, Slack, or Email — they just double-click the `.html` file in any browser (even completely offline!).
  - **Instant Web Link (No Git needed)**: Drag the **`dist`** folder straight onto https://app.netlify.com/drop for an instant shareable HTTPS link in 5 seconds.

### Option C: Instant Home Wi-Fi Access (Phone / iPad / Friend's Laptop)
Double-click **`Share on Local Wi-Fi.command`** (or run `./start.sh --lan`). It prints your Mac's `http://<LAN-IP>:8765` address so any device on the same Wi-Fi network can open it immediately (touch-drag to look + 2-finger pinch to fly on mobile/iPad).

---

## Controls & Hotkeys

- **Click 3D Scene**: Lock mouse for 360° Minecraft Creative Flight (`Esc` to unlock cursor)
- **`W` `A` `S` `D`**: Fly horizontally &middot; **`Space` / `Shift`**: Fly Up / Down &middot; **`2×W` / `Ctrl`**: Sprint &middot; **`Scroll`**: Adjust speed
- **`Tab`**: Cycle modes (`Explore` &rarr; `Guided Lesson` &rarr; `Fly & Pick Quiz` &rarr; `Type-It Quiz (Hard)`)
- **`Enter` or `/`** *(in Type-It Quiz)*: Exit flight and focus the answer box (press `Enter` again after answering to load the next structure)
- **`R`**: Right vs. Left Ear &middot; **`C`**: Color-Coded Box vs. Bone/Tissue Palette &middot; **`X`**: X-Ray Walls (`Solid` / `38%` / `14%`)
- **`G`**: Open/Close Lateral Eardrum Door &middot; **`O`**: Ossicles (`Full` / `Ghosted` / `Hidden`) &middot; **`L`**: Cycle Labels (`Key` / `Major` / `All 61` / `Walls` / `Off`)
- **`P`**: Sound Wave & Acoustic Reflex Simulation &middot; **`V`**: Noclip (fly through solid walls) &middot; **`M`**: Toggle Study Directory & Wall Cutaways
- **`1`–`7`**: Camera Viewpoint Presets &middot; **`F`**: Re-center Lesson / Recall Target &middot; **`H`**: Hint / First-Letter Clue &middot; **`N`**: Next Question
