import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Plus, Send, Clock, AlertCircle, CheckCircle2, User, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'resource_request';
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  company_id: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  content: string;
  sender_id: string;
  is_internal: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  user_roles?: {
    role: string;
  }[];
}

const Support = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketData, setNewTicketData] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user data including roles
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      return { ...user, profile, userRoles };
    }
  });

  const isAdmin = currentUser?.userRoles?.some((ur: any) => ur.role === 'admin');

  // Fetch support tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;

      // Get related profiles separately
      const creatorIds = [...new Set(ticketsData?.map(t => t.created_by) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', creatorIds);

      // Combine data
      const ticketsWithProfiles = ticketsData?.map(ticket => ({
        ...ticket,
        profiles: profiles?.find(p => p.user_id === ticket.created_by)
      }));
      
      return ticketsWithProfiles || [];
    }
  });

  // Fetch messages for selected ticket
  const { data: messages = [] } = useQuery({
    queryKey: ['supportMessages', selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicket)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;

      // Then get sender profiles with roles
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds);

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', senderIds);

      // Combine data
      const messagesWithProfiles = messagesData?.map(message => {
        const profile = profiles?.find(p => p.user_id === message.sender_id);
        const roles = userRoles?.filter(ur => ur.user_id === message.sender_id) || [];
        return {
          ...message,
          profiles: profile,
          user_roles: roles
        };
      });
      
      return messagesWithProfiles || [];
    },
    enabled: !!selectedTicket
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicketData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticketData,
          created_by: user.id,
          company_id: profile?.company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setShowCreateForm(false);
      setSelectedTicket(data.id);
      setNewTicketData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      toast({
        title: "Ticket erstellt",
        description: "Ihr Support-Ticket wurde erfolgreich erstellt.",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          content,
          sender_id: user.id,
          is_internal: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportMessages', selectedTicket] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setNewMessage('');
    }
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      toast({
        title: "Status aktualisiert",
        description: "Der Ticket-Status wurde erfolgreich aktualisiert.",
      });
    }
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscriptions
  useEffect(() => {
    const ticketsChannel = supabase
      .channel('support_tickets_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_tickets' 
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('support_messages_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_messages' 
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['supportMessages', selectedTicket] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedTicket, queryClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    sendMessageMutation.mutate({ ticketId: selectedTicket, content: newMessage });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            <span className="text-primary">Support</span> Chat
          </h1>
          <p className="text-muted-foreground">
            Direkter Kontakt zu unserem Support-Team
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Neues Ticket
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Tickets Liste */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
              {ticketsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Tickets werden geladen...
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Noch keine Tickets vorhanden
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {tickets.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedTicket === ticket.id ? 'bg-primary/10 border-primary' : 'border-border'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{ticket.title}</h4>
                        <Badge variant={getStatusColor(ticket.status)} className="text-xs">
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                          {ticket.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Bereich */}
        <Card className="lg:col-span-2">
          {selectedTicket && selectedTicketData ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{selectedTicketData.title}</CardTitle>
                    <CardDescription>{selectedTicketData.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(selectedTicketData.priority)}>
                      {selectedTicketData.priority}
                    </Badge>
                    {isAdmin && (
                      <Select
                        value={selectedTicketData.status}
                        onValueChange={(status) => 
                          updateTicketMutation.mutate({ ticketId: selectedTicket, status })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Offen</SelectItem>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="resolved">Gelöst</SelectItem>
                          <SelectItem value="closed">Geschlossen</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-420px)] min-h-[300px] p-4">
                  <div className="space-y-4">
                    {messages.map((message: any) => {
                      const isAdmin = message.user_roles?.some((ur: any) => ur.role === 'admin');
                      const isCurrentUser = message.sender_id === currentUser?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={isAdmin ? 'bg-primary text-white' : 'bg-secondary'}>
                                {isAdmin ? <Settings className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {isCurrentUser 
                                  ? 'Sie' 
                                  : `${message.profiles?.first_name} ${message.profiles?.last_name}`
                                }
                              </span>
                              {isAdmin && !isCurrentUser && (
                                <Badge variant="secondary" className="text-xs">Support</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleString('de-DE')}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-primary text-white' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                          {isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-white">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nachricht eingeben..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Wählen Sie ein Ticket aus, um den Chat zu starten</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Neues Support-Ticket</CardTitle>
              <CardDescription>
                Beschreiben Sie Ihr Anliegen so detailliert wie möglich
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input
                  placeholder="Kurze Beschreibung des Problems"
                  value={newTicketData.title}
                  onChange={(e) => setNewTicketData(prev => ({...prev, title: e.target.value}))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea
                  placeholder="Detaillierte Beschreibung des Problems oder der Anfrage"
                  rows={4}
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData(prev => ({...prev, description: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kategorie</label>
                  <Select
                    value={newTicketData.category}
                    onValueChange={(value: any) => setNewTicketData(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Allgemein</SelectItem>
                      <SelectItem value="technical">Technisch</SelectItem>
                      <SelectItem value="billing">Abrechnung</SelectItem>
                      <SelectItem value="resource_request">Ressourcen-Anfrage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priorität</label>
                  <Select
                    value={newTicketData.priority}
                    onValueChange={(value: any) => setNewTicketData(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="urgent">Dringend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => createTicketMutation.mutate(newTicketData)}
                  disabled={!newTicketData.title.trim() || createTicketMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ticket erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Support;