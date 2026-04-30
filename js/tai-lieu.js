document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('documentsList');

    try {
        let allDocs = []; // Mảng chứa tổng hợp tất cả tài liệu

        // 1. LẤY LINK TỪ DATABASE (Google Drive, Youtube...)
        const { data: dbLinks, error: dbError } = await _supabase
            .from('external_links')
            .select('*');
            
        if (!dbError && dbLinks) {
            dbLinks.forEach(item => {
                allDocs.push({
                    name: item.title,
                    url: item.url,
                    time: new Date(item.created_at).getTime(),
                    type: 'Trang ngoài' // Đánh dấu là link ngoài
                });
            });
        }

        // 2. LẤY FILE TỪ STORAGE (PDF, MP3, Ảnh...)
        const { data: storageFiles, error: stError } = await _supabase.storage.from('tai-lieu').list('', { limit: 100 });
        
        if (!stError && storageFiles) {
            storageFiles.forEach(file => {
                // Bỏ qua file rác hệ thống
                if (file.name === '.emptyFolderPlaceholder') return;
                
                // Lấy link tải
                const { data } = _supabase.storage.from('tai-lieu').getPublicUrl(file.name);
                
                // Xóa dải số thời gian ở đầu tên file cho đẹp
                let displayName = file.name;
                if (displayName.includes('_')) {
                    displayName = displayName.split('_').slice(1).join('_');
                }

                allDocs.push({
                    name: displayName,
                    url: data.publicUrl,
                    time: new Date(file.created_at).getTime(),
                    type: 'File hệ thống'
                });
            });
        }

        // Xóa dòng chữ "Đang tải dữ liệu..."
        listContainer.innerHTML = '';

        // Kiểm tra nếu chưa có tài liệu nào
        if (allDocs.length === 0) {
            listContainer.innerHTML = '<p>Hiện tại chưa có tài liệu nào.</p>';
            return;
        }

        // Sắp xếp tài liệu: Cái nào mới thêm sẽ nổi lên trên cùng
        allDocs.sort((a, b) => b.time - a.time);

        // Hiển thị ra màn hình HTML
        allDocs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            
            // Icon cho sinh động: Link ngoài thì hình mắt xích, File thì hình kẹp ghim
            const icon = doc.type === 'Trang ngoài' ? '🔗' : '📎';

            card.innerHTML = `
                <div class="doc-name" style="font-weight: bold; margin-bottom: 15px; color: #333;">
                    ${icon} ${doc.name}
                </div>
                <a href="${doc.url}" target="_blank" class="btn btn-primary" style="text-align: center; text-decoration: none; padding: 8px; display: block;">Xem / Tải về</a>
            `;
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Lỗi khi tải danh sách:', error);
        listContainer.innerHTML = '<p style="color:red;">Lỗi kết nối máy chủ. Vui lòng thử lại sau.</p>';
    }
});
