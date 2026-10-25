export default function AdminInfo() {
  const items = [
    ['Fee payments', 'Compare the student photo with their bank receipt, then approve or reject', '/admin/passes/payment/'],
    ['Users', 'Add drivers, manage students and roles', '/admin/accounts/user/'],
    ['Routes & stops', 'Create routes, set stop order and timings', '/admin/transport/route/'],
    ['Buses', 'Assign each bus a route and a driver', '/admin/transport/bus/'],
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin panel</h1>
        <p className="text-stone-500">Transport management runs in the Django admin.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(([title, desc, href]) => (
          <a key={href} href={href} target="_blank" rel="noreferrer" className="card p-4 hover:border-brand-500 transition">
            <div className="font-semibold text-stone-900">{title} →</div>
            <div className="text-sm text-stone-500">{desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
