/**
 * Live Activity Feed Data
 * Simulated real-time activities for social proof
 */

export interface Activity {
  id: string;
  type: 'match' | 'collaboration' | 'signup';
  user: string;
  company?: string;
  timestamp: Date;
  avatar?: string;
  location?: string;
  verified?: boolean;
}

// Sample activities that will be rotated
export const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'match',
    user: 'Sarah Martinez',
    company: 'Nike',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    location: 'Los Angeles, CA',
    verified: true
  },
  {
    id: '2',
    type: 'collaboration',
    user: 'James Chen',
    company: 'TechCorp',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    location: 'San Francisco, CA',
    verified: true
  },
  {
    id: '3',
    type: 'signup',
    user: 'Emily Johnson',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    location: 'New York, NY',
    verified: false
  },
  {
    id: '4',
    type: 'match',
    user: 'Michael Brown',
    company: 'Adidas',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    location: 'Chicago, IL',
    verified: true
  },
  {
    id: '5',
    type: 'collaboration',
    user: 'Jessica Davis',
    company: 'Beauty Co',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    location: 'Miami, FL',
    verified: true
  },
  {
    id: '6',
    type: 'signup',
    user: 'David Wilson',
    timestamp: new Date(Date.now() - 18 * 60 * 1000),
    location: 'Seattle, WA',
    verified: false
  },
  {
    id: '7',
    type: 'match',
    user: 'Ashley Garcia',
    company: 'Fashion Brand',
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    location: 'Austin, TX',
    verified: true
  },
  {
    id: '8',
    type: 'collaboration',
    user: 'Chris Anderson',
    company: 'Tech Startup',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    location: 'Boston, MA',
    verified: true
  },
  {
    id: '9',
    type: 'signup',
    user: 'Amanda Taylor',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    location: 'Denver, CO',
    verified: false
  },
  {
    id: '10',
    type: 'match',
    user: 'Ryan Thomas',
    company: 'Sports Brand',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    location: 'Portland, OR',
    verified: true
  }
];

// Generate a random activity
export const generateRandomActivity = (): Activity => {
  const types: Activity['type'][] = ['match', 'collaboration', 'signup'];
  const names = [
    'Alex Johnson', 'Sam Williams', 'Jordan Lee', 'Taylor Brown',
    'Morgan Davis', 'Casey Miller', 'Riley Wilson', 'Jamie Moore'
  ];
  const companies = [
    'Nike', 'Adidas', 'Apple', 'Google', 'Amazon', 'Microsoft',
    'Fashion Nova', 'Gymshark', 'Sephora', 'Target'
  ];
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA'
  ];

  const type = types[Math.floor(Math.random() * types.length)];
  const user = names[Math.floor(Math.random() * names.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const verified = Math.random() > 0.3;

  const activity: Activity = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    user,
    timestamp: new Date(),
    location,
    verified
  };

  if (type === 'match' || type === 'collaboration') {
    activity.company = companies[Math.floor(Math.random() * companies.length)];
  }

  return activity;
};
