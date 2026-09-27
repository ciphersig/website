# Codebase Cleanup and Asset Organization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate over 580 MB of unwanted debug screenshots, duplicate videos, legacy frame dumps, test scripts, and dead code, while organizing all video transitions and WebP/AVIF assets into two dedicated, well-structured directories.

**Architecture:** 
1. Consolidate production transition videos into a clean `public/videos/` directory containing strictly the 30 active videos, removing all backup copies and external duplicates (`backup_videos/`, root `videos/`, `public/videofinal/`).
2. Consolidate all WebP and AVIF assets into a clean `public/optimized/` directory, removing non-standard/orphaned test dimensions and updating paths.
3. Remove all 100+ debug screenshots, temporary frame montage folders, unused raw full-size PNGs, scratch scripts, dead hooks, and unused demo components while keeping build stability and Next.js static asset pipelines intact.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP, Sharp.

---

### Audit Findings & Space Savings Summary

| Category | Description | Files Count | Size to Reclaim |
| :--- | :--- | :--- | :--- |
| **Duplicate Video Directories** | `backup_videos/`, root `videos/`, `public/videofinal/` | 56 files | **328.78 MB** |
| **Video Backup & Corrupt Files** | `public/videos/*.original`, `test_smooth.mp4`, `test_a2t_47.mp4` | 8 files | **7.27 MB** |
| **Video Frame Dumps & Analysis** | `cases_contact_frames/`, `contact_frames/`, `scratch/p2c_frames/` | 78+ files | **56.43 MB** |
| **Reference Code & Large Video** | `code refer/` (including 69.6 MB `sliders-5.mp4`) | 6 files | **66.45 MB** |
| **Root Debug Images & Scripts** | `debug_*.png`, `check_frame_*.jpg`, `test_blend_*.jpg`, Python scripts | 100+ files | **47.83 MB** |
| **Public Root Unused / Raw PNGs** | `about.png`, `offer.png`, `partners.png`, `team1.png`, `team2.png`, debug crops | 72 files | **58.43 MB** |
| **Scratch & Old Component Files** | `scratch/`, `files/`, root `components/`, unused stubs | 40+ files | **17.89 MB** |
| **TOTAL SPACE RECLAIMED** | | **360+ files** | **~583 MB** |

---

### Two Dedicated Production Asset Folders

#### Folder 1: Production Transition & Site Videos (`public/videos/`)
Contains strictly the **30 active videos** referenced in `VIDEO_PATHS` and `RegisterModal.tsx`:
1. `loading_showreel.mp4` (Loading screen)
2. `loading_to_homepage.mp4` (Opening transition to hero)
3. `Homepage_loop.mp4` (Hero loop)
4. `Homepage_showreel.mp4` (Hero → Showreel)
5. `Homepage_showreel_reverse.mp4` (Showreel → Hero)
6. `Homepage_aboutstart.mp4` (Hero → AboutStart)
7. `Homepage_aboutstart_reverse.mp4` (AboutStart → Hero)
8. `Homepage_cases.mp4` (Hero → Cases)
9. `Homepage_cases_reverse.mp4` (Cases → Hero)
10. `Homepage_contact.mp4` (Hero → Contact)
11. `Homepage_contact_reverse.mp4` (Contact → Hero)
12. `aboutstart_loop.mp4` (AboutStart loop)
13. `aboutstarttoabout.mp4` (AboutStart → About)
14. `aboutstarttoabout_reverse.mp4` (About → AboutStart)
15. `abouttoteam.mp4` (About → Team1)
16. `abouttoteam_reverse.mp4` (Team1 → About)
17. `teamtoteam.mp4` (Team1 → Team2)
18. `teamtoteam_reverse.mp4` (Team2 → Team1)
19. `teamtooffer.mp4` (Team2 → Offer)
20. `teamtooffer_reverse.mp4` (Offer → Team2)
21. `offertopartner.mp4` (Offer → Partner)
22. `offertopartner_reverse.mp4` (Partner → Offer)
23. `partnertoCases.mp4` (Partner → Cases)
24. `partnertoCases_reverse.mp4` (Cases → Partner)
25. `CasestoContact.mp4` (Cases → Contact)
26. `CasestoContact_reverse.mp4` (Contact → Cases)
27. `eventsbackgoound.mp4` (Cases events background)
28. `eventsbackgooundloop.mp4` (Cases events background loop)
29. `Contact_loop.mp4` (Contact loop)
30. `ticket.mp4` (Register modal ticket)

