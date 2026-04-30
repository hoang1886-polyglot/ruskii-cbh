document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');

    uploadBtn.addEventListener('click', async () => {
        // 1. Kiểm tra xem đã chọn file chưa
        const file = fileInput.files[0];
        if (!file) {
            alert('Vui lòng chọn một file trước khi tải lên!');
            return;
        }

        // 2. Kiểm tra xem đã đăng nhập chưa (để bảo mật)
        const { data: { session } } = await _supabase.auth.getSession();
        if (!session) {
            alert('Bạn cần đăng nhập bằng tài khoản Admin để tải file lên!');
            return;
        }

        // Đổi chữ trên nút để biết đang xử lý
        uploadBtn.innerText = 'Đang tải lên...';
        uploadBtn.disabled = true;
        uploadStatus.innerHTML = '';

        try {
            // Lấy tên file gốc, thay thế khoảng trắng bằng dấu gạch ngang cho an toàn
            const fileName = file.name.replace(/\s+/g, '-');
            const filePath = `tai-lieu/${Date.now()}_${fileName}`; // Thêm thời gian để tên file không bị trùng

            // 3. Gọi lệnh upload lên Supabase (Vào bucket tên là 'tai-lieu')
            const { data, error } = await _supabase.storage
                .from('tai-lieu') // TÊN BUCKET (Bạn phải tạo tên này trên web Supabase)
                .upload(filePath, file);

            if (error) {
                throw error;
            }

            // 4. Nếu thành công, lấy đường link Public để xài
            const { data: publicUrlData } = _supabase.storage
                .from('tai-lieu')
                .getPublicUrl(filePath);

            const fileUrl = publicUrlData.publicUrl;

            // Hiển thị thông báo và link file
            uploadStatus.innerHTML = `
                <p>✅ Tải lên thành công!</p>
                <p><strong>Link file của bạn:</strong></p>
                <a href="${fileUrl}" target="_blank">${fileUrl}</a>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">(Bạn có thể copy link này dán vào file JSON bài thi)</p>
            `;
            
            // Xóa file đã chọn để chuẩn bị cho lần up sau
            fileInput.value = ''; 

        } catch (error) {
            console.error('Lỗi upload:', error);
            uploadStatus.innerHTML = `<span style="color: red;">❌ Lỗi: ${error.message}</span>`;
        } finally {
            // Khôi phục lại nút bấm
            uploadBtn.innerText = 'Tiến hành Tải lên';
            uploadBtn.disabled = false;
        }
    });
});