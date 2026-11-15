# Tiệm bánh Mochee – thiệp mời sinh nhật 1 tuổi bé An Vy

Trang mời dự tiệc sinh nhật đầu tiên của bé **Trần Đặng An Vy (Mochee)** – 17:30, Chủ nhật 22/11/2026, Nhà hàng Hương Phố (sảnh Grand Ruby).

- **Mở đầu:** mặt tiền tiệm bánh mochi, chạm vào cửa thì cửa mở và "bước vào" trang.
- **Cột trái (hẹp, kiểu bếp bánh):** thanh treo dụng cụ, 20 tấm ảnh xếp dọc xen đồ làm bánh (phới, cây cán bột, túi bắt kem, cupcake, dango, vịt con…). Trên quầy bánh dính ở đáy màn hình có bé Mochee 3D (hoạt hình, viền sticker), cuộn tới đâu bé lớn tới đó: lật → trườn → bò → đứng → đi, tới chiếc bánh có nến số 1.
- **Cột phải (phần chính):** dây cờ, ảnh cận mặt bé trên đĩa bánh, "Tiệc sinh nhật đầu tiên của Mochee", đếm ngược, phiếu hẹn kèm bản đồ, form xác nhận tham dự, sổ lời chúc, album ảnh.
- **Điện thoại:** tự xếp thành một cột (thiệp mời → hành trình ảnh → xác nhận, lời chúc, album).
- **`/admin`:** trang riêng cho ba mẹ xem danh sách khách, tải CSV, xoá lời chúc không phù hợp.

## Công nghệ

| Phần | Dùng gì |
| --- | --- |
| Khung | Next.js 16 (App Router) + React 19 + TypeScript |
| 3D | three.js – bé Mochee dựng bằng khối cơ bản, không cần file model |
| Dữ liệu | SQLite qua `@libsql/client`: file `data/mochee.db` khi chạy local, Turso khi lên Vercel |
| Giao diện | CSS thuần (`src/app/globals.css`), font Baloo 2 + Quicksand tự host qua Fontsource |

## Chạy trên máy

Cần Node.js 20.9 trở lên.

```bash
npm install
npm run dev        # mở http://localhost:3000
```

Không cần cấu hình gì: lần đầu có người gửi form, file SQLite `data/mochee.db` tự được tạo.
Muốn dùng trang `/admin` ở local thì tạo file `.env.local` với một dòng `ADMIN_KEY=chuoi-bi-mat-cua-ban`.

## Đưa lên Vercel

1. Đẩy thư mục này lên một repo GitHub (nên để **private** vì có ảnh của bé), rồi vào vercel.com → **Add New → Project** → chọn repo → **Deploy**. Hoặc chạy `npx vercel` ngay trong thư mục.
2. **Gắn SQLite (bắt buộc để dữ liệu không mất).** Vercel không cho ghi file lâu dài, nên SQLite chạy trên Turso:
   - Trong project Vercel: **Storage → Create Database → Turso** (Marketplace), tạo một database và **Connect** vào project. Vercel tự thêm hai biến `TURSO_DATABASE_URL` và `TURSO_AUTH_TOKEN`. Nếu tên biến được tạo ra khác, hãy thêm tay đúng hai tên này.
   - Hoặc tự tạo bằng Turso CLI: `turso db create mochee`, `turso db show mochee --url`, `turso db tokens create mochee`, rồi dán vào **Settings → Environment Variables**.
3. Thêm biến `ADMIN_KEY` (một chuỗi bí mật đủ dài) để mở trang `/admin`.
4. (Tuỳ chọn) Thêm `NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban` để ảnh xem trước khi chia sẻ qua Zalo/Facebook trỏ đúng link.
5. **Redeploy** để các biến có hiệu lực. Bảng dữ liệu được tạo tự động ở lần gọi đầu tiên.

> Chưa gắn Turso thì trang vẫn chạy, nhưng dữ liệu nằm ở bộ nhớ tạm `/tmp` của Vercel và **sẽ mất** khi máy chủ khởi động lại. Trang `/admin` sẽ hiện cảnh báo trong trường hợp này.

### Kiểm tra đã nối Turso chưa

Mở `https://<tên-miền>/api/health`:

- `"mode": "turso"` – đã lưu vào Turso, dữ liệu giữ lâu dài.
- `"mode": "vercel-tmp"` – Vercel **chưa** đưa biến Turso vào bản đang chạy: dữ liệu sẽ mất. Kiểm tra lại các bước dưới.

Nếu dữ liệu "biến mất" sau khi gắn Turso:

