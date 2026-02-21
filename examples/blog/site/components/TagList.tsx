import { h } from "preact";

interface TagListProps {
  tags?: string[];
}

export default function TagList({ tags = [] }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <a key={tag} href={`/tags/${tag}`} className="tag">
          #{tag}
        </a>
      ))}
    </div>
  );
}
