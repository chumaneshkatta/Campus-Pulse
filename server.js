import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const db = await open({
  filename: './data/users.db',
  driver: sqlite3.Database,
});

const ADMIN_EMAIL = 'sidharthareddy@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT,
    gender TEXT,
    dob TEXT,
    phone_number TEXT,
    userType TEXT DEFAULT 'registered',
    institution TEXT DEFAULT 'CampusPulse',
    sport TEXT DEFAULT 'General Sports',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_events (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    userType TEXT NOT NULL,
    login_time TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

for (const column of ['username', 'gender', 'dob', 'phone_number']) {
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN ${column} TEXT`);
  } catch (error) {
    if (!error.message.includes('duplicate column name')) throw error;
  }
}

const ensureAdminUser = async () => {
  const existing = await db.get('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL]);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminUser = {
    id: 'admin-sidhartha',
    email: ADMIN_EMAIL,
    password: passwordHash,
    full_name: 'Sidhartha Reddy',
    userType: 'admin',
    institution: 'CampusPulse',
    sport: 'Admin Console',
  };

  await db.run(
    'INSERT INTO users (id, email, password, full_name, userType, institution, sport) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [adminUser.id, adminUser.email, adminUser.password, adminUser.full_name, adminUser.userType, adminUser.institution, adminUser.sport]
  );

  return adminUser;
};

await ensureAdminUser();

const makeId = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const seedTournaments = [
  {
    id: 'live-tournament-1',
    state: 'Telangana',
    title: 'Hyderabad Inter-College Basketball Cup',
    sport: 'Basketball',
    eventType: 'Inter-College',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    teamCount: 8,
    maxTeams: 16,
    registrationStatus: 'open',
    status: 'upcoming',
    bannerColor: '#1d4ed8',
    location: 'Hyderabad',
    venue: 'Gachibowli Indoor Arena',
    organizer: 'Hyderabad Sports Council',
    description: 'Annual inter-college basketball competition for university teams across Telangana.',
    minRosterSize: 5,
    maxRosterSize: 8,
    registrationDeadline: new Date(Date.now() + 600000000).toISOString(),
  },
  {
    id: 'live-tournament-2',
    state: 'Andhra Pradesh',
    title: 'Vizag Community Football Festival',
    sport: 'Football',
    eventType: 'Community',
    startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    teamCount: 12,
    maxTeams: 16,
    registrationStatus: 'open',
    status: 'upcoming',
    bannerColor: '#059669',
    location: 'Visakhapatnam',
    venue: 'Beachside Sports Ground',
    organizer: 'Vizag Community League',
    description: 'Community football challenge for local clubs and resident teams.',
    minRosterSize: 7,
    maxRosterSize: 11,
    registrationDeadline: new Date(Date.now() + 1200000000).toISOString(),
  },
  {
    id: 'live-tournament-3',
    state: 'Telangana',
    title: 'Hyderabad City Open Tennis Cup',
    sport: 'Tennis',
    eventType: 'Outside College',
    startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    teamCount: 6,
    maxTeams: 12,
    registrationStatus: 'open',
    status: 'upcoming',
    bannerColor: '#f59e0b',
    location: 'Hyderabad',
    venue: 'Banjara Hills Tennis Courts',
    organizer: 'City Sports Club',
    description: 'Open tournament for outside college players and local clubs.',
    minRosterSize: 1,
    maxRosterSize: 2,
    registrationDeadline: new Date(Date.now() + 1800000000).toISOString(),
  },
];

const tournaments = [...seedTournaments];
const registrations = [];
const savedTournaments = await db.all('SELECT payload FROM tournaments ORDER BY created_at DESC');
for (const saved of savedTournaments) {
  try { tournaments.unshift(JSON.parse(saved.payload)); } catch (error) { console.error('Invalid saved tournament:', error.message); }
}
let externalTournamentCache = { expiresAt: 0, items: [] };

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const isValidAnuragUniversityEmail = (value) => {
  const email = normalizeEmail(value);
  const match = email.match(/^(\d{2})([a-z]{2})(\d{3})([a-z])(\d{2})@anurag\.edu\.in$/i);
  return Boolean(match && ['23', '24', '25', '26'].includes(match[1]));
};

const createUserRecord = (payload = {}) => ({
  id: payload.id || `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  email: normalizeEmail(payload.email),
  password: String(payload.password || ''),
  full_name: payload.full_name || normalizeEmail(payload.email).split('@')[0].replace(/[._-]/g, ' '),
  username: payload.username || '',
  gender: payload.gender || '',
  dob: payload.dob || '',
  phone_number: payload.phone_number || '',
  userType: payload.userType || 'registered',
  institution: payload.institution || 'CampusPulse',
  sport: payload.sport || 'General Sports',
});

