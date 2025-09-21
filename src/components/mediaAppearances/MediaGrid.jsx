// src/components/sections/media/MediaGrid.jsx
import React from "react";
import PropTypes from "prop-types";
import MediaItem from "./MediaItem";


export default function MediaGrid({ items }) {
    return (
        // MediaGrid.jsx
        <ul className="
            grid grid-cols-3 place-items-center
            gap-4 lg:gap-2
            justify-center lg:max-w-[640px] mx-auto"
        >
            {items.map((it) => (
                <MediaItem
                    key={it.id}
                    href={it.url}
                    imgSrc={it.image}
                    alt={it.alt}
                    label={it.label}
                />
            ))}
        </ul>
    );
}


MediaGrid.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
            image: PropTypes.string.isRequired,
            alt: PropTypes.string.isRequired,
            label: PropTypes.string
        })
    ).isRequired
};