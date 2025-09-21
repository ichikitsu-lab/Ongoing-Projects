import { useState, useEffect } from 'react';
import { Member, Project, ExternalPartner, ExternalPartnerAssignment } from '../types';
import { mockMembers, mockProjects, mockExternalPartners } from '../data/mockData';

export const useDatabaseData = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [externalPartners, setExternalPartners] = useState<ExternalPartner[]>(mockExternalPartners);
  const [isLoading, setIsLoading] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  // データベース接続状態をチェック
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        const isConnected = response.ok;
        setIsDatabaseConnected(isConnected);
        if (isConnected) {
          loadData();
        }
      } catch (error) {
        console.log('データベース接続なし、モックデータを使用します');
        setIsDatabaseConnected(false);
      }
    };

    checkConnection();
  }, []);

  // データ読み込み
  const loadData = async () => {
    setIsLoading(true);
    try {
      // メンバーデータ読み込み
      const membersResponse = await fetch('/api/members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData);
      }

      // プロジェクトデータ読み込み
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }

      // 協力業者データ読み込み
      const partnersResponse = await fetch('/api/external-partners');
      if (partnersResponse.ok) {
        const partnersData = await partnersResponse.json();
        setExternalPartners(partnersData);
      }
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

    if (!isDatabaseConnected) return;

    try {
      for (const member of updatedMembers) {
        await fetch('/api/members', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(member),
        });
      }
    } catch (error) {
      console.error('メンバー更新エラー:', error);
    }
  };

  // プロジェクト更新
  const updateProjects = async (updatedProjects: Project[]) => {
    console.log('🔄 プロジェクト更新開始:', updatedProjects.length, '件');
    setProjects(updatedProjects);

    if (!isDatabaseConnected) return;

    try {
      for (const project of updatedProjects) {
        console.log('📝 プロジェクト更新中:', project.name);
        
        await fetch('/api/projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });
      }
      console.log('🎉 全プロジェクト更新完了');
    } catch (error) {
      console.error('❌ プロジェクト更新エラー:', error);
      throw error;
    }
  };

  // 協力業者更新
  const updateExternalPartners = async (updatedPartners: ExternalPartner[]) => {
    setExternalPartners(updatedPartners);

    if (!isDatabaseConnected) return;

    try {
      for (const partner of updatedPartners) {
        await fetch('/api/external-partners', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(partner),
        });
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
    isDatabaseConnected,
    updateMembers,
    updateProjects,
    updateExternalPartners,
    loadData,
  };
};