const chatResponses = {
  'show today\'s matches': 'Today\'s sports schedule includes: Hyderabad Inter-College Basketball Cup at 9:00 AM in Hyderabad, Vizag Community Football Festival at 10:00 AM in Visakhapatnam, and the Hyderabad City Open Tennis Cup at 11:00 AM. All are open for registration.',
  'what is my acwr': 'ACWR, or Acute:Chronic Workload Ratio, compares recent training load with your normal training baseline. A healthy range is usually around 0.8 to 1.3. If it stays too high, it can signal fatigue or increased injury risk. In CampusPulse, you should aim for a balanced load and consistent recovery.',
  'how do i register': 'To register: 1) Open the Tournaments page, 2) choose a tournament, 3) click Register Now, 4) select team or individual entry, 5) fill in the required details, and 6) submit the form. Outside-college events and college events are both supported.',
  'show upcoming tournaments': 'Upcoming tournaments include: Hyderabad Inter-College Basketball Cup, Vizag Community Football Festival, Telangana University Volleyball Series, and the Hyderabad City Open Tennis Cup. Registration is open for most of them.',
  'show live matches': 'Live matches currently feature the Hyderabad Inter-College Basketball Cup, the Vizag Community Football Festival, and the Telangana University Volleyball Series. Players can track match updates and registration status through the live app dashboard.',
  'help': 'CampusPulse can help with tournament discovery, registration guidance, match schedules, college sport events, outside-college events, and performance insights. Ask about matches, tournaments, ACWR, or registration.',
  'hello': 'Hello! I\'m CampusPulse AI. I can help with tournaments, college and community sports, registration help, and live event updates.',
  'college sports': 'CampusPulse supports college tournaments, university leagues, inter-college matches, and outside-college sports events across different regions.',
  'outside college': 'Outside-college tournaments are included in the app as regional and community events. You can browse them from the Tournaments page using the Outside College filter.',
};

const formatTournamentForClient = (item) => ({
  ...item,
  startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
  endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
  registrationDeadline: item.registrationDeadline ? new Date(item.registrationDeadline).toISOString() : null,
  teamCount: Number(item.teamCount || 0),
  maxTeams: Number(item.maxTeams || 8),
  minRosterSize: Number(item.minRosterSize || 1),
  maxRosterSize: Number(item.maxRosterSize || 8),
});

