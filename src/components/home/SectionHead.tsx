interface Props {
  index: string;
  kicker: string;
  title: string;
  desc?: string;
}

export default function SectionHead({ index, kicker, title, desc }: Props) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-gold">{kicker}</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {desc ? <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">{desc}</p> : null}
      </div>
      <span className="tnum hidden shrink-0 font-mono text-4xl font-semibold text-border-strong sm:block" aria-hidden="true">
        {index}
      </span>
    </div>
  );
}