-- Update support tickets policy so users can see all tickets from their company
DROP POLICY IF EXISTS "Users can view their company tickets or admins can view all" ON public.support_tickets;

CREATE POLICY "Users can view all tickets from their company" 
ON public.support_tickets 
FOR SELECT 
USING (
  company_id = get_user_company(auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Also update support messages policy so users can see messages for all tickets in their company
DROP POLICY IF EXISTS "Users can view messages for their company tickets" ON public.support_messages;

CREATE POLICY "Users can view messages for all company tickets" 
ON public.support_messages 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE company_id = get_user_company(auth.uid())
  ) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update support messages insert policy to allow users to send messages to any ticket in their company
DROP POLICY IF EXISTS "Users can send messages to their company tickets" ON public.support_messages;

CREATE POLICY "Users can send messages to any company ticket" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE company_id = get_user_company(auth.uid())
  ) AND sender_id = auth.uid()
);