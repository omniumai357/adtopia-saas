"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from "lucide-react";

interface AgencyPartner {
  id: string;
  agency_name: string;
  contact_email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  commission_rate: number;
  monthly_quota: number;
  current_month_sales: number;
  total_sales: number;
  total_commission_earned: number;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  created_at: string;
  white_label_settings: any;
}

interface AgencySales {
  id: string;
  agency_id: string;
  sale_amount: number;
  commission_earned: number;
  product_tier: string;
  sale_date: string;
}

export default function AgencyPartnersPage() {
  const [agencies, setAgencies] = useState<AgencyPartner[]>([]);
  const [sales, setSales] = useState<AgencySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_agencies: 0,
    active_agencies: 0,
    pending_approvals: 0,
    total_commission_paid: 0,
    monthly_revenue: 0
  });

  useEffect(() => {
    fetchAgencyData();
  }, []);

  const fetchAgencyData = async () => {
    try {
      // Fetch agencies
      const agenciesResponse = await fetch('/api/admin/agency-partners');
      const agenciesData = await agenciesResponse.json();
      setAgencies(agenciesData.agencies || []);

      // Fetch sales
      const salesResponse = await fetch('/api/admin/agency-sales');
      const salesData = await salesResponse.json();
      setSales(salesData.sales || []);

      // Calculate stats
      const totalAgencies = agenciesData.agencies?.length || 0;
      const activeAgencies = agenciesData.agencies?.filter((a: AgencyPartner) => a.status === 'active').length || 0;
      const pendingApprovals = agenciesData.agencies?.filter((a: AgencyPartner) => a.status === 'pending').length || 0;
      const totalCommissionPaid = agenciesData.agencies?.reduce((sum: number, a: AgencyPartner) => sum + a.total_commission_earned, 0) || 0;
      const monthlyRevenue = salesData.sales?.reduce((sum: number, s: AgencySales) => sum + s.sale_amount, 0) || 0;

      setStats({
        total_agencies: totalAgencies,
        active_agencies: activeAgencies,
        pending_approvals: pendingApprovals,
        total_commission_paid: totalCommissionPaid,
        monthly_revenue: monthlyRevenue
      });

    } catch (error) {
      console.error('Error fetching agency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading agency partners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agency Partners</h1>
          <p className="text-gray-600">Manage white-label agency partnerships and commission tracking</p>
        </div>
        <Button onClick={fetchAgencyData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_agencies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_agencies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_approvals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_commission_paid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthly_revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agency Partners Table */}
      <Tabs defaultValue="agencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agencies">Agency Partners</TabsTrigger>
          <TabsTrigger value="sales">Sales Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Partners</CardTitle>
              <CardDescription>Manage white-label agency partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agencies.map((agency) => (
                  <div key={agency.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-semibold">{agency.agency_name}</h3>
                          <p className="text-sm text-gray-600">{agency.contact_email}</p>
                        </div>
                        <Badge className={getTierColor(agency.tier)}>
                          {agency.tier}
                        </Badge>
                        <Badge className={getStatusColor(agency.status)}>
                          {agency.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {agency.current_month_sales}/{agency.monthly_quota} sales
                        </div>
                        <div className="text-sm font-medium">
                          ${agency.total_commission_earned.toFixed(2)} earned
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Commission: {(agency.commission_rate * 100).toFixed(1)}%</span>
                      <span>Quota: {agency.monthly_quota}/month</span>
                      <span>Total Sales: {agency.total_sales}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Tracking</CardTitle>
              <CardDescription>Monitor agency sales and commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Sale #{sale.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${sale.sale_amount.toFixed(2)}</div>
                        <div className="text-sm text-green-600">
                          +${sale.commission_earned.toFixed(2)} commission
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline">{sale.product_tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Track agency partner performance and revenue impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Revenue Impact</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Direct Sales Model:</span>
                      <span>$2,500/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agency Partner Model:</span>
                      <span>${stats.monthly_revenue.toFixed(2)}/month</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Revenue Increase:</span>
                      <span className="text-green-600">
                        {((stats.monthly_revenue / 2500 - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Scaling Projection</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Month 1 (3 agencies):</span>
                      <span>$1,687</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Month 3 (10 agencies):</span>
                      <span>$5,625</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Month 6 (25 agencies):</span>
                      <span>$14,062</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Month 12 (50+ agencies):</span>
                      <span>$28,125+</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
