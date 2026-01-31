FeatureScript 2411;
import(path : "onshape/std/common.fs", version : "2411.0");

/**
 * Fastener Generator - Creates 3D printable bolts, nuts, and washers
 * Supports Metric (ISO) and ANSI (Imperial) standards
 *
 * Based on thread geometry from ISO 68-1 and ANSI/ASME B1.1
 */

// Thread standard enum
export enum ThreadStandard
{
    annotation { "Name" : "Metric (ISO)" }
    METRIC,
    annotation { "Name" : "ANSI (Imperial)" }
    ANSI
}

// Fastener type enum
export enum FastenerType
{
    annotation { "Name" : "Hex Bolt" }
    HEX_BOLT,
    annotation { "Name" : "Hex Nut" }
    HEX_NUT,
    annotation { "Name" : "Flat Washer" }
    WASHER
}

// Metric sizes
export enum MetricSize
{
    annotation { "Name" : "M3" }
    M3,
    annotation { "Name" : "M4" }
    M4,
    annotation { "Name" : "M5" }
    M5,
    annotation { "Name" : "M6" }
    M6,
    annotation { "Name" : "M8" }
    M8,
    annotation { "Name" : "M10" }
    M10,
    annotation { "Name" : "M12" }
    M12,
    annotation { "Name" : "M16" }
    M16,
    annotation { "Name" : "M20" }
    M20
}

// ANSI sizes
export enum ANSISize
{
    annotation { "Name" : "#6-32" }
    N6_32,
    annotation { "Name" : "#8-32" }
    N8_32,
    annotation { "Name" : "#10-24" }
    N10_24,
    annotation { "Name" : "1/4-20" }
    Q_20,
    annotation { "Name" : "5/16-18" }
    T_18,
    annotation { "Name" : "3/8-16" }
    E_16,
    annotation { "Name" : "1/2-13" }
    H_13,
    annotation { "Name" : "5/8-11" }
    FE_11,
    annotation { "Name" : "3/4-10" }
    TQ_10
}

// Get metric thread data (diameter, pitch, head size, nut height)
function getMetricData(size is MetricSize) returns map
{
    if (size == MetricSize.M3)
        return { "d" : 3 * millimeter, "pitch" : 0.5 * millimeter, "head" : 5.5 * millimeter, "headH" : 2 * millimeter, "nutH" : 2.4 * millimeter, "washerOD" : 7 * millimeter, "washerT" : 0.5 * millimeter };
    if (size == MetricSize.M4)
        return { "d" : 4 * millimeter, "pitch" : 0.7 * millimeter, "head" : 7 * millimeter, "headH" : 2.8 * millimeter, "nutH" : 3.2 * millimeter, "washerOD" : 9 * millimeter, "washerT" : 0.8 * millimeter };
    if (size == MetricSize.M5)
        return { "d" : 5 * millimeter, "pitch" : 0.8 * millimeter, "head" : 8 * millimeter, "headH" : 3.5 * millimeter, "nutH" : 4 * millimeter, "washerOD" : 10 * millimeter, "washerT" : 1 * millimeter };
    if (size == MetricSize.M6)
        return { "d" : 6 * millimeter, "pitch" : 1.0 * millimeter, "head" : 10 * millimeter, "headH" : 4 * millimeter, "nutH" : 5 * millimeter, "washerOD" : 12 * millimeter, "washerT" : 1.6 * millimeter };
    if (size == MetricSize.M8)
        return { "d" : 8 * millimeter, "pitch" : 1.25 * millimeter, "head" : 13 * millimeter, "headH" : 5.3 * millimeter, "nutH" : 6.5 * millimeter, "washerOD" : 16 * millimeter, "washerT" : 1.6 * millimeter };
    if (size == MetricSize.M10)
        return { "d" : 10 * millimeter, "pitch" : 1.5 * millimeter, "head" : 16 * millimeter, "headH" : 6.4 * millimeter, "nutH" : 8 * millimeter, "washerOD" : 20 * millimeter, "washerT" : 2 * millimeter };
    if (size == MetricSize.M12)
        return { "d" : 12 * millimeter, "pitch" : 1.75 * millimeter, "head" : 18 * millimeter, "headH" : 7.5 * millimeter, "nutH" : 10 * millimeter, "washerOD" : 24 * millimeter, "washerT" : 2.5 * millimeter };
    if (size == MetricSize.M16)
        return { "d" : 16 * millimeter, "pitch" : 2.0 * millimeter, "head" : 24 * millimeter, "headH" : 10 * millimeter, "nutH" : 13 * millimeter, "washerOD" : 30 * millimeter, "washerT" : 3 * millimeter };
    // M20
    return { "d" : 20 * millimeter, "pitch" : 2.5 * millimeter, "head" : 30 * millimeter, "headH" : 12.5 * millimeter, "nutH" : 16 * millimeter, "washerOD" : 37 * millimeter, "washerT" : 3 * millimeter };
}

