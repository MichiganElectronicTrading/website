import CornerWiring from "./CornerWiring";
import styles from "./PageHeader.module.css";

type Props = {
  title: string;
  text: string;
  /** Rendered before the title (e.g. a status tag). */
  before?: React.ReactNode;
  /** Rendered after the text (e.g. a button). */
  after?: React.ReactNode;
};

/** Navy band at the top of inner pages. */
export default function PageHeader({ title, text, before, after }: Props) {
  return (
    <section className={`dark ${styles.band}`} data-reveal-root="">
      <CornerWiring />
      <div className={styles.inner}>
        {before}
        <h1>{title}</h1>
        <p>{text}</p>
        {after}
      </div>
    </section>
  );
}
