import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Kontakt & Erstgespräch
            </h1>
            <p className="text-xl text-muted-foreground">
              Lassen Sie uns über Ihre Remote-Fachkräfte-Anforderungen sprechen
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Sprechen Sie uns an</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">E-Mail</div>
                    <div className="text-muted-foreground">kontakt@heytalent.de</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Telefon</div>
                    <div className="text-muted-foreground">+49 (0) 30 12345678</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Adresse</div>
                    <div className="text-muted-foreground">Berlin, Deutschland</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Geschäftszeiten</div>
                    <div className="text-muted-foreground">Mo-Fr 9:00-18:00 Uhr</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Kostenloses Beratungsgespräch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Vorname" />
                  <Input placeholder="Nachname" />
                </div>
                <Input placeholder="E-Mail-Adresse" type="email" />
                <Input placeholder="Unternehmen" />
                <Input placeholder="Telefon" />
                <Textarea placeholder="Beschreiben Sie Ihren Remote-Fachkräfte-Bedarf..." className="h-32" />
                <Button className="w-full bg-primary hover:bg-primary-hover">
                  Beratungstermin anfragen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
};

export default Contact;