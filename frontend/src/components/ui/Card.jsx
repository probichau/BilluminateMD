export default function Card({ children, className = '', hover = false }) {
  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-lg' : ''

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  )
}
