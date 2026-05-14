'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Activity, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { WINDOW_OUTER_SHELL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalHits: number;
  totalUsers: number;
  totalRevenue: number;
  recentPayments: {
    id: string;
    email: string;
    amount: number;
    tier: string;
    created_at: string;
  }[];
  recentUsers: {
    id: string;
    full_name: string | null;
    created_at: string;
    subscription_tier: string | null;
  }[];
}

const generateMockData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    hits: Math.floor(Math.random() * 500) + 1000,
    conversions: Math.floor(Math.random() * 50) + 10,
  }));
};

export default function AdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalHits: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentPayments: [],
    recentUsers: [],
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (userRole !== 'admin') {
      router.replace('/');
    }
  }, [loading, user, userRole, router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (userRole !== 'admin') return;
      
      setIsDataLoading(true);
      try {
        // Fetch profiles count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch recent payments
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate total revenue
        const { data: allPayments } = await supabase.from('payments').select('amount');
        const revenue = allPayments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Real hits — starts at 0 until a proper analytics system is connected
        const simulatedHits = 0;

        setStats({
          totalHits: simulatedHits,
          totalUsers: userCount || 0,
          totalRevenue: revenue,
          recentPayments: (payments || []) as DashboardStats['recentPayments'],
          recentUsers: (recentUsers || []) as DashboardStats['recentUsers'],
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (userRole === 'admin') {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [userRole, supabase]);

  if (loading || !user || userRole !== 'admin' || (isDataLoading && stats.totalHits === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mockChartData = generateMockData();

  return (
    <main className="relative flex w-full min-w-0 flex-grow flex-col items-center overflow-x-clip p-0 pb-20 pt-0 font-sans lowercase transition-all duration-500">
      
      {/* Page Header with The Oracle Video - Matching Layout of other pages */}
      <PageHeader />

      <div className="w-full max-w-3xl mx-auto mb-6 px-2 md:px-6">
        
        {/* main dashboard window - matching welcome style exactly */}
        <div className="relative group mt-12">
          <div className="absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
          <div
            className={cn(
              'relative rounded-none bg-slate-900/20 p-1 backdrop-blur-sm md:p-2 min-h-0',
              WINDOW_OUTER_SHELL
            )}
          >
            <div className="relative bg-slate-950/40 backdrop-blur-xl rounded-none p-4 md:p-12 h-auto flex flex-col gap-8">
              
              {/* system status banner */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] text-white/70 font-medium tracking-wide lowercase">system is live</span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono italic lowercase">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</span>
              </div>

              {/* kpi grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white/5 border border-white/5 p-4 flex flex-col rounded-none">
                  <p className="text-slate-500 text-[9px] font-medium mb-1 lowercase tracking-tighter">website hits</p>
                  <p className="text-xl font-bold text-white lowercase">{stats.totalHits.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 flex flex-col rounded-none">
                  <p className="text-slate-500 text-[9px] font-medium mb-1 lowercase tracking-tighter">users</p>
                  <p className="text-xl font-bold text-white lowercase">{stats.totalUsers}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 flex flex-col rounded-none">
                  <p className="text-slate-500 text-[9px] font-medium mb-1 lowercase tracking-tighter">revenue</p>
                  <p className="text-xl font-bold text-green-400 text-shadow-sm lowercase">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 flex flex-col rounded-none">
                  <p className="text-slate-500 text-[9px] font-medium mb-1 lowercase tracking-tighter">accuracy</p>
                  <p className="text-xl font-bold text-blue-400 lowercase">0%</p>
                </div>
              </div>

              {/* chart section */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white/80 border-l-2 border-blue-500 pl-2 lowercase tracking-wider">traffic velocity</h2>
                  <Activity size={12} className="text-blue-500 opacity-50" />
                </div>
                <div className="h-[220px] w-full bg-black/30 p-2 border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '0' }}
                        itemStyle={{ color: '#fff', fontSize: '9px' }}
                      />
                      <Area type="monotone" dataKey="hits" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorHits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* data table and feed grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* recent activity */}
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold text-white/80 border-l-2 border-blue-600 pl-2 lowercase tracking-widest">recent events</h2>
                  <div className="space-y-1.5">
                    {stats.recentPayments.length > 0 ? stats.recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/5 rounded-none">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/90 font-medium truncate max-w-[140px] lowercase">{payment.email}</span>
                          <span className="text-[8px] text-slate-500 font-mono italic lowercase">{payment.tier}</span>
                        </div>
                        <span className="text-[11px] text-green-400 font-bold lowercase">${payment.amount}</span>
                      </div>
                    )) : (
                      <p className="text-[9px] text-slate-600 font-mono italic p-3 text-center lowercase">no active detections...</p>
                    )}
                  </div>

                  <h2 className="text-[10px] font-bold text-white/80 border-l-2 border-emerald-600 pl-2 lowercase tracking-widest mt-6">recent signups</h2>
                  <div className="space-y-1.5">
                    {stats.recentUsers.length > 0 ? stats.recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/5 rounded-none">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/90 font-medium truncate max-w-[140px] lowercase">{u.full_name ?? 'unnamed'}</span>
                          <span className="text-[8px] text-slate-500 font-mono italic lowercase">{u.subscription_tier ?? 'free'}</span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono italic lowercase">{new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                    )) : (
                      <p className="text-[9px] text-slate-600 font-mono italic p-3 text-center lowercase">no signups yet...</p>
                    )}
                  </div>
                </div>

                {/* placeholder for future feed */}
                <div className="space-y-4">
                </div>
              </div>

              {/* footer note inside window */}
              <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
                <ShieldAlert size={10} className="text-red-500" />
                <p className="text-[8px] text-slate-500 font-mono tracking-widest lowercase">authorized access only • command node 04</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>

  );
}
