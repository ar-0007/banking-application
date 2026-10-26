import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  
    { duration: '30s', target: 200 }, 
    { duration: '10s', target: 0 },   
  ],
};

export default function () {
  // Exact endpoint from your Postman
  const url = 'http://localhost:3000/api/transactions'; 
  
  // NOTE: Yahan 'sender_id' aur 'receiver_id' ki jagah DBeaver se 
  // do (2) valid 'id' (UUIDs) copy kar ke dalein jo humne seed kiye thay.
  const payload = JSON.stringify({
    sender_account_id: "DBeaver_SE_COPY_KIYA_HUA_SENDER_UUID", 
    receiver_account_id: "DBeaver_SE_COPY_KIYA_HUA_RECEIVER_UUID",
    amount: "10.00",
    description: "Load test transfer"
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };


  const res = http.post(url, payload, params);

  // Agar error aaye toh terminal mein print ho jayega
  if (res.status !== 200 && res.status !== 201) {
    console.log(`Status: ${res.status} | Body: ${res.body}`);
  }

  check(res, {
    'is status 200 or 201': (r) => r.status === 200 || r.status === 201,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });
  console.log(`Status: ${res.status} | Body: ${res.body}`);
  sleep(1);
}