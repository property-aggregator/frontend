"use client";

import { Heart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { setFavorite } from "./actions";

type FavoriteButtonProps = { propertyId: string; initialFavorite: boolean; className?: string };

export function FavoriteButton({ propertyId, initialFavorite, className }: FavoriteButtonProps) {
	const [favorite, setSavedFavorite] = useState(initialFavorite);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!error) {
			return;
		}
		const timeout = setTimeout(() => setError(null), 5000);
		return () => clearTimeout(timeout);
	}, [error]);

	function toggle() {
		const next = !favorite;
		setError(null);
		startTransition(async () => {
			const result = await setFavorite(propertyId, next);
			startTransition(() => {
				if (result.error) {
					setError(result.error);
				} else {
					setSavedFavorite(next);
				}
			});
		});
	}

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				onClick={toggle}
				disabled={pending}
				aria-busy={pending}
				aria-pressed={favorite}
				aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
				title={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
				className="grid h-11 w-11 cursor-pointer place-items-center text-ink transition-colors hover:text-pastel-red disabled:cursor-default disabled:opacity-50"
			>
				<Icon icon={Heart} className={cn("text-[28px]", favorite && "fill-current text-pastel-red")} />
			</button>
			{error && (
				<p
					role="status"
					className="absolute right-0 bottom-full mb-2 w-max max-w-[240px] rounded-md bg-ink px-3 py-2 text-[12px] leading-snug text-white"
				>
					{error}
				</p>
			)}
		</div>
	);
}
