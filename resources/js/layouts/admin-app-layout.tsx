import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import AdminAppSidebarLayout from './app/admin-app-sidebar-layout';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AdminAppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AdminAppSidebarLayout>
);
