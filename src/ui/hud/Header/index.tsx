import Profile from './Profile';
import Resources from './Resources';
import styles from './styles';

function Header() {
  return (
    <div css={styles.header}>
      <Profile />
      <div css={styles.content}>
        <Resources />
      </div>
    </div>
  );
}

export default Header;
