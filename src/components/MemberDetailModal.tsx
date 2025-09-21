import React from 'react';
import { Member } from '../types';
import { X, User, Award, Clock, MapPin, FileText } from 'lucide-react';

interface MemberDetailModalProps {
  member: Member;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">メンバー詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
              <p className="text-gray-600">{member.team}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">保有資格</div>
                <div className="text-gray-600 text-sm">
                  {member.qualifications.length > 0 
                    ? member.qualifications.join(', ')
                    : 'なし'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">稼働可能時間</div>
                <div className="text-gray-600 text-sm">
                  {member.availableHours.start} - {member.availableHours.end}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-700">稼働エリア</div>
                <div className="text-gray-600 text-sm">
                  {member.availableAreas.join(', ')}
                </div>
              </div>
            </div>

            {member.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-700">備考</div>
                  <div className="text-gray-600 text-sm">{member.notes}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;