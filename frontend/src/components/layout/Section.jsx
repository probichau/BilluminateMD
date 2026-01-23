export default function Section({ children, className = '', bgColor = 'bg-white' }) {
  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${bgColor} ${className}`}>
      {children}
    </section>
  )
}
