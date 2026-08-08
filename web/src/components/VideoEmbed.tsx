const YT_RE =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/**
 * Renders a YouTube video embed from a markdown directive:
 *
 *   :::video url="https://www.youtube.com/watch?v=ID" title="Exact title" credit="Channel"
 *   :::
 *
 * Uses the privacy-enhanced youtube-nocookie domain. A missing or invalid
 * url renders a visible warning callout so authors catch it immediately
 * (the loader cannot validate markdown directives).
 */
export default function VideoEmbed({
  url,
  title,
  credit,
}: {
  url?: string;
  title?: string;
  credit?: string;
}) {
  const m = url ? url.match(YT_RE) : null;
  if (!m) {
    return (
      <div className="callout callout-warning">
        <span className="callout-label">video</span>
        <div className="callout-body">
          <p>Video embed skipped: the url is not a valid YouTube link.</p>
        </div>
      </div>
    );
  }
  const id = m[1];
  return (
    <div className="video-embed">
      <div className="video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title || "YouTube video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {(title || credit) && (
        <div className="video-caption">
          {title && <span className="video-title">{title}</span>}
          {credit && <span className="video-credit">{credit}</span>}
          <a
            className="video-link"
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noreferrer"
          >
            watch on YouTube
          </a>
        </div>
      )}
    </div>
  );
}
