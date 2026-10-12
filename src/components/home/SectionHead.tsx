interface Props {
  kicker: string;
  title: string;
  desc?: string;
  className?: string;
}

export default function SectionHead({ kicker, title, desc, className = "" }: Props) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className="font-mono text-xs text-gold">{kicker}</p>
      <h2 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-balance text-foreground sm:text-[2.5rem]">
        {title}
      </h2>
      {desc ? <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-secondary">{desc}</p> : null}
    </div>
  );
}
