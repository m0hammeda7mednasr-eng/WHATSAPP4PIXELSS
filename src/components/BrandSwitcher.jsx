import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { ChevronDown, Check, Phone } from 'lucide-react'

export default function BrandSwitcher() {
  const { brands, currentBrand, switchBrand } = useBrand()
  const [isOpen, setIsOpen] = useState(false)

  if (brands.length <= 1) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-700 rounded-lg">
        <Phone className="w-4 h-4" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{currentBrand?.name}</p>
          <p className="text-xs opacity-90">{currentBrand?.display_phone_number}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-2 bg-green-700 hover:bg-green-800 rounded-lg transition-colors"
      >
        <Phone className="w-4 h-4" />
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm">{currentBrand?.name}</p>
          <p className="text-xs opacity-90">{currentBrand?.display_phone_number}</p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  switchBrand(brand)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                  currentBrand?.id === brand.id ? 'bg-green-50' : ''
                }`}
              >
                <Phone className="w-4 h-4 text-gray-600" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-gray-800">{brand.name}</p>
                  <p className="text-xs text-gray-500">{brand.display_phone_number}</p>
                </div>
                {currentBrand?.id === brand.id && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
