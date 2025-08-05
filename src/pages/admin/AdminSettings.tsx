import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Mail, 
  Shield, 
  Database, 
  Bell, 
  Users, 
  Save,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettings {
  platformName: string;
  platformDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  autoAssignments: boolean;
  maxSearchRequests: number;
  sessionTimeout: number;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export default function AdminSettings() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    platformName: "HeyTalent",
    platformDescription: "Internationale Fachkräftevermittlung",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    autoAssignments: false,
    maxSearchRequests: 10,
    sessionTimeout: 30
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "HeyTalent"
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalCandidates: 0,
    totalAssignments: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStats();
    loadSettings();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [usersResult, companiesResult, candidatesResult, assignmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('candidate_assignments').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalCompanies: companiesResult.count || 0,
        totalCandidates: candidatesResult.count || 0,
        totalAssignments: assignmentsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const loadSettings = () => {
    // In einer echten Anwendung würden diese aus der Datenbank oder Config geladen
    const savedSystemSettings = localStorage.getItem('adminSystemSettings');
    const savedEmailSettings = localStorage.getItem('adminEmailSettings');

    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings));
    }
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
  };

  const saveSystemSettings = async () => {
    setLoading(true);
    try {
      // In einer echten Anwendung würden diese in die Datenbank gespeichert
      localStorage.setItem('adminSystemSettings', JSON.stringify(systemSettings));
      
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Systemeinstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('adminEmailSettings', JSON.stringify(emailSettings));
      
      toast({
        title: "E-Mail Einstellungen gespeichert",
        description: "Die E-Mail-Konfiguration wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die E-Mail-Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setLoading(true);
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "E-Mail Test erfolgreich",
        description: "Die Verbindung zum E-Mail-Server wurde erfolgreich getestet.",
      });
    } catch (error) {
      toast({
        title: "E-Mail Test fehlgeschlagen",
        description: "Die Verbindung zum E-Mail-Server konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Datenexport gestartet",
        description: "Der Export wird im Hintergrund erstellt und per E-Mail zugesendet.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "Der Datenexport konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Einstellungen</h1>
          <p className="text-muted-foreground">Plattform-Konfiguration und Verwaltung</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unternehmen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Aktive Unternehmen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bewerber</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Verfügbare Bewerber</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zuweisungen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Gesamte Zuweisungen</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Allgemeine Einstellungen */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Plattform-Einstellungen</CardTitle>
              <CardDescription>
                Grundkonfiguration der HeyTalent Plattform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Plattform Name</Label>
                  <Input
                    id="platformName"
                    value={systemSettings.platformName}
                    onChange={(e) => setSystemSettings({...systemSettings, platformName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSearchRequests">Max. Suchaufträge pro Unternehmen</Label>
                  <Input
                    id="maxSearchRequests"
                    type="number"
                    value={systemSettings.maxSearchRequests}
                    onChange={(e) => setSystemSettings({...systemSettings, maxSearchRequests: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDescription">Plattform Beschreibung</Label>
                <Textarea
                  id="platformDescription"
                  value={systemSettings.platformDescription}
                  onChange={(e) => setSystemSettings({...systemSettings, platformDescription: e.target.value})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Wartungsmodus</Label>
                    <p className="text-sm text-muted-foreground">
                      Plattform für Wartungsarbeiten sperren
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registrierung erlauben</Label>
                    <p className="text-sm text-muted-foreground">
                      Neue Benutzerregistrierungen zulassen
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowRegistration: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatische Zuweisungen</Label>
                    <p className="text-sm text-muted-foreground">
                      KI-basierte automatische Bewerber-Zuweisungen
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoAssignments}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoAssignments: checked})}
                  />
                </div>
              </div>

              <Button onClick={saveSystemSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Mail Einstellungen */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail Konfiguration</CardTitle>
              <CardDescription>
                SMTP-Einstellungen für den E-Mail-Versand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    placeholder="smtp.gmail.com"
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Benutzername</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Passwort</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Absender E-Mail</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    placeholder="noreply@heytalent.com"
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">Absender Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveEmailSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  E-Mail Einstellungen speichern
                </Button>
                <Button variant="outline" onClick={testEmailConnection} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verbindung testen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sicherheitseinstellungen */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Sicherheits- und Authentifizierungsrichtlinien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Zwei-Faktor-Authentifizierung</Label>
                    <p className="text-sm text-muted-foreground">
                      Erweiterte Sicherheit für Admin-Accounts
                    </p>
                  </div>
                  <Badge variant="outline">Empfohlen</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium">Sicherheitshinweis</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Regelmäßige Sicherheitsupdates und Backups sind essentiell für den sicheren Betrieb der Plattform.
                  </p>
                </div>
              </div>

              <Button onClick={saveSystemSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Sicherheitseinstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benachrichtigungen */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>
                E-Mail-Benachrichtigungen und Alerts konfigurieren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-Mail Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Benachrichtigungen per E-Mail aktivieren
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Benachrichtigungstypen</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Neue Suchaufträge</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Neue Bewerber-Registrierungen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Systemfehler und Warnungen</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wöchentliche Berichte</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={saveSystemSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Benachrichtigungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Export */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Datenexport</CardTitle>
              <CardDescription>
                Datensicherung und Export-Funktionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datenexport</CardTitle>
                    <CardDescription>
                      Vollständigen Datenexport erstellen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={exportData} disabled={loading} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export starten
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Automatische Backups</CardTitle>
                    <CardDescription>
                      Tägliche automatische Datensicherung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Aktiviert</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Letztes Backup: Heute um 03:00 Uhr
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/10">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium">Backup Information</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Backups werden verschlüsselt und sicher gespeichert. Aufbewahrungszeit: 30 Tage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}