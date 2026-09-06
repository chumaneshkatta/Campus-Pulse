const atLocalTime = (dayOffset, hours, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const demoMatches = () => [
  { id: 'demo-match-today-ts', state: 'Telangana', sport: 'Basketball', matchType: 'college', status: 'scheduled', scheduledDate: atLocalTime(0, 18), homeTeamName: 'Hyderabad Hoopers', awayTeamName: 'Warangal Warriors', homeTeamColor: '#2563eb', awayTeamColor: '#dc2626', venue: 'Gachibowli Indoor Stadium, Hyderabad', tournamentTitle: 'Telangana Inter-College League' },
  { id: 'demo-match-today-ap', state: 'Andhra Pradesh', sport: 'Football', matchType: 'community', status: 'scheduled', scheduledDate: atLocalTime(0, 20), homeTeamName: 'Vizag Mariners', awayTeamName: 'Vijayawada United', homeTeamColor: '#059669', awayTeamColor: '#7c3aed', venue: 'Port Stadium, Visakhapatnam', tournamentTitle: 'Andhra Community Cup' },
  { id: 'demo-match-tomorrow-ts', state: 'Telangana', sport: 'Volleyball', matchType: 'college', status: 'scheduled', scheduledDate: atLocalTime(1, 17, 30), homeTeamName: 'Nizam Aces', awayTeamName: 'Kakatiya Titans', homeTeamColor: '#ea580c', awayTeamColor: '#0891b2', venue: 'LB Stadium, Hyderabad', tournamentTitle: 'Telangana University Series' },
  { id: 'demo-match-tomorrow-ap', state: 'Andhra Pradesh', sport: 'Cricket', matchType: 'college', status: 'scheduled', scheduledDate: atLocalTime(1, 16), homeTeamName: 'Tirupati Chargers', awayTeamName: 'Guntur Panthers', homeTeamColor: '#0f766e', awayTeamColor: '#be123c', venue: 'ACA Stadium, Mangalagiri', tournamentTitle: 'Andhra College Cricket Cup' },
  { id: 'demo-match-day-3', state: 'Telangana', sport: 'Badminton', matchType: 'college', status: 'scheduled', scheduledDate: atLocalTime(2, 15), homeTeamName: 'Hyderabad Smashers', awayTeamName: 'Karimnagar Racquets', homeTeamColor: '#4338ca', awayTeamColor: '#c2410c', venue: 'Saroornagar Indoor Stadium', tournamentTitle: 'Telangana Campus Games' },
  { id: 'demo-match-day-4', state: 'Andhra Pradesh', sport: 'Kabaddi', matchType: 'community', status: 'scheduled', scheduledDate: atLocalTime(3, 18, 30), homeTeamName: 'Nellore Raiders', awayTeamName: 'Kakinada Kings', homeTeamColor: '#b91c1c', awayTeamColor: '#047857', venue: 'Indira Gandhi Municipal Stadium, Vijayawada', tournamentTitle: 'Andhra Community Sports Meet' },
  { id: 'demo-match-day-5', state: 'Telangana', sport: 'Football', matchType: 'college', status: 'scheduled', scheduledDate: atLocalTime(4, 19), homeTeamName: 'Medak Mavericks', awayTeamName: 'Secunderabad Stars', homeTeamColor: '#1d4ed8', awayTeamColor: '#a21caf', venue: 'Gymkhana Ground, Secunderabad', tournamentTitle: 'Telangana Inter-College League' },
];

export const demoAcademicSchedule = (userId = 'local-demo-user') => [
  { id: 'demo-class-today', state: 'Telangana', userId, title: 'Sports Psychology Class', type: 'class', scheduledDate: atLocalTime(0, 10), duration: 60 },
  { id: 'demo-assignment-tomorrow', state: 'Andhra Pradesh', userId, title: 'Training Journal Submission', type: 'assignment', scheduledDate: atLocalTime(1, 16), duration: 30 },
  { id: 'demo-class-next', state: 'Telangana', userId, title: 'Performance Analysis Seminar', type: 'class', scheduledDate: atLocalTime(2, 11), duration: 90 },
  { id: 'demo-exam-day-4', state: 'Andhra Pradesh', userId, title: 'Sports Management Assessment', type: 'exam', scheduledDate: atLocalTime(3, 10), duration: 120 },
  { id: 'demo-deadline-day-5', state: 'Telangana', userId, title: 'Athlete Wellness Report', type: 'deadline', scheduledDate: atLocalTime(4, 17), duration: 30 },
];

export const demoPracticeSchedule = (userId = 'local-demo-user') => [
  { id: 'demo-practice-today', state: 'Telangana', userId, title: 'Team Practice - Shooting Drills', type: 'practice', scheduledDate: atLocalTime(0, 17), duration: 90, venue: 'Gachibowli Arena, Hyderabad', intensity: 'high' },
  { id: 'demo-gym-tomorrow', state: 'Andhra Pradesh', userId, title: 'Strength & Conditioning', type: 'gym', scheduledDate: atLocalTime(1, 18), duration: 60, venue: 'Sports Complex, Visakhapatnam', intensity: 'medium' },
  { id: 'demo-recovery-next', state: 'Telangana', userId, title: 'Recovery Session', type: 'recovery', scheduledDate: atLocalTime(2, 9), duration: 45, venue: 'Physio Room, Hyderabad', intensity: 'low' },
  { id: 'demo-meeting-day-4', state: 'Andhra Pradesh', userId, title: 'Team Meeting - Match Strategy', type: 'team_meeting', scheduledDate: atLocalTime(3, 16), duration: 30, venue: 'Sports Complex, Visakhapatnam', intensity: 'low' },
  { id: 'demo-practice-day-5', state: 'Telangana', userId, title: 'Team Practice - Match Preparation', type: 'practice', scheduledDate: atLocalTime(4, 18), duration: 90, venue: 'Gymkhana Ground, Secunderabad', intensity: 'high' },
];

export const demoTournaments = () => [
  { id: 'demo-tournament-1', state: 'Telangana', title: 'Hyderabad Inter-College Basketball Cup', sport: 'Basketball', eventType: 'Inter-College', startDate: atLocalTime(0, 9), teamCount: 8, maxTeams: 16, registrationStatus: 'open', status: 'upcoming', bannerColor: '#1d4ed8', location: 'Hyderabad', organizer: 'Hyderabad Sports Council', venue: 'Gachibowli Indoor Arena', description: 'Annual inter-college basketball competition for university teams across Telangana.' },
  { id: 'demo-tournament-2', state: 'Andhra Pradesh', title: 'Vizag Community Football Festival', sport: 'Football', eventType: 'Community', startDate: atLocalTime(1, 10), teamCount: 12, maxTeams: 16, registrationStatus: 'open', status: 'upcoming', bannerColor: '#059669', location: 'Visakhapatnam', organizer: 'Vizag Community League', venue: 'Beachside Sports Ground', description: 'Community football challenge for local clubs and resident teams.' },
  { id: 'demo-tournament-3', state: 'Telangana', title: 'Telangana University Volleyball Series', sport: 'Volleyball', eventType: 'University', startDate: atLocalTime(2, 9), teamCount: 6, maxTeams: 12, registrationStatus: 'open', status: 'upcoming', bannerColor: '#7c3aed', location: 'Warangal', organizer: 'Telangana University Sports Board', venue: 'Warangal University Stadium', description: 'University volleyball season opener with open team registration.' },
  { id: 'demo-tournament-4', state: 'Andhra Pradesh', title: 'Andhra College Cricket Cup', sport: 'Cricket', eventType: 'Inter-College', startDate: atLocalTime(3, 8), teamCount: 10, maxTeams: 16, registrationStatus: 'open', status: 'upcoming', bannerColor: '#ea580c', location: 'Mangalagiri', organizer: 'Andhra Sports Association', venue: 'ACA Cricket Grounds', description: 'Inter-college cricket tournament across colleges in Andhra Pradesh.' },
  { id: 'demo-tournament-5', state: 'Telangana', title: 'Secunderabad Badminton Open', sport: 'Badminton', eventType: 'Open League', startDate: atLocalTime(4, 10), teamCount: 20, maxTeams: 32, registrationStatus: 'open', status: 'upcoming', bannerColor: '#0891b2', location: 'Secunderabad', organizer: 'Hyderabad Open League', venue: 'Secunderabad Indoor Courts', description: 'Open badminton league open to club and college players.' },
  { id: 'demo-tournament-6', state: 'Andhra Pradesh', title: 'Andhra Kabaddi Challenge', sport: 'Kabaddi', eventType: 'Community', startDate: atLocalTime(4, 16), teamCount: 10, maxTeams: 16, registrationStatus: 'open', status: 'upcoming', bannerColor: '#be123c', location: 'Vijayawada', organizer: 'South India Sports League', venue: 'Vijayawada Arena', description: 'Community kabaddi tournament featuring regional clubs and student teams.' },
  { id: 'outside-tournament-1', state: 'Telangana', title: 'Hyderabad City Open Tennis Cup', sport: 'Tennis', eventType: 'Outside College', startDate: atLocalTime(5, 11), teamCount: 6, maxTeams: 12, registrationStatus: 'open', status: 'upcoming', bannerColor: '#f59e0b', location: 'Hyderabad', organizer: 'City Sports Club', venue: 'Banjara Hills Tennis Courts', description: 'Open tournament for outside college players and local clubs.' },
  { id: 'outside-tournament-2', state: 'Andhra Pradesh', title: 'Vijayawada Open 7s Rugby Weekend', sport: 'Rugby', eventType: 'Outside College', startDate: atLocalTime(6, 12), teamCount: 5, maxTeams: 10, registrationStatus: 'open', status: 'upcoming', bannerColor: '#2563eb', location: 'Vijayawada', organizer: 'Rugby South Asia', venue: 'Gannavaram Sports Complex', description: 'Regional open rugby weekend for club and non-college teams.' },
];

export const LIVE_TOURNAMENTS_KEY = 'unisport_live_tournaments';
export const LIVE_REGISTRATIONS_KEY = 'unisport_live_registrations';

export const normalizeTournament = (tournament = {}) => ({
  ...tournament,
  id: tournament.id || `tournament-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  eventType: tournament.eventType || 'Inter-College',
  title: tournament.title || 'Untitled Tournament',
  sport: tournament.sport || 'General Sports',
  teamCount: Number(tournament.teamCount || 0),
  maxTeams: Number(tournament.maxTeams || 8),
  registrationStatus: tournament.registrationStatus || 'open',
  status: tournament.status || 'upcoming',
  location: tournament.location || 'TBD',
  venue: tournament.venue || tournament.location || 'TBD',
  organizer: tournament.organizer || 'Community Sports Board',
  description: tournament.description || 'Live tournament entry created by the app.'
});

export const getLiveTournaments = () => {
  if (typeof window === 'undefined') return demoTournaments();

  try {
    const stored = JSON.parse(window.localStorage.getItem(LIVE_TOURNAMENTS_KEY) || '[]');
    const merged = [...demoTournaments(), ...stored].reduce((acc, item) => {
      const tournament = normalizeTournament(item);
      const existing = acc.findIndex(entry => entry.id === tournament.id);
      if (existing >= 0) {
        acc[existing] = { ...acc[existing], ...tournament };
      } else {
        acc.push(tournament);
      }
      return acc;
    }, []);

    const sorted = merged.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
    window.localStorage.setItem(LIVE_TOURNAMENTS_KEY, JSON.stringify(sorted));
    return sorted;
  } catch (error) {
    console.error('Unable to read live tournaments', error);
    return demoTournaments();
  }
};

export const setLiveTournaments = (tournaments = []) => {
  if (typeof window === 'undefined') return tournaments;

  const normalized = (Array.isArray(tournaments) ? tournaments : []).map(normalizeTournament);
  window.localStorage.setItem(LIVE_TOURNAMENTS_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('unisport:tournaments:updated'));
  return normalized;
};

export const getRegisteredEntries = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LIVE_REGISTRATIONS_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

export const saveRegistrationEntry = (entry) => {
  if (typeof window === 'undefined') return entry;

  const entries = getRegisteredEntries();
  const nextEntries = [...entries, entry];
  window.localStorage.setItem(LIVE_REGISTRATIONS_KEY, JSON.stringify(nextEntries));
  return nextEntries;
};

export const demoBiometrics = (userId = 'local-demo-user') => {
  const daily = [
    { load: 46, readiness: 68, sleep: 7.2, heartRate: 64, distance: 4.8, intensity: 58 },
    { load: 58, readiness: 72, sleep: 7.7, heartRate: 62, distance: 6.1, intensity: 66 },
    { load: 41, readiness: 77, sleep: 8.1, heartRate: 60, distance: 3.9, intensity: 48 },
    { load: 69, readiness: 70, sleep: 7.0, heartRate: 65, distance: 7.4, intensity: 76 },
    { load: 55, readiness: 74, sleep: 7.6, heartRate: 61, distance: 5.6, intensity: 64 },
  ];

  return daily.map((day, index) => ({
    id: `demo-biometric-${index}`,
    userId,
    date: atLocalTime(index - 4, 12),
    trainingLoad: day.load,
    readinessScore: day.readiness,
    sleepHours: day.sleep,
    heartRateAvg: day.heartRate,
    distanceKm: day.distance,
    sessionIntensity: day.intensity,
    acuteLoad: 324,
    chronicLoad: 302,
    acwr: 1.07,
    acwrStatus: 'normal',
    caloriesTarget: Math.round(2100 + day.load * 5),
    proteinTarget: 112,
    carbsTarget: Math.round(280 + day.load * 0.7),
    fatTarget: 63,
    hydrationTarget: (2.5 + day.distance * 0.15).toFixed(1),
  }));
};

export const demoNotifications = (userId = 'local-demo-user') => [
  { id: 'demo-notification-registration', userId, type: 'registration', title: 'Registrations are open', message: 'New college and community tournaments are available in Tournament Hub.', isRead: false, created_date: new Date().toISOString() },
  { id: 'demo-notification-performance', userId, type: 'workload_alert', title: 'Performance check-in', message: 'Review your readiness, recovery, nutrition, and sport targets today.', isRead: true, created_date: new Date(Date.now() - 7200000).toISOString() },
];