// Get ANSI thread data
function getANSIData(size is ANSISize) returns map
{
    if (size == ANSISize.N6_32)
        return { "d" : 3.51 * millimeter, "pitch" : 0.794 * millimeter, "head" : 7.94 * millimeter, "headH" : 2.3 * millimeter, "nutH" : 2.8 * millimeter, "washerOD" : 9.5 * millimeter, "washerT" : 0.8 * millimeter };
    if (size == ANSISize.N8_32)
        return { "d" : 4.17 * millimeter, "pitch" : 0.794 * millimeter, "head" : 8.73 * millimeter, "headH" : 2.7 * millimeter, "nutH" : 3.3 * millimeter, "washerOD" : 11.1 * millimeter, "washerT" : 1.2 * millimeter };
    if (size == ANSISize.N10_24)
        return { "d" : 4.83 * millimeter, "pitch" : 1.058 * millimeter, "head" : 9.53 * millimeter, "headH" : 3.1 * millimeter, "nutH" : 3.8 * millimeter, "washerOD" : 12.7 * millimeter, "washerT" : 1.2 * millimeter };
    if (size == ANSISize.Q_20)
        return { "d" : 6.35 * millimeter, "pitch" : 1.27 * millimeter, "head" : 11.1 * millimeter, "headH" : 4.0 * millimeter, "nutH" : 5.6 * millimeter, "washerOD" : 15.9 * millimeter, "washerT" : 1.6 * millimeter };
    if (size == ANSISize.T_18)
        return { "d" : 7.94 * millimeter, "pitch" : 1.41 * millimeter, "head" : 12.7 * millimeter, "headH" : 5.0 * millimeter, "nutH" : 6.9 * millimeter, "washerOD" : 17.5 * millimeter, "washerT" : 1.6 * millimeter };
    if (size == ANSISize.E_16)
        return { "d" : 9.53 * millimeter, "pitch" : 1.59 * millimeter, "head" : 14.3 * millimeter, "headH" : 6.0 * millimeter, "nutH" : 8.3 * millimeter, "washerOD" : 20.6 * millimeter, "washerT" : 1.6 * millimeter };
    if (size == ANSISize.H_13)
        return { "d" : 12.7 * millimeter, "pitch" : 1.95 * millimeter, "head" : 19.1 * millimeter, "headH" : 8.0 * millimeter, "nutH" : 11.1 * millimeter, "washerOD" : 27.0 * millimeter, "washerT" : 2.4 * millimeter };
    if (size == ANSISize.FE_11)
        return { "d" : 15.9 * millimeter, "pitch" : 2.31 * millimeter, "head" : 23.8 * millimeter, "headH" : 10.0 * millimeter, "nutH" : 13.9 * millimeter, "washerOD" : 34.9 * millimeter, "washerT" : 3.2 * millimeter };
    // 3/4-10
    return { "d" : 19.1 * millimeter, "pitch" : 2.54 * millimeter, "head" : 28.6 * millimeter, "headH" : 12.0 * millimeter, "nutH" : 16.7 * millimeter, "washerOD" : 39.7 * millimeter, "washerT" : 3.2 * millimeter };
}

// Create a hexagonal prism
function createHexPrism(context is Context, id is Id, center is Vector, flatToFlat is ValueWithUnits, height is ValueWithUnits)
{
    // Hex inscribed radius (flat to flat / 2)
    const r = flatToFlat / 2;
    // Hex circumscribed radius (corner to corner / 2)
    const R = r / cos(30 * degree);

    // Create hex sketch
    var sketchPlane = plane(center, vector(0, 0, 1));
    var sketch1 = newSketchOnPlane(context, id + "hexSketch", { "sketchPlane" : sketchPlane });

    // Draw hexagon vertices
    var points = [];
    for (var i = 0; i < 6; i += 1)
    {
        var angle = i * 60 * degree + 30 * degree; // Start at 30 deg for flat bottom
        points = append(points, vector(R * cos(angle), R * sin(angle)));
    }

    // Create polygon
    for (var i = 0; i < 6; i += 1)
    {
        var next = (i + 1) % 6;
        skLineSegment(sketch1, "side" ~ i, { "start" : points[i], "end" : points[next] });
    }

    skSolve(sketch1);

    // Extrude the hex
    opExtrude(context, id + "hexExtrude", {
        "entities" : qSketchRegion(id + "hexSketch"),
        "direction" : vector(0, 0, 1),
        "endBound" : BoundingType.BLIND,
        "endDepth" : height
    });

    // Clean up sketch
    opDeleteBodies(context, id + "deleteSketch", { "entities" : qCreatedBy(id + "hexSketch", EntityType.BODY) });
}

