'use client';

import React, { useState, useEffect } from 'react';
import { getDB } from '@/lib/db';
import { Block } from '@/lib/blockchain';
import { Database, Search, Filter, Hash, Clock, CheckCircle2, ChevronRight, Activity, Copy, Check, XCircle, Link as LinkIcon, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BlockchainTransactions() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isChainValid, setIsChainValid] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  useEffect(() => {
    const db = getDB();
    const chain = db.getBlockchain();
    setIsChainValid(db.validateBlockchain());
    
    // Create a copy to sort, latest first
    const sortedBlocks = [...chain].sort((a, b) => b.index - a.index);
    setBlocks(sortedBlocks);
  }, []);

  const filteredBlocks = blocks.filter(b => {
    const matchSearch = b.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.previousHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (b.transactions.length > 0 && b.transactions[0].invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()));
                        
    const matchPayment = paymentMethodFilter === 'ALL' || 
                         (b.transactions.length > 0 && b.transactions[0].paymentMethod === paymentMethodFilter);
                         
    return matchSearch && matchPayment;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success('Đã sao chép Hash');
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
             <p className="text-2xl font-mono font-bold text-stone-100 mt-1">{blocks.length}</p>
          </div>
        </div>
        <div className="bg-[#111118] p-5 rounded-xl border border-gold/10 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={`p-3 rounded-lg relative z-10 ${isChainValid ? 'bg-emerald-500/10 text-emerald-450' : 'bg-red-500/10 text-red-500'}`}>
            {isChainValid ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div className="relative z-10">
             <p className="text-[10px] uppercase text-stone-400 font-bold">Trạng Thái Xác Nhận</p>
             <p className={`text-xl font-mono font-bold mt-1 ${isChainValid ? 'text-emerald-450' : 'text-red-500'}`}>
               {isChainValid ? 'Hợp lệ (Toàn vẹn)' : 'CẢNH BÁO: Bị sửa đổi!'}
             </p>
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
               #{blocks.length > 0 ? blocks[0].index : 0}
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
              placeholder="Tìm kiếm bằng Hash / Mã Hóa Đơn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#07070a] border border-gold/15 focus:border-gold/30 rounded-lg text-xs outline-none text-stone-200 font-mono transition-colors placeholder-stone-600"
            />
          </div>
          <button 
            onClick={() => {
              if(window.confirm('Bạn có chắc muốn làm mới toàn bộ dữ liệu Blockchain (Xóa LocalStorage)? Điều này sẽ khôi phục dữ liệu về trạng thái ban đầu.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 bg-red-950/30 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            Làm Mới Data
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-4 py-2.5 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs font-bold uppercase hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> {paymentMethodFilter === 'ALL' ? 'Filter' : paymentMethodFilter}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111118] border border-gold/20 rounded-lg shadow-xl z-50 py-2">
                <p className="px-4 py-1.5 text-[10px] text-stone-500 uppercase font-bold tracking-wider">Phương Thức Thanh Toán</p>
                {['ALL', 'VNPAY', 'CARD', 'TRANSFER', 'CASH'].map(method => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethodFilter(method);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${paymentMethodFilter === method ? 'bg-gold/10 text-gold' : 'text-stone-300 hover:bg-[#1a1a24] hover:text-stone-100'}`}
                  >
                    {method === 'ALL' ? 'Tất cả phương thức' : method}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gold/15 text-[#9a9080] font-semibold bg-[#07070a]/50">
                <th className="py-3 pl-6">Block #</th>
                <th className="py-3">Current Hash</th>
                <th className="py-3">Previous Hash</th>
                <th className="py-3 text-center">Nonce</th>
                <th className="py-3">Giao Dịch (Tx)</th>
                <th className="py-3 text-right">Value (VNĐ)</th>
                <th className="py-3 pl-6">Thời Gian</th>
                <th className="py-3 text-center pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlocks.length > 0 ? (
                filteredBlocks.map((block) => {
                  const tx = block.transactions[0]; // Each block in our demo has 0 or 1 transaction
                  const isGenesis = block.index === 0;
                  
                  return (
                    <tr key={block.hash} className="border-b border-gold/10 hover:bg-[#1a1a24]/50 transition-colors group">
                      {/* Block # */}
                      <td className="py-4 pl-6 font-bold text-stone-300">
                        {isGenesis ? (
                          <span className="px-2 py-1 bg-gold/20 text-gold rounded text-[10px] uppercase">Genesis Block</span>
                        ) : (
                          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-stone-500" /> #{block.index}</span>
                        )}
                      </td>
                      
                      {/* Current Hash */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                          <span 
                            className="font-mono text-blue-400 group-hover:text-blue-300 transition-colors cursor-pointer" 
                            title={block.hash}
                          >
                            {block.hash.substring(0, 10)}...{block.hash.substring(block.hash.length - 8)}
                          </span>
                          <button onClick={() => handleCopy(block.hash)} className="p-1 text-stone-500 hover:text-stone-300" title="Copy Current Hash">
                            {copiedHash === block.hash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Previous Hash */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-mono text-stone-400" title={block.previousHash}>
                            {block.previousHash === '0' ? '0' : `${block.previousHash.substring(0, 10)}...${block.previousHash.substring(block.previousHash.length - 8)}`}
                          </span>
                        </div>
                      </td>

                      {/* Nonce */}
                      <td className="py-4 text-center">
                         <span className="font-mono text-stone-300 bg-stone-800/80 px-2 py-1 rounded shadow-inner">
                           {block.nonce}
                         </span>
                      </td>

                      {/* Transaction Info */}
                      <td className="py-4 font-mono font-bold text-stone-300">
                        {tx ? (
                          <div className="flex flex-col gap-1.5">
                            <Link href={`/admin/payment/${tx.invoiceId}`} className="hover:text-gold transition-colors flex items-center gap-1 group/link w-fit">
                              {tx.invoiceCode} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity -ml-1 text-gold" />
                            </Link>
                            <span className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                              tx.paymentMethod === 'VNPAY' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 
                              tx.paymentMethod === 'CARD' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                              tx.paymentMethod === 'TRANSFER' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                              'bg-stone-800 text-stone-400 border-stone-700'
                            }`}>
                              {tx.paymentMethod === 'VNPAY' ? '🔷 VNPAY' : 
                               tx.paymentMethod === 'CARD' ? '💳 CARD' : 
                               tx.paymentMethod === 'TRANSFER' ? '🏦 TRANSFER' : 
                               '💵 CASH'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-600 italic">No Tx (Genesis)</span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="py-4 text-right font-mono font-bold text-stone-200">
                        {tx ? `${tx.amount.toLocaleString('vi-VN')}đ` : '-'}
                      </td>

                      {/* Time */}
                      <td className="py-4 pl-6 flex items-center gap-1.5 text-stone-400 font-mono text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(block.timestamp).toLocaleString('vi-VN', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 text-center pr-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500 bg-[#07070a] italic">
                    Không tìm thấy block nào phù hợp.
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
