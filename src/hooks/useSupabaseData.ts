import { useState, useEffect } from 'react';
import { Member, Project, ExternalPartner, ExternalPartnerAssignment } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { mockMembers, mockProjects, mockExternalPartners } from '../data/mockData';

export const useSupabaseData = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [externalPartners, setExternalPartners] = useState<ExternalPartner[]>(mockExternalPartners);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const supabase = getSupabaseClient();

  // Supabase接続状態をチェック
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = !!supabase;
      setIsSupabaseConnected(isConnected);
      if (isConnected) {
        loadData();
      }
    };

    checkConnection();

    // 設定変更時の再チェック
    const handleConfigChange = () => {
      checkConnection();
    };

    window.addEventListener('supabaseConfigChanged', handleConfigChange);
    return () => window.removeEventListener('supabaseConfigChanged', handleConfigChange);
  }, []);

  // データ読み込み
  const loadData = async () => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      // テーブルの存在確認
      const { error: testError } = await supabase
        .from('members')
        .select('count')
        .limit(0);
      
      if (testError && testError.code === '42P01') {
        console.log('テーブルが存在しません。モックデータを使用します。');
        setIsLoading(false);
        return;
      }

      // メンバーデータ読み込み
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;

      // プロジェクトデータ読み込み
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('date', { ascending: false });

      if (projectsError) throw projectsError;

      // プロジェクトメンバー配置データ読み込み
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('project_member_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // プロジェクト協力業者配置データ読み込み
      const { data: partnerAssignmentsData, error: partnerAssignmentsError } = await supabase
        .from('project_external_partner_assignments')
        .select('*');

      if (partnerAssignmentsError) throw partnerAssignmentsError;

      // 協力業者データ読み込み
      const { data: partnersData, error: partnersError } = await supabase
        .from('external_partners')
        .select('*')
        .order('created_at', { ascending: true });

      if (partnersError) throw partnersError;

      // データ変換
      const transformedMembers: Member[] = membersData.map(member => ({
        id: member.id,
        name: member.name,
        team: member.team,
        qualifications: member.qualifications,
        availableHours: {
          start: member.available_hours_start,
          end: member.available_hours_end,
        },
        availableAreas: member.available_areas,
        notes: member.notes,
        isActive: member.is_active,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      }));

      const transformedPartners: ExternalPartner[] = partnersData.map(partner => ({
        id: partner.id,
        name: partner.name,
        isActive: partner.is_active,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,
      }));

      const transformedProjects: Project[] = projectsData.map(project => {
        const memberAssignments = assignmentsData.filter(a => a.project_id === project.id);
        const partnerAssignments = partnerAssignmentsData.filter(a => a.project_id === project.id);

        const externalPartners: ExternalPartnerAssignment[] = partnerAssignments.map(assignment => ({
          partnerId: assignment.partner_id,
          memberCount: assignment.member_count,
          representativeName: assignment.representative_name,
        }));

        return {
          id: project.id,
          name: project.name,
          date: project.date,
          workTime: {
            start: project.work_time_start,
            end: project.work_time_end,
          },
          location: project.location,
          workContent: project.work_content,
          requiredMembers: project.required_members,
          notes: project.notes,
          assignedMembers: memberAssignments.map(a => a.member_id),
          leadMemberId: project.lead_member_id,
          externalPartners,
          isActive: project.is_active,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
        };
      });

      setMembers(transformedMembers);
      setProjects(transformedProjects);
      setExternalPartners(transformedPartners);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      // エラーが発生した場合はモックデータを継続使用
    } finally {
      setIsLoading(false);
    }
  };

  // メンバー更新
  const updateMembers = async (updatedMembers: Member[]) => {
    setMembers(updatedMembers);

    if (!supabase) return;

    try {
      // 各メンバーを個別に更新
      for (const member of updatedMembers) {
        const { error } = await supabase
          .from('members')
          .upsert({
            id: member.id,
            name: member.name,
            team: member.team,
            qualifications: member.qualifications,
            available_hours_start: member.availableHours.start,
            available_hours_end: member.availableHours.end,
            available_areas: member.availableAreas,
            notes: member.notes,
            is_active: member.isActive,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('メンバー更新エラー:', error);
    }
  };

  // プロジェクト更新
  const updateProjects = async (updatedProjects: Project[]) => {
    console.log('🔄 プロジェクト更新開始:', updatedProjects.length, '件');
    console.log('📊 更新対象プロジェクト詳細:', updatedProjects.map(p => ({
      id: p.id,
      name: p.name,
      assignedMembers: p.assignedMembers,
      requiredMembers: p.requiredMembers
    })));
    
    setProjects(updatedProjects);

    if (!supabase) return;

    try {
      for (const project of updatedProjects) {
        console.log('📝 プロジェクト更新中:', project.name, 'メンバー:', project.assignedMembers.length, '名');
        console.log('👥 配置メンバーID一覧:', project.assignedMembers);
        
        // プロジェクト基本情報を更新
        const { error: projectError } = await supabase
          .from('projects')
          .upsert({
            id: project.id,
            name: project.name,
            date: project.date,
            work_time_start: project.workTime.start,
            work_time_end: project.workTime.end,
            location: project.location,
            work_content: project.workContent,
            required_members: project.requiredMembers,
            notes: project.notes,
            lead_member_id: project.leadMemberId,
            is_active: project.isActive,
            updated_at: new Date().toISOString(),
          });

        if (projectError) throw projectError;
        console.log('✅ プロジェクト基本情報更新完了');

        // 既存のメンバー配置を削除
        console.log('🗑️ 既存メンバー配置削除:', project.id);
        const { error: deleteAssignmentsError } = await supabase
          .from('project_member_assignments')
          .delete()
          .eq('project_id', project.id);

        if (deleteAssignmentsError) throw deleteAssignmentsError;
        console.log('✅ 既存メンバー配置削除完了');

        // 新しいメンバー配置を追加
        if (project.assignedMembers.length > 0) {
          console.log('➕ 新しいメンバー配置追加:', project.assignedMembers);
          
          // 重複を除去
          const uniqueMembers = [...new Set(project.assignedMembers)];
          console.log('🔍 重複除去後のメンバー:', uniqueMembers);
          
          const assignments = project.assignedMembers.map(memberId => ({
            project_id: project.id,
            member_id: memberId,
          }));
          
          console.log('📋 挿入予定の配置データ:', assignments);

          const { error: insertAssignmentsError } = await supabase
            .from('project_member_assignments')
            .insert(assignments);

          if (insertAssignmentsError) throw insertAssignmentsError;
          console.log('✅ メンバー配置完了');
        } else {
          console.log('ℹ️ 配置するメンバーなし');
        }

        // 既存の協力業者配置を削除
        console.log('🗑️ 既存協力業者配置削除:', project.id);
        const { error: deletePartnerAssignmentsError } = await supabase
          .from('project_external_partner_assignments')
          .delete()
          .eq('project_id', project.id);

        if (deletePartnerAssignmentsError) throw deletePartnerAssignmentsError;

        // 新しい協力業者配置を追加
        if (project.externalPartners.length > 0) {
          console.log('➕ 新しい協力業者配置追加:', project.externalPartners.length, '件');
          const partnerAssignments = project.externalPartners.map(assignment => ({
            project_id: project.id,
            partner_id: assignment.partnerId,
            member_count: assignment.memberCount,
            representative_name: assignment.representativeName,
          }));

          const { error: insertPartnerAssignmentsError } = await supabase
            .from('project_external_partner_assignments')
            .insert(partnerAssignments);

          if (insertPartnerAssignmentsError) throw insertPartnerAssignmentsError;
          console.log('✅ 協力業者配置完了');
        }
      }
      console.log('🎉 全プロジェクト更新完了');
    } catch (error) {
      console.error('❌ プロジェクト更新エラー:', error);
      throw error; // エラーを再スローして上位で処理
    }
  };

  // 協力業者更新
  const updateExternalPartners = async (updatedPartners: ExternalPartner[]) => {
    setExternalPartners(updatedPartners);

    if (!supabase) return;

    try {
      for (const partner of updatedPartners) {
        const { error } = await supabase
          .from('external_partners')
          .upsert({
            id: partner.id,
            name: partner.name,
            is_active: partner.isActive,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('協力業者更新エラー:', error);
    }
  };

  return {
    members,
    projects,
    externalPartners,
    isLoading,
    isSupabaseConnected,
    updateMembers,
    updateProjects,
    updateExternalPartners,
    loadData,
  };
};