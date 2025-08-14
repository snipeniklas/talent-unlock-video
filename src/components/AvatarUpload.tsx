import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  candidateId?: string;
  firstName?: string;
  lastName?: string;
  onAvatarChange: (url: string | null) => void;
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  candidateId, 
  firstName, 
  lastName, 
  onAvatarChange 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = () => {
    if (!firstName && !lastName) return '?';
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}`;
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidateId || Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      onAvatarChange(publicUrl);

      toast({
        title: "Erfolg",
        description: "Profilbild wurde hochgeladen.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fehler",
        description: "Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!avatarUrl) return;
    
    setUploading(true);
    try {
      const fileName = avatarUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('avatars').remove([fileName]);
      }
      
      setAvatarUrl(null);
      onAvatarChange(null);

      toast({
        title: "Erfolg",
        description: "Profilbild wurde entfernt.",
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Fehler",
        description: "Profilbild konnte nicht entfernt werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Bilddatei aus.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Die Datei ist zu groß. Maximal 5MB erlaubt.",
        variant: "destructive",
      });
      return;
    }

    uploadAvatar(file);
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl || undefined} alt="Profilbild" />
        <AvatarFallback className="text-lg font-semibold bg-primary/10">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {avatarUrl ? 'Ändern' : 'Hochladen'}
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={uploading}
              className="flex items-center gap-2 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
              Entfernen
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG oder GIF bis 5MB
        </p>
      </div>
    </div>
  );
}