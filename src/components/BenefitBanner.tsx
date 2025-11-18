import React from 'react';
import { useTranslation } from '@/i18n/i18n';

const BenefitBanner = () => {
  const { get } = useTranslation();
  const items = get<string[]>('benefitBanner.items', []);

  return (
    <div className="bg-neutral-50 h-12 flex items-center overflow-hidden border-b">
      <div className="animate-slide-text flex items-center gap-12 whitespace-nowrap min-w-max">
        {/* First set */}
        {items.map((benefit, index) => (
          <span key={index} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            {benefit} <span className="text-primary text-lg">•</span>
          </span>
        ))}
        
        {/* Second set for seamless loop */}
        {items.map((benefit, index) => (
          <span key={`duplicate-${index}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            {benefit} <span className="text-primary text-lg">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default BenefitBanner;