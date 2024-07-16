import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 2,
  // duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
  },
  tags: {
    environment: 'production',
  },
  stages: [
    { duration: '60s', target: 1000 },
    { duration: '30s', target: 500 },
  ],
};

export default function () {
    new http
  const res = http.get(
    'http://localhost:3000/currencies');
  check(res, { 'Status was 200: ': (r) => [200].includes(r.status) });
  sleep(1);
}