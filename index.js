#!/usr/bin/env node
// Copyright (c) 2013 Tom Steele
// See the file license.txt for copying permission

var fs = require('fs');
var path = require('path');
var parseString = require('xml2js').parseString;
var _ = require('lodash');
var hull = require('./lib/convex-hull');
var argv = require('optimist')
  .demand(2)
  .usage("$0 <file.gpsxml> <bssids>\nbssids may be a comma separated list or a newline separated file.").argv;

var gpsFile = argv._[0];
var ssids = argv._[1];

function croak(message) {
  console.error(message);
  process.exit(1);
}

function writePathsToFile(points) {
  var htmlTemplate = path.join(path.dirname(require.main.filename), './lib/template.html');
  var template = fs.readFileSync(htmlTemplate, { encoding: 'utf8' });
  template = template.replace('{{lat}}', points[0][0]);
  template = template.replace('{{lng}}', points[0][1]);
  template = template.replace('{{paths}}', JSON.stringify(points, null, 2));
  template = template.replace('{{pathLength}}', points.length);
  console.log(template);
}

function extractPoints(point) {
  if (ssids.indexOf(point.$.bssid.toLowerCase()) !== -1) {
    return [parseFloat(point.$.lat), parseFloat(point.$.lon)];
  }
}

function findPoints(err, result) {
  if (err) {
    return croak(err.message);
  }
  var points = [];
  try {
    points = _.compact(_.map(result['gps-run']['gps-point'], extractPoints));
  } catch (e) {
    croak('Could not find points, check gpsxml file!');
  }
  if (points.length === 0) {
    croak('No points found!');
  }
  points = _.flatten(hull(points), isShallow=true);
  return writePathsToFile(points);
}

function parseXml(err, xml) {
  if (err) {
    return croak(err.message);
  }
  return parseString(xml, findPoints);
}

// Use either a file of SSIDS or a comma separated list
if (fs.existsSync(ssids)) {
  ssids = fs.readFileSync(ssids, { encoding: 'utf8'}).split('\n');
} else {
  ssids = ssids.split(',');
}
ssids = _.map(ssids, function(ssid) { return ssid.toLowerCase(); });
fs.readFile(gpsFile, { encoding: 'utf8' }, parseXml);
