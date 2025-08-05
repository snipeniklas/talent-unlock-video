import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, FileText, BarChart, Settings, Lock, Shield } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

const ResourceHub = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Resource Hub - Ihr Login-Bereich
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Zugang zu Ihren Remote-Fachkräften, Projekten und allen wichtigen Ressourcen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Fachkräfte-Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Verwalten Sie Ihre Remote-Teams und Kandidaten</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Projekt-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alle Ihre Projekte und Anfragen im Überblick</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Leistungsberichte und Projekterfolg</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover" asChild>
              <a href="/auth">Zum Login-Bereich <ArrowRight className="w-5 h-5 ml-2" /></a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourceHub;