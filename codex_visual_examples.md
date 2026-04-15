# Codex Visual Examples (Wireframes + UI Placement)

These are “shape previews” so you can sanity-check layout before/after without changing the theme.

## 1) Navbar (after)

### Desktop-ish
```text
[ RSDailies ] [ More Resources ▼ ]                                   [ ☰ Views ▼ ] [ Profiles ] [ Settings ] [ Compact ] [ Import/Export ]
```

### Views menu (floating panel)
```text
☰ Views
-------------------------
Overview
All (active)
Custom Tasks
Farming
Dailies
Gathering
Weeklies
Monthlies
-------------------------
```

## 2) Overview panel (after removing Overview/All buttons)

### Overview mode
```text
+--------------------------------------------------------------+
| Overview                                                     |
+--------------------------------------------------------------+
| Pin rows to show them here.                                  |
+--------------------------------------------------------------+
(tables hidden in Overview mode)
```

### All mode (Overview panel + tables)
```text
+--------------------------------------------------------------+
| Overview                                                     |
+--------------------------------------------------------------+
| Task Name                           Dailies • Due in 03:12:44 |
| note text                                                   |
|--------------------------------------------------------------|
| Another Task                      Weeklies • Resets in 1d 04 |
| note text                                                   |
+--------------------------------------------------------------+
(tables visible under this)
```

## 3) Per-row pin button placement

Goal: add a pin button immediately left of the existing hide/remove button.

### Row template concept (left cell)
```text
[ Task Name Link ]                                    (hover controls)
                                       [ ☆ ] [ ⊘ ]
```

Pinned state:
```text
                                       [ ★ ] [ ⊘ ]
```

Notes remain in the right-side cell as they are now (no card UI).

## 4) Overview: Top 5 max, pinned-only, no filler

If you pin 2 items total:
```text
+--------------------------------------------------------------+
| Overview                                                     |
+--------------------------------------------------------------+
| Item A                               Dailies • Due in 00:44   |
| ...                                                          |
|--------------------------------------------------------------|
| Item B                              Weeklies • Resets in 2d   |
| ...                                                          |
+--------------------------------------------------------------+
(only 2 rows show; no filling to 5)
```

If you pin 8 items total:
```text
+--------------------------------------------------------------+
| Overview                                                     |
+--------------------------------------------------------------+
| Shows only the 5 soonest by “next action time”               |
+--------------------------------------------------------------+
```

