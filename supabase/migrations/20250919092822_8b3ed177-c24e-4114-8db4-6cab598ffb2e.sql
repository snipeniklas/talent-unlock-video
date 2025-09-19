-- Zuerst alle bestehenden Policies für user_roles anzeigen
-- und dann die problematischen Policies entfernen und neu erstellen

-- Alle bestehenden Policies für user_roles löschen
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "User roles can be assigned during registration" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can assign roles to any user" ON public.user_roles;

-- Neue, klarere Policies erstellen
-- Admins können alle user_roles Operationen durchführen
CREATE POLICY "Admins have full access to user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Benutzer können ihre eigenen Rollen anzeigen
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Rollen können während der Registrierung erstellt werden
CREATE POLICY "Allow role creation during registration" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Benutzer können Rollen in ihrem Unternehmen sehen (für die Anzeige)
CREATE POLICY "Users can view company roles" 
ON public.user_roles 
FOR SELECT 
USING (
    user_id IN (
        SELECT p.user_id 
        FROM profiles p 
        WHERE p.company_id = get_user_company(auth.uid())
    )
);