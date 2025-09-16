import React from 'react';
import { useTranslation } from 'react-i18next';

const BenefitBanner = () => {
  const { t } = useTranslation();
  
  const benefits = [
    t('benefits.cheaper'),
    t('benefits.onboarding'),
    t('benefits.verified'),
    t('benefits.noHeadhunterFee'),
    t('benefits.gdprCompliant'),
    t('benefits.scalable'),
    t('benefits.noRecruiting'),
    t('benefits.timezoneCompatible'),
    t('benefits.available247')
  ];

  return (
    <div className="bg-neutral-50 h-12 flex items-center overflow-hidden border-b">
      <div className="animate-slide-text hover:animate-none flex items-center gap-12 whitespace-nowrap min-w-max">
        {/* First set */}
        {benefits.map((benefit, index) => (
          <span key={index} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            {benefit} <span className="text-primary text-lg">•</span>
          </span>
        ))}
        
        {/* Second set for seamless loop */}
        {benefits.map((benefit, index) => (
          <span key={`duplicate-${index}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            {benefit} <span className="text-primary text-lg">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default BenefitBanner;