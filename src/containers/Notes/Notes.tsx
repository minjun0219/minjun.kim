import PostExcerpt from '@/components/PostExcerpt';
import Wrapper from '@/components/Wrapper';
import { css } from '@/lib/css';
import { getAllNotes, type Note, notePath } from '@/lib/notes';

const styles = {
  topic: css`
    margin: 2.5em 0 0;
    font-size: 1.1rem;
    color: var(--text-color);
  `,
  empty: css`
    margin: 3em 0;
    color: var(--text-color);
  `,
};

function groupByTopic(notes: Note[]): Array<[string, Note[]]> {
  const groups = new Map<string, Note[]>();
  for (const note of notes) {
    groups.set(note.topic, [...(groups.get(note.topic) ?? []), note]);
  }
  return [...groups];
}

const Notes = () => {
  const notes = getAllNotes();

  if (notes.length === 0) {
    return (
      <Wrapper>
        <p className={styles.empty}>아직 노트가 없습니다.</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {groupByTopic(notes).map(([topic, items]) => (
        <section key={topic}>
          <h2 className={styles.topic}>{topic}</h2>
          {items.map((note) => (
            <PostExcerpt
              key={notePath(note)}
              title={note.title}
              date={note.updatedAt}
              url={notePath(note)}
            />
          ))}
        </section>
      ))}
    </Wrapper>
  );
};

export default Notes;
