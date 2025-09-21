// src/components/sections/media/MediaItem.jsx
import React from "react";
import PropTypes from "prop-types";


export default function MediaItem({ href, imgSrc, alt, label }) {
    return (
        <li className="group">
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label || alt}
                className="block rounded-2xl w-full transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/50 justify-center items-center flex self-center shadow-xl"
            >
                <figure className="overflow-hidden justify-center items-center flex self-center rounded-2xl w-15 md:w-20 lg:w-15">
                    <img
                        src={imgSrc}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-contain bg-white"
                    />
                    {label ? (
                        <figcaption className="sr-only">{label}</figcaption>
                    ) : null}
                </figure>
            </a>
        </li>
    );
}


MediaItem.propTypes = {
    href: PropTypes.string.isRequired,
    imgSrc: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    label: PropTypes.string
};