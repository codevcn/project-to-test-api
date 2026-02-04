# UI Style & Coding Instructions

Tài liệu này định nghĩa **các quy tắc UI / style bắt buộc** mà AI agent phải tuân thủ trước và trong quá trình viết code cho dự án.

---

## 1. Theme chính của trang web

- Theme chủ đạo của website **được định nghĩa tại** `src/styles/app.scss` và `src/styles/fonts.scss`
- Mọi màu sắc, font, spacing, style phải **bám sát** nội dung trong 2 file này
- **Không tự ý tạo theme mới** hoặc thêm style lớn không có trong 2 file này
- Ưu tiên sử dụng:
  - CSS variables
  - class đã được định nghĩa sẵn

---

## 2. Quy tắc về spacing (padding & margin)

- **Không sử dụng padding hoặc margin quá lớn** cho bất kỳ element nào

### ❌ Không được dùng

- `padding: 25px` trở lên
- `margin: 25px` trở lên
- Khoảng trắng quá lớn gây cảm giác UI bị “phình”

### ✅ Nên dùng

- Spacing nhỏ / vừa theo theme (ví dụ: 4px, 8px, 12px, 16px…)
- Spacing đã có sẵn trong `src/styles/app.scss`
- Giữ layout gọn, cân đối, nhất quán

---

## 3. Không sử dụng màu gradient

- **Tuyệt đối không dùng gradient** dưới bất kỳ hình thức nào:
  - `linear-gradient`
  - `radial-gradient`
  - background gradient

- Chỉ sử dụng **màu đơn sắc (flat color)** theo palette trong `app.scss`

---

## 4. Sử dụng SVG cho tất cả icon & emoji

- **Tất cả icon và emoji bắt buộc phải dùng SVG**
- SVG có thể là:
  - Inline SVG
  - SVG component (React / Vue / Svelte...)

### ❌ Không được phép

- Không dùng ký tự emoji trực tiếp trong text (🙂 ❤️ 🚀 …)
- Không dùng font-icon
- Không dùng PNG / JPG cho icon

### ✅ Ví dụ đúng

```html
<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
  <path d="..." />
</svg>
```

### ❌ Ví dụ sai

```html
<span>🙂</span>
```

- Với tất cả icon dùng thẻ `<svg>`, **bắt buộc set kích thước bằng Tailwind class** (`w-*`, `h-*`)
- **Không được** dùng attr `width` / `height` trực tiếp trên thẻ `<svg>`

✅ Ví dụ đúng

```tsx
<svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
  <path d="..." />
</svg>
```

❌ Ví dụ sai

```tsx
<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
  <path d="..." />
</svg>
```

---

## 5. Quy tắc khai báo TypeScript types

- **Bắt buộc sử dụng keyword `type`** cho tất cả các khai báo kiểu dữ liệu trong TypeScript.
- **Không được sử dụng `interface`** cho các type thông thường.
- Tên mỗi type phải bắt đầu bằng chữ cái "T" viết hoa.
- Tên mỗi interface phải bắt đầu bằng chữ cái "I" viết hoa.
- **Không được khai báo type tại chỗ**, phải khai báo type ở scope cao nhất của file.

### ✅ Trường hợp duy nhất được phép dùng `interface`

- Chỉ sử dụng `interface` khi khai báo **để một `class` implement**.

### ✅ Ví dụ đúng

```ts
type User = {
  id: string
  name: string
  email: string
}

type ApiResponse<T> = {
  data: T
  error?: string
}

interface Repository {
  save(data: unknown): void
}

class UserRepository implements Repository {
  save(data: unknown) {
    // implementation
  }
}
```

### ❌ Ví dụ sai

```ts
interface User {
  id: string
  name: string
}

interface ApiResponse<T> {
  data: T
}
```

---

## 6. Quy tắc cho Modal / Popup / Overlay components

Đối với tất cả các component dạng:

- Modal
- Popup
- Dialog
- Overlay
- Drawer
- Tooltip lớn / Floating panel

**BẮT BUỘC tuân thủ các quy tắc sau:**

---

### 6.1. Bắt buộc ưu tiên sử dụng `createPortal`

- Modal / Popup **không được render trực tiếp trong DOM tree hiện tại**
- Phải render bằng `createPortal` để:
  - Tránh lỗi `overflow: hidden`
  - Không bị ảnh hưởng bởi `z-index` của parent
  - Đảm bảo luôn nổi trên UI

### ✅ Ví dụ đúng

```tsx
createPortal(<ModalContent />, document.body)
```

### ❌ Ví dụ sai

```tsx
return <div className="modal">...</div>
```

---

### 6.2. Bắt buộc có lớp nền (backdrop) riêng để xử lý `onClose`

- Modal / Popup phải có **1 lớp nền (overlay/backdrop) riêng biệt**
- Lớp nền này:
  - Phủ toàn màn hình (`fixed inset-0`)
  - Dùng để bắt sự kiện click gọi `onClose`
  - Tách biệt rõ với nội dung chính

### ✅ Cấu trúc bắt buộc

```tsx
<div className="fixed inset-0 flex items-center justify-center z-1000 animate-pop-in p-2">
  {/* Backdrop */}
  <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>

  {/* Main content */}
  <div className="relative z-20 flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden">
    {/* header, body, footer... */}
  </div>
</div>
```

---

### ❌ Không được làm

- Không gộp backdrop và content vào cùng một div
- Không bắt `onClose` trực tiếp trên wrapper của content
- Không render modal trong layout cha (VD: trong sidebar, card, table, …)
- Không để modal bị ảnh hưởng bởi `position: relative` của parent

## 7. Quy tắc về hàm

- Hàm phải được khai báo với tên cụ thể, **không được khai báo hàm mà không có tên**.
- **Hạn chế** khai báo hàm ngay trong trình lắng nghe sự kiện của component.

### ✅ Ví dụ đúng

```ts
function calculateTotal(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0)
}
const fetchData = async (url: string): Promise<Response> => {
  return await fetch(url)
}

const todo = () => {
  console.log('123')
}
<Text onTouchStart={todo}>
  Touch me
</Text>
```

### ❌ Ví dụ sai

```ts
const calculateTotal = function (amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0)
}

<Text onTouchStart={() => {
  console.log("Touched")
}}>
  Touch me
</Text>
```
