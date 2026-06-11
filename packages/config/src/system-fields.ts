export type FieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'enum'
  | 'json'
  | 'timestamp'
  | 'relation'
  | 'media'

export interface FieldDef {
  field: string
  type: FieldType
  required: boolean
  default: unknown
  label: string
  label_ar: string
  system: true
}

export const SYSTEM_FIELDS: Record<string, FieldDef[]> = {
  products: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'name', type: 'text', required: true, default: null, label: 'Name', label_ar: 'الاسم', system: true },
    { field: 'name_ar', type: 'text', required: false, default: null, label: 'Name (Arabic)', label_ar: 'الاسم بالعربي', system: true },
    { field: 'description', type: 'long_text', required: false, default: null, label: 'Description', label_ar: 'الوصف', system: true },
    { field: 'photos', type: 'json', required: false, default: '[]', label: 'Photos', label_ar: 'الصور', system: true },
    { field: 'price', type: 'integer', required: true, default: 0, label: 'Price', label_ar: 'السعر', system: true },
    { field: 'stock', type: 'integer', required: true, default: 0, label: 'Stock', label_ar: 'المخزون', system: true },
    { field: 'status', type: 'enum', required: true, default: 'draft', label: 'Status', label_ar: 'الحالة', system: true },
    { field: 'slug', type: 'text', required: true, default: null, label: 'Slug', label_ar: 'الرابط', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
    { field: 'updated_at', type: 'timestamp', required: true, default: null, label: 'Updated At', label_ar: 'تاريخ التحديث', system: true },
  ],
  categories: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'name', type: 'text', required: true, default: null, label: 'Name', label_ar: 'الاسم', system: true },
    { field: 'name_ar', type: 'text', required: false, default: null, label: 'Name (Arabic)', label_ar: 'الاسم بالعربي', system: true },
    { field: 'slug', type: 'text', required: true, default: null, label: 'Slug', label_ar: 'الرابط', system: true },
    { field: 'image', type: 'media', required: false, default: null, label: 'Image', label_ar: 'الصورة', system: true },
    { field: 'parent_id', type: 'relation', required: false, default: null, label: 'Parent Category', label_ar: 'الفئة الأم', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
  ],
  orders: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'customer_id', type: 'relation', required: false, default: null, label: 'Customer', label_ar: 'العميل', system: true },
    { field: 'status', type: 'enum', required: true, default: 'pending', label: 'Status', label_ar: 'الحالة', system: true },
    { field: 'subtotal', type: 'integer', required: true, default: 0, label: 'Subtotal', label_ar: 'المجموع الفرعي', system: true },
    { field: 'discount', type: 'integer', required: true, default: 0, label: 'Discount', label_ar: 'الخصم', system: true },
    { field: 'shipping', type: 'integer', required: true, default: 0, label: 'Shipping', label_ar: 'الشحن', system: true },
    { field: 'total', type: 'integer', required: true, default: 0, label: 'Total', label_ar: 'الإجمالي', system: true },
    { field: 'currency', type: 'text', required: true, default: 'SAR', label: 'Currency', label_ar: 'العملة', system: true },
    { field: 'notes', type: 'long_text', required: false, default: null, label: 'Notes', label_ar: 'ملاحظات', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
  ],
  order_items: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'order_id', type: 'relation', required: true, default: null, label: 'Order', label_ar: 'الطلب', system: true },
    { field: 'product_id', type: 'relation', required: true, default: null, label: 'Product', label_ar: 'المنتج', system: true },
    { field: 'quantity', type: 'integer', required: true, default: 1, label: 'Quantity', label_ar: 'الكمية', system: true },
    { field: 'unit_price', type: 'integer', required: true, default: 0, label: 'Unit Price', label_ar: 'سعر الوحدة', system: true },
    { field: 'total', type: 'integer', required: true, default: 0, label: 'Total', label_ar: 'الإجمالي', system: true },
  ],
  customers: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'name', type: 'text', required: false, default: null, label: 'Name', label_ar: 'الاسم', system: true },
    { field: 'phone', type: 'text', required: false, default: null, label: 'Phone', label_ar: 'الهاتف', system: true },
    { field: 'email', type: 'text', required: false, default: null, label: 'Email', label_ar: 'البريد الإلكتروني', system: true },
    { field: 'address_json', type: 'json', required: false, default: null, label: 'Address', label_ar: 'العنوان', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
  ],
  admins: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'store_id', type: 'text', required: true, default: null, label: 'Store ID', label_ar: 'معرف المتجر', system: true },
    { field: 'name', type: 'text', required: true, default: null, label: 'Name', label_ar: 'الاسم', system: true },
    { field: 'email', type: 'text', required: true, default: null, label: 'Email', label_ar: 'البريد الإلكتروني', system: true },
    { field: 'hashed_password', type: 'text', required: true, default: null, label: 'Password', label_ar: 'كلمة المرور', system: true },
    { field: 'role', type: 'enum', required: true, default: 'editor', label: 'Role', label_ar: 'الدور', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
  ],
  media: [
    { field: 'id', type: 'text', required: true, default: null, label: 'ID', label_ar: 'المعرف', system: true },
    { field: 'filename', type: 'text', required: true, default: null, label: 'Filename', label_ar: 'اسم الملف', system: true },
    { field: 'mime_type', type: 'text', required: true, default: null, label: 'MIME Type', label_ar: 'نوع الملف', system: true },
    { field: 'size', type: 'integer', required: true, default: 0, label: 'Size (bytes)', label_ar: 'الحجم', system: true },
    { field: 'url', type: 'text', required: true, default: null, label: 'URL', label_ar: 'الرابط', system: true },
    { field: 'created_at', type: 'timestamp', required: true, default: null, label: 'Created At', label_ar: 'تاريخ الإنشاء', system: true },
  ],
}

export const SYSTEM_COLLECTION_NAMES = Object.keys(SYSTEM_FIELDS)

export const REALTIME_DEFAULTS: Record<string, boolean> = {
  orders: true,
  order_items: false,
  products: false,
  categories: false,
  customers: false,
  admins: false,
  media: false,
}
