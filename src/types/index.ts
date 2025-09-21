export interface Member {
  id: string;
  name: string;
  team: string;
  qualifications: string[];
  availableHours: {
    start: string;
    end: string;
  };
  availableAreas: string[];
  notes: string;
  isActive: boolean; // 論理削除フラグ
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  date: string;
  workTime: {
    start: string;
    end: string;
  };
  location: string;
  workContent: string;
  requiredMembers: number;
  notes: string;
  assignedMembers: string[];
  leadMemberId?: string; // 担当メンバーID
  externalPartners: ExternalPartnerAssignment[]; // 協力業者配置情報
  isActive: boolean; // 論理削除フラグ
  createdAt: string;
  updatedAt: string;
}

export interface ExternalPartner {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalPartnerAssignment {
  partnerId: string;
  memberCount: number;
  representativeName: string;
}

export interface Assignment {
  memberId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ConflictAlert {
  memberId: string;
  memberName: string;
  conflictingProjects: string[];
  date: string;
  timeRange: string;
}

export interface ProjectFormData {
  name: string;
  date: string;
  workTimeStart: string;
  workTimeEnd: string;
  location: string;
  workContent: string;
  requiredMembers: number;
  notes: string;
}

export interface MemberFormData {
  name: string;
  team: string;
  qualifications: string[];
  availableHoursStart: string;
  availableHoursEnd: string;
  availableAreas: string[];
  notes: string;
}