document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('documentsList');

    try {
        let allDocs = []; 

        // 1. LẤY LINK TỪ DATABASE
        const { data: dbLinks, error: dbError } = await _supabase.from('external_links').select('*');
        console.log('DB links:', dbLinks);
        console.log('DB error:', dbError);
        if (!dbError && dbLinks) {
            dbLinks.forEach(item => {
                allDocs.push({
                    name: item.title, url: item.url,
                    time: new Date(item.created_at).getTime(), type: 'Trang ngoài'
                });
            });
        }
        // 2. LẤY FILE TỪ STORAGE (Quét ở root)
        const { data: storageFiles, error: stError } = await _supabase.storage.from('tai-lieu').list('', { limit: 100 });
        console.log('Storage files:', storageFiles);   // <-- ADD THIS
        console.log('Storage error:', stError);
        if (!stError && storageFiles) {
            storageFiles.forEach(file => {
                // Bỏ qua thư mục hoặc file rác (thư mục thường không có id)
                if (!file.id || file.name === '.emptyFolderPlaceholder') return;
                
                // Lấy link
                const { data } = _supabase.storage.from('tai-lieu').getPublicUrl(file.name);
                
                // Xử lý tên cho đẹp
                let displayName = file.name;
                if (displayName.includes('_')) {
                    displayName = displayName.split('_').slice(1).join('_');
                }

                allDocs.push({
                    name: displayName, url: data.publicUrl,
                    time: new Date(file.created_at).getTime(), type: 'File hệ thống'
                });
            });
        }

        listContainer.innerHTML = '';

        if (allDocs.length === 0) {
            listContainer.innerHTML = '<p>Hiện tại chưa có tài liệu nào.</p>';
            return;
        }

        allDocs.sort((a, b) => b.time - a.time);

        allDocs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            const icon = doc.type === 'Trang ngoài' ? '🔗' : '📎';

            card.innerHTML = `
                <div class="doc-name">${icon} ${doc.name}</div>
                <a href="${doc.url}" target="_blank" class="btn btn-primary" style="text-align: center; text-decoration: none; padding: 10px; display: block; border-radius: 4px;">Xem / Tải về</a>
            `;
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Lỗi khi tải danh sách:', error);
        listContainer.innerHTML = '<p style="color:red;">Lỗi kết nối máy chủ. Vui lòng thử lại sau.</p>';
    }
});
