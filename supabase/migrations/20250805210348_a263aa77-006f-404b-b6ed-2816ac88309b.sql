-- Manuell einen Test durchführen um zu sehen ob die Funktion funktioniert
DO $$
DECLARE
    test_message_id UUID := 'e0fb346f-3cca-4ab3-bc59-e16f0466a0e3'; -- Die neueste Test-Nachricht
    test_record RECORD;
BEGIN
    -- Erstelle ein Test-Record wie NEW im Trigger
    SELECT 
        id,
        ticket_id,
        content,
        sender_id,
        is_internal
    INTO test_record
    FROM support_messages 
    WHERE id = test_message_id;
    
    RAISE LOG 'Manueller Test gestartet für Nachricht: %', test_record;
    
    -- Führe die Trigger-Funktion manuell aus (simuliert)
    RAISE LOG 'Teste ob die Funktion aufrufbar ist...';
    
END $$;