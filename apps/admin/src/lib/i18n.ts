import { signal } from '@preact/signals'

export type Locale = 'ar' | 'en'
export const locale = signal<Locale>('ar')

export function toggleLocale(): void {
  const next = locale.value === 'ar' ? 'en' : 'ar'
  locale.value = next
  document.documentElement.lang = next
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
}

type Messages = typeof ar
const ar = {
  login: 'تسجيل الدخول',
  signup: 'إنشاء حساب',
  logout: 'تسجيل الخروج',
  stores: 'المتاجر',
  create_store: 'إنشاء متجر',
  dashboard: 'لوحة التحكم',
  collections: 'المجموعات',
  schema: 'الهيكل',
  settings: 'الإعدادات',
  team: 'الفريق',
  media: 'الوسائط',
  products: 'المنتجات',
  orders: 'الطلبات',
  customers: 'العملاء',
  categories: 'الفئات',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  search: 'بحث',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ',
  no_data: 'لا توجد بيانات',
  total: 'الإجمالي',
  status: 'الحالة',
  created_at: 'تاريخ الإنشاء',
  actions: 'الإجراءات',
  confirm_delete: 'هل أنت متأكد من الحذف؟',
  field_name: 'اسم الحقل',
  field_type: 'نوع الحقل',
  required: 'مطلوب',
  role: 'الدور',
  invite: 'دعوة',
  realtime: 'مباشر',
  permissions: 'الصلاحيات',
  currency: 'العملة',
  price: 'السعر',
  stock: 'المخزون',
  slug: 'الرابط',
} as const

const en: Messages = {
  login: 'Login',
  signup: 'Sign Up',
  logout: 'Logout',
  stores: 'Stores',
  create_store: 'Create Store',
  dashboard: 'Dashboard',
  collections: 'Collections',
  schema: 'Schema',
  settings: 'Settings',
  team: 'Team',
  media: 'Media',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  categories: 'Categories',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  loading: 'Loading...',
  error: 'An error occurred',
  no_data: 'No data',
  total: 'Total',
  status: 'Status',
  created_at: 'Created At',
  actions: 'Actions',
  confirm_delete: 'Are you sure you want to delete?',
  field_name: 'Field Name',
  field_type: 'Field Type',
  required: 'Required',
  role: 'Role',
  invite: 'Invite',
  realtime: 'Realtime',
  permissions: 'Permissions',
  currency: 'Currency',
  price: 'Price',
  stock: 'Stock',
  slug: 'Slug',
}

const messages: Record<Locale, Messages> = { ar, en }

export function t(key: keyof Messages): string {
  return messages[locale.value][key]
}
