import styles from './styles';

type Props = { label: string; onClick: () => void };

function MenuButton({ label, onClick }: Props) {
  return (
    <button onClick={onClick} css={styles.menuButton}>
      {label}
    </button>
  );
}

export default MenuButton;