// Create thread profile for sweeping
function createThreadProfile(context is Context, id is Id, startPoint is Vector, pitch is ValueWithUnits, majorDiameter is ValueWithUnits, isExternal is boolean)
{
    // ISO metric thread profile: 60 degree included angle
    // Thread depth H = pitch * sqrt(3) / 2
    // Actual depth = 5/8 * H for external, 1/2 * H for internal

    const H = pitch * sqrt(3) / 2;
    const threadDepth = isExternal ? (5 / 8 * H) : (H / 2);

    // For external thread: major diameter is given, minor = major - 2*depth
    // For internal thread: minor diameter is given, major = minor + 2*depth

    const minorRadius = isExternal ? (majorDiameter / 2 - threadDepth) : (majorDiameter / 2);
    const majorRadius = isExternal ? (majorDiameter / 2) : (majorDiameter / 2 + threadDepth);

    // Create triangular thread profile sketch perpendicular to helix start
    var profilePlane = plane(startPoint, vector(0, 1, 0), vector(1, 0, 0));
    var sketch1 = newSketchOnPlane(context, id + "threadProfile", { "sketchPlane" : profilePlane });

    // Thread profile points (simplified triangular)
    const flatWidth = pitch / 8; // Flat at crest and root

    // Profile vertices (in sketch XY, which maps to global XZ plane at startPoint)
    const p1 = vector(minorRadius, -pitch / 2 + flatWidth / 2); // Bottom left
    const p2 = vector(majorRadius - flatWidth / 2, 0 * millimeter); // Top middle-left
    const p3 = vector(majorRadius - flatWidth / 2, 0 * millimeter); // Top middle-right (same for triangle)
    const p4 = vector(minorRadius, pitch / 2 - flatWidth / 2); // Bottom right

    // Draw profile as triangle
    skLineSegment(sketch1, "left", { "start" : vector(minorRadius, -pitch / 4), "end" : vector(majorRadius, 0 * millimeter) });
    skLineSegment(sketch1, "right", { "start" : vector(majorRadius, 0 * millimeter), "end" : vector(minorRadius, pitch / 4) });
    skLineSegment(sketch1, "bottom", { "start" : vector(minorRadius, pitch / 4), "end" : vector(minorRadius, -pitch / 4) });

    skSolve(sketch1);

    return qSketchRegion(id + "threadProfile");
}

