import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = i18n.language || 'de';

  const changeLanguage = (lng: string) => {
    const pathWithoutLang = location.pathname.replace(/^\/(de|en)/, '') || '/';
    const newPath = `/${lng}${pathWithoutLang}`;
    
    i18n.changeLanguage(lng);
    navigate(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase font-medium">{currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('de')}
          className={currentLanguage === 'de' ? 'bg-muted' : ''}
        >
          <span className="mr-2">🇩🇪</span>
          Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={currentLanguage === 'en' ? 'bg-muted' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;