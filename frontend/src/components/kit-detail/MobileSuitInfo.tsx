// components/kit-detail/MobileSuitInfo.tsx

interface MobileSuitInfoProps {
  kit: any
}

export function MobileSuitInfo({ kit }: MobileSuitInfoProps) {
  const mobileSuit = kit.mobile_suits
  
  if (!mobileSuit) {
    return null
  }

  const factionData = mobileSuit.factions
  
  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <span>🤖</span>
        모빌슈트 정보
      </h3>
      
      {/* 기본 정보 그룹 */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 space-y-3">
        <h4 className="text-white text-sm font-semibold mb-3">기본 정보</h4>
        
        {/* 기체명 */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-3">
          <span className="text-gray-500 text-sm">기체명</span>
          <span className="text-white text-sm text-right">
            {mobileSuit.name_ko || mobileSuit.name || '-'}
          </span>
        </div>

        {/* 영문명 */}
        {mobileSuit.name_en && (
          <div className="flex justify-between items-start border-b border-gray-800 pb-3">
            <span className="text-gray-500 text-sm">영문명</span>
            <span className="text-gray-400 text-sm text-right">
              {mobileSuit.name_en}
            </span>
          </div>
        )}

        {/* 모델 넘버 */}
        {mobileSuit.model_number && (
          <div className="flex justify-between items-start border-b border-gray-800 pb-3">
            <span className="text-gray-500 text-sm">모델 넘버</span>
            <span className="text-blue-400 text-sm font-mono text-right">
              {mobileSuit.model_number}
            </span>
          </div>
        )}

        {/* 코드 */}
        {mobileSuit.code && (
          <div className="flex justify-between items-start border-b border-gray-800 pb-3">
            <span className="text-gray-500 text-sm">코드</span>
            <span className="text-white text-sm font-mono text-right">
              {mobileSuit.code}
            </span>
          </div>
        )}

        {/* 베이스 모델 */}
        {mobileSuit.base_model && (
          <div className="flex justify-between items-start pb-3 last:border-0 last:pb-0">
            <span className="text-gray-500 text-sm">베이스</span>
            <span className="text-gray-400 text-sm text-right">
              {mobileSuit.base_model}
            </span>
          </div>
        )}
      </div>

      {/* 소속/파일럿 그룹 */}
      {(factionData || mobileSuit.pilot) && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 space-y-3">
          <h4 className="text-white text-sm font-semibold mb-3">소속 및 파일럿</h4>
          
          {/* 진영 정보 */}
          {factionData && (
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <span className="text-gray-500 text-sm">소속</span>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span 
                    className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: factionData.color || '#666' }}
                  >
                    {factionData.name_ko}
                  </span>
                  {factionData.universe && (
                    <span className="text-xs text-gray-500">
                      ({factionData.universe})
                    </span>
                  )}
                </div>
                {factionData.name_en && (
                  <span className="text-xs text-gray-500 block">
                    {factionData.name_en}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 파일럿 */}
          {mobileSuit.pilot && (
            <div className="flex justify-between items-start last:border-0 last:pb-0">
              <span className="text-gray-500 text-sm">파일럿</span>
              <span className="text-white text-sm text-right">
                {mobileSuit.pilot}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 제원 그룹 */}
      {(mobileSuit.height || mobileSuit.weight) && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 space-y-3">
          <h4 className="text-white text-sm font-semibold mb-3">제원</h4>
          
          {mobileSuit.height && (
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <span className="text-gray-500 text-sm">전고</span>
              <span className="text-gray-400 text-sm text-right">
                {mobileSuit.height}
              </span>
            </div>
          )}

          {mobileSuit.weight && (
            <div className="flex justify-between items-start last:border-0 last:pb-0">
              <span className="text-gray-500 text-sm">중량</span>
              <span className="text-gray-400 text-sm text-right">
                {mobileSuit.weight}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 설명 */}
      {mobileSuit.description && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
          <h4 className="text-white text-sm font-semibold mb-3">설명</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            {mobileSuit.description}
          </p>
        </div>
      )}
    </div>
  )
}
