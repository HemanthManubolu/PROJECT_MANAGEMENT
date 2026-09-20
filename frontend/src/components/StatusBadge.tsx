import type { Priority, TaskStatus } from '../types/task';
import { label } from '../utils/format';
const colors: Record<TaskStatus | Priority, string> = { TODO: 'bg-slate-100 text-slate-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', IN_REVIEW: 'bg-violet-100 text-violet-700', DONE: 'bg-emerald-100 text-emerald-700', LOW: 'bg-slate-100 text-slate-600', MEDIUM: 'bg-amber-100 text-amber-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' };
export const StatusBadge = ({ value }: { value: TaskStatus | Priority }): React.JSX.Element => <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[value]}`}>{label(value)}</span>;
