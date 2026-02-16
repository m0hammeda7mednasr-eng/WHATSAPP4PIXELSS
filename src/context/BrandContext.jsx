import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const BrandContext = createContext()

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([])
  const [currentBrand, setCurrentBrand] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    console.log('📥 Fetching brands...')
    setLoading(true)
    
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('❌ Error fetching brands:', error)
    } else {
      console.log(`✅ Loaded ${data.length} brands:`, data.map(b => b.name))
      setBrands(data)
      // Set first brand as default
      if (data.length > 0 && !currentBrand) {
        console.log('🎯 Setting default brand:', data[0].name)
        setCurrentBrand(data[0])
      }
    }
    setLoading(false)
  }

  const switchBrand = (brand) => {
    console.log('🔄 Switching to brand:', brand.name)
    setCurrentBrand(brand)
  }

  const refreshBrands = () => {
    console.log('🔄 Refreshing brands...')
    fetchBrands()
  }

  return (
    <BrandContext.Provider
      value={{
        brands,
        currentBrand,
        selectedBrand: currentBrand, // Add alias for compatibility
        switchBrand,
        refreshBrands,
        loading,
      }}
    >
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider')
  }
  return context
}
