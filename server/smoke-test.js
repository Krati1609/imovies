// End-to-end check of the API against a running server and database.
//
//   1. Start MongoDB, then:  npm run seed
//   2. In one terminal:      npm run dev
//   3. In another:           npm run smoke
//
// Needs Node 18+ (uses the built-in fetch).
const BASE = process.env.API_URL || 'http://localhost:5000/api';

let failed = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${ok ? '' : ` ${detail}`}`);
  if (!ok) failed++;
}

async function api(method, url, body, token) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

(async () => {
  const admin = (await api('POST', '/auth/login', { email: 'admin@imovies.com', password: 'admin123' })).data;
  const user = (await api('POST', '/auth/login', { email: 'user@imovies.com', password: 'user123' })).data;
  check('admin and demo user can log in', admin?.token && user?.token);

  const bad = await api('POST', '/auth/login', { email: 'user@imovies.com', password: 'wrong' });
  check('wrong password is rejected (401)', bad.status === 401);

  const email = `t${Date.now()}@test.com`;
  const reg = await api('POST', '/auth/register', { name: 'Tester', email, password: 'secret1', role: 'admin' });
  check('register works and ignores a "role" in the body', reg.status === 201 && reg.data.user.role === 'user');
  const dup = await api('POST', '/auth/register', { name: 'Tester', email, password: 'secret1' });
  check('duplicate email is rejected (409)', dup.status === 409);

  const movies = await api('GET', '/movies');
  check('movie list returns movies', movies.status === 200 && movies.data.length > 0);
  const search = await api('GET', '/movies?search=incep');
  check('search by title works', search.data.length === 1 && search.data[0].title === 'Inception');

  // Coming-soon movies have no shows, so pick the first movie that does.
  let movie, shows;
  for (const m of movies.data) {
    const res = await api('GET', `/movies/${m._id}/shows`);
    if (res.status === 200 && res.data.length > 0) { movie = m; shows = res; break; }
  }
  if (!movie) { movie = movies.data[0]; shows = await api('GET', `/movies/${movie._id}/shows`); }
  check('movie has upcoming shows', shows.status === 200 && shows.data.length > 0);
  const showId = shows.data[0]._id;

  const guest = await api('POST', '/bookings', { showId, seats: ['A1'] });
  check('guest cannot book (401)', guest.status === 401);

  const first = await api('POST', '/bookings', { showId, seats: ['A1', 'A2'] }, user.token);
  check('user can book A1, A2 (201)', first.status === 201 && first.data.totalAmount > 0, JSON.stringify(first.data));

  const seatMap = await api('GET', `/shows/${showId}`);
  check('seat map shows A1 and A2 as booked', seatMap.data.bookedSeats.includes('A1') && seatMap.data.bookedSeats.includes('A2'));

  const again = await api('POST', '/bookings', { showId, seats: ['A2', 'A3'] }, user.token);
  check('overlapping seat is rejected (409)', again.status === 409);
  const afterReject = await api('GET', `/shows/${showId}`);
  check('rejected booking did not claim A3', !afterReject.data.bookedSeats.includes('A3'));

  const badSeat = await api('POST', '/bookings', { showId, seats: ['Z99'] }, user.token);
  check('seat outside the grid is rejected (400)', badSeat.status === 400);

  // Race: two people try to take the same seat at the same moment.
  const [r1, r2] = await Promise.all([
    api('POST', '/bookings', { showId, seats: ['C5'] }, user.token),
    api('POST', '/bookings', { showId, seats: ['C5'] }, reg.data.token),
  ]);
  const codes = [r1.status, r2.status].sort();
  check('simultaneous booking of one seat: exactly one wins', codes[0] === 201 && codes[1] === 409, `got ${codes}`);

  const mine = await api('GET', '/bookings/mine', null, user.token);
  check('"my bookings" lists the booking', mine.status === 200 && mine.data.some((b) => b._id === first.data._id));

  const stranger = await api('PATCH', `/bookings/${first.data._id}/cancel`, null, reg.data.token);
  check('another user cannot cancel it (403)', stranger.status === 403);

  const cancel = await api('PATCH', `/bookings/${first.data._id}/cancel`, null, user.token);
  check('owner can cancel', cancel.status === 200 && cancel.data.status === 'cancelled');
  const cancelAgain = await api('PATCH', `/bookings/${first.data._id}/cancel`, null, user.token);
  check('cancelling twice is rejected (409)', cancelAgain.status === 409);

  const freed = await api('GET', `/shows/${showId}`);
  check('cancelled seats are released', !freed.data.bookedSeats.includes('A1') && !freed.data.bookedSeats.includes('A2'));
  const rebook = await api('POST', '/bookings', { showId, seats: ['A1'] }, reg.data.token);
  check('released seat can be booked again', rebook.status === 201);

  const userMovie = await api('POST', '/movies', { title: 'X', durationMins: 90 }, user.token);
  check('normal user cannot add a movie (403)', userMovie.status === 403);
  const adminMovie = await api('POST', '/movies', { title: 'Smoke Test Movie', durationMins: 90 }, admin.token);
  check('admin can add a movie (201)', adminMovie.status === 201);
  const del = await api('DELETE', `/movies/${adminMovie.data._id}`, null, admin.token);
  check('admin can delete a movie with no shows', del.status === 200);
  const all = await api('GET', '/bookings', null, admin.token);
  check('admin can list all bookings', all.status === 200 && Array.isArray(all.data));
  const allUser = await api('GET', '/bookings', null, user.token);
  check('normal user cannot list all bookings (403)', allUser.status === 403);

  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('Could not reach the API. Is the server running?', e.message);
  process.exit(1);
});
