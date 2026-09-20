import { supabase } from './supabase'

// ─── PRODUCTS ────────────────────────────────────────────────

export async function getProducts({ section, categorySlug, search, sort, limit } = {}) {
  let query = supabase
    .from('products')
    .select(`
      id, name, slug, sku, brand, price, compare_at_price,
      stock, low_stock_threshold, is_featured, is_bestseller, status,
      category:categories(id, name, slug, section),
      images:product_images(url, alt_text, sort_order)
    `)
    .eq('status', 'ACTIVE')

  if (section) {
    query = query.eq('category.section', section)
  }
  if (categorySlug) {
    query = query.eq('category.slug', categorySlug)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  switch (sort) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'bestselling': query = query.eq('is_bestseller', true).order('created_at', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, section),
      images:product_images(id, url, alt_text, sort_order),
      variants:product_variants(id, name, option_type, sku, price_override, stock, image, is_active),
      reviews(id, author_name, rating, title, body, created_at)
    `)
    .eq('slug', slug)
    .eq('status', 'ACTIVE')
    .single()
  if (error) throw error
  return data
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ limit, sort: 'newest' })
}

// ─── CATEGORIES ──────────────────────────────────────────────

export async function getCategories(section = null) {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (section) query = query.eq('section', section)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ─── ORDERS ──────────────────────────────────────────────────

function generateOrderNumber() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${num}`
}

export async function placeOrder({ cart, form, discountCode = '', discountAmount = 0 }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = 0
  const total = subtotal - discountAmount + shippingCost

  // 1. Insert order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number:     generateOrderNumber(),
      customer_name:    form.name,
      customer_email:   form.email,
      customer_phone:   form.phone,
      shipping_line1:   form.address,
      shipping_city:    form.city,
      shipping_postal:  form.postal || '',
      shipping_country: form.country || 'Pakistan',
      subtotal,
      shipping_cost:    shippingCost,
      discount_amount:  discountAmount,
      total,
      discount_code:    discountCode || null,
      payment_method:   form.payment_method || 'COD',
      status:           'PENDING',
      payment_status:   'UNPAID',
    })
    .select()
    .single()

  if (orderErr) throw orderErr

  // 2. Insert order items
  const items = cart.map((item) => ({
    order_id:     order.id,
    product_id:   item.id,
    variant_id:   item.variant_id || null,
    product_name: item.name,
    variant_name: item.variant_name || null,
    sku:          item.sku || '',
    unit_price:   item.price,
    quantity:     item.quantity,
    line_total:   item.price * item.quantity,
  }))

  const { error: itemsErr } = await supabase.from('order_items').insert(items)
  if (itemsErr) throw itemsErr

  return order
}

// ─── DISCOUNTS ───────────────────────────────────────────────

export async function validateDiscount(code, subtotal) {
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return { valid: false, message: 'Invalid discount code.' }
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return { valid: false, message: 'Discount code has expired.' }
  if (data.min_order_amount && subtotal < data.min_order_amount)
    return { valid: false, message: `Minimum order Rs ${data.min_order_amount} required.` }
  if (data.usage_limit && data.times_used >= data.usage_limit)
    return { valid: false, message: 'Discount code usage limit reached.' }

  let amount = 0
  if (data.type === 'PERCENTAGE') amount = (subtotal * data.value) / 100
  else amount = data.value

  return { valid: true, discount: data, amount: Math.min(amount, subtotal) }
}

// ─── CONTACT ─────────────────────────────────────────────────

export async function submitContactMessage({ name, email, message }) {
  const { error } = await supabase
    .from('contact_messages')
    .insert({ name, email, message })
  if (error) throw error
  return true
}

// ─── NEWSLETTER ──────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
  if (error && error.code !== '23505') throw error // 23505 = duplicate, ignore
  return true
}

// ─── ADMIN — AUTH ────────────────────────────────────────────

export async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function adminLogout() {
  await supabase.auth.signOut()
}

export async function getAdminSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function isAdmin(userId) {
  const { data } = await supabase
    .from('admins')
    .select('id, role')
    .eq('user_id', userId)
    .single()
  return !!data
}

// ─── ADMIN — PRODUCTS ────────────────────────────────────────

export async function adminGetProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *, 
      category:categories(name, slug),
      images:product_images(id, url, sort_order)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function adminGetProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, url, alt_text, sort_order),
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function adminSaveProduct(product) {
  if (product.id) {
    const { id, category, images, variants, ...fields } = product
    const { data, error } = await supabase.from('products').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  } else {
    const { category, images, variants, ...fields } = product
    const { data, error } = await supabase.from('products').insert(fields).select().single()
    if (error) throw error
    return data
  }
}

export async function adminDeleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── ADMIN — PRODUCT IMAGES ──────────────────────────────────

export async function adminUploadProductImage(productId, file) {
  const ext = file.name.split('.').pop()
  const path = `products/${productId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: false })
  if (uploadErr) throw uploadErr

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
  const url = urlData.publicUrl

  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, sort_order: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteProductImage(imageId, url) {
  // Extract path from URL
  const path = url.split('/product-images/')[1]
  if (path) await supabase.storage.from('product-images').remove([path])
  const { error } = await supabase.from('product_images').delete().eq('id', imageId)
  if (error) throw error
}

// ─── ADMIN — ORDERS ──────────────────────────────────────────

export async function adminGetOrders({ status, limit = 50 } = {}) {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function adminGetOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, items:order_items(*)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function adminUpdateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── ADMIN — CATEGORIES ──────────────────────────────────────

export async function adminGetCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return data || []
}

export async function adminSaveCategory(cat) {
  if (cat.id) {
    const { id, ...fields } = cat
    const { data, error } = await supabase.from('categories').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from('categories').insert(cat).select().single()
    if (error) throw error
    return data
  }
}

export async function adminDeleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ─── ADMIN — DISCOUNTS ───────────────────────────────────────

export async function adminGetDiscounts() {
  const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function adminSaveDiscount(d) {
  if (d.id) {
    const { id, ...fields } = d
    const { data, error } = await supabase.from('discounts').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from('discounts').insert(d).select().single()
    if (error) throw error
    return data
  }
}

export async function adminDeleteDiscount(id) {
  const { error } = await supabase.from('discounts').delete().eq('id', id)
  if (error) throw error
}

// ─── ADMIN — MESSAGES ────────────────────────────────────────

export async function adminGetMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function adminMarkMessageRead(id) {
  await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
}

// ─── ADMIN — CUSTOMERS ───────────────────────────────────────

export async function adminGetCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ─── ADMIN — DASHBOARD STATS ─────────────────────────────────

export async function adminGetStats() {
  const today = new Date().toISOString().split('T')[0]

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('orders').select('total, status, created_at'),
    supabase.from('products').select('stock, low_stock_threshold, status'),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const orders = ordersRes.data || []
  const products = productsRes.data || []

  const todayOrders = orders.filter(o => o.created_at?.startsWith(today))
  const activeOrders = orders.filter(o => o.status !== 'CANCELLED')

  return {
    todaySales:      todayOrders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total), 0),
    totalSales:      activeOrders.reduce((s, o) => s + Number(o.total), 0),
    todayOrders:     todayOrders.length,
    totalOrders:     orders.length,
    pendingOrders:   orders.filter(o => o.status === 'PENDING').length,
    productsInStock: products.filter(p => p.stock > 0).length,
    lowStock:        products.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold).length,
    outOfStock:      products.filter(p => p.stock === 0).length,
    totalCustomers:  customersRes.count || 0,
  }
}
