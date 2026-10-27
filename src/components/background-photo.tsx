import Image, { type StaticImageData } from "next/image";

type BackgroundPhotoProps = {
	src: StaticImageData;
	darkness: number;
	priority?: boolean;
	sizes?: string;
	parallax?: boolean;
};

export function BackgroundPhoto({ src, darkness, priority, sizes = "100vw", parallax }: BackgroundPhotoProps) {
	const photo = (
		<>
			<Image
				src={src}
				alt=""
				fill
				sizes={sizes}
				priority={priority}
				quality={50}
				placeholder="blur"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-ink" style={{ opacity: darkness }} aria-hidden="true" />
		</>
	);

	if (!parallax) {
		return photo;
	}

	// Fixed to the viewport and clipped to the section, so the page scrolls over the photo.
	// Only from md up and without reduced motion: on phones it scrolls with the section.
	return (
		<div className="absolute inset-0 [clip-path:inset(0)]" aria-hidden="true">
			<div className="absolute inset-0 md:motion-safe:fixed">{photo}</div>
		</div>
	);
}
