import { getUrgency, type DeadlineTimelineItem } from "@/lib/grants-data";

export function DeadlineTimeline({
  items,
}: {
  items: DeadlineTimelineItem[];
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const urgency = getUrgency(item.daysUntilDeadline);
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)] ${urgency.dotClass}`}
              />
              {!isLast && <span className="mt-1 h-full w-px bg-[#E8E0D0]" />}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-charcoal/45">
                  {item.deadlineShort}
                </p>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${urgency.dateClass}`}>
                  {item.daysUntilDeadline}d
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-charcoal leading-snug">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-charcoal/45">
                {item.agencyShort}
                <span className="mx-1.5 text-charcoal/20">·</span>
                {item.deadline}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
