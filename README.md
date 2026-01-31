# Fastener Generator

Web-based tool for generating 3D-printable bolts, nuts, and washers. Generate STL files ready for your 3D printer.

**Live Demo:** https://fasteners.rudythecanadian.cloud

![Fastener Generator](https://img.shields.io/badge/3D%20Printing-Ready-brightgreen) ![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%203.0-blue)

## Features

- **Metric Sizes:** M3, M4, M5, M6, M8, M10, M12, M14, M16, M20
- **ANSI/Imperial Sizes:** #4-40 through 3/4-10
- **Head Types:** Hex, Socket Cap, Button Head, Countersunk
- **Components:** Bolts, Nuts (standard & wing), Washers
- **Smart Units:** ANSI mode displays inches, automatically converts to mm for STL
- **Library Caching:** Previously generated files available for instant download

## Requirements

- Node.js 18+
- OpenSCAD

## Installation

```bash
# Clone the repository
git clone https://github.com/rudythecanadian/Nuts_and_Bolts.git
cd Nuts_and_Bolts/webapp

# Install dependencies
npm install

# Start the server
npm start
```

The app will be available at http://localhost:3001

### OpenSCAD Installation

**macOS:**
```bash
brew install --cask openscad
```

**Ubuntu/Debian:**
```bash
sudo apt install openscad
```

**Windows:**
Download from https://openscad.org/downloads.html

## Usage

1. Select **Metric** or **ANSI** standard
2. Choose bolt size and thread length
3. Select head type (hex, socket, button, countersunk)
4. Set quantities for bolts, washers, and nuts
5. Click **Generate STL Files**
6. Download and print!

## Print Settings

Recommended settings for FDM printing:

| Setting | Value |
|---------|-------|
| Layer Height | 0.15-0.2mm |
| Infill | 50-100% |
| Speed | 40-50mm/s |
| Supports | Not needed |

## Project Structure

```
Nuts_and_Bolts/
├── webapp/
│   ├── server.js        # Express server & OpenSCAD integration
│   ├── public/
│   │   └── index.html   # Web interface
│   ├── output/          # Generated STL files (temporary)
│   └── library/         # Cached STL files
└── NUT JOB .../
    └── files/
        └── Nut_Job.scad # OpenSCAD parametric model
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sizes` | GET | Get available bolt sizes |
| `/api/generate` | POST | Generate STL files |
| `/api/library` | GET | List cached library files |

## Credits

Based on [Nut Job](https://www.thingiverse.com/thing:193647) by Mike Thompson - a parametric OpenSCAD library for generating threaded fasteners.

## License

- **Web Application:** MIT License
- **OpenSCAD Model (Nut_Job.scad):** [CC BY-NC-SA 3.0 AU](http://creativecommons.org/licenses/by-nc-sa/3.0/au/)

---

Made with OpenSCAD and Node.js
