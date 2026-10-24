import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'OmniMarket Operations Hub',description:'Panel de administración e-commerce'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-MX" suppressHydrationWarning><body>{children}</body></html>}
