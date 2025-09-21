import React, { useState } from 'react';
import { ExternalPartner } from '../types';
import { Plus, Edit3, Trash2, RotateCcw, Search, Building2 } from 'lucide-react';

interface ExternalPartnerManagementProps {
  partners: ExternalPartner[];
  onUpdatePartners: (partners: ExternalPartner[]) => void;
}

const ExternalPartnerManagement: React.FC<ExternalPartnerManagementProps> = ({
  partners,
  onUpdatePartners,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingPartner, setEditingPartner] = useState<ExternalPartner | null>(null);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const activePartners = partners.filter(p => p.isActive);
  const inactivePartners = partners.filter(p => !p.isActive);
  
  const filteredPartners = (showInactive ? inactivePartners : activePartners).filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPartner = () => {
    if (newPartnerName.trim()) {
      const newPartner: ExternalPartner = {
        id: `partner-${Date.now()}`,
        name: newPartnerName.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onUpdatePartners([...partners, newPartner]);
      setNewPartnerName('');
      setShowAddForm(false);
    }
  };

  const handleEditPartner = (partner: ExternalPartner) => {
    setEditingPartner(partner);
    setNewPartnerName(partner.name);
  };

  const handleUpdatePartner = () => {
    if (editingPartner && newPartnerName.trim()) {
      const updatedPartners = partners.map(p =>
        p.id === editingPartner.id
          ? { ...p, name: newPartnerName.trim(), updatedAt: new Date().toISOString() }
          : p
      );
      onUpdatePartners(updatedPartners);
      setEditingPartner(null);
      setNewPartnerName('');
    }
  };

  const handleDeletePartner = (partnerId: string) => {
    const updatedPartners = partners.map(p =>
      p.id === partnerId
        ? { ...p, isActive: false, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdatePartners(updatedPartners);
  };

  const handleRestorePartner = (partnerId: string) => {
    const updatedPartners = partners.map(p =>
      p.id === partnerId
        ? { ...p, isActive: true, updatedAt: new Date().toISOString() }
        : p
    );
    onUpdatePartners(updatedPartners);
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">協力業者管理</h2>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
            {activePartners.length}社
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規追加
        </button>
      </div>

      {/* フィルター */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="業者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(false)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !showInactive
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              アクティブ ({activePartners.length})
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showInactive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              削除済み ({inactivePartners.length})
            </button>
          </div>
        </div>
      </div>

      {/* 新規追加フォーム */}
      {showAddForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-3">新規協力業者追加</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              placeholder="協力業者名を入力"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPartner()}
            />
            <button
              onClick={handleAddPartner}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              追加
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPartnerName('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 編集フォーム */}
      {editingPartner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">協力業者編集</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleUpdatePartner()}
            />
            <button
              onClick={handleUpdatePartner}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              更新
            </button>
            <button
              onClick={() => {
                setEditingPartner(null);
                setNewPartnerName('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 協力業者一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 ${
              partner.isActive
                ? 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  partner.isActive ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <Building2 className={`w-5 h-5 ${
                    partner.isActive ? 'text-orange-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                  <p className="text-xs text-gray-500">
                    登録日: {new Date(partner.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1">
                {partner.isActive ? (
                  <>
                    <button
                      onClick={() => handleEditPartner(partner)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePartner(partner.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestorePartner(partner.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="復元"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {!partner.isActive && (
              <div className="text-xs text-red-600 font-medium">
                削除済み
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">
            {searchTerm 
              ? '検索条件に一致する協力業者が見つかりません'
              : showInactive 
              ? '削除された協力業者はありません'
              : '協力業者がまだ登録されていません'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExternalPartnerManagement;