import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [candidates, constituencies, panchayath, booths, users] = await Promise.all([
    prisma.candidate.count(),
    prisma.constituency.count(),
    prisma.panchayath.count(),
    prisma.booth.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: 'Total Candidates', count: candidates, href: '/admin/candidates', color: 'emerald', icon: '🏛️' },
    { label: 'Active Locations', count: constituencies, href: '/admin/constituencies', color: 'blue', icon: '🗺️' },
    { label: 'Registered Panchayaths', count: panchayath, href: '/admin/panchayaths', color: 'indigo', icon: '🏘️' },
    { label: 'Polling Booths', count: booths, href: '/admin/booths', color: 'teal', icon: '📍' },
    { label: 'System Administrators', count: users, href: '/admin/users', color: 'sky', icon: '👥' },
  ];

  const colorMap: any = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    sky: 'text-sky-600 bg-sky-50 border-sky-100',
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">SYSTEM OVERVIEW</h2>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Super Admin Portal</h1>
        <div className="h-1 w-12 bg-emerald-600 rounded-full mt-2"></div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative flex flex-col justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`text-2xl mb-8 p-4 rounded-2xl w-fit border ${colorMap[stat.color]} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            
            <div className="space-y-1 relative z-10">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.count}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1 group-hover:text-emerald-600 transition-colors">
                {stat.label}
              </div>
            </div>

            <div className="absolute -right-4 -bottom-4 text-8xl grayscale opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500">
              {stat.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Management Actions */}
      <div className="pt-8 space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Administrative Control</h3>
          <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Quick Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Access Control', icon: '🛡️', href: '/admin/users', desc: 'Securely manage administrative accounts, roles, and authorization levels.' },
            { label: 'Constituency Mapping', icon: '🗺️', href: '/admin/constituencies', desc: 'Define regional locations, mandates, and administrative boundaries.' },
            { label: 'Candidate Registry', icon: '🏛️', href: '/admin/candidates', desc: 'Manage official candidates, party affiliations, and identifiers.' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:border-emerald-600/30 hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/10 transition-all flex flex-col gap-8 relative overflow-hidden"
            >
              <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:rotate-6 transition-transform relative z-10">
                {action.icon}
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{action.label}</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase opacity-60 tracking-wider font-mono transform-gpu">{action.desc}</p>
              </div>

              <div className="absolute top-0 right-0 p-8 text-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
