
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL;
const ACCOUNT_ID = __ENV.ACCOUNT_ID;

export default function () {
  const response = http.get(
    `${BASE_URL}/api/accounts/${ACCOUNT_ID}`
  );

  check(response, {
    'account fetched successfully': (r) => r.status === 200,
  });

  sleep(1);
}