*Everything else in `public/videos/` (`*.original`, `test_smooth.mp4`) and all duplicate directories (`backup_videos/`, root `videos/`, `public/videofinal/`) will be purged.*

#### Folder 2: Production WebP & AVIF Files (`public/optimized/`)
Contains strictly the **active responsive image formats**:
- Standard widths (`640`, `960`, `1280`, `1600`, `1920`, `2560`, `2920`) for:
  - `about--{w}.avif` and `about--{w}.webp`
  - `team1--{w}.avif` and `team1--{w}.webp`
  - `team2--{w}.avif` and `team2--{w}.webp`
  - `offer--{w}.avif` and `offer--{w}.webp`
  - `partners--{w}.avif` and `partners--{w}.webp`
- General site WebP/AVIF assets:
  - `loading-bg.avif` and `loading-bg.webp`
  - `noise.webp`
*The 14 non-standard/orphaned test sizes (`--1254`, `--1261`, `--1275`, `--2936`, `--1672`) will be purged.*

---

### Task 1: Clean Up Duplicate & Redundant Video Folders

**Target:**
- Delete root `backup_videos/` directory (95.88 MB)
- Delete root `videos/` directory (126.49 MB)
- Delete `public/videofinal/` directory (106.41 MB)
- Delete root `test_a2t_47.mp4` (1.87 MB)
- Delete backup files in `public/videos/`:
  - `aboutstarttoabout.mp4.original`
  - `aboutstarttoabout_reverse.mp4.original`
  - `teamtooffer.mp4.original`
  - `teamtooffer_reverse.mp4.original`
  - `teamtoteam.mp4.original`
  - `teamtoteam_reverse.mp4.original`
  - `test_smooth.mp4`

**Verification:**
Verify that `public/videos/` contains exactly the 30 active `.mp4` files and no backups.

---

### Task 2: Clean Up Debug Frames, Scratch Files & Reference Code

**Target:**
- Delete `cases_contact_frames/` directory (21 files, 37.98 MB)
- Delete `contact_frames/` directory (25 files, 18.45 MB)
- Delete `scratch/` directory (32 files + `p2c_frames/`, 17.74 MB)
- Delete `code refer/` directory (including `sliders-5.mp4`, 66.45 MB)
- Delete `files/` directory (`SectionTransitionType1.*`, 0.15 MB)

**Verification:**
Ensure folders are cleanly removed and not referenced anywhere.

---

### Task 3: Clean Up Root Directory Debug Screenshots & Temporary Scripts

**Target:**
- Delete all 100+ debug and test images in the root directory:
  - `ambient_test_*.jpg`
  - `check_frame_*.jpg`
  - `debug_cases_*.png`
  - `debug_mon_*.png`
  - `debug_step_*.png`
  - `debug_zoom_*.png`
  - `crop_*.png`, `contact_*.png`, `corner_*.png`
  - `orig_*.jpg`, `orig_*.png`
  - `refined_test_*.jpg`, `test_blend_*.jpg`, `warped_raw_*.jpg`, `vid47_frame_*.jpg`
  - `temp_frame_*.jpg`, `pano_win*.jpg`, `screen_crop_*.png`
- Delete root Python scripts:
  - `build_partnertocases.py`
  - `process_videos.py`

