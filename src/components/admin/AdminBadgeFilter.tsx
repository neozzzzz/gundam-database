// src/components/admin/AdminBadgeFilter.tsx
// Admin 페이지 공통 배지 형태 필터

'use client'

interface FilterOption {
  code: string
  name: string
  color?: string
}

interface AdminBadgeFilterProps {
  label: string
  options: FilterOption[]
  selected: string | string[]
  onSelect: (value: string) => void
  onClear?: () => void
  multiple?: boolean
  accentColor?: string // 예: 'blue', 'green', 'orange' 등
  useCustomColor?: boolean // 옵션에 지정된 color 사용 여부
}

export function AdminBadgeFilter({
  label,
  options,
  selected,
  onSelect,
  onClear,
  multiple = false,
  accentColor = 'blue',
  useCustomColor = false,
}: AdminBadgeFilterProps) {
  const isSelected = (code: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(code)
    }
    return selected === code
  }

  const hasSelection = Array.isArray(selected) ? selected.length > 0 : !!selected

  const getActiveClass = () => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600 text-white shadow-md',
      purple: 'bg-purple-600 text-white shadow-md',
      orange: 'bg-orange-600 text-white shadow-md',
      green: 'bg-green-600 text-white shadow-md',
      red: 'bg-red-600 text-white shadow-md',
      indigo: 'bg-indigo-600 text-white shadow-md',
    }
    return colorMap[accentColor] || colorMap.blue
  }

  const getClearClass = () => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 hover:text-blue-800',
      purple: 'text-purple-600 hover:text-purple-800',
      orange: 'text-orange-600 hover:text-orange-800',
      green: 'text-green-600 hover:text-green-800',
      red: 'text-red-600 hover:text-red-800',
      indigo: 'text-indigo-600 hover:text-indigo-800',
    }
    return colorMap[accentColor] || colorMap.blue
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hasSelection && onClear && (
          <button
            onClick={onClear}
            className={`text-xs ${getClearClass()}`}
          >
            전체 해제
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.length === 0 ? (
          <p className="text-sm text-gray-500">옵션이 없습니다</p>
        ) : (
          options.map((option) => {
            const active = isSelected(option.code)
            return (
              <button
                key={option.code}
                onClick={() => onSelect(option.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? useCustomColor && option.color
                      ? 'text-white shadow-md'
                      : getActiveClass()
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={active && useCustomColor && option.color ? { backgroundColor: option.color } : {}}
              >
                {option.name}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