1. Dữ liệu gửi **trước** khi gắn Turso nằm ở bộ nhớ tạm của Vercel và đã mất, không khôi phục được. Database Turso mới tạo luôn trống.
2. Sau khi thêm hoặc sửa biến môi trường phải **Redeploy** (Deployments → ⋯ → Redeploy); bản deploy cũ không tự nhận biến mới.
3. Biến phải bật cho đúng môi trường (Production / Preview) của đường link anh đang mở. Link dạng `…-git-…vercel.app` là Preview.
4. Mỗi lần "Create Database" là một database mới, trống. Chỉ giữ một database và connect nó vào project.
5. Code tự nhận cả biến có tiền tố (vd. `STORAGE_TURSO_DATABASE_URL`), và `/admin` hiện đang lưu ở đâu.

## Sửa nội dung

| Muốn đổi | Sửa ở |
| --- | --- |
| Tên bé, ngày giờ, địa điểm, link album | `src/lib/site.ts` |
| File lịch tải về | `public/sinh-nhat-mochee.ics` (giờ ghi theo UTC) |
| Danh sách 20 ảnh, tên các "mẻ bánh", mô tả ảnh | `src/lib/photos.ts` |
| Ảnh lấy thêm từ album Shotpik | `src/lib/album.ts` (xoá dòng nào thì ảnh đó không hiện) |
| Lời mời, tiêu đề | `src/app/page.tsx` |
| Màu sắc, cỡ chữ | biến `--…` ở đầu `src/app/globals.css` |
| Dáng điệu, tốc độ của bé 3D | các hàm `supine`, `prone`, `commando`, `crawl`, `stand`, `walk`, `cheer` và `poseAt` trong `src/three/poses.ts` |
| Hình dáng, màu áo, giày, bánh của cảnh 3D | `src/three/mocheeStage.ts` |
| Mốc chuyển chặng (lật/trườn/bò/đứng/đi) | `src/three/milestones.ts` và hàm `poseAt` trong `poses.ts` |

### Thay ảnh

Ảnh trong `public/photos/*.jpg` đã được thu về cạnh dài 1800px, bản xem nhanh nằm ở `public/photos/thumbs/*.webp`.
Khi thay ảnh, chép ảnh mới (đã thu nhỏ) vào `public/photos/`, rồi chạy lại:

```bash
python3 scripts/prepare-images.py public scripts/face-source.jpg   # cần Pillow: pip install pillow
```

Lệnh này tạo lại thumbnail, in ra kích thước + màu nền từng ảnh (để cập nhật `src/lib/photos.ts`) và cắt lại ảnh cận mặt `public/mochee-face.*` từ `scripts/face-source.jpg` (vùng cắt lấy từ ảnh gốc JOY_3892).

## Cấu trúc

```
src/
  app/
    page.tsx            bố cục 2 cột + thiệp mời
    layout.tsx          font, metadata, ảnh chia sẻ
    globals.css         toàn bộ giao diện
    admin/page.tsx      trang quản trị
    api/rsvp/           POST xác nhận tham dự · GET tổng số khách
    api/wishes/         GET/POST lời chúc (phân trang)
    api/admin/          GET toàn bộ dữ liệu · DELETE một dòng (cần ADMIN_KEY)
  components/           Intro, Journey, BabyStage, Countdown, PartyInfo, RsvpForm, Wishes, Album, Lightbox,
                        Decor (vịt, mochi, icon), Bakery (đồ làm bánh vẽ bằng SVG)
  lib/                  site (thông tin tiệc), photos, album, db (SQLite), guard (kiểm tra dữ liệu, chống spam)
  three/                mocheeStage (bé 3D + vịt + bánh), poses (tư thế), milestones
public/                 ảnh, ảnh chia sẻ og.jpg, file lịch .ics
```

## API và dữ liệu

```sql
rsvps  (id, name, guests 1–20, note, created_at)
wishes (id, name, message, flavor, created_at)
```

- Dữ liệu gửi lên được cắt độ dài, bỏ ký tự điều khiển và luôn ghi bằng câu lệnh có tham số.
- Mỗi địa chỉ IP gửi tối đa 6 lần/phút cho mỗi form; có thêm ô ẩn để bẫy bot.
- Danh sách khách chỉ đọc được qua `/api/admin` với header `x-admin-key`.

## Lưu ý

- Trang đặt `noindex` nên Google không lập chỉ mục; ai có link vẫn xem được.
- Bản đồ là Google Maps nhúng, ảnh album tải trực tiếp từ Shotpik. Nếu album bị xoá hoặc đổi quyền, phần album tự ẩn các ảnh lỗi và vẫn còn nút mở album.
- Bé 3D cần WebGL. Máy không hỗ trợ sẽ thấy một chú vịt thay thế, các phần khác không ảnh hưởng.
