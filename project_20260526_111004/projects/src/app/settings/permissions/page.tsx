'use client';

import React from 'react';

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default function PermissionsPage() {
  return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">权限管理</h1>
          <p className="text-[#5A5A5A] mt-1">管理系统用户和权限配置</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#999999] mb-4">
              <UsersIcon />
            </div>
            <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">功能开发中</h2>
            <p className="text-[#5A5A5A] max-w-md">
              权限管理功能正在开发中，敬请期待。该功能将支持用户角色管理、操作权限配置等功能。
            </p>
          </div>
        </div>

        {/* 功能预览 */}
        <div className="mt-6 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB] p-6">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">即将上线的功能</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-[#EBEBEB]">
              <div className="w-10 h-10 rounded-lg bg-[#E8F0FE] flex items-center justify-center text-[#2D3BFF] mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h4 className="text-sm font-medium text-[#0A0A0A] mb-1">用户管理</h4>
              <p className="text-xs text-[#5A5A5A]">添加、编辑、禁用用户账号</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#EBEBEB]">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h4 className="text-sm font-medium text-[#0A0A0A] mb-1">角色权限</h4>
              <p className="text-xs text-[#5A5A5A]">配置不同角色的操作权限</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-[#EBEBEB]">
              <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center text-[#E65100] mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h4 className="text-sm font-medium text-[#0A0A0A] mb-1">操作审计</h4>
              <p className="text-xs text-[#5A5A5A]">记录用户操作日志和登录历史</p>
            </div>
          </div>
        </div>
      </div>
  );
}
