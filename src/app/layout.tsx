import './globals.css';
import './theme-dark.css';
import type {Metadata} from 'next';
import {Providers} from '@/components/Providers';
export const metadata:Metadata={title:'OmniMarket Operations Hub',description:'Panel de administración e-commerce'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-MX" data-theme="dark" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>}