const fetchExternalTournaments = async () => {
  if (externalTournamentCache.expiresAt > Date.now()) return externalTournamentCache.items;
  const items = [];

  if (process.env.GOOGLE_CALENDAR_ID && process.env.GOOGLE_CALENDAR_API_KEY) {
    try {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}/events`);
      url.searchParams.set('key', process.env.GOOGLE_CALENDAR_API_KEY);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('timeMin', new Date().toISOString());
      const response = await fetch(url);
      const data = await response.json();
      for (const event of data.items || []) {
        const startDate = event.start?.dateTime || event.start?.date;
        items.push({ id: `google-calendar-${event.id}`, title: event.summary || 'Google Calendar tournament', sport: 'General Sports', eventType: 'Community', startDate, endDate: event.end?.dateTime || event.end?.date || startDate, teamCount: 0, maxTeams: 0, registrationStatus: 'open', status: 'upcoming', location: event.location || 'See Google Calendar', venue: event.location || 'See Google Calendar', organizer: 'Google Calendar', description: event.description || '', source: 'google-calendar' });
      }
    } catch (error) { console.error('Google Calendar sync failed:', error.message); }
  }

  if (process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID) {
    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', process.env.GOOGLE_CUSTOM_SEARCH_API_KEY);
      url.searchParams.set('cx', process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID);
      url.searchParams.set('q', process.env.TOURNAMENT_SEARCH_QUERY || 'sports tournaments Hyderabad Anurag University');
      const response = await fetch(url);
      const data = await response.json();
      for (const result of data.items || []) items.push({ id: `google-search-${encodeURIComponent(result.link)}`, title: result.title, sport: 'General Sports', eventType: 'Community', startDate: new Date(Date.now() + 86400000).toISOString(), endDate: new Date(Date.now() + 2 * 86400000).toISOString(), teamCount: 0, maxTeams: 0, registrationStatus: 'open', status: 'upcoming', location: 'Online source', venue: result.link, organizer: 'Google Custom Search', description: result.snippet || '', source: 'google-search', officialWebsite: result.link });
    } catch (error) { console.error('Google Custom Search sync failed:', error.message); }
  }

  if (process.env.SPORTS_PROVIDER_URL) {
    try {
      const response = await fetch(process.env.SPORTS_PROVIDER_URL);
      const data = await response.json();
      for (const item of (Array.isArray(data) ? data : data.tournaments || data.events || [])) items.push({ ...item, id: `sports-provider-${item.id || makeId('event')}`, source: 'sports-provider' });
    } catch (error) { console.error('Sports provider sync failed:', error.message); }
  }

  externalTournamentCache = { expiresAt: Date.now() + 60000, items };
  return items;
};

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.json({ reply: 'Please enter a valid message.' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const context = JSON.stringify({
        tournaments: tournaments.map(formatTournamentForClient),
        registrations: registrations.slice(-100),
      });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `You are CampusPulse sports assistant. Answer the user's question clearly and concisely. Use the live application data below when relevant. Do not invent registrations, scores, or tournament facts.\nLive data: ${context}\nUser question: ${message}` }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
        }),
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (response.ok && reply) return res.json({ reply, source: 'gemini' });
    } catch (error) {
      console.error('Gemini request failed:', error.message);
    }
  }

  const lowerMessage = message.toLowerCase();
  let reply = null;

  for (const [key, value] of Object.entries(chatResponses)) {
    if (lowerMessage.includes(key)) {
      reply = value;
      break;
    }
  }

  if (!reply) {
    if (lowerMessage.includes('schedule') || lowerMessage.includes('today') || lowerMessage.includes('when')) {
      const schedule = tournaments.slice(0, 5).map((item) => `${item.title} (${item.sport}) starts ${new Date(item.startDate).toLocaleString()} at ${item.venue}`).join('; ');
      reply = schedule ? `Here are the current tournament schedules: ${schedule}. Open Tournament Hub for full details and registration status.` : 'There are no tournament schedules available right now.';
    } else if (lowerMessage.includes('match') || lowerMessage.includes('tournament')) {
      reply = 'CampusPulse supports live matches, upcoming tournaments, college events, and outside-college competitions. You can browse all active events from the Tournaments and Matches screens.';
    } else if (lowerMessage.includes('register') || lowerMessage.includes('signup')) {
      reply = 'To register, open the Tournaments page, choose an event, and click Register Now. Select individual or team entry, fill out the required details, and submit the form.';
    } else if (lowerMessage.includes('performance') || lowerMessage.includes('acwr') || lowerMessage.includes('fitness')) {
      reply = 'Performance tracking in CampusPulse focuses on readiness, training load, ACWR, and recovery status. Keep training balanced and review your recent stats regularly.';
    } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
      reply = 'For training nutrition, eat a carbohydrate-rich meal 2–3 hours before practice, such as rice with dal, oats with fruit, or potatoes with eggs. Add a small fruit or yogurt snack 30–60 minutes before, drink water regularly, and include protein plus carbohydrates after training. Your Performance page has sport-specific calorie, protein, carbohydrate, fat, and hydration estimates. These are general guidelines, not medical advice.';
    } else {
      reply = `I can help with tournaments, schedules, registrations, live scores, nutrition, and player performance. Try asking about today's matches, upcoming tournaments, registration status, or a training and diet plan.`;
    }
  }

  res.json({ reply });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tournamentCount: tournaments.length, registrationCount: registrations.length });
});

app.get('/api/tournaments', async (req, res) => {
  const external = await fetchExternalTournaments();
  const unique = new Map([...tournaments, ...external].map((item) => [item.id, item]));
  const sorted = [...unique.values()].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  res.json({ source: 'unisport-backend', updatedAt: new Date().toISOString(), tournaments: sorted.map(formatTournamentForClient) });
});

app.get('/api/tournaments/:id', async (req, res) => {
  const external = await fetchExternalTournaments();
  const tournament = [...tournaments, ...external].find((item) => item.id === req.params.id);
  if (!tournament) {
    return res.status(404).json({ message: 'Tournament not found' });
  }
  res.json(formatTournamentForClient(tournament));
});

app.post('/api/tournaments', async (req, res) => {
  const payload = req.body || {};
  const nextTournament = {
    id: payload.id || makeId('live-tournament'),
    state: payload.state || 'Local',
    title: payload.title || 'New Tournament',
    sport: payload.sport || 'General Sports',
    eventType: payload.eventType || 'Outside College',
    startDate: payload.startDate || new Date(Date.now() + 86400000).toISOString(),
    endDate: payload.endDate || new Date(Date.now() + 2 * 86400000).toISOString(),
    teamCount: Number(payload.teamCount || 0),
    maxTeams: Number(payload.maxTeams || 8),
    registrationStatus: payload.registrationStatus || 'open',
    status: payload.status || 'upcoming',
    bannerColor: payload.bannerColor || '#2563eb',
    location: payload.location || 'TBD',
    venue: payload.venue || payload.location || 'TBD',
    organizer: payload.organizer || 'Live Sports Network',
    description: payload.description || 'New tournament added to the live registration board.',
    minRosterSize: Number(payload.minRosterSize || 1),
    maxRosterSize: Number(payload.maxRosterSize || 8),
    registrationDeadline: payload.registrationDeadline || new Date(Date.now() + 600000000).toISOString(),
  };

  tournaments.unshift(nextTournament);
  await db.run('INSERT INTO tournaments (id, payload) VALUES (?, ?)', [nextTournament.id, JSON.stringify(nextTournament)]);
  res.status(201).json(formatTournamentForClient(nextTournament));
});

