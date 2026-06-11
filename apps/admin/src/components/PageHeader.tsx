import { h, type ComponentChildren } from "preact";

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  actions?: ComponentChildren;
  breadcrumb?: string;
}) {
  return (
    <div class="flex items-center justify-between gap-4 mb-7">
      <div>
        {breadcrumb && (
          <p class="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">
            {breadcrumb}
          </p>
        )}
        <h1 class="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p class="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div class="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
