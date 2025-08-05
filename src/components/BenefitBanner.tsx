import React from 'react';

const BenefitBanner = () => {
  const benefits = [
    "30 % günstiger",
    "Start in 7 Tagen", 
    "Geprüfte Remote-Fachkräfte",
    "Geld-zurück-Garantie",
    "Keine Headhunter-Fee",
    "Remote & DSGVO-konform",
    "Skalierung jederzeit möglich",
    "Kein Recruiting-Aufwand",
    "Zeitzonen-kompatibel (+/-2 h)",
    "Onboarding in < 1 Tag"
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