import { createClientFromRequest } from '@base44/sdk';

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const userMessage = body.message || '';
    if (!userMessage || userMessage.length > 500) {
      return Response.json({ error: 'A message (max 500 chars) is required.' }, { status: 400 });
    }

    // Gather platform context for the LLM: today's matches, upcoming tournaments, user's biometrics
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const [matches, tournaments, biometrics] = await Promise.all([
      base44.asServiceRole.entities.Match.list('-scheduledDate', 50),
      base44.asServiceRole.entities.Tournament.list('-startDate', 30),
      base44.asServiceRole.entities.Biometric.filter({ userId: user.id }, '-date', 14)
    ]);

    const todaysMatches = matches.filter(m => (m.scheduledDate || '').slice(0, 10) === todayStr);
    const liveMatches = matches.filter(m => m.status === 'live');
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
    const openTournaments = tournaments.filter(t => t.registrationStatus === 'open');
    const recentBio = biometrics[0];

    const contextBlock = [
      `CURRENT USER: ${user.full_name || user.email} (id: ${user.id})`,
      `CURRENT DATE: ${now.toISOString()}`,
      `TODAY'S MATCHES (${todaysMatches.length}):`,
      ...todaysMatches.map(m => `- ${m.homeTeamName} vs ${m.awayTeamName} | ${m.sport} | ${m.status} | ${m.scheduledDate}`),
      `LIVE MATCHES (${liveMatches.length}):`,
      ...liveMatches.map(m => `- ${m.homeTeamName} ${m.homeScore} - ${m.awayScore} ${m.awayTeamName} | ${m.currentPeriod || m.status}`),
      `UPCOMING TOURNAMENTS (${upcomingTournaments.length}):`,
      ...upcomingTournaments.slice(0, 8).map(t => `- ${t.title} | ${t.sport} | ${t.eventType} | starts ${t.startDate} | ${t.venue}`),
      `REGISTRATION OPEN (${openTournaments.length}):`,
      ...openTournaments.slice(0, 6).map(t => `- ${t.title} | deadline ${t.registrationDeadline}`),
      recentBio
        ? `USER LATEST BIOMETRIC: readiness ${recentBio.readinessScore}, ACWR ${recentBio.acwr} (${recentBio.acwrStatus}), acute ${recentBio.acuteLoad}, chronic ${recentBio.chronicLoad}, training load ${recentBio.trainingLoad}`
        : 'USER LATEST BIOMETRIC: none recorded yet'
    ].join('\n');

    const systemPrompt = `You are the AI assistant for a college & community sports platform. You help users find tournaments, matches, teams, schedules, registration help, rules, nutrition estimates, and training-load (ACWR) explanations.

You have access to live platform data below. Use it to answer concretely. If the data doesn't cover the question, say so honestly and suggest where to look.

IMPORTANT RULES:
- Never diagnose injuries or medical conditions.
- Never give medical advice. Nutrition and workload figures are estimates, not medical advice.
- For ACWR above 1.5, remind the user to review recovery and training volume with their coach or a qualified sports professional.
- Keep answers concise, friendly, and actionable. Use bullet points where helpful.
- If asked about registration, explain the flow: find tournament -> register as individual or team -> add roster -> submit -> track status (draft/submitted/under_review/approved/rejected).

PLATFORM DATA:
${contextBlock}`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUSER QUESTION: ${userMessage}`,
      model: 'gpt_5_mini'
    });

    const llmOutput = typeof llmRes === 'object' && llmRes !== null
      ? llmRes as { output?: unknown; reply?: unknown }
      : null;
    const reply = typeof llmRes === 'string'
      ? llmRes
      : String(llmOutput?.output || llmOutput?.reply || JSON.stringify(llmRes));
    return Response.json({ reply });
  } catch (error) {
    console.error('sportsChat error:', error);
    // Provide a helpful fallback response
    const fallbackReplies = [
      "I'm having trouble connecting to the AI service. However, I can help you navigate the platform! Try browsing tournaments, checking today's matches, or viewing your performance dashboard.",
      "The AI service is temporarily unavailable, but you can still explore tournaments, view matches, and check your athletic stats. Feel free to try again in a moment!",
      "I couldn't reach the AI service right now. You can still access all platform features through the main navigation. Try again shortly!"
    ];
    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return Response.json({
      reply: randomFallback,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 200 });
  }
}