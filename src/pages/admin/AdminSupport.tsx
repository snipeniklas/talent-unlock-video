import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, User, Settings, Building2, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n/i18n";
import { de, enUS, nl } from 'date-fns/locale';

const AdminSupport = () => {
  const { t, lang } = useTranslation();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInternalMessage, setIsInternalMessage] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get date locale based on current language
  const getDateLocale = () => {
    switch (lang) {
      case 'de': return de;
      case 'nl': return nl;
      default: return enUS;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : 'en-US');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : 'en-US');
  };

  // Fetch current user data
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return user;
    }
  });

  // Fetch all support tickets (admin can see all)
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['adminSupportTickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data: ticketsData, error } = await query;
      if (error) throw error;

      // Get related data separately
      const creatorIds = [...new Set(ticketsData?.map(t => t.created_by) || [])];
      const companyIds = [...new Set(ticketsData?.map(t => t.company_id).filter(Boolean) || [])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', creatorIds);

      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      // Combine data
      const ticketsWithRelations = ticketsData?.map(ticket => ({
        ...ticket,
        profiles: profiles?.find(p => p.user_id === ticket.created_by),
        companies: companies?.find(c => c.id === ticket.company_id)
      }));
      
      return ticketsWithRelations || [];
    }
  });

  // Fetch messages for selected ticket
  const { data: messages = [] } = useQuery({
    queryKey: ['adminSupportMessages', selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      
      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicket)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;

      // Get sender profiles with roles
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, content, isInternal }: { ticketId: string; content: string; isInternal: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          content,
          sender_id: user.id,
          is_internal: isInternal
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportMessages', selectedTicket] });
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      setNewMessage('');
    }
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      toast({
        title: t('adminSupport.toast.updated'),
        description: t('adminSupport.toast.updatedDesc'),
      });
    }
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_to: user.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      toast({
        title: t('adminSupport.toast.assigned'),
        description: t('adminSupport.toast.assignedDesc'),
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
      .channel('admin_support_tickets_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_tickets' 
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('admin_support_messages_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'support_messages' 
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['adminSupportMessages', selectedTicket] });
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
    sendMessageMutation.mutate({ 
      ticketId: selectedTicket, 
      content: newMessage, 
      isInternal: isInternalMessage 
    });
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

  const getStatusLabel = (status: string) => {
    const statusKey = status as 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
    return t(`adminSupport.status.${statusKey}`) || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityKey = priority as 'low' | 'medium' | 'high' | 'urgent';
    return t(`adminSupport.priority.${priorityKey}`) || priority;
  };

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            {t('adminSupport.header.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('adminSupport.header.description')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminSupport.filters.all')}</SelectItem>
                <SelectItem value="open">{t('adminSupport.filters.open')}</SelectItem>
                <SelectItem value="in_progress">{t('adminSupport.filters.inProgress')}</SelectItem>
                <SelectItem value="resolved">{t('adminSupport.filters.resolved')}</SelectItem>
                <SelectItem value="closed">{t('adminSupport.filters.closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Tickets Liste */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('adminSupport.ticketsList.title')} ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {ticketsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t('adminSupport.ticketsList.loading')}
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t('adminSupport.ticketsList.empty')}
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
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span>{ticket.companies?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{ticket.profiles?.first_name} {ticket.profiles?.last_name}</span>
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
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedTicketData.title}
                      <Badge variant="outline" className="text-xs">
                        #{selectedTicketData.id.slice(-8)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedTicketData.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{selectedTicketData.companies?.name}</span>
                      <span>•</span>
                      <User className="w-4 h-4" />
                      <span>{selectedTicketData.profiles?.first_name} {selectedTicketData.profiles?.last_name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(selectedTicketData.priority)}>
                      {getPriorityLabel(selectedTicketData.priority)}
                    </Badge>
                    <Select
                      value={selectedTicketData.status}
                      onValueChange={(status) => 
                        updateTicketMutation.mutate({ 
                          ticketId: selectedTicket, 
                          updates: { status } 
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">{t('adminSupport.status.open')}</SelectItem>
                        <SelectItem value="in_progress">{t('adminSupport.status.in_progress')}</SelectItem>
                        <SelectItem value="resolved">{t('adminSupport.status.resolved')}</SelectItem>
                        <SelectItem value="closed">{t('adminSupport.status.closed')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedTicketData.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => assignTicketMutation.mutate(selectedTicket)}
                        disabled={assignTicketMutation.isPending}
                      >
                        {t('adminSupport.actions.assignToMe')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] p-4">
                  <div className="space-y-4">
                    {messages.map((message: any) => {
                      const senderIsAdmin = message.user_roles?.some((ur: any) => ur.role === 'admin');
                      const isCurrentUser = message.sender_id === currentUser?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={senderIsAdmin ? 'bg-primary text-white' : 'bg-secondary'}>
                                {senderIsAdmin ? <Settings className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {isCurrentUser 
                                  ? t('adminSupport.chat.youAdmin')
                                  : `${message.profiles?.first_name} ${message.profiles?.last_name}`
                                }
                              </span>
                              {senderIsAdmin && !isCurrentUser && (
                                <Badge variant="secondary" className="text-xs">{t('adminSupport.chat.adminBadge')}</Badge>
                              )}
                              {message.is_internal && (
                                <Badge variant="destructive" className="text-xs">{t('adminSupport.chat.internalBadge')}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(message.created_at)}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg ${
                              isCurrentUser 
                                ? message.is_internal 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-primary text-white'
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                          {isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-white">
                                <Settings className="w-4 h-4" />
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
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternalMessage}
                      onChange={(e) => setIsInternalMessage(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="internal" className="text-sm font-medium">
                      {t('adminSupport.chat.internalLabel')}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('adminSupport.chat.messagePlaceholder')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                      className={isInternalMessage ? 'bg-orange-500 hover:bg-orange-600' : ''}
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
                <p>{t('adminSupport.chat.selectTicket')}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSupport;
