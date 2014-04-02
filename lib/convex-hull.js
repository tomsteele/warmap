// Convex Hull algorithm
// Modified from http://en.literateprograms.org/Quickhull_(Javascript)

function getDistant(cpt, bl) {
  var Vy = bl[1][0] - bl[0][0];
  var Vx = bl[0][1] - bl[1][1];
  return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]));
}

function findMostDistantPointFromBaseLine(baseLine, points) {
  var maxD = 0;
  var maxPt = [];
  var newPoints = [];
  for (var i = 0; i < points.length; i++) {
    var pt = points[i];
    var d = getDistant(pt, baseLine);
    if ( d > 0) {
      newPoints.push(pt);
    } else {
      continue;
    }
    if ( d > maxD ) {
      maxD = d;
      maxPt = pt;
    }
  }
  return {'maxPoint': maxPt, 'newPoints': newPoints};
}

var allBaseLines = [];
function buildConvexHull(baseLine, points) {
  allBaseLines.push(baseLine);
  var convexHullBaseLines = [];
  var t = findMostDistantPointFromBaseLine(baseLine, points);
  if (t.maxPoint.length) {
    convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([baseLine[0],t.maxPoint], t.newPoints));
    convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([t.maxPoint,baseLine[1]], t.newPoints));
    return convexHullBaseLines;
  } else {
    return [baseLine];
  }
}

function getConvexHull(points) {
  var maxX, minX;
  var maxPt, minPt;
  for (var i = 0; i < points.length; i++) {
    var pt = points[i];
    if (pt[0] > maxX || !maxX) {
      maxPt = pt;
      maxX = pt[0];
    }
    if (pt[0] < minX || !minX) {
      minPt = pt;
      minX = pt[0];
    }
  }
  return [].concat(buildConvexHull([minPt, maxPt], points),
                   buildConvexHull([maxPt, minPt], points));
}

module.exports = getConvexHull;
