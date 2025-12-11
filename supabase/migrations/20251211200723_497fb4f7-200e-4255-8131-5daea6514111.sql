-- Activate the trigger to auto-add contacts to campaigns when they're added to a contact list
CREATE TRIGGER on_contact_list_member_added
  AFTER INSERT ON public.crm_contact_list_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_contact_to_campaigns();