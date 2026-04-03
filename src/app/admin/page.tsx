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
    { label: 'Candidates', count: candidates, href: '/admin/candidates', color: 'emerald', icon: '🏛️' },
    { label: 'Constituencies', count: constituencies, href: '/admin/constituencies', color: 'blue', icon: '🗺️' },
    { label: 'Panchayaths', count: panchayath, href: '/admin/panchayaths', color: 'indigo', icon: '🏘️' },
    { label: 'Booths', count: booths, href: '/admin/booths', color: 'teal', icon: '📍' },
    { label: 'Admin Users', count: users, href: '/admin/users', color: 'sky', icon: '👥' },
  ];

  const colorMap: any = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    teal: 'text-teal-600 bg-teal-50',
    sky: 'text-sky-600 bg-sky-50',
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Admin Dashboard</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">System overview and administrative management for {session.name}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
          >
            <div className={`text-2xl mb-6 p-3 rounded-2xl w-fit ${colorMap[stat.color]}`}>{stat.icon}</div>
            <div className="text-4xl font-black text-gray-900 mb-1 tracking-tighter">{stat.count}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </a>
        ))}
      </div>

      <div className="pt-10 border-t border-gray-100">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'User Control', icon: '🛡️', href: '/admin/users', desc: 'Manage system access and roles.' },
            { label: 'Election Structure', icon: '🗺️', href: '/admin/constituencies', desc: 'Configure regional mappings.' },
            { label: 'Candidates', icon: '🏗️', href: '/admin/candidates', desc: 'Define candidates and abbreviations.' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-indigo-600/20 hover:bg-white transition-all shadow-sm flex items-center gap-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{action.icon}</div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{action.label}</h3>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase opacity-60 tracking-wider font-mono">{action.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
