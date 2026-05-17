/** Minimal chrome for packing-slip print (parent dashboard shell hidden when printing). */
export default function OrderPrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        @media print {
          #app-sidebar,
          header[data-admin-chrome],
          .print-toolbar {
            display: none !important;
          }
          .dashboard-canvas,
          .dashboard-canvas > div {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {children}
    </>
  )
}