**Verification:**
The root directory will only contain project config files (`package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, etc.) and official project folders (`app/`, `public/`, `scripts/`).

---

### Task 4: Clean Up Unused Images in `public/` and Organize WebP/AVIF Folder

**Target:**
- Delete the 5 unused raw uncompressed PNGs in `public/` (38.2 MB):
  - `about.png` (4.81 MB)
  - `offer.png` (15.64 MB)
  - `partners.png` (9.65 MB)
  - `team1.png` (4.22 MB)
  - `team2.png` (4.01 MB)
- Delete unused debug crops, preview images, and default SVG templates in `public/`:
  - `5122129d-eb2e-408d-9742-a34cc936e936.png`
  - `574efe0f-1ed4-4947-b0c3-cb1ba5fe8110.png`
  - `abouttoteam_last.jpg`, `abouttoteam_paper.jpg`, `abouttoteam_paper_norm.jpg`, `about_last_frame.jpg`, `about_preview.jpg`, `ab_center.jpg`
  - `cipher_transition_screen.png`, `corner_*.jpg`, `f24_screen_only.png`, `f70_faces.jpg`, `f70_orig.jpg`
  - `inspect_orig_*.jpg`, `last_frame_showreel.jpg`, `logo-animation.gif`
  - `offer_col*.jpg`, `offer_corner_*.jpg`, `offer_paper_crop.jpg`, `offer_row*.jpg`, `offer_sticky_right.jpg`
  - `prev_a2t_*.jpg`, `screen_crop.jpg`, `t1_center.jpg`, `t1_faces.jpg`
  - `team1_1920_center.jpg`, `team1_norm.jpg`, `team1_paper_*.jpg`, `team1_preview.jpg`, `team1_wall_crop.jpg`
  - `temp_f24_debug.png`, `temp_mag_debug.png`, `temp_view.jpg`, `temp_view_f0.jpg`
  - `test_blend_*.jpg`, `test_rect_*.png`, `test_scale_*.jpg`
  - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- Delete `public/team/cyber_word_search.html` (misplaced test HTML file)
- In `public/optimized/`, delete the 14 non-standard orphaned test files:
  - `about--1254.avif`, `about--1254.webp`
  - `about--1261.avif`, `about--1261.webp`
  - `about--1275.avif`, `about--1275.webp`
  - `about--2936.avif`, `about--2936.webp`
  - `offer--1672.avif`, `offer--1672.webp`
  - `team1--1254.avif`, `team1--1254.webp`
  - `team2--1254.avif`, `team2--1254.webp`

**Preserved in `public/`:**
- `public/optimized/` (contains all 70 responsive WebP and AVIF files)
- `public/audios/` (`Forward.wav`, `Backward.wav`, `Jesse Gillis - Time to Meditate...`)
- `public/fonts/` (custom project fonts)
- `public/uploads/` (CMS/admin upload fallbacks)
- `public/team/` (active team portrait photos)
- `public/loading-bg.jpg`, `public/loading-bg.webp`, `public/loading-bg.avif`, `public/noise.webp`
- Core UI vectors & overlays: `Cases_png_transparent.png`, `Showreel_png_transparent.png`, `cases-bg.png`, `showreel_bg.png`, `events-video-frame.jpg`, `certificate-template.png`, `5Z8KeWup2u.lottie`, `favicon.png`, `back-arrow.svg`, `sound.svg`, `linkedin.svg`, `instagram.svg`, `whatsapp.svg`

---

### Task 5: Clean Up Unused Code, Dead Stubs & Preloader 404s

**Target:**
- Delete root `components/` directory:
  - `components/signup-form-demo.tsx`
  - `components/wobble-card-demo.tsx`
  - `components/ui/input.tsx`
  - `components/ui/label.tsx`
  - `components/ui/radial-glow-button.tsx`
  - `components/ui/wobble-card.tsx`
- Delete unused stub files:
  - `lib/utils.ts` (unreferenced)
  - `lib/` directory
  - `app/utils/videoLoop.ts` (0-byte empty file)
  - `app/hooks/useTransitionManager.ts` (0-byte empty file)
  - `app/hooks/useContactVisibility.ts` (0-byte empty file)
- Fix ghost 404 preload image URLs in `app/constants/homePreloadImages.ts`:
  - Remove non-existent `/cases/5f74027c...png` paths that produce background 404 network errors.
- In `tsconfig.json`:
  - Clean up exclusions if `code refer` is removed.

---

### Task 6: Build & Runtime Verification

**Step 1:** Run `npx tsc --noEmit` to verify 0 TypeScript errors.
**Step 2:** Run `npm run build` to verify Next.js builds successfully.
**Step 3:** Check dev server routes (`http://localhost:3000`) to confirm all 30 video transitions and WebP/AVIF section images load seamlessly without missing assets.
