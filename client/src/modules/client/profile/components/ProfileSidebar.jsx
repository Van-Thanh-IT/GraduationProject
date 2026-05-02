import React from 'react';
import { Upload } from 'antd';
import { Camera, ShieldCheck, User } from 'lucide-react';
import dayjs from 'dayjs';

export default function ProfileSidebar({ profile, previewImage, handleBeforeUpload }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
      <div className="relative group cursor-pointer mb-4">
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
        >
          <div className="w-32 h-32 rounded-full border-4 border-indigo-50 overflow-hidden shadow-md relative bg-white">
            {previewImage ? (
              <img src={previewImage} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
            {/* Overlay khi hover */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
        </Upload>
        <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white pointer-events-none">
          <Camera size={14} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800">{profile?.username}</h2>
      
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {profile?.roles?.map(role => (
          <span key={role.id} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase">
            <ShieldCheck size={14} /> {role.name}
          </span>
        ))}
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${profile?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {profile?.status}
        </span>
      </div>

      <div className="w-full h-px bg-gray-100 my-5"></div>

      <div className="w-full space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Đăng nhập qua</span>
          <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{profile?.provider}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Ngày tham gia</span>
          <span className="font-bold text-gray-700">
            {dayjs(profile?.createdAt).format('DD/MM/YYYY')}
          </span>
        </div>
      </div>
    </div>
  );
}