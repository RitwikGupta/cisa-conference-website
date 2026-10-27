// Package prices and benefits approved for reuse in 2027 on October 11, 2026.
export const sponsorPackages = [
  { id: 'platinum', name: 'Platinum', price: 8000 },
  { id: 'gold', name: 'Gold', price: 6000 },
  { id: 'silver', name: 'Silver', price: 4000 },
  { id: 'bronze', name: 'Bronze', price: 2000 },
] as const;

export const sponsorBenefits = [
  { name: 'Best paper award sponsor', tiers: ['platinum'] },
  { name: 'Name and logo on event signage', tiers: ['platinum', 'gold'] },
  { name: 'Exhibit booth space', tiers: ['platinum', 'gold'] },
  { name: 'Career event at a local restaurant', tiers: ['platinum', 'gold', 'silver'] },
  {
    name: 'Option to organize a conference workshop or panel',
    tiers: ['platinum', 'gold', 'silver'],
  },
  {
    name: 'Recognition in conference emails and announcements',
    tiers: ['platinum', 'gold', 'silver'],
  },
  {
    name: 'Promotion on the conference website and in the daily newsletter',
    tiers: ['platinum', 'gold', 'silver', 'bronze'],
  },
  {
    name: 'Acknowledgment during the opening reception and banquet',
    tiers: ['platinum', 'gold', 'silver', 'bronze'],
  },
];
