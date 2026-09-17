import { ABOUT } from './content';

// Leadership, board and fund-management people shown on the About page.
// Grouped and ordered by hierarchy: Promoters → Independent Directors →
// Fund Management. Each card is clickable and opens the member's full bio.
// Photos live in /public/team; a member with no photo shows an initials avatar.

export interface TeamMember {
  name: string;
  role: string;
  photo?: string;
  bio: string[];
  timeline?: string[];
}

export interface TeamGroup {
  title: string;
  subtitle: string;
  members: TeamMember[];
}

export const TEAM_GROUPS: TeamGroup[] = [
  {
    title: 'Principal',
    subtitle: 'The visionary behind the group’s legacy and leadership.',
    members: [
      {
        name: 'Ms. Madhu Lunawat',
        role: 'Pantomath Group',
        photo: '/team/madhu-lunawat.jpg',
        bio: [
          'The first woman founder of a mutual fund house in India — a landmark in the Indian asset-management industry. Ms. Lunawat brings over two decades of experience across asset management, private equity and capital markets, with earlier stints at Infosys, ASREC and Edelweiss.',
          'As Co-Founder of the Pantomath Group — a full-service financial enterprise spanning investment banking, M&A, institutional equity and asset management — she has expanded the group’s footprint, integrating Asit C. Mehta Investment Interrmediates Ltd. as its retail-broking arm and fostering AI-led fintech ventures.',
          'Founder & CIO of the Bharat Value Fund and the driving force behind The Wealth Company, she has pioneered alternative investment strategies and led India’s only listed SME Fund — bringing sharp investment judgment and disciplined thinking to every aspect of the business.',
        ],
      },
    ],
  },
  {
    title: 'Independent Directors',
    subtitle: 'A distinguished board panel strengthening governance and oversight.',
    members: [
      {
        name: 'Mr. Krishan Kumar Jalan, IAS (Retd.)',
        role: 'Independent Director',
        photo: '/team/krishan-kumar-jalan.jpg',
        bio: [
          'Mr. Krishan Kumar Jalan, IAS (Retd.), has over 35 years of experience and has served in various senior positions with distinction. He retired as Principal Secretary, Government of India, Ministry of Micro, Small and Medium Enterprises. Earlier roles included Central Provident Fund Commissioner, Additional Chief Secretary to the Government of Haryana, and Administrative Secretary of departments including Public Works & Architecture, Town and Country Planning, Urban Estate, Urban Local Bodies and Irrigation.',
          'In the Government of India he served as Director and Joint Secretary in the Ministry of Textiles and as Secretary General of the Apparel Export Promotion Council, and was instrumental in the construction of the Apparel Mart at Gurgaon. He has also served as Deputy Commissioner / District Magistrate of five districts — Bhiwani, Faridabad, Karnal, Sonepat and Rewari.',
        ],
      },
      {
        name: 'Mr. Suresh Kumar Jain',
        role: 'Independent Director',
        photo: '/team/suresh-kumar-jain.jpg',
        bio: [
          'Mr. Suresh Kumar Jain has over 36 years of rich experience with public-sector banks in India. He served as an Executive Director of Union Bank of India, overseeing the bank’s operations in London, Hong Kong, Abu Dhabi, Dubai, Beijing, Shanghai, Antwerp and Sydney, and was responsible for Human Resource Development and the management of non-performing / stressed-asset and MSME portfolios.',
          'Prior to Union Bank of India, he served up to the position of General Manager, National Banking Group — Western India at Bank of India, looking after overseas banking and large-credit processing. He also worked as Manager (Credit) at Bank of India, Hong Kong, overseeing one of the bank’s largest international portfolios of trade finance and loan syndications.',
        ],
      },
    ],
  },
  {
    title: 'Fund Management',
    subtitle: 'Leadership that combines wisdom, strategy and execution.',
    members: [
      {
        name: ABOUT.leadership.name,
        role: ABOUT.leadership.role,
        photo: ABOUT.leadership.photo,
        bio: ABOUT.leadership.bio,
        timeline: ABOUT.leadership.timeline,
      },
    ],
  },
];
