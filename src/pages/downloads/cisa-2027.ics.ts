import type { APIRoute } from 'astro';
import { event } from '../../lib/content';
import { absolute } from '../../lib/urls';
const escape = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
export const GET: APIRoute = () => {
  const end = new Date(`${event.endDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CISA//Conference//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:cisa-2027@cisa-conference.org',
    'DTSTAMP:20260925T000000Z',
    `DTSTART;VALUE=DATE:${event.startDate.replaceAll('-', '')}`,
    `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll('-', '')}`,
    `SUMMARY:${escape(event.shortName)}`,
    `LOCATION:${escape(`${event.venue}, ${event.city}, ${event.region}`)}`,
    `DESCRIPTION:${escape('In-person conference. Building and room details will be announced on the conference website.')}`,
    `URL:${absolute('/')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // RFC 5545 folding: keep each physical line under 75 octets, including UTF-8.
  const folded = lines.map((line) => {
    let result = '';
    let width = 0;
    for (const char of line) {
      const size = Buffer.byteLength(char);
      if (width + size > 74) {
        result += '\r\n ';
        width = 1;
      }
      result += char;
      width += size;
    }
    return result;
  });
  return new Response(`${folded.join('\r\n')}\r\n`, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
