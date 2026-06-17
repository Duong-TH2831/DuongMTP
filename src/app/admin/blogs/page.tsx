'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, Search, Plus, Edit, Trash2, Eye, 
  Calendar, User, ToggleLeft, ToggleRight, Check, X, 
  Image as ImageIcon, Globe, FileEdit
} from 'lucide-react';
import { getDB, Blog } from '@/lib/db';
import { toast } from 'sonner';

export default function BlogCMSPage() {
  const db = getDB();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = () => {
    setBlogs([...db.getBlogs()]);
  };

  // Auto-generate slug from title
  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setIsPublished(false);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setImageUrl(blog.image || '');
    setIsPublished(blog.isPublished);
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết.');
      return;
    }

    const slug = generateSlug(title);
    const authorId = 'usr-admin-1'; // Default author is the logged in admin

    if (editingBlog) {
      // Update
      const updated = db.updateBlog(editingBlog.id, {
        title,
        slug,
        excerpt,
        content,
        image: imageUrl || undefined,
        isPublished,
        authorId
      });
      if (updated) {
        toast.success('Cập nhật bài viết thành công.');
      } else {
        toast.error('Lỗi khi cập nhật bài viết.');
      }
    } else {
      // Create
      const created = db.createBlog({
        title,
        slug,
        excerpt,
        content,
        image: imageUrl || undefined,
        isPublished,
        authorId
      });
      if (created) {
        toast.success('Tạo bài viết mới thành công.');
      } else {
        toast.error('Lỗi khi tạo bài viết.');
      }
    }

    setIsEditorOpen(false);
    loadBlogs();
  };

  const handleTogglePublish = (blog: Blog) => {
    const updated = db.updateBlog(blog.id, { isPublished: !blog.isPublished });
    if (updated) {
      toast.success(
        `Đã ${!blog.isPublished ? 'xuất bản' : 'chuyển thành bản nháp'} bài viết: ${blog.title.substring(0, 20)}...`
      );
      loadBlogs();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      const success = db.deleteBlog(id);
      if (success) {
        toast.success('Đã xóa bài viết thành công.');
        loadBlogs();
      } else {
        toast.error('Lỗi khi xóa bài viết.');
      }
    }
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'published') return matchesSearch && blog.isPublished;
    if (statusFilter === 'draft') return matchesSearch && !blog.isPublished;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/15 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 font-cormorant tracking-wide flex items-center gap-2">
            <FileText className="w-6 h-6 text-gold" />
            Quản lý Bài viết & Tin tức (CMS)
          </h1>
          <p className="text-xs text-[#9a9080] mt-1">
            Đăng tải, cập nhật các chương trình khuyến mãi, sự kiện và cẩm nang du lịch cho khách sạn Horizon Grand Resort.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gold hover:bg-gold-light text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-black" />
          Viết bài mới
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-[#111118] p-4 rounded-xl border border-gold/10 shadow-2xl">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tóm tắt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-[#07070a] border border-gold/15 rounded-lg text-xs text-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 placeholder-stone-600 font-medium"
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex gap-1.5 p-1 bg-[#07070a] rounded-lg border border-gold/10 shrink-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'published', label: 'Đã xuất bản' },
            { id: 'draft', label: 'Bản nháp' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === tab.id 
                  ? 'bg-gold text-black shadow-sm' 
                  : 'text-[#9a9080] hover:text-stone-250'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map(blog => (
            <div 
              key={blog.id} 
              className="bg-[#111118] rounded-2xl border border-gold/10 shadow-2xl overflow-hidden flex flex-col justify-between hover:border-gold/25 transition-all group"
            >
              {/* Blog Image */}
              <div className="h-44 bg-[#07070a] relative overflow-hidden shrink-0">
                {blog.image ? (
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-600 gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px]">Chưa cài hình nền</span>
                  </div>
                )}
                
                {/* Published Badge */}
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-sm ${
                  blog.isPublished 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  {blog.isPublished ? 'Đã đăng' : 'Bản nháp'}
                </span>

                {/* View count */}
                <div className="absolute bottom-3 left-3 bg-[#0a0a0f]/80 text-stone-200 border border-gold/10 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 backdrop-blur-sm font-semibold">
                  <Eye className="w-3 h-3 text-gold" />
                  <span>{blog.views} lượt xem</span>
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-100 line-clamp-2 leading-relaxed mb-2 hover:text-gold transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-[11px] text-gold/60 font-mono mb-3 truncate">
                    /{blog.slug}
                  </p>
                  <p className="text-xs text-[#9a9080] line-clamp-3 leading-relaxed mb-4">
                    {blog.excerpt || 'Chưa có tóm tắt nội dung bài viết...'}
                  </p>
                </div>

                {/* Meta details */}
                <div className="border-t border-gold/5 pt-4 flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold/40" />
                    <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gold/40" />
                    <span>Admin</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="px-5 py-3.5 bg-[#07070a] border-t border-gold/10 flex items-center justify-between shrink-0">
                <button
                  onClick={() => handleTogglePublish(blog)}
                  className={`flex items-center gap-1 text-[11px] font-bold ${
                    blog.isPublished ? 'text-gold hover:text-gold-light' : 'text-emerald-450 hover:text-emerald-400'
                  }`}
                  title={blog.isPublished ? 'Gỡ bài xuống nháp' : 'Xuất bản công khai'}
                >
                  {blog.isPublished ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-500" />
                      <span>Nháp hóa</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-stone-500" />
                      <span>Xuất bản</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(blog)}
                    className="p-1.5 hover:bg-[#1a1a24] text-stone-400 hover:text-gold rounded-lg transition-colors"
                    title="Chỉnh sửa bài viết"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-1.5 hover:bg-red-950/20 text-red-400 rounded-lg transition-colors"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#111118] p-12 rounded-2xl border border-gold/10 shadow-2xl text-center flex flex-col items-center justify-center gap-3">
            <FileText className="w-12 h-12 text-stone-600" />
            <h3 className="text-sm font-bold text-stone-200">Không tìm thấy bài viết nào</h3>
            <p className="text-xs text-[#9a9080]">Vui lòng điều chỉnh bộ lọc hoặc viết bài mới.</p>
          </div>
        )}
      </div>
      {/* Editor Modal Overlay */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#111118] w-full max-w-4xl rounded-2xl border border-gold/15 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gold/15 flex items-center justify-between bg-[#07070a] shrink-0">
              <h2 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-gold" />
                {editingBlog ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
              </h2>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-250 rounded-lg hover:bg-[#1a1a24] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#9a9080] uppercase tracking-wider mb-1.5">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  className="w-full px-3 py-2 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30"
                />
              </div>

              {/* Slug Auto Preview */}
              {title && (
                <div className="p-2.5 bg-[#07070a] border border-gold/5 rounded-lg flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-semibold">Đường dẫn tĩnh (Slug):</span>
                  <span className="font-mono text-gold font-bold">/{generateSlug(title)}</span>
                </div>
              )}

              {/* Image & Excerpt Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image URL */}
                <div>
                  <label className="block text-[11px] font-bold text-[#9a9080] uppercase tracking-wider mb-1.5">
                    Link hình nền bài viết
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[11px] font-bold text-[#9a9080] uppercase tracking-wider mb-1.5">
                    Tóm tắt ngắn (Excerpt)
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                    className="w-full px-3 py-2 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-[11px] font-bold text-[#9a9080] uppercase tracking-wider mb-1.5">
                  Nội dung bài viết
                </label>
                <textarea
                  required
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết bằng tiếng Việt (chấp nhận markdown hoặc text thường)..."
                  className="w-full px-3 py-2 bg-[#07070a] border border-gold/15 text-stone-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/30 font-medium"
                />
              </div>

              {/* Publish option toggle */}
              <div className="flex items-center gap-3 p-4 bg-[#07070a] border border-gold/5 rounded-xl">
                <input
                  type="checkbox"
                  id="publishCheckbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-gold border-gold/20 rounded cursor-pointer"
                />
                <label htmlFor="publishCheckbox" className="text-xs font-bold text-stone-300 cursor-pointer select-none">
                  Xuất bản ngay lập tức (Hiển thị công khai lên website khách)
                </label>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gold/15 bg-[#07070a] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-gold/15 text-stone-300 hover:bg-[#1a1a24] rounded-xl text-xs font-bold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gold hover:bg-gold-light text-black px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md font-bold"
              >
                <Check className="w-4 h-4" />
                Lưu bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
