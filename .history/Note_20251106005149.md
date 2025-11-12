## Hướng dẫn: Khi merge request bị lỗi và GitHub yêu cầu fetch + merge vào `main`

Khi bạn gặp lỗi merge (ví dụ PR bị yêu cầu phải cập nhật từ `main`), các bước an toàn để xử lý là:

1. Kiểm tra trạng thái hiện tại

```powershell
git status
```

Đảm bảo working tree sạch trước khi tiếp tục.

2. Lấy cập nhật từ remote

```powershell
git fetch origin
```

3. Tạo branch backup từ `origin/main` (rất khuyến nghị)

```powershell
git switch -c backup/main-before-merge-backend-base origin/main
# optional: push backup lên remote
git push -u origin backup/main-before-merge-backend-base
```

4. Cập nhật `main` local

```powershell
git switch main
git pull origin main
```

5. Merge `backend/base` vào `main` (tạo merge commit)

```powershell
git merge --no-ff origin/backend/base -m "Merge branch 'backend/base' into main"
```

6. Giải quyết conflict — nếu bạn muốn chấp nhận toàn bộ thay đổi từ `backend/base` (bỏ phiên bản cũ trên `main`), chạy:

```powershell
git diff --name-only --diff-filter=U | ForEach-Object { git checkout --theirs -- $_; git add $_ }
```

Lưu ý: câu lệnh trên dùng PowerShell để lấy phiên bản "theirs" (tức `backend/base`) cho mọi file đang conflict và stage các file đó.

7. Nếu Git báo lỗi index lock (ví dụ `Unable to create .git/index.lock`), xóa lock rồi kiểm tra lại

```powershell
Remove-Item -Path '.git\index.lock' -Force -ErrorAction SilentlyContinue
git status --porcelain
```

8. Xử lý file bị xóa ở một bên nhưng sửa ở bên kia

Ví dụ: nếu file `database/bookverse-script.sql` bị xóa trên `backend/base` nhưng có thay đổi trên `main`, và bạn muốn chấp nhận việc xóa, dùng:

```powershell
git rm 'database/bookverse-script.sql'
git status
```

9. Hoàn tất merge (commit)

```powershell
git commit -m "Merge branch 'backend/base' into main - accept backend/base changes"
```

10. Đẩy `main` lên remote

```powershell
git push origin main
```

Ghi chú & mẹo an toàn

- Nếu bạn chưa chắc chắn, thay vì `git checkout --theirs` bạn có thể resolve thủ công từng file.
- Nếu muốn giữ công việc local hiện tại trước khi làm, dùng `git stash push -u -m "WIP before merge"` rồi apply sau khi merge xong.
- Nếu repository có branch protection, bạn có thể cần thực hiện merge qua Pull Request thay vì push trực tiếp.
- Nếu bạn cần khôi phục trạng thái trước merge, bạn đã có branch backup; để rollback local:

```powershell
git switch main
git reset --hard backup/main-before-merge-backend-base
```

Nếu muốn, mình có thể áp các thay đổi này vào file `Note.md` trong repo — bạn có muốn mình lưu file sửa lại không?