// Main feature definition
annotation { "Feature Type Name" : "Fastener Generator", "Feature Type Description" : "Generate 3D printable bolts, nuts, and washers" }
export const fastenerGenerator = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Fastener Type" }
        definition.fastenerType is FastenerType;

        annotation { "Name" : "Thread Standard" }
        definition.standard is ThreadStandard;

        // Metric size (shown when metric selected)
        if (definition.standard == ThreadStandard.METRIC)
        {
            annotation { "Name" : "Size" }
            definition.metricSize is MetricSize;
        }

        // ANSI size (shown when ANSI selected)
        if (definition.standard == ThreadStandard.ANSI)
        {
            annotation { "Name" : "Size" }
            definition.ansiSize is ANSISize;
        }

        // Thread length (for bolts only)
        if (definition.fastenerType == FastenerType.HEX_BOLT)
        {
            annotation { "Name" : "Thread Length" }
            isLength(definition.threadLength, { (millimeter) : [5, 20, 200] } as LengthBoundSpec);

            annotation { "Name" : "Model Threads", "Default" : false }
            definition.modelThreads is boolean;
        }

        // Clearance for nuts (for 3D printing fit)
        if (definition.fastenerType == FastenerType.HEX_NUT)
        {
            annotation { "Name" : "Thread Clearance", "Description" : "Extra clearance for 3D printing" }
            isLength(definition.clearance, { (millimeter) : [0, 0.4, 1] } as LengthBoundSpec);

            annotation { "Name" : "Model Threads", "Default" : false }
            definition.modelThreads is boolean;
        }
    }
    {
        // Get thread data based on standard and size
        var data = (definition.standard == ThreadStandard.METRIC) ?
            getMetricData(definition.metricSize) :
            getANSIData(definition.ansiSize);

        const diameter = data.d;
        const pitch = data.pitch;
        const headSize = data.head;
        const headHeight = data.headH;
        const nutHeight = data.nutH;
        const washerOD = data.washerOD;
        const washerThickness = data.washerT;
        const washerID = diameter + 0.4 * millimeter; // Clearance hole

        if (definition.fastenerType == FastenerType.HEX_BOLT)
        {
            // Create hex head
            createHexPrism(context, id + "head", vector(0, 0, 0) * millimeter, headSize, headHeight);

            // Create shaft cylinder
            opCylinder(context, id + "shaft", {
                "topCenter" : vector(0, 0, headHeight),
                "bottomCenter" : vector(0, 0, headHeight + definition.threadLength),
                "radius" : diameter / 2
            });

            // Union head and shaft
            opBoolean(context, id + "union1", {
                "tools" : qCreatedBy(id + "head", EntityType.BODY),
                "targets" : qCreatedBy(id + "shaft", EntityType.BODY),
                "operationType" : BooleanOperationType.UNION
            });

            // Add chamfer to head top edges
            try
            {
                opChamfer(context, id + "headChamfer", {
                    "entities" : qCreatedBy(id + "head", EntityType.EDGE),
                    "chamferType" : ChamferType.EQUAL_OFFSETS,
                    "width" : headHeight * 0.15
                });
            }

            // Add thread entry chamfer at tip
            try
            {
                opChamfer(context, id + "tipChamfer", {
                    "entities" : qFarthestAlong(qCreatedBy(id + "shaft", EntityType.EDGE), vector(0, 0, 1)),
                    "chamferType" : ChamferType.EQUAL_OFFSETS,
                    "width" : pitch
                });
            }
        }
        else if (definition.fastenerType == FastenerType.HEX_NUT)
        {
            // Create hex body
            createHexPrism(context, id + "nutBody", vector(0, 0, 0) * millimeter, headSize, nutHeight);

            // Create center hole (with clearance for 3D printing)
            const holeRadius = diameter / 2 + definition.clearance;
            opCylinder(context, id + "hole", {
                "topCenter" : vector(0, 0, -0.1 * millimeter),
                "bottomCenter" : vector(0, 0, nutHeight + 0.1 * millimeter),
                "radius" : holeRadius
            });

            // Subtract hole from nut
            opBoolean(context, id + "subtract1", {
                "tools" : qCreatedBy(id + "hole", EntityType.BODY),
                "targets" : qCreatedBy(id + "nutBody", EntityType.BODY),
                "operationType" : BooleanOperationType.SUBTRACTION
            });

            // Add chamfers to top and bottom
            try
            {
                opChamfer(context, id + "nutChamfer", {
                    "entities" : qOwnedByBody(qCreatedBy(id + "nutBody", EntityType.BODY), EntityType.EDGE),
                    "chamferType" : ChamferType.EQUAL_OFFSETS,
                    "width" : nutHeight * 0.1
                });
            }
        }
        else if (definition.fastenerType == FastenerType.WASHER)
        {
            // Create outer cylinder
            opCylinder(context, id + "washerOuter", {
                "topCenter" : vector(0, 0, 0) * millimeter,
                "bottomCenter" : vector(0, 0, washerThickness),
                "radius" : washerOD / 2
            });

            // Create inner hole
            opCylinder(context, id + "washerHole", {
                "topCenter" : vector(0, 0, -0.1 * millimeter),
                "bottomCenter" : vector(0, 0, washerThickness + 0.1 * millimeter),
                "radius" : washerID / 2
            });

            // Subtract hole
            opBoolean(context, id + "washerSubtract", {
                "tools" : qCreatedBy(id + "washerHole", EntityType.BODY),
                "targets" : qCreatedBy(id + "washerOuter", EntityType.BODY),
                "operationType" : BooleanOperationType.SUBTRACTION
            });

            // Optional: add small chamfer to edges
            try
            {
                opChamfer(context, id + "washerChamfer", {
                    "entities" : qOwnedByBody(qCreatedBy(id + "washerOuter", EntityType.BODY), EntityType.EDGE),
                    "chamferType" : ChamferType.EQUAL_OFFSETS,
                    "width" : washerThickness * 0.1
                });
            }
        }
    });
