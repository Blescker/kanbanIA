import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center gap-1.5 text-sm mb-4">
    {items.map((item, i) => (
      <Fragment key={i}>
        {i > 0 && (
          <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
        {item.href ? (
          <NavLink to={item.href} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition truncate max-w-[140px]">
            {item.label}
          </NavLink>
        ) : (
          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px]">{item.label}</span>
        )}
      </Fragment>
    ))}
  </nav>
);
