#!/usr/bin/env node
/**
 * FlightLine Phase 5E patch
 * Converts compact time-in-stage labels like 63m into voice-friendly text.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-spoken-time-label-phase5e.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  return source.replace(from, to);
};

let source = fs.readFileSync(mobilePath, 'utf8');
const original = source;

source = replaceOnce(
  source,
  'voice-friendly deal time label',
  `  const getDealTimeLabel = (deal) => deal.timeInStage || \`${calculateDealAge(deal.createdAt)} hours\`;`,
  `  const getDealTimeLabel = (deal) => {
    const rawLabel = deal.timeInStage || \`${calculateDealAge(deal.createdAt)} hours\`;
    const label = String(rawLabel).trim();
    const compactMinutes = label.match(/^(\\d+)\\s*m$/i);
    const compactHours = label.match(/^(\\d+)\\s*h$/i);

    if (compactMinutes) {
      const minutes = Number(compactMinutes[1]);
      return minutes === 1 ? '1 minute' : \`${minutes} minutes\`;
    }

    if (compactHours) {
      const hours = Number(compactHours[1]);
      return hours === 1 ? '1 hour' : \`${hours} hours\`;
    }

    return label
      .replace(/\\bmins?\\b/gi, 'minutes')
      .replace(/\\bhrs?\\b/gi, 'hours');
  };`
);

source = replaceOnce(
  source,
  'short attention says in stage explicitly',
  `        return \`Attention: start with \${getCustomerName(firstDeal)}, \${normalizeStage(firstDeal.status || firstDeal.stage)}, \${getDealTimeLabel(firstDeal)} in stage.\`;`,
  `        return \`Attention: start with \${getCustomerName(firstDeal)}, currently in \${normalizeStage(firstDeal.status || firstDeal.stage)} for \${getDealTimeLabel(firstDeal)}.\`;`
);

if (source === original) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, source);
console.log('Applied Flight Attendant Phase 5E spoken time label patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
