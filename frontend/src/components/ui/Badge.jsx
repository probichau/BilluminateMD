export default function Badge({ children, icon: Icon, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 ${className}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  )
}
