import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Phone, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from '@/i18n/i18n';

const CrmOverview = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('crm.companies.title', 'Companies'),
      value: "24",
      change: "+12%",
      icon: Building2,
      link: "/admin/crm/companies"
    },
    {
      title: t('crm.contacts.title', 'Contacts'),
      value: "156",
      change: "+8%",
      icon: Users,
      link: "/admin/crm/contacts"
    },
    {
      title: "Active Leads",
      value: "42",
      change: "+15%",
      icon: Phone,
      link: "/admin/crm/contacts"
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5%",
      icon: TrendingUp,
      link: "/admin/crm/contacts"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('crm.title', 'CRM System')}
        </h1>
        <p className="text-muted-foreground">
          {t('crm.subtitle', 'Manage your companies and contacts')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
              <Button asChild variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                <Link to={stat.link}>View details →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('crm.companies.title', 'Companies')}
            </CardTitle>
            <CardDescription>
              Manage your company database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/admin/crm/companies/new">
                {t('crm.companies.newCompany', 'New Company')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/crm/companies">
                View All Companies
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('crm.contacts.title', 'Contacts')}
            </CardTitle>
            <CardDescription>
              Manage your contact relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/admin/crm/contacts/new">
                {t('crm.contacts.newContact', 'New Contact')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/crm/contacts">
                View All Contacts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrmOverview;