const SUPABASE_URL = 'https://ehdcbkdpnjjtizmqieyh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZGNia2RwbmpqdGl6bXFpZXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjEyNDEsImV4cCI6MjA5NDIzNzI0MX0.OqDQR4TRIHYa4PWZSKZlkFG467C02wQRGLOebaprb3k'

export interface BlogPost {
  id: string
  created_at: string
  title: string
  slug: string
  excerpt: string | null
  content: Record<string, unknown> | null
  featured_image: string | null
  category: string
  tags: string[] | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  view_count: number
}

async function supabaseGet<T>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  const query = new URLSearchParams({ ...params })
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
  return res.json()
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  return supabaseGet<BlogPost>('blog_posts', {
    is_published: 'eq.true',
    order: 'published_at.desc',
    select: 'id,created_at,title,slug,excerpt,content,featured_image,category,tags,is_featured,published_at,view_count',
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await supabaseGet<BlogPost>('blog_posts', {
    slug: `eq.${slug}`,
    is_published: 'eq.true',
    limit: '1',
  })
  return rows[0] ?? null
}
