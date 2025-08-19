// helper to generate 30-min slots between "08:00" and "22:00" for a date
function parseTimeForDate(dateStr, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d;
}

function generateSlotsForDay(dateStr, openTime, closeTime, slotMinutes = 30) {
  const start = parseTimeForDate(dateStr, openTime);
  const end = parseTimeForDate(dateStr, closeTime);
  const slots = [];
  let cur = new Date(start);
  while (cur < end) {
    const next = new Date(cur.getTime() + slotMinutes*60000);
    if (next > end) break;
    slots.push({ startTs: new Date(cur), endTs: new Date(next) });
    cur = next;
  }
  return slots;
}

function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = { generateSlotsForDay, isOverlap };
