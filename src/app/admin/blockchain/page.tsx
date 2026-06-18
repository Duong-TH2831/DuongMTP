'use client';

import React, { useState, useEffect } from 'react';
import { getDB, BlockchainTransaction } from '@/lib/db';
import { Database, Search, Filter, Hash, Clock, CheckCircle2, ChevronRight, Activity, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BlockchainTransactions() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  useEffect(() => {
    const db = getDB();
    const allTx = db.getBlockchainTransactions();
    // Sort by latest first
    allTx.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setTransactions(allTx);
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success('Đã sao chép Txn Hash');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-stone-200 bg-[#0a0a0f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide flex items-center gap-2">
            <Activity className="w-6 h-6 text-gold" />
            Giao dịch (Blockchain Explorer)
          </h1>
          <p className="text-xs text-stone-400 mt-1">Hệ thống lưu trữ và tra cứu thông tin các khoản thanh toán đã hoàn tất minh bạch trên nền tảng phân tán.</p>
        </div>
        
        {/* Network Status */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[#111118] border border-emerald-500/30 rounded-lg shadow-sm">
           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
           <div className="flex flex-col">
             <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider">Network Status</span>
             <span className="text-xs font-mono text-emerald-400 font-bold">Mainnet: Active</span>
           </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-gold/10 rounded-lg text-gold relative z-10">
            <Database className="w-6 h-6" />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] uppercase text-stone-400 font-bold">Tổng Giao Dịch (Blocks)</p>
             <p className="text-2xl font-mono font-bold text-stone-100 mt-1">{transactions.length}</p>
          </div>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-450 relative z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] uppercase text-stone-400 font-bold">Trạng Thái Xác Nhận</p>
             <p className="text-2xl font-mono font-bold text-emerald-450 mt-1">100% Khớp</p>
          </div>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-450 relative z-10">
            <Hash className="w-6 h-6" />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] uppercase text-stone-400 font-bold">Latest Block</p>
             <p className="text-2xl font-mono font-bold text-stone-100 mt-1">
               #{transactions.length > 0 ? transactions[0].blockNumber : 0}
             </p>
          </div>
        </div>
      </div>

      {/* Explorer Table Area */}
      <div className="bg-[#111118] rounded-2xl border border-gold/10 shadow-md flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gold/10 bg-[#15151e] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bằng Txn Hash / Mã Hóa Đơn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg text-xs outline-none text-stone-200 font-mono transition-colors placeholder-stone-600"
            />
          </div>
          <button className="px-4 py-2.5 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs font-bold uppercase hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gold/15 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-6 w-1/3">Txn Hash</th>
                <th className="py-3">Mã Tham Chiếu (Invoice)</th>
                <th className="py-3">Phương Thức</th>
                <th className="py-3 text-right">Value (VNĐ)</th>
                <th className="py-3 pl-8">Thời Gian Ghi Nhận</th>
                <th className="py-3 text-center pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  return (
                    <tr key={tx.id} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500/80 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
                          <span 
                            className="font-mono text-blue-400 group-hover:text-blue-300 transition-colors cursor-pointer truncate max-w-[200px]" 
                            title={tx.txHash}
                          >
                            {tx.txHash.substring(0, 16)}...{tx.txHash.substring(tx.txHash.length - 4)}
                          </span>
                          <button 
                            onClick={() => handleCopy(tx.txHash)}
                            className="p-1 text-stone-500 hover:text-stone-300 transition-colors"
                            title="Copy Txn Hash"
                          >
                            {copiedHash === tx.txHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold text-stone-300">
                        <Link href={`/admin/payment/${tx.invoiceId}`} className="hover:text-gold transition-colors flex items-center gap-1 group/link w-fit">
                          {tx.invoiceCode} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity -ml-1 text-gold" />
                        </Link>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 text-[10px] font-bold rounded bg-stone-800/80 text-stone-300 border border-stone-700 shadow-sm">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-stone-200">
                        {tx.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-4 pl-8 flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(tx.timestamp).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-4 text-center pr-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 bg-[#07070a] italic">
                    Không tìm thấy giao dịch nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
