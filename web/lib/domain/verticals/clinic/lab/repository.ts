// Existing file, adding new methods for lab test catalog
export class LabRepository {
  // ... existing methods

  async findManyTests(tenantId: string, filters: TestFilters = {}): Promise<LabTest[]> {
    let query = this.supabase
      .from('lab_test_catalog')
      .select('*')
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .is('deleted_at', null)
      .order('category')
      .order('display_order')
      .order('name')

    if (filters.category) query = query.eq('category', filters.category)
    if (filters.sample_type) query = query.eq('sample_type', filters.sample_type)
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
    if (filters.search) {
      const safePattern = createSearchPattern(filters.search);
      query = query.or(`name.ilike.${safePattern},code.ilike.${safePattern}`)
    }

    const { data, error } = await query
    if (error) throw new Error(`Error al cargar pruebas: ${error.message}`)
    return (data || []) as LabTest[]
  }

  async findTestById(id: string): Promise<LabTest | null> {
    const { data, error } = await this.supabase
      .from('lab_test_catalog')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error al cargar prueba: ${error.message}`)
    }
    return data as LabTest
  }

  async getTestCategories(tenantId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('lab_test_catalog')
      .select('category')
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .is('deleted_at', null)
      .eq('is_active', true)

    if (error) throw new Error(`Error al cargar categorías: ${error.message}`)
    const categories = [...new Set(data?.map((t) => t.category) || [])]
    return categories.sort()
  }
}