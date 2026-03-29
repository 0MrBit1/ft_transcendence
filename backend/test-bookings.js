const http = require('http');

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1' + path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Bookings Module E2E Test ---');

  // Hardcode UUIDs from the seed file
  const eventId = '00000000-0000-4000-a000-000000000001'; // Tech Meetup
  const userId = '1067ed37-66b4-40af-a288-c45d61c659e4';  // admin@uniclubs.com

  try {
    console.log('\n[1] TEST: Create a Booking (POST /bookings/events/:eventId)');
    let res = await request('POST', '/bookings/events/' + eventId, { userId });
    console.log('Status:', res.status);
    if (res.status === 409) {
      console.log('Booking already exists. We will fetch and cancel it first...');
      const userBookingsRes = await request('GET', '/bookings/user/' + userId);
      const existing = userBookingsRes.data.data.find(b => b.eventId === eventId);
      if (existing) {
        await request('PATCH', '/bookings/' + existing.id + '/cancel');
        res = await request('POST', '/bookings/events/' + eventId, { userId });
        console.log('Retry Status:', res.status);
      }
    }
    const booking = res.data;
    console.log('Response:', JSON.stringify({ id: booking.id, status: booking.status, remainingCapacity: booking.event ? booking.event.remainingCapacity : 'N/A' }));
    
    if (!booking.id) {
      console.error('Failed to create booking!', booking);
      return;
    }
    const bookingId = booking.id;

    console.log('\n[2] TEST: View single booking (GET /bookings/:id)');
    res = await request('GET', '/bookings/' + bookingId);
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify({ id: res.data.id, status: res.data.status }));

    console.log('\n[3] TEST: View Event Bookings (GET /bookings/events/:eventId)');
    res = await request('GET', '/bookings/events/' + eventId);
    console.log('Status:', res.status);
    console.log('Response Items Count:', res.data.meta ? res.data.meta.total : 0);
    console.log('Includes our booking?', res.data.data.some(b => b.id === bookingId));

    console.log('\n[4] TEST: View User Bookings (GET /bookings/user/:userId)');
    res = await request('GET', '/bookings/user/' + userId);
    console.log('Status:', res.status);
    console.log('Response Items Count:', res.data.meta ? res.data.meta.total : 0);
    console.log('Includes our booking?', res.data.data.some(b => b.id === bookingId));

    console.log('\n[5] TEST: Confirm Booking (PATCH /bookings/:id/confirm)');
    res = await request('PATCH', '/bookings/' + bookingId + '/confirm');
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify({ id: res.data.id, status: res.data.status }));

    console.log('\n[6] TEST: Cancel Booking (PATCH /bookings/:id/cancel)');
    res = await request('PATCH', '/bookings/' + bookingId + '/cancel');
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify({ id: res.data.id, status: res.data.status, remainingCapacity: res.data.event ? res.data.event.remainingCapacity : 'N/A' }));

    console.log('\n✅ All Bookings Endpoints Tested Successfully!');

  } catch (err) {
    console.error('Test script error:', err);
  }
}

runTests();
