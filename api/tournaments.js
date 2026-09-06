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

const formatTournament = (item) => ({
  ...item,
  startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
  endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
  registrationDeadline: item.registrationDeadline ? new Date(item.registrationDeadline).toISOString() : null,
  teamCount: Number(item.teamCount || 0),
  maxTeams: Number(item.maxTeams || 8),
  minRosterSize: Number(item.minRosterSize || 1),
  maxRosterSize: Number(item.maxRosterSize || 8),
});

export default function handler(req, res) {
  const { method, query } = req;

  if (method === 'GET') {
    const id = query.id;

    if (id) {
      const tournament = seedTournaments.find((item) => item.id === id);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      return res.status(200).json(formatTournament(tournament));
    }

    return res.status(200).json(seedTournaments.map(formatTournament));
  }

  if (method === 'POST') {
    return res.status(200).json({
      message: 'Tournament registration endpoint is ready for deployment.',
      received: req.body || {},
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
