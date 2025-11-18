import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getDND = new Trend('get_dungeons', true);
export const RateDNDok = new Rate('dnd_ok');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_dungeons: ['p(90)<6800'],
    dnd_ok: ['rate>0.75']
  },
  stages: [
    { duration: '2m', target: 7 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com/api';
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.get(`${baseUrl}/characters/example`, params);
  getDND.add(res.timings.duration);
  RateDNDok.add(res.status === 200);
  check(res, {
    'GET Dungeons and Dragons Creature Names': () => res.status === 200
  });
}