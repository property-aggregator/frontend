export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
	if (count <= 0) {
		return null;
	}

	return (
		<span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-2xs leading-none font-semibold text-white">
			{count > max ? `${max}+` : count}
		</span>
	);
}
