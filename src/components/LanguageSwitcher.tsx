import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";

export default function LanguageSwitcher() {
  // Add error handling for translation context
  let lang = 'de';
  let setLang = (newLang: string) => {};
  
  try {
    const translation = useTranslation();
    lang = translation.lang;
    setLang = translation.setLang;
  } catch (error) {
    // If translation context is not available yet, use defaults
    console.warn('Translation context not available, using defaults');
  }

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="w-auto min-w-[120px] h-9">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {languages.find(l => l.code === lang)?.name}
            </span>
            <span className="sm:hidden">
              {languages.find(l => l.code === lang)?.flag}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}