app.post('/api/tournaments/:id/register', (req, res) => {
  const tournament = tournaments.find((item) => item.id === req.params.id);
  if (!tournament) {
    return res.status(404).json({ message: 'Tournament not found' });
  }

  if (tournament.registrationStatus !== 'open') {
    return res.status(400).json({ message: 'Registrations are closed for this tournament.' });
  }

  const currentCapacity = Number(tournament.teamCount || 0);
  const maxTeams = Number(tournament.maxTeams || 0);

  if (currentCapacity >= maxTeams) {
    return res.status(400).json({ message: 'This tournament has reached max capacity.' });
  }

  const body = req.body || {};
  const entry = {
    id: makeId('registration'),
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    userId: body.userId || 'guest-user',
    userEmail: body.userEmail || 'guest@local.test',
    registrationType: body.registrationType || 'team',
    teamName: body.teamName || 'Individual Entry',
    status: 'submitted',
    registrationNumber: `UP-${Date.now().toString().slice(-6)}`,
    submittedAt: new Date().toISOString(),
  };

  registrations.push(entry);
  tournament.teamCount = currentCapacity + 1;

  res.status(201).json({
    message: 'Registration submitted successfully',
    registration: entry,
    tournament: formatTournamentForClient(tournament)
  });
});

app.get('/api/registrations', (req, res) => {
  res.json(registrations);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, username, email, gender, dob, phoneNumber, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!String(name || '').trim() || !String(username || '').trim() || !String(gender || '').trim() || !String(dob || '').trim() || !String(phoneNumber || '').trim()) {
    return res.status(400).json({ message: 'Name, username, gender, date of birth, and phone number are required.' });
  }

  if (normalizedEmail !== ADMIN_EMAIL && !isValidAnuragUniversityEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'Only Anurag University college email addresses can be used.' });
  }

  if (trimmedPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existingUser) {
    return res.status(409).json({ message: 'This account already exists. Please log in with the same email and password.' });
  }

  const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
  const userId = `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const isAdminEmail = normalizedEmail === ADMIN_EMAIL;
  const newUser = createUserRecord({
    id: userId,
    email: normalizedEmail,
    password: hashedPassword,
    full_name: String(name).trim(),
    username: String(username).trim(),
    gender: String(gender).trim(),
    dob: String(dob).trim(),
    phone_number: String(phoneNumber).trim(),
    userType: isAdminEmail ? 'admin' : 'registered',
    institution: 'CampusPulse',
    sport: isAdminEmail ? 'Admin Console' : 'General Sports',
  });

  await db.run(
    'INSERT INTO users (id, email, password, full_name, username, gender, dob, phone_number, userType, institution, sport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newUser.id, newUser.email, newUser.password, newUser.full_name, newUser.username, newUser.gender, newUser.dob, newUser.phone_number, newUser.userType, newUser.institution, newUser.sport]
  );

  return res.status(201).json({ user: { ...newUser, password: undefined } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = String(password || '').trim();

  if (!normalizedEmail || !trimmedPassword) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (normalizedEmail !== ADMIN_EMAIL && !isValidAnuragUniversityEmail(normalizedEmail)) {
    return res.status(401).json({ message: 'Use your Anurag University college email and password.' });
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const safeUser = {
    ...user,
    password: undefined,
    userType: user.userType || (user.email === ADMIN_EMAIL ? 'admin' : 'registered'),
  };

  await db.run(
    'INSERT INTO login_events (id, email, full_name, userType, login_time) VALUES (?, ?, ?, ?, ?)',
    [`event-${Date.now()}-${Math.random().toString(16).slice(2,8)}`, safeUser.email, safeUser.full_name, safeUser.userType, new Date().toISOString()]
  );

  return res.json({ user: safeUser });
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, email, full_name, userType, institution, sport, created_at FROM users ORDER BY created_at DESC');
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load users.' });
  }
});

app.get('/api/auth/login-logs', async (req, res) => {
  try {
    const logs = await db.all('SELECT id, email, full_name, userType, login_time FROM login_events ORDER BY login_time DESC LIMIT 200');
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load login logs.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Live sports API running on http://localhost:${PORT}`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`Tournaments endpoint: http://localhost:${PORT}/api/tournaments`);
  console.log(`Auth endpoint: http://localhost:${PORT}/api/auth/register`);
});
