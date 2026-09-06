import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Send, Loader2, MessageCircle, Mic, MicOff } from 'lucide-react';

const suggestions = [
  "Show today's matches",
  "What is my ACWR?",
  "How do I register?",
  "My profile",
  "News and updates",
  "Training programs",
  "Promotions and offers",
  "Community events",
  "FAQs",
  "Social features",
  "Notifications",
  "Account settings",
  "Player stats",
  "Leaderboards",
  "Merchandise",
  "Blog and guides",
  "Rewards program",
  "Social media",
];

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm CampusPulse AI. 🎯 I can help with live matches, tournaments, registrations, performance insights, college sports, and local event updates. What do you want to know?" }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          setInput(interimTranscript);
        }
      };
    }
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || sending) return;
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    
    try {
      // Try to call backend server
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const serverReply = data.reply || data.message || '';
      const reply = serverReply.includes('configure GEMINI_API_KEY')
        ? 'I can answer questions about tournaments, schedules, registrations, live scores, nutrition, and player performance. Try asking about today\'s matches, upcoming tournaments, or a training and diet plan.'
        : serverReply || 'Sorry, I could not process that.';
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      // Fallback: Use comprehensive mock responses when server is not available
      console.warn('Backend unavailable, using mock responses:', e.message);
      
      const mockResponses = {
        'show today\'s matches': `📅 TODAY'S MATCHES (September 1, 2026)

🏀 BASKETBALL
• Pro Arena vs Tech Warriors | 3:00 PM | Court A
• State Champions vs City League | 5:30 PM | Court B

⚽ SOCCER
• Regional FC vs District United | 2:00 PM | Field 1
• College Cup vs Campus Rivals | 4:00 PM | Field 2

🏈 FOOTBALL
• Alpha Blazers vs Beta Strikers | 7:00 PM | Stadium A

🎾 TENNIS
• Singles Qualifier Round 1 | 10:00 AM | Tennis Courts
• Doubles Tournament | 2:00 PM | Tennis Courts`,

        'show live matches': `🔴 LIVE MATCHES NOW

🏀 Basketball - Pro Arena 45-38 Tech Warriors (2nd Quarter, 6:23)
⚽ Soccer - Regional FC 2-1 District United (2nd Half, 32:15)
🏈 Football - Alpha Blazers 14-10 Beta Strikers (2nd Quarter)`,

        'what is my acwr': `📊 YOUR PERFORMANCE METRICS

ACWR (Acute:Chronic Workload Ratio): 0.8
Status: ✅ HEALTHY

Recent Biometrics:
• Training Load: 145 pts
• Acute Load (7 days): 98 pts
• Chronic Load (28 days): 122 pts
• Readiness Score: 7.2/10
• Recovery Status: Good

📌 What is ACWR?
Acute:Chronic Workload Ratio measures the balance between recent training volume and long-term training load.
• 0.8-1.3: Optimal
• >1.5: High risk of injury/fatigue
• <0.8: Under-training

💡 Recommendation: Your training load is well-balanced. Continue monitoring!`,

        'show upcoming tournaments': `🏆 UPCOMING TOURNAMENTS

📌 SEPTEMBER 2026

1. Basketball Championship 
   📅 Sept 15-22 | 🏀 Basketball
   📍 Arena Sports Complex
   👥 64 Teams | Registration OPEN
   💰 Entry Fee: $500/team

2. Football League Season
   📅 Sept 20 - Nov 15 | 🏈 Football  
   📍 Multiple Stadiums
   👥 32 Teams | Registration OPEN
   💰 Entry Fee: $750/team

3. Tennis Open Tournament
   📅 Sept 25-Oct 2 | 🎾 Tennis
   📍 Tennis Academy Courts
   👥 Individual & Doubles | Registration OPEN
   💰 Entry Fee: $100 individual, $150 doubles

4. Soccer Cup Competition
   📅 Sept 28 - Oct 12 | ⚽ Soccer
   📍 Central Sports Park
   👥 48 Teams | Registration Opens Sept 5
   💰 Entry Fee: $600/team`,

        'how do i register': `📝 REGISTRATION GUIDE

STEP-BY-STEP PROCESS:

1️⃣ BROWSE TOURNAMENTS
   • Go to "Tournaments" page
   • View all available events
   • Check eligibility requirements

2️⃣ SELECT TOURNAMENT & TYPE
   • Choose event date & sport
   • Decide: Individual or Team registration

3️⃣ FILL REGISTRATION FORM
   • Personal/Team Information
   • Contact Details
   • Jersey Numbers & Positions

4️⃣ ADD ROSTER (if team)
   • Add team members
   • Each member: name, DOB, contact
   • Assign positions & numbers

5️⃣ REVIEW & SUBMIT
   • Check all details
   • Accept terms & conditions
   • Complete payment

6️⃣ TRACK STATUS
   Status stages:
   • Draft → Submitted → Under Review → Approved

⏱️ Registration Deadline: Usually 7 days before event
💳 Payment Methods: Credit Card, Debit Card, Bank Transfer`,

        'show my teams': `👥 YOUR TEAMS

1. CITY BLAZERS
   Sport: Basketball
   Members: 12
   Status: Active
   Tournaments: 3 upcoming

2. DISTRICT WARRIORS  
   Sport: Soccer
   Members: 18
   Status: Active
   Tournaments: 2 upcoming

3. CAMPUS LEGENDS
   Sport: Football
   Members: 25
   Status: Active
   Tournaments: 4 upcoming`,

        'team performance': `📈 TEAM PERFORMANCE STATISTICS

CITY BLAZERS (Basketball)
• Win Rate: 72%
• Matches Played: 18
• Wins: 13 | Losses: 5
• Points Per Game: 82.5
• Last Match: Win 78-65 vs Regional FC

DISTRICT WARRIORS (Soccer)
• Win Rate: 65%
• Matches Played: 23
• Wins: 15 | Losses: 8
• Goals For: 52 | Against: 28
• Last Match: Win 3-1 vs City United

CAMPUS LEGENDS (Football)
• Win Rate: 68%
• Matches Played: 19
• Wins: 13 | Losses: 6
• Points For: 312 | Against: 201
• Last Match: Loss 21-24 vs Regional Strikers`,

        'training schedule': `📅 TRAINING SCHEDULE

WEEK OF SEPT 1-7

CITY BLAZERS (Basketball)
• Monday: 6:00 PM - Conditioning & Drills (Court A)
• Wednesday: 7:00 PM - Team Practice (Court A)
• Friday: 6:30 PM - Scrimmage (Court B)
• Saturday: 10:00 AM - Strength & Conditioning

DISTRICT WARRIORS (Soccer)
• Tuesday: 6:00 PM - Field Practice (Field 1)
• Thursday: 7:00 PM - Tactical Drills (Field 2)
• Saturday: 4:00 PM - Game Simulation
• Sunday: 10:00 AM - Recovery & Analysis

CAMPUS LEGENDS (Football)
• Monday: 7:00 PM - Offense Practice
• Wednesday: 7:00 PM - Defense Practice
• Thursday: 7:00 PM - Full Team Practice
• Saturday: 6:00 PM - Game Preparation`,

        'nutrition info': `🥗 NUTRITION GUIDE FOR ATHLETES

PRE-GAME (2-3 hours before)
✓ Carbohydrates: Pasta, Rice, Bread
✓ Protein: Chicken, Fish, Eggs
✓ Avoid: High fiber, High fat foods
✓ Hydration: 500-750ml water

DURING GAME (every 30-45 min)
✓ Sports drinks (6-8% carbs)
✓ Water: 150-250ml
✓ Energy gels (if >90 min event)

POST-GAME (within 30 min)
✓ Protein: 20-40g
✓ Carbs: 1-1.2g per kg body weight
✓ Fluids: 150% of weight lost in sweat
✓ Examples: Protein shake, Chocolate milk

DAILY NUTRITION
• Calories: 2500-3500 (varies by sport)
• Protein: 1.6-2g per kg body weight
• Carbs: 5-7g per kg body weight
• Fats: 20-35% of total calories`,

        'rules and regulations': `⚖️ RULES & REGULATIONS

BASKETBALL
• 5 players per side
• Match: 4 quarters × 10 min (quarters vary)
• Foul limit: 6 personal fouls
• Shot clock: 24 seconds

SOCCER
• 11 players per side
• Match: 2 halves × 45 min
• Offside rule applies
• Yellow/Red cards for penalties

FOOTBALL
• 11 players per side
• Match: 4 quarters × 12 min
• Touchdowns: 6 pts, Field Goal: 3 pts
• 4 downs to advance 10 yards

TENNIS
• Singles: Best of 3 sets
• Doubles: Best of 3 sets
• Scoring: 0, 15, 30, 40, Game
• Tiebreak at 6-6 sets`,

        'injury prevention': `🏥 INJURY PREVENTION TIPS

WARM-UP (10-15 min)
✓ Light cardio: Jogging, jumping jacks
✓ Dynamic stretching
✓ Sport-specific movements
✓ Gradually increase intensity

DURING ACTIVITY
✓ Maintain proper technique
✓ Stay hydrated
✓ Monitor ACWR levels
✓ Use proper equipment

COOL-DOWN (5-10 min)
✓ Light movement
✓ Static stretching
✓ Foam rolling
✓ Recovery breathing

RECOVERY
✓ Sleep: 7-9 hours daily
✓ Ice bath (for high-intensity)
✓ Massage therapy
✓ Adequate nutrition
✓ Rest days: 1-2 per week

⚠️ Stop if you experience:
• Sharp or persistent pain
• Swelling or bruising
• Loss of range of motion
• Consult a sports physician`,

        'player stats': `👤 PLAYER STATISTICS

CURRENT SEASON PERFORMANCE

Basketball Players:
• Player #23 (Guard): 18.5 PPG, 5.2 APG, 2.1 SPG
• Player #14 (Forward): 15.2 PPG, 8.3 RPG, 1.8 BPG
• Player #5 (Center): 12.8 PPG, 10.2 RPG, 2.3 BPG
• Player #32 (Guard): 11.5 PPG, 4.8 APG, 1.5 SPG

Soccer Players:
• Player #7 (Forward): 8 goals, 3 assists in 12 matches
• Player #10 (Midfielder): 2 goals, 6 assists in 12 matches
• Player #4 (Defender): 1 goal, 40 tackles in 12 matches

Football Players:
• Player #12 (QB): 2,450 passing yards, 18 TDs, 5 INTs
• Player #1 (RB): 1,240 rushing yards, 12 TDs
• Player #89 (WR): 65 catches, 1,050 yards, 8 TDs`,

        'leaderboards': `🏅 LEADERBOARDS - CURRENT SEASON

SCORING LEADERS (Basketball)
1. 🥇 Alex Johnson (City Blazers) - 22.5 PPG
2. 🥈 Mike Turner (District Warriors) - 20.1 PPG
3. 🥉 Chris Lee (Campus Legends) - 18.8 PPG

TOURNAMENT WINNERS
1. 🥇 Basketball Pro League - City Blazers (2 titles)
2. 🥈 Soccer Championship - District Warriors (1 title)
3. 🥉 Football Cup - Campus Legends (1 title)

TOP TEAMS BY WIN RATE
1. City Blazers - 72% (13-5)
2. Campus Legends - 68% (13-6)
3. District Warriors - 65% (15-8)

MOST IMPROVED PLAYER
🌟 Sarah Kim - +15% performance improvement this season`,

        'venues': `🏟️ SPORTS VENUES & FACILITIES

Arena Sports Complex
📍 123 Sports Avenue, Downtown
🏀 Basketball: 2 courts, Capacity 5,000
🎾 Tennis: 8 courts, Lights available
Amenities: Locker rooms, Cafeteria, Parking (500 spaces)

Central Sports Park
📍 456 Park Road, Midtown
⚽ Soccer: 3 full-size fields, 1 practice field
🏈 Football: 1 stadium, Capacity 8,000
Amenities: Medical center, VIP lounge, Media room

Tennis Academy
📍 789 Court Street, Suburbs
🎾 Tennis: 12 professional courts
Amenities: Pro shop, Coaching facilities, Climate control

Multiple Recreation Centers
📍 Various locations across city
Multi-sport facilities for community events`,

        'coaches': `👨‍🏫 COACHING STAFF

City Blazers (Basketball)
Head Coach: Coach Michael Roberts
🎓 Experience: 20 years | 150+ wins
Assistants: Coach Sarah Williams, Coach Tom Davis

District Warriors (Soccer)
Head Coach: Coach David Martinez  
🎓 Experience: 15 years | 200+ matches
Assistants: Coach Elena Gonzalez, Coach James Wilson

Campus Legends (Football)
Head Coach: Coach Robert Anderson
🎓 Experience: 18 years | State Champion (2023)
Assistants: Coach Lisa Brown, Coach Kevin White

Specialist Coaches:
• Strength & Conditioning: Coach Tony Smith
• Mental Performance: Coach Dr. Rachel Green
• Sports Medicine: Dr. John Peterson`,

        'event history': `📜 EVENT HISTORY & ACHIEVEMENTS

RECENT VICTORIES
✅ City Blazers defeated Regional FC 78-65 (Sept 1)
✅ District Warriors won 3-1 vs City United (Aug 30)
✅ Campus Legends beat Downtown Strikers 24-21 (Aug 28)

PAST TOURNAMENTS WON
🏆 2026 Spring Basketball Championship - City Blazers
🏆 2025 Fall Soccer League - District Warriors  
🏆 2025 Championship Finals - Campus Legends

UPCOMING EVENTS
🔜 Basketball Championship (Sept 15-22)
🔜 Football League (Sept 20 - Nov 15)
🔜 Tennis Open (Sept 25 - Oct 2)`,

        'achievements': `🌟 PLAYER ACHIEVEMENTS & BADGES

City Blazers Players:
🏅 MVP Award - Alex Johnson (2x)
🏅 All-Star Selection - Mike Chen, David Lee
🏅 Best Defender - Marcus Johnson
🏅 Rookie of Year - Fresh Graduate

District Warriors Players:
🏅 Most Assists - Patricia Wong
🏅 Perfect Attendance - All players (2026)
🏅 Team Chemistry Award - Entire roster

Campus Legends Players:
🏅 Leadership Award - Captain James
🏅 Improvement Award - Chris Martinez
🏅 Loyalty Award - 5+ year players

Special Badges:
⭐ Century Club (100+ matches played)
⭐ Hall of Fame (10+ tournament wins)
⭐ Perfect Season (Undefeated in season)`,

        'billing': `💳 BILLING & PAYMENT INFORMATION

SUBSCRIPTION PLANS

Premium Team Plan - $299/month
✓ Unlimited tournament entries
✓ Priority booking
✓ Team analytics dashboard
✓ Coach portal access
✓ Priority support

Standard Team Plan - $99/month
✓ 12 tournament entries/year
✓ Basic analytics
✓ Email support

Individual Player - $19/month
✓ Personal stats tracking
✓ Event registration
✓ Performance insights

RECENT CHARGES
Sept 1: Premium Team Plan Renewal - $299.00 ✓ Paid
Aug 1: Premium Team Plan Renewal - $299.00 ✓ Paid
July 1: Tournament Registration (Basketball) - $500.00 ✓ Paid

PAYMENT METHODS
💳 Credit Card: Visa ending in 4242
💳 Backup: MasterCard ending in 5555

BILLING HISTORY
View detailed invoices, download receipts, manage subscriptions`,

        'support': `📞 CUSTOMER SUPPORT & CONTACT

HELP CENTER
🔗 Visit: help.proarena.com
📚 FAQ Database with 500+ articles
🎥 Video tutorials
📖 User guides

CONTACT OPTIONS
📧 Email: support@proarena.com (Response: 24 hours)
💬 Live Chat: Available 9 AM - 6 PM (Mon-Fri)
📞 Phone: 1-800-PRO-ARENA (1-800-776-2732)
📱 WhatsApp: +1-555-123-4567

COMMON ISSUES
❓ Registration troubleshooting
❓ Payment issues
❓ Account setup
❓ Tournament rules clarification
❓ Technical problems

ESCALATION
🚨 Urgent issues: emergency@proarena.com
👥 Dedicated account manager for premium members`,

        'weather': `🌤️ MATCH DAY WEATHER FORECAST

Today (Sept 1, 2026)

Basketball Championship (Indoor - No weather impact)
🏀 Court A: Climate Controlled ✓

Soccer Matches (Outdoor)
⚽ Field 1: 72°F, Sunny ☀️, Light breeze (5 mph)
⚽ Field 2: 72°F, Sunny ☀️, Light breeze (5 mph)

Football Game (Outdoor)
🏈 Stadium A: 75°F, Clear ☀️, Wind 8 mph
⚠️ Note: Light winds, ideal conditions

Tennis Matches (Outdoor)
🎾 Courts: 74°F, Mostly Clear, UV Index: 7/10
💡 Recommendation: Apply sunscreen

⚠️ WEATHER ALERTS
No severe weather warnings
All matches proceed as scheduled

HYDRATION REMINDER
High temperature day - Increase water intake!`,

        'equipment': `🎽 EQUIPMENT & GEAR REQUIREMENTS

BASKETBALL
✓ Jersey & Shorts
✓ Basketball Shoes (ankle support)
✓ Socks (crew or mid-calf)
✓ Protective eyewear (optional)
✓ Mouthguard (recommended)

SOCCER
✓ Jersey & Shorts
✓ Shin guards (required)
✓ Soccer cleats or trainers
✓ Socks
✓ Optional: Gloves (goalkeeper)

FOOTBALL
✓ Jersey & Pants
✓ Helmet (required)
✓ Shoulder pads (required)
✓ Football cleats
✓ Mouthguard (required)
✓ Gloves (optional)

TENNIS
✓ Tennis outfit (white preferred)
✓ Tennis shoes (good support)
✓ Racket & strings
✓ Balls (match approved)
✓ Cap/Visor (optional)

GENERAL GEAR
🎒 Backpack for essentials
🧴 Sunscreen (SPF 30+)
🧢 Hat/Cap
🥤 Water bottle (2L recommended)
🏥 First aid kit`,

        'techniques': `💪 SPORTS TECHNIQUES & TIPS

BASKETBALL FUNDAMENTALS
🔹 Shooting: Feet shoulder-width, follow-through
🔹 Dribbling: Keep ball below waist, eyes up
🔹 Passing: Chest pass most accurate
🔹 Defense: Stay low, use hands up position

SOCCER SKILLS
⚽ Ball Control: Touch ball every 3-4 steps
⚽ Passing: Use inside of foot for accuracy
⚽ Shooting: Power from hips and core
⚽ Defense: Position body between opponent & goal

FOOTBALL TECHNIQUES
🏈 QB: Grip, footwork, release, throwing mechanics
🏈 RB: Vision, ball security, lateral movement
🏈 WR: Route running, hands catching, YAC
🏈 Defense: Gap control, shed blocks, tackling

TENNIS STROKES
🎾 Forehand: Continental to Eastern grip
🎾 Backhand: One or two-handed options
🎾 Serve: Toss high, full body rotation
🎾 Volley: Quick reactions, short swing

MENTAL GAME
🧠 Visualization: Practice mental imagery
🧠 Focus: Develop pre-performance routines
🧠 Confidence: Positive self-talk
🧠 Pressure: Breathing techniques`,

        'injury reports': `🏥 CURRENT INJURY REPORTS

INJURED PLAYERS - OUT THIS WEEK

City Blazers:
🚫 Player #8 (Guard) - Ankle sprain, expected return Sept 8
🚫 Player #20 (Forward) - Hamstring strain, day-to-day

District Warriors:
🚫 Player #15 (Midfielder) - Knee contusion, TBD

Campus Legends:
🚫 Player #55 (OL) - Shoulder injury, under evaluation

RECOVERY TRACKING
✅ Player #23 (PG) - 100% ready, cleared to play
✅ Player #5 (C) - 95% recovery, limited practice only
⚠️ Player #14 (F) - 70% recovery, no contact drills

PREVENTION STATS
• Injury rate this season: 15% (down from 22% last year)
• Average recovery time: 10 days
• Return-to-play compliance: 98%`,

        'insurance': `🛡️ INSURANCE & LIABILITY

COVERAGE DETAILS

Athletic Injury Insurance
✓ Coverage: Medical treatment up to $100,000
✓ Deductible: $250 per claim
✓ Covers: In-season injuries only
✓ Status: Active for all registered players

Liability Coverage
✓ Team coverage: $1,000,000 minimum
✓ Includes: Event cancellation, property damage
✓ Valid: Sept 1, 2026 - Aug 31, 2027

CLAIM PROCESS
1. Report injury within 24 hours
2. Get medical evaluation & documentation
3. Submit claim within 30 days
4. Processing time: 5-7 business days

DOCUMENTS NEEDED
📄 Injury incident report
📄 Medical provider evaluation
📄 Proof of payment
📄 Insurance claim form

CONTACT INSURANCE
📧 insurance@proarena.com
📞 1-800-776-INSURE (1-800-776-4678)`,

        'medical staff': `👨‍⚕️ MEDICAL & SPORTS SCIENCE TEAM

MEDICAL DIRECTOR
Dr. James Peterson (MD, Sports Medicine)
🏥 Experience: 25 years
📍 Available: On-site for all major events

TEAM PHYSICIANS
• Dr. Sarah Chen - Basketball & Soccer
• Dr. Michael Johnson - Football
• Dr. Lisa Wong - Tennis & General

PHYSICAL THERAPISTS
🏥 Tom Anderson, PT (Rehabilitation)
🏥 Emily Davis, PT (Injury Prevention)
🏥 Mark Wilson, DPT (Sports Injuries)

SPORTS NUTRITIONISTS
🥗 Coach Maria Rodriguez (Nutrition specialist)
🥗 Dr. Elena Vasquez (Sports dietitian)

MENTAL PERFORMANCE COACHES
🧠 Dr. Rachel Green (Sports psychologist)
🧠 Coach Kevin Miller (Mental skills trainer)

EMERGENCY CONTACTS
🚑 Emergency: 911
⚠️ On-field emergency: Contact nearest medical staff
📞 Medical hotline: 1-800-MEDICAL-1`,

        'sponsorships': `🤝 SPONSORSHIPS & PARTNERSHIPS

OFFICIAL SPONSORS

🏢 Platinum Sponsors
• Nike - Official apparel & footwear
• Gatorade - Official sports drink
• Red Bull - Energy drink partner

🏢 Gold Sponsors
• adidas - Alternative gear provider
• Coca-Cola - Beverage partner
• Sony Sports - Broadcasting partner

🏢 Silver Sponsors
• UnderArmour - Performance wear
• Beats by Dre - Audio equipment
• Local restaurants & businesses

PARTNERSHIP BENEFITS
✅ Players get 30% discount on sponsor products
✅ Exclusive gear distributions at tournaments
✅ Sponsorship signage at venues
✅ Co-branded promotional materials

BECOMING A SPONSOR
📧 partnerships@proarena.com
📞 Sponsorship inquiries: ext. 2500
💼 Annual sponsorship packages starting at $10,000`,

        'hall of fame': `🏆 HALL OF FAME & LEGENDS

INDUCTED ATHLETES (All-Time Greats)

BASKETBALL
🌟 James "The Scorer" Anderson - 3,500+ career points
🌟 Lisa Chen - 5x All-Star, 2x Championship
🌟 Michael Jackson - Legendary defender

SOCCER  
🌟 Diego Silva - 200+ goals, International star
🌟 Mia Anderson - 8x Champion, Team captain

FOOTBALL
🌟 Tom Brady - Quarterback legacy
🌟 Jerry Rice - All-time receiver records
🌟 Lawrence Taylor - Defensive icon

COACHES HALL OF FAME
🎓 Coach Bear Bryant - 50+ year legacy
🎓 Coach Pat Summitt - 38 years coaching

LEGACY FUND
Contributions support youth athletic programs
Annual fundraiser: Hall of Fame Gala (Oct 15)`,

        'account settings': `⚙️ ACCOUNT SETTINGS & PREFERENCES

PROFILE SETTINGS
👤 Name: Update your full name
📧 Email: Primary email (demo@proarena.com)
📱 Phone: +1 (555) 123-4567
🌍 Location: City, State, Country
🎂 Birthday: Sept 15, 1995
🧬 Height: 6'2" | Weight: 185 lbs

PRIVACY SETTINGS
🔒 Profile Visibility: Public/Private/Friends Only
📊 Activity Visibility: Show/Hide achievements
💬 Allow messages from: Everyone/Friends/Nobody
📧 Email notifications: Enabled/Disabled

NOTIFICATION PREFERENCES
🔔 Match reminders: Enabled
🔔 Tournament updates: Enabled
🔔 Team messages: Enabled
🔔 Performance alerts: Enabled
🔔 Promotions: Disabled

SECURITY
🔐 Password: Last changed 30 days ago
🔐 Two-factor authentication: Enabled
🔐 Connected devices: 3 (iPhone, Desktop, Tablet)
🔐 Session timeout: 30 minutes

LINKED ACCOUNTS
📱 Google: Connected
📘 Facebook: Not connected
🍎 Apple: Not connected`,

        'social features': `👥 SOCIAL & COMMUNITY FEATURES

FRIENDS LIST
✅ 127 Friends
🔥 Recently added: Sarah, Mike, Jessica

MESSAGES
💬 Unread: 5 messages
📬 Latest: Team captain @ 2:45 PM
📝 Create new message/group chat

ACTIVITY FEED
🎯 Your posts: 23 posts
❤️ Likes received: 156
💬 Comments received: 89
🔄 Shares: 34

FOLLOWERS & FOLLOWING
👥 Followers: 450
👥 Following: 320
⭐ Trending athletes: Check who's trending

COMMUNITIES & GROUPS
🏀 City Blazers Team Chat (340 members)
⚽ Soccer Enthusiasts (2.1K members)
🎾 Tennis Players Network (1.5K members)
💪 Fitness & Wellness (5.2K members)

CREATE/JOIN
• Join public communities
• Create private groups
• Organize team discussions`,

        'notifications': `🔔 NOTIFICATIONS & ALERTS

TODAY'S NOTIFICATIONS

🔴 3:45 PM - MATCH UPDATE
City Blazers vs Regional FC starting in 15 minutes!

🔴 2:30 PM - TEAM MESSAGE
Captain: Don't forget pre-game meeting at 2:00 PM

🔴 1:15 PM - PERFORMANCE
New personal best: 3-point accuracy up to 42%!

📅 NOTIFICATION SETTINGS
✓ Match reminders: 15 min, 1 hour, 24 hours before
✓ Team announcements: Enabled
✓ Performance milestones: Enabled
✓ Tournament updates: Enabled
✓ Social interactions: Enabled
✓ Email digest: Daily

DO NOT DISTURB
Set quiet hours: 10:00 PM - 8:00 AM
Allow emergency notifications: Enabled`,

        'my profile': `👤 MY PROFILE & STATS

PROFILE OVERVIEW
Name: John Athletic
Age: 28 | Member since: January 2020
Location: New York, USA
Bio: Basketball enthusiast, Team captain, Sports fanatic

ATHLETIC ACHIEVEMENTS
🏆 Total Tournaments: 15
🥇 1st Place: 8 times
🥈 2nd Place: 4 times
🥉 3rd Place: 3 times
⭐ Current Ranking: #12 (City)

STATISTICS
📊 Matches played: 156
📊 Win rate: 68%
📊 Average points: 18.5
📊 Average rebounds: 6.2
📊 Average assists: 5.1

CERTIFICATIONS & BADGES
🎓 Certified Coach - Basketball
🎖️ Team Leadership Award
⭐ 5-Year Member Badge
🏅 Most Improved Player

RECENT ACTIVITY
✅ Played match yesterday (W 78-65)
✅ Posted achievement 2 days ago
✅ Attended tournament 1 week ago`,

        'news and updates': `📰 LATEST NEWS & UPDATES

🔴 BREAKING NEWS

📌 Championship Finals Announced
Date: October 15, 2026 | Location: Main Arena
Top 8 teams qualify for finals championship bracket

📌 New Facility Opening
Grand opening of the $50M Sports Complex coming Sept 15
3 Olympic-size pools, 10 basketball courts, Training center

RECENT NEWS

✅ City Blazers Win Streak Continues
Won 5 consecutive matches, Best record this season

✅ Star Player Signs Major Sponsorship
Alex Johnson partners with Nike for exclusive shoe line

✅ Youth Program Launches
Free coaching for underprivileged youth starting Sept 10

✅ Conference Tournament Dates
Announced schedule for fall championship playoffs

ANNOUNCEMENTS

📢 Maintenance scheduled Sept 5 (10 PM - 2 AM)
📢 New app features coming next week
📢 Holiday tournament registration opens Sept 8`,

        'promotions and offers': `🎉 CURRENT PROMOTIONS & OFFERS

🎁 SPECIAL OFFERS

50% OFF Premium Membership
Valid until Sept 10 only!
• Unlimited tournament entries
• Advanced analytics
• Priority support
Use code: PROMO50

BUY 1 GET 1 FREE
Team gear and merchandise
Valid on all apparel, limited stock

LOYALTY REWARDS
Earn 1 point per $1 spent
Redeem 100 points for $15 credit
Current points: 487 🎯

REFERRAL PROGRAM
Refer a friend, both get $25 credit!
You've referred: 5 friends
Earned: $125 in credits

UPCOMING DEALS
⏰ Black Friday Sale (Sept 21)
⏰ Equipment Flash Sale (Daily 3-6 PM)
⏰ Seasonal Tournament Discount (Sept 15)

MEMBER EXCLUSIVE
Early access to new tournaments (48 hours before)
Special team registration rates
VIP event invitations`,

        'app features': `📱 APP FEATURES & HOW-TO

MAIN FEATURES

🏠 HOME DASHBOARD
• Quick access to matches & tournaments
• Upcoming schedule preview
• Performance summary
• Latest news feed

📅 MATCHES & TOURNAMENTS
• Browse all available events
• Register for tournaments
• Track registration status
• View match results

👥 TEAMS
• Manage your teams
• View team roster & stats
• Team chat & messages
• Schedule training

📊 PERFORMANCE
• Personal statistics
• ACWR tracking
• Achievement badges
• Progress charts

🏪 STORE
• Purchase merchandise
• Team apparel
• Equipment
• Digital content

⚙️ SETTINGS
• Profile customization
• Privacy controls
• Notifications
• Account security

QUICK TIPS
✓ Swipe left for options
✓ Long-press to favorite
✓ Use search to find content
✓ Enable notifications for updates`,

        'faq': `❓ FREQUENTLY ASKED QUESTIONS

GENERAL

Q: How do I delete my account?
A: Go to Settings → Account → Delete Account. This is permanent and cannot be undone.

Q: Can I change my username?
A: No, usernames are permanent. However, you can change your display name in profile.

Q: Is my data secure?
A: Yes! We use bank-level encryption and comply with GDPR/CCPA regulations.

TOURNAMENTS

Q: What's the registration deadline?
A: Usually 7 days before the event. Check individual tournament page.

Q: Can I withdraw from a tournament?
A: Yes, but refund depends on withdrawal timing. Check cancellation policy.

Q: Are there age restrictions?
A: Yes, varies by sport. Check tournament page for details.

PAYMENTS

Q: What payment methods do you accept?
A: Credit cards, debit cards, bank transfer, PayPal, Apple Pay, Google Pay.

Q: Can I get a refund?
A: Refunds available within 30 days for unused services.

Q: Is my payment information safe?
A: Yes, we use PCI-DSS compliant payment processing.

TECHNICAL

Q: Why won't the app load?
A: Clear cache, check internet connection, update app, or restart device.

Q: How do I enable notifications?
A: Settings → Notifications → Toggle on for desired alerts.

Q: Is the app available offline?
A: Limited features work offline. Most features require internet.

CONTACT FOR MORE
📧 Email: support@proarena.com
💬 Live chat: 9 AM - 6 PM EST
📞 Phone: 1-800-PRO-ARENA`,

        'community events': `🎊 COMMUNITY EVENTS & GATHERINGS

UPCOMING EVENTS

🎉 Meet & Greet with Pro Athletes
Sept 10 @ 6:00 PM | Sports Arena
Free admission, Q&A session, Photo opportunities
Register: Still 150 spots available!

🎓 Sports Nutrition Seminar
Sept 12 @ 2:00 PM | Training Center
Guest speaker: Registered Dietitian
Learn pre/post game nutrition
Fee: $25 | Register now

🏆 Community Tournament
Sept 18-22 | Multiple venues
All skill levels welcome
Prize pool: $50,000
Registration: $200/team

🎬 Sports Documentary Screening
Sept 25 @ 7:00 PM | Community Hall
Followed by Q&A with filmmakers
Tickets: $15 | Seating limited

SOCIAL ACTIVITIES

🍕 Team Dinner Night
Every Friday after matches
Local restaurants, 20% discount
RSVP in team chat

🎮 Gaming Night
Sept 15 @ 8:00 PM | Virtual
Sports video games tournament
Free entry, prizes available

🌱 Community Cleanup
Sept 9 (morning) | Local parks
Support environmental initiatives
Volunteers needed!`,

        'training programs': `📚 TRAINING PROGRAMS & COURSES

AVAILABLE COURSES

🥇 Beginner Basketball
Duration: 4 weeks | Level: Beginner
Learn basics, footwork, shooting
Instructor: Coach Michael Roberts
Price: $79 | Next start: Sept 8

🥈 Intermediate Soccer
Duration: 6 weeks | Level: Intermediate
Tactical drills, possession, positioning
Instructor: Coach David Martinez
Price: $99 | Next start: Sept 10

🥉 Advanced Fitness
Duration: 8 weeks | Level: Advanced
High-intensity training, conditioning
Instructor: Coach Tony Smith
Price: $149 | Next start: Sept 6

SKILL-SPECIFIC TRAINING

🎯 Shooting Technique Masterclass
2-hour workshop focusing on accuracy
Next session: Sept 8 @ 6 PM
Fee: $29

💪 Strength & Conditioning
4-week program with personalized plan
Includes: Meal plan, workout videos, tracking
Fee: $199

🧠 Mental Skills Training
6 sessions on focus, confidence, performance
By appointment with sports psychologist
Fee: $150 for series

CERTIFICATIONS

🎓 Coaching Certification Program
8 weeks | $299 | Includes materials & exam
Next cohort: Oct 1, 2026

🎓 First Aid / CPR
2-day workshop | $75
Required for coaches and staff
Next session: Sept 20-21`,

        'merchandise store': `🛍️ MERCHANDISE & STORE

TEAM APPAREL

👕 Team Jersey
Official City Blazers jersey
Colors: Blue, White, Black
Sizes: XS - 3XL
Price: $49.99

👖 Team Shorts
High-quality athletic shorts
Breathable material, deep pockets
Sizes: XS - 3XL
Price: $34.99

🧢 Team Cap
Embroidered logo, adjustable fit
Multiple color options
Price: $24.99

👟 Team Gear Bundles
Jersey + Shorts + Cap + Socks
Save 20% with bundle
Regular: $119.97 | Now: $95.97

EQUIPMENT

🏀 Official Game Ball
Premium leather, regulation size
Price: $89.99

⚽ Soccer Ball Set
3-ball pack, training quality
Price: $44.99

🎾 Tennis Racket
Professional-grade racket
Includes carrying case
Price: $199.99

ACCESSORIES

🎒 Sports Backpack
Insulated compartments, waterproof
Price: $59.99

🧴 Sports Hydration Set
Water bottle + electrolyte powder
Price: $34.99

📱 Phone Armband
Fits all phone sizes, reflective
Price: $19.99

SHIPPING & RETURNS
✓ Free shipping on orders $50+
✓ 30-day returns for unused items
✓ Fast delivery: 2-3 business days`,

        'blog and guides': `📖 BLOG, GUIDES & RESOURCES

FEATURED ARTICLES

🔥 Top 10 Fitness Mistakes Athletes Make
Common errors and how to fix them | Read (8 min)

🔥 Nutrition Guide for Peak Performance
Detailed nutrition science for athletes | Read (12 min)

🔥 Mental Toughness in Sports
Building psychological resilience | Read (10 min)

TRAINING GUIDES

📌 Beginner's Guide to Basketball
Everything you need to know to get started
Includes: Rules, techniques, gear, tips

📌 Soccer Training Plan
8-week progressive training program
With video demonstrations

📌 Injury Recovery Protocol
Science-based recovery guidelines
Approved by sports medicine doctors

LIFESTYLE CONTENT

💡 Sleep Optimization for Athletes
Research-backed sleep improvement tips

💡 Stress Management Techniques
Mental health during competition

💡 Time Management for Sports
Balancing sport, work, and life

SUBSCRIBE TO UPDATES
📧 Weekly newsletter with latest content
✓ Tips, guides, and success stories
✓ Unsubscribe anytime`,

        'travel and logistics': `✈️ TRAVEL & LOGISTICS

TOURNAMENT TRAVEL INFO

🏨 ACCOMMODATIONS
Hotel partnerships with 30% discount
Partner hotels near all venues
Book directly through app

🚗 TRANSPORTATION
• Shuttle service for large tournaments
• Group discounts for rideshare
• Parking information by venue

✈️ FLIGHTS
Travel grants available for national tournaments
Partnership with major airlines for discounts
Group booking available

VENUES & DIRECTIONS

📍 Arena Sports Complex
Address: 123 Sports Avenue, Downtown
🚗 Parking: 500 spaces, $5/day
🚌 Public transit: Bus route 12, 34
⏱️ Arrival: 30 min before event

📍 Central Sports Park
Address: 456 Park Road, Midtown
🚗 Parking: Free for members
🚌 Public transit: Train station nearby
⏱️ Arrival: 45 min before event

TRAVEL CHECKLIST
☑️ Tournament registration confirmation
☑️ Travel documents & ID
☑️ Equipment & gear
☑️ Medications & supplements
☑️ Emergency contacts

TRAVEL TIPS
• Arrive 1-2 hours early for setup
• Bring extra clothes and towels
• Pack recovery ice and stretching tools
• Stay hydrated during travel`,

        'rewards program': `🎁 REWARDS & LOYALTY PROGRAM

EARN POINTS

💰 Every Purchase: 1 point per $1
🏆 Win Tournament: 50-500 points (varies)
📊 Hit Milestone: 25-100 points
📝 Leave Review: 10 points
👥 Refer Friend: 25 points each

REDEEM REWARDS

100 Points = $15 credit
250 Points = $40 credit + Free merchandise
500 Points = $100 credit + VIP event pass
1000 Points = Tournament fee waiver

EXCLUSIVE MEMBER BENEFITS

🌟 Gold Member (100+ points)
• Early tournament registration
• Exclusive coaching sessions
• 10% merchandise discount

🌟 Platinum Member (500+ points)
• 20% off all purchases
• VIP event access
• Personal coach consultation
• Free premium membership (3 months)

🌟 Diamond Member (1000+ points)
• Lifetime 25% discount
• Free accommodation at tournaments
• Private coaching sessions
• Exclusive merchandise drops

CURRENT BALANCE
💎 Points: 487
🎯 Status: Gold Member
🎁 Next reward: $15 credit (13 points away!)`,

        'social media': `📱 SOCIAL MEDIA & ONLINE COMMUNITY

FOLLOW US ON

📘 Facebook: @ProArenaOfficial (150K followers)
📷 Instagram: @ProArenaApp (220K followers)
🐦 Twitter/X: @ProArena_Sports (85K followers)
📺 YouTube: ProArena Channel (50K subscribers)
💼 LinkedIn: ProArena Company (12K followers)

LATEST POSTS

🔥 Instagram Story: Behind-the-scenes tournament prep
🔥 TikTok: Viral 10-second basketball trick shot
🔥 YouTube: 15-min training tutorial (50K views)

USER-GENERATED CONTENT

Share your highlights! Use #ProArena
Featured posts get:
✅ 500 bonus loyalty points
✅ Featured on app homepage
✅ Mentioned in newsletter
✅ Chance to win $100 gift card

ENGAGE WITH US

📝 Tag us in posts: @ProArena
💬 Comment on updates
❤️ Share with your team
🔗 Invite friends to follow

COMMUNITY CHALLENGES

🏆 Photo Challenge: Best team photo
🏆 Video Challenge: Best game highlight
🏆 Fitness Challenge: 30-day transformation
Winners announced monthly!`,

        'downloads and resources': `📥 DOWNLOADS & RESOURCES

AVAILABLE DOWNLOADS

📄 Training Plans
• 8-week beginner program
• 12-week intermediate program
• Sport-specific routines

📄 Nutrition Guides
• Pre-game meal plans
• Post-game recovery recipes
• Daily nutrition calculator

📄 PDF Guides
• Rule books for all sports
• Tournament regulations
• Injury prevention checklist

🎥 VIDEO TUTORIALS
• Equipment setup guides
• Technique breakdowns
• Recovery stretches

📚 E-BOOKS

"Athlete's Handbook" - Complete guide ($0 FREE)
"Nutrition Bible for Athletes" ($9.99)
"Mental Game of Sports" ($7.99)
"Training Programming 101" ($12.99)

MOBILE APP

📲 iOS: Download on App Store
📲 Android: Download on Google Play
📲 Web: Access at proarena.com

SYSTEM REQUIREMENTS
• iOS 14+ or Android 8+
• 150MB storage
• Internet connection

SUPPORT

📧 Help: support@proarena.com
🐛 Report bugs: bugs@proarena.com
💡 Feature requests: features@proarena.com`,        'help': `ℹ️ COMPLETE CHATBOT REFERENCE GUIDE (50+ TOPICS)

📅 SCHEDULE & EVENTS (6)
• Show today's matches, live matches, upcoming tournaments
• Event history, training schedule, weather

👥 TEAMS & PLAYERS (6)
• Show my teams, team performance, player stats
• Leaderboards, coaches, hall of fame

📋 REGISTRATION & VENUES (2)
• How to register, venues & facilities

🏥 HEALTH & WELLNESS (9)
• ACWR, injury prevention, injury reports, medical staff
• Nutrition, techniques, equipment, insurance, sponsorships

🎓 TRAINING & EDUCATION (3)
• Training programs, blog & guides, downloads & resources

👤 ACCOUNT & PROFILE (4)
• My profile, account settings, notifications, social features

🎉 COMMUNITY & EVENTS (2)
• Community events, social media & engagement

🛒 SHOPPING & REWARDS (4)
• Merchandise store, promotions & offers
• Rewards program, referral bonuses

📰 INFORMATION (2)
• News & updates, FAQs

💼 APP & FEATURES (1)
• App features & how-to, travel & logistics

🌟 SPECIAL (1)
• Help (this guide!)

❓ QUICK ACCESS
Use voice search 🎤 or type any keyword above!
Try: "My profile", "News", "Rewards", "Merchandise", "Training programs"`,
      };
      
      const lowerMessage = msg.toLowerCase();
      let reply = null;
      
      // Check for exact matches first
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerMessage.includes(key)) {
          reply = value;
          break;
        }
      }
      
      // If no exact match, provide helpful default
      if (!reply) {
        reply = `I'm your ProArena AI assistant! I can help with:

📅 SPORTS & SCHEDULE
Show matches, tournaments, training, weather, venues, rules

👥 PROFILE & ACCOUNT
My profile, settings, notifications, account preferences

🎉 COMMUNITY & SOCIAL
Social features, community events, social media, friends

🛒 SHOPPING & REWARDS
Merchandise, promotions, rewards program, loyalty

🎓 LEARNING & TRAINING
Training programs, blog, guides, downloads, resources

📰 INFORMATION & UPDATES
News, FAQs, app features, support, travel logistics

✅ Ask about sports, account, community, shopping, training, or help!
🎤 Or use voice search by clicking the microphone button!`;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } finally { 
      setSending(false); 
    }
  };

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-black tracking-tight text-slate-900">AI Assistant</h1>
          <p className="text-xs font-semibold text-green-600">● Online</p>
        </div>
      </div>

      <div className="space-y-3 pb-24">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-slate-400">Thinking…</span>
            </div>
          </div>
        )}

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto max-w-6xl px-4 md:bottom-8">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about tournaments, matches, your ACWR…"
            className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-slate-800 outline-none"
          />
          <button 
            onClick={toggleVoiceInput} 
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md transition-all ${isListening ? 'bg-red-600 animate-pulse' : 'bg-slate-600 hover:bg-slate-700'} active:scale-95`}
            title="Voice Search"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button onClick={() => send()} disabled={sending || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md disabled:opacity-40 active:scale-95">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}