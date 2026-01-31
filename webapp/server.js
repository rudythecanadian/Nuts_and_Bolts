const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const OPENSCAD_PATH = process.platform === 'darwin'
  ? '/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD'
  : '/usr/bin/openscad';
const SCAD_FILE = path.join(__dirname, '../NUT JOB _ Nut, Bolt, Washer and Threaded Rod Factory - 193647/files/Nut_Job.scad');
const OUTPUT_DIR = path.join(__dirname, 'output');
const LIBRARY_DIR = path.join(__dirname, 'library');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(LIBRARY_DIR)) {
  fs.mkdirSync(LIBRARY_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static('public'));
app.use('/output', express.static('output'));
app.use('/library', express.static('library'));

// Generate library filename (consistent naming for caching)
function getLibraryFilename(type, standard, size, length, headType, nutType) {
  const safeSize = size.replace(/\//g, '-');
  if (type === 'bolt') {
    return `bolt_${standard}_${safeSize}_${length}mm_${headType}.stl`;
  } else if (type === 'washer') {
    return `washer_${standard}_${safeSize}.stl`;
  } else if (type === 'nut') {
    return `nut_${standard}_${safeSize}_${nutType}.stl`;
  }
}

// Check if file exists in library
function getLibraryFile(type, standard, size, length, headType, nutType) {
  const filename = getLibraryFilename(type, standard, size, length, headType, nutType);
  const filepath = path.join(LIBRARY_DIR, filename);
  if (fs.existsSync(filepath)) {
    return filename;
  }
  return null;
}

// Save file to library
function saveToLibrary(sourcePath, type, standard, size, length, headType, nutType) {
  const filename = getLibraryFilename(type, standard, size, length, headType, nutType);
  const destPath = path.join(LIBRARY_DIR, filename);
  fs.copyFileSync(sourcePath, destPath);
  return filename;
}

// List library files endpoint
app.get('/api/library', (req, res) => {
  try {
    const files = fs.readdirSync(LIBRARY_DIR)
      .filter(f => f.endsWith('.stl'))
      .map(filename => {
        const stats = fs.statSync(path.join(LIBRARY_DIR, filename));
        // Parse filename to extract info
        const parts = filename.replace('.stl', '').split('_');
        const type = parts[0];
        const standard = parts[1];
        const size = parts[2];
        let length = null;
        let headType = null;
        let nutType = null;

        if (type === 'bolt') {
          length = parts[3]?.replace('mm', '');
          headType = parts[4];
        } else if (type === 'nut') {
          nutType = parts[3];
        }

        return {
          filename,
          type,
          standard,
          size,
          length,
          headType,
          nutType,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          created: stats.mtime
        };
      })
      .sort((a, b) => {
        // Sort by standard, then type, then size
        if (a.standard !== b.standard) return a.standard.localeCompare(b.standard);
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.size.localeCompare(b.size);
      });

    res.json({ files });
  } catch (error) {
    res.json({ files: [] });
  }
});

// Standard bolt sizes data
const BOLT_SIZES = {
  metric: {
    'M3': { diameter: 3, pitch: 0.5, headDiameter: 5.5, headHeight: 2, nutDiameter: 5.5, nutHeight: 2.4, washerOD: 7, washerID: 3.2, washerThickness: 0.5 },
    'M4': { diameter: 4, pitch: 0.7, headDiameter: 7, headHeight: 2.8, nutDiameter: 7, nutHeight: 3.2, washerOD: 9, washerID: 4.3, washerThickness: 0.8 },
    'M5': { diameter: 5, pitch: 0.8, headDiameter: 8, headHeight: 3.5, nutDiameter: 8, nutHeight: 4, washerOD: 10, washerID: 5.3, washerThickness: 1 },
    'M6': { diameter: 6, pitch: 1.0, headDiameter: 10, headHeight: 4, nutDiameter: 10, nutHeight: 5, washerOD: 12, washerID: 6.4, washerThickness: 1.6 },
    'M8': { diameter: 8, pitch: 1.25, headDiameter: 13, headHeight: 5.3, nutDiameter: 13, nutHeight: 6.5, washerOD: 16, washerID: 8.4, washerThickness: 1.6 },
    'M10': { diameter: 10, pitch: 1.5, headDiameter: 16, headHeight: 6.4, nutDiameter: 16, nutHeight: 8, washerOD: 20, washerID: 10.5, washerThickness: 2 },
    'M12': { diameter: 12, pitch: 1.75, headDiameter: 18, headHeight: 7.5, nutDiameter: 18, nutHeight: 10, washerOD: 24, washerID: 13, washerThickness: 2.5 },
    'M14': { diameter: 14, pitch: 2.0, headDiameter: 21, headHeight: 8.8, nutDiameter: 21, nutHeight: 11, washerOD: 28, washerID: 15, washerThickness: 2.5 },
    'M16': { diameter: 16, pitch: 2.0, headDiameter: 24, headHeight: 10, nutDiameter: 24, nutHeight: 13, washerOD: 30, washerID: 17, washerThickness: 3 },
    'M20': { diameter: 20, pitch: 2.5, headDiameter: 30, headHeight: 12.5, nutDiameter: 30, nutHeight: 16, washerOD: 37, washerID: 21, washerThickness: 3 }
  },
  ansi: {
    '#4-40': { diameter: 2.84, pitch: 0.635, headDiameter: 5.5, headHeight: 1.9, nutDiameter: 6.35, nutHeight: 2.4, washerOD: 7.9, washerID: 3.2, washerThickness: 0.8 },
    '#6-32': { diameter: 3.51, pitch: 0.794, headDiameter: 6.5, headHeight: 2.3, nutDiameter: 7.94, nutHeight: 2.8, washerOD: 9.5, washerID: 3.9, washerThickness: 0.8 },
    '#8-32': { diameter: 4.17, pitch: 0.794, headDiameter: 7.5, headHeight: 2.7, nutDiameter: 8.73, nutHeight: 3.3, washerOD: 11.1, washerID: 4.6, washerThickness: 1.2 },
    '#10-24': { diameter: 4.83, pitch: 1.058, headDiameter: 8.5, headHeight: 3.1, nutDiameter: 9.53, nutHeight: 3.8, washerOD: 12.7, washerID: 5.3, washerThickness: 1.2 },
    '#10-32': { diameter: 4.83, pitch: 0.794, headDiameter: 8.5, headHeight: 3.1, nutDiameter: 9.53, nutHeight: 3.8, washerOD: 12.7, washerID: 5.3, washerThickness: 1.2 },
    '1/4-20': { diameter: 6.35, pitch: 1.27, headDiameter: 11.1, headHeight: 4.0, nutDiameter: 11.1, nutHeight: 5.6, washerOD: 15.9, washerID: 6.9, washerThickness: 1.6 },
    '5/16-18': { diameter: 7.94, pitch: 1.41, headDiameter: 12.7, headHeight: 5.0, nutDiameter: 12.7, nutHeight: 6.9, washerOD: 17.5, washerID: 8.4, washerThickness: 1.6 },
    '3/8-16': { diameter: 9.53, pitch: 1.59, headDiameter: 14.3, headHeight: 6.0, nutDiameter: 14.3, nutHeight: 8.3, washerOD: 20.6, washerID: 10.3, washerThickness: 1.6 },
    '7/16-14': { diameter: 11.1, pitch: 1.81, headDiameter: 17.5, headHeight: 7.0, nutDiameter: 17.5, nutHeight: 9.7, washerOD: 23.8, washerID: 11.9, washerThickness: 2.0 },
    '1/2-13': { diameter: 12.7, pitch: 1.95, headDiameter: 19.1, headHeight: 8.0, nutDiameter: 19.1, nutHeight: 11.1, washerOD: 27.0, washerID: 13.5, washerThickness: 2.4 },
    '5/8-11': { diameter: 15.9, pitch: 2.31, headDiameter: 23.8, headHeight: 10.0, nutDiameter: 23.8, nutHeight: 13.9, washerOD: 34.9, washerID: 17.0, washerThickness: 3.2 },
    '3/4-10': { diameter: 19.1, pitch: 2.54, headDiameter: 28.6, headHeight: 12.0, nutDiameter: 28.6, nutHeight: 16.7, washerOD: 39.7, washerID: 20.6, washerThickness: 3.2 }
  }
};

// Get sizes endpoint
app.get('/api/sizes', (req, res) => {
  res.json(BOLT_SIZES);
});

// Generate STL endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { standard, size, length, headType, boltQty, washerQty, nutQty, nutType } = req.body;

    const sizeData = BOLT_SIZES[standard]?.[size];
    if (!sizeData) {
      return res.status(400).json({ error: 'Invalid size selected' });
    }

    const timestamp = Date.now();
    const generatedFiles = [];
    const spacing = sizeData.diameter * 3; // Space between components

    // Sanitize size for filename (replace / with - for ANSI sizes like 1/2-13)
    const safeSize = size.replace(/\//g, '-');

    // Build combined SCAD for all components
    let combinedScad = `// Auto-generated fastener assembly\n`;
    combinedScad += `// Standard: ${standard.toUpperCase()}, Size: ${size}, Length: ${length}mm\n\n`;

    // Include the original library
    combinedScad += `include <${SCAD_FILE}>\n\n`;

    let xOffset = 0;
    const components = [];

    // Add bolts
    for (let i = 0; i < boltQty; i++) {
      components.push({
        type: 'bolt',
        x: xOffset,
        params: {
          type: 'bolt',
          head_type: headType,
          head_diameter: sizeData.headDiameter,
          head_height: sizeData.headHeight,
          thread_outer_diameter: sizeData.diameter,
          thread_step: sizeData.pitch,
          thread_length: length,
          step_shape_degrees: 45,
          countersink: 2,
          resolution: 0.5
        }
      });
      xOffset += spacing;
    }

    // Add washers
    for (let i = 0; i < washerQty; i++) {
      components.push({
        type: 'washer',
        x: xOffset,
        params: {
          inner_diameter: sizeData.washerID,
          outer_diameter: sizeData.washerOD,
          thickness: sizeData.washerThickness
        }
      });
      xOffset += spacing;
    }

    // Add nuts
    for (let i = 0; i < nutQty; i++) {
      components.push({
        type: 'nut',
        x: xOffset,
        params: {
          nut_type: nutType || 'normal',
          nut_diameter: sizeData.nutDiameter,
          nut_height: sizeData.nutHeight,
          nut_thread_outer_diameter: sizeData.diameter + 0.4, // Slightly larger for fit
          nut_thread_step: sizeData.pitch,
          nut_step_shape_degrees: 45,
          nut_resolution: 0.5
        }
      });
      xOffset += spacing;
    }

    // Generate individual STL files for each component type
    const outputFiles = [];

    // Generate bolts if any
    if (boltQty > 0) {
      // Check library first
      const libFile = getLibraryFile('bolt', standard, size, length, headType, null);
      const boltFile = `bolt_${standard}_${safeSize}_${length}mm_x${boltQty}_${timestamp}.stl`;
      const boltStlFile = path.join(OUTPUT_DIR, boltFile);

      if (libFile && boltQty === 1) {
        // Use library file directly
        fs.copyFileSync(path.join(LIBRARY_DIR, libFile), boltStlFile);
        outputFiles.push({ name: boltFile, type: 'bolt', qty: boltQty, cached: true });
      } else {
        // Generate new file
        const boltScad = generateBoltScad(sizeData, length, headType, boltQty, spacing);
        const boltScadFile = path.join(OUTPUT_DIR, `bolt_${timestamp}.scad`);

        fs.writeFileSync(boltScadFile, boltScad);

        execSync(`"${OPENSCAD_PATH}" -o "${boltStlFile}" "${boltScadFile}"`, {
          timeout: 300000  // 5 minutes for large bolts
        });

        fs.unlinkSync(boltScadFile);

        // Save single bolt to library for future use
        if (boltQty === 1) {
          saveToLibrary(boltStlFile, 'bolt', standard, size, length, headType, null);
        }

        outputFiles.push({ name: boltFile, type: 'bolt', qty: boltQty, cached: false });
      }
    }

    // Generate washers if any
    if (washerQty > 0) {
      // Check library first
      const libFile = getLibraryFile('washer', standard, size, null, null, null);
      const washerFile = `washer_${standard}_${safeSize}_x${washerQty}_${timestamp}.stl`;
      const washerStlFile = path.join(OUTPUT_DIR, washerFile);

      if (libFile && washerQty === 1) {
        // Use library file directly
        fs.copyFileSync(path.join(LIBRARY_DIR, libFile), washerStlFile);
        outputFiles.push({ name: washerFile, type: 'washer', qty: washerQty, cached: true });
      } else {
        // Generate new file
        const washerScad = generateWasherScad(sizeData, washerQty, spacing);
        const washerScadFile = path.join(OUTPUT_DIR, `washer_${timestamp}.scad`);

        fs.writeFileSync(washerScadFile, washerScad);

        execSync(`"${OPENSCAD_PATH}" -o "${washerStlFile}" "${washerScadFile}"`, {
          timeout: 60000
        });

        fs.unlinkSync(washerScadFile);

        // Save single washer to library for future use
        if (washerQty === 1) {
          saveToLibrary(washerStlFile, 'washer', standard, size, null, null, null);
        }

        outputFiles.push({ name: washerFile, type: 'washer', qty: washerQty, cached: false });
      }
    }

    // Generate nuts if any
    if (nutQty > 0) {
      const actualNutType = nutType || 'normal';
      // Check library first
      const libFile = getLibraryFile('nut', standard, size, null, null, actualNutType);
      const nutFile = `nut_${standard}_${safeSize}_x${nutQty}_${timestamp}.stl`;
      const nutStlFile = path.join(OUTPUT_DIR, nutFile);

      if (libFile && nutQty === 1) {
        // Use library file directly
        fs.copyFileSync(path.join(LIBRARY_DIR, libFile), nutStlFile);
        outputFiles.push({ name: nutFile, type: 'nut', qty: nutQty, cached: true });
      } else {
        // Generate new file
        const nutScad = generateNutScad(sizeData, actualNutType, nutQty, spacing);
        const nutScadFile = path.join(OUTPUT_DIR, `nut_${timestamp}.scad`);

        fs.writeFileSync(nutScadFile, nutScad);

        execSync(`"${OPENSCAD_PATH}" -o "${nutStlFile}" "${nutScadFile}"`, {
          timeout: 180000  // 3 minutes for large nuts
        });

        fs.unlinkSync(nutScadFile);

        // Save single nut to library for future use
        if (nutQty === 1) {
          saveToLibrary(nutStlFile, 'nut', standard, size, null, null, actualNutType);
        }

        outputFiles.push({ name: nutFile, type: 'nut', qty: nutQty, cached: false });
      }
    }

    res.json({
      success: true,
      files: outputFiles,
      message: `Generated ${outputFiles.length} STL file(s)`
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate SCAD for bolts
function generateBoltScad(sizeData, length, headType, qty, spacing) {
  let scad = `// Bolt generation - units in mm\n`;
  scad += `$fn = 60;\n\n`;

  // Include the thread library inline (simplified version for bolts)
  scad += getThreadLibrary();

  for (let i = 0; i < qty; i++) {
    const x = i * spacing;
    scad += `translate([${x}, 0, 0]) {\n`;

    if (headType === 'hex') {
      scad += `  hex_screw(${sizeData.diameter}, ${sizeData.pitch}, 45, ${length}, 0.5, 2, ${sizeData.headDiameter}, ${sizeData.headHeight}, 0, 0);\n`;
    } else {
      scad += `  socket_screw_gen(${sizeData.diameter}, ${sizeData.pitch}, 45, ${length}, 0.5, 2, ${sizeData.headDiameter}, ${sizeData.headHeight}, 0, 0, "${headType}");\n`;
    }

    scad += `}\n\n`;
  }

  return scad;
}

// Generate SCAD for washers
function generateWasherScad(sizeData, qty, spacing) {
  let scad = `// Washer generation - units in mm\n`;
  scad += `$fn = 100;\n\n`;

  for (let i = 0; i < qty; i++) {
    const x = i * spacing;
    scad += `translate([${x}, 0, 0]) {\n`;
    scad += `  difference() {\n`;
    scad += `    cylinder(r=${sizeData.washerOD/2}, h=${sizeData.washerThickness});\n`;
    scad += `    translate([0, 0, -0.1]) cylinder(r=${sizeData.washerID/2}, h=${sizeData.washerThickness + 0.2});\n`;
    scad += `  }\n`;
    scad += `}\n\n`;
  }

  return scad;
}

// Generate SCAD for nuts
function generateNutScad(sizeData, nutType, qty, spacing) {
  let scad = `// Nut generation - units in mm\n`;
  scad += `$fn = 60;\n\n`;

  scad += getThreadLibrary();

  for (let i = 0; i < qty; i++) {
    const x = i * spacing;
    scad += `translate([${x}, 0, 0]) {\n`;

    if (nutType === 'wingnut') {
      scad += `  wing_radius = ${sizeData.nutHeight};\n`;
      scad += `  rotate([0,0,30]) hex_nut(${sizeData.nutDiameter}, ${sizeData.nutHeight}, ${sizeData.pitch}, 45, ${sizeData.diameter + 0.4}, 0.5);\n`;
      scad += `  translate([(${sizeData.nutDiameter}/2)+wing_radius-1, 1.5, wing_radius/2+1]) rotate([90,0,0]) wing(wing_radius);\n`;
      scad += `  mirror([1,0,0]) translate([(${sizeData.nutDiameter}/2)+wing_radius-1, 1.5, wing_radius/2+1]) rotate([90,0,0]) wing(wing_radius);\n`;
    } else {
      scad += `  hex_nut(${sizeData.nutDiameter}, ${sizeData.nutHeight}, ${sizeData.pitch}, 45, ${sizeData.diameter + 0.4}, 0.5);\n`;
    }

    scad += `}\n\n`;
  }

  return scad;
}

// Thread library functions (extracted from Nut_Job.scad)
function getThreadLibrary() {
  return `
// Thread library functions
module screw_thread(od, st, lf0, lt, rs, cs) {
    or = od/2;
    ir = or - st/2*cos(lf0)/sin(lf0);
    pf = 2*PI*or;
    sn = floor(pf/rs);
    lfxy = 360/sn;
    ttn = round(lt/st + 1);
    zt = st/sn;

    intersection() {
        if (cs >= -1) {
            thread_shape(cs, lt, or, ir, sn, st);
        }
        full_thread(ttn, st, sn, zt, lfxy, or, ir);
    }
}

module thread_shape(cs, lt, or, ir, sn, st) {
    if (cs == 0) {
        cylinder(h=lt, r=or, $fn=sn, center=false);
    } else {
        union() {
            translate([0, 0, st/2])
                cylinder(h=lt-st+0.005, r=or, $fn=sn, center=false);
            if (cs == -1 || cs == 2) {
                cylinder(h=st/2, r1=ir, r2=or, $fn=sn, center=false);
            } else {
                cylinder(h=st/2, r=or, $fn=sn, center=false);
            }
            translate([0, 0, lt-st/2])
            if (cs == 1 || cs == 2) {
                cylinder(h=st/2, r1=or, r2=ir, $fn=sn, center=false);
            } else {
                cylinder(h=st/2, r=or, $fn=sn, center=false);
            }
        }
    }
}

module full_thread(ttn, st, sn, zt, lfxy, or, ir) {
    if (ir >= 0.2) {
        for (i = [0:ttn-1]) {
            for (j = [0:sn-1]) {
                pt = [
                    [0, 0, i*st-st],
                    [ir*cos(j*lfxy), ir*sin(j*lfxy), i*st+j*zt-st],
                    [ir*cos((j+1)*lfxy), ir*sin((j+1)*lfxy), i*st+(j+1)*zt-st],
                    [0, 0, i*st],
                    [or*cos(j*lfxy), or*sin(j*lfxy), i*st+j*zt-st/2],
                    [or*cos((j+1)*lfxy), or*sin((j+1)*lfxy), i*st+(j+1)*zt-st/2],
                    [ir*cos(j*lfxy), ir*sin(j*lfxy), i*st+j*zt],
                    [ir*cos((j+1)*lfxy), ir*sin((j+1)*lfxy), i*st+(j+1)*zt],
                    [0, 0, i*st+st]
                ];
                polyhedron(points=pt, faces=[
                    [1,0,3], [1,3,6], [6,3,8], [1,6,4],
                    [0,1,2], [1,4,2], [2,4,5], [5,4,6], [5,6,7], [7,6,8],
                    [7,8,3], [0,2,3], [3,2,7], [7,2,5]
                ]);
            }
        }
    }
}

module hex_head(hg, df) {
    rd0 = df/2/sin(60);
    x0=0; x1=df/2; x2=x1+hg/2;
    y0=0; y1=hg/2; y2=hg;

    intersection() {
        cylinder(h=hg, r=rd0, $fn=6, center=false);
        rotate_extrude(convexity=10, $fn=6*round(df*PI/6/0.5))
            polygon([[x0,y0], [x1,y0], [x2,y1], [x1,y2], [x0,y2]]);
    }
}

module hex_screw(od, st, lf0, lt, rs, cs, df, hg, ntl, ntd) {
    ntr = od/2 - (st/2)*cos(lf0)/sin(lf0);

    union() {
        hex_head(hg, df);
        translate([0, 0, hg])
        if (ntl == 0) {
            cylinder(h=0.01, r=ntr, center=true);
        } else {
            if (ntd == -1) {
                cylinder(h=ntl+0.01, r=ntr, $fn=floor(od*PI/rs), center=false);
            } else if (ntd == 0) {
                union() {
                    cylinder(h=ntl-st/2, r=od/2, $fn=floor(od*PI/rs), center=false);
                    translate([0, 0, ntl-st/2])
                        cylinder(h=st/2, r1=od/2, r2=ntr, $fn=floor(od*PI/rs), center=false);
                }
            } else {
                cylinder(h=ntl, r=ntd/2, $fn=ntd*PI/rs, center=false);
            }
        }
        translate([0, 0, ntl+hg]) screw_thread(od, st, lf0, lt, rs, cs);
    }
}

module hex_nut(df, hg, sth, clf, cod, crs) {
    difference() {
        hex_head(hg, df);
        hex_countersink_ends(sth/2, cod, clf, crs, hg);
        screw_thread(cod, sth, clf, hg, crs, -2);
    }
}

module hex_countersink_ends(chg, cod, clf, crs, hg) {
    translate([0, 0, -0.1])
        cylinder(h=chg+0.01, r1=cod/2, r2=cod/2-(chg+0.1)*cos(clf)/sin(clf), $fn=floor(cod*PI/crs), center=false);
    translate([0, 0, hg-chg+0.1])
        cylinder(h=chg+0.01, r1=cod/2-(chg+0.1)*cos(clf)/sin(clf), r2=cod/2, $fn=floor(cod*PI/crs), center=false);
}

module socket_head(hg, df) {
    rd0 = df/2/sin(60);
    x0=0; x1=df/2; x2=x1+hg/2;
    y0=0; y1=hg/2; y2=hg;

    intersection() {
        cylinder(h=hg, r=rd0, $fn=60, center=false);
        rotate_extrude(convexity=10, $fn=6*round(df*PI/6/0.5))
            polygon([[x0,y0], [x1,y0], [x2,y1], [x1,y2], [x0,y2]]);
    }
}

module button_head(hg, df) {
    rd0 = df/2/sin(60);
    drive_diameter = df * 0.4;
    intersection() {
        cylinder(h=hg, r1=drive_diameter/2 + 1, r2=rd0, $fn=60, center=false);
        rotate_extrude(convexity=10, $fn=60)
            polygon([[0,0], [df/2,0], [df/2+hg/2,hg/2], [df/2,hg], [0,hg]]);
    }
}

module countersunk_head(hg, df, thread_od) {
    rd0 = df/2/sin(60);
    intersection() {
        cylinder(h=hg, r1=rd0, r2=thread_od/2-0.5, $fn=60, center=false);
        rotate_extrude(convexity=10, $fn=60)
            polygon([[0,0], [df/2,0], [df/2+hg/2,hg/2], [df/2,hg], [0,hg]]);
    }
}

module socket_screw_gen(od, st, lf0, lt, rs, cs, df, hg, ntl, ntd, head_type) {
    ntr = od/2 - (st/2)*cos(lf0)/sin(lf0);
    drive_diameter = df * 0.4;

    difference() {
        union() {
            if (head_type == "socket") {
                socket_head(hg, df);
            } else if (head_type == "button") {
                button_head(hg, df);
            } else if (head_type == "countersunk") {
                countersunk_head(hg, df, od);
            }

            translate([0, 0, hg])
            if (ntl == 0) {
                cylinder(h=0.01, r=ntr, center=true);
            } else {
                if (ntd == -1) {
                    cylinder(h=ntl+0.01, r=ntr, $fn=floor(od*PI/rs), center=false);
                } else if (ntd == 0) {
                    union() {
                        cylinder(h=ntl-st/2, r=od/2, $fn=floor(od*PI/rs), center=false);
                        translate([0, 0, ntl-st/2])
                            cylinder(h=st/2, r1=od/2, r2=ntr, $fn=floor(od*PI/rs), center=false);
                    }
                } else {
                    cylinder(h=ntl, r=ntd/2, $fn=ntd*PI/rs, center=false);
                }
            }
            translate([0, 0, ntl+hg]) screw_thread(od, st, lf0, lt, rs, cs);
        }
        // Socket drive hole
        cylinder(r=drive_diameter/2, h=3.5, $fn=6);
        translate([0, 0, 3.5]) cylinder(r1=drive_diameter/2, r2=0, h=drive_diameter/3, $fn=6);
    }
}

module wing(wing_radius) {
    difference() {
        cylinder(r=wing_radius, h=3, $fn=64);
        union() {
            translate([-wing_radius, -wing_radius-1, -0.5]) cube([wing_radius*2, wing_radius/2, wing_radius*2]);
            rotate([0, 0, 90]) translate([-wing_radius, wing_radius-1, -0.5]) cube([wing_radius*2, wing_radius/2, wing_radius*2]);
        }
    }
}
`;
}

// Cleanup old files (older than 1 hour)
function cleanupOldFiles() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const files = fs.readdirSync(OUTPUT_DIR);

  files.forEach(file => {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = fs.statSync(filePath);
    if (stats.mtimeMs < oneHourAgo) {
      fs.unlinkSync(filePath);
    }
  });
}

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Fastener Generator running at http://localhost:${PORT}`);
});
