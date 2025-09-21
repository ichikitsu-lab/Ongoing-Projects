import { Member, Project, ExternalPartner } from '../types';

export const mockMembers: Member[] = [
  {
    id: 'member-1',
    name: '山田 太郎',
    team: '東京保守チーム',
    qualifications: ['電気主任技術者', '第一種電気工事士'],
    availableHours: { start: '08:00', end: '18:00' },
    availableAreas: ['東京都', '神奈川県'],
    notes: '経験豊富なリーダー',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-2',
    name: '佐藤 花子',
    team: '東京保守チーム',
    qualifications: ['第二種電気工事士'],
    availableHours: { start: '09:00', end: '17:00' },
    availableAreas: ['東京都'],
    notes: '要宿泊不可',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-3',
    name: '田中 次郎',
    team: '関西保守チーム',
    qualifications: ['電気主任技術者', '施工管理技士'],
    availableHours: { start: '08:00', end: '19:00' },
    availableAreas: ['大阪府', '京都府', '兵庫県'],
    notes: '',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-4',
    name: '鈴木 三郎',
    team: '東京保守チーム',
    qualifications: ['第一種電気工事士'],
    availableHours: { start: '07:00', end: '16:00' },
    availableAreas: ['東京都', '千葉県', '埼玉県'],
    notes: '早朝対応可能',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'member-5',
    name: '高橋 美咲',
    team: '関西保守チーム',
    qualifications: ['第二種電気工事士', '消防設備士'],
    availableHours: { start: '09:00', end: '18:00' },
    availableAreas: ['大阪府', '奈良県'],
    notes: '消防設備も対応可',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockExternalPartners: ExternalPartner[] = [
  {
    id: 'partner-1',
    name: '田中電設',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-2',
    name: '株式会社山田工業',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-3',
    name: '佐藤電気工事',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'partner-4',
    name: '関西電設株式会社',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'A社電気点検',
    date: new Date().toISOString().split('T')[0], // 今日
    workTime: { start: '09:00', end: '17:00' },
    location: '東京都中央区',
    workContent: '受電設備点検・絶縁抵抗測定',
    requiredMembers: 2,
    notes: '安全靴必須、屋内作業',
    assignedMembers: ['member-1', 'member-2'],
    leadMemberId: 'member-1',
    externalPartners: [
      {
        partnerId: 'partner-1',
        memberCount: 2,
        representativeName: '田中 一郎'
      }
    ],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-2',
    name: 'B工場定期点検',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明日
    workTime: { start: '08:00', end: '16:00' },
    location: '神奈川県横浜市',
    workContent: '工場内電気設備全般点検',
    requiredMembers: 3,
    notes: '作業服貸与あり、要安全教育',
    assignedMembers: ['member-3'],
    leadMemberId: 'member-3',
    externalPartners: [],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-3',
    name: 'Cビル非常用発電機点検',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2日後
    workTime: { start: '10:00', end: '15:00' },
    location: '東京都新宿区',
    workContent: '非常用発電機運転試験・点検',
    requiredMembers: 1,
    notes: '騒音注意、テナント営業中',
    assignedMembers: [],
    leadMemberId: undefined,
    externalPartners: [],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-4',
    name: 'D病院緊急対応',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 昨日
    workTime: { start: '14:00', end: '18:00' },
    location: '東京都世田谷区',
    workContent: '医療機器用電源設備修理',
    requiredMembers: 2,
    notes: '緊急案件、病院内感染対策必須',
    assignedMembers: ['member-1', 'member-4'],
    leadMemberId: 'member-1',
    externalPartners: [
      {
        partnerId: 'partner-1',
        memberCount: 1,
        representativeName: '田中 一郎'
      }
    ],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'project-5',
    name: 'E商業施設年次点検',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1週間後
    workTime: { start: '06:00', end: '12:00' },
    location: '千葉県船橋市',
    workContent: '商業施設電気設備年次点検',
    requiredMembers: 3,
    notes: '開店前作業、早朝対応',
    assignedMembers: [],
    leadMemberId: undefined,
    externalPartners: [],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];