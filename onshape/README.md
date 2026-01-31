# Onshape Fastener Generator FeatureScript

A custom Onshape feature for generating 3D-printable bolts, nuts, and washers.

## Installation

1. Open Onshape and create a new document
2. Click the **+** button in the Feature Studio tab
3. Create a new Feature Studio
4. Copy and paste the contents of `FastenerGenerator.fs`
5. Click the checkmark to commit

## Usage

1. In Part Studio, click **Insert Feature** (+ button)
2. Scroll to find **Fastener Generator** under custom features
3. Configure:
   - **Fastener Type**: Hex Bolt, Hex Nut, or Flat Washer
   - **Thread Standard**: Metric (ISO) or ANSI (Imperial)
   - **Size**: Select from available sizes
   - **Thread Length**: For bolts only
   - **Thread Clearance**: For nuts (default 0.4mm for 3D printing fit)

## Supported Sizes

### Metric (ISO)
M3, M4, M5, M6, M8, M10, M12, M16, M20

### ANSI (Imperial)
#6-32, #8-32, #10-24, 1/4-20, 5/16-18, 3/8-16, 1/2-13, 5/8-11, 3/4-10

## Features

- **Hex Bolts**: Hex head with shaft, chamfered edges and tip
- **Hex Nuts**: Hex body with center hole, chamfered edges
- **Flat Washers**: Standard flat washers with clearance hole

## 3D Printing Notes

- Default thread clearance of 0.4mm works well for most FDM printers
- Adjust clearance if threads are too tight or loose
- The fastener is generated without modeled threads by default (faster, works with mating parts)
- For visual threads, use Onshape's built-in Thread feature after generating

## Thread Dimensions

All dimensions follow ISO 68-1 (metric) and ANSI/ASME B1.1 (imperial) standards:
- Thread angle: 60°
- Coarse pitch by default
- Head sizes per DIN 934 / ANSI B18.2.2

## Resources

- [FeatureScript Documentation](https://cad.onshape.com/FsDoc/)
- [Thread Creator FeatureScript](https://forum.onshape.com/discussion/4867/new-featurescript-thread-creator) - For actual modeled threads
- [External Thread FeatureScript](https://forum.onshape.com/discussion/16744/new-featurescript-external-thread-2d-3d) - For detailed thread modeling
