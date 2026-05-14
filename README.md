# Adventure Time Inspired 3D Web App

An interactive Web 3D university project inspired by *Adventure Time* and the Land of Ooo. The website combines HTML, CSS, JavaScript, Bootstrap, Three.js, Blender-exported `.glb` models, sound effects, lighting controls, and custom animation triggers.

## Project Overview

The app is structured around three themed locations:

- **Treehouse** — BMO interactive model page
- **Candy Kingdom** — Peppermint Butler spell animation page
- **Mount Cragdor** — Enchiridion model and gem glow animation page

The homepage acts as a stylised Land of Ooo map with animated scroll elements and clickable location images.

## Features

- Interactive Three.js model loading
- Blender-exported `.glb` models and animations
- JavaScript-triggered animation playback
- Bootstrap navigation, menus, layout, and footers
- dat.GUI lighting controls
- Wireframe toggle
- Camera controls
- Sound effects triggered by user interaction
- BMO angry face material colour change
- Peppermint Butler purple smoke effect
- Enchiridion sequential gem emission effect
- JSON-powered About page content
- Accessibility features including reduced motion, high contrast, and mute audio
- Responsive layout using Bootstrap and custom CSS

## File Structure

```text
AdventureTimewebsite/
│
├── index.html
├── treehouse.html
├── candykingdom.html
├── mountcragdor.html
├── about.html
├── style.css
├── script.js
│
├── assets/
│   ├── BGs/
│   ├── data/
│   ├── images/
│   ├── models/
│   └── sounds/
