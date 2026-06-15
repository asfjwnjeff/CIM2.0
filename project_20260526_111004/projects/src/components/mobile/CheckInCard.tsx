'use client';

import React, { useState, useRef } from 'react';

interface CheckInRecord {
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
  photos: string[];
}

interface CheckInCardProps {
  records: CheckInRecord[];
  onRecordsChange: (records: CheckInRecord[]) => void;
}

export default function CheckInCard({ records, onRecordsChange }: CheckInCardProps) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckIn = () => {
    setCheckingIn(true);
    setCheckInError('');

    if (!navigator.geolocation) {
      setCheckInError('浏览器不支持定位功能');
      setCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const now = new Date().toISOString();

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`
        )
          .then((r) => r.json())
          .then((data) => {
            onRecordsChange([
              ...records,
              {
                lat,
                lng,
                address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                timestamp: now,
                photos: [],
              },
            ]);
            setCheckingIn(false);
          })
          .catch(() => {
            onRecordsChange([
              ...records,
              {
                lat,
                lng,
                address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                timestamp: now,
                photos: [],
              },
            ]);
            setCheckingIn(false);
          });
      },
      (err) => {
        setCheckInError('定位失败：' + (err.message || '请检查定位权限'));
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (recordIndex: number) => {
    const input = fileInputRef.current;
    if (!input) return;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const updated = [...records];
        updated[recordIndex] = {
          ...updated[recordIndex],
          photos: [...updated[recordIndex].photos, base64],
        };
        onRecordsChange(updated);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveRecord = (index: number) => {
    onRecordsChange(records.filter((_, i) => i !== index));
  };

  const handleRemovePhoto = (recordIndex: number, photoIndex: number) => {
    const updated = [...records];
    updated[recordIndex] = {
      ...updated[recordIndex],
      photos: updated[recordIndex].photos.filter((_, i) => i !== photoIndex),
    };
    onRecordsChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#0A0A0A]">📍 上门打卡</span>
        <button
          type="button"
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            checkingIn
              ? 'bg-[#E8EBFF] text-[#2D3BFF]'
              : 'bg-[#0D8A5E] text-white active:bg-[#0A6E4A]'
          }`}
          onClick={handleCheckIn}
          disabled={checkingIn}
        >
          {checkingIn ? '定位中...' : '打卡签到'}
        </button>
      </div>

      {checkInError && (
        <div className="text-xs text-[#D63031] bg-[#FFEBEE] px-3 py-2 rounded-lg">{checkInError}</div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />

      {records.length === 0 && !checkingIn && (
        <div className="text-xs text-[#999999] py-4 text-center border border-dashed border-[#D5D5D5] rounded-lg">
          点击"打卡签到"记录当前位置
        </div>
      )}

      {records.map((record, idx) => (
        <div key={record.timestamp + idx} className="bg-[#F5F5F5] rounded-lg p-3 space-y-2">
          {/* 打卡信息 */}
          <div className="flex items-start justify-between">
            <div className="text-xs space-y-0.5">
              <div className="text-[#5A5A5A]">
                📍 {record.address.slice(0, 60)}{record.address.length > 60 ? '...' : ''}
              </div>
              <div className="text-[#999999]">
                🕐 {new Date(record.timestamp).toLocaleString('zh-CN')}
              </div>
              <div className="text-[#999999]">
                📐 {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-[#D63031] shrink-0"
              onClick={() => handleRemoveRecord(idx)}
            >
              删除
            </button>
          </div>

          {/* 现场照片 */}
          <div className="flex flex-wrap gap-2">
            {record.photos.map((photo, pIdx) => (
              <div key={pIdx} className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#EBEBEB]">
                <img src={photo} alt="现场照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/40 rounded-full flex items-center justify-center text-white text-[10px]"
                  onClick={() => handleRemovePhoto(idx, pIdx)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-16 h-16 rounded-lg border border-dashed border-[#D5D5D5] flex items-center justify-center text-[#999999] active:bg-[#F5F5F5]"
              onClick={() => handlePhotoUpload(idx)